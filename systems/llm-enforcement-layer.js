/**
 * LLM Enforcement Layer v1.0
 * 关键链路LLM强制驱动机制
 * 
 * 设计原则：
 * 1. LLM优先：核心环节必须先走LLM
 * 2. 关键链路无兜底：关键链路LLM失败不重试到规则，而是重试LLM直到成功或明确失败
 * 3. 失败即报告：LLM走不通时，报告失败原因，不静默降级
 * 4. 质量>速度：不为了省token或提速而跳过LLM
 */

const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = [1000, 3000, 10000]; // 指数退避

const LLM_REQUIRED_STAGES = [
  'STAGE-1',   // PRD生成：LLM分析需求，生成完整PRD
  'STAGE-2',   // 对齐检查：LLM检查需求完整性、冲突
  'STAGE-5A',  // 剧本：已有LLM
  'STAGE-5B',  // 视觉：已有LLM
  'STAGE-6',   // 时长分配：LLM根据内容复杂度智能分配
  'STAGE-7',   // 故事板：LLM生成视觉化故事板
  'STAGE-9',   // 运镜：LLM设计运镜方案
  'STAGE-11',  // 渲染：LLM优化最终Prompt
];

const LLM_OPTIONAL_STAGES = [
  'STAGE-5.5', // FPV决策：可选LLM增强
  'STAGE-10',  // 连续性：规则为主，LLM可选
  'STAGE-12',  // 合规：规则为主
  'STAGE-14',  // 风格注入：规则
  'STAGE-15',  // 后期：规则
];

class LLMEnforcementLayer {
  constructor(logger) {
    this.log = logger || console.log;
    this.stats = {
      totalCalls: 0,
      llmCalls: 0,
      fallbackCalls: 0,
      failures: 0,
      retries: 0
    };
  }

  /**
   * 核心方法：强制LLM调用
   * @param {string} stageId - Stage标识
   * @param {Function} llmPromptFn - 返回LLM prompt的函数
   * @param {Function} fallbackFn - 降级函数（仅在非关键链路使用）
   * @param {Object} options - 配置选项
   * @returns {Object} { result, driver: 'llm'|'rule', attempts, success }
   */
  async enforceLLM(stageId, llmPromptFn, fallbackFn, options = {}) {
    const isRequired = LLM_REQUIRED_STAGES.includes(stageId);
    const maxRetries = options.maxRetries || MAX_RETRIES;
    const llmEngine = options.llmEngine || this._createDefaultLLMEngine();
    
    this.stats.totalCalls++;
    this.log(`[LLM-ENFORCE] ${stageId} 开始 | 关键链路: ${isRequired ? '是' : '否'}`);

    // 尝试LLM调用
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const prompt = llmPromptFn();
        
        // v6.5.64-P2-fix: 支持结构化JSON输出（强制模型在content中输出JSON）
        if (options.structured && options.schema) {
          const result = await llmEngine.reasonStructured(prompt, options.schema, options.llmOptions || {});
          
          if (result.success) {
            this.stats.llmCalls++;
            this.log(`[LLM-ENFORCE] ${stageId} ✅ LLM结构化成功 | attempt=${attempt}/${maxRetries}`);
            return {
              result: result.data,  // 直接返回解析好的JSON对象
              rawContent: result.rawContent,
              reasoning_content: result.reasoning_content,
              driver: 'llm',
              attempts: attempt,
              success: true,
              error: null
            };
          } else {
            throw new Error(`结构化输出失败: ${result.error}`);
          }
        }
        
        const result = await llmEngine.generate(prompt, options.llmOptions || {});
        
        this.stats.llmCalls++;
        this.log(`[LLM-ENFORCE] ${stageId} ✅ LLM成功 | attempt=${attempt}/${maxRetries}`);
        
        return {
          result,
          driver: 'llm',
          attempts: attempt,
          success: true,
          error: null
        };
      } catch (err) {
        this.stats.retries++;
        this.log(`[LLM-ENFORCE] ${stageId} ⚠️ LLM失败 | attempt=${attempt}/${maxRetries}: ${err.message}`);
        
        if (attempt < maxRetries) {
          const backoff = RETRY_BACKOFF_MS[Math.min(attempt - 1, RETRY_BACKOFF_MS.length - 1)];
          this.log(`[LLM-ENFORCE] ${stageId} ⏳ 等待${backoff}ms后重试...`);
          await this._sleep(backoff);
        }
      }
    }

    // 关键链路：LLM失败不允许降级，直接抛错
    if (isRequired) {
      this.stats.failures++;
      const error = new Error(
        `[LLM-ENFORCE] ${stageId} 关键链路LLM调用失败(${maxRetries}次重试)` +
        `。不允许降级到规则。请检查LLM服务状态或调整Prompt。`
      );
      error.stageId = stageId;
      error.attempts = maxRetries;
      error.driver = 'none';
      throw error;
    }

    // 非关键链路：降级到规则
    this.log(`[LLM-ENFORCE] ${stageId} ⚠️ 降级到规则执行`);
    this.stats.fallbackCalls++;
    
    try {
      const result = await fallbackFn();
      return {
        result,
        driver: 'rule',
        attempts: maxRetries,
        success: true,
        error: null
      };
    } catch (fallbackErr) {
      this.stats.failures++;
      throw new Error(
        `[LLM-ENFORCE] ${stageId} LLM失败且规则降级也失败: ${fallbackErr.message}`
      );
    }
  }

  /**
   * 快速调用：不带fallback，失败直接抛错
   */
  async requireLLM(stageId, llmPromptFn, options = {}) {
    return this.enforceLLM(stageId, llmPromptFn, () => {
      throw new Error(`${stageId} 关键链路不允许规则降级`);
    }, options);
  }

  /**
   * 获取统计报告
   */
  getStats() {
    return {
      ...this.stats,
      llmRate: this.stats.totalCalls > 0 ? (this.stats.llmCalls / this.stats.totalCalls * 100).toFixed(1) + '%' : '0%',
      fallbackRate: this.stats.totalCalls > 0 ? (this.stats.fallbackCalls / this.stats.totalCalls * 100).toFixed(1) + '%' : '0%',
      failureRate: this.stats.totalCalls > 0 ? (this.stats.failures / this.stats.totalCalls * 100).toFixed(1) + '%' : '0%'
    };
  }

  _createDefaultLLMEngine() {
    const { LLMEngine } = require('./llm-reasoning-engine');
    return new LLMEngine({
      model: 'kimi-k2p6',
      mode: 'production',
      maxRetries: 1, // 外层已处理重试
      maxTokens: 4096,
      temperature: 1,
      topP: 0.95
    });
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 各Stage的LLM Prompt模板
const StagePrompts = {
  /**
   * STAGE-1: LLM-PRD生成 (统一数据结构版)
   * 输出统一视频需求结构，兼容用户需求解析、PRD、Schema校验三层
   */
  STAGE_1_PRD: (input) => {
    // 提取创意指数（从 input 或创意参数）
    const cp = input.creativityIndex || input.creativity || input.creativityParameter || 0.2;
    
    return `你是一位专业的视频制作PRD策划Agent。
请分析以下用户需求，生成完整的视频需求文档（PRD）。

## 统一输出规范
你必须输出符合以下结构的 JSON，所有字段严格使用指定名称：

{
  // 一、视频任务基本信息
  "title": "视频标题/主题",
  "topic": "核心话题/主题描述",
  "videoType": "视频类型编码(EDU/SOC/ADV/DOC/DRAMA/COR/EVT/VLOG/MV)",
  "targetAudience": "目标受众",
  "platform": "投放平台",
  
  // 二、制作规格
  "targetDuration": 目标时长秒数,
  "aspectRatio": "画幅比例(9:16/16:9/1:1/3:4)",
  "visualStyle": "画面风格组合(如REAL+WARM)",
  "qualityLevel": "画质等级(标准/电影/艺术/极致)",
  "colorTone": "色彩基调",
  
  // 三、内容创意要求
  "creativityIndex": 创意指数0.0-1.0,
  "narrativeStyle": "叙事方式/讲解形式",
  "contentStyle": "内容风格",
  "visualStyleDetail": "视觉风格详细描述",
  "musicStyle": "音乐/音效风格",
  
  // 四、角色信息
  "characters": {
    "角色ID": {
      "id": "角色ID",
      "name": "角色名",
      "age": "年龄",
      "gender": "性别",
      "role": "角色定位",
      "appearance": "外观描述",
      "personality": "性格特征",
      "visualAnchors": "视觉锚点"
    }
  },
  
  // 五、场景定义
  "scenes": [
    {
      "id": "S01",
      "name": "场景名称",
      "type": "场景类型(intro/content/ending)",
      "description": "场景描述",
      "characters": ["角色ID"],
      "duration": 场景时长秒数,
      "visualComplexity": 1-10,
      "importance": 1-10,
      "narration": "旁白/台词文本",
      "dialogue": "对白文本"
    }
  ],
  
  // 六、结构与分镜
  "opening": {
    "hasOpening": true/false,
    "title": "片头标题",
    "subtitle": "片头副标题",
    "duration": 片头时长秒数
  },
  "ending": {
    "hasEnding": true/false,
    "previewNext": false,
    "content": "结尾内容"
  },
  "keyPoints": ["核心要点1", "核心要点2"],
  
  // 七、系列规划
  "isSeries": true/false,
  "totalEpisodes": 总集数,
  "currentEpisode": 当前集数,
  "episodeThemes": ["第一集主题", "第二集主题"],
  "contentIsolation": "跨集内容隔离要求",
  
  // 八、世界观
  "world": {
    "name": "世界名称",
    "setting": "场景设定",
    "location": "地点",
    "lighting": "光线环境",
    "atmosphere": "氛围",
    "style": "风格"
  },
  
  // 九、风格与约束
  "style": {
    "visualStyle": "视觉风格",
    "colorPalette": "色彩方案",
    "pacing": "节奏",
    "mood": "情绪",
    "reference": "参考作品"
  },
  "constraints": {
    "technical": ["技术约束1"],
    "content": ["内容约束1"],
    "legal": ["法律约束1"]
  },
  
  // 十、元数据
  "meta": {
    "version": "v1.0",
    "mode": "模式",
    "createdAt": "创建时间ISO格式",
    "aiReasoning": "AI决策说明"
  }
}

## 用户输入
- 项目名称：${input.projectName || '未指定'}
- 项目类型：${input.projectType || '未指定'}
- 目标时长：${input.targetDuration || '未指定'}秒
- 场景列表（必须严格遵循，不可修改）：
${(input.scenes || []).map(s => `  ${s.id}: ${s.name} | 类型:${s.type} | 时长:${s.duration}s | 描述:${s.description}`).join('\n')}
- 角色：${Object.keys(input.characters || {}).join(', ')}
- 风格：${input.style || '未指定'}
- 世界观：${input.world?.setting || '未指定'}
- 核心内容：${input.core?.narrative?.focus || input.core?.theme || '未指定'}
- 创意指数：${cp}

## 关键要求
1. 必须包含所有顶层字段（title, topic, keyPoints, targetDuration, scenes, characters, world, style, constraints, meta）
2. title 和 topic 必须有实际内容，不能为空字符串
3. keyPoints 必须是字符串数组，至少包含1个核心要点
4. targetDuration 必须是数字，与用户需求一致
5. scenes 必须是数组，每个场景必须有 id, name, type, description
6. 如果用户提供创意指数，必须在 creativityIndex 字段中使用该值
7. 如果用户提到系列内容，必须填充 isSeries, totalEpisodes, currentEpisode 等字段
8. 【场景约束】⚠️ 必须严格遵循上述场景定义，场景名称、类型、描述和时长不可修改。场景描述是最终设定，不可偏离。

## 输出要求
只输出JSON，不要任何解释或markdown标记。确保JSON格式完全合法。`;
  },

  /**
   * STAGE-2: LLM-需求对齐
   */
  STAGE_2_ALIGNMENT: (input, prd) => {
    return `你是一位专业的视频制作需求对齐Agent。
请检查以下PRD的完整性和一致性，识别潜在问题。

## PRD内容
${JSON.stringify(prd, null, 2)}

## 原始输入
- 目标时长：${input.targetDuration || '未指定'}秒
- 场景数：${(input.scenes || []).length}
- 角色数：${Object.keys(input.characters || {}).length}

## 检查项
1. 字段完整性：PRD是否包含所有必需字段（meta, core, world, characters, scenes, style, constraints）
2. 时长合理性：总场景时长是否与目标时长匹配（±20%容差）
3. 角色-场景关联：每个场景是否有角色？角色是否在characters中定义？
4. 风格一致性：world.style、core.emotionalArc、scenes[].type是否风格一致？
5. 逻辑冲突：是否有矛盾的需求（如同时要求快节奏和慢镜头）
6. 可行性：技术约束是否可实现？

## 输出格式
{
  "passed": true/false,
  "score": 0-100,
  "checks": {
    "fieldCompleteness": { "passed": true, "score": 95, "issues": [] },
    "durationReasonableness": { "passed": true, "score": 90, "issues": [] },
    "characterSceneAssociation": { "passed": true, "score": 100, "issues": [] },
    "styleConsistency": { "passed": true, "score": 85, "issues": [] },
    "logicalConflict": { "passed": true, "score": 100, "issues": [] },
    "feasibility": { "passed": true, "score": 95, "issues": [] }
  },
  "criticalIssues": [],
  "warnings": [],
  "suggestions": []
}

只输出JSON，不要解释。`;
  },

  /**
   * STAGE-6: LLM-时长分配
   */
  STAGE_6_DURATION: (scenes, totalDuration) => {
    const sceneDesc = scenes.map((s, i) => 
      `${i+1}. ${s.id}: ${s.type} | 台词字数:${(s.dialogue || '').length} | 重要性:${s.importance || 5} | 视觉复杂度:${s.visualComplexity || 5} | 内容:"${(s.dialogue || '').substring(0, 50)}..."`
    ).join('\n');
    
    return `你是一位专业的视频时长分配Agent。
请根据场景内容复杂度、台词字数、视觉复杂度，智能分配每个场景的时长。

## 总时长预算
${totalDuration}秒

## 场景列表
${sceneDesc}

## 分配原则
1. 内容密度：台词字数多的场景需要更多时间（按5字/秒计算基线）
2. 重要性：importance高的场景应获得更多时间
3. 视觉复杂度：visualComplexity高的场景需要更多时间展示
4. 节奏变化：开头和结尾可以稍短，中间核心内容应充分展开
5. 最小时长：每场景至少3秒
6. 最大时长：单场景不超过15秒（超短视频）

## 输出格式
{
  "allocations": [
    { "sceneId": "S01", "duration": 8, "reason": "开场，简短引入" },
    { "sceneId": "S02", "duration": 12, "reason": "核心内容，台词56字，需要充分展开" }
  ],
  "totalAllocated": 58,
  "optimizationLevel": "L0",
  "strategy": "根据内容密度和重要性分配，核心场景给予充足时间"
}

只输出JSON，不要解释。`;
  },

  /**
   * STAGE-7: LLM-故事板生成
   */
  STAGE_7_STORYBOARD: (scenes, world, characters) => {
    const sceneDesc = scenes.map((s, i) => 
      `${i+1}. ${s.id}: ${s.type} | ${s.duration}s | 台词:"${(s.dialogue || '').substring(0, 60)}..." | 角色:${(s.characters || []).join(',')}`
    ).join('\n');
    
    const charDesc = Object.entries(characters || {}).map(([id, c]) => 
      `- ${id}: ${c.name || id}, ${c.baseIdentity?.gender || '未知'}, ${c.baseIdentity?.age || '未知'}岁, ${c.baseIdentity?.role || '未知'}, 外观:${c.visualIdentity?.distinguishingMarks || '未描述'}`
    ).join('\n');
    
    return `你是一位专业的视频故事板设计Agent。
请为每个场景设计详细的视觉化故事板，包含构图、动作、运镜。

## 世界观
${world?.setting || '未指定'} | ${world?.atmosphere || '未指定'} | ${world?.lighting || '未指定'}

## 角色
${charDesc}

## 场景列表
${sceneDesc}

## 设计要求
1. 构图：每个场景的景别（远景/中景/近景/特写）、角度、人物位置
2. 角色动作：角色在场景中的具体动作（不要只写"自然站立"，要设计动态动作）
   - 例如："陈卓从画面左侧走入，站在讲台前，双手自然展开，面向镜头"
   - 例如："边走边说，手指向屏幕上的数据图表"
   - 例如："转身走向窗边，背对镜头停顿，然后回头继续讲解"
3. action：纯动作指令（不含场景描述和台词，如"双手展开指向屏幕"、"边走边转身"、"手指向数据图表"）
4. 背景元素：场景中具体有哪些背景物体、装饰、标识
5. 光影方向：主光源方向、光比、色温
6. 转场方式：场景之间如何过渡
7. 镜头运动：推、拉、摇、移、跟等具体运镜

## 输出格式
{
  "shots": [
    {
      "id": "S01",
      "composition": "中景，人物位于画面中心偏左，背景为健康讲堂",
      "characterAction": "陈卓从画面左侧走入，站在讲台前，双手自然展开，面向镜头微笑",
      "action": "双手展开指向屏幕，身体微微前倾",
      "backgroundElements": ["白色墙面", "健康教育海报", "讲台", "投影屏幕"],
      "lighting": "主光从右前方45度照射，辅光补左侧阴影，色温5500K",
      "transition": "淡入",
      "cameraMovement": "固定机位，轻微推近"
    }
  ],
  "styleNotes": "整体保持纪录片质感，色调温暖自然"
}

只输出JSON，不要解释。`;
  },

  /**
   * STAGE-9: LLM-运镜设计
   * v6.5.64-P1-fix: 修复durations类型问题，支持数组和对象两种传入方式
   */
  STAGE_9_CAMERA: (scenes, durations) => {
    // v6.5.64-P1-fix: 兼容durations为数组、对象或字符串的情况
    const durationList = Array.isArray(durations) ? durations :
                         (durations && durations.allocations && Array.isArray(durations.allocations)) ? durations.allocations :
                         (typeof durations === 'string') ? [] :  // 防止传入mode字符串
                         [];
    
    const sceneDesc = scenes.map((s, i) => {
      const dur = durationList.find(d => d.sceneId === s.id);
      return `${i+1}. ${s.id}: ${s.type} | ${dur?.duration || s.duration}s | 情绪:${s.emotionPhase || 'neutral'} | 动作:${s.cameraMovement?.type || '未指定'}`;
    }).join('\n');
    
    return `你是一位专业的电影摄影指导（DP）。
请为每个场景设计具体的运镜方案，与角色动作和情绪配合。

## 场景列表
${sceneDesc}

## 设计原则
1. 情绪匹配：紧张场景用快节奏运镜（快速推拉、晃动），平静场景用慢速稳定运镜
2. 角色配合：运镜要跟随或衬托角色动作，不要脱离角色单独运动
3. 叙事节奏：开场稳定，发展期开始运动，高潮最激烈，结尾回落
4. 镜头多样性：避免所有镜头都是固定或都是推镜头，要有变化
5. 技术可实现：运镜描述要具体可执行（速度、方向、幅度）

## 运镜类型参考
- 推(dolly in)：强调、聚焦、揭示
- 拉(dolly out)：展开、交代环境、抽离
- 摇(pan)：跟随、展示、连接
- 移(truck)：平行跟随、展示空间
- 跟(follow)：跟随移动的主体
- 升(crane up)：升华、抽离、俯瞰
- 降(crane down)：深入、聚焦、压迫
- 环绕(orbit)：展示、环绕主体
- 手持(handheld)：紧张、真实、纪录片感
- 固定(lock-off)：稳定、权威、冷静

## 输出格式
{
  "cameraDesigns": [
    {
      "sceneId": "S01",
      "primaryMovement": "dolly_in",
      "speed": "slow",
      "reasoning": "开场从全景缓慢推近到人物，建立亲近感",
      "secondaryMovement": "slight_pan",
      "technical": "50mm镜头，f/2.8，从3m推近到1.5m，匀速"
    }
  ],
  "overallArc": "稳定→动态→高潮→回落"
}

只输出JSON，不要解释。`;
  },

  /**
   * STAGE-11: LLM-渲染Prompt优化
   */
  STAGE_11_RENDER: (shot, storyboard, cameraDesign, world, characters) => {
    const charId = (shot.characters || [])[0];
    const char = characters?.[charId];
    
    return `你是一位专业的视频渲染Prompt优化Agent。
请整合上游输出（视觉Prompt、故事板、运镜设计），生成最终的1500字符渲染Prompt。

## 输入信息
- 镜头ID：${shot.id}
- 类型：${shot.type}
- 时长：${shot.duration}s
- 场景：${shot.scene || '未指定'}
- 台词：${(shot.dialogue || '').substring(0, 100)}
- 角色：${charId} (${char?.name || '未命名'})
- 角色状态：${shot.state || 'natural pose'}
- 角色动作：${shot.action || '未指定'}
- 视觉Prompt：${(shot.visualPrompt || '').substring(0, 200)}
- 故事板构图：${storyboard?.composition || '未指定'}
- 故事板动作：${storyboard?.characterAction || '未指定'}
- 运镜设计：${cameraDesign?.primaryMovement || '未指定'}
- 世界观：${world?.setting || '未指定'}
- 氛围：${world?.atmosphere || '未指定'}

## 输出要求
生成1500字符的完整渲染Prompt，包含：
1. 【视觉】导演风格、负面提示词
2. SCENE：场景描述
3. 【空间】空间布局
4. 【纵深】景深
5. 【方位】镜头角度
6. 【氛围】氛围描述
7. 【时间】时间/光线
8. CHARACTER：角色状态、动作（必须丰富动态，不能只是"natural pose"）
9. ACTION：具体动作指令（边走边说、手势、穿梭等）
10. CAMERA：运镜（具体镜头、运动、速度）
11. TIMELINE：时间轴
12. MOOD：情绪、色调、色温
13. LIGHTING：光影
14. AUDIO：音频分层
15. RENDER：渲染质量
16. DIRECTOR：导演风格
17. NEGATIVE：负面提示词
18. @image引用（如果角色有定妆照）

## 关键约束
- 总长度必须接近1500字符（≥1400）
- 角色动作必须动态丰富（不能只是"站立""自然姿态"）
- 必须包含具体运镜指令
- 必须保留【镜头时间轴】
- 必须注入@image引用（如果角色有定妆照）

只输出纯Prompt文本，不要JSON，不要解释。`;
  }
};

module.exports = { LLMEnforcementLayer, StagePrompts, LLM_REQUIRED_STAGES };

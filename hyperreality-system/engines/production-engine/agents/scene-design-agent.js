/**
 * SceneDesignAgent - 场景设计Agent
 * 负责: 场景五维描述、情绪设计、动作设计
 */
const { BaseAgent } = require('./base-agent');

class SceneDesignAgent extends BaseAgent {
  constructor(options = {}) {
    super({ name: 'SceneDesignAgent', ...options });
    this._currentBlueprint = null; // 【v2.1.4-fix13】存储当前 blueprint 用于动态提示词
  }

  /**
   * 【v2.1.4-fix13-审计修复】动态生成系统提示词，使用当前 blueprint
   */
  _getSystemPrompt() {
    return this._getDynamicSystemPrompt(this._currentBlueprint || {});
  }

  /**
   * 【v2.1.4-fix13-审计修复】动态生成系统提示词，根据 blueprint 主题选择场景
   */
  _getDynamicSystemPrompt(blueprint = {}) {
    // 从 blueprint 提取主题信息
    const meta = blueprint._metadata || blueprint.config?._metadata || {};
    const title = blueprint.title || meta.title || '视频';
    const genre = blueprint.genre || meta.genre || '科普';
    const setting = blueprint.setting || meta.setting || '';
    
    // 动态生成场景选项，避免硬编码医院场景
    const sceneOptions = this._generateSceneOptions(blueprint);
    
    return `你是一位专业的电影场景设计师。根据剧本场景信息，为每个镜头设计完整的场景描述、情绪基调和角色动作。

【绝对约束 - 违反则输出无效】
1. 场景必须从以下选项中选择（或基于这些选项的合理变体）：
${sceneOptions}
2. 禁止自创科幻/抽象场景
3. 禁止词汇：全息、虚拟、投影、抽象、概念、光影场域、数据空间、数字、元宇宙、时间操控、霓虹、微观世界、宏观、抽象几何、流动光影、交织光影、色彩对冲
4. 光线必须是真实光源：荧光灯、LED顶灯、窗光、无影灯、自然光
5. 角色必须在真实地面站立，背景必须是真实墙面
6. 场景描述中不得出现含文字的物品：如"有文字的报告单"、"标牌上的文字"、"商标"、"有字的海报"等。可以描述"空白报告单"、"无文字标识牌"、"图形海报"等不含文字的物品
7. 场景描述中的"海报"、"展板"、"标识牌"等物品必须是无文字版本（纯图形/色彩/图案）

输出JSON格式要求:
{
  "shots": [
    {
      "shotId": "SC01",
      "scene": "具体场景描述，包含墙面材质、灯光类型、家具设备",
      "mood": "情绪关键词和氛围描述",
      "action": "角色动作描述（含肢体语言、走位）",
      "emotional_target": "场景情绪目标"
    }
  ]
}

设计原则:
1. 场景描述要具体真实：包含墙面材质、灯光类型、设备、地面材质
2. 情绪要与台词匹配
3. 动作要自然：走动、手势、转身、指向等
4. 考虑镜头连续性：相邻场景的环境和光线要有逻辑关联;`;
  }

  /**
   * 【v2.1.4-fix13-审计修复】根据 blueprint 动态生成场景选项
   */
  /**
   * 【v2.1.4-fix15】动态生成场景选项，基于 worldSetting，不使用硬编码场景池
   * 根据视频类型（EDU/教育）生成科普场景选项，而非戏剧场景
   */
  _generateSceneOptions(blueprint = {}) {
    const meta = blueprint._metadata || blueprint.config?._metadata || blueprint.metadata || {};
    const worldSetting = blueprint.worldSetting || {};
    const filmType = meta.filmType || blueprint.filmType || blueprint.config?.filmType || blueprint.film_type || '';
    
    // 教育/科普类型：生成专业讲解场景选项
    if (filmType === 'EDU' || filmType === 'educational') {
      return `   根据教育科普主题生成写实讲解场景，可选方向：
   - 方向A：专业讲解空间（主讲人面向镜头讲解，背景为真实医疗/办公环境）
   - 方向B：案例展示空间（数据图表、实物模型、症状图片展示）
   - 方向C：警示提醒空间（关键信息高亮，严肃提醒注意事项）
   - 方向D：总结归纳空间（要点回顾，给出实用建议和行动号召）`;
    }
    
    // 优先从世界设定提取
    if (worldSetting.description || worldSetting.name) {
      const worldDesc = worldSetting.description || worldSetting.name;
      const atmosphere = worldSetting.atmosphere || '';
      return `   基于世界设定「${worldDesc}」生成场景，可选方向：
   - 方向A：${worldDesc}核心区域${atmosphere ? '，' + atmosphere : ''}
   - 方向B：${worldDesc}边缘/过渡地带${atmosphere ? '，' + atmosphere : ''}
   - 方向C：${worldDesc}特殊地貌/标志性地点${atmosphere ? '，' + atmosphere : ''}
   - 方向D：${worldDesc}战斗/冲突发生地${atmosphere ? '，' + atmosphere : ''}`;
    }
    
    // 无世界设定时返回类型指导（不含具体场景）
    return `   根据视频主题和已有场景描述生成写实场景，可选方向：
   - 方向A：核心叙事空间（主要事件发生地）
   - 方向B：过渡/连接空间（场景转换、移动过程）
   - 方向C：对峙/冲突空间（紧张感、对抗发生地）
   - 方向D：情绪释放空间（高潮、转折、收尾）`;
  }

  async process(shots, blueprint) {
    console.log(`[SceneDesignAgent] 开始处理 ${shots.length} 个镜头...`);

    // 【v2.1.4-fix13-审计修复】存储 blueprint 供 _getSystemPrompt 动态使用
    this._currentBlueprint = blueprint;

    // 获取视频类型用于后续场景选择
    const meta = blueprint._metadata || blueprint.config?._metadata || blueprint.metadata || {};
    const filmType = meta.filmType || blueprint.filmType || blueprint.config?.filmType || blueprint.film_type || '';

    const prompt = this._buildPrompt(shots, blueprint);

    const schema = {
      required: ['shots']
    };

    const llmResult = await this._callLLM(prompt, schema, () => {
      // 降级：使用原规则方法
      return this._fallback(shots);
    });

    if (llmResult.degraded) {
      return { shots: llmResult.result?.shots || shots, degraded: true, degradeReason: llmResult.degradeReason };
    }

    // 合并LLM结果回原shots
    const forbiddenWords = ['全息', '虚拟', '投影', '抽象', '光影场域', '数据空间', '元宇宙', '时间操控', '霓虹', '微观世界', '宏观', '抽象几何', '流动光影', '交织光影', '色彩对冲'];
    
    const designedShots = shots.map((shot, index) => {
      const designed = llmResult.result?.shots?.find(s => s.shotId === shot.shotId) || {};
      
      // 【v2.1.4-fix15】优先保留传入的已有场景描述（只要有非空描述就保留）
      const hasExistingScene = shot.scene && shot.scene.length > 5 && 
        !shot.scene.includes('室内主场景') && !shot.scene.includes('过渡空间') && 
        !shot.scene.includes('专业场景') && !shot.scene.includes('公共空间');
      let scene = hasExistingScene ? shot.scene : (designed.scene || shot.scene || '');
      
      // 【v2.1.4-fix15】优先保留传入的已有动作描述（只要有非空描述就保留）
      const hasExistingAction = shot.action && shot.action.length > 5 && 
        !shot.action.includes('speaking to camera');
      let action = hasExistingAction ? shot.action : (designed.action || shot.action || '');
      
      // 【v2.1.4-fix16-EDU】强制覆盖：教育/科普类型强制使用专业讲解场景
      if (filmType === 'EDU' || filmType === 'educational') {
        const eduSceneMap = {
          'opening': '片头开场场景，主讲人专业出场，主题清晰引入',
          'establishing': ' establishing shot，展示真实讲解环境',
          'explanation': '知识讲解场景，主讲人面向镜头讲解核心内容',
          'demonstration': '案例演示场景，展示数据、图表或实物',
          'warning': '警示提醒场景，强调关键风险和注意事项',
          'summary': '要点总结场景，回顾核心知识',
          'resolution': '结尾收尾场景，给出实用建议和行动号召',
          'conflict': '问题呈现场景，展示症状或案例引发关注',
          'rising': '深入讲解场景，逐步展开知识点',
          'emotional_climax': '重点强调场景，突出关键信息',
          'transition': '过渡转场场景，平滑切换主题'
        };
        const sceneType = shot.sceneType || shot.scene_type || 'establishing';
        const eduScene = eduSceneMap[sceneType];
        if (eduScene) {
          scene = eduScene;
        }
        // 强制角色为陈卓（科普主讲人）
        if (action && !action.includes('陈卓') && !action.includes('主讲人')) {
          action = action.replace(/医学讲解者|医学讲师|主讲人|讲解者/g, '陈卓');
        }
      }
      
      // 【v2.1.4-fix15】场景校验：包含禁止词汇则使用动态兜底
      const forbiddenWords = ['全息', '虚拟', '投影', '抽象', '光影场域', '数据空间', '元宇宙', '时间操控', '霓虹', '微观世界', '宏观', '抽象几何', '流动光影', '交织光影', '色彩对冲'];
      const hasForbidden = forbiddenWords.some(w => scene.includes(w));
      if (hasForbidden) {
        console.warn(`[SceneDesignAgent] ⚠️ 镜头 ${shot.shotId} 包含禁止词汇: "${scene}"，使用动态兜底`);
        // 【v2.1.4-fix15】基于世界设定动态生成兜底，不使用硬编码场景池
        const worldSetting = blueprint.worldSetting || {};
        const worldDesc = worldSetting.description || worldSetting.name || '';
        const atmosphere = worldSetting.atmosphere || '';
        const sceneType = shot.sceneType || shot.scene_type || 'establishing';
        
        if (worldDesc) {
          scene = `${worldDesc}，${this._getSceneTypeBase(sceneType, filmType)}${atmosphere ? '，' + atmosphere : ''}`;
        } else {
          scene = this._getSceneTypeBase(sceneType, filmType);
        }
      }
      
      return {
        ...shot,
        scene: scene,
        mood: designed.mood || shot.mood || '',
        action: action,
        emotional_target: designed.emotional_target || ''
      };
    });

    console.log(`[SceneDesignAgent] 完成 ✓`);
    
    // 【v2.1.4-fix16-EDU】最终强制覆盖：教育/科普类型强制使用专业讲解场景
    const debugMeta = blueprint.config?._metadata || blueprint.metadata || {};
    console.log(`[SceneDesignAgent] blueprint structure: ${JSON.stringify({
      hasConfig: !!blueprint.config,
      configKeys: blueprint.config ? Object.keys(blueprint.config) : [],
      hasMetadata: !!blueprint.config?._metadata,
      metadataKeys: blueprint.config?._metadata ? Object.keys(blueprint.config._metadata) : [],
      hasFilmType: !!(blueprint.config?._metadata?.filmType || blueprint.config?.filmType || blueprint.filmType || blueprint.film_type),
      filmTypeValue: blueprint.config?._metadata?.filmType || blueprint.config?.filmType || blueprint.filmType || blueprint.film_type || 'NOT_FOUND',
      topLevelKeys: Object.keys(blueprint)
    })}`);
    if (filmType === 'EDU' || filmType === 'educational') {
      console.log(`[SceneDesignAgent] ✅ 强制覆盖生效: 教育/科普场景`);
      const eduSceneMap = {
        'opening': '片头开场场景，主讲人专业出场，主题清晰引入',
        'establishing': ' establishing shot，展示真实讲解环境',
        'explanation': '知识讲解场景，主讲人面向镜头讲解核心内容',
        'demonstration': '案例演示场景，展示数据、图表或实物',
        'warning': '警示提醒场景，强调关键风险和注意事项',
        'summary': '要点总结场景，回顾核心知识',
        'resolution': '结尾收尾场景，给出实用建议和行动号召',
        'conflict': '问题呈现场景，展示症状或案例引发关注',
        'rising': '深入讲解场景，逐步展开知识点',
        'emotional_climax': '重点强调场景，突出关键信息',
        'transition': '过渡转场场景，平滑切换主题'
      };
      designedShots.forEach(shot => {
        const sceneType = shot.sceneType || 'establishing';
        const eduScene = eduSceneMap[sceneType];
        if (eduScene) {
          shot.scene = eduScene;
        }
        // 强制角色为陈卓（科普主讲人）
        if (shot.action && !shot.action.includes('陈卓') && !shot.action.includes('主讲人')) {
          shot.action = shot.action.replace(/医学讲解者|医学讲师|主讲人|讲解者/g, '陈卓');
        }
      });
    }
    
    return { shots: designedShots, degraded: false, degradeReason: null };
  }

  _buildPrompt(shots, blueprint) {
    const characters = blueprint.character_system?.characters || [];
    const characterDesc = characters.map(c =>
      `- ${c.name}: ${c.description || '无描述'}${c.portraitPaths ? ' [有定妆照]' : ''}`
    ).join('\n');

    const shotsInfo = shots.map((s, idx) => {
      const dialogue = s.dialogue?.lines?.map(l => `"${l.content}"`).join('; ') || s.dialogue || '';
      const existingScene = s.scene || '';
      const existingAction = s.action || '';
      return `镜头 ${s.shotId}: ${s.duration || '?'}s; 现有场景: ${existingScene.substring(0, 80)}; 现有动作: ${existingAction.substring(0, 60)}; 台词: ${dialogue.substring(0, 80)}`;
    }).join('\n');
    
    // 【v2.1.4-fix13-审计修复】动态生成场景选项，避免硬编码
    const sceneOptions = this._generateSceneOptions(blueprint);
    const directorContext = this._buildDirectorContext(blueprint);
    
    // 【v2.1.4-fix14】根据类型动态调整约束
    const meta = blueprint._metadata || blueprint.config?._metadata || blueprint.metadata || {};
    const filmType = meta.filmType || blueprint.filmType || blueprint.config?.filmType || blueprint.film_type || '';
    const isMythFantasy = filmType === 'FANTASY' || filmType === 'ACTION' || filmType === 'MYTHOLOGY';
    
    const constraints = isMythFantasy 
      ? `【强制约束 - 违反则输出无效】
- 场景描述必须包含具体物理细节：地形材质、自然光源、环境元素、天气氛围
- 禁止使用以下任何词汇：全息、虚拟、投影、抽象、概念、光影场域、数据空间、数字、元宇宙、时间操控、霓虹、微观世界、宏观、抽象几何、流动光影、交织光影、色彩对冲
- 光线必须是自然/物理光源：天光、雷电、火焰、日光、月光、环境反射光
- 场景必须是真实物理环境（岩石、云层、水面、森林等），但可以是神话世界中的真实环境
- 角色动作必须是真实物理动作（打斗、奔跑、跳跃、格挡），可伴随神话能量特效`
      : `【强制约束 - 违反则输出无效】
- 场景描述必须包含具体物理细节：墙面材质、灯光类型、家具/设备、地面材质
- 禁止使用以下任何词汇：全息、虚拟、投影、抽象、概念、光影场域、数据空间、数字、元宇宙、时间操控、霓虹、微观世界、宏观、抽象几何、流动光影、交织光影、色彩对冲
- 光线必须是真实光源：荧光灯、LED顶灯、窗光、无影灯、自然光
- 角色必须在真实地面站立，背景必须是真实墙面`;

    return `${directorContext}

## 角色
${characterDesc || '无'}

## 镜头
${shotsInfo}

## 任务
为每个镜头设计场景、情绪和动作。

【核心原则 - 不可违反】
1. 每个镜头已提供「现有场景」，这是客户指定的场景，必须完全保留作为基础
2. 你的职责是丰富细节（增加材质、光影、氛围、环境元素），绝不能替换或改变核心场景
3. 只有「现有场景」为空或过于抽象（少于5个字）时，才从以下方向中选择生成

${sceneOptions}

【设计要求】
1. scene: 基于现有场景丰富细节后的最终描述（50-80字，必须是写实环境）
2. mood: 情绪氛围（15-25字）
3. action: 角色动作（肢体语言、走位、打斗动作，30-50字）
4. emotional_target: 情绪目标（1个词）

【强制约束】
- 场景描述必须包含具体物理细节：地形/墙面材质、光源类型、环境元素
- 禁止：全息、虚拟、投影、抽象、光影场域、数据空间、元宇宙、霓虹等
- 光线必须是真实物理光源（自然光/灯光/火焰/雷电等）
- 场景必须是真实物理环境，允许神话/奇幻世界的真实环境

输出JSON: {"shots": [{"shotId":"SC01","scene":"具体场景描述，50-80字","mood":"...","action":"...","emotional_target":"..."}]}`;
  }
  
  /**
   * 【v2.1.4-fix9-P1】构建导演上下文
   */
  _buildDirectorContext(blueprint) {
    // 【v2.1.4-fix13-审计修复】兼容 adapted 对象和原始 blueprint 两种结构
    const config = blueprint.config || {};
    const meta = blueprint.metadata || blueprint.meta || {};
    const _metadata = config._metadata || blueprint._metadata || {};
    const title = meta.title || config.title || _metadata.title || '未命名';
    
    // 从多路径读取导演上下文信息
    const contentTheme = config.content_theme || _metadata.content_theme || '';
    const contentSummary = config.content_summary || _metadata.content_summary || '';
    const visualStyle = config.visual_style || _metadata.visual_style || 'REAL';
    const sceneRequirement = config.scene_requirement || _metadata.scene_requirement || '';
    const characterDescription = config.character_description || _metadata.character_description || '';
    const forbiddenScenes = config.forbidden_scenes || _metadata.forbidden_scenes || [];
    const keyMessages = config.key_messages || _metadata.key_messages || [];
    const creativeIntensity = config.creativeIntensity || _metadata.creativeIntensity || blueprint.config?.creativeIntensity || 0.5;
    
    return `## 🎬 导演指令上下文
视频标题：${title}
内容主题：${contentTheme}
核心内容：${contentSummary}
视觉风格：${visualStyle}
创意指数：${creativeIntensity}（低创意=强制写实）
场景要求：${sceneRequirement}
角色设定：${characterDescription}
关键信息：${keyMessages.join('；') || '无'}
禁止场景：${forbiddenScenes.join('、') || '无'}
禁止元素：全息投影、虚拟空间、未来感、霓虹特效、元宇宙、数字空间、抽象几何
`;
  }

  _fallback(shots) {
    console.log(`[SceneDesignAgent] 使用降级规则...`);
    return {
      shots: shots.map(shot => ({
        shotId: shot.shotId,
        scene: shot.scene || '',
        mood: shot.mood || '',
        action: shot.action || '',
        emotional_target: ''
      }))
    };
  }

  /**
   * 【v2.1.4-fix15】基于场景类型返回基础描述符（不含具体场景内容）
   * 根据视频类型动态选择描述风格
   */
  _getSceneTypeBase(sceneType, filmType = '') {
    // 教育/科普类型使用专业讲解场景
    if (filmType === 'EDU' || filmType === 'educational') {
      const eduDescriptors = {
        'opening': '片头开场场景，主讲人专业出场，主题清晰引入',
        'establishing': ' establishing shot，展示真实讲解环境',
        'explanation': '知识讲解场景，主讲人面向镜头讲解核心内容',
        'demonstration': '案例演示场景，展示数据、图表或实物',
        'warning': '警示提醒场景，强调关键风险和注意事项',
        'summary': '要点总结场景，回顾核心知识',
        'resolution': '结尾收尾场景，给出实用建议和行动号召',
        'conflict': '问题呈现场景，展示症状或案例引发关注',
        'rising': '深入讲解场景，逐步展开知识点',
        'emotional_climax': '重点强调场景，突出关键信息',
        'transition': '过渡转场场景，平滑切换主题'
      };
      return eduDescriptors[sceneType] || '科普讲解场景';
    }
    
    // 默认戏剧/电影场景
    const descriptors = {
      'opening': '史诗开场场景，宏大视角',
      'establishing': '全景 establishing shot，展示空间关系',
      'conflict': '紧张对峙场景，充满戏剧张力',
      'action': '激烈动作场景，高速动态',
      'emotional_climax': '情感高潮场景，张力爆发',
      'resolution': '平静收尾场景，余韵悠长',
      'discovery': '探索发现场景，充满惊奇',
      'transition': '过渡转场场景，时空转换'
    };
    return descriptors[sceneType] || '标准叙事场景';
  }
}

module.exports = { SceneDesignAgent };

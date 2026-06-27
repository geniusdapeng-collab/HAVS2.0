// baseline-template-registry.js
// 基线模板注册中心 v1.0.0
// 提供确定性基线模板，减少LLM调用，提升稳定性
// 日期: 2026-06-26

const path = require('path');
const fs = require('fs');

const BASELINE_DIR = path.join(__dirname, '../../output/baselines');

// 默认基线模板：EDU_health（健康科普）
const DEFAULT_BASELINES = {
  'EDU_health_v1.0': {
    // 元数据
    _meta: {
      name: 'EDU_health',
      version: '1.0.0',
      description: '健康教育科普视频标准基线',
      locked: true,
      approvedBy: 'system',
      approvedAt: '2026-06-26T00:00:00Z',
      filmType: 'EDU',
      visualStyle: 'REAL',
      targetDuration: '60-65s'
    },
    // 稳定字段（技术规格，不随项目变化）
    directorInstruction: '好莱坞纪录片质感，电影级画面，写实风格，无特效，无科幻元素，无抽象构图，无超现实处理。每一帧都保持高水准的细节、真实的材质质感和自然的物理光影。强调专业医疗氛围与科普影像的严谨调性，严禁任何超现实或艺术化的视觉处理。',
    constraint: 'Aspect ratio: 16:9, Resolution: 1920x1080, Format: MP4, Frame rate: 24fps, no text anywhere in frame, no subtitle, no caption, no watermark, no logo, no readable characters, no alphabets, no Chinese characters, no text on walls, no text on objects, no text on documents, no text on signs, no text on labels, no text on screens, no text on clothing, no text in background',
    baseline: '8K resolution, cinematic quality, highly detailed, photorealistic, hyperrealistic, sharp focus, ultra high definition, lifelike textures, professional color grading, realistic skin texture, natural pore detail, accurate anatomical proportions',
    colorPalette: '主色调：冷白偏青蓝（医院检验科/诊室特有的洁净冷感）；辅助色：环境本色（不锈钢金属银灰、浅灰釉面砖、实木暖棕）；肤色：自然偏暖形成冷暖对比；饱和度：中等偏低，克制而不苍白；对比度：中高，保持清晰层次与严肃临床氛围',
    depthOfField: '焦点：主体面部或动作中心；景深：中等（f/2.8-f/4），背景适度虚化但仍可辨识空间结构；前景：轻微虚化增加层次；层次：前景-中景-背景三层清晰分离',
    composition: '景别：中景（膝上/腰上）；主体位置：画面黄金分割点（左1/3或右1/3）；线条引导：纵深层次感与空间汇聚线；画框边缘：适度留白展示环境信息；视觉重心：人物面部与核心动作',
    negative: 'no text, no subtitle, no caption, no watermark, no blurry, no extra limbs, no deformed, no distorted, no low quality, no cartoon style, no flat lighting, no anime, no 3D render, no plastic look, no text anywhere in frame, no readable characters, no alphabets, no Chinese characters, no text on walls objects documents signs labels screens clothing packaging, no handwritten text, no printed text, no signage text, no text overlays, no UI elements with text, no holographic, no virtual projection, no neon, no abstract, no sci-fi elements, no futuristic, no fantasy, no surreal, no medical horror, no bloody scene, no scary atmosphere, no dark muddy shadows',
    brightConstraint: 'bright lighting, well-lit scene, clear visibility, no dark shadows on face, adequate illumination, evenly lit, clear facial details, sufficient ambient light, no underexposure',
    characterConstraint: '只出现主角一人，禁止其他人物入镜，禁止同一角色重复出现，禁止角色分身或克隆，禁止背景中出现其他可辨识人脸',
    consistency: '保持角色形象一致，短发警服造型不变，面部特征与体型每帧统一，服装细节与肩章位置固定，发型与妆容无镜头间差异',
    makeup: '短发整齐（黑色，长度及耳，发梢微向内扣），素颜淡妆，眉毛自然修整，唇色淡粉自然，肤色均匀，无夸张眼影或腮红，整体呈现干练公职人员形象',
    costume: '藏青色警服外套（毛呢质地，肩章完整，金属纽扣有光泽），内搭浅蓝色衬衫（棉质，领口整洁系至第一颗纽扣），黑色西裤（笔挺无褶皱），黑色皮鞋（光亮整洁），佩戴标准警用皮带',
    // 可变字段标记（这些字段由LLM动态生成）
    _llmFields: ['scene', 'lighting', 'cameraMovement', 'action', 'dialogue', 'mood', 'pacing', 'props', 'transition', 'audio'],
    _llmRequired: ['scene', 'action', 'dialogue']
  }
};

class BaselineTemplateRegistry {
  constructor() {
    this.baselines = new Map();
    this._ensureDir();
    this._loadAll();
  }

  _ensureDir() {
    if (!fs.existsSync(BASELINE_DIR)) {
      fs.mkdirSync(BASELINE_DIR, { recursive: true });
    }
  }

  _loadAll() {
    // 加载内置默认基线
    for (const [key, value] of Object.entries(DEFAULT_BASELINES)) {
      this.baselines.set(key, value);
    }
    
    // 加载持久化基线
    try {
      const files = fs.readdirSync(BASELINE_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const key = path.basename(file, '.json');
          const data = JSON.parse(fs.readFileSync(path.join(BASELINE_DIR, file), 'utf8'));
          this.baselines.set(key, data);
          console.log(`[BaselineRegistry] 加载基线: ${key}`);
        }
      }
    } catch (e) {
      console.warn('[BaselineRegistry] 加载持久化基线失败:', e.message);
    }
  }

  /**
   * 获取基线模板（支持模糊匹配）
   * @param {string} type - 类型如 'EDU_health' 或 'EDU_REAL'
   * @param {string} version - 版本如 'v1.0'，不传则取最新
   * @returns {object|null}
   */
  get(type, version = null) {
    if (version) {
      const key = `${type}_${version}`;
      return this.baselines.get(key) || null;
    }
    // 找最新版本（前缀精确匹配）
    let keys = Array.from(this.baselines.keys()).filter(k => k.startsWith(`${type}_`));
    if (keys.length > 0) {
      keys.sort((a, b) => {
        const va = this._extractVersion(a);
        const vb = this._extractVersion(b);
        return vb.localeCompare(va); // 降序
      });
      return this.baselines.get(keys[0]);
    }
    // 【修复v2.0.1】模糊匹配：按 filmType 回退
    // 例如 'EDU_REAL' -> 找所有 'EDU_' 开头的基线
    const filmType = type.split('_')[0];
    if (filmType && filmType !== type) {
      keys = Array.from(this.baselines.keys()).filter(k => k.startsWith(`${filmType}_`));
      if (keys.length > 0) {
        keys.sort((a, b) => {
          const va = this._extractVersion(a);
          const vb = this._extractVersion(b);
          return vb.localeCompare(va);
        });
        console.log(`[BaselineRegistry] 模糊匹配: ${type} -> ${keys[0]}`);
        return this.baselines.get(keys[0]);
      }
    }
    return null;
  }

  _extractVersion(key) {
    const match = key.match(/v(\d+\.\d+)$/);
    return match ? match[1] : '0.0';
  }

  /**
   * 注册新基线（需审核后锁定）
   * @param {string} type - 类型
   * @param {string} version - 版本
   * @param {object} baseline - 基线数据
   * @param {object} meta - 元数据
   */
  register(type, version, baseline, meta = {}) {
    const key = `${type}_${version}`;
    const fullBaseline = {
      ...baseline,
      _meta: {
        name: type,
        version: version,
        locked: false, // 默认未锁定，需人工审核
        createdAt: new Date().toISOString(),
        ...meta
      }
    };
    this.baselines.set(key, fullBaseline);
    this._persist(key, fullBaseline);
    console.log(`[BaselineRegistry] 注册基线: ${key} (未锁定)`);
    return fullBaseline;
  }

  /**
   * 锁定基线（人工审核通过）
   * @param {string} type 
   * @param {string} version 
   * @param {string} approver 
   */
  lock(type, version, approver = 'system') {
    const key = `${type}_${version}`;
    const baseline = this.baselines.get(key);
    if (!baseline) throw new Error(`基线不存在: ${key}`);
    
    baseline._meta.locked = true;
    baseline._meta.approvedBy = approver;
    baseline._meta.approvedAt = new Date().toISOString();
    this._persist(key, baseline);
    console.log(`[BaselineRegistry] 基线已锁定: ${key} by ${approver}`);
    return baseline;
  }

  /**
   * 合并基线 + LLM增量
   * @param {string} type 
   * @param {object} llmFields - LLM生成的字段
   * @returns {object}
   */
  merge(type, llmFields) {
    const baseline = this.get(type);
    if (!baseline) {
      console.warn(`[BaselineRegistry] 未找到基线 ${type}，使用全LLM生成`);
      return llmFields;
    }

    // 提取基线的稳定字段（排除_meta和_llmFields）
    const stableFields = {};
    for (const [key, value] of Object.entries(baseline)) {
      if (key.startsWith('_')) continue; // 跳过元数据
      stableFields[key] = value;
    }

    // 合并：LLM字段覆盖基线（如果LLM提供了相同字段）
    const merged = { ...stableFields, ...llmFields };
    
    // 检查必填字段
    const required = baseline._llmRequired || [];
    const missing = required.filter(f => !merged[f] || merged[f] === '(空)' || merged[f] === '');
    
    if (missing.length > 0) {
      console.warn(`[BaselineRegistry] LLM字段缺失: ${missing.join(', ')}`);
    }

    merged._baselineVersion = baseline._meta?.version || 'unknown';
    merged._baselineType = baseline._meta?.name || type;
    
    console.log(`[BaselineRegistry] 合并完成: ${type} v${baseline._meta?.version} | 基线字段${Object.keys(stableFields).length} + LLM字段${Object.keys(llmFields).length} = 总字段${Object.keys(merged).length}`);
    
    return merged;
  }

  /**
   * 检查基线是否适合当前项目（支持模糊匹配）
   * @param {string} type 
   * @param {object} requirement 
   * @returns {boolean}
   */
  isCompatible(type, requirement) {
    // 1. 精确匹配
    let baseline = this.get(type);
    if (!baseline) {
      // 2. 【修复v2.0.1】模糊匹配：按 filmType 回退
      const filmType = type.split('_')[0];
      if (filmType && filmType !== type) {
        baseline = this.get(filmType);
      }
    }
    if (!baseline) return false;
    
    // 检查关键参数匹配
    const meta = baseline._meta || {};
    if (meta.filmType && requirement.filmType && meta.filmType !== requirement.filmType) {
      return false;
    }
    if (meta.visualStyle && requirement.visualStyle && meta.visualStyle !== requirement.visualStyle) {
      return false;
    }
    return true;
  }

  _persist(key, baseline) {
    try {
      const filePath = path.join(BASELINE_DIR, `${key}.json`);
      fs.writeFileSync(filePath, JSON.stringify(baseline, null, 2));
    } catch (e) {
      console.error('[BaselineRegistry] 持久化失败:', e.message);
    }
  }

  /**
   * 列出所有基线
   */
  list() {
    return Array.from(this.baselines.entries()).map(([key, value]) => ({
      key,
      name: value._meta?.name,
      version: value._meta?.version,
      locked: value._meta?.locked,
      approvedBy: value._meta?.approvedBy,
      approvedAt: value._meta?.approvedAt
    }));
  }

  /**
   * 从现有项目提取基线（供人工审核后注册）
   * @param {object} projectResult - 项目生成结果
   * @param {string} type - 基线类型
   */
  extractFromProject(projectResult, type) {
    // 提取稳定字段作为候选基线
    const candidate = {
      directorInstruction: projectResult.directorInstruction,
      constraint: projectResult.constraint,
      baseline: projectResult.baseline,
      negative: projectResult.negative,
      brightConstraint: projectResult.brightConstraint,
      characterConstraint: projectResult.characterConstraint,
      consistency: projectResult.consistency,
      costume: projectResult.costume,
      makeup: projectResult.makeup,
      colorPalette: projectResult.colorPalette,
      depthOfField: projectResult.depthOfField,
      composition: projectResult.composition
    };
    
    return this.register(type, 'v1.0-draft', candidate, { 
      source: 'project-extraction',
      extractedAt: new Date().toISOString()
    });
  }
}

module.exports = { BaselineTemplateRegistry };

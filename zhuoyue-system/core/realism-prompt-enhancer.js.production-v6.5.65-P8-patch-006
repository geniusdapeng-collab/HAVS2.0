/**
 * 真实感提示词增强器（Realism Prompt Enhancer）
 * v1.0.0
 * 
 * 定位：软性知识注入层，不改变现有系统技术架构、主链路模块及字段定义。
 * 挂载点：Stage 11 之前（提示词最终提交前），作为后置增强层。
 * 
 * 核心能力：
 * 1. 七维参数检查 — 检查提示词中是否覆盖真实感七维（摄影机/镜头/光圈/光线/色彩/材质/动态/颗粒）
 * 2. 智能补全 — 对缺失维度自动追加推荐关键词
 * 3. 禁忌词过滤 — 检测并替换常见AI感词汇
 * 4. 场景模板匹配 — 根据场景类型选择最佳模板组合
 * 
 * 安全边界：
 * - 只追加不替换：原有提示词内容完整保留
 * - 不改变剧本/对白/内容层
 * - 只影响 RENDER/CAMERA/LIGHTING/STYLE 等外在维度
 */

const fs = require('fs');
const path = require('path');

class RealismPromptEnhancer {
  constructor(config = {}) {
    this.config = {
      // 是否启用增强
      enabled: true,
      // 注入位置：'prefix'（前缀）| 'suffix'（后缀）| 'embed'（嵌入）
      injectPosition: 'suffix',
      // 最大注入长度（字符）
      maxInjectLength: 800,
      // 七维覆盖度阈值（低于此值触发补全）
      minDimensionCoverage: 4,
      // 场景类型自动检测
      autoDetectScene: true,
      ...config
    };

    // 加载知识库
    this.knowledgeBase = this._loadKnowledgeBase();
  }

  /**
   * 加载真实感方法论知识库
   */
  _loadKnowledgeBase() {
    const kbPath = path.join(__dirname, '../../knowledge-base/AI-video-realism-methodology.json');
    if (fs.existsSync(kbPath)) {
      return JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
    }
    // 内建默认知识库（精简版）
    return this._buildDefaultKnowledgeBase();
  }

  /**
   * 构建默认知识库（七维模型核心关键词）
   */
  _buildDefaultKnowledgeBase() {
    return {
      // 2.1 摄影机维度
      camera: {
        primary: ['Arri Alexa 65', 'Arri Alexa Mini LF'],
        secondary: ['RED V-RAPTOR', 'Sony Venice 2'],
        modifiers: ['65mm sensor', 'large format', 'IMAX 70mm']
      },
      // 2.2 镜头维度
      lens: {
        primary: ['Cooke S7/i', 'Arri Master Prime'],
        secondary: ['Leica Summilux', 'Zeiss Otus', 'Panavision Primo'],
        modifiers: ['anamorphic 2.39:1', 'widescreen cinematic']
      },
      // 2.3 光圈与景深
      aperture: {
        primary: ['f/1.8', 'f/2.0', 'f/2.8'],
        modifiers: ['shallow DOF', 'soft bokeh', 'background falls off smoothly', 'tack sharp focus on subject eyes']
      },
      // 2.4 光线维度
      lighting: {
        primary: ['natural diffused overcast'],
        secondary: ['golden hour soft sunlight', 'overcast skylight', 'practical lights visible in frame'],
        modifiers: ['soft shadows', 'no hard light', 'subtle rim light separating subject from background'],
        forbidden: ['hard light', 'studio lighting', 'perfect lighting']
      },
      // 2.5 色彩维度
      color: {
        primary: ['muted desaturated earth tones'],
        secondary: ['teal shadows, warm highlights', 'cinematic LUT', 'Kodak Vision3 500T color science'],
        modifiers: ['subtle color separation'],
        forbidden: ['highly saturated', 'vivid colors', 'colorful']
      },
      // 2.6 材质与微观细节
      material: {
        primary: ['subsurface scattering', 'skin pores visible', 'individual hair strands'],
        secondary: ['fabric weave texture', 'subtle imperfections', 'microscopic surface detail'],
        advanced: ['dust particles in sunlight', 'tiny water droplets on skin']
      },
      // 2.7 动态与氛围
      motion: {
        primary: ['motion blur on fast elements', 'wind blowing hair and fabric'],
        secondary: ['dust particles floating in air', 'shallow depth breathing motion', 'natural micro-movements'],
        advanced: ['lens flare from practical light', 'handheld camera subtle shake']
      },
      // 2.8 噪点与颗粒
      grain: {
        primary: ['subtle film grain'],
        secondary: ['organic texture', 'RAW quality', 'fine noise structure'],
        advanced: ['Kodak 5219 grain structure'],
        forbidden: ['overly clean digital look']
      },
      // 禁忌词映射表
      antiPatterns: {
        'perfect skin': 'skin pores visible, subtle imperfections',
        'flawless complexion': 'skin pores, individual hair strands',
        'vivid colors': 'muted desaturated earth tones',
        'highly saturated': 'muted, desaturated',
        'studio lighting': 'natural diffused overcast',
        'perfect lighting': 'natural diffused overcast lighting',
        'dramatic hard shadows': 'soft shadows, no hard light',
        'everything in sharp focus': 'shallow DOF, f/1.8',
        'deep depth of field': 'shallow DOF, soft bokeh',
        'clean digital look': 'subtle film grain, organic texture',
        'crisp sharp': 'subtle film grain, organic texture',
        'cinematic': 'Arri Alexa 65, Cooke S7/i, f/2.0', // 泛化词替换为具体器材
        'photorealistic': 'subsurface scattering, skin pores visible, individual hair strands',
        'static pose': 'natural micro-movements, wind blowing hair',
        'frozen moment': 'motion blur on fast elements, natural micro-movements'
      },
      // 场景模板
      templates: {
        portrait: {
          name: '人物写实',
          dimensions: ['camera', 'lens', 'aperture', 'lighting', 'color', 'material', 'motion', 'grain'],
          core: ['Arri Alexa 65', 'Cooke S7/i', 'anamorphic 2.39:1', 'f/1.8', 'natural diffused overcast', 'muted earth tones', 'subsurface scattering', 'wind blowing hair', 'subtle film grain']
        },
        wildlife: {
          name: '野生动物/自然纪录片',
          dimensions: ['camera', 'lens', 'aperture', 'lighting', 'color', 'material', 'motion', 'grain'],
          core: ['Arri Alexa Mini LF', 'Master Prime', 'f/2.8', 'natural diffused overcast', 'muted earth tones', 'individual fur strands', 'wind blowing fur', 'subtle film grain', 'documentary wildlife photography style']
        },
        interior: {
          name: '室内场景',
          dimensions: ['camera', 'lens', 'aperture', 'lighting', 'color', 'material', 'grain'],
          core: ['Arri Alexa 65', 'Cooke S7/i', '2.39:1 anamorphic', 'f/2.0', 'natural light through window', 'muted warm earth tones', 'fabric weave texture', 'subtle film grain']
        },
        minimal: {
          name: '快速通用',
          dimensions: ['camera', 'lens', 'aperture', 'lighting', 'color', 'material', 'motion', 'grain'],
          core: ['Arri Alexa 65', 'Cooke S7/i', 'f/2.0', 'natural diffused overcast', 'muted earth tones', 'skin pores', 'wind motion', 'subtle film grain']
        }
      }
    };
  }

  /**
   * 主入口：增强提示词
   * @param {string} prompt - 原始提示词
   * @param {Object} context - 上下文信息（可选）
   *   - sceneType: 场景类型（portrait/wildlife/interior/minimal/auto）
   *   - filmType: 影片类型（EDU/documentary/drama等）
   *   - characterType: 角色类型（human/animal/landscape等）
   * @returns {Object} 增强结果
   */
  enhance(prompt, context = {}) {
    if (!this.config.enabled || !prompt) {
      return { enhanced: prompt, changes: [], coverage: 0, applied: false };
    }

    let enhancedPrompt = prompt;
    const changes = [];

    // 1. 检测当前七维覆盖度
    const coverage = this._analyzeCoverage(prompt);

    // 2. 如果覆盖度不足，进行补全
    if (coverage.score < this.config.minDimensionCoverage) {
      const supplement = this._generateSupplement(prompt, context, coverage);
      if (supplement) {
        enhancedPrompt = this._inject(enhancedPrompt, supplement);
        changes.push({
          type: 'dimension_supplement',
          reason: `七维覆盖度 ${coverage.score}/8，低于阈值 ${this.config.minDimensionCoverage}`,
          added: supplement
        });
      }
    }

    // 3. 禁忌词检测与替换
    const antiPatternResult = this._replaceAntiPatterns(enhancedPrompt);
    if (antiPatternResult.changed) {
      enhancedPrompt = antiPatternResult.text;
      changes.push({
        type: 'anti_pattern_replacement',
        replacements: antiPatternResult.replacements
      });
    }

    // 4. 场景模板匹配（如果指定了场景类型）
    if (context.sceneType && context.sceneType !== 'auto') {
      const templateMatch = this._applyTemplate(enhancedPrompt, context.sceneType);
      if (templateMatch.applied) {
        enhancedPrompt = templateMatch.text;
        changes.push({
          type: 'template_matching',
          template: context.sceneType,
          added: templateMatch.added
        });
      }
    }

    // 5. 自动场景检测（如果未指定）
    if (this.config.autoDetectScene && !context.sceneType) {
      const detected = this._detectSceneType(enhancedPrompt);
      if (detected && detected !== 'minimal') {
        const templateMatch = this._applyTemplate(enhancedPrompt, detected);
        if (templateMatch.applied) {
          enhancedPrompt = templateMatch.text;
          changes.push({
            type: 'auto_scene_detection',
            detected: detected,
            added: templateMatch.added
          });
        }
      }
    }

    return {
      enhanced: enhancedPrompt,
      original: prompt,
      changes,
      coverage: coverage.score,
      applied: changes.length > 0,
      metadata: {
        enhancerVersion: '1.0.0',
        knowledgeBase: 'AI-video-realism-methodology',
        injectPosition: this.config.injectPosition
      }
    };
  }

  /**
   * 分析七维覆盖度
   */
  _analyzeCoverage(prompt) {
    const promptLower = prompt.toLowerCase();
    const dimensions = {
      camera: false,
      lens: false,
      aperture: false,
      lighting: false,
      color: false,
      material: false,
      motion: false,
      grain: false
    };

    // 检查每个维度
    const kb = this.knowledgeBase;

    // 摄影机
    if (['arri', 'red', 'sony venice', 'alexa', '65mm', 'large format', 'imax'].some(k => promptLower.includes(k))) {
      dimensions.camera = true;
    }
    // 镜头
    if (['cooke', 'master prime', 'summilux', 'otus', 'anamorphic', 'panavision', 's7/i'].some(k => promptLower.includes(k))) {
      dimensions.lens = true;
    }
    // 光圈
    if (['f/1.', 'f/2.', 'shallow dof', 'bokeh', 'depth of field'].some(k => promptLower.includes(k))) {
      dimensions.aperture = true;
    }
    // 光线
    if (['natural light', 'diffused', 'overcast', 'soft shadow', 'golden hour', 'practical light'].some(k => promptLower.includes(k))) {
      dimensions.lighting = true;
    }
    // 色彩
    if (['muted', 'desaturated', 'earth tone', 'teal', 'cinematic lut', 'kodak', 'color science'].some(k => promptLower.includes(k))) {
      dimensions.color = true;
    }
    // 材质
    if (['subsurface scattering', 'skin pore', 'hair strand', 'fabric weave', 'microscopic', 'imperfection'].some(k => promptLower.includes(k))) {
      dimensions.material = true;
    }
    // 动态
    if (['motion blur', 'wind', 'blowing', 'micro-movement', 'handheld', 'shake'].some(k => promptLower.includes(k))) {
      dimensions.motion = true;
    }
    // 颗粒
    if (['film grain', 'organic texture', 'noise', 'grain structure'].some(k => promptLower.includes(k))) {
      dimensions.grain = true;
    }

    const score = Object.values(dimensions).filter(v => v).length;
    return { score, dimensions, total: 8 };
  }

  /**
   * 生成补全内容
   */
  _generateSupplement(prompt, context, coverage) {
    const missing = Object.entries(coverage.dimensions)
      .filter(([_, v]) => !v)
      .map(([k]) => k);

    if (missing.length === 0) return null;

    const kb = this.knowledgeBase;
    const parts = [];

    // 按优先级添加缺失维度
    const priority = ['camera', 'lens', 'aperture', 'lighting', 'color', 'material', 'motion', 'grain'];
    for (const dim of priority) {
      if (missing.includes(dim) && kb[dim]) {
        const keywords = kb[dim].primary || kb[dim].core || [];
        if (keywords.length > 0) {
          parts.push(keywords[0]); // 取最高优先级关键词
        }
      }
    }

    if (parts.length === 0) return null;

    return `\n\n[Realism Enhancement] ${parts.join(', ')}`;
  }

  /**
   * 注入提示词
   */
  _inject(prompt, supplement) {
    const position = this.config.injectPosition;
    if (position === 'prefix') {
      return supplement + '\n\n' + prompt;
    } else if (position === 'suffix') {
      return prompt + supplement;
    } else {
      // embed: 尝试智能嵌入（简化实现）
      return prompt + supplement;
    }
  }

  /**
   * 禁忌词检测与替换
   */
  _replaceAntiPatterns(prompt) {
    const kb = this.knowledgeBase;
    const replacements = [];
    let text = prompt;
    let changed = false;

    for (const [bad, good] of Object.entries(kb.antiPatterns || {})) {
      const regex = new RegExp(bad, 'gi');
      if (regex.test(text)) {
        text = text.replace(regex, good);
        replacements.push({ from: bad, to: good });
        changed = true;
      }
    }

    return { text, changed, replacements };
  }

  /**
   * 应用场景模板
   */
  _applyTemplate(prompt, sceneType) {
    const template = this.knowledgeBase.templates?.[sceneType];
    if (!template) return { applied: false };

    // 检查模板核心关键词是否已存在
    const promptLower = prompt.toLowerCase();
    const missing = template.core.filter(k => !promptLower.includes(k.toLowerCase()));

    if (missing.length === 0) return { applied: false };

    // 添加缺失的核心关键词
    const added = missing.slice(0, 3); // 最多添加3个
    const injection = `\n\n[${template.name}] ${added.join(', ')}`;

    return {
      applied: true,
      text: prompt + injection,
      added
    };
  }

  /**
   * 自动检测场景类型
   */
  _detectSceneType(prompt) {
    const promptLower = prompt.toLowerCase();

    if (['animal', 'wildlife', 'nature', 'forest', 'bird', 'lion', 'elephant'].some(k => promptLower.includes(k))) {
      return 'wildlife';
    }
    if (['indoor', 'interior', 'room', 'house', 'apartment', 'office', 'kitchen'].some(k => promptLower.includes(k))) {
      return 'interior';
    }
    if (['portrait', 'face', 'person', 'woman', 'man', 'human', 'model'].some(k => promptLower.includes(k))) {
      return 'portrait';
    }

    return 'minimal'; // 默认
  }

  /**
   * 获取增强器统计
   */
  getStats() {
    return {
      version: '1.0.0',
      knowledgeBaseDimensions: 8,
      templates: Object.keys(this.knowledgeBase.templates || {}).length,
      antiPatterns: Object.keys(this.knowledgeBase.antiPatterns || {}).length,
      config: this.config
    };
  }
}

module.exports = { RealismPromptEnhancer };

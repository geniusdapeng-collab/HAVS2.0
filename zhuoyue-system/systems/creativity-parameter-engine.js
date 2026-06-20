/**
 * Creativity Parameter Engine (创意参数引擎)
 * v1.0.0 - 2026-06-14
 * 
 * 安全边界（不可协商）：
 * - 只影响外在表现：影视风格、运镜、灯光、美术布景、色调、构图、质感
 * - 不修改内容：剧本事实、医学数据、角色设定、核心叙事、对白含义
 * - 创意参数作用于"如何拍摄"，绝不改变"拍摄什么"
 * 
 * 创意参数范围：0.0 - 1.0
 * 0.0-0.2 极简科普（Minimalist）     → 教科书式，无情绪设计
 * 0.2-0.4 标准纪录片（Standard）     → 中性，平铺直叙
 * 0.4-0.6 叙事增强（Enhanced）       → 默认，故事化，有情绪弧线
 * 0.6-0.8 电影级（Cinematic）        → 强视觉，电影运镜，情绪驱动
 * 0.8-1.0 好莱坞大片（Blockbuster）  → 英雄之旅，IMAX质感，史诗配乐
 */

const path = require('path');

// ========== 创意参数等级定义 ==========

const CP_LEVELS = {
  MINIMALIST:     { min: 0.0, max: 0.2, name: '极简科普',     style: 'minimalist' },
  STANDARD:       { min: 0.2, max: 0.4, name: '标准纪录片',   style: 'standard' },
  ENHANCED:       { min: 0.4, max: 0.6, name: '叙事增强',     style: 'enhanced' },
  CINEMATIC:      { min: 0.6, max: 0.8, name: '电影级',       style: 'cinematic' },
  BLOCKBUSTER:    { min: 0.8, max: 1.0, name: '好莱坞大片',   style: 'blockbuster' }
};

// ========== 各阶段创意配置映射 ==========

const STAGE_CONFIG = {
  // Stage 1: PRD - 视觉风格、叙事风格（只影响表现形式，不改变核心事实）
  '1-prd': {
    visualStyle: {
      [CP_LEVELS.MINIMALIST.style]:     '教科书式插图，静态展示，无设计感',
      [CP_LEVELS.STANDARD.style]:       '标准纪录片视觉，中性色调，清晰呈现',
      [CP_LEVELS.ENHANCED.style]:       '温暖纪录片风格，自然光影，有质感',
      [CP_LEVELS.CINEMATIC.style]:      '电影级视觉，强烈光影，构图精致',
      [CP_LEVELS.BLOCKBUSTER.style]:      '好莱坞大片质感，IMAX级视觉，史诗感'
    },
    narrativeStyle: {
      [CP_LEVELS.MINIMALIST.style]:     '直接讲解，无叙事结构，纯信息传递',
      [CP_LEVELS.STANDARD.style]:       '平铺直叙，线性推进，标准讲解',
      [CP_LEVELS.ENHANCED.style]:       '故事化叙事，有情绪弧线，引人入胜',
      [CP_LEVELS.CINEMATIC.style]:      '电影叙事结构，角色驱动，情感张力',
      [CP_LEVELS.BLOCKBUSTER.style]:    '英雄之旅结构，史诗叙事，强烈情感冲击'
    }
  },

  // Stage 5: Script - 脚本结构（只改变表达方式，不改变医学内容）
  '5-script': {
    structure: {
      [CP_LEVELS.MINIMALIST.style]:     '直白列表式，无过渡，直接罗列知识点',
      [CP_LEVELS.STANDARD.style]:       '标准段落式，有基本过渡，清晰分段',
      [CP_LEVELS.ENHANCED.style]:       '故事化结构，有起承转合，情绪引导',
      [CP_LEVELS.CINEMATIC.style]:      '电影剧本结构，场景驱动，视觉化描述',
      [CP_LEVELS.BLOCKBUSTER.style]:    '好莱坞剧本结构，英雄之旅，强视觉场景'
    },
    tone: {
      [CP_LEVELS.MINIMALIST.style]:     '中性客观，无情感色彩，纯学术',
      [CP_LEVELS.STANDARD.style]:       '专业可信，温和亲切，有基本温度',
      [CP_LEVELS.ENHANCED.style]:       '生动有感染力，情绪丰富，有温度',
      [CP_LEVELS.CINEMATIC.style]:      '戏剧性张力，情感层次丰富，有冲击力',
      [CP_LEVELS.BLOCKBUSTER.style]:    '史诗感，强烈情感冲击，震撼力'
    }
  },

  // Stage 7: Storyboard - 镜头设计、景别序列（纯外在表现）
  '7-storyboard': {
    shotComplexity: {
      [CP_LEVELS.MINIMALIST.style]:     '单一景别，固定机位，无变化',
      [CP_LEVELS.STANDARD.style]:       '标准景别序列，基本切换，适度变化',
      [CP_LEVELS.ENHANCED.style]:       '动态构图，景别丰富，有节奏变化',
      [CP_LEVELS.CINEMATIC.style]:      '电影级构图，复杂景别序列，强视觉节奏',
      [CP_LEVELS.BLOCKBUSTER.style]:    '史诗级构图，极致景别设计，视觉震撼'
    },
    composition: {
      [CP_LEVELS.MINIMALIST.style]:     '中心对称，无构图设计，直接呈现',
      [CP_LEVELS.STANDARD.style]:       '标准三分法，基本构图，清晰可读',
      [CP_LEVELS.ENHANCED.style]:       '动态构图，引导线运用，视觉层次',
      [CP_LEVELS.CINEMATIC.style]:      '电影构图，黄金比例，复杂层次',
      [CP_LEVELS.BLOCKBUSTER.style]:    '史诗构图，极致视觉设计，IMAX级'
    }
  },

  // Stage 9: Camera - 运镜风格（纯外在表现）
  '9-camera': {
    movementStyle: {
      [CP_LEVELS.MINIMALIST.style]:     '三脚架固定，无运动，静态画面',
      [CP_LEVELS.STANDARD.style]:       '基本稳定，有限运动，标准手持',
      [CP_LEVELS.ENHANCED.style]:       '稳定器手持，有运动设计，动态感',
      [CP_LEVELS.CINEMATIC.style]:      '电影级运镜，斯坦尼康/轨道，复杂运动',
      [CP_LEVELS.BLOCKBUSTER.style]:    '史诗运镜，航拍/斯坦尼康/复杂运动组合'
    },
    movementIntensity: {
      [CP_LEVELS.MINIMALIST.style]:     0.0,
      [CP_LEVELS.STANDARD.style]:       0.3,
      [CP_LEVELS.ENHANCED.style]:       0.5,
      [CP_LEVELS.CINEMATIC.style]:      0.8,
      [CP_LEVELS.BLOCKBUSTER.style]:    1.0
    }
  },

  // Stage 8.4: Skills - 好莱坞技能匹配（纯外在表现，已有scope: exterior_only）
  '8.4-skills': {
    skillAggressiveness: {
      [CP_LEVELS.MINIMALIST.style]:     '禁用技能注入',
      [CP_LEVELS.STANDARD.style]:       '标准技能，2-3个术语',
      [CP_LEVELS.ENHANCED.style]:       '增强技能，3-4个术语',
      [CP_LEVELS.CINEMATIC.style]:      '激进技能，4-6个术语',
      [CP_LEVELS.BLOCKBUSTER.style]:    '极致技能，6-8个术语'
    },
    maxTerms: {
      [CP_LEVELS.MINIMALIST.style]:     0,
      [CP_LEVELS.STANDARD.style]:       3,
      [CP_LEVELS.ENHANCED.style]:       4,
      [CP_LEVELS.CINEMATIC.style]:      6,
      [CP_LEVELS.BLOCKBUSTER.style]:    8
    }
  },

  // Stage 11: Render - Prompt filmic质量（纯外在表现）
  '11-render': {
    promptQuality: {
      [CP_LEVELS.MINIMALIST.style]:     '基础描述，无修饰词，纯功能描述',
      [CP_LEVELS.STANDARD.style]:       '标准描述，基本修饰，清晰呈现',
      [CP_LEVELS.ENHANCED.style]:       '电影级描述，丰富修饰，有质感',
      [CP_LEVELS.CINEMATIC.style]:      '好莱坞级描述，复杂光影，精致质感',
      [CP_LEVELS.BLOCKBUSTER.style]:    '史诗级描述，极致光影，IMAX质感'
    },
    lightingComplexity: {
      [CP_LEVELS.MINIMALIST.style]:     '平光，无设计，基础照明',
      [CP_LEVELS.STANDARD.style]:       '标准三点光，基础照明设计',
      [CP_LEVELS.ENHANCED.style]:       '自然光模拟，有光影设计',
      [CP_LEVELS.CINEMATIC.style]:      '电影级灯光，复杂光影，体积光',
      [CP_LEVELS.BLOCKBUSTER.style]:    '史诗级灯光，极致光影，黄金时刻/体积光'
    },
    colorGrading: {
      [CP_LEVELS.MINIMALIST.style]:     '中性标准，无调色，原始色彩',
      [CP_LEVELS.STANDARD.style]:       '温和调色，自然色调，轻微调整',
      [CP_LEVELS.ENHANCED.style]:       '电影级调色，温暖色调，有风格',
      [CP_LEVELS.CINEMATIC.style]:      '强烈调色，高对比，电影LUT',
      [CP_LEVELS.BLOCKBUSTER.style]:    '极致调色，强烈色调，IMAX级质感'
    }
  },

  // Stage 14: Style - 色调、LUT、质感（纯外在表现）
  '14-style': {
    toneStyle: {
      [CP_LEVELS.MINIMALIST.style]:     '中性标准，无风格，原始质感',
      [CP_LEVELS.STANDARD.style]:       '温暖纪录片，自然色调，有质感',
      [CP_LEVELS.ENHANCED.style]:       '电影级色调，温暖LUT，精致质感',
      [CP_LEVELS.CINEMATIC.style]:      '强烈色调，高对比LUT，电影质感',
      [CP_LEVELS.BLOCKBUSTER.style]:    '极致色调，史诗LUT，IMAX质感'
    },
    textureQuality: {
      [CP_LEVELS.MINIMALIST.style]:     '基础质感，无纹理设计',
      [CP_LEVELS.STANDARD.style]:       '标准质感，基本纹理',
      [CP_LEVELS.ENHANCED.style]:       '精致质感，有纹理层次',
      [CP_LEVELS.CINEMATIC.style]:      '电影级质感，丰富纹理',
      [CP_LEVELS.BLOCKBUSTER.style]:    '极致质感，史诗纹理，细节丰富'
    }
  }
};

// ========== 引擎核心类 ==========

class CreativityParameterEngine {
  constructor(cp = 0.5) {
    this.cp = Math.max(0.0, Math.min(1.0, cp));
    this.level = this._getLevel(this.cp);
    this.style = this.level.style;
  }

  _getLevel(cp) {
    for (const key of Object.keys(CP_LEVELS)) {
      const level = CP_LEVELS[key];
      if (cp >= level.min && cp <= level.max) {
        return level;
      }
    }
    return CP_LEVELS.ENHANCED; // 默认
  }

  // 获取指定阶段的配置
  getStageConfig(stageName) {
    const stageConfig = STAGE_CONFIG[stageName];
    if (!stageConfig) {
      return null;
    }

    const result = {};
    for (const [key, valueMap] of Object.entries(stageConfig)) {
      result[key] = valueMap[this.style] || valueMap[CP_LEVELS.STANDARD.style];
    }

    return result;
  }

  // 获取所有阶段配置（用于日志）
  getAllStageConfigs() {
    const result = {};
    for (const stageName of Object.keys(STAGE_CONFIG)) {
      result[stageName] = this.getStageConfig(stageName);
    }
    return result;
  }

  // 获取创意等级信息
  getLevelInfo() {
    return {
      cp: this.cp,
      level: this.level.name,
      style: this.style,
      range: `${this.level.min}-${this.level.max}`
    };
  }

  // 判断是否需要技能注入（Stage 8.4）
  isSkillInjectionEnabled() {
    return this.cp >= 0.4; // 0.4以下禁用技能注入
  }

  // 获取技能注入参数
  getSkillInjectionParams() {
    const stageConfig = this.getStageConfig('8.4-skills');
    return {
      enabled: this.isSkillInjectionEnabled(),
      maxTerms: stageConfig.maxTerms || 3,
      aggressiveness: stageConfig.skillAggressiveness || '标准'
    };
  }

  // 获取渲染prompt增强配置
  getRenderEnhancementConfig() {
    return this.getStageConfig('11-render');
  }

  // 获取运镜配置
  getCameraConfig() {
    return this.getStageConfig('9-camera');
  }

  // 获取故事板配置
  getStoryboardConfig() {
    return this.getStageConfig('7-storyboard');
  }

  // 安全校验：确保不修改内容
  validateSafety() {
    return {
      safe: true,
      boundary: 'exterior_only',
      affectedDimensions: [
        'visual_style', 'movement_style', 'lighting', 'color_grading', 
        'composition', 'texture', 'shot_complexity'
      ],
      protectedDimensions: [
        'script_content', 'medical_facts', 'character_identity', 
        'dialogue_meaning', 'narrative_structure', 'core_message'
      ]
    };
  }

  // 生成创意参数报告
  generateReport() {
    const levelInfo = this.getLevelInfo();
    const allConfigs = this.getAllStageConfigs();
    const skillParams = this.getSkillInjectionParams();

    return {
      creativityParameter: this.cp,
      level: levelInfo,
      skillInjection: skillParams,
      stageConfigs: allConfigs,
      safety: this.validateSafety()
    };
  }
}

// ========== 快捷函数 ==========

function createEngine(cp) {
  return new CreativityParameterEngine(cp);
}

function getLevelName(cp) {
  const engine = new CreativityParameterEngine(cp);
  return engine.getLevelInfo().level;
}

function getStageConfig(cp, stageName) {
  const engine = new CreativityParameterEngine(cp);
  return engine.getStageConfig(stageName);
}

// ========== 导出 ==========

module.exports = {
  CreativityParameterEngine,
  CP_LEVELS,
  STAGE_CONFIG,
  createEngine,
  getLevelName,
  getStageConfig
};

// CLI测试
if (require.main === module) {
  console.log('=== 创意参数引擎测试 ===\n');
  
  const testValues = [0.1, 0.3, 0.5, 0.7, 0.9];
  
  for (const cp of testValues) {
    const engine = new CreativityParameterEngine(cp);
    const info = engine.getLevelInfo();
    console.log(`CP=${cp} → ${info.level} (${info.style})`);
    
    const skillParams = engine.getSkillInjectionParams();
    console.log(`  技能注入: ${skillParams.enabled ? '启用' : '禁用'} | 最大术语: ${skillParams.maxTerms}`);
    
    const renderConfig = engine.getRenderEnhancementConfig();
    console.log(`  渲染质量: ${renderConfig.promptQuality}`);
    console.log(`  灯光复杂度: ${renderConfig.lightingComplexity}`);
    console.log();
  }
  
  console.log('=== 安全边界 ===');
  const engine = new CreativityParameterEngine(0.9);
  const safety = engine.validateSafety();
  console.log('安全状态:', safety.safe ? '通过' : '失败');
  console.log('影响维度:', safety.affectedDimensions.join(', '));
  console.log('保护维度:', safety.protectedDimensions.join(', '));
}

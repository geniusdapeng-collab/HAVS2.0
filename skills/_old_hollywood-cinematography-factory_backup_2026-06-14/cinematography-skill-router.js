/**
 * Cinematography Skill Router - 医疗科普/纪录片专用
 * 
 * Stormaxe视频系统 v6.5.65-P4 集成版
 * 从149个好莱坞技能库中筛选适配医疗科普的10个核心技能
 * 在Stage 9（运镜系统）之后自动匹配并增强prompt
 */

const fs = require('fs');
const path = require('path');

// 技能库路径
const SKILL_LIBRARY_PATH = path.join(__dirname, '技能系列', '镜头级专项');

// 技能定义（医疗科普/纪录片专用子集）
const MEDICAL_DOC_SKILLS = {
  'documentary_villeneuve_meditative_handheld': {
    name: '纪录片_维伦纽瓦_冥想手持',
    file: '纪录片_维伦纽瓦_冥想手持.md',
    tags: ['meditation', 'awe', 'slow', 'handheld', 'contemplative'],
    moodMatch: ['solemn', 'awe', 'meditative', 'contemplative', 'serious'],
    cameraMatch: ['handheld', 'slow', 'following', 'meditative'],
    priority: 1
  },
  'documentary_interview_medium_shot': {
    name: '纪录片_专业访谈中景',
    file: '纪录片_专业访谈中景.md',
    tags: ['interview', 'professional', 'trust', 'medium_shot', 'stable'],
    moodMatch: ['professional', 'trust', 'authority', 'expert', 'educational'],
    cameraMatch: ['medium_shot', 'static', 'tripod', 'interview'],
    priority: 2
  },
  'documentary_soft_natural_lighting': {
    name: '纪录片_柔和自然光',
    file: '纪录片_柔和自然光.md',
    tags: ['soft_light', 'natural', 'warm', 'healing', 'comforting'],
    moodMatch: ['warm', 'healing', 'comforting', 'safe', 'gentle'],
    cameraMatch: ['any'],
    priority: 3
  },
  'documentary_patient_story_following': {
    name: '纪录片_患者故事跟拍',
    file: '纪录片_患者故事跟拍.md',
    tags: ['following', 'patient', 'empathy', 'real', 'documentary'],
    moodMatch: ['empathy', 'real', 'human', 'emotional', 'personal'],
    cameraMatch: ['following', 'tracking', 'handheld', 'smooth'],
    priority: 4
  },
  'documentary_calm_professional_closeup': {
    name: '纪录片_冷静专业特写',
    file: '纪录片_冷静专业特写.md',
    tags: ['closeup', 'professional', 'calm', 'detail', 'clinical'],
    moodMatch: ['clinical', 'professional', 'calm', 'precise', 'detailed'],
    cameraMatch: ['closeup', 'macro', 'extreme_closeup', 'detail'],
    priority: 5
  },
  'documentary_doctor_explanation_medium': {
    name: '纪录片_医生讲解中景',
    file: '纪录片_医生讲解中景.md',
    tags: ['explanation', 'education', 'doctor', 'medium', 'teaching'],
    moodMatch: ['educational', 'explanatory', 'teaching', 'informative', 'clear'],
    cameraMatch: ['medium_shot', 'presentation', 'demonstration'],
    priority: 6
  },
  'documentary_hospital_establishing_shot': {
    name: '纪录片_医院环境全景',
    file: '纪录片_医院环境全景.md',
    tags: ['establishing', 'wide', 'hospital', 'environment', 'overview'],
    moodMatch: ['overview', 'establishing', 'setting', 'context'],
    cameraMatch: ['wide', 'establishing', 'long', 'overview'],
    priority: 7
  },
  'documentary_emotional_connection_closeup': {
    name: '纪录片_情感连接特写',
    file: '纪录片_情感连接特写.md',
    tags: ['emotional', 'connection', 'closeup', 'empathy', 'touching'],
    moodMatch: ['emotional', 'touching', 'empathy', 'caring', 'warm'],
    cameraMatch: ['closeup', 'extreme_closeup', 'intimate'],
    priority: 8
  },
  'documentary_medical_illustration_animation': {
    name: '纪录片_医学示意图动画',
    file: '纪录片_医学示意图动画.md',
    tags: ['animation', 'illustration', 'medical', 'education', 'clear'],
    moodMatch: ['educational', 'informative', 'clear', 'analytical'],
    cameraMatch: ['animation', 'graphic', 'illustration', 'diagram'],
    priority: 9
  },
  'documentary_warm_healing_closeup': {
    name: '纪录片_温暖治愈近景',
    file: '纪录片_温暖治愈近景.md',
    tags: ['warm', 'healing', 'closeup', 'hope', 'comforting'],
    moodMatch: ['hope', 'healing', 'comforting', 'warm', 'reassuring'],
    cameraMatch: ['closeup', 'intimate', 'warm_lighting'],
    priority: 10
  }
};

/**
 * 技能路由器主类
 */
class CinematographySkillRouter {
  constructor(options = {}) {
    this.skills = MEDICAL_DOC_SKILLS;
    this.skillCache = new Map(); // 缓存已读取的技能文件
    this.debug = options.debug || false;
    this.logPrefix = '[Stage8.4-SkillRouter]';
  }

  log(...args) {
    if (this.debug) {
      console.log(this.logPrefix, ...args);
    }
  }

  /**
   * 根据Stage 9输出匹配最佳技能
   * @param {Object} stage9Output - Stage 9运镜系统输出
   * @param {Object} shotMetadata - 镜头元数据（可选）
   * @returns {Object} 匹配结果 { matchedSkills, enhancedPrompt, skillTerms }
   */
  matchSkills(stage9Output, shotMetadata = {}) {
    this.log('开始匹配技能...', { stage9Output, shotMetadata });

    const { camera, mood, lighting, subject, shotType } = stage9Output;
    
    // 计算每个技能的匹配分数
    const scores = Object.entries(this.skills).map(([skillId, skill]) => {
      let score = 0;
      let matchReasons = [];

      // 1. 情绪匹配 (权重40%)
      if (mood) {
        const moodLower = mood.toLowerCase();
        const moodMatches = skill.moodMatch.filter(m => 
          moodLower.includes(m) || m.includes(moodLower)
        );
        score += moodMatches.length * 4;
        if (moodMatches.length > 0) {
          matchReasons.push(`情绪匹配: ${moodMatches.join(', ')}`);
        }
      }

      // 2. 镜头类型匹配 (权重30%)
      if (camera || shotType) {
        const cameraLower = (camera || shotType || '').toLowerCase();
        const cameraMatches = skill.cameraMatch.filter(c => 
          c === 'any' || cameraLower.includes(c) || c.includes(cameraLower)
        );
        score += cameraMatches.length * 3;
        if (cameraMatches.length > 0) {
          matchReasons.push(`镜头匹配: ${cameraMatches.join(', ')}`);
        }
      }

      // 3. 灯光匹配 (权重20%)
      if (lighting) {
        const lightingLower = lighting.toLowerCase();
        if (lightingLower.includes('soft') || lightingLower.includes('natural')) {
          if (skill.tags.includes('soft_light') || skill.tags.includes('natural')) {
            score += 2;
            matchReasons.push('灯光匹配: soft/natural');
          }
        }
        if (lightingLower.includes('warm')) {
          if (skill.tags.includes('warm') || skill.tags.includes('healing')) {
            score += 2;
            matchReasons.push('灯光匹配: warm');
          }
        }
      }

      // 4. 主体匹配 (权重10%)
      if (subject) {
        const subjectLower = subject.toLowerCase();
        if (subjectLower.includes('doctor') || subjectLower.includes('expert')) {
          if (skill.tags.includes('doctor') || skill.tags.includes('expert')) {
            score += 1;
            matchReasons.push('主体匹配: doctor/expert');
          }
        }
        if (subjectLower.includes('patient')) {
          if (skill.tags.includes('patient') || skill.tags.includes('empathy')) {
            score += 1;
            matchReasons.push('主体匹配: patient');
          }
        }
      }

      // 5. 优先级调整（高优先级技能加分）
      score += (11 - skill.priority) * 0.5;

      return { skillId, skill, score, matchReasons };
    });

    // 排序并选择前2个最佳匹配
    scores.sort((a, b) => b.score - a.score);
    const topMatches = scores.filter(s => s.score > 0).slice(0, 2);

    this.log('技能匹配结果:', topMatches.map(m => ({
      skill: m.skill.name,
      score: m.score,
      reasons: m.matchReasons
    })));

    return {
      matchedSkills: topMatches.map(m => ({
        id: m.skillId,
        name: m.skill.name,
        score: m.score,
        reasons: m.matchReasons
      })),
      topMatch: topMatches[0] || null
    };
  }

  /**
   * 读取技能文件内容
   * @param {string} skillId - 技能ID
   * @returns {string} 技能文件内容
   */
  readSkillFile(skillId) {
    if (this.skillCache.has(skillId)) {
      return this.skillCache.get(skillId);
    }

    const skill = this.skills[skillId];
    if (!skill) {
      this.log('技能未找到:', skillId);
      return null;
    }

    const filePath = path.join(SKILL_LIBRARY_PATH, skill.file);
    
    try {
      if (!fs.existsSync(filePath)) {
        this.log('技能文件不存在:', filePath);
        // 返回内置的简化技能定义
        return this._getBuiltinSkillDefinition(skillId);
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      this.skillCache.set(skillId, content);
      return content;
    } catch (err) {
      this.log('读取技能文件失败:', err.message);
      return this._getBuiltinSkillDefinition(skillId);
    }
  }

  /**
   * 获取内置技能定义（文件不存在时使用）
   */
  _getBuiltinSkillDefinition(skillId) {
    const builtinDefinitions = {
      'documentary_villeneuve_meditative_handheld': {
        promptTerms: ['Villeneuve-style meditative handheld', 'slow breathing camera movement', 'contemplative atmosphere', 'awe-inspiring', 'solemn mood', 'natural side lighting', 'soft ambient glow'],
        forbiddenTerms: ['fast cut', 'rapid movement', 'shaky cam', 'chaotic', 'low budget', 'static', 'boring', 'amateur'],
        mood: '敬畏/庄严'
      },
      'documentary_interview_medium_shot': {
        promptTerms: ['professional interview medium shot', 'three-point soft lighting', 'eye-level angle', 'stable tripod', 'clean professional background', 'shallow depth of field', 'trustworthy expression'],
        forbiddenTerms: ['shaky', 'handheld', 'low angle', 'extreme close-up', 'wide shot', 'chaotic background', 'cluttered'],
        mood: '专业/信任'
      },
      'documentary_soft_natural_lighting': {
        promptTerms: ['soft natural lighting', 'gentle window light', 'diffused sunlight', 'warm color temperature', 'no harsh shadows', 'healing atmosphere', 'comforting glow'],
        forbiddenTerms: ['harsh light', 'direct sunlight', 'hard shadows', 'high contrast', 'cold light', 'blue tone', 'fluorescent flicker'],
        mood: '温暖/治愈'
      },
      'documentary_patient_story_following': {
        promptTerms: ['smooth following shot', 'steady cam tracking', 'eye-level perspective', 'respectful distance', 'authentic hospital environment', 'emotional details', 'empathetic perspective'],
        forbiddenTerms: ['staged', 'scripted', 'posed', 'artificial', 'dramatic', 'exploitative', 'invasive', 'disrespectful'],
        mood: '真实/共情'
      },
      'documentary_calm_professional_closeup': {
        promptTerms: ['extreme close-up', 'sharp focus', 'shallow depth of field', 'even lighting', 'medical-grade illumination', 'clinical precision', 'scientific accuracy'],
        forbiddenTerms: ['shaky', 'blurry', 'out of focus', 'overexposed', 'underexposed', 'grainy', 'noisy', 'distorted'],
        mood: '冷静/专业'
      },
      'documentary_doctor_explanation_medium': {
        promptTerms: ['doctor explanation medium shot', 'educational presentation', 'clear visual demonstration', 'professional teaching', 'engaging explanation', 'informed consent'],
        forbiddenTerms: ['confusing', 'unclear', 'unprofessional', 'dismissive', 'condescending', 'patronizing', 'arrogant'],
        mood: '教育/清晰'
      },
      'documentary_hospital_establishing_shot': {
        promptTerms: ['hospital establishing wide shot', 'clean modern facility', 'professional medical environment', 'welcoming entrance', 'orderly corridor', 'bright welcoming atmosphere'],
        forbiddenTerms: ['dark', 'gloomy', 'messy', 'cluttered', 'chaotic', 'crowded', 'unprofessional', 'dirty'],
        mood: '环境/可信'
      },
      'documentary_emotional_connection_closeup': {
        promptTerms: ['emotional close-up', 'eye contact', 'caring expression', 'empathy gaze', 'gentle touch', 'warm connection', 'human bond'],
        forbiddenTerms: ['cold', 'detached', 'unemotional', 'distant', 'aloof', 'indifferent', 'uncaring', 'harsh'],
        mood: '情感/连接'
      },
      'documentary_medical_illustration_animation': {
        promptTerms: ['medical illustration animation', 'clear anatomical visualization', 'educational graphic', 'smooth motion graphic', 'informative diagram', 'data visualization'],
        forbiddenTerms: ['unclear', 'confusing', 'misleading', 'inaccurate', 'unprofessional', 'amateur', 'crude'],
        mood: '教育/清晰'
      },
      'documentary_warm_healing_closeup': {
        promptTerms: ['warm healing close-up', 'hopeful expression', 'comforting smile', 'reassuring gaze', 'gentle healing light', 'recovery atmosphere', 'positive energy'],
        forbiddenTerms: ['hopeless', 'grim', 'depressing', 'dark', 'gloomy', 'pessimistic', 'defeated', 'despair'],
        mood: '温暖/治愈'
      }
    };

    return builtinDefinitions[skillId] || null;
  }

  /**
   * 提取技能关键词（从技能文件或内置定义）
   * @param {string} skillId - 技能ID
   * @returns {Object} { promptTerms, forbiddenTerms, mood }
   */
  extractSkillKeywords(skillId) {
    const skillContent = this.readSkillFile(skillId);
    
    if (typeof skillContent === 'object' && skillContent !== null) {
      // 内置定义直接返回
      return skillContent;
    }

    if (!skillContent) {
      return { promptTerms: [], forbiddenTerms: [], mood: 'neutral' };
    }

    // 从Markdown文件提取关键词
    const promptTerms = [];
    const forbiddenTerms = [];
    let mood = 'neutral';

    // 提取AI提示词构建部分的术语
    const promptMatch = skillContent.match(/【基础提示词框架】/);
    if (promptMatch) {
      // 提取所有 "✅" 开头的行
      const lines = skillContent.split('\n');
      let inPromptSection = false;
      for (const line of lines) {
        if (line.includes('基础提示词框架') || line.includes('AI提示词构建')) {
          inPromptSection = true;
        }
        if (inPromptSection && line.startsWith('✅')) {
          const term = line.replace('✅', '').trim().split(',')[0];
          if (term) promptTerms.push(term);
        }
        if (inPromptSection && line.startsWith('---')) {
          inPromptSection = false;
        }
      }
    }

    // 提取禁止词
    const forbiddenMatch = skillContent.match(/禁止词：\n?- (.+)/s);
    if (forbiddenMatch) {
      const forbiddenText = forbiddenMatch[1];
      forbiddenTerms.push(...forbiddenText.split(',').map(t => t.trim()).filter(t => t));
    }

    // 提取情绪标签
    const moodMatch = skillContent.match(/情绪氛围=([^|\n]+)/);
    if (moodMatch) {
      mood = moodMatch[1].trim();
    }

    return { promptTerms, forbiddenTerms, mood };
  }

  /**
   * 增强prompt（核心功能）
   * @param {string} basePrompt - 基础prompt
   * @param {Object} stage9Output - Stage 9输出
   * @param {Object} options - 选项
   * @returns {Object} { enhancedPrompt, usedSkills, injectedTerms }
   */
  enhancePrompt(basePrompt, stage9Output, options = {}) {
    this.log('开始增强prompt...');

    const { maxTerms = 3, injectPosition = 'end' } = options;

    // 1. 匹配技能
    const matchResult = this.matchSkills(stage9Output);
    
    if (!matchResult.topMatch) {
      this.log('未匹配到任何技能，返回原prompt');
      return {
        enhancedPrompt: basePrompt,
        usedSkills: [],
        injectedTerms: []
      };
    }

    // 2. 提取关键词
    const allTerms = [];
    const usedSkills = [];

    for (const match of matchResult.matchedSkills) {
      const keywords = this.extractSkillKeywords(match.id);
      
      if (keywords.promptTerms && keywords.promptTerms.length > 0) {
        // 选择前maxTerms个关键词
        const selectedTerms = keywords.promptTerms.slice(0, maxTerms);
        allTerms.push(...selectedTerms);
      }

      usedSkills.push({
        id: match.id,
        name: match.name,
        score: match.score,
        terms: keywords.promptTerms?.slice(0, maxTerms) || []
      });

      this.log(`技能 ${match.name} 注入关键词:`, keywords.promptTerms?.slice(0, maxTerms));
    }

    // 3. 注入关键词到prompt
    let enhancedPrompt = basePrompt;
    const injectedTerms = [...new Set(allTerms)]; // 去重

    if (injectedTerms.length > 0) {
      const injectionText = `\n\n[Filmic Quality Enhancement] ${injectedTerms.join(', ')}`;
      
      if (injectPosition === 'end') {
        enhancedPrompt = basePrompt + injectionText;
      } else if (injectPosition === 'start') {
        enhancedPrompt = injectionText + '\n\n' + basePrompt;
      } else {
        // 智能插入：在RENDER或CAMERA段落之后
        enhancedPrompt = this._smartInsert(basePrompt, injectionText);
      }
    }

    this.log('Prompt增强完成，注入术语数:', injectedTerms.length);

    return {
      enhancedPrompt,
      usedSkills,
      injectedTerms
    };
  }

  /**
   * 智能插入增强文本
   */
  _smartInsert(basePrompt, injectionText) {
    // 尝试在RENDER或AUDIO段落之前插入
    const renderMatch = basePrompt.match(/(RENDER|AUDIO|字幕|台词)/);
    if (renderMatch) {
      const insertPos = renderMatch.index;
      return basePrompt.slice(0, insertPos) + injectionText + '\n\n' + basePrompt.slice(insertPos);
    }
    
    // 默认追加到末尾
    return basePrompt + injectionText;
  }

  /**
   * 批量增强多个镜头的prompt
   * @param {Array} shots - 镜头数组，每个包含 { shotId, basePrompt, stage9Output }
   * @returns {Array} 增强后的镜头数组
   */
  enhanceBatch(shots) {
    this.log(`批量增强 ${shots.length} 个镜头...`);
    
    return shots.map(shot => {
      const result = this.enhancePrompt(shot.basePrompt, shot.stage9Output, shot.options);
      return {
        ...shot,
        enhancedPrompt: result.enhancedPrompt,
        filmicSkills: result.usedSkills,
        injectedTerms: result.injectedTerms
      };
    });
  }

  /**
   * 获取技能库统计信息
   */
  getStats() {
    return {
      totalSkills: Object.keys(this.skills).length,
      skillNames: Object.values(this.skills).map(s => s.name),
      cachedSkills: Array.from(this.skillCache.keys()),
      libraryPath: SKILL_LIBRARY_PATH
    };
  }
}

// 导出
module.exports = {
  CinematographySkillRouter,
  MEDICAL_DOC_SKILLS
};

// 如果直接运行，打印统计信息
if (require.main === module) {
  const router = new CinematographySkillRouter({ debug: true });
  console.log('=== 医疗科普/纪录片技能库统计 ===');
  console.log(JSON.stringify(router.getStats(), null, 2));
  
  // 测试匹配
  console.log('\n=== 测试技能匹配 ===');
  const testOutput = {
    camera: 'medium_shot',
    mood: 'professional_trust',
    lighting: 'soft_natural',
    subject: 'doctor_explanation'
  };
  const match = router.matchSkills(testOutput);
  console.log('测试匹配结果:', JSON.stringify(match, null, 2));
}
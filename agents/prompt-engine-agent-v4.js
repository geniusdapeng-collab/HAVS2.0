// agents/prompt-engine-agent-v4.js
// Prompt Engine Agent v4.1 / Prompt生成引擎
// 不追求字符填满，追求信息完整、质量优先

const { LLMEngine } = require('../systems/llm-reasoning-engine');
const { safeTrimPrompt } = require('../systems/safe-prompt-trim');
const { ProductionBible, generateCharacterAnchor, generateNirathTraits } = require('../systems/production-bible');
const { getLightTierPrompt } = require('../systems/light-tier');
const PROMPT_LENGTH = require('../config/prompt-length');
const fs = require('fs');
const path = require('path');

class PromptEngineAgentV4 {
  constructor(options = {}) {
    this.engine = new LLMEngine({ model: options.model || 'kimi-k2p6' });
    this.templatePath = options.templatePath || path.join(__dirname, '../templates/prompt-v4-template.md');
    this.template = fs.readFileSync(this.templatePath, 'utf8');
  }

  /**
   * 基于Shot Card生成Prompt
   * @param {Object} shotCard - Shot Card数据
   * @param {Object} sceneCard - 关联的Scene Card（用于约束检查）
   * @returns {Object} Prompt结果
   */
  async generate(shotCard, sceneCard = null) {
    // 1. 构建8步结构数据
    const promptData = this._buildPromptData(shotCard, sceneCard);
    
    // 2. 生成初始Prompt
    let renderPrompt = this._assemblePrompt(promptData);
    
    // 3. 检查长度
    let charCount = renderPrompt.length;
    let compressionLog = [];
    
    // 4. 如果超长，按优先级压缩（不是无脑砍半，而是按重要性保留）
    if (charCount > PROMPT_LENGTH.HARD_MAX) {
      const compressed = this._compressByPriority(renderPrompt, promptData, charCount, PROMPT_LENGTH.HARD_MAX);
      renderPrompt = compressed.prompt;
      charCount = compressed.charCount;
      compressionLog = compressed.log;
    }
    
    // 5. 质量评估
    const quality = this._assessQuality(renderPrompt, promptData, charCount);
    
    return {
      renderPrompt,
      charCount,
      targetMin: PROMPT_LENGTH.TARGET_MIN,
      targetMax: PROMPT_LENGTH.TARGET_MAX,
      maxChars: PROMPT_LENGTH.HARD_MAX,
      lengthStatus: PROMPT_LENGTH.getStatus(charCount),
      compressionLog,
      quality,
      promptData,
      generationTime: new Date().toISOString(),
      sceneCardId: sceneCard?.scene_id || 'N/A',
      shotCardId: shotCard?.shot_id || 'N/A'
    };
  }

  /**
   * 构建8步Prompt数据
   */
  _buildPromptData(shotCard, sceneCard) {
    const data = {
      // 1. 主体与绑定（最高优先级）
      character_anchor: this._buildCharacterAnchor(shotCard),
      
      // 2. 主动作
      primary_action: shotCard.primary_action || 'performing key action',
      
      // 3. 表演目标
      performance_focus: shotCard.performance_goal || shotCard.emotion_target || '',
      
      // 4. 空间环境
      spatial_environment: this._buildEnvironment(shotCard, sceneCard),
      
      // 5. 镜头语言
      camera_language: this._buildCameraLanguage(shotCard),
      
      // 6. 光线与材质
      lighting_material: this._buildLighting(shotCard, sceneCard),
      
      // 7. 声音/对白
      sound_dialogue: shotCard.dialogue || shotCard.sound_events || '',
      
      // 8. 收束锚点
      closing_anchor: shotCard.efa || shotCard.transition_intent || ''
    };
    
    return data;
  }

  /**
   * 构建角色锚点
   */
  _buildCharacterAnchor(shotCard) {
    const parts = [];
    
    // 主角色
    if (shotCard.character_bindings) {
      parts.push(shotCard.character_bindings);
    } else if (shotCard.main_characters) {
      const anchors = shotCard.main_characters.map(c => generateCharacterAnchor(c)).filter(Boolean);
      parts.push(...anchors);
    }
    
    // 表演目标
    if (shotCard.performance_goal) {
      parts.push(`showing ${shotCard.performance_goal}`);
    }
    
    return parts.join(', ');
  }

  /**
   * 构建环境描述
   */
  _buildEnvironment(shotCard, sceneCard) {
    const parts = [];
    
    // 环境特征
    if (shotCard.environment_traits) {
      parts.push(shotCard.environment_traits);
    }
    
    // 空间关系
    if (shotCard.spatial_relation) {
      parts.push(shotCard.spatial_relation);
    }
    
    // Nirath特征注入
    parts.push(generateNirathTraits());
    
    return parts.join(', ');
  }

  /**
   * 构建镜头语言
   */
  _buildCameraLanguage(shotCard) {
    const parts = [];
    
    // 景别
    if (shotCard.shot_size) {
      parts.push(`${shotCard.shot_size} shot`);
    }
    
    // 机位
    if (shotCard.camera_position) {
      parts.push(shotCard.camera_position);
    }
    
    // 运镜
    if (shotCard.camera_movement) {
      parts.push(shotCard.camera_movement);
    }
    
    // 屏幕方向
    if (shotCard.screen_direction) {
      parts.push(`screen direction: ${shotCard.screen_direction}`);
    }
    
    // 第一视觉重点
    if (shotCard.primary_poi) {
      parts.push(`primary focus: ${shotCard.primary_poi}`);
    }
    
    return parts.join(', ');
  }

  /**
   * 构建光线描述
   */
  _buildLighting(shotCard, sceneCard) {
    const parts = [];
    
    // Light Tier
    const tier = shotCard.light_tier || sceneCard?.light_tier || 'A';
    parts.push(getLightTierPrompt(tier));
    
    // 材质
    if (shotCard.material_texture) {
      parts.push(shotCard.material_texture);
    }
    
    // 色彩策略
    if (sceneCard?.primary_palette) {
      parts.push(`color palette: ${sceneCard.primary_palette} + ${sceneCard.accent_color || 'neutral'}`);
    }
    
    return parts.join(', ');
  }

  /**
   * 组装Prompt
   */
  _assemblePrompt(data) {
    const parts = [];
    
    // 按8步结构组装
    if (data.character_anchor) parts.push(data.character_anchor);
    if (data.primary_action) parts.push(data.primary_action);
    if (data.performance_focus) parts.push(data.performance_focus);
    if (data.spatial_environment) parts.push(data.spatial_environment);
    if (data.camera_language) parts.push(data.camera_language);
    if (data.lighting_material) parts.push(data.lighting_material);
    if (data.sound_dialogue) parts.push(data.sound_dialogue);
    if (data.closing_anchor) parts.push(data.closing_anchor);
    
    // 系统约束注入
    parts.push(`NO: ${ProductionBible.forbidden.slice(0, 3).join(', ')}`);
    
    return parts.join(', ');
  }

  /**
   * 按优先级压缩（不是砍半，是按重要性保留）
   */
  _compressByPriority(prompt, data, originalCharCount, hardMax = 988) {
    const log = [`原始长度: ${originalCharCount}字符，启动优先级压缩`];
    let currentPrompt = prompt;
    
    // 压缩策略（按优先级从低到高）
    const compressionSteps = [
      {
        name: '删除声音',
        action: () => { data.sound_dialogue = ''; },
        priority: 8
      },
      {
        name: '简化光线',
        action: () => { 
          if (data.lighting_material) {
            data.lighting_material = data.lighting_material.substring(0, 80);
          }
        },
        priority: 7
      },
      {
        name: '简化运镜',
        action: () => {
          if (data.camera_language) {
            data.camera_language = data.camera_language.substring(0, 120);
          }
        },
        priority: 6
      },
      {
        name: '简化空间环境',
        action: () => {
          if (data.spatial_environment) {
            data.spatial_environment = data.spatial_environment.substring(0, 160);
          }
        },
        priority: 5
      },
      {
        name: '删除表演目标',
        action: () => { data.performance_focus = ''; },
        priority: 4
      }
      // 注意：主体、动作、落幅从不删除（优先级1-3）
    ];
    
    // 逐步压缩直到≤hardMax字符
    for (const step of compressionSteps) {
      if (currentPrompt.length <= hardMax) break;
      
      step.action();
      currentPrompt = this._assemblePrompt(data);
      log.push(`${step.name}: ${currentPrompt.length}字符`);
    }
    
    // 如果仍然超长，硬截断（但保留主体+动作+落幅）
    if (currentPrompt.length > hardMax) {
      currentPrompt = safeTrimPrompt(currentPrompt, hardMax, {
        protectedLabels: ['CHARACTER', 'ACTION', 'SCENE', 'CAMERA', 'LIGHTING']
      });
      log.push(`安全截断至${hardMax}字符`);
    }
    
    return {
      prompt: currentPrompt,
      charCount: currentPrompt.length,
      log
    };
  }

  /**
   * 质量评估
   */
  _assessQuality(renderPrompt, data, charCount) {
    const checks = {
      hasSubject: data.character_anchor && data.character_anchor.length > 0,
      hasAction: data.primary_action && data.primary_action.length > 0,
      hasClosing: data.closing_anchor && data.closing_anchor.length > 0,
      hasEnvironment: data.spatial_environment && data.spatial_environment.length > 0,
      hasCamera: data.camera_language && data.camera_language.length > 0,
      hasLighting: data.lighting_material && data.lighting_material.length > 0,
      withinLimit: charCount <= PROMPT_LENGTH.HARD_MAX,
      notEmpty: charCount > 100
    };
    
    const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100;
    
    return {
      score: Math.round(score),
      checks,
      assessment: score >= 80 ? '良好' : score >= 60 ? '合格' : '需优化',
      canRender: checks.hasSubject && checks.hasAction && checks.withinLimit && checks.notEmpty
    };
  }
}

module.exports = { PromptEngineAgentV4 };

// 测试
if (require.main === module) {
  async function test() {
    const agent = new PromptEngineAgentV4();
    
    const shotCard = {
      shot_id: 'SC01-S01',
      main_characters: ['xiaoG'],
      character_bindings: 'xiaoG, round face, black hair, brown eyes, khaki pants, green jacket',
      primary_action: 'walking through Lumina-velum entrance',
      performance_goal: 'curious and cautious',
      environment_traits: 'bioluminescent fungi, floating spores, crystal formations',
      spatial_relation: 'entering from left, moving toward center',
      shot_size: 'wide',
      camera_position: 'eye level',
      camera_movement: 'slow tracking shot',
      screen_direction: 'left to right',
      primary_poi: 'xiaoG',
      light_tier: 'A',
      material_texture: 'soft organic textures',
      dialogue: '',
      sound_events: 'ambient hum, spore drift',
      efa: 'xiaoG stops, looking up at towering fungi',
      transition_intent: 'cut to closer exploration'
    };
    
    const sceneCard = {
      scene_id: 'SC01',
      scene_name: '星渊初临',
      light_tier: 'A',
      primary_palette: '青灰+土褐',
      accent_color: '赤金'
    };
    
    try {
      const result = await agent.generate(shotCard, sceneCard);
      
      console.log('\n=== Prompt生成结果 ===');
      console.log('字符数:', result.charCount, `/${PROMPT_LENGTH.HARD_MAX}`);
      console.log('质量评分:', result.quality.score, result.quality.assessment);
      console.log('可渲染:', result.quality.canRender);
      console.log('压缩记录:', result.compressionLog);
      
      console.log('\n=== 8步结构 ===');
      console.log('1. 主体:', result.promptData.character_anchor?.substring(0, 50));
      console.log('2. 动作:', result.promptData.primary_action?.substring(0, 50));
      console.log('3. 表演:', result.promptData.performance_focus?.substring(0, 50));
      console.log('4. 环境:', result.promptData.spatial_environment?.substring(0, 50));
      console.log('5. 镜头:', result.promptData.camera_language?.substring(0, 50));
      console.log('6. 光线:', result.promptData.lighting_material?.substring(0, 50));
      console.log('7. 声音:', result.promptData.sound_dialogue?.substring(0, 50) || '无');
      console.log('8. 落幅:', result.promptData.closing_anchor?.substring(0, 50));
      
      console.log('\n=== 最终Prompt ===');
      console.log(result.renderPrompt.substring(0, 200) + '...');
      
    } catch (err) {
      console.error('测试失败:', err.message);
    }
  }
  
  test();
}

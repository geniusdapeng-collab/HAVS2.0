// agents/director-review-agent-v4.js
// Director Review Agent v4.1 / 导演审片Agent
// 六问审片 + 五维评分 + 阻断条件

const { LLMEngine } = require('../systems/llm-reasoning-engine');
const { calculateFiveDimensionScore, checkBlockConditions } = require('../systems/quality-scorer');
const { ProductionBible } = require('../systems/production-bible');
const fs = require('fs');
const path = require('path');

class DirectorReviewAgentV4 {
  constructor(options = {}) {
    this.engine = new LLMEngine({ model: options.model || 'kimi-k2p6' });
    this.templatePath = options.templatePath || path.join(__dirname, '../templates/director-review-form.md');
    this.template = fs.readFileSync(this.templatePath, 'utf8');
  }

  /**
   * 导演审片 - 对Shot Card进行六问审片 + 五维评分 + 阻断检查
   * @param {Object} shotCard - 待审片的Shot Card
   * @param {Object} sceneCard - 关联的Scene Card
   * @param {Array} adjacentShots - 前后镜头（用于连续性检查）
   * @returns {Object} 审片结果
   */
  async review(shotCard, sceneCard, adjacentShots = []) {
    console.log(`[DirectorReview] 🎬 开始审片: ${shotCard.shot_id}`);
    
    // 1. 六问自动评估（基于规则）
    const sixQuestions = this._evaluateSixQuestions(shotCard, sceneCard, adjacentShots);
    
    // 2. 五维评分
    const fiveDimensions = this._evaluateFiveDimensions(shotCard, sceneCard);
    
    // 3. 阻断条件检查
    const blockCheck = this._checkBlockConditions(shotCard, adjacentShots);
    
    // v6.7.0-fix8: LLM辅助审片——当规则评分边界或存在争议时，调用LLM深度分析
    let llmReview = null;
    const isBorderline = fiveDimensions.totalScore >= 55 && fiveDimensions.totalScore <= 75;
    const hasConflicts = blockCheck.details?.cameraActionConflict || (blockCheck.blocks?.length > 0);
    if (isBorderline || hasConflicts) {
      try {
        llmReview = await this._llmAssistReview(shotCard, sceneCard, adjacentShots, sixQuestions, fiveDimensions, blockCheck);
        console.log(`[DirectorReview] 🧠 LLM辅助审片完成: ${shotCard.shot_id} | 建议: ${llmReview.recommendation}`);
      } catch (e) {
        console.log(`[DirectorReview] ⚠️ LLM辅助审片失败: ${e.message} | 继续使用规则评分`);
      }
    }
    
    // 4. 导演决策（综合判断，如LLM有建议则融合）
    const decision = this._makeDecision(sixQuestions, fiveDimensions, blockCheck, llmReview);
    
    // 5. 生成审片报告
    const review = {
      shot_id: shotCard.shot_id,
      scene_id: sceneCard.scene_id,
      generation_time: new Date().toISOString(),
      
      // 六问结果
      sixQuestions,
      sixQuestionsTotal: Object.values(sixQuestions).reduce((sum, q) => sum + q.score, 0),
      
      // 五维评分
      fiveDimensions,
      
      // 阻断条件
      blockCheck,
      
      // 导演决策
      decision,
      
      // 质量追踪
      version: 'v4.1',
      status: decision.canRender ? 'approved' : 'blocked'
    };
    
    console.log(`[DirectorReview] ✅ 审片完成: ${shotCard.shot_id} | 总分: ${fiveDimensions.totalScore} | 状态: ${review.status}`);
    
    // 保存审片报告
    if (shotCard.output_path) {
      this._saveReview(review, shotCard.output_path);
    }
    
    return review;
  }

  /**
   * 六问评估
   */
  _evaluateSixQuestions(shotCard, sceneCard, adjacentShots) {
    const prevShot = adjacentShots.find(s => s.shot_id === shotCard.prev_shot_id);
    const nextShot = adjacentShots.find(s => s.shot_id === shotCard.next_shot_id);
    
    return {
      q1_existence_reason: {
        question: '这一镜存在的理由是什么？',
        answer: shotCard.narrative_purpose || '未明确',
        score: this._scoreExistenceReason(shotCard, sceneCard),
        passed: shotCard.narrative_purpose && shotCard.narrative_purpose.length > 10
      },
      q2_first_look: {
        question: '第一眼看哪里？',
        answer: shotCard.primary_poi || '未明确',
        score: this._scoreFirstLook(shotCard),
        passed: !!shotCard.primary_poi
      },
      q3_delete_loss: {
        question: '如果删掉这镜，故事损失什么？',
        answer: shotCard.narrative_purpose ? `损失：${shotCard.narrative_purpose}` : '未评估',
        score: this._scoreDeleteLoss(shotCard, sceneCard),
        passed: shotCard.is_hero_shot || shotCard.priority === 'P1' || shotCard.priority === 'P2'
      },
      q4_next_shot_connect: {
        question: '这镜的落幅能否自然接下一镜？',
        answer: shotCard.efa || '未明确落幅',
        score: this._scoreNextShotConnect(shotCard, nextShot),
        passed: !!shotCard.efa && !!shotCard.transition_intent
      },
      q5_simpler_method: {
        question: '是否存在更简单、更准确的拍法？',
        answer: '需导演主观判断',
        score: 5, // 默认中等，需导演确认
        passed: true, // 不由AI判断，标记为待确认
        needsDirectorInput: true
      },
      q6_editable_check: {
        question: '这镜是否"好剪"而不是仅仅"好看"？',
        answer: shotCard.editing_suggestion || '未评估',
        score: this._scoreEditable(shotCard, prevShot, nextShot),
        passed: !!shotCard.transition_intent
      }
    };
  }

  /**
   * 五维评分
   */
  _evaluateFiveDimensions(shotCard, sceneCard) {
    // 可读性：3秒内识别主体和动作
    const readability = shotCard.primary_poi && shotCard.primary_action ? 
      (shotCard.primary_poi.length > 0 && shotCard.primary_action.length > 5 ? 85 : 60) : 40;
    
    // 可控性：历史成功率与风险点
    const controllability = shotCard.risk_points && shotCard.risk_points.length > 0 ? 60 : 80;
    
    // 可剪性：落幅锚点清晰，转场意图明确
    const editability = shotCard.efa && shotCard.transition_intent ? 80 : 50;
    
    // 情绪命中率：与Scene Card情绪目标对比
    const emotionHit = shotCard.emotion_target && sceneCard?.emotion_end ? 
      (shotCard.emotion_target === sceneCard.emotion_end ? 90 : 70) : 50;
    
    // 记忆点：是否有"一眼难忘"元素
    const memorability = shotCard.is_hero_shot ? 85 : (shotCard.camera_movement ? 70 : 50);
    
    return calculateFiveDimensionScore({
      readability,
      controllability,
      editability,
      emotionHit,
      memorability
    });
  }

  /**
   * 阻断条件检查
   */
  _checkBlockConditions(shotCard, adjacentShots) {
    const prevShot = adjacentShots.find(s => s.shot_id === shotCard.prev_shot_id);
    const nextShot = adjacentShots.find(s => s.shot_id === shotCard.next_shot_id);
    
    const check = checkBlockConditions({
      subject: shotCard.primary_poi,
      actions: shotCard.primary_action ? [shotCard.primary_action] : [],
      cameraConflict: this._checkCameraActionConflict(shotCard),
      ofa: shotCard.ofa,
      efa: shotCard.efa,
      characters: shotCard.main_characters || [],
      primaryCharacter: shotCard.primary_poi,
      screenDirection: shotCard.screen_direction,
      nextScreenDirection: nextShot?.screen_direction,
      violations: this._checkSystemViolations(shotCard)
    });
    
    return {
      ...check,
      details: {
        hasSubject: !!shotCard.primary_poi,
        hasAction: !!shotCard.primary_action,
        hasOFA: !!shotCard.ofa,
        hasEFA: !!shotCard.efa,
        hasBinding: !!shotCard.character_bindings,
        hasTransition: !!shotCard.transition_intent,
        cameraActionConflict: this._checkCameraActionConflict(shotCard),
        systemViolations: this._checkSystemViolations(shotCard)
      }
    };
  }

  /**
   * 运镜与动作冲突检查
   */
  _checkCameraActionConflict(shotCard) {
    if (!shotCard.camera_movement || !shotCard.primary_action) return false;
    
    const camera = shotCard.camera_movement.toLowerCase();
    const action = shotCard.primary_action.toLowerCase();
    
    // 冲突模式：快速运镜 + 精细动作
    const fastCamera = ['whip', 'fast', 'rapid', 'crash'].some(c => camera.includes(c));
    const fineAction = ['whisper', 'subtle', 'delicate', 'micro'].some(a => action.includes(a));
    
    return fastCamera && fineAction;
  }

  /**
   * 安全获取Prompt文本（兼容多种字段名）
   */
  _safeGetPromptText(shotCard) {
    if (!shotCard || typeof shotCard !== 'object') return '';
    const candidates = [
      shotCard.render_prompt,
      shotCard.renderPrompt,
      shotCard.prompt,
      shotCard.visualPrompt
    ];
    for (const item of candidates) {
      if (typeof item === 'string' && item.trim()) {
        return item;
      }
    }
    return '';
  }

  /**
   * 系统违规检查
   */
  _checkSystemViolations(shotCard) {
    const violations = [];
    
    // 检查禁用元素
    const promptText = this._safeGetPromptText(shotCard);
    const forbiddenList = Array.isArray(ProductionBible?.forbidden)
      ? ProductionBible.forbidden
      : [];
    
    for (const forbidden of forbiddenList) {
      if (typeof forbidden === 'string' && forbidden && promptText.includes(forbidden)) {
        violations.push(`包含禁用元素: ${forbidden}`);
      }
    }
    
    // 检查角色一致性
    if (shotCard.character_bindings && ProductionBible?.character?.xiaoG?.anchorFeatures) {
      const required = ProductionBible.character.xiaoG.anchorFeatures;
      for (const feature of required) {
        if (typeof feature === 'string' && feature && !shotCard.character_bindings.includes(feature)) {
          violations.push(`角色绑定缺少特征: ${feature}`);
        }
      }
    }
    
    return violations;
  }

  /**
   * 导演决策（v6.7.0-fix8: 融合LLM辅助建议）
   */
  _makeDecision(sixQuestions, fiveDimensions, blockCheck, llmReview = null) {
    const sixTotal = Object.values(sixQuestions).reduce((sum, q) => sum + q.score, 0);
    const sixAverage = sixTotal / 6;
    
    // v6.7.0-fix8: 如LLM建议驳回，尊重LLM意见（边界情况人工审查）
    const llmOverride = llmReview && llmReview.recommendation === 'reject';
    const llmUpgrade = llmReview && llmReview.recommendation === 'approve';
    
    // 通过条件：
    // 1. 无阻断条件
    // 2. 五维总分≥60
    // 3. 六问平均分≥5
    // 4. LLM不驳回
    const canRender = !blockCheck.blocked && 
                       fiveDimensions.totalScore >= 60 && 
                       sixAverage >= 5 &&
                       !llmOverride;
    
    // 是否需要导演人工确认
    const needsDirectorConfirm = (sixQuestions.q5_simpler_method?.needsDirectorInput) ||
                                  fiveDimensions.totalScore < 75 ||
                                  blockCheck.blocks.length > 0 ||
                                  !!llmReview; // 有LLM建议时也需确认
    
    // v6.7.0-fix8: 融合LLM建议到导演备注
    const llmNotes = llmReview ? `\n[LLM深度分析] ${llmReview.reasoning}` : '';
    const suggestions = this._generateSuggestions(sixQuestions, fiveDimensions, blockCheck);
    if (llmReview?.suggestions) {
      suggestions.push(...llmReview.suggestions);
    }
    
    return {
      approved: canRender,
      canRender,
      needsDirectorConfirm,
      directorNotes: this._generateDirectorNotes(sixQuestions, fiveDimensions, blockCheck) + llmNotes,
      modificationSuggestions: suggestions,
      priorityAdjustment: fiveDimensions.totalScore < 60 ? 'upgrade_to_P2' : 'keep',
      llmAssisted: !!llmReview,
      llmRecommendation: llmReview?.recommendation || null
    };
  }

  /**
   * 生成导演备注
   */
  _generateDirectorNotes(sixQuestions, fiveDimensions, blockCheck) {
    const notes = [];
    
    if (fiveDimensions.totalScore < 75) {
      notes.push(`五维评分${fiveDimensions.totalScore}分，建议优化后复审`);
    }
    
    if (blockCheck.blocked) {
      notes.push(`存在阻断条件：${blockCheck.blocks.map(b => b.description).join(', ')}`);
    }
    
    if (sixQuestions.q5_simpler_method?.needsDirectorInput) {
      notes.push('问5（更简单拍法）需导演主观判断');
    }
    
    return notes.join('\n');
  }

  /**
   * 生成修改建议
   */
  _generateSuggestions(sixQuestions, fiveDimensions, blockCheck) {
    const suggestions = [];
    
    if (!sixQuestions.q2_first_look?.passed) {
      suggestions.push('明确第一视觉重点（primary_poi）');
    }
    
    if (!sixQuestions.q4_next_shot_connect?.passed) {
      suggestions.push('完善落幅锚点（EFA）和转场意图');
    }
    
    if (blockCheck.details?.cameraActionConflict) {
      suggestions.push('运镜与动作冲突，建议简化运镜或调整动作');
    }
    
    if (fiveDimensions.dimensions?.readability?.score < 70) {
      suggestions.push('提升可读性：简化主体描述，明确动作');
    }
    
    return suggestions;
  }

  /**
   * 评分辅助函数
   */
  _scoreExistenceReason(shotCard, sceneCard) {
    if (!shotCard.narrative_purpose) return 3;
    if (shotCard.is_hero_shot) return 9;
    if (shotCard.priority === 'P1') return 8;
    return 6;
  }

  _scoreFirstLook(shotCard) {
    if (!shotCard.primary_poi) return 3;
    if (shotCard.primary_poi === shotCard.main_characters?.[0]) return 9;
    return 7;
  }

  _scoreDeleteLoss(shotCard, sceneCard) {
    if (shotCard.is_hero_shot) return 10;
    if (shotCard.priority === 'P1') return 9;
    if (shotCard.priority === 'P2') return 7;
    return 5;
  }

  _scoreNextShotConnect(shotCard, nextShot) {
    if (!shotCard.efa) return 3;
    if (!shotCard.transition_intent) return 5;
    if (nextShot && shotCard.efa === nextShot.ofa) return 10;
    return 7;
  }

  _scoreEditable(shotCard, prevShot, nextShot) {
    if (!shotCard.transition_intent) return 4;
    if (shotCard.rhythm_level && shotCard.rhythm_level !== '未指定') return 7;
    return 6;
  }

  /**
   * v6.7.0-fix8: LLM辅助深度审片
   * 当规则评分边界或存在争议时，调用LLM进行深度分析
   */
  async _llmAssistReview(shotCard, sceneCard, adjacentShots, sixQuestions, fiveDimensions, blockCheck) {
    const promptText = this._safeGetPromptText(shotCard);
    const prevShot = adjacentShots.find(s => s.shot_id === shotCard.prev_shot_id);
    const nextShot = adjacentShots.find(s => s.shot_id === shotCard.next_shot_id);
    
    const prompt = `你是一位资深电影导演，请对以下镜头进行深度审片分析。

镜头信息：
- 镜头ID: ${shotCard.shot_id}
- 场景: ${sceneCard?.scene_name || '未指定'}
- 情绪目标: ${shotCard.emotion_target || '未指定'}
- 主体: ${shotCard.primary_poi || '未指定'}
- 动作: ${shotCard.primary_action || '未指定'}
- 起幅: ${shotCard.ofa || '未指定'}
- 落幅: ${shotCard.efa || '未指定'}
- 运镜: ${shotCard.camera_movement || '未指定'}
- 角色绑定: ${shotCard.character_bindings || '未指定'}
- 转场意图: ${shotCard.transition_intent || '未指定'}
- 是否英雄镜头: ${shotCard.is_hero_shot ? '是' : '否'}

相邻镜头：
- 上一镜: ${prevShot ? prevShot.shot_id + ' | ' + (prevShot.ofa || '无') : '无'}
- 下一镜: ${nextShot ? nextShot.shot_id + ' | ' + (nextShot.ofa || '无') : '无'}

规则评分结果：
- 六问总分: ${Object.values(sixQuestions).reduce((s, q) => s + q.score, 0)}/60
- 五维总分: ${fiveDimensions.totalScore}/100
- 阻断条件: ${blockCheck.blocked ? '有' : '无'}

Prompt文本（前500字）：
${promptText.substring(0, 500)}

请分析：
1. 这个镜头的叙事价值——是否值得保留？
2. 运镜与动作是否冲突？
3. 与相邻镜头的连续性如何？
4. 是否有更好的拍法？

输出JSON格式：
{
  "recommendation": "approve|reject|review",
  "reasoning": "详细分析...",
  "suggestions": ["建议1", "建议2"]
}`;

    try {
      const result = await this.engine.reasonStructured(prompt, {
        recommendation: 'review',
        reasoning: '',
        suggestions: []
      }, {
        maxTokens: 2000,
        timeoutMs: 60000
      });
      
      if (result.success && result.data) {
        return {
          recommendation: result.data.recommendation || 'review',
          reasoning: result.data.reasoning || '',
          suggestions: result.data.suggestions || []
        };
      }
      return null;
    } catch (e) {
      console.log(`[DirectorReview] ⚠️ LLM调用失败: ${e.message}`);
      return null;
    }
  }

  /**
   * 保存审片报告
   */
  _saveReview(review, outputPath) {
    const fileName = `${review.shot_id}-director-review.md`;
    const filePath = path.join(outputPath, fileName);
    
    let content = this.template;
    for (const [key, value] of Object.entries(review)) {
      const placeholder = `{${key}}`;
      if (content.includes(placeholder)) {
        const val = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '未指定');
        content = content.replace(new RegExp(placeholder, 'g'), val);
      }
    }
    
    // 清理未填充的占位符
    content = content.replace(/\{[a-z_]+\}/g, '未指定');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[DirectorReview] ✅ 审片报告已保存: ${filePath}`);
  }
}

module.exports = { DirectorReviewAgentV4 };

// 测试
if (require.main === module) {
  async function test() {
    const agent = new DirectorReviewAgentV4();
    
    const shotCard = {
      shot_id: 'SC01-S01',
      scene_id: 'SC01',
      narrative_purpose: '建立xiaoG进入Nirath世界，展示荧光平原环境',
      primary_poi: 'xiaoG',
      primary_action: 'walking through entrance',
      ofa: 'wide shot, xiaoG entering from left',
      efa: 'medium shot, xiaoG looking up',
      transition_intent: 'cut to exploration',
      emotion_target: 'curious',
      is_hero_shot: false,
      priority: 'P2',
      camera_movement: 'slow tracking',
      character_bindings: 'xiaoG, round face, black hair, brown eyes, khaki pants, green jacket',
      main_characters: ['xiaoG'],
      screen_direction: 'left to right',
      rhythm_level: '缓',
      risk_points: [],
      render_prompt: 'xiaoG walking through alien forest...',
      output_path: './output/reviews'
    };
    
    const sceneCard = {
      scene_id: 'SC01',
      scene_name: '星渊初临',
      emotion_end: 'curious',
      light_tier: 'A'
    };
    
    const adjacentShots = [
      {
        shot_id: 'SC01-S02',
        ofa: 'medium shot, xiaoG looking up',
        screen_direction: 'left to right'
      }
    ];
    
    try {
      const review = await agent.review(shotCard, sceneCard, adjacentShots);
      
      console.log('\n=== 审片结果 ===');
      console.log('镜头:', review.shot_id);
      console.log('六问总分:', review.sixQuestionsTotal, '/ 60');
      console.log('五维总分:', review.fiveDimensions.totalScore, '/ 100');
      console.log('五维等级:', review.fiveDimensions.grade.label);
      console.log('阻断状态:', review.blockCheck.blocked ? '有阻断' : '无阻断');
      console.log('是否通过:', review.decision.approved ? '通过' : '未通过');
      console.log('是否可渲染:', review.decision.canRender ? '可渲染' : '不可渲染');
      console.log('需导演确认:', review.decision.needsDirectorConfirm ? '是' : '否');
      
      console.log('\n=== 六问详情 ===');
      for (const [key, q] of Object.entries(review.sixQuestions)) {
        console.log(`${q.question}: ${q.score}/10 ${q.passed ? '✅' : '❌'}`);
      }
      
      console.log('\n=== 五维详情 ===');
      for (const [dim, data] of Object.entries(review.fiveDimensions.dimensions)) {
        console.log(`${dim}: ${data.score}分 (权重${data.weight}, 加权${data.weighted.toFixed(1)})`);
      }
      
      console.log('\n=== 阻断检查 ===');
      if (review.blockCheck.details) {
        console.log('主体:', review.blockCheck.details.hasSubject ? '✅' : '❌');
        console.log('动作:', review.blockCheck.details.hasAction ? '✅' : '❌');
        console.log('起幅:', review.blockCheck.details.hasOFA ? '✅' : '❌');
        console.log('落幅:', review.blockCheck.details.hasEFA ? '✅' : '❌');
        console.log('绑定:', review.blockCheck.details.hasBinding ? '✅' : '❌');
        console.log('转场:', review.blockCheck.details.hasTransition ? '✅' : '❌');
      }
      
      console.log('\n=== 导演建议 ===');
      console.log('备注:', review.decision.directorNotes);
      console.log('建议:', review.decision.modificationSuggestions.join(', ') || '无');
      
    } catch (err) {
      console.error('测试失败:', err.message);
    }
  }
  
  test();
}

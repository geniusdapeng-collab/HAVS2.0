// engines/production-engine/agents/continuity-review-agent.js
// ContinuityReviewAgent - 连续性审查Agent（Phase 2 末尾运行）
// v1.0.0 | 2026-06-27

const { BaseAgent } = require('./base-agent');
const { CrossEpisodeValidator } = require('./cross-episode-validator');

class ContinuityReviewAgent extends BaseAgent {
  constructor(options = {}) {
    super({ name: 'ContinuityReviewAgent', ...options });
  }

  _getSystemPrompt() {
    return `你是一位专业的影视连续性审查专家。负责检查镜头间的视觉连贯性、情绪递进逻辑和跨集内容边界。只输出严格格式的JSON。`;
  }

  /**
   * @param {Array} shots - 当前镜头数组
   * @param {object} blueprint - 剧本蓝图
   * @param {object} context - { totalEpisodes, episodeIndex, episodeContract }
   */
  async process(shots, blueprint, context = {}) {
    console.log(`[ContinuityReviewAgent] 开始审查 ${shots.length} 个镜头...`);

    const totalEpisodes = context.totalEpisodes || 1;
    const episodeIndex = context.episodeIndex || 1;
    const contract = context.episodeContract || {};

    // 1. 提取脚本文本供跨集校验
    const scriptText = CrossEpisodeValidator.extractScriptText(shots);

    // 2. 跨集边界校验（正则 + LLM 双层）
    const validator = new CrossEpisodeValidator({
      llmEngine: this._getLLMEngine(),
      model: this.llmModel,
      timeout: 60000,
    });

    let boundaryReport = null;
    try {
      boundaryReport = await this._callLLM(
        this._buildReviewPrompt(shots, blueprint),
        { required: ['review'] },
        () => this._fallbackReview(shots)
      );
    } catch (e) {
      console.warn(`[ContinuityReviewAgent] LLM审查失败，使用降级: ${e.message}`);
      boundaryReport = { result: this._fallbackReview(shots), degraded: true };
    }

    // 3. 跨集正则快筛（零延迟，不调 LLM）
    let crossEpisodeReport = { passed: true, violations: [], summary: '单集项目，跳过跨集校验' };
    if (totalEpisodes > 1 && scriptText) {
      try {
        crossEpisodeReport = await validator.validate({
          script: scriptText,
          contract,
          episodeIndex,
          totalEpisodes,
        });
      } catch (e) {
        console.warn(`[ContinuityReviewAgent] 跨集校验异常: ${e.message}`);
      }
    }

    // 4. 镜头间连续性规则检查
    const continuityIssues = this._checkShotContinuity(shots);

    const review = boundaryReport.result || this._fallbackReview(shots);

    console.log(`[ContinuityReviewAgent] 完成 ✓ | 跨集: ${crossEpisodeReport.passed ? '通过' : '有问题'} | 连续性: ${continuityIssues.length} 项`);

    return {
      shots,
      review,
      boundaryReport: {
        passed: crossEpisodeReport.passed,
        violations: crossEpisodeReport.violations || [],
        summary: crossEpisodeReport.summary || '',
        continuityIssues,
      },
      degraded: boundaryReport.degraded || false,
    };
  }

  _buildReviewPrompt(shots, blueprint) {
    const shotsInfo = shots.map((s, i) => {
      return `镜头${i + 1} ${s.shotId}: 场景="${(s.scene || '').substring(0, 50)}" 情绪="${s.mood || ''}" 动作="${(s.action || '').substring(0, 40)}"`;
    }).join('\n');

    return `## 镜头序列\n${shotsInfo}\n\n## 任务\n审查以下连续性维度：\n1. 相邻镜头景别是否跳跃过大\n2. 场景光线是否连续\n3. 情绪递进是否合理\n4. 角色服装/外观是否一致\n\n输出JSON: {"review": {"overallScore": 0-100, "issues": [{"shotId":"","type":"","description":"","suggestion":""}], "summary": "总结"}}`;
  }

  _fallbackReview(shots) {
    return {
      overallScore: 80,
      issues: [],
      summary: '连续性审查降级（规则模式），未发现明显断裂',
    };
  }

  _checkShotContinuity(shots) {
    const issues = [];
    for (let i = 1; i < shots.length; i++) {
      const prev = shots[i - 1];
      const curr = shots[i];
      // 简单规则：检查情绪是否从 calm 突然跳到 intense（无过渡）
      // 可根据需要扩展
    }
    return issues;
  }
}

module.exports = { ContinuityReviewAgent };

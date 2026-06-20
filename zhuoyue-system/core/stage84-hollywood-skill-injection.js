/**
 * Stage 8.4 好莱坞技能注入集成
 * 
 * 集成到 zhuoyue-system/core/nirath-master-pipeline.js
 * 在 Stage 9（运镜系统）之后插入
 * 
 * 使用方法：
 * 1. 在 nirath-master-pipeline.js 中引入此模块
 * 2. 在 stageCinematography() 方法末尾调用
 */

const { CinematographySkillRouter } = require('../../skills/hollywood-cinematography-factory/cinematography-skill-router');
const path = require('path');

/**
 * Stage 8.4: 好莱坞技能注入
 * 在Stage 9运镜系统完成后，增强prompt的电影级质量
 * 
 * @param {Object} pipeline - NirathMasterPipeline实例
 * @param {Object} storyboard - 故事板对象
 * @param {Object} input - 输入参数
 * @returns {Object} 增强后的故事板
 */
async function stage84HollywoodSkillInjection(pipeline, storyboard, input) {
  pipeline.log('STAGE-8.4', '好莱坞技能注入启动(医疗科普专用)');

  try {
    // 1. 初始化技能路由器
    const router = new CinematographySkillRouter({ debug: pipeline.debug || false });
    
    // 2. 检查是否有需要增强的镜头
    if (!storyboard || !storyboard.shots || storyboard.shots.length === 0) {
      pipeline.log('STAGE-8.4', '⏭️ 无镜头需要增强，跳过');
      return storyboard;
    }

    // 3. 遍历每个镜头，根据Stage 9输出增强prompt
    const enhancedShots = [];
    
    for (let i = 0; i < storyboard.shots.length; i++) {
      const shot = storyboard.shots[i];
      
      // 获取Stage 9的运镜决策（存储在shot._cinematography或类似字段）
      const stage9Output = shot._cinematography || {
        camera: shot.camera || 'medium_shot',
        mood: shot.mood || 'neutral',
        lighting: shot.lighting || 'natural',
        subject: shot.subject || 'general',
        shotType: shot.shotType || 'medium'
      };

      // 获取当前prompt（优先使用stages.style中的完整prompt）
      const basePrompt = shot._generatedPrompt || 
                         shot.prompt || 
                         (input.stages && input.stages.style && input.stages.style.prompt) ||
                         '';

      if (!basePrompt) {
        pipeline.log('STAGE-8.4', `⚠️ Shot ${i+1} 无prompt可增强，跳过`);
        enhancedShots.push(shot);
        continue;
      }

      // 4. 匹配技能并增强prompt
      const enhanceResult = router.enhancePrompt(basePrompt, stage9Output, {
        maxTerms: 3,           // 每个镜头最多注入3个术语
        injectPosition: 'end'  // 追加到prompt末尾
      });

      // 5. 更新shot的prompt和元数据
      const enhancedShot = {
        ...shot,
        _generatedPrompt: enhanceResult.enhancedPrompt,
        _filmicSkills: enhanceResult.usedSkills,
        _injectedTerms: enhanceResult.injectedTerms,
        _stage84Timestamp: new Date().toISOString()
      };

      // 关键：确保增强后的prompt写入stages.style.prompt
      // 这样Stage 8.5检查时能看到完整内容
      if (!enhancedShot.stages) enhancedShot.stages = {};
      if (!enhancedShot.stages.style) enhancedShot.stages.style = {};
      enhancedShot.stages.style.prompt = enhanceResult.enhancedPrompt;
      
      // 同时更新原始style对象（如果存在）
      if (input.stages && input.stages.style) {
        input.stages.style.prompt = enhanceResult.enhancedPrompt;
      }

      pipeline.log('STAGE-8.4', 
        `✅ Shot ${i+1} 增强完成 | ` +
        `技能: ${enhanceResult.usedSkills.map(s => s.name).join(', ') || '无'} | ` +
        `注入术语: ${enhanceResult.injectedTerms.length}个`
      );

      enhancedShots.push(enhancedShot);
    }

    // 6. 更新故事板
    const enhancedStoryboard = {
      ...storyboard,
      shots: enhancedShots,
      _stage84Applied: true,
      _stage84Timestamp: new Date().toISOString(),
      _filmicSkillsUsed: [...new Set(
        enhancedShots.flatMap(s => (s._filmicSkills || []).map(sk => sk.id))
      )]
    };

    pipeline.log('STAGE-8.4', 
      `✅ 技能注入完成 | 增强镜头: ${enhancedShots.length} | ` +
      `使用技能: ${enhancedStoryboard._filmicSkillsUsed.join(', ') || '无'}`
    );

    return enhancedStoryboard;

  } catch (err) {
    pipeline.log('STAGE-8.4', `❌ 技能注入失败: ${err.message}`);
    // 失败时返回原始故事板（不中断流水线）
    return storyboard;
  }
}

/**
 * 简化版：直接增强单个prompt
 * 用于RenderRequestBuilder等下游系统
 * 
 * @param {string} basePrompt - 基础prompt
 * @param {Object} cinematographyMeta - 运镜元数据 { camera, mood, lighting, subject }
 * @returns {Object} { enhancedPrompt, usedSkills, injectedTerms }
 */
function enhancePromptWithFilmicSkills(basePrompt, cinematographyMeta = {}) {
  try {
    const router = new CinematographySkillRouter({ debug: false });
    return router.enhancePrompt(basePrompt, cinematographyMeta, {
      maxTerms: 3,
      injectPosition: 'end'
    });
  } catch (err) {
    console.error('[Stage8.4] 增强失败:', err.message);
    return {
      enhancedPrompt: basePrompt,
      usedSkills: [],
      injectedTerms: []
    };
  }
}

/**
 * 检查技能库是否可用
 * @returns {boolean}
 */
function isSkillLibraryAvailable() {
  try {
    const router = new CinematographySkillRouter({ debug: false });
    const stats = router.getStats();
    return stats.totalSkills > 0;
  } catch (err) {
    return false;
  }
}

/**
 * 获取技能库统计信息
 * @returns {Object}
 */
function getSkillLibraryStats() {
  try {
    const router = new CinematographySkillRouter({ debug: false });
    return router.getStats();
  } catch (err) {
    return { totalSkills: 0, error: err.message };
  }
}

// 导出
module.exports = {
  stage84HollywoodSkillInjection,
  enhancePromptWithFilmicSkills,
  isSkillLibraryAvailable,
  getSkillLibraryStats
};

// 如果直接运行，打印测试信息
if (require.main === module) {
  console.log('=== Stage 8.4 技能注入模块 ===');
  console.log('技能库可用:', isSkillLibraryAvailable());
  console.log('技能库统计:', JSON.stringify(getSkillLibraryStats(), null, 2));
  
  // 测试增强
  const testPrompt = "DIRECTOR: 专业医疗科普纪录片。SCENE: 医院讲堂。CAMERA: 中景稳定。LIGHTING: 自然柔和。AUDIO: 清晰人声。RENDER: 4K高品质。";
  const testMeta = { camera: 'medium_shot', mood: 'professional', lighting: 'soft' };
  const result = enhancePromptWithFilmicSkills(testPrompt, testMeta);
  
  console.log('\n=== 测试增强结果 ===');
  console.log('原prompt长度:', testPrompt.length);
  console.log('增强后长度:', result.enhancedPrompt.length);
  console.log('使用技能:', result.usedSkills.map(s => s.name));
  console.log('注入术语:', result.injectedTerms);
}
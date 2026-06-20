/**
 * Stage 8.4 电影摄影技能注入集成
 * 
 * 集成到 zhuoyue-system/core/nirath-master-pipeline.js
 * 在 Stage 9（运镜系统）之后插入
 * 
 * 安全边界：
 * - 只影响外在表现：影视风格、运镜、灯光、美术布景
 * - 不修改内容：剧本、事实、角色、对白、品牌信息
 * - 注入方式：追加到 prompt 末尾，不替换原有内容
 */

const { CinematographySkillRouter, FILM_TYPES, CONTENT_SAFE_DIMENSIONS, EXTERIOR_DIMENSIONS } = require('../../skills/film-cinematography-factory/cinematography-skill-router');
const path = require('path');

/**
 * Stage 8.4: 电影摄影技能注入
 * 在Stage 9运镜系统完成后，增强prompt的电影级质量
 * 
 * 安全边界确认：
 * 1. 只追加不替换：技能术语追加到 prompt 末尾
 * 2. 内容隔离：不修改 SCENE/STORY/CHARACTER/DIALOGUE 等段落
 * 3. 事实保护：不修改医学术语、数据、品牌信息、产品描述
 * 4. 维度锁定：只影响 RENDER/CAMERA/LIGHTING/ART_DIRECTION 等外在维度
 * 
 * @param {Object} pipeline - NirathMasterPipeline实例
 * @param {Object} storyboard - 故事板对象
 * @param {Object} input - 输入参数
 * @returns {Object} 增强后的故事板
 */
async function stage84FilmCinematographyInjection(pipeline, storyboard, input) {
  const filmType = input.filmType || input.videoType || 'universal';
  
  pipeline.log('STAGE-8.4', `电影摄影技能注入启动 | 影片类型: ${filmType}`);
  pipeline.log('STAGE-8.4', `安全边界: 只影响外在表现(影视风格/运镜/灯光/美术), 不修改内容(剧本/事实/角色/对白)`);

  try {
    // 1. 初始化技能路由器
    const router = new CinematographySkillRouter({ debug: pipeline.debug || false });
    
    // 2. 检查影片类型是否有效，并进行映射转换
    let mappedFilmType = filmType;
    const typeMapping = {
      'EDU': 'educational',
      'edu': 'educational',
      'education': 'educational',
      'documentary': 'documentary',
      'drama': 'drama',
      'commercial': 'commercial',
      'brand': 'brand',
      'universal': 'universal'
    };
    
    if (typeMapping[filmType]) {
      mappedFilmType = typeMapping[filmType];
      if (mappedFilmType !== filmType) {
        pipeline.log('STAGE-8.4', `🔄 影片类型映射: ${filmType} → ${mappedFilmType}`);
      }
    } else if (!FILM_TYPES[mappedFilmType] && mappedFilmType !== 'universal') {
      pipeline.log('STAGE-8.4', `⚠️ 未知影片类型 "${filmType}"，使用通用类型`);
      mappedFilmType = 'universal';
    }
    
    // 3. 检查是否有需要增强的镜头
    if (!storyboard || !storyboard.shots || storyboard.shots.length === 0) {
      pipeline.log('STAGE-8.4', '⏭️ 无镜头需要增强，跳过');
      return storyboard;
    }

    // 4. 遍历每个镜头，根据Stage 9输出和影片类型增强prompt
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

      // 获取当前prompt（使用visualPrompt或description，Stage 11生成时读取）
      const basePrompt = shot._generatedPrompt || 
                         shot.prompt || 
                         shot.visualPrompt || 
                         shot.description ||
                         (input.stages && input.stages.style && input.stages.style.prompt) ||
                         '';

      if (!basePrompt) {
        pipeline.log('STAGE-8.4', `⚠️ Shot ${i+1} 无prompt可增强，跳过`);
        enhancedShots.push(shot);
        continue;
      }

      // 5. 匹配技能并增强prompt（传入映射后的影片类型）
      const enhanceResult = router.enhancePrompt(basePrompt, stage9Output, mappedFilmType, {
        maxTerms: 3,           // 每个镜头最多注入3个术语
        injectPosition: 'end'  // 安全追加到prompt末尾
      });

      // 6. 安全检查结果确认
      const safetyCheck = enhanceResult.safetyCheck || { passed: true };
      if (!safetyCheck.passed) {
        pipeline.log('STAGE-8.4', `⚠️ Shot ${i+1} 安全检查未通过: ${safetyCheck.reason}，跳过增强`);
        enhancedShots.push(shot);
        continue;
      }

      // 7. 更新shot的prompt和元数据
      const enhancedShot = {
        ...shot,
        _generatedPrompt: enhanceResult.enhancedPrompt,
        _filmicSkills: enhanceResult.usedSkills,
        _injectedTerms: enhanceResult.injectedTerms,
        _stage84Timestamp: new Date().toISOString(),
        _filmType: mappedFilmType,
        _safetyCheck: safetyCheck
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
        `影片类型: ${mappedFilmType} | ` +
        `技能: ${enhanceResult.usedSkills.map(s => s.name).join(', ') || '无'} | ` +
        `注入术语: ${enhanceResult.injectedTerms.length}个 | ` +
        `安全: ${safetyCheck.passed ? '通过' : '未通过'}`
      );

      enhancedShots.push(enhancedShot);
    }

    // 8. 更新故事板
    const enhancedStoryboard = {
      ...storyboard,
      shots: enhancedShots,
      _stage84Applied: true,
      _stage84Timestamp: new Date().toISOString(),
      _filmType: mappedFilmType,
      _filmicSkillsUsed: [...new Set(
        enhancedShots.flatMap(s => (s._filmicSkills || []).map(sk => sk.id))
      )],
      _safetyCheck: {
        passed: true,
        contentDimensions: CONTENT_SAFE_DIMENSIONS,
        exteriorDimensions: EXTERIOR_DIMENSIONS,
        injectPosition: 'end',
        filmType: mappedFilmType
      }
    };

    pipeline.log('STAGE-8.4', 
      `✅ 技能注入完成 | 影片类型: ${mappedFilmType} | 增强镜头: ${enhancedShots.length} | ` +
      `使用技能: ${enhancedStoryboard._filmicSkillsUsed.join(', ') || '无'} | ` +
      `安全边界: 只影响外在表现`
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
 * @param {string} filmType - 影片类型 (documentary/drama/commercial/brand/educational/universal)
 * @returns {Object} { enhancedPrompt, usedSkills, injectedTerms, safetyCheck }
 */
function enhancePromptWithFilmicSkills(basePrompt, cinematographyMeta = {}, filmType = 'universal') {
  try {
    const router = new CinematographySkillRouter({ debug: false });
    return router.enhancePrompt(basePrompt, cinematographyMeta, filmType, {
      maxTerms: 3,
      injectPosition: 'end'
    });
  } catch (err) {
    console.error('[Stage8.4] 增强失败:', err.message);
    return {
      enhancedPrompt: basePrompt,
      usedSkills: [],
      injectedTerms: [],
      safetyCheck: { passed: false, reason: err.message }
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

/**
 * 获取支持的影片类型
 * @returns {Object}
 */
function getSupportedFilmTypes() {
  return FILM_TYPES;
}

// 导出
module.exports = {
  stage84FilmCinematographyInjection,
  enhancePromptWithFilmicSkills,
  isSkillLibraryAvailable,
  getSkillLibraryStats,
  getSupportedFilmTypes,
  CONTENT_SAFE_DIMENSIONS,
  EXTERIOR_DIMENSIONS
};

// 如果直接运行，打印测试信息
if (require.main === module) {
  console.log('=== Stage 8.4 电影摄影技能注入模块 ===');
  console.log('技能库可用:', isSkillLibraryAvailable());
  console.log('技能库统计:', JSON.stringify(getSkillLibraryStats(), null, 2));
  console.log('支持影片类型:', JSON.stringify(getSupportedFilmTypes(), null, 2));
  
  // 测试增强 - 纪录片
  console.log('\n=== 测试增强 - 纪录片 ===');
  const testDocPrompt = "DIRECTOR: 专业医疗科普纪录片。SCENE: 医院讲堂。CAMERA: 中景稳定。LIGHTING: 自然柔和。AUDIO: 清晰人声。RENDER: 4K高品质。";
  const testDocMeta = { camera: 'medium_shot', mood: 'professional', lighting: 'soft' };
  const docResult = enhancePromptWithFilmicSkills(testDocPrompt, testDocMeta, 'documentary');
  
  console.log('原prompt长度:', testDocPrompt.length);
  console.log('增强后长度:', docResult.enhancedPrompt.length);
  console.log('使用技能:', docResult.usedSkills.map(s => s.name));
  console.log('注入术语:', docResult.injectedTerms);
  console.log('安全检查:', docResult.safetyCheck);
  
  // 测试增强 - 剧情片
  console.log('\n=== 测试增强 - 剧情片 ===');
  const testDramaPrompt = "DIRECTOR: 剧情片。SCENE: 咖啡馆对话。CHARACTER: 男女主角。DIALOGUE: 关于分手的对话。CAMERA: 正反打。LIGHTING: 柔和暖光。RENDER: 4K高品质。";
  const testDramaMeta = { camera: 'medium_shot', mood: 'dialogue', lighting: 'soft' };
  const dramaResult = enhancePromptWithFilmicSkills(testDramaPrompt, testDramaMeta, 'drama');
  
  console.log('原prompt长度:', testDramaPrompt.length);
  console.log('增强后长度:', dramaResult.enhancedPrompt.length);
  console.log('使用技能:', dramaResult.usedSkills.map(s => s.name));
  console.log('注入术语:', dramaResult.injectedTerms);
  console.log('安全检查:', dramaResult.safetyCheck);
  
  // 测试增强 - 广告片
  console.log('\n=== 测试增强 - 广告片 ===');
  const testAdPrompt = "PRODUCT: 智能手表。FEATURES: 心率监测、GPS定位。CAMERA: 特写展示。LIGHTING: 高端质感。RENDER: 4K高品质。";
  const testAdMeta = { camera: 'close_up', mood: 'premium', lighting: 'premium' };
  const adResult = enhancePromptWithFilmicSkills(testAdPrompt, testAdMeta, 'commercial');
  
  console.log('原prompt长度:', testAdPrompt.length);
  console.log('增强后长度:', adResult.enhancedPrompt.length);
  console.log('使用技能:', adResult.usedSkills.map(s => s.name));
  console.log('注入术语:', adResult.injectedTerms);
  console.log('安全检查:', adResult.safetyCheck);
}

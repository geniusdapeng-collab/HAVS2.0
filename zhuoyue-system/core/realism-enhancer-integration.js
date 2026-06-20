/**
 * 真实感提示词增强器集成示例
 * 
 * 使用方式：在 Stage 11（渲染核心/提示词生成）之前调用
 * 不改变主链路任何模块，只作为可选的后置增强层
 * 
 * 集成位置选择（按推荐顺序）：
 * 1. 【推荐】Stage 10.5（安全门）之后，Stage 11 之前
 * 2. Stage 11 内部，prompt 生成后提交前
 * 3. 预生产 CLI 输出阶段，报告生成前
 */

const { RealismPromptEnhancer } = require('./realism-prompt-enhancer');

// ==================== 集成示例 1：Stage 11 之前注入 ====================

/**
 * 在 NirathMasterPipeline 中集成（非侵入式）
 * 
 * 修改位置：nirath-master-pipeline.js 中 Stage 11 调用前
 * 修改方式：在现有代码中插入 3 行增强逻辑
 */
async function exampleIntegrationInPipeline() {
  // 1. 初始化增强器（在 pipeline 构造函数中）
  const realismEnhancer = new RealismPromptEnhancer({
    enabled: true,
    injectPosition: 'suffix',    // 追加到提示词末尾
    maxInjectLength: 800,        // 最大注入长度
    minDimensionCoverage: 4,     // 低于4维触发补全
    autoDetectScene: true        // 自动检测场景类型
  });

  // 2. 在 Stage 11 之前增强每个镜头的 prompt
  // 假设 shot 是故事板中的一个镜头
  const shot = {
    prompt: "A nurse in uniform standing in hospital corridor, professional lighting, perfect skin",
    description: "Hospital corridor scene with nurse",
    type: "medium_shot"
  };

  // 3. 调用增强器
  const result = realismEnhancer.enhance(shot.prompt, {
    sceneType: 'portrait',      // 可选：指定场景类型
    filmType: 'EDU',            // 可选：影片类型
    characterType: 'human'      // 可选：角色类型
  });

  // 4. 使用增强后的提示词
  if (result.applied) {
    console.log('✅ 真实感增强已应用');
    console.log('增强内容:', result.changes);
    console.log('七维覆盖度:', result.coverage, '/8');
    
    // 替换原始 prompt
    shot.prompt = result.enhanced;
  }

  return shot;
}

// ==================== 集成示例 2：CLI 预生产输出阶段 ====================

/**
 * 在 run-preproduction-v3.js 中，报告生成前增强所有 prompt
 */
async function exampleIntegrationInCLI() {
  const realismEnhancer = new RealismPromptEnhancer();

  // 假设已有预生产结果
  const preproductionResult = {
    shots: [
      { id: 'S01', prompt: 'Opening shot...' },
      { id: 'S02', prompt: 'Character introduction...' },
      // ...
    ]
  };

  // 增强所有镜头
  for (const shot of preproductionResult.shots) {
    const enhanced = realismEnhancer.enhance(shot.prompt, {
      autoDetectScene: true  // 自动检测
    });
    
    if (enhanced.applied) {
      shot.prompt = enhanced.enhanced;
      shot._realismEnhancement = enhanced.metadata; // 记录元数据
    }
  }

  return preproductionResult;
}

// ==================== 集成示例 3：独立测试工具 ====================

/**
 * 独立测试：验证真实感增强效果
 */
async function testEnhancement() {
  const enhancer = new RealismPromptEnhancer();

  const testCases = [
    {
      name: '高AI感提示词',
      prompt: 'Perfect skin, vivid colors, studio lighting, static pose, photorealistic',
      expected: '应替换禁忌词并补充七维参数'
    },
    {
      name: '部分覆盖提示词',
      prompt: 'Arri Alexa 65, natural light, shallow DOF',
      expected: '应补充缺失的 lens/color/material/motion/grain'
    },
    {
      name: '完整提示词',
      prompt: 'Arri Alexa 65, Cooke S7/i, f/2.0 shallow DOF, natural diffused overcast, muted earth tones, skin pores, wind blowing hair, subtle film grain',
      expected: '不应触发增强（覆盖度已足够）'
    }
  ];

  for (const test of testCases) {
    console.log(`\n--- 测试: ${test.name} ---`);
    console.log(`输入: ${test.prompt}`);
    
    const result = enhancer.enhance(test.prompt, { sceneType: 'portrait' });
    
    console.log(`覆盖度: ${result.coverage}/8`);
    console.log(`增强: ${result.applied ? '是' : '否'}`);
    console.log(`变化: ${JSON.stringify(result.changes, null, 2)}`);
    console.log(`输出: ${result.enhanced.substring(0, 200)}...`);
  }
}

// ==================== 集成示例 4：批量增强故事板 ====================

/**
 * 批量增强整个故事板的所有镜头
 */
async function enhanceStoryboard(storyboard, options = {}) {
  const enhancer = new RealismPromptEnhancer(options);
  const stats = {
    totalShots: 0,
    enhancedShots: 0,
    totalCoverage: 0,
    changes: []
  };

  if (!storyboard || !storyboard.shots) return storyboard;

  for (const shot of storyboard.shots) {
    stats.totalShots++;

    const result = enhancer.enhance(shot.prompt || '', {
      sceneType: options.sceneType || 'auto',
      filmType: options.filmType
    });

    if (result.applied) {
      shot.prompt = result.enhanced;
      shot._realismMeta = {
        coverage: result.coverage,
        changes: result.changes.map(c => c.type),
        version: result.metadata.enhancerVersion
      };
      stats.enhancedShots++;
      stats.totalCoverage += result.coverage;
    }
  }

  storyboard._realismStats = stats;
  return storyboard;
}

// ==================== 导出 ====================
module.exports = {
  exampleIntegrationInPipeline,
  exampleIntegrationInCLI,
  testEnhancement,
  enhanceStoryboard
};

// 如果直接运行，执行测试
if (require.main === module) {
  testEnhancement().catch(console.error);
}

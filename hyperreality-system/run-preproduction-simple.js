const { HyperrealitySystem } = require('./index');
const fs = require('fs');
const path = require('path');

async function main() {
  const outputDir = './output/health-edu-ep01-havs';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const system = new HyperrealitySystem({
    version: 'v2.1.5',
    scriptEngine: {
      charactersDir: path.join(__dirname, '../characters')
    },
    productionEngine: {
      charactersDir: path.join(__dirname, '../characters')
    },
    renderingEngine: {
      charactersDir: path.join(__dirname, '../characters')
    }
  });

  const intent = '创作一集健康科普短视频，主题：什么是横纹肌溶解——横纹肌溶解的症状以及实验室检查。主讲人为穿警服的陈卓女士，讲解居民健康护理知识，进行全民健康科普。单人口播讲解，生动形象，带有自然的肢体语言。要求全写实风格，质感拉满的画质，好莱坞大导演风格。';

  const metadata = {
    title: '什么是横纹肌溶解——横纹肌溶解的症状以及实验室检查',
    target_duration: 62,
    series: '健康科普系列',
    episode: 1,
    totalEpisodes: 3,
    videoType: 'EDU',
    creativityIndex: 0.98,
    aspectRatio: '16:9',
    visualStyle: 'realistic',
    qualityLevel: 'high',
    characters: [
      {
        id: 'chen-zhuo',
        name: '陈卓',
        role: 'host',
        description: '穿警服的陈卓女士，警务系统护士，讲解居民健康护理知识',
        style: 'professional',
        portraits: {
          front: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/front.png',
          threeQuarter: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/threeQuarter.png',
          closeup: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/closeup.png',
          side: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/side.png'
        }
      }
    ],
    scenes: [
      { id: 'opening', name: '片头', type: 'opening', duration: 8 },
      { id: 'symptom', name: '症状讲解', type: 'explanation', duration: 20 },
      { id: 'lab', name: '实验室检查', type: 'explanation', duration: 20 },
      { id: 'warning', name: '警示', type: 'warning', duration: 10 },
      { id: 'ending', name: '结尾', type: 'ending', duration: 4 }
    ],
    style: {
      primary: 'REAL',
      secondary: 'NAT',
      description: '写实纪实风格,真实可信的纪实风格,增强专业信任感'
    },
    constraints: {
      noTextInFrame: true,
      noWatermark: true,
      realisticOnly: true,
      characterConsistency: true
    }
  };

  try {
    console.log('🔥 [HAVS Preproduction] 开始运行');
    console.log('   项目:', metadata.title);
    console.log('   预生产模式: 跳过渲染和后期');
    console.log('   确认文件已预置: auto-approved');
    console.log('');

    const result = await system.create(
      intent,
      metadata,
      {
        skipRendering: true,
        skipPostProduction: true,
        skipPromptReview: true,
        skipFieldQuality: true,
        enableCheckpoint: true,
        checkpointDir: outputDir,
        confirmationFile: path.join(outputDir, 'confirmation.json')
      }
    );

    console.log('\n✅ 预生产完成');
    console.log('结果:', JSON.stringify({
      success: result.success,
      stages: Object.keys(result.stages || {}),
      duration: result.duration,
      errors: result.errors?.length || 0
    }, null, 2));

    if (result.stages?.productionEngine?.prompts) {
      const promptsPath = path.join(outputDir, 'prompts.json');
      fs.writeFileSync(promptsPath, JSON.stringify(result.stages.productionEngine.prompts, null, 2));
      console.log('提示词已保存:', promptsPath);
    }

    if (result.stages?.scriptEngine?.blueprint) {
      const scriptPath = path.join(outputDir, 'script.json');
      fs.writeFileSync(scriptPath, JSON.stringify(result.stages.scriptEngine.blueprint, null, 2));
      console.log('剧本已保存:', scriptPath);
    }

  } catch (error) {
    console.error('❌ 预生产失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

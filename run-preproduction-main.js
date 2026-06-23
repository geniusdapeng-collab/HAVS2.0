const fs = require('fs');
const path = require('path');
const { NirathMasterPipeline } = require('./zhuoyue-system/core/nirath-master-pipeline.js');

const WORKSPACE = '/root/.openclaw/workspace';
const OUTPUT = path.join(WORKSPACE, 'output', 'health-edu-ep01');
const CHECKPOINT_FILE = path.join(OUTPUT, 'checkpoint.json');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT)) {
  fs.mkdirSync(OUTPUT, { recursive: true });
}

// 阶段定义（按执行顺序）
const STAGE_ORDER = [
  { id: '1', name: 'PRD生成', method: 'stagePRD' },
  { id: '2', name: '需求对齐', method: 'stageRequirementAlignment' },
  { id: '3', name: 'Schema校验', method: 'stageSchemaValidation' },
  { id: '4', name: '角色系统', method: 'stageCharacterSystem' },
  { id: '5A', name: '剧本生成', method: 'stageScriptGeneration' },
  { id: '5B', name: '视觉提示词', method: 'stageVisualPromptGeneration' },
  { id: '6', name: '时长分配', method: 'stageDurationAllocation' },
  { id: '7', name: '故事板', method: 'stageStoryboard' },
  { id: '8', name: '技能注入', method: 'stageFilmCinematographySkills' },
  { id: '9', name: '运镜系统', method: 'stageCameraMovement' },
  { id: '10', name: '灯光设计', method: 'stageLightingDesign' },
  { id: '11', name: '渲染核心', method: 'stageRender' },
  { id: '12', name: '音频设计', method: 'stageAudioDesign' },
  { id: '13', name: '情绪校准', method: 'stageEmotionCalibration' },
  { id: '14', name: '时长验证', method: 'stageDurationValidation' },
  { id: '15', name: '完整性验证', method: 'stageIntegrityValidation' },
  { id: '16', name: '报告生成', method: 'generateReport' }
];

class CheckpointManager {
  constructor() {
    this.checkpoint = this.loadCheckpoint();
    this.startTime = Date.now();
  }

  loadCheckpoint() {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      const cp = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
      console.log(`📍 恢复断点: 已完成 ${cp.completedStages.length}/${STAGE_ORDER.length} 阶段`);
      return cp;
    }
    return { completedStages: [], stageResults: {}, startTime: Date.now() };
  }

  saveCheckpoint(stageId, result) {
    this.checkpoint.completedStages.push(stageId);
    this.checkpoint.stageResults[stageId] = {
      timestamp: Date.now(),
      success: true,
      data: result
    };
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(this.checkpoint, null, 2));
  }

  isStageCompleted(stageId) {
    return this.checkpoint.completedStages.includes(stageId);
  }

  checkTimeout() {
    const elapsed = Date.now() - this.startTime;
    // 500秒安全线（预留100秒余量应对600秒exec限制）
    if (elapsed > 500000) {
      console.log(`⏰ 已运行 ${(elapsed/1000).toFixed(1)} 秒，接近安全时间线，保存断点并退出`);
      return true;
    }
    return false;
  }

  getCompletedStages() {
    return this.checkpoint.completedStages;
  }

  clear() {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      fs.unlinkSync(CHECKPOINT_FILE);
    }
  }
}

async function runPreproduction() {
  const checkpoint = new CheckpointManager();
  
  console.log('🎬 =========================================');
  console.log('🎬 卓越系统 v6.5.64-P2 - 断点保存预生产');
  console.log('🎬 =========================================');
  console.log(`⏱️ 开始时间: ${new Date().toLocaleString()}`);
  console.log(`📊 已完成的阶段: ${checkpoint.getCompletedStages().length}/${STAGE_ORDER.length}`);
  console.log('');

  // 读取用户需求解析结果
  const parsedPath = path.join(OUTPUT, 'user-requirement-parsed.json');
  if (!fs.existsSync(parsedPath)) {
    console.error('❌ 未找到解析结果:', parsedPath);
    process.exit(1);
  }

  const parsedRequirement = JSON.parse(fs.readFileSync(parsedPath, 'utf-8'));
  console.log('✅ 已恢复用户需求解析结果');
  console.log('  标题:', parsedRequirement.title);
  console.log('  场景数:', parsedRequirement.scenes.length);
  console.log('');

  // 构建Pipeline输入
  const input = buildPipelineInput(parsedRequirement);
  
  // 创建Pipeline
  const pipeline = new NirathMasterPipeline({
    mode: 'generic',
    useLLM: true,
    skipDirectorReview: false,
    skipScreenwriterOptimization: false,
    projectConfig: {
      requiredCharacters: ['chen-zhuo'],
      targetDuration: parsedRequirement.targetDuration,
      hasOpening: parsedRequirement.opening.hasOpening,
      hasNextEpisodePreview: false,
      isPreProduction: true
    }
  });

  let result = {
    stages: {},
    success: false,
    errors: []
  };

  // 尝试从已有结果加载
  const resultFile = path.join(OUTPUT, 'preproduction-result.json');
  if (fs.existsSync(resultFile)) {
    try {
      const savedResult = JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
      if (savedResult.stages) {
        result = savedResult;
        console.log('📁 已加载之前保存的结果');
      }
    } catch (e) {
      console.log('⚠️ 无法加载之前的结果');
    }
  }

  // 执行阶段
  for (const stage of STAGE_ORDER) {
    if (checkpoint.isStageCompleted(stage.id)) {
      console.log(`⏭️ ${stage.id} ${stage.name} - 已跳过（已完成）`);
      continue;
    }

    console.log(`🔄 ${stage.id} ${stage.name} - 开始执行...`);
    const stageStart = Date.now();

    try {
      let stageResult;
      
      // 调用Pipeline的对应阶段方法
      if (stage.id === '1') {
        stageResult = await pipeline.stagePRD(input);
      } else if (stage.id === '2') {
        stageResult = await pipeline.stageRequirementAlignment(result.stages['1'] || input);
      } else if (stage.id === '3') {
        stageResult = await pipeline.stageSchemaValidation(result.stages['2'] || result.stages['1'] || input);
      } else if (stage.id === '4') {
        stageResult = await pipeline.stageCharacterSystem(input);
      } else if (stage.id === '5A') {
        stageResult = await pipeline.stageScriptGeneration(input);
      } else if (stage.id === '5B') {
        // Stage 5B: 视觉提示词生成 - 分批处理，每批3个场景
        stageResult = await runStage5BWithCheckpoint(pipeline, result, input, checkpoint);
      } else if (stage.id === '6') {
        stageResult = await pipeline.stageDurationAllocation(result.stages['5A'], input);
      } else if (stage.id === '7') {
        stageResult = await pipeline.stageStoryboard(result.stages['5A'], result.stages['6'], input);
      } else if (stage.id === '8') {
        stageResult = await pipeline.stageFilmCinematographySkills(result.stages['7']);
      } else if (stage.id === '9') {
        stageResult = await pipeline.stageCameraMovement(result.stages['7'], result.stages['fpvDecision'], result.stages['6']);
      } else if (stage.id === '10') {
        stageResult = await pipeline.stageLightingDesign(result.stages['7']);
      } else if (stage.id === '11') {
        stageResult = await pipeline.stageRender(result.stages);
      } else if (stage.id === '12') {
        stageResult = await pipeline.stageAudioDesign(result.stages['11']);
      } else if (stage.id === '13') {
        stageResult = await pipeline.stageEmotionCalibration(result.stages['7']);
      } else if (stage.id === '14') {
        stageResult = await pipeline.stageDurationValidation(result.stages['7'], result.stages['6']);
      } else if (stage.id === '15') {
        stageResult = await pipeline.stageIntegrityValidation(result.stages);
      } else if (stage.id === '16') {
        stageResult = await generateFinalReport(result, input);
      }

      result.stages[stage.id] = stageResult;
      
      // 保存阶段结果
      checkpoint.saveCheckpoint(stage.id, stageResult);
      
      // 保存完整结果
      fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
      
      const duration = (Date.now() - stageStart) / 1000;
      console.log(`✅ ${stage.id} ${stage.name} - 完成 (${duration.toFixed(1)}s)`);
      console.log('');

      // 检查是否超时
      if (checkpoint.checkTimeout()) {
        console.log('⏰ 保存断点，准备退出...');
        console.log(`📍 当前进度: ${checkpoint.getCompletedStages().length}/${STAGE_ORDER.length}`);
        
        // 生成临时报告
        generatePartialReport(result, path.join(OUTPUT, 'preproduction-report.md'));
        
        process.exit(0);
      }
    } catch (error) {
      console.error(`❌ ${stage.id} ${stage.name} - 失败: ${error.message}`);
      result.errors.push({ stage: stage.id, error: error.message });
      
      // 保存错误状态
      checkpoint.saveCheckpoint(stage.id, { error: error.message });
      fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
      
      throw error;
    }
  }

  // 所有阶段完成
  result.success = true;
  fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
  
  // 清除断点
  checkpoint.clear();
  
  console.log('');
  console.log('🎉 预生产完成！所有阶段已执行');
  console.log(`⏱️ 总耗时: ${((Date.now() - checkpoint.startTime) / 1000).toFixed(1)} 秒`);
  
  // 生成最终报告
  generateFinalReport(result, input);
  
  return result;
}

// Stage 5B 分批处理（避免OOM）
async function runStage5BWithCheckpoint(pipeline, result, input, checkpoint) {
  const scenes = input.scenes || [];
  const batchSize = 3; // 每批3个场景
  const totalBatches = Math.ceil(scenes.length / batchSize);
  
  console.log(`🎬 Stage 5B: 视觉提示词生成 (${scenes.length} 场景，分 ${totalBatches} 批)`);
  
  let allPrompts = [];
  
  for (let i = 0; i < totalBatches; i++) {
    const batch = scenes.slice(i * batchSize, (i + 1) * batchSize);
    console.log(`  🔄 批次 ${i + 1}/${totalBatches}: ${batch.map(s => s.id).join(', ')}`);
    
    // 为每个场景生成视觉提示词
    const batchPrompts = await generateVisualPromptsBatch(pipeline, batch, input);
    allPrompts = allPrompts.concat(batchPrompts);
    
    console.log(`  ✅ 批次 ${i + 1} 完成 (${batchPrompts.length} 个提示词)`);
    
    // 批次间强制GC
    if (global.gc) {
      global.gc();
    }
    
    // 检查时间
    if (checkpoint.checkTimeout()) {
      console.log('⏰ 批次处理中时间不足，保存断点');
      // 保存已完成的批次
      checkpoint.saveCheckpoint('5B-partial', { completedBatches: i + 1, prompts: allPrompts });
      process.exit(0);
    }
  }
  
  return { prompts: allPrompts, totalScenes: scenes.length };
}

async function generateVisualPromptsBatch(pipeline, scenes, input) {
  const prompts = [];
  
  for (const scene of scenes) {
    const prompt = await pipeline.stageVisualPromptGeneration(scene, input);
    prompts.push({ sceneId: scene.id, prompt });
  }
  
  return prompts;
}

function buildPipelineInput(parsedRequirement) {
  const PORTRAIT_BASE = path.join(WORKSPACE, 'characters/chenzhuo/portraits');
  const UNIFORM_DIR = path.join(PORTRAIT_BASE, 'uniform');

  const CHENZHUO_PORTRAITS = {
    front: path.join(UNIFORM_DIR, 'portrait-uniform-02.jpg'),
    threeQuarter: path.join(UNIFORM_DIR, 'portrait-uniform-01.jpg'),
    side: path.join(UNIFORM_DIR, 'portrait-uniform-04.jpg'),
    closeup: path.join(UNIFORM_DIR, 'portrait-uniform-05.jpg'),
    fullBody: path.join(UNIFORM_DIR, 'portrait-uniform-02.jpg'),
    back: path.join(UNIFORM_DIR, 'portrait-uniform-03.jpg')
  };

  return {
    projectName: parsedRequirement.title,
    videoType: parsedRequirement.videoType.toLowerCase(),
    targetDuration: parsedRequirement.targetDuration,
    style: parsedRequirement.style.visualStyle || parsedRequirement.visualStyleDetail,
    mode: 'generic',
    hasOpening: parsedRequirement.opening.hasOpening,
    hasNextEpisodePreview: false,
    creativityIndex: parsedRequirement.creativityIndex,
    title: parsedRequirement.title,
    topic: parsedRequirement.topic,
    keyPoints: parsedRequirement.keyPoints,
    targetAudience: parsedRequirement.targetAudience,
    platform: parsedRequirement.platform,
    aspectRatio: parsedRequirement.aspectRatio,
    visualStyle: parsedRequirement.visualStyle,
    qualityLevel: parsedRequirement.qualityLevel,
    colorTone: parsedRequirement.colorTone,
    narrativeStyle: parsedRequirement.narrativeStyle,
    contentStyle: parsedRequirement.contentStyle,
    musicStyle: parsedRequirement.musicStyle,
    world: parsedRequirement.world,
    scenes: parsedRequirement.scenes.map((scene, index) => ({
      id: scene.id || `S0${index+1}`,
      name: scene.name || `场景${index+1}`,
      type: scene.type || 'content',
      duration: scene.duration || 10,
      description: scene.description || '',
      characters: scene.characters || [],
      visualComplexity: scene.visualComplexity || 5,
      importance: scene.importance || 5
    })),
    characters: {
      'chen-zhuo': {
        id: 'chen-zhuo', name: '陈卓', role: 'presenter',
        visual: {
          age: 35, gender: 'female', build: 'average', height: 'medium',
          skinTone: 'warm', hair: 'black', eyes: 'brown', facialFeatures: 'asian',
          outfit: 'standard Chinese police uniform with formal police cap'
        },
        portraits: CHENZHUO_PORTRAITS
      }
    },
    opening: {
      seriesTitle: '居民健康科普系列',
      episodeTitle: parsedRequirement.title,
      episodeNumber: `EP0${parsedRequirement.currentEpisode || 1}`,
      subtitle: parsedRequirement.topic,
      style: parsedRequirement.visualStyleDetail,
      duration: parsedRequirement.opening.duration || 5
    },
    content: {
      topic: parsedRequirement.topic,
      keyPoints: parsedRequirement.keyPoints
    },
    isSeries: parsedRequirement.isSeries,
    totalEpisodes: parsedRequirement.totalEpisodes,
    currentEpisode: parsedRequirement.currentEpisode,
    episodeThemes: parsedRequirement.episodeThemes
  };
}

function generatePartialReport(result, outputPath) {
  let md = `# 预生产报告 (部分完成)\n\n`;
  md += `**状态**: 执行中\n\n`;
  md += `**已完成阶段**: ${Object.keys(result.stages).join(', ')}\n\n`;
  md += `**错误**: ${result.errors.length > 0 ? result.errors.map(e => e.message).join('; ') : '无'}\n\n`;
  md += `---\n\n`;
  md += `> 请继续执行以完成剩余阶段\n\n`;
  
  fs.writeFileSync(outputPath, md);
  console.log(`📄 临时报告已保存: ${outputPath}`);
}

function generateFinalReport(result, input) {
  const storyboard = result.stages?.['7'];
  if (!storyboard) {
    console.log('⚠️ 未找到故事板数据');
    return null;
  }

  const shots = storyboard.shots || [];
  const totalDuration = shots.reduce((sum, s) => sum + (s.duration || 0), 0);

  let md = `# 健康科普系列 - 第一集预生产报告\n\n`;
  md += `**主讲**: 陈卓（穿警服的护士小姐姐）\n\n`;
  md += `**总时长**: ${totalDuration} 秒\n\n`;
  md += `**镜头数**: ${shots.length}\n\n`;

  md += `---\n\n`;

  if (shots.length > 0) {
    md += `## 镜头列表\n\n`;
    for (const shot of shots) {
      md += `### ${shot.id || '未知'}\n\n`;
      md += `- **时长**: ${shot.duration || 0}秒\n`;
      md += `- **类型**: ${shot.type || '未知'}\n`;
      md += `- **画面**: ${shot.description || '无描述'}\n\n`;
      if (shot.narration) {
        md += `**旁白**: ${shot.narration}\n\n`;
      }
      if (shot.prompt) {
        md += `**提示词**: ${shot.prompt.substring(0, 200)}...\n\n`;
      }
    }
  }

  const reportPath = path.join(OUTPUT, 'preproduction-report.md');
  fs.writeFileSync(reportPath, md);
  console.log(`✅ 最终报告已保存: ${reportPath}`);
  
  return reportPath;
}

// 执行
runPreproduction().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

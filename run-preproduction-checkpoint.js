// run-preproduction-checkpoint.js
// 阶段级断点保存预生产脚本
// 解决单次exec 300秒超时限制

const fs = require('fs');
const path = require('path');
const { NirathMasterPipeline } = require('./zhuoyue-system/core/nirath-master-pipeline.js');

const WORKSPACE = '/root/.openclaw/workspace';
const OUTPUT = path.join(WORKSPACE, 'output', 'health-edu-ep01');
const CHECKPOINT_FILE = path.join(OUTPUT, 'checkpoint.json');
const PARSED_FILE = path.join(OUTPUT, 'user-requirement-parsed.json');

// 阶段定义（按执行顺序）
const STAGES = [
  { id: '0', name: '用户需求解析', method: 'stageUserRequirementParse', skipable: true },
  { id: '1', name: 'PRD生成', method: 'stagePRD', skipable: false },
  { id: '2', name: '需求对齐', method: 'stageRequirementAlignment', skipable: false },
  { id: '3', name: 'Schema校验', method: 'stageSchemaValidation', skipable: false },
  { id: '4', name: '角色系统', method: 'stageCharacterSystem', skipable: false },
  { id: '5A', name: '世界观构建', method: 'stageWorldBuilding', skipable: false },
  { id: '5B', name: '视觉提示生成', method: 'stageVisualPromptGeneration', skipable: false },
  { id: '6', name: '时长分配', method: 'stageDurationAllocation', skipable: false },
  { id: '7', name: '故事板', method: 'stageStoryboard', skipable: false },
  { id: '8', name: '技能注入', method: 'stageFilmCinematographySkills', skipable: false },
  { id: '9', name: '运镜系统', method: 'stageCameraMovement', skipable: false },
  { id: '10', name: '灯光设计', method: 'stageLightingDesign', skipable: false },
  { id: '11', name: '渲染核心', method: 'stageRenderOptimization', skipable: false },
  { id: '12', name: '音频设计', method: 'stageAudioDesign', skipable: false },
  { id: '13', name: '情绪校准', method: 'stageEmotionCalibration', skipable: false },
  { id: '14', name: '时长验证', method: 'stageDurationValidation', skipable: false },
  { id: '15', name: '完整性验证', method: 'stageIntegrityValidation', skipable: false },
  { id: '16', name: '报告生成', method: 'stageReportGeneration', skipable: false }
];

class CheckpointPipeline {
  constructor() {
    this.checkpoint = this.loadCheckpoint();
    this.pipeline = new NirathMasterPipeline({
      mode: 'generic',
      useLLM: true,
      skipDirectorReview: false,
      skipScreenwriterOptimization: false
    });
  }

  loadCheckpoint() {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
    }
    return { stages: {}, currentStage: null, completed: false, startTime: Date.now() };
  }

  saveCheckpoint() {
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(this.checkpoint, null, 2));
  }

  async runStage(stageId, stageMethod, input, context) {
    // 检查是否已完成
    if (this.checkpoint.stages[stageId] === 'completed') {
      console.log(`⏭️ Stage ${stageId} 已跳过（已完成）`);
      return { skipped: true, data: this.loadStageResult(stageId) };
    }

    // 标记为运行中
    this.checkpoint.currentStage = stageId;
    this.checkpoint.stages[stageId] = 'running';
    this.saveCheckpoint();

    console.log(`🔄 Stage ${stageId} 开始执行...`);
    const startTime = Date.now();

    try {
      // 检查剩余时间
      const elapsed = (Date.now() - this.checkpoint.startTime) / 1000;
      if (elapsed > 240) { // 240秒 = 4分钟，留60秒安全余量
        console.log(`⏰ 剩余时间不足，安全退出。已运行 ${elapsed.toFixed(1)} 秒`);
        process.exit(0); // 优雅退出，下次从断点继续
      }

      const result = await this.pipeline[stageMethod](input, context);
      
      // 保存阶段结果
      this.saveStageResult(stageId, result);
      this.checkpoint.stages[stageId] = 'completed';
      this.checkpoint.currentStage = null;
      this.saveCheckpoint();

      const duration = (Date.now() - startTime) / 1000;
      console.log(`✅ Stage ${stageId} 完成 (${duration.toFixed(1)}s)`);
      return { success: true, data: result };
    } catch (error) {
      this.checkpoint.stages[stageId] = 'failed';
      this.checkpoint.errors = this.checkpoint.errors || [];
      this.checkpoint.errors.push({ stage: stageId, error: error.message, time: Date.now() });
      this.saveCheckpoint();
      console.error(`❌ Stage ${stageId} 失败: ${error.message}`);
      throw error;
    }
  }

  saveStageResult(stageId, result) {
    const file = path.join(OUTPUT, `stage-${stageId}-result.json`);
    fs.writeFileSync(file, JSON.stringify(result, null, 2));
  }

  loadStageResult(stageId) {
    const file = path.join(OUTPUT, `stage-${stageId}-result.json`);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    return null;
  }

  async run() {
    console.log('🎬 =========================================');
    console.log('🎬 卓越系统 v6.5.64-P2 - 断点保存预生产');
    console.log('🎬 =========================================');
    console.log(`📁 Checkpoint: ${CHECKPOINT_FILE}`);
    console.log(`📊 已完成的阶段: ${Object.entries(this.checkpoint.stages).filter(([k,v]) => v === 'completed').length}/${STAGES.length}`);
    console.log('');

    // 读取解析结果
    if (!fs.existsSync(PARSED_FILE)) {
      console.error('❌ 未找到解析结果:', PARSED_FILE);
      process.exit(1);
    }

    const parsedRequirement = JSON.parse(fs.readFileSync(PARSED_FILE, 'utf-8'));
    console.log('✅ 已恢复用户需求解析结果');

    // 构建输入
    const input = this.buildPipelineInput(parsedRequirement);
    let context = { stages: {} };

    // 按顺序执行阶段
    for (const stage of STAGES) {
      try {
        const result = await this.runStage(stage.id, stage.method, input, context);
        if (result.skipped) {
          context.stages[stage.method] = result.data;
        } else if (result.success) {
          context.stages[stage.method] = result.data;
        }
      } catch (error) {
        console.error(`⚠️ Stage ${stage.id} 执行失败，终止`);
        process.exit(1);
      }
    }

    // 所有阶段完成
    this.checkpoint.completed = true;
    this.checkpoint.endTime = Date.now();
    this.saveCheckpoint();

    console.log('');
    console.log('🎉 预生产完成！所有阶段已执行');
    console.log(`📊 总耗时: ${((this.checkpoint.endTime - this.checkpoint.startTime) / 1000).toFixed(1)} 秒`);
    
    // 生成报告
    this.generateReport(context);
  }

  buildPipelineInput(parsedRequirement) {
    // 简化版输入构建（复用resume脚本逻辑）
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

  generateReport(context) {
    const storyboard = context.stages?.stageStoryboard;
    if (!storyboard) {
      console.log('⚠️ 未找到故事板数据');
      return;
    }

    const shots = storyboard.shots || [];
    const totalDuration = shots.reduce((sum, s) => sum + (s.duration || 0), 0);

    let md = `# 健康科普系列 - 第一集预生产报告

`;
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
    console.log(`✅ 报告已保存: ${reportPath}`);
  }
}

// 执行
const cp = new CheckpointPipeline();
cp.run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

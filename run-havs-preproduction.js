// run-havs-preproduction.js
// HAVS v2.0 预生产运行脚本（修复版）

const path = require('path');
const fs = require('fs');

const outputDir = '/root/.openclaw/workspace/output';

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 构造需求（修正版：主题正确、镜头数正确、角色路径正确）
const requirement = {
  title: '什么是横纹肌溶解——横纹肌溶解的症状以及实验室检查',
  topic: '横纹肌溶解的症状以及实验室检查',
  videoType: 'EDU',
  targetAudience: '普通居民、患者、家属',
  platform: '抖音/视频号/B站/小红书',
  targetDuration: 65,
  aspectRatio: '16:9',
  visualStyle: 'REAL',
  qualityLevel: 'CINEMATIC',
  colorTone: '冷白偏蓝',
  creativityIndex: 0.98,
  narrativeStyle: '讲解式',
  contentStyle: '专业科普+通俗易懂',
  visualStyleDetail: '全写实，电影级质感，好莱坞纪录片风格',
  musicStyle: '冷色调氛围音乐',
  characters: [{
    name: '陈卓',
    description: '35岁，警务系统护士，穿藏蓝色警服，短发，干练专业',
    role: '主讲人',
    appearanceAnchor: {
      uniform: '藏青色警服外套（毛呢质地，肩章完整，金属纽扣有光泽），内搭浅蓝色衬衫，黑色西裤，黑色皮鞋'
    }
  }],
  // 3个场景
  scenes: [
    { name: '健康宣教室', description: '医院健康宣教室，白色墙面，木质讲台' },
    { name: '检验科走廊', description: '三甲医院检验科走廊，冷白色光源' },
    { name: '诊室', description: '医生诊室，白色墙面，检查床' }
  ],
  opening: {
    enabled: true,
    mainTitle: '什么是横纹肌溶解',
    subTitle: '第一集：症状与实验室检查'
  },
  ending: {
    style: '总结式',
    previewNext: false
  },
  isSeries: true,
  totalEpisodes: 3,
  currentEpisode: 1,
  episodeThemes: [
    '横纹肌溶解的症状以及实验室检查',
    '为什么会发生横纹肌溶解，常见的原因分析',
    '怎么处理和预防横纹肌溶解'
  ],
  constraints: {
    noTextInFrame: true,
    noWatermark: true,
    singleCharacter: true,
    realisticOnly: true,
    noNextEpisodePreview: true
  },
  _metadata: {
    projectId: 'health-edu-ep01-v2',
    filmType: 'EDU',
    visualStyle: 'REAL',
    session: 'calm-ember-v2'
  }
};

async function main() {
  console.log('[HAVS v2.0] 启动预生产...');
  console.log('[HAVS v2.0] 主题:', requirement.topic);
  console.log('[HAVS v2.0] 创意指数:', requirement.creativityIndex);
  console.log('[HAVS v2.0] 项目ID:', requirement._metadata.projectId);

  try {
    // 加载 ProductionEngine
    const { ProductionEngine } = require('./hyperreality-system/engines/production-engine/production-engine.js');
    
    const engine = new ProductionEngine({
      outputDir: outputDir,
      maxPromptLength: 3000,
      agentConfig: {
        enableLLMAgents: true,
        llmTimeout: 300000,
        llmMaxRetries: 2,
        llmModel: 'kimi-k2p6',
        fastModel: 'kimi-k2p5',
        totalDeadlineMs: 1800000,
        memThresholdMB: 1800,
        promptFusionConcurrency: 2,
        enableResume: true
      }
    });

    console.log('[HAVS v2.0] ProductionEngine 初始化完成');
    console.log('[HAVS v2.0] 基线模板数:', engine.baselineRegistry.list().length);

    // === 【修复】构造正确的 adaptedBlueprint ===
    // 6个内容镜头 + 1个片头 = 7个镜头
    // 场景：宣教室(SC01,SC04) / 检验科走廊(SC02,SC05) / 诊室(SC03,SC06)
    // 片头：SC00
    const totalDuration = requirement.targetDuration; // 65秒
    const contentDuration = totalDuration - 10; // 片头10秒，内容55秒
    const shotCount = 6; // 6个内容镜头
    const avgDuration = Math.floor(contentDuration / shotCount); // 约9秒/镜
    
    const contentShots = [
      { shotId: 'SC01', type: 'content', sceneId: 'SC01', sceneTitle: '健康宣教室', duration: avgDuration, 
        description: '陈卓站在健康宣教室讲台前，介绍横纹肌溶解的基本概念和常见症状' },
      { shotId: 'SC02', type: 'content', sceneId: 'SC02', sceneTitle: '检验科走廊', duration: avgDuration,
        description: '陈卓在检验科走廊边走边讲解，介绍横纹肌溶解的典型症状：肌肉疼痛、无力、尿色加深' },
      { shotId: 'SC03', type: 'content', sceneId: 'SC03', sceneTitle: '诊室', duration: avgDuration + 1,
        description: '陈卓在诊室内，讲解横纹肌溶解的实验室检查指标：肌酸激酶(CK)、肌红蛋白、肾功能检查' },
      { shotId: 'SC04', type: 'content', sceneId: 'SC01', sceneTitle: '健康宣教室', duration: avgDuration,
        description: '陈卓回到宣教室，用手势强调肌酸激酶(CK)水平升高是诊断横纹肌溶解的关键指标' },
      { shotId: 'SC05', type: 'content', sceneId: 'SC02', sceneTitle: '检验科走廊', duration: avgDuration + 1,
        description: '陈卓在检验科窗口前，讲解尿液检查中肌红蛋白阳性的意义和肾功能监测的重要性' },
      { shotId: 'SC06', type: 'content', sceneId: 'SC03', sceneTitle: '诊室', duration: avgDuration,
        description: '陈卓在诊室内做总结，提醒观众出现症状应及时就医，进行实验室检查确诊' }
    ];
    
    // 修正时长确保总和为65秒
    let currentTotal = contentShots.reduce((sum, s) => sum + s.duration, 0) + 10; // +10秒片头
    const diff = totalDuration - currentTotal;
    if (diff !== 0) {
      contentShots[contentShots.length - 1].duration += diff; // 调整最后一个镜头
    }
    
    const adaptedBlueprint = {
      config: {
        _metadata: requirement._metadata,
        visualStyle: requirement.visualStyle,
        creativityIndex: requirement.creativityIndex,
        characters: requirement.characters,
        scenes: requirement.scenes,
        duration: requirement.targetDuration,
        aspectRatio: requirement.aspectRatio
      },
      scenes: [
        // 片头场景
        {
          sceneId: 'SC00',
          title: '片头',
          description: '主标题和副标题展示，陈卓登场',
          shots: [{ shotId: 'SC00', type: 'opening', duration: 10, sceneType: 'opening' }]
        },
        // 内容场景
        ...requirement.scenes.map((s, i) => ({
          sceneId: `SC${String(i+1).padStart(2, '0')}`,
          title: s.name,
          description: s.description,
          shots: contentShots.filter(sh => sh.sceneId === `SC${String(i+1).padStart(2, '0')}`)
        }))
      ],
      // 扁平化的shots列表（供引擎直接消费）
      shots: [
        { shotId: 'SC00', type: 'opening', duration: 10, sceneType: 'opening', sceneTitle: '片头' },
        ...contentShots
      ],
      _metadata: requirement._metadata
    };

    // 设置片头
    if (requirement.opening?.enabled) {
      adaptedBlueprint.config._metadata.hasOpening = true;
      adaptedBlueprint.config._metadata.isSeries = requirement.isSeries;
      adaptedBlueprint.config._metadata.episodeNumber = requirement.currentEpisode;
      adaptedBlueprint.config._metadata.series = {
        totalEpisodes: requirement.totalEpisodes,
        currentEpisode: requirement.currentEpisode,
        episodeThemes: requirement.episodeThemes
      };
      adaptedBlueprint.config._metadata.noNextEpisodePreview = true;
    }
    
    // 【修复】确保主题正确传入
    adaptedBlueprint.config.title = requirement.title;
    adaptedBlueprint.config.topic = requirement.topic;
    
    // 【修复】角色路径修正为 chenzhuo
    adaptedBlueprint.config.characters[0].id = 'chenzhuo';
    adaptedBlueprint.config.characters[0].referencePath = 'image://characters/chenzhuo/portraits/';

    console.log('[HAVS v2.0] Blueprint 构造完成:');
    console.log('  - 镜头数:', adaptedBlueprint.shots.length);
    console.log('  - 总时长:', adaptedBlueprint.shots.reduce((s, sh) => s + sh.duration, 0), '秒');
    console.log('  - 主题:', adaptedBlueprint.config.topic);
    console.log('  - 角色ID:', adaptedBlueprint.config.characters[0].id);

    console.log('[HAVS v2.0] 开始执行 produce()...');
    const startTime = Date.now();
    
    const result = await engine.produce(adaptedBlueprint);
    
    const totalTime = Date.now() - startTime;
    console.log('[HAVS v2.0] 预生产完成!');
    console.log('[HAVS v2.0] 总耗时:', Math.round(totalTime / 1000), '秒');
    console.log('[HAVS v2.0] 成功:', result.success);
    console.log('[HAVS v2.0] 镜头数:', result.shots?.length || 0);
    console.log('[HAVS v2.0] 降级模式:', result.degraded);
    console.log('[HAVS v2.0] 断点续跑:', result.resumed);

    // 保存结果
    const resultPath = path.join(outputDir, 'havs-preproduction-result.json');
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log('[HAVS v2.0] 结果已保存:', resultPath);

    // 保存提示词报告
    if (result.shots && result.shots.length > 0) {
      const reportPath = path.join(outputDir, 'havs-prompts-formatted.md');
      let report = `# HAVS v2.0 预生产报告\n\n`;
      report += `**项目**: ${requirement._metadata.projectId}\n`;
      report += `**主题**: ${requirement.title}\n`;
      report += `**基线模板**: EDU_health_v1.0\n`;
      report += `**成功**: ${result.success}\n`;
      report += `**降级**: ${result.degraded}\n`;
      report += `**镜头数**: ${result.shots.length}\n\n`;
      report += `---\n\n`;

      for (let i = 0; i < result.shots.length; i++) {
        const shot = result.shots[i];
        report += `## ${shot.shotId || `镜头${i+1}`}\n\n`;
        
        // 收集所有字段
        const fields = {};
        const topFields = ['scene', 'action', 'dialogue', 'lighting', 'cameraMovement', 'mood', 'props', 'transition', 'audio'];
        for (const f of topFields) {
          if (shot[f] && shot[f] !== '(空)' && shot[f] !== '') {
            fields[f] = shot[f];
          }
        }
        if (shot.fields) {
          for (const [k, v] of Object.entries(shot.fields)) {
            if (v && v !== '(空)' && v !== '') {
              fields[k] = v;
            }
          }
        }
        if (shot.prompt || shot.enhanced_prompt) {
          fields.prompt = shot.enhanced_prompt || shot.prompt;
        }
        
        if (shot._baselineMerged) {
          report += `**基线合并**: ✅ (v${shot._baselineVersion})\n\n`;
        }
        
        let idx = 1;
        for (const [k, v] of Object.entries(fields)) {
          report += `${idx}. **${k}**: ${typeof v === 'string' ? v.replace(/\n/g, ' ') : JSON.stringify(v)}\n`;
          idx++;
        }
        
        report += `\n---\n\n`;
      }

      fs.writeFileSync(reportPath, report);
      console.log('[HAVS v2.0] 提示词报告已保存:', reportPath);
    }

    // 输出Gateway统计
    const gatewayStats = engine.getGatewayStats();
    console.log('[HAVS v2.0] Gateway统计:', JSON.stringify(gatewayStats, null, 2));

    // 输出EventBus统计
    const eventStats = engine.getEventBusStats();
    console.log('[HAVS v2.0] EventBus统计:', JSON.stringify(eventStats, null, 2));

  } catch (err) {
    console.error('[HAVS v2.0] 致命错误:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();

/**
 * 健康科普系列 - 第二集《为什么会发生横纹肌溶解》
 * 主讲：陈卓女士（穿警服的护士小姐姐）
 * 卓越系统 v6.6.3-fix-2
 */

const fs = require('fs');
const path = require('path');
const { NirathMasterPipeline } = require('./zhuoyue-system/core/nirath-master-pipeline.js');

const WORKSPACE = '/root/.openclaw/workspace';
const OUTPUT = path.join(WORKSPACE, 'output', 'health-edu-ep02');

if (!fs.existsSync(OUTPUT)) {
  fs.mkdirSync(OUTPUT, { recursive: true });
}

// ====== 任务输入定义 ======
const input = {
  projectName: 'health-edu-ep02-rhabdomyolysis-causes',
  topic: '横纹肌溶解的原因分析',  // v6.6.5-fix: 添加主题，用于主题一致性校验
  videoType: 'educational',
  targetDuration: 62,
  style: '科普纪录片风格，专业写实，医院办公环境，自然光线，亲切可信',
  mode: 'generic',  // v6.6.4-fix: 教育片使用 generic 模式，避免 Nirath 元素注入
  creativityIndex: 0.8,  // 高创意指数，激活14个模块
  hasOpening: false,  // 只有第一集有片头
  hasNextEpisodePreview: false,  // 不预告下一集

  // v6.6.4-fix-4: 直接提供剧本内容，跳过LLM生成，确保主题正确
  scriptAgent: {
    generate: async ({ prd, core, world, mode }) => {
      return {
        scenes: [
          {
            id: 'S01',
            scene: '开场-引入主题',
            dialogue: '大家好，我是陈卓。上一集我们讲了横纹肌溶解的症状，今天我们来聊聊更重要的——为什么会发生横纹肌溶解。',
            narration: '',
            action: '身穿警服，挺胸站立，双手自然贴于裤缝，面向镜头点头致意，随后双手展开做引入手势',
            characters: ['chen-zhuo'],
            mouthAction: 'speaking_normal',
            emotionPhase: 'curiosity'
          },
          {
            id: 'S02',
            scene: '运动过度-最常见原因',
            dialogue: '最常见的原因就是运动过度。平时不怎么运动的人，突然进行大量剧烈运动，比如举重、马拉松，肌肉就会严重受损。记住，运动一定要循序渐进。',
            narration: '',
            action: '双手做出举重姿势，随后模拟跑步动作，然后双手下压做"慢下来"手势',
            characters: ['chen-zhuo'],
            mouthAction: 'speaking_emphasis',
            emotionPhase: 'tension'
          },
          {
            id: 'S03',
            scene: '药物和饮食因素',
            dialogue: '第二个原因是药物和饮食。他汀类降脂药、某些抗生素，大量饮酒，或者极端节食、生酮饮食，都可能诱发横纹肌溶解。用药和饮食都要遵医嘱。',
            narration: '',
            action: '右手举起模拟药瓶，左手做饮酒手势，随后双手交叉做"停止"动作',
            characters: ['chen-zhuo'],
            mouthAction: 'speaking_normal',
            emotionPhase: 'tension'
          },
          {
            id: 'S04',
            scene: '高温和脱水',
            dialogue: '高温环境和脱水也是重要原因。夏天户外工作、桑拿房、高温瑜伽，如果不及时补水，体温过高会导致肌肉损伤。一定要多喝水，注意降温。',
            narration: '',
            action: '单手做擦汗动作，随后双手做喝水姿势，然后指向屏幕展示高温场景',
            characters: ['chen-zhuo'],
            mouthAction: 'speaking_emphasis',
            emotionPhase: 'climax'
          },
          {
            id: 'S05',
            scene: '其他原因和易感人群',
            dialogue: '此外，外伤挤压、感染、代谢性疾病也可能导致横纹肌溶解。健身新手、正在服药的人、高温作业者，都是高危人群。要特别留意。',
            narration: '',
            action: '单手平举做下压手势，随后侧身伸手指向屏幕信息图，展示高危人群',
            characters: ['chen-zhuo'],
            mouthAction: 'speaking_normal',
            emotionPhase: 'resolution'
          },
          {
            id: 'S06',
            scene: '总结-回顾重点',
            dialogue: '了解原因才能更好地预防。记住，适度运动、合理用药、及时补水，远离横纹肌溶解。我们下期再见。',
            narration: '',
            action: '双手自然交叠于身前，身体端正地面向镜头，保持立正姿势，随后微笑点头',
            characters: ['chen-zhuo'],
            mouthAction: 'speaking_normal',
            emotionPhase: 'resolution'
          }
        ],
        narrative: {
          emotion: 'neutral',
          pace: 'medium',
          totalDuration: 62
        },
        world: {
          name: '健康科普讲堂',
          setting: 'modern-hospital'
        }
      };
    }
  },

  // 世界观设定
  world: {
    setting: 'modern-hospital',
    name: '健康科普讲堂',
    style: '写实科普风格，专业医疗机构环境，全写实画质',
    location: '医院办公室/健康讲堂',
    lighting: '自然光+室内照明，明亮专业，柔和不刺眼',
    atmosphere: '专业、亲切、可信赖、温暖'
  },

  // 场景设计：科普讲解（单人主讲）
  scenes: [
    {
      id: 'S01',
      name: '开场-引入主题',
      type: 'intro',
      duration: 8,
      description: '陈卓女士穿警服制服，站在医院办公室/健康讲堂，自然亲切地向镜头引入第二集主题。表情关切专业，手势自然。背景有健康知识海报或书架。直接切入主题，无片头。'
    },
    {
      id: 'S02',
      name: '运动过度-最常见原因',
      type: 'explanation',
      duration: 12,
      description: '陈卓讲解运动过度导致横纹肌溶解的机制。配合手势模拟运动场景（如举重、长跑）。表情认真，强调适度运动的重要性。可配合简单的动画或示意图展示肌肉损伤过程。字幕关键词：过度运动、肌肉损伤、循序渐进。'
    },
    {
      id: 'S03',
      name: '药物和饮食因素',
      type: 'explanation',
      duration: 12,
      description: '陈卓讲解药物和饮食相关诱因。1)他汀类降脂药；2)某些抗生素；3)大量饮酒；4)极端节食/生酮饮食。表情专业严谨，手势配合说明。可展示药品示意图或饮食图示。字幕：药物、饮酒、饮食。'
    },
    {
      id: 'S04',
      name: '高温和脱水',
      type: 'demonstration',
      duration: 10,
      description: '陈卓讲解高温环境和脱水的影响。模拟高温环境（如夏天户外、桑拿房）。强调补水的重要性。表情关切，手势模拟擦汗、喝水动作。字幕：高温、脱水、及时补水。'
    },
    {
      id: 'S05',
      name: '其他原因和易感人群',
      type: 'explanation',
      duration: 12,
      description: '陈卓总结其他原因：外伤挤压、感染、代谢性疾病等。讲解易感人群（健身新手、服用特定药物者、高温作业者）。表情温暖关切，手势鼓励。配合人群示意图。字幕：外伤、感染、易感人群。'
    },
    {
      id: 'S06',
      name: '片尾',
      type: 'ending',
      duration: 5,
      description: '片尾画面。陈卓微笑点头致意。系列标题展示：居民健康科普系列。第二集完。无下一集预告。简洁收尾。'
    }
  ],

  // 角色定义 - 陈卓（穿警服的护士小姐姐，使用警服定妆照）
  characters: {
    'chen-zhuo': {
      id: 'chen-zhuo',
      name: '陈卓',
      role: 'presenter',
      species: 'human',
      origin: 'Earth',
      visual: {
        age: 30,
        gender: 'female',
        build: 'average',
        height: 'medium',
        skinTone: 'warm',
        hair: 'black',
        eyes: 'brown',
        facialFeatures: 'asian',
        outfit: 'standard Chinese police uniform with formal police cap, hair neatly tied back in professional bun'
      },
      personality: {
        core: 'warm',
        traits: ['kind', 'professional', 'patient', 'trustworthy', 'knowledgeable']
      },
      // 显式配置警服定妆照（角色设定为"穿警服的护士小姐姐"）
      portraits: {
        front: path.join(WORKSPACE, 'characters/chenzhuo/portraits/uniform/portrait-uniform-02.jpg'),
        threeQuarter: path.join(WORKSPACE, 'characters/chenzhuo/portraits/uniform/portrait-uniform-01.jpg'),
        side: path.join(WORKSPACE, 'characters/chenzhuo/portraits/uniform/portrait-uniform-04.jpg'),
        closeup: path.join(WORKSPACE, 'characters/chenzhuo/portraits/uniform/portrait-uniform-05.jpg'),
        fullBody: path.join(WORKSPACE, 'characters/chenzhuo/portraits/uniform/portrait-uniform-02.jpg')
      }
    }
  },

  // 核心内容摘要
  content: {
    topic: '第二集：横纹肌溶解的原因分析（为什么/怎么会发生）',
    episode: 2,
    previousEpisode: '第一集已完整讲解症状表现（肌肉疼痛、肿胀、无力、尿液颜色变化、肌酸激酶、肌红蛋白等）',
    focus: '本集只讲原因和机制，禁止任何症状描述',
    keyPoints: [
      '原因1-运动过度：突然剧烈运动、健身过度导致肌肉损伤',
      '原因2-药物因素：他汀类降脂药、某些抗生素的影响',
      '原因3-饮食因素：大量饮酒、极端节食、生酮饮食',
      '原因4-环境因素：高温环境、脱水',
      '原因5-其他原因：外伤挤压、感染、代谢性疾病',
      '易感人群：健身新手、服药者、高温作业者'
    ]
  },

  // 制作要求
  requirements: {
    tone: '专业且通俗易懂，生动形象',
    presentation: '单人讲解，自然肢体语言，边走边介绍',
    visual: '全写实，好莱坞质感画质',
    noNextEpisodePreview: true,
    noOpening: true  // 第二集无片头
  }
};

// ====== 执行预生产 ======
async function run() {
  console.log('🎬 =========================================');
  console.log('🎬 卓越系统 v6.6.3-fix-2 - 健康科普系列第二集');
  console.log('🎬 项目:', input.projectName);
  console.log('🎬 主题:', input.content.topic);
  console.log('🎬 主讲:', input.characters['chen-zhuo'].name);
  console.log('🎬 时长:', input.targetDuration, '秒');
  console.log('🎬 模式:', input.mode, '| 有片头:', input.hasOpening);
  console.log('🎬 =========================================');
  console.log('');

  const pipeline = new NirathMasterPipeline({
    mode: input.mode,  // v6.6.4-fix: 使用 input.mode 而非硬编码，教育片用 generic
    useLLM: true,
    creativityIndex: input.creativityIndex,  // 传递创意指数到Pipeline
    // v6.6.4-root-fix: 增强模块配置，科普片禁用Nirath叙事弧
    enhancement: {
      setDesign: true,
      motion: true,
      realism: true,
      closingBoost: true,
      narrativeArc: false,  // 禁用Nirath叙事弧线，避免注入异兽/双恒星等元素
      intraShot: true,
      lighting: true,
      audio: true
    },
    skipDirectorReview: false,
    skipScreenwriterOptimization: false,
    projectConfig: {
      requiredCharacters: ['chen-zhuo'],
      targetDuration: input.targetDuration,
      hasOpening: input.hasOpening,
      hasNextEpisodePreview: input.hasNextEpisodePreview,
      isPreProduction: true  // 预生产模式，定妆照闸机仅警告不拦截
    }
  });

  try {
    const result = await pipeline.execute(input);
    
    // 保存结果
    const outputPath = path.join(OUTPUT, 'preproduction-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log('');
    console.log('✅ 预生产完成！');
    console.log('  结果:', result.success ? '成功' : '失败');
    console.log('  阶段:', Object.keys(result.stages || {}).join(', '));
    console.log('📁 结果保存:', outputPath);
    console.log('📊 镜头数:', result.stages?.storyboard?.shots?.length || 0);
    console.log('⏱️ 总时长:', result.stages?.storyboard?.totalDuration || 0, '秒');
    
    // 生成报告
    const reportPath = path.join(OUTPUT, 'preproduction-report.md');
    generateReport(result, reportPath);
    console.log('📄 报告生成:', reportPath);
    
  } catch (error) {
    console.error('❌ 预生产失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 生成报告
function generateReport(result, outputPath) {
  // v6.6.3-fix-2: 优先从 stages.output.标准镜头清单 读取
  const shots = result.stages?.output?.标准镜头清单 || result.stages?.output?.shots || result.storyboard?.shots || [];
  const totalDuration = shots.reduce((sum, s) => sum + (s.时长 || s.duration || 0), 0) || result.totalDuration || 0;
  
  let md = `# 健康科普系列 - 第二集《为什么会发生横纹肌溶解》预生产报告\n\n`;
  md += `**生成时间**: ${new Date().toLocaleString()}\n\n`;
  md += `**主讲人**: 陈卓（穿警服的护士小姐姐）\n\n`;
  md += `**总时长**: ${totalDuration} 秒\n\n`;
  md += `**镜头数**: ${shots.length}\n\n`;
  md += `---\n\n`;
  
  md += `## 镜头列表\n\n`;
  shots.forEach((shot, i) => {
    md += `### ${shot.镜头编号 || shot.id || shot.shotId || 'S' + (i + 1)} - ${shot.场景名称 || shot.name || shot.type || '未命名'}\n\n`;
    md += `- **时长**: ${shot.时长 || shot.duration || 0} 秒\n`;
    md += `- **类型**: ${shot.镜头类型 || shot.type || 'unknown'}\n`;
    md += `- **场景**: ${shot.场景名称 || shot.scene || '未指定'}\n`;
    md += `- **角色**: ${(shot.人物列表 || shot.characters || []).join(', ')}\n\n`;
    md += `**Prompt**:\n\n`;
    md += `\`\`\`\n${shot.画面提示词 || shot.prompt || '无'}\n\`\`\`\n\n`;
    md += `---\n\n`;
  });
  
  fs.writeFileSync(outputPath, md);
}

run().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});

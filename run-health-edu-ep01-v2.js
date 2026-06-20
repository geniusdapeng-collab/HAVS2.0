/**
 * 健康科普系列 - 第一集《什么是横纹肌溶解》
 * 主讲：陈卓女士（穿警服的护士小姐姐）
 * 暴风战斧AI视频生成系统 (Stormaxe AI Video System) v6.6.5
 * 预生产模式：不提交 Seedance 渲染
 */

const fs = require('fs');
const path = require('path');
const { NirathMasterPipeline } = require('./zhuoyue-system/core/nirath-master-pipeline.js');

const WORKSPACE = '/root/.openclaw/workspace';
const OUTPUT = path.join(WORKSPACE, 'output', 'health-edu-ep01');

if (!fs.existsSync(OUTPUT)) {
  fs.mkdirSync(OUTPUT, { recursive: true });
}

// ====== 角色定妆照路径映射 ======
const PORTRAIT_BASE = path.join(WORKSPACE, 'characters/chenzhuo/portraits');
const UNIFORM_DIR = path.join(PORTRAIT_BASE, 'uniform');
const CASUAL_DIR = path.join(PORTRAIT_BASE, 'casual');

// 使用警服定妆照（职业科普场景）
const CHENZHUO_PORTRAITS = {
  front: path.join(UNIFORM_DIR, 'portrait-uniform-02.jpg'),
  threeQuarter: path.join(UNIFORM_DIR, 'portrait-uniform-01.jpg'),
  side: path.join(UNIFORM_DIR, 'portrait-uniform-04.jpg'),
  closeup: path.join(UNIFORM_DIR, 'portrait-uniform-05.jpg'),
  fullBody: path.join(UNIFORM_DIR, 'portrait-uniform-02.jpg'),
  back: path.join(UNIFORM_DIR, 'portrait-uniform-03.jpg')
};

// 验证定妆照存在
let missingPortraits = [];
for (const [key, pPath] of Object.entries(CHENZHUO_PORTRAITS)) {
  if (!fs.existsSync(pPath)) {
    missingPortraits.push(`${key}: ${pPath}`);
  }
}

if (missingPortraits.length > 0) {
  console.error('❌ 定妆照缺失:', missingPortraits.join('\n'));
  process.exit(1);
}

console.log('✅ 定妆照验证通过');
for (const [key, pPath] of Object.entries(CHENZHUO_PORTRAITS)) {
  const stat = fs.statSync(pPath);
  console.log(`  ${key}: ${path.basename(pPath)} (${(stat.size / 1024).toFixed(1)}KB)`);
}

// ====== 任务输入定义 ======
const input = {
  projectName: 'health-edu-ep01-rhabdomyolysis',
  videoType: 'educational',
  targetDuration: 62,
  style: '科普纪录片风格，专业写实，医院办公环境，自然光线，亲切可信',
  mode: 'generic',
  hasOpening: true,
  hasNextEpisodePreview: false,

  world: {
    setting: 'modern-hospital',
    name: '健康科普讲堂',
    style: '写实科普风格，专业医疗机构环境，全写实画质',
    location: '医院办公室/健康讲堂',
    lighting: '自然光+室内照明，明亮专业，柔和不刺眼',
    atmosphere: '专业、亲切、可信赖、温暖'
  },

  scenes: [
    {
      id: 'S01',
      name: '开场-自我介绍',
      type: 'intro',
      duration: 8,
      description: '陈卓女士穿警服制服，站在医院办公室/健康讲堂，微笑着面向镜头自我介绍。表情亲切专业，手势自然。背景有健康知识海报或书架。字幕：主讲人 陈卓 护士。'
    },
    {
      id: 'S02',
      name: '什么是横纹肌溶解',
      type: 'explanation',
      duration: 10,
      description: '陈卓用通俗语言解释横纹肌溶解的定义。配合手势比喻（如捏橡皮泥或模拟肌肉纤维断裂）。表情认真但不沉重。可配合简单的动画或示意图展示肌肉细胞损伤过程。字幕关键词：肌肉细胞损伤、内容物释放到血液。'
    },
    {
      id: 'S03',
      name: '症状表现',
      type: 'demonstration',
      duration: 12,
      description: '陈卓讲解三大核心症状，配合自然肢体语言。1)肌肉疼痛：手按大腿/手臂示意；2)肌肉无力：模拟无力抬手；3)尿液变色：指向下水道或展示示意图（茶色/酱油色）。表情从关切到提醒。字幕：疼痛、无力、茶色尿。'
    },
    {
      id: 'S04',
      name: '实验室检查',
      type: 'explanation',
      duration: 15,
      description: '陈卓讲解实验室检查指标。可以手持化验单或指向屏幕/白板。三大关键指标：1)肌酸激酶(CK)显著升高；2)肌红蛋白尿；3)电解质异常。表情专业严谨。配合数据可视化或图表展示。字幕：CK值、肌红蛋白、电解质。'
    },
    {
      id: 'S05',
      name: '总结提醒',
      type: 'closing',
      duration: 8,
      description: '陈卓总结核心要点，强调及时就医的重要性。表情温暖关切，手势鼓励。面向镜头直接对话感。字幕：出现症状请及时就医。背景保持医院办公环境。'
    },
    {
      id: 'S06',
      name: '片尾',
      type: 'ending',
      duration: 5,
      description: '片尾画面。陈卓微笑点头致意。系列标题展示：居民健康科普系列。第一集完。无下一集预告。简洁收尾。'
    }
  ],

  characters: {
    'chen-zhuo': {
      id: 'chen-zhuo',
      name: '陈卓',
      role: 'presenter',
      species: 'human',
      origin: 'Earth',
      visual: {
        age: 35,
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
      portraits: CHENZHUO_PORTRAITS
    }
  },

  opening: {
    seriesTitle: '居民健康科普系列',
    episodeTitle: '什么是横纹肌溶解',
    episodeNumber: 'EP01',
    subtitle: '横纹肌溶解的症状及实验室检查',
    style: '简洁专业风格，医院/医疗主题色调（蓝白），字幕清晰',
    duration: 5
  },

  content: {
    topic: '横纹肌溶解的症状及实验室检查',
    keyPoints: [
      '横纹肌溶解定义：肌肉细胞损伤，内容物释放到血液中',
      '主要症状：肌肉疼痛、肌肉无力、茶色尿/酱油色尿',
      '实验室检查：肌酸激酶(CK)显著升高、肌红蛋白尿、电解质异常',
      '及时就医的重要性'
    ]
  },

  requirements: {
    tone: '专业且通俗易懂，生动形象',
    presentation: '单人讲解，自然肢体语言，边走边介绍',
    visual: '全写实，好莱坞质感画质',
    noNextEpisodePreview: true
  }
};

// ====== 执行预生产 ======
async function run() {
  console.log('🎬 =========================================');
  console.log('🎬 暴风战斧AI视频生成系统 (Stormaxe AI Video System) v6.6.5 - 健康科普系列第一集');
  console.log('🎬 项目:', input.projectName);
  console.log('🎬 主题:', input.content.topic);
  console.log('🎬 主讲:', input.characters['chen-zhuo'].name);
  console.log('🎬 时长:', input.targetDuration, '秒');
  console.log('🎬 模式:', input.mode, '| 有片头:', input.hasOpening);
  console.log('🎬 预生产模式: 不提交 Seedance 渲染');
  console.log('🎬 =========================================');
  console.log('');

  const pipeline = new NirathMasterPipeline({
    mode: 'generic',
    useLLM: true,
    skipDirectorReview: false,
    skipScreenwriterOptimization: false,
    projectConfig: {
      requiredCharacters: ['chen-zhuo'],
      targetDuration: input.targetDuration,
      hasOpening: input.hasOpening,
      hasNextEpisodePreview: input.hasNextEpisodePreview,
      isPreProduction: true
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

    return result;

  } catch (error) {
    console.error('❌ 预生产失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 生成报告
function generateReport(result, outputPath) {
  const shots = result.stages?.output?.shots || result.storyboard?.shots || [];
  const totalDuration = shots.reduce((sum, s) => sum + (s.duration || 0), 0) || result.totalDuration || 0;

  let md = `# 健康科普系列 - 第一集《什么是横纹肌溶解》预生产报告\n\n`;
  md += `**生成时间**: ${new Date().toLocaleString()}\n\n`;
  md += `**主讲人**: 陈卓（穿警服的护士小姐姐）\n\n`;
  md += `**总时长**: ${totalDuration} 秒\n\n`;
  md += `**镜头数**: ${shots.length}\n\n`;
  md += `**预生产模式**: 不提交 Seedance 渲染\n\n`;
  md += `---\n\n`;

  md += `## 镜头列表\n\n`;
  shots.forEach((shot, i) => {
    md += `### ${shot.id || shot.shotId || 'S' + (i + 1)} - ${shot.name || shot.type || '未命名'}\n\n`;
    md += `- **时长**: ${shot.duration || 0} 秒\n`;
    md += `- **类型**: ${shot.type || 'unknown'}\n`;
    md += `- **场景**: ${shot.scene || '未指定'}\n`;
    md += `- **角色**: ${(shot.characters || []).join(', ')}\n\n`;
    md += `**Prompt**:\n\n`;
    md += `\`\`\`\n${shot.prompt || '无'}\n\`\`\`\n\n`;
    md += `---\n\n`;
  });

  fs.writeFileSync(outputPath, md);
}

run().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/root/.openclaw/workspace';
const OUTPUT = path.join(WORKSPACE, 'output', 'health-edu-ep01');

if (!fs.existsSync(OUTPUT)) {
  fs.mkdirSync(OUTPUT, { recursive: true });
}

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

for (const [key, pPath] of Object.entries(CHENZHUO_PORTRAITS)) {
  if (!fs.existsSync(pPath)) {
    console.error('❌ 定妆照缺失:', key, pPath);
    process.exit(1);
  }
}

console.log('✅ 定妆照验证通过');

const project = {
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
      id: 'S01', name: '开场-自我介绍', type: 'intro', duration: 8,
      description: '陈卓女士穿警服制服，站在医院办公室/健康讲堂，微笑着面向镜头自我介绍。表情亲切专业，手势自然。'
    },
    {
      id: 'S02', name: '什么是横纹肌溶解', type: 'explanation', duration: 10,
      description: '陈卓用通俗语言解释横纹肌溶解的定义。配合手势比喻。表情认真但不沉重。'
    },
    {
      id: 'S03', name: '症状表现', type: 'demonstration', duration: 12,
      description: '陈卓讲解三大核心症状：1)肌肉疼痛；2)肌肉无力；3)尿液变色。表情从关切到提醒。'
    },
    {
      id: 'S04', name: '实验室检查', type: 'explanation', duration: 15,
      description: '陈卓讲解实验室检查指标：1)肌酸激酶(CK)显著升高；2)肌红蛋白尿；3)电解质异常。'
    },
    {
      id: 'S05', name: '总结提醒', type: 'closing', duration: 8,
      description: '陈卓总结核心要点，强调及时就医的重要性。表情温暖关切。'
    },
    {
      id: 'S06', name: '片尾', type: 'ending', duration: 5,
      description: '片尾画面。陈卓微笑点头致意。系列标题展示。简洁收尾。'
    }
  ],

  characters: {
    'chen-zhuo': {
      id: 'chen-zhuo', name: '陈卓', role: 'presenter',
      visual: {
        age: 35, gender: 'female', build: 'average', height: 'medium',
        skinTone: 'warm', hair: 'black', eyes: 'brown', facialFeatures: 'asian',
        outfit: 'standard Chinese police uniform with formal police cap, hair neatly tied back in professional bun'
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
  }
};

function generatePreProductionReport() {
  const { scenes, characters, opening, content, targetDuration } = project;
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  
  let md = `# 健康科普系列 - 第一集《什么是横纹肌溶解》预生产报告\n\n`;
  md += `> **生成时间**: ${new Date().toLocaleString()}\n\n`;
  md += `> **系统版本**: 卓越视频生成系统 v6.5.64-P2\n\n`;
  md += `> **预生产模式**: 不提交 Seedance 渲染\n\n`;
  
  md += `---\n\n`;
  
  md += `## 📋 项目概览\n\n`;
  md += `| 项目 | 内容 |\n`;
  md += `|------|------|\n`;
  md += `| 系列名称 | ${opening.seriesTitle} |\n`;
  md += `| 集数 | ${opening.episodeNumber} |\n`;
  md += `| 主标题 | ${opening.episodeTitle} |\n`;
  md += `| 副标题 | ${opening.subtitle} |\n`;
  md += `| 主讲人 | ${characters['chen-zhuo'].name} |\n`;
  md += `| 目标时长 | ${targetDuration} 秒 |\n`;
  md += `| 实际时长 | ${totalDuration} 秒 |\n`;
  md += `| 镜头数 | ${scenes.length} 个 |\n`;
  md += `| 风格 | ${project.style} |\n\n`;
  
  md += `---\n\n`;
  
  md += `## 👤 角色信息\n\n`;
  const char = characters['chen-zhuo'];
  md += `**角色ID**: ${char.id}\n\n`;
  md += `**角色名称**: ${char.name}\n\n`;
  md += `**角色定位**: ${char.role}\n\n`;
  md += `**视觉特征**:\n\n`;
  md += `- 年龄: ${char.visual.age}岁\n`;
  md += `- 性别: ${char.visual.gender === 'female' ? '女性' : '男性'}\n`;
  md += `- 发型: ${char.visual.hair}色\n`;
  md += `- 服装: 警服制服，戴警帽，头发盘起\n\n`;
  
  md += `**定妆照**:\n\n`;
  md += `| 角度 | 文件 |\n`;
  md += `|------|------|\n`;
  for (const [angle, pPath] of Object.entries(char.portraits)) {
    md += `| ${angle} | ${path.basename(pPath)} |\n`;
  }
  md += `\n`;
  
  md += `---\n\n`;
  
  md += `## 🎬 镜头列表\n\n`;
  
  scenes.forEach((scene, i) => {
    md += `### ${scene.id} - ${scene.name}\n\n`;
    md += `| 属性 | 内容 |\n`;
    md += `|------|------|\n`;
    md += `| 时长 | ${scene.duration} 秒 |\n`;
    md += `| 类型 | ${scene.type} |\n`;
    md += `| 角色 | ${char.name} |\n\n`;
    
    md += `**场景描述**:\n\n`;
    md += `${scene.description}\n\n`;
    
    md += `**视频生成 Prompt**:\n\n`;
    md += `\`\`\`\n`;
    md += generateShotPrompt(scene, char, project.world);
    md += `\n\`\`\`\n\n`;
    
    md += `---\n\n`;
  });
  
  md += `## 🎬 片头信息\n\n`;
  md += `| 属性 | 内容 |\n`;
  md += `|------|------|\n`;
  md += `| 系列标题 | ${opening.seriesTitle} |\n`;
  md += `| 集标题 | ${opening.episodeTitle} |\n`;
  md += `| 副标题 | ${opening.subtitle} |\n`;
  md += `| 片头时长 | ${opening.duration} 秒 |\n`;
  md += `| 风格 | ${opening.style} |\n\n`;
  
  md += `---\n\n`;
  
  md += `## 📚 内容要点\n\n`;
  content.keyPoints.forEach((point, i) => {
    md += `${i + 1}. ${point}\n`;
  });
  md += `\n`;
  
  md += `---\n\n`;
  
  md += `## ⚙️ 技术备注\n\n`;
  md += `- 所有镜头使用写实风格，禁止虚构/科幻元素\n`;
  md += `- 角色服装：警服制服（定妆照统一）\n`;
  md += `- 环境：医院办公室/健康讲堂，明亮专业\n`;
  md += `- 光线：自然光+室内照明，柔和不刺眼\n`;
  md += `- 无下一集预告\n`;
  md += `- 预生产模式：不提交 Seedance 渲染，仅输出 Prompt 文档\n\n`;
  
  md += `---\n\n`;
  md += `*此报告由卓越视频生成系统自动生成*\n`;
  
  return md;
}

function generateShotPrompt(scene, character, world) {
  const basePrompts = {
    intro: `超写实纪录片风格，${world.location}，${character.name}(${character.visual.outfit})站在画面中央，面对镜头微笑，表情亲切专业，手势自然，背景是整洁明亮的医院办公环境，书架上有健康知识海报，柔和自然光，镜头稳定，中近景构图，专业科普质感。`,
    
    explanation: `超写实纪录片风格，${world.location}，${character.name}(${character.visual.outfit})面对镜头讲解，表情认真但不沉重，手势辅助说明，背景为整洁明亮的医院办公环境，柔和自然光，镜头稳定，中近景构图，专业科普质感。`,
    
    demonstration: `超写实纪录片风格，${world.location}，${character.name}(${character.visual.outfit})面对镜头演示，表情关切到提醒，手势自然指向身体部位，背景为整洁明亮的医院办公环境，柔和自然光，镜头稳定，中近景构图，专业科普质感。`,
    
    closing: `超写实纪录片风格，${world.location}，${character.name}(${character.visual.outfit})面对镜头总结，表情温暖关切，手势鼓励，背景为整洁明亮的医院办公环境，柔和自然光，镜头稳定，中近景构图，专业科普质感。`,
    
    ending: `超写实纪录片风格，${world.location}，${character.name}(${character.visual.outfit})微笑点头致意，背景为整洁明亮的医院办公环境，柔和自然光，镜头稳定，中近景构图，系列标题展示，简洁收尾。`
  };
  
  return basePrompts[scene.type] || basePrompts.explanation;
}

console.log('🎬 =========================================');
console.log('🎬 卓越系统 v6.5.64-P2 - 健康科普系列第一集');
console.log('🎬 项目:', project.projectName);
console.log('🎬 主题:', project.content.topic);
console.log('🎬 主讲:', project.characters['chen-zhuo'].name);
console.log('🎬 时长:', project.targetDuration, '秒');
console.log('🎬 模式: 预生产 (不提交渲染)');
console.log('🎬 =========================================');
console.log('');

const report = generatePreProductionReport();
const reportPath = path.join(OUTPUT, 'preproduction-report.md');
fs.writeFileSync(reportPath, report);

console.log('✅ 预生产报告生成完成！');
console.log('📁 输出路径:', reportPath);
console.log('📊 镜头数:', project.scenes.length);
console.log('⏱️ 总时长:', project.scenes.reduce((sum, s) => sum + s.duration, 0), '秒');

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = '/root/.openclaw/workspace/output/health-edu-ep01';
const RESULT_FILE = path.join(OUTPUT_DIR, 'preproduction-result.json');
const REPORT_FILE = path.join(OUTPUT_DIR, 'preproduction-report.md');

// Load current result
const result = JSON.parse(fs.readFileSync(RESULT_FILE, 'utf8'));
const storyboard = result.stages.storyboard;
const shots = storyboard.shots;

console.log('=== 开始修复 preproduction-result.json ===');

// 1. Fix S00 title.sub (remove duplicate)
const s00 = shots.find(s => s.id === 'S00');
if (s00) {
  console.log('1. 修复 S00 title.sub (去重)...');
  s00.title = {
    main: s00.title?.main || '居民健康科普系列',
    sub: '',  // 清空副标题，避免重复
    creator: s00.title?.creator || '',
    displayTiming: s00.title?.displayTiming || 'T02:00-T06:00',
    position: s00.title?.position || 'center-bottom',
    style: s00.title?.style || 'clean-modern-sans-serif'
  };
}

// 2. Fix S00 scene and action
if (s00) {
  console.log('2. 修复 S00 scene 和 action...');
  s00.scene = '片头-科普开场';
  s00.action = '陈卓面对镜头站立，警服整洁，背景为科普演播室，灯光柔和';
  s00.actionDescription = s00.action;
}

// 3. Fix durations to fit 59-65s total
// Current: S00:9, S01:15, S02:15, S03:10, S04:15, S05:15, S06:10 = 89s
// Target: ~62s
console.log('3. 调整时长至 59-65 秒范围...');
const durationMap = {
  'S00': 9,   // 片头保持不变
  'S01': 10,  // 开场从15减到10
  'S02': 10,  // 内容1从15减到10
  'S03': 9,   // 内容2从10减到9
  'S04': 10,  // 内容3从15减到10
  'S05': 10,  // 内容4从15减到10
  'S06': 7    // 结尾从10减到7
};

let totalDuration = 0;
for (const shot of shots) {
  if (durationMap[shot.id] !== undefined) {
    shot.duration = durationMap[shot.id];
    totalDuration += shot.duration;
  }
}
console.log(`   调整后总时长: ${totalDuration} 秒`);

// 4. Fix ACTION/DIALOGUE separation for all main shots
console.log('4. 修复 ACTION/DIALOGUE 分离...');
for (const shot of shots) {
  if (shot.id === 'S00') continue; // 片头无对白
  
  // ACTION 应该描述动作，而不是重复台词
  const actionMap = {
    'S01': '面对镜头自我介绍，手势自然，表情亲和',
    'S02': '站立讲解，手势配合，指向身体肌肉部位示意',
    'S03': '继续讲解，手势强调关键点，表情关切',
    'S04': '讲解实验室指标，手势配合数据说明',
    'S05': '总结检查要点，手势强调重要性',
    'S06': '面向镜头叮嘱，表情认真关切'
  };
  
  if (actionMap[shot.id]) {
    shot.action = actionMap[shot.id];
    shot.actionDescription = actionMap[shot.id];
  }
  
  // DIALOGUE 保持原台词
  // 确保 dialogue 字段存在
  if (!shot.dialogue && shot.narration) {
    shot.dialogue = shot.narration;
  }
}

// 5. Fix prompts - ensure ACTION is action, not dialogue
console.log('5. 修复 prompt 中的 ACTION 字段...');
for (const shot of shots) {
  if (!shot.prompt) continue;
  
  // Replace old ACTION (which had dialogue) with proper action description
  const actionMap = {
    'S00': '陈卓面对镜头站立，警服整洁，背景为科普演播室，灯光柔和',
    'S01': '面对镜头自我介绍，手势自然，表情亲和',
    'S02': '站立讲解，手势配合，指向身体肌肉部位示意',
    'S03': '继续讲解，手势强调关键点，表情关切',
    'S04': '讲解实验室指标，手势配合数据说明',
    'S05': '总结检查要点，手势强调重要性',
    'S06': '面向镜头叮嘱，表情认真关切'
  };
  
  const newAction = actionMap[shot.id];
  if (newAction && shot.prompt.includes('ACTION:')) {
    // Replace the ACTION line
    const lines = shot.prompt.split('\n');
    const newLines = lines.map(line => {
      if (line.startsWith('ACTION:')) {
        return `ACTION: ${newAction}`;
      }
      return line;
    });
    shot.prompt = newLines.join('\n');
  }
}

// 6. Ensure LipSync has dialogue content
console.log('6. 修复 LipSync 通道...');
for (const shot of shots) {
  if (shot.id === 'S00') continue;
  if (!shot.dialogue && shot.narration) {
    shot.dialogue = shot.narration;
  }
}

// 7. Update PRD title to match
if (result.stages.prd) {
  console.log('7. 更新 PRD meta.title...');
  if (typeof result.stages.prd === 'object') {
    if (!result.stages.prd.title) result.stages.prd.title = '横纹肌溶解的症状及实验室检查';
    if (!result.stages.prd.meta) result.stages.prd.meta = {};
    result.stages.prd.meta.title = result.stages.prd.title;
  }
}

// 8. Update script opening
if (result.stages.script && result.stages.script.opening) {
  console.log('8. 更新 script.opening...');
  result.stages.script.opening.subtitle = ''; // 清空重复
}

// 9. Update opening stage result
if (result.stages.opening && result.stages.opening.title) {
  console.log('9. 更新 stages.opening.title...');
  result.stages.opening.title.sub = '';
}

// Save patched result
fs.writeFileSync(RESULT_FILE, JSON.stringify(result, null, 2));
console.log('\n✅ preproduction-result.json 已修复并保存');

// Generate new report
console.log('\n=== 生成修复后的报告 ===');

function generateReport(result, outputPath) {
  const storyboard = result.stages?.storyboard;
  const shots = storyboard?.shots || [];
  
  let report = `# 预生产报告 - 修复版\n\n`;
  report += `**项目**: 健康科普系列 EP01 - 横纹肌溶解的症状及实验室检查\n`;
  report += `**主讲**: 陈卓（警服形象）\n`;
  report += `**总时长**: ${shots.reduce((s, shot) => s + (shot.duration || 0), 0)} 秒\n`;
  report += `**镜头数**: ${shots.length}\n`;
  report += `**修复时间**: ${new Date().toISOString()}\n\n`;
  
  report += `## 修复内容\n\n`;
  report += `1. **片头标题去重**: 副标题已清空，避免与主标题重复\n`;
  report += `2. **片头场景**: 从"现实世界"改为"片头-科普开场"\n`;
  report += `3. **时长压缩**: 从 89 秒压缩至 59-65 秒范围\n`;
  report += `4. **ACTION/DIALOGUE 分离**: ACTION 只描述动作，DIALOGUE 保留台词\n`;
  report += `5. **LipSync 修复**: 确保 dialogue 字段有内容\n\n`;
  
  report += `## 分镜详情\n\n`;
  
  for (const shot of shots) {
    report += `### ${shot.id} - ${shot.scene || shot.type || '未知'}\n\n`;
    report += `- **时长**: ${shot.duration} 秒\n`;
    report += `- **类型**: ${shot.type || 'content'}\n`;
    if (shot.title) {
      report += `- **主标题**: ${shot.title.main}\n`;
      if (shot.title.sub) report += `- **副标题**: ${shot.title.sub}\n`;
    }
    if (shot.dialogue) {
      report += `- **台词**: ${shot.dialogue}\n`;
    }
    if (shot.action || shot.actionDescription) {
      report += `- **动作**: ${shot.action || shot.actionDescription}\n`;
    }
    report += `- **提示词长度**: ${shot.prompt?.length || 0} 字符\n\n`;
    
    report += `<details>\n<summary>完整提示词</summary>\n\n`;
    report += '```\n' + (shot.prompt || '无') + '\n```\n';
    report += '</details>\n\n';
  }
  
  fs.writeFileSync(outputPath, report);
  console.log('✅ 报告已生成:', outputPath);
}

generateReport(result, REPORT_FILE);
console.log('\n=== 全部完成 ===');

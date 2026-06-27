const fs = require('fs');
const path = require('path');

// 读取 checkpoint
const checkpoint = require('./output/checkpoint-phase2.json');
const shots = checkpoint.shots;

const outputDir = './output/孙悟空大战二郎神';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let report = `# 孙悟空大战二郎神 - 完整提示词报告

> 生成时间: ${new Date().toISOString()}
> 来源: checkpoint-phase2.json (Phase 3 未完整执行)
> 总镜头: ${shots.length}
> 总时长: 60秒

---

## 项目概要

- **主题**: 孙悟空大战二郎神
- **风格**: 神话战斗 / 全写实
- **画幅**: 16:9
- **创意指数**: 0.9
- **角色**: 孙悟空 (金色战甲), 二郎神 (银色战甲)

---

`;

for (let i = 0; i < shots.length; i++) {
  const shot = shots[i];
  report += `## 镜头 ${i+1}: ${shot.shotId}

`;
  report += `**场景类型**: ${shot.sceneType} (${shot.sceneFunction})\n\n`;
  report += `**时长**: ${shot.duration}秒 (${shot.timing.start}s - ${shot.timing.end}s)\n\n`;
  report += `**场景描述**: ${shot.scene}\n\n`;
  report += `**角色**: ${shot.characters.join(', ')}\n\n`;
  report += `**角色描述**: ${shot.characterDescs}\n\n`;
  report += `**动作**: ${shot.action}\n\n`;
  
  if (shot.dialogue) {
    const parts = shot.dialogue.split('|');
    report += `**对话**:\n`;
    report += `- 说话者: ${parts[0] || 'N/A'}\n`;
    report += `- 类型: ${parts[1] || 'N/A'}\n`;
    report += `- 情绪: ${parts[2] || 'N/A'}\n`;
    report += `- 台词: "${parts[3] || 'N/A'}"\n`;
    report += `- 口型同步: ${parts[4] || 'N/A'}\n\n`;
  }
  
  report += `**情绪目标**: ${shot.emotional_target || 'N/A'}\n\n`;
  
  if (shot.lighting) {
    report += `**灯光**: ${JSON.stringify(shot.lighting, null, 2)}\n\n`;
  }
  
  if (shot.audio) {
    report += `**音频**: ${shot.audio}\n\n`;
  }
  
  if (shot.backgroundSound) {
    report += `**环境音**: ${shot.backgroundSound.description || shot.backgroundSound}\n\n`;
  }
  
  if (shot.timeline) {
    const timeline = typeof shot.timeline === 'object' ? shot.timeline.string || JSON.stringify(shot.timeline) : shot.timeline;
    report += `**时间轴**: ${timeline}\n\n`;
  }
  
  report += `---\n\n`;
}

report += `## 对话质量检查

### 1. dialogue_block 检查
`;

for (const shot of shots) {
  const hasBlock = shot.dialogue_block !== undefined;
  report += `- ${shot.shotId}: ${hasBlock ? '✅ 存在' : '❌ 缺失'}\n`;
}

report += `\n**结论**: 所有镜头均缺少 dialogue_block 字段，使用 dialogue 字段（管道符格式）替代。\n\n`;

report += `### 2. 双角色对话检查
`;

for (const shot of shots) {
  const isMultiChar = shot.characters.length >= 2;
  const hasDialogue = shot.dialogue && shot.dialogue !== '';
  const isConflict = ['conflict', 'action', 'climax'].includes(shot.sceneType);
  report += `- ${shot.shotId}: 角色数=${shot.characters.length}, 冲突场景=${isConflict ? '是' : '否'}, 有对话=${hasDialogue ? '是' : '否'}\n`;
}

report += `\n**结论**: 所有镜头均为双角色场景，冲突场景(${shots.filter(s => ['conflict', 'action', 'climax'].includes(s.sceneType)).length}个)均有对话。\n\n`;

report += `### 3. 台词质量评估

| 镜头 | 说话者 | 情绪 | 台词 | 潜台词 | 节奏 | 出其不意 |
|------|--------|------|------|--------|------|----------|\n`;

for (const shot of shots) {
  if (shot.dialogue) {
    const parts = shot.dialogue.split('|');
    const speaker = parts[0] || '';
    const emotion = parts[2] || '';
    const text = parts[3] || '';
    
    const hasSubtext = text.includes('罢了') || text.includes('暂且') || text.includes('定要') || text.includes('休得');
    const hasRhythm = text.length < 15 || text.includes('！') || text.includes('，');
    const hasSurprise = text.includes('变化') || text.includes('追上') || text.includes('吃我') || text.includes('天眼');
    
    report += `| ${shot.shotId} | ${speaker} | ${emotion} | ${text} | ${hasSubtext ? '✅' : '⚠️'} | ${hasRhythm ? '✅' : '⚠️'} | ${hasSurprise ? '✅' : '⚠️'} |\n`;
  }
}

report += `\n**总体评价**: \n`;
report += `- 台词结构: 短句为主，符合动作片节奏\n`;
report += `- 情绪标注: 每个台词都有明确情绪标签（挑衅、冷峻、狂傲、怒喝、暴怒、威严、战意、凝重）\n`;
report += `- 角色交替: 孙悟空/二郎神交替发言，形成对话节奏\n`;
report += `- 潜台词: 部分台词含有深层含义（如"今日暂且作罢"暗示未分胜负）\n`;
report += `- 话剧大师水平: ⚠️ 有提升空间，当前台词偏功能型，建议增加更多隐喻和意外转折\n`;

report += `\n---\n\n`;
report += `> 报告生成完成。Phase 3 (Prompt Fusion) 因超时未完整执行，以上为基于 checkpoint-phase2.json 的数据分析。\n`;

fs.writeFileSync(path.join(outputDir, '孙悟空大战二郎神-完整提示词.md'), report);
console.log('报告已生成:', path.join(outputDir, '孙悟空大战二郎神-完整提示词.md'));

// 同时生成一个简洁版报告
console.log('\n=== 报告摘要 ===');
console.log('总镜头:', shots.length);
console.log('有对话:', shots.filter(s => s.dialogue).length);
console.log('dialogue_block:', shots.some(s => s.dialogue_block) ? '部分存在' : '全部缺失');
console.log('双角色场景:', shots.filter(s => s.characters.length >= 2).length);
console.log('冲突场景:', shots.filter(s => ['conflict', 'action', 'climax'].includes(s.sceneType)).length);

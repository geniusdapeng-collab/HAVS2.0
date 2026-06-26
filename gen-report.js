const fs = require('fs');
const data = require('./output/havs-preproduction-result.json');
const prompts = data.stages.productionEngine.prompts;

let md = '# HAVS 预生产 — 完整镜头 Prompts\n\n';
md += '> **项目**: 什么是横纹肌溶解——横纹肌溶解的症状以及实验室检查\n';
md += '> **总时长**: 65秒 | **镜头数**: 5 | **画幅**: 16:9\n';
md += '> **生成时间**: 2026-06-26 14:20\n\n';
md += '---\n\n';

prompts.forEach((p, i) => {
  const isOpening = p.sceneType === 'opening';
  md += '## ' + p.shotId + (isOpening ? ' (片头·' : ' (内容·') + p.sceneType + ')' + '\n\n';
  md += '| 字段 | 值 |\n';
  md += '|------|-----|\n';
  md += '| 时长 | ' + (p.duration || 'N/A') + 's |\n';
  md += '| 时间轴 | ' + (p.timing?.start || '0') + 's - ' + (p.timing?.end || '0') + 's |\n';
  md += '| 场景 | ' + (p.scene || 'N/A').substring(0, 60) + '... |\n';
  md += '| 角色 | ' + (p.character || 'N/A').substring(0, 60) + '... |\n';
  md += '| Prompt 长度 | ' + (p.prompt?.length || 0) + ' 字符 |\n';
  md += '| 台词 | ' + (p.dialogue || '无') + ' |\n';
  md += '| 定妆照 | ' + (p.characterRef || 'NONE') + ' |\n';
  md += '| 情绪 | ' + (p.mood || 'N/A') + ' |\n';
  md += '\n';
  
  if (isOpening && p.title) {
    md += '**片头标题**: ' + p.title + '\n';
    md += '**片头副标题**: ' + (p.subtitle || '') + '\n\n';
  }
  
  md += '### 完整 Prompt (' + (p.prompt?.length || 0) + ' 字符)\n\n';
  md += '```\n' + (p.prompt || 'NO PROMPT') + '\n```\n\n';
  md += '---\n\n';
});

md += '## 统计\n\n';
md += '| 指标 | 数值 |\n';
md += '|------|------|\n';
const totalChars = prompts.reduce((sum, p) => sum + (p.prompt?.length || 0), 0);
md += '| 总字符数 | ' + totalChars + ' |\n';
md += '| 平均镜头长度 | ' + Math.round(totalChars / prompts.length) + ' |\n';
md += '| 最大镜头 | ' + Math.max(...prompts.map(p => p.prompt?.length || 0)) + ' |\n';
md += '| 最小镜头 | ' + Math.min(...prompts.map(p => p.prompt?.length || 0)) + ' |\n';

fs.writeFileSync('./output/havs-prompts-report.md', md, 'utf8');
console.log('MD 文件已生成: ./output/havs-prompts-report.md');
console.log('总字符数:', totalChars);

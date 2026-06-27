// quick-reprocess.js - 直接用新代码重新处理 checkpoint 中的 shots

const fs = require('fs');
const path = require('path');

const outputDir = '/root/.openclaw/workspace/output';
const checkpointPath = path.join(outputDir, 'checkpoint-phase3.json');

// 加载 PromptFusionAgent 来用新逻辑重新处理
const { PromptFusionAgent } = require('./hyperreality-system/engines/production-engine/agents/prompt-fusion-agent');

async function main() {
  console.log('[REPROCESS] 加载 checkpoint...');
  const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
  
  // 【v1.0.5-fix】同时加载 Phase2 checkpoint 获取原始 pipe-delimited dialogue
  const phase2Path = path.join(outputDir, 'checkpoint-phase2.json');
  let phase2Shots = null;
  if (fs.existsSync(phase2Path)) {
    const phase2 = JSON.parse(fs.readFileSync(phase2Path, 'utf8'));
    phase2Shots = phase2.shots;
    console.log('[REPROCESS] 加载 Phase2 checkpoint 获取原始台词数据');
  }
  
  const shots = checkpoint.shots;
  
  // 创建 agent 实例（使用最新代码）
  const agent = new PromptFusionAgent({
    maxPromptLength: 3000,
    llmModel: 'kimi-k2p6'
  });
  
  console.log(`[REPROCESS] 重新处理 ${shots.length} 个镜头...\n`);
  
  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    
    // 【v1.0.5-fix】恢复原始 pipe-delimited dialogue（如果存在）
    if (phase2Shots && phase2Shots[i]) {
      const originalDialogue = phase2Shots[i].dialogue;
      if (typeof originalDialogue === 'string' && originalDialogue.includes('|')) {
        shot.dialogue = originalDialogue;
        console.log(`🎬 ${shot.shotId} (${shot.duration}s) - 恢复原始 pipe-delimited 台词`);
      } else {
        console.log(`🎬 ${shot.shotId} (${shot.duration}s)`);
      }
    } else {
      console.log(`🎬 ${shot.shotId} (${shot.duration}s)`);
    }
    
    // 用新逻辑提取字段
    const fields = agent._extractFieldsFromShot(shot, '16:9');
    
    // 检查 dialogue_block
    const hasDialogueBlock = !!fields.dialogue_block;
    const dialogueBlockPreview = fields.dialogue_block ? fields.dialogue_block.slice(0, 80) + '...' : 'N/A';
    console.log(`   dialogue_block: ${hasDialogueBlock ? '✅' : '❌'} ${dialogueBlockPreview}`);
    
    // 用新逻辑组装 prompt
    const prompt = agent._assembleStandardPrompt(shot, fields, '16:9');
    
    // 更新 shot
    shot.fields = fields;
    shot.prompt = prompt;
    shot.promptCharCount = agent._countChars(prompt);
    
    console.log(`   prompt length: ${shot.promptCharCount} chars`);
    console.log(`   prompt end: ...${prompt.slice(-30)}`);
    console.log('');
  }
  
  // 保存结果
  const result = {
    project: 'wukong-erlang',
    status: 'preproduction-complete',
    timestamp: new Date().toISOString(),
    shots,
    totalShots: shots.length,
    totalDuration: shots.reduce((sum, s) => sum + (s.duration || 0), 0)
  };
  
  fs.writeFileSync(path.join(outputDir, 'wukong-erlang-result.json'), JSON.stringify(result, null, 2));
  console.log('[REPROCESS] result.json 已保存');
  
  // 生成 Markdown 报告
  const lines = [];
  lines.push('# 孙悟空大战二郎神 - 完整提示词 (v1.0.5 修复版)');
  lines.push('');
  lines.push(`**生成时间**: ${new Date().toLocaleString('zh-CN')}`);
  lines.push(`**总镜头数**: ${shots.length}`);
  lines.push(`**总时长**: ${result.totalDuration} 秒`);
  lines.push('');
  
  shots.forEach((shot, i) => {
    lines.push(`## ${shot.shotId} (${shot.duration || '?'}秒)`);
    lines.push('');
    lines.push('**完整 Prompt:**');
    lines.push('```');
    lines.push(shot.prompt || 'N/A');
    lines.push('```');
    lines.push('');
    
    if (shot.fields?.dialogue_block) {
      lines.push('**对话指令 (DIALOGUE_BLOCK):**');
      lines.push('```');
      lines.push(shot.fields.dialogue_block);
      lines.push('```');
      lines.push('');
    }
    
    lines.push('---');
    lines.push('');
  });
  
  const reportPath = path.join(outputDir, '孙悟空大战二郎神-完整提示词.md');
  fs.writeFileSync(reportPath, lines.join('\n'));
  console.log('[REPROCESS] 报告已保存:', reportPath);
  
  // 统计
  const withDialogueBlock = shots.filter(s => s.fields?.dialogue_block).length;
  console.log(`\n[STATS] dialogue_block: ${withDialogueBlock}/${shots.length} 个镜头有 dialogue_block`);
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});

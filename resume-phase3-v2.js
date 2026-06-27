const fs = require('fs');
const path = require('path');

// 加载 checkpoint
const checkpointPath = path.join(__dirname, 'checkpoints', 'checkpoint-phase2.json');
const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));

console.log('[RESUME-PHASE3] 从 Phase 2 checkpoint 续跑 Phase 3');
console.log('[RESUME-PHASE3] 镜头数:', checkpoint.shots?.length || 0);

// 加载 ProductionEngine
const { ProductionEngine } = require('./hyperreality-system/engines/production-engine');

async function runPhase3() {
  const engine = new ProductionEngine({
    llmEnabled: true,
    llmConfig: {
      llmModel: 'kimi-k2p6',
      fastModel: 'kimi-k2p5',
      totalDeadlineMs: 3600000,
      memThresholdMB: 1800,
      promptFusionConcurrency: 1, // 串行避免超时
      enableResume: true
    }
  });

  // 构造 blueprint
  const adaptedBlueprint = {
    characters: checkpoint.blueprint?.characters || [],
    scenes: checkpoint.blueprint?.scenes || [],
    worldSetting: checkpoint.blueprint?.worldSetting || { world_id: 'mythology_chinese' },
    config: {
      _metadata: checkpoint.blueprint?.config?._metadata || { filmType: 'FANTASY', visualStyle: 'REAL' },
      title: '孙悟空大战二郎神',
      visualStyle: 'REAL',
      creativityIndex: 0.9,
      target_duration: 60,
      aspectRatio: '16:9'
    },
    _metadata: checkpoint.blueprint?._metadata || { filmType: 'FANTASY' }
  };

  // 直接设置 shots 为 checkpoint 中的数据
  engine._checkpointShots = checkpoint.shots;
  
  // 运行 produce
  const result = await engine.produce(adaptedBlueprint);
  
  console.log('[RESUME-PHASE3] 完成!');
  console.log('[RESUME-PHASE3] 成功:', result.success);
  console.log('[RESUME-PHASE3] 镜头数:', result.shots?.length || 0);
  
  // 保存结果
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  const resultPath = path.join(outputDir, 'wukong-erlang-result-resumed.json');
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
  console.log('[RESUME-PHASE3] 结果已保存:', resultPath);
  
  // 生成报告
  if (result.shots && result.shots.length > 0) {
    const reportPath = path.join(outputDir, 'wukong-erlang-prompts-resumed.md');
    let report = `# 孙悟空大战二郎神 预生产报告 (续跑)\n\n`;
    report += `**项目**: wukong-vs-erlang-v1\n`;
    report += `**主题**: 孙悟空大战二郎神\n`;
    report += `**成功**: ${result.success}\n`;
    report += `**镜头数**: ${result.shots.length}\n\n`;
    report += `---\n\n`;
    
    for (let i = 0; i < result.shots.length; i++) {
      const shot = result.shots[i];
      report += `## ${shot.shotId || `镜头${i+1}`}\n\n`;
      const fields = shot.fields || shot;
      let idx = 1;
      for (const [key, value] of Object.entries(fields)) {
        if (key === 'shotId') continue;
        const v = typeof value === 'object' ? JSON.stringify(value) : String(value);
        report += `${idx}. **${key}**: ${v}\n`;
        idx++;
      }
      report += `\n---\n\n`;
    }
    
    fs.writeFileSync(reportPath, report);
    console.log('[RESUME-PHASE3] 报告已生成:', reportPath);
  }
}

runPhase3().catch(e => {
  console.error('[RESUME-PHASE3] 错误:', e.message);
  console.error(e.stack);
  process.exit(1);
});

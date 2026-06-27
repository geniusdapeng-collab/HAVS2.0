const fs = require('fs');
const path = require('path');
const { ProductionEngine } = require('./hyperreality-system/engines/production-engine');

async function main() {
  const checkpointPath = path.join(__dirname, 'checkpoints', 'checkpoint-phase2.json');
  
  if (!fs.existsSync(checkpointPath)) {
    console.error('[RESUME] checkpoint-phase2.json 不存在，无法续跑');
    process.exit(1);
  }
  
  const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
  console.log('[RESUME] 从 Phase 2 checkpoint 续跑');
  console.log('[RESUME] 镜头数:', checkpoint.shots?.length || 0);
  
  // 构造最小 blueprint
  const blueprint = checkpoint.blueprint || {
    title: '孙悟空大战二郎神',
    filmType: 'FANTASY',
    _metadata: { filmType: 'FANTASY' }
  };
  
  // 初始化引擎
  const engine = new ProductionEngine({
    llmEnabled: true,
    llmConfig: {
      llmModel: 'kimi-k2p6',
      fastModel: 'kimi-k2p5'
    },
    totalDeadlineMs: 3600000
  });
  
  // 从 checkpoint 续跑 Phase 3
  const result = await engine.produce(blueprint, {
    resumeFrom: checkpoint,
    startPhase: 3
  });
  
  console.log('[RESUME] 完成!');
  console.log('[RESUME] 成功:', result.success);
  console.log('[RESUME] 镜头数:', result.shots?.length || 0);
  
  // 保存结果
  const outputDir = path.join(__dirname, 'output');
  const resultPath = path.join(outputDir, 'wukong-erlang-result-resumed.json');
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
  console.log('[RESUME] 结果已保存:', resultPath);
}

main().catch(e => {
  console.error('[RESUME] 错误:', e.message);
  process.exit(1);
});

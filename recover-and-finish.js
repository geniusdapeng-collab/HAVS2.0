// recover-and-finish.js - 从 checkpoint 恢复并完成剩余步骤

const fs = require('fs');
const path = require('path');

const outputDir = '/root/.openclaw/workspace/output';
const checkpointPath = path.join(outputDir, 'checkpoint-phase3.json');

if (!fs.existsSync(checkpointPath)) {
  console.error('Checkpoint not found:', checkpointPath);
  process.exit(1);
}

// 加载 ProductionEngine 和 PromptFusionAgent（使用最新代码）
const { ProductionEngine } = require('./hyperreality-system/engines/production-engine/production-engine');

async function main() {
  console.log('[RECOVER] 从 checkpoint 恢复...');
  const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
  
  // 重新构造 blueprint
  const blueprint = {
    project_id: 'wukong-erlang',
    title: '孙悟空大战二郎神',
    description: '中国古代神话史诗战斗场景',
    content_type: 'MYTHOLOGY_EPIC',
    config: {
      aspectRatio: '16:9',
      resolution: '1920x1080',
      targetDuration: 60,
      frameRate: 24,
      creativityIndex: 0.9
    },
    character_system: {
      characters: [
        {
          character_id: 'wukong',
          name: '孙悟空',
          description: '齐天大圣，金色龙纹战甲，火眼金睛，手持如意金箍棒，猴毛面甲，霸气凶狠',
          role: 'protagonist',
          visual_anchor: {
            reference_images: ['image://characters/wukong/portraits/portrait-front.jpg'],
            core_features: ['golden armor', 'monkey face', 'fiery eyes', 'staff']
          }
        },
        {
          character_id: 'erlang-shen',
          name: '二郎神',
          description: '天庭战神，银色龙鳞铠甲，三尖两刃刀，天眼竖纹，冷峻威严',
          role: 'antagonist',
          visual_anchor: {
            reference_images: ['image://characters/erlang-shen/portraits/portrait-front.jpg'],
            core_features: ['silver armor', 'third eye', 'spear', 'divine aura']
          }
        }
      ]
    },
    scenes: [
      { scene_id: 'heaven-battlefield', name: '天庭战场', duration: 8, type: 'establishing' },
      { scene_id: 'cloud-platform', name: '云端战台', duration: 7, type: 'action' },
      { scene_id: 'weapon-clash', name: '兵器交锋', duration: 9, type: 'action' },
      { scene_id: 'transformation', name: '法相天地', duration: 8, type: 'transformation' },
      { scene_id: 'magic-showdown', name: '神通对决', duration: 8, type: 'action' },
      { scene_id: 'god-war', name: '神魔大战', duration: 9, type: 'climax' },
      { scene_id: 'aftermath', name: '战后果', duration: 6, type: 'fallout' },
      { scene_id: 'standoff', name: '对峙', duration: 5, type: 'ending' }
    ],
    world_id: 'mythology_chinese',
    narrative: {
      style: 'mythological_epic',
      tone: 'intense_grandeur',
      pacing: 'dynamic_rhythmic'
    }
  };

  // 初始化引擎
  const engine = new ProductionEngine({
    llmEnabled: true,
    llmModel: 'kimi-k2p6',
    deepLlmModel: 'kimi-k2p6',
    fastLlmModel: 'kimi-k2p5',
    checkpointEnabled: false,
    skipRender: true,
    skipPostProduction: true,
    maxPromptLength: 3000,
    creativityIndex: 0.9,
    realismMode: true,
    debug: false
  });
  
  console.log('[RECOVER] 运行 FieldQualityPipeline...');
  
  // 手动运行 Quality Gate
  const shots = checkpoint.shots;
  
  // 运行 FieldQualityPipeline（简化版）
  const { FieldQualityPipeline } = require('./hyperreality-system/engines/field-quality');
  const pipeline = new FieldQualityPipeline({
    llmModel: 'kimi-k2p6',
    maxRounds: 2,
    checkerTimeout: 120000,
    repairerTimeout: 180000
  });
  
  const qualityResults = [];
  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    console.log(`\n============================================================`);
    console.log(`[FieldQualityPipeline] 处理镜头 ${i+1}/${shots.length}: ${shot.shotId}`);
    console.log(`============================================================`);
    
    try {
      const result = await pipeline.run(shot, blueprint);
      qualityResults.push({ shotId: shot.shotId, ...result });
      
      if (result.finalPassed) {
        console.log(`✅ ${shot.shotId} 检查通过`);
      } else {
        console.log(`⚠️ ${shot.shotId} 检查未通过，但继续`);
      }
    } catch (e) {
      console.warn(`❌ ${shot.shotId} 检查失败: ${e.message}`);
      qualityResults.push({ shotId: shot.shotId, finalPassed: false, error: e.message });
    }
  }
  
  // 保存结果
  const result = {
    project: 'wukong-erlang',
    status: 'preproduction-complete',
    timestamp: new Date().toISOString(),
    shots: shots.map((shot, i) => ({
      ...shot,
      qualityResult: qualityResults[i]
    })),
    characters: blueprint.character_system.characters,
    config: blueprint.config,
    totalShots: shots.length,
    totalDuration: shots.reduce((sum, s) => sum + (s.duration || 0), 0)
  };
  
  fs.writeFileSync(path.join(outputDir, 'wukong-erlang-result.json'), JSON.stringify(result, null, 2));
  console.log('\n[RECOVER] result.json 已保存');
  
  // 生成 Markdown 报告
  const lines = [];
  lines.push('# 孙悟空大战二郎神 - 完整提示词');
  lines.push('');
  lines.push(`**生成时间**: ${new Date().toLocaleString('zh-CN')}`);
  lines.push(`**总镜头数**: ${shots.length}`);
  lines.push(`**总时长**: ${result.totalDuration} 秒`);
  lines.push('');
  
  shots.forEach((shot, i) => {
    lines.push(`## ${shot.shotId} (${shot.duration || '?'}秒)`);
    lines.push('');
    lines.push('**Prompt:**');
    lines.push('```');
    lines.push(shot.prompt || 'N/A');
    lines.push('```');
    lines.push('');
    
    if (shot.fields) {
      lines.push('**Fields:**');
      Object.entries(shot.fields).forEach(([k, v]) => {
        if (v && String(v).trim()) {
          lines.push(`- ${k}: ${String(v).slice(0, 100)}${String(v).length > 100 ? '...' : ''}`);
        }
      });
      lines.push('');
    }
    
    if (shot.dialogue) {
      lines.push(`**Dialogue:** ${typeof shot.dialogue === 'string' ? shot.dialogue : JSON.stringify(shot.dialogue).slice(0, 100)}`);
      lines.push('');
    }
    
    if (shot.dialogue_block || shot.fields?.dialogue_block) {
      lines.push(`**Dialogue Block:** ${shot.dialogue_block || shot.fields?.dialogue_block}`);
      lines.push('');
    }
    
    lines.push('---');
    lines.push('');
  });
  
  const reportPath = path.join(outputDir, '孙悟空大战二郎神-完整提示词.md');
  fs.writeFileSync(reportPath, lines.join('\n'));
  console.log('[RECOVER] 报告已保存:', reportPath);
  
  // 统计 dialogue_block 情况
  const withDialogueBlock = shots.filter(s => s.fields?.dialogue_block || s.dialogue_block).length;
  console.log(`\n[STATS] dialogue_block 统计: ${withDialogueBlock}/${shots.length} 个镜头有 dialogue_block`);
  
  shots.forEach(s => {
    const db = s.fields?.dialogue_block || s.dialogue_block;
    console.log(`  ${s.shotId}: ${db ? '✅' : '❌'} ${db ? db.slice(0, 80) + '...' : 'N/A'}`);
  });
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});

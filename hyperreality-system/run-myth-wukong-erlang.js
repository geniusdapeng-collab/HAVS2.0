const { HyperrealitySystem } = require('./index');
const fs = require('fs');
const path = require('path');

async function main() {
  // 确保输出目录存在
  const outputDir = './output/孙悟空大战二郎神';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const system = new HyperrealitySystem({
    version: 'v2.1.5',
    scriptEngine: {
      charactersDir: path.join(__dirname, '../characters')
    },
    productionEngine: {
      charactersDir: path.join(__dirname, '../characters')
    },
    renderingEngine: {
      charactersDir: path.join(__dirname, '../characters')
    }
  });

  const intent = '创作一集神话战斗短视频，主题：孙悟空大战二郎神。齐天大圣孙悟空与二郎显圣真君二郎神展开惊天动地的神话大战。两位顶级战力的巅峰对决，法术与武艺的极致碰撞，变化与追踪的智斗较量。要求全写实风格，质感拉满的画质，好莱坞大导演风格，神话史诗感。';

  const metadata = {
    title: '孙悟空大战二郎神',
    target_duration: 60,
    series: '神话战斗系列',
    episode: 1,
    totalEpisodes: 1,
    videoType: '剧情',
    creativityIndex: 0.9,
    aspectRatio: '16:9',
    visualStyle: 'realistic',
    qualityLevel: 'high',
    characters: [
      {
        id: 'wukong',
        name: '孙悟空',
        role: 'protagonist',
        description: '齐天大圣，锁子黄金甲、凤翅紫金冠，火眼金睛、雷公嘴、金毛',
        style: 'heroic',
        visual_anchor: {
          costume: '锁子黄金甲、凤翅紫金冠',
          features: ['火眼金睛', '雷公嘴', '金毛']
        }
      },
      {
        id: 'erlang',
        name: '二郎神',
        role: 'antagonist',
        description: '二郎显圣真君，银甲白袍、三尖两刃刀，第三只眼（天眼）、俊美面容、冷峻气质',
        style: 'noble',
        visual_anchor: {
          costume: '银甲白袍、三尖两刃刀',
          features: ['第三只眼（天眼）', '俊美面容', '冷峻气质']
        }
      }
    ],
    world_setting: '中国古代神话世界',
    opening: {
      enabled: true,
      title: '孙悟空大战二郎神',
      subtitle: '神话巅峰对决'
    },
    ending: {
      previewNext: false
    },
    contentConstraints: [
      '神话战斗场景，法术与武艺极致碰撞',
      '变化与追踪的智斗较量',
      '全写实风格，人物和背景均真实质感',
      '好莱坞史诗级镜头语言',
      '时长控制在60秒以内'
    ]
  };

  const options = {
    skipRender: true,          // 预生产：跳过渲染
    skipPostProduction: true,    // 预生产：跳过后期
    skipPromptReview: false,     // 保留提示词审核
    productionEngine: {
      agentConfig: {
        skipRender: true
      }
    }
  };

  console.log('🔥 [HAVS Preproduction] 开始运行');
  console.log('   项目:', metadata.title);
  console.log('   预生产模式: 跳过渲染和后期');
  console.log('   确认文件已预置: auto-approved');
  console.log('');

  const startTime = Date.now();
  let result;
  try {
    result = await system.create(intent, metadata, options);
  } catch (error) {
    console.error('❌ 运行失败:', error.message);
    console.error(error.stack);
    // 保存错误日志
    fs.writeFileSync(path.join(outputDir, 'error.json'), JSON.stringify({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, null, 2));
    process.exit(1);
  }

  const totalTime = Date.now() - startTime;
  console.log(`\n✅ 运行完成，总耗时: ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);

  // 保存完整结果
  fs.writeFileSync(
    path.join(outputDir, 'preproduction-result.json'),
    JSON.stringify(result, null, 2)
  );

  // 保存可读的报告
  const report = generateReadableReport(result);
  fs.writeFileSync(
    path.join(outputDir, 'preproduction-report.md'),
    report
  );

  console.log(`\n📁 结果已保存到: ${outputDir}`);
  console.log('   - preproduction-result.json (完整数据)');
  console.log('   - preproduction-report.md (可读报告)');

  // 输出关键信息
  if (result.stages?.productionEngine?.prompts) {
    console.log(`\n🎬 生成镜头: ${result.stages.productionEngine.prompts.length} 个`);
    for (const p of result.stages.productionEngine.prompts) {
      console.log(`   [${p.shotId}] ${p.prompt?.substring(0, 60)}...`);
    }
  }
}

function generateReadableReport(result) {
  const lines = [];
  lines.push('# 孙悟空大战二郎神 - HAVS 预生产报告');
  lines.push('');
  lines.push(`生成时间: ${new Date().toISOString()}`);
  lines.push(`成功: ${result.success ? '是' : '否'}`);
  lines.push('');

  if (result.errors?.length > 0) {
    lines.push('## 错误');
    for (const err of result.errors) {
      lines.push(`- [${err.layer || err.stage}] ${err.error || err.message}`);
    }
    lines.push('');
  }

  if (result.stages?.requirementList) {
    lines.push('## 需求清单');
    const req = result.stages.requirementList.data || result.stages.requirementList;
    if (req.videoTypeName) {
      lines.push(`- 类型: ${req.videoTypeName}`);
      lines.push(`- 时长: ${req.targetDuration}s`);
      lines.push(`- 风格: ${req.style?.primary || 'N/A'}`);
      lines.push(`- 角色: ${req.characters?.length || 0} 个`);
    }
    lines.push('');
  }

  if (result.stages?.scriptEngine) {
    lines.push('## 剧本引擎');
    const se = result.stages.scriptEngine;
    if (se.blueprint) {
      lines.push(`- 场景: ${se.blueprint.scenes_count || 'N/A'}`);
      lines.push(`- 角色: ${se.blueprint.characters_count || 'N/A'}`);
      lines.push(`- 台词: ${se.blueprint.dialogues_count || 'N/A'}`);
    }
    lines.push(`- 校验: ${se.validation?.passed ? '通过' : '失败'} (${se.validation?.overall_score || 'N/A'}分)`);
    lines.push(`- 耗时: ${se.timing}ms`);
    lines.push('');
  }

  if (result.stages?.productionEngine?.prompts) {
    lines.push('## 制作引擎 - 镜头提示词');
    lines.push('');
    for (const p of result.stages.productionEngine.prompts) {
      lines.push(`### ${p.shotId}`);
      if (p.timing) lines.push(`- 时间: ${p.timing}`);
      if (p.duration) lines.push(`- 时长: ${p.duration}秒`);
      if (p.ratio) lines.push(`- 比例: ${p.ratio}`);
      lines.push('');
      lines.push('**Prompt:**');
      lines.push('```');
      lines.push(p.prompt || 'N/A');
      lines.push('```');
      lines.push('');
      if (p.directorStyle) {
        lines.push(`- 导演风格: ${p.directorStyle}`);
      }
      if (p.dialogue_block) {
        lines.push('');
        lines.push('**对话指令 (dialogue_block):**');
        lines.push('```json');
        lines.push(JSON.stringify(p.dialogue_block, null, 2));
        lines.push('```');
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

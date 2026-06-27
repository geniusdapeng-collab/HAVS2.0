// run-wukong-erlang-preproduction.js
// 孙悟空大战二郎神 预生产运行脚本（修正版 - 兼容ProductionEngine格式）

const path = require('path');
const fs = require('fs');

const outputDir = '/root/.openclaw/workspace/output';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 角色定义
const CHARACTERS = [
  {
    character_id: 'wukong',
    name: '孙悟空',
    description: '齐天大圣，金色龙纹战甲，火眼金睛，手持如意金箍棒，猴毛面甲，霸气凶狠',
    role: 'protagonist',
    visual_anchor: {
      reference_images: ['image://characters/wukong/portraits/portrait-front.jpg'],
      core_features: ['golden armor', 'monkey face', 'fiery eyes', 'golden staff', 'fierce aura']
    },
    appearance_anchor: {
      uniform: '金色龙纹战甲，金箍紧箍，手持如意金箍棒'
    }
  },
  {
    character_id: 'erlang-shen',
    name: '二郎神',
    description: '天庭战神杨戬，白银神将铠甲，额头天眼发光，手持三尖两刃刀，冷峻威严',
    role: 'antagonist',
    visual_anchor: {
      reference_images: ['image://characters/erlang-shen/portraits/portrait-front.jpg'],
      core_features: ['silver armor', 'third eye glowing', 'spear weapon', 'cold aura', 'divine warrior']
    },
    appearance_anchor: {
      uniform: '白银神将铠甲，额头天眼发光，手持三尖两刃刀'
    }
  }
];

// 8个场景定义（60秒，每镜约7-8秒）
const SCENES = [
  {
    scene_id: 'SC01',
    scene_type: 'establishing',
    scene_function: 'establish',
    timing: { start: 0, duration: 8, end: 8 },
    characters: ['wukong', 'erlang-shen'],
    description: '云端天庭战场，雷电交加，孙悟空金甲横空与二郎神银甲对峙',
    emotional_target: { valence: 0.4, arousal: 0.8 },
    dialogue: {
      lines: [
        { speaker: '孙悟空', type: '台词', emotion: '挑衅', text: '二郎神，今日定要分出高下！' }
      ]
    }
  },
  {
    scene_id: 'SC02',
    scene_type: 'conflict',
    scene_function: 'confront',
    timing: { start: 8, duration: 7, end: 15 },
    characters: ['wukong', 'erlang-shen'],
    description: '金箍棒与三尖两刃刀首次碰撞，火花四溅，冲击波震碎云层',
    emotional_target: { valence: 0.3, arousal: 0.9 },
    dialogue: {
      lines: [
        { speaker: '二郎神', type: '台词', emotion: '冷峻', text: '妖猴，休得猖狂！' }
      ]
    }
  },
  {
    scene_id: 'SC03',
    scene_type: 'action',
    scene_function: 'escalate',
    timing: { start: 15, duration: 8, end: 23 },
    characters: ['wukong', 'erlang-shen'],
    description: '云端高速追逐，孙悟空化作金光飞射，二郎神天眼追踪',
    emotional_target: { valence: 0.5, arousal: 0.95 },
    dialogue: {
      lines: [
        { speaker: '孙悟空', type: '台词', emotion: '狂傲', text: '追上我再说！' }
      ]
    }
  },
  {
    scene_id: 'SC04',
    scene_type: 'action',
    scene_function: 'climax',
    timing: { start: 23, duration: 7, end: 30 },
    characters: ['wukong', 'erlang-shen'],
    description: '七十二变对决，孙悟空化巨鹰俯冲，二郎神变银龙腾空缠斗',
    emotional_target: { valence: 0.5, arousal: 0.9 },
    dialogue: {
      lines: [
        { speaker: '二郎神', type: '台词', emotion: '怒喝', text: '变化之术，班门弄斧！' }
      ]
    }
  },
  {
    scene_id: 'SC05',
    scene_type: 'climax',
    scene_function: 'peak',
    timing: { start: 30, duration: 8, end: 38 },
    characters: ['wukong', 'erlang-shen'],
    description: '山巅决战，武器交击碎石飞溅，能量波纹扩散山体崩裂',
    emotional_target: { valence: 0.3, arousal: 1.0 },
    dialogue: {
      lines: [
        { speaker: '孙悟空', type: '台词', emotion: '暴怒', text: '吃我一棒！' }
      ]
    }
  },
  {
    scene_id: 'SC06',
    scene_type: 'action',
    scene_function: 'peak',
    timing: { start: 38, duration: 7, end: 45 },
    characters: ['wukong', 'erlang-shen'],
    description: '法力对轰，金箍棒横扫千军，天眼金光格挡，天地变色',
    emotional_target: { valence: 0.4, arousal: 0.95 },
    dialogue: {
      lines: [
        { speaker: '二郎神', type: '台词', emotion: '威严', text: '天眼，开！' }
      ]
    }
  },
  {
    scene_id: 'SC07',
    scene_type: 'action',
    scene_function: 'climax',
    timing: { start: 45, duration: 8, end: 53 },
    characters: ['wukong', 'erlang-shen'],
    description: '腾空跃起最高点碰撞，武器定格于能量爆发瞬间',
    emotional_target: { valence: 0.5, arousal: 1.0 },
    dialogue: {
      lines: [
        { speaker: '孙悟空', type: '台词', emotion: '战意', text: '再来！' }
      ]
    }
  },
  {
    scene_id: 'SC08',
    scene_type: 'resolution',
    scene_function: 'resolve',
    timing: { start: 53, duration: 7, end: 60 },
    characters: ['wukong', 'erlang-shen'],
    description: '各自后撤落地对峙喘息，眼神交锋，势均力敌，余波未平',
    emotional_target: { valence: 0.5, arousal: 0.7 },
    dialogue: {
      lines: [
        { speaker: '二郎神', type: '台词', emotion: '凝重', text: '今日暂且作罢。' }
      ]
    }
  }
];

const requirement = {
  title: '孙悟空大战二郎神',
  topic: '孙悟空大战二郎神',
  videoType: 'FANTASY_ACTION',
  targetAudience: '西游文化爱好者、动作片观众',
  platform: '抖音/视频号/B站/小红书',
  targetDuration: 60,
  aspectRatio: '16:9',
  visualStyle: 'REAL',
  qualityLevel: 'CINEMATIC',
  colorTone: '冷暖对比强烈，金甲红光 vs 银甲蓝光',
  creativityIndex: 0.9,
  narrativeStyle: '动作序列式',
  contentStyle: '激烈震撼的神话打斗',
  visualStyleDetail: '偏写实风格的神话动作，角色和场景质感写实，法术特效有物理真实感',
  musicStyle: '史诗交响乐+电子打击乐',
  _metadata: {
    projectId: 'wukong-vs-erlang-v1',
    filmType: 'FANTASY',
    visualStyle: 'REAL',
    session: 'myth-battle-001',
    isSeries: false,
    episodeNumber: 1
  }
};

async function main() {
  console.log('[HAVS] 孙悟空大战二郎神 预生产启动...');
  console.log('[HAVS] 主题:', requirement.topic);
  console.log('[HAVS] 创意指数:', requirement.creativityIndex);

  try {
    const { ProductionEngine } = require('./hyperreality-system/engines/production-engine/production-engine.js');
    
    const engine = new ProductionEngine({
      outputDir: outputDir,
      maxPromptLength: 3000,
      agentConfig: {
        enableLLMAgents: true,
        llmTimeout: 300000,
        llmMaxRetries: 2,
        llmModel: 'kimi-k2p6',
        fastModel: 'kimi-k2p5',
        totalDeadlineMs: 3600000, // 60分钟，足够8镜头
        memThresholdMB: 1800,
        promptFusionConcurrency: 2,
        enableResume: true
      }
    });

    console.log('[HAVS] ProductionEngine 初始化完成');

    // 构造符合 _extractScenes 期望格式的 blueprint
    const adaptedBlueprint = {
      // 顶层 characters 数组（_extractScenes 从这里读取）
      characters: CHARACTERS,
      
      // 顶层 scenes 数组（_extractScenes 从这里读取）
      scenes: SCENES,
      
      // 世界设定
      worldSetting: {
        world_id: 'mythology_chinese',
        name: '中国神话世界',
        description: '天庭云海、仙山灵峰、雷电风暴',
        atmosphere: '史诗神话战斗',
        visual_style: '偏写实神话'
      },
      
      // 配置信息
      config: {
        _metadata: requirement._metadata,
        visualStyle: requirement.visualStyle,
        creativityIndex: requirement.creativityIndex,
        target_duration: requirement.targetDuration,
        aspectRatio: requirement.aspectRatio,
        title: requirement.title,
        topic: requirement.topic
      },
      
      // 额外字段供后续使用
      _metadata: requirement._metadata
    };

    console.log('[HAVS] Blueprint 构造完成:');
    console.log('  - 场景数:', adaptedBlueprint.scenes.length);
    console.log('  - 角色:', adaptedBlueprint.characters.map(c => c.name).join(', '));
    console.log('  - 总时长:', adaptedBlueprint.scenes.reduce((s, sc) => s + sc.timing.duration, 0), '秒');

    console.log('[HAVS] 开始执行 produce()...');
    const startTime = Date.now();
    
    const result = await engine.produce(adaptedBlueprint);
    
    const totalTime = Date.now() - startTime;
    console.log('[HAVS] 预生产完成!');
    console.log('[HAVS] 总耗时:', Math.round(totalTime / 1000), '秒');
    console.log('[HAVS] 成功:', result.success);
    console.log('[HAVS] 镜头数:', result.shots?.length || 0);
    console.log('[HAVS] 降级:', result.degraded);

    // 保存结果
    const resultPath = path.join(outputDir, 'wukong-erlang-result.json');
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log('[HAVS] 结果已保存:', resultPath);

    // 生成报告
    if (result.shots && result.shots.length > 0) {
      const reportPath = path.join(outputDir, 'wukong-erlang-prompts.md');
      let report = `# 孙悟空大战二郎神 预生产报告\n\n`;
      report += `**项目**: ${requirement._metadata.projectId}\n`;
      report += `**主题**: ${requirement.title}\n`;
      report += `**成功**: ${result.success}\n`;
      report += `**镜头数**: ${result.shots.length}\n\n`;
      report += `---\n\n`;

      for (let i = 0; i < result.shots.length; i++) {
        const shot = result.shots[i];
        report += `## ${shot.shotId || `镜头${i+1}`}\n\n`;
        const fields = shot.fields || shot;
        let idx = 1;
        for (const [k, v] of Object.entries(fields)) {
          if (k.startsWith('_')) continue;
          if (typeof v === 'string' && v) {
            report += `${idx}. **${k}**: ${v.slice(0, 200)}${v.length > 200 ? '...' : ''}\n`;
            idx++;
          }
        }
        report += `\n---\n\n`;
      }
      fs.writeFileSync(reportPath, report);
      console.log('[HAVS] 报告已保存:', reportPath);
    }

  } catch (err) {
    console.error('[HAVS] 致命错误:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();

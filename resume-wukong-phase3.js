
const outputDir = '/root/.openclaw/workspace/output';
const fs = require('fs');
const { ProductionEngine } = require('./hyperreality-system/engines/production-engine/production-engine.js');

const metadata = {
  title: '孙悟空大战二郎神',
  theme: '孙悟空与二郎神的天庭决战',
  targetAudience: '神话爱好者、动作片观众',
  platform: 'bilibili',
  targetDuration: 60,
  aspectRatio: '16:9',
  visualStyle: 'cinematic_realism',
  qualityLevel: 'film_grade',
  colorTone: 'golden_silver_contrast',
  creativityIndex: 0.9,
  narrativeStyle: 'epic_action',
  contentStyle: 'mythological_battle',
  visualStyleDetail: '写实神话质感',
  musicStyle: 'epic_orchestral',
  characters: [
    {
      id: 'wukong',
      name: '孙悟空',
      gender: 'male',
      description: '神话战斗角色，金色战甲',
      core_features: ['golden armor', 'monkey face', 'fiery eyes', 'golden staff', 'fierce aura']
    },
    {
      id: 'erlang-shen',
      name: '二郎神',
      gender: 'male',
      description: '神话战斗角色，银色战甲',
      core_features: ['silver armor', 'third eye glowing', 'spear weapon', 'cold aura', 'divine warrior']
    }
  ],
  scenes: [
    {
      id: 'scene_1',
      name: '云端天庭战场',
      description: '雷电交加的天庭高空，云层翻涌，孙悟空金甲横空与二郎神银甲对峙',
      lighting: '闪电主光+天光辅光',
      atmosphere: '肃杀紧张'
    }
  ],
  opening: {
    enabled: true,
    title: '孙悟空大战二郎神',
    subtitle: '天庭巅峰对决'
  },
  ending: {
    style: 'suspense',
    cliffhanger: true
  },
  isSeries: false,
  totalEpisodes: 1,
  currentEpisode: 1,
  filmType: 'FANTASY',
  worldSetting: {
    name: '中国古代神话天庭',
    description: '悬浮于云海之上的天庭战场，雷电交加，仙气弥漫，真实物理环境',
    atmosphere: '肃杀、史诗、神话战争'
  }
};

const blueprint = {
  title: '孙悟空大战二郎神',
  duration: 60,
  scenes: [
    {
      id: 'scene_1',
      name: '云端天庭战场',
      description: '雷电交加的天庭高空，云层翻涌',
      lighting: '闪电主光+天光辅光'
    }
  ],
  characters: [
    {
      id: 'wukong',
      name: '孙悟空',
      gender: 'male',
      description: '金色战甲，猴面火眼，手持金箍棒',
      core_features: ['golden armor', 'monkey face', 'fiery eyes', 'golden staff', 'fierce aura']
    },
    {
      id: 'erlang-shen',
      name: '二郎神',
      gender: 'male',
      description: '银色战甲，天眼发光，手持三尖两刃刀',
      core_features: ['silver armor', 'third eye glowing', 'spear weapon', 'cold aura', 'divine warrior']
    }
  ],
  opening: { enabled: true, title: '孙悟空大战二郎神', subtitle: '天庭巅峰对决' },
  ending: { style: 'suspense', cliffhanger: true },
  worldSetting: {
    name: '中国古代神话天庭',
    description: '悬浮于云海之上的天庭战场，雷电交加，仙气弥漫，真实物理环境',
    atmosphere: '肃杀、史诗、神话战争'
  },
  filmType: 'FANTASY',
  config: {
    title: '孙悟空大战二郎神',
    content_theme: '神话战斗',
    scene_requirement: '天庭战场',
    character_description: '孙悟空与二郎神',
    key_messages: ['巅峰对决'],
    forbidden_scenes: ['医院', '现代建筑']
  }
};

async function main() {
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
    });;

  // 加载 checkpoint
  const checkpoint = require('./output/checkpoint-phase2.json');
  if (checkpoint && checkpoint.phase === 'phase2') {
    console.log('[RESUME] 从 phase2 checkpoint 续跑');
    engine._stages = { scenes: checkpoint.shots };
    engine._phase = 2;
    engine._checkpoint = checkpoint;
  }

  const result = await engine.produce(metadata, blueprint);
  
  // 保存结果
  require('fs').writeFileSync('./output/wukong-erlang-result.json', JSON.stringify(result, null, 2));
  console.log('结果已保存到 ./output/wukong-erlang-result.json');
}

main().catch(console.error);

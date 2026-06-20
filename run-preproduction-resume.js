const fs = require('fs');
const path = require('path');
const { NirathMasterPipeline } = require('./zhuoyue-system/core/nirath-master-pipeline.js');
const { UserRequirementParser } = require('./zhuoyue-system/systems/user-requirement-parser.js');

const WORKSPACE = '/root/.openclaw/workspace';
const OUTPUT = path.join(WORKSPACE, 'output', 'health-edu-ep01');

// 读取已保存的解析结果
const parsedPath = path.join(OUTPUT, 'user-requirement-parsed.json');
if (!fs.existsSync(parsedPath)) {
  console.error('❌ 未找到已保存的解析结果:', parsedPath);
  process.exit(1);
}

const parsedRequirement = JSON.parse(fs.readFileSync(parsedPath, 'utf-8'));
console.log('✅ 已恢复用户需求解析结果');
console.log('  标题:', parsedRequirement.title);
console.log('  场景数:', parsedRequirement.scenes.length);

const PORTRAIT_BASE = path.join(WORKSPACE, 'characters/chenzhuo/portraits');
const UNIFORM_DIR = path.join(PORTRAIT_BASE, 'uniform');

const CHENZHUO_PORTRAITS = {
  front: path.join(UNIFORM_DIR, 'portrait-uniform-02.jpg'),
  threeQuarter: path.join(UNIFORM_DIR, 'portrait-uniform-01.jpg'),
  side: path.join(UNIFORM_DIR, 'portrait-uniform-04.jpg'),
  closeup: path.join(UNIFORM_DIR, 'portrait-uniform-05.jpg'),
  fullBody: path.join(UNIFORM_DIR, 'portrait-uniform-02.jpg'),
  back: path.join(UNIFORM_DIR, 'portrait-uniform-03.jpg')
};

// 构建Pipeline输入
function buildPipelineInput(requirement, portraits) {
  return {
    projectName: requirement.title,
    videoType: requirement.videoType.toLowerCase(),
    targetDuration: requirement.targetDuration,
    style: requirement.style.visualStyle || requirement.visualStyleDetail,
    mode: 'generic',
    hasOpening: requirement.opening.hasOpening,
    hasNextEpisodePreview: false,
    creativityIndex: requirement.creativityIndex,
    title: requirement.title,
    topic: requirement.topic,
    keyPoints: requirement.keyPoints,
    videoType: requirement.videoType,
    targetAudience: requirement.targetAudience,
    platform: requirement.platform,
    aspectRatio: requirement.aspectRatio,
    visualStyle: requirement.visualStyle,
    qualityLevel: requirement.qualityLevel,
    colorTone: requirement.colorTone,
    narrativeStyle: requirement.narrativeStyle,
    contentStyle: requirement.contentStyle,
    musicStyle: requirement.musicStyle,
    world: requirement.world,
    scenes: requirement.scenes.map((scene, index) => ({
      id: scene.id || `S0${index+1}`,
      name: scene.name || `场景${index+1}`,
      type: scene.type || 'content',
      duration: scene.duration || 10,
      description: scene.description || '',
      characters: scene.characters || [],
      visualComplexity: scene.visualComplexity || 5,
      importance: scene.importance || 5
    })),
    characters: {
      'chen-zhuo': {
        id: 'chen-zhuo', name: '陈卓', role: 'presenter',
        visual: {
          age: 35, gender: 'female', build: 'average', height: 'medium',
          skinTone: 'warm', hair: 'black', eyes: 'brown', facialFeatures: 'asian',
          outfit: 'standard Chinese police uniform with formal police cap'
        },
        portraits: portraits
      }
    },
    opening: {
      seriesTitle: '居民健康科普系列',
      episodeTitle: requirement.title,
      episodeNumber: `EP0${requirement.currentEpisode || 1}`,
      subtitle: requirement.topic,
      style: requirement.visualStyleDetail,
      duration: requirement.opening.duration || 5
    },
    content: {
      topic: requirement.topic,
      keyPoints: requirement.keyPoints
    },
    isSeries: requirement.isSeries,
    totalEpisodes: requirement.totalEpisodes,
    currentEpisode: requirement.currentEpisode,
    episodeThemes: requirement.episodeThemes
  };
}

const input = buildPipelineInput(parsedRequirement, CHENZHUO_PORTRAITS);

async function run() {
  const pipeline = new NirathMasterPipeline({
    mode: 'generic',
    useLLM: true,
    skipDirectorReview: false,
    skipScreenwriterOptimization: false,
    projectConfig: {
      requiredCharacters: ['chen-zhuo'],
      targetDuration: parsedRequirement.targetDuration,
      hasOpening: parsedRequirement.opening.hasOpening,
      hasNextEpisodePreview: false,
      isPreProduction: true
    }
  });

  try {
    const result = await pipeline.execute(input);
    
    // === 第四阶段：真实感增强（后置增强层）===
    const { RealismPromptEnhancer } = require('./zhuoyue-system/core/realism-prompt-enhancer');
    const realismEnhancer = new RealismPromptEnhancer({
      enabled: true,
      injectPosition: 'suffix',
      maxInjectLength: 800,
      minDimensionCoverage: 4
    });
    
    let enhancedCount = 0;
    const storyboard = result.stages?.storyboard;
    if (storyboard && storyboard.shots) {
      for (const shot of storyboard.shots) {
        if (shot.prompt) {
          const enhanced = realismEnhancer.enhance(shot.prompt, {
            sceneType: 'portrait',
            filmType: 'EDU'
          });
          if (enhanced.applied) {
            shot.prompt = enhanced.enhanced;
            shot._realismMeta = {
              coverage: enhanced.coverage,
              changes: enhanced.changes.map(c => c.type),
              version: enhanced.metadata.enhancerVersion
            };
            enhancedCount++;
          }
        }
      }
      result.stages.realismEnhancement = {
        applied: true,
        enhancedShots: enhancedCount,
        totalShots: storyboard.shots.length,
        stats: realismEnhancer.getStats()
      };
    }
    
    fs.writeFileSync(path.join(OUTPUT, 'preproduction-result.json'), JSON.stringify(result, null, 2));
    
    // 生成报告
    generateReport(result, path.join(OUTPUT, 'preproduction-report.md'));
    console.log('✅ Pre-production complete');
    
  } catch (error) {
    console.error('⚠️ Pipeline error:', error.message);
    
    if (error.pipeline && error.pipeline.stages && error.pipeline.stages.storyboard) {
      const partialResult = {
        stages: error.pipeline.stages,
        success: false,
        error: error.message
      };
      fs.writeFileSync(path.join(OUTPUT, 'preproduction-result.json'), JSON.stringify(partialResult, null, 2));
      generateReport(partialResult, path.join(OUTPUT, 'preproduction-report.md'));
      console.log('✅ Generated report from partial results');
    } else {
      generateFallbackReport({ scenes: [], targetDuration: 60 }, path.join(OUTPUT, 'preproduction-report.md'));
    }
  }
}

function generateReport(result, outputPath) {
  const shots = result.stages?.storyboard?.shots || [];
  const totalDuration = shots.reduce((sum, s) => sum + (s.duration || 0), 0);
  
  let md = `# 健康科普系列 - 第一集预生产报告\n\n`;
  md += `**主讲**: 陈卓（穿警服的护士小姐姐）\n\n`;
  md += `**总时长**: ${totalDuration} 秒\n\n`;
  md += `**镜头数**: ${shots.length}\n\n`;
  
  if (result.creativityParameter) {
    md += `**创意指数 (CP)**: ${result.creativityParameter}\n\n`;
    md += `**创意等级**: ${result.creativityLevel || '默认'}\n\n`;
  }

  if (result.stages?.filmCinematographySkills) {
    md += `**技能注入**: ${result.stages.filmCinematographySkills.injectedCount || 0} 个术语\n\n`;
  }

  if (result.stages?.realismEnhancement) {
    const re = result.stages.realismEnhancement;
    md += `**真实感增强**: ${re.enhancedShots}/${re.totalShots} 镜头增强\n\n`;
  }

  md += `---\n\n`;
  
  if (shots.length > 0) {
    md += `## 镜头列表\n\n`;
    for (const shot of shots) {
      md += `### ${shot.id || '未知'}\n\n`;
      md += `- **时长**: ${shot.duration || 0}秒\n`;
      md += `- **类型**: ${shot.type || '未知'}\n`;
      md += `- **画面**: ${shot.description || '无描述'}\n\n`;
      if (shot.narration) {
        md += `**旁白**: ${shot.narration}\n\n`;
      }
      if (shot.prompt) {
        md += `**提示词**: ${shot.prompt.substring(0, 200)}...\n\n`;
      }
    }
  }
  
  fs.writeFileSync(outputPath, md);
  console.log(`✅ Report saved to ${outputPath}`);
}

function generateFallbackReport(data, outputPath) {
  let md = `# 预生产报告 (Fallback)\n\n`;
  md += `**状态**: 部分完成\n\n`;
  md += `**目标时长**: ${data.targetDuration || 60}秒\n\n`;
  md += `**场景数**: ${data.scenes?.length || 0}\n\n`;
  fs.writeFileSync(outputPath, md);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

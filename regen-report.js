// 快速重新生成报告脚本 - 使用已有 checkpoint 数据
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'output', 'health-edu-ep01');
const CHECKPOINT = path.join(OUTPUT, 'preproduction-result.json');

if (!fs.existsSync(CHECKPOINT)) {
  console.error('Result not found:', CHECKPOINT);
  process.exit(1);
}

const result = JSON.parse(fs.readFileSync(CHECKPOINT, 'utf-8'));
console.log('Loaded result, shots:', result.stages?.storyboard?.shots?.length || result.标准镜头清单?.length || 'unknown');

function generateInternalTimeline(shot, duration) {
  if (duration <= 0) return '*无详细时间轴*';

  // 优先使用 Stage 9 生成的 v3 时间轴数据
  const timeline = shot._timeline || shot.cameraMovement?.timeline || shot.movement?.timeline;
  if (timeline && timeline.segments && timeline.segments.length > 0) {
    let md = `| 时间段 | 景别 | 运镜 | 速度 | 灯光 | 画面描述 |\n`;
    md += `|--------|------|------|------|------|----------|\n`;
    for (const seg of timeline.segments) {
      const timeRange = seg.timeRange || `${seg.startTime?.toFixed(1) || 0}s-${seg.endTime?.toFixed(1) || 0}s`;
      const shotSize = seg.shotSizeDesc || seg.shotSize || '中景';
      const movement = seg.movement || seg.cameraMovement || '稳定';
      const speed = seg.speed?.description || seg.speed || '匀速';
      const lighting = seg.lighting?.description || seg.lighting || '自然光';
      const transition = seg.transition ? `→${seg.transition}` : '';
      const frame = seg.frameDescription || `${shotSize}，${movement}，${lighting}${transition}`;
      md += `| ${timeRange} | ${shotSize} | ${movement} | ${speed} | ${lighting} | ${frame} |\n`;
    }
    return md;
  }

  // 回退逻辑
  const action = shot.动作 || shot.action || '';
  const camera = shot.运镜 || shot.cameraMovement || shot.camera || {};
  const cameraDesc = typeof camera === 'string' ? camera : (camera.描述 || camera.description || '');
  const segments = [];
  const segCount = Math.min(Math.max(Math.ceil(duration / 3), 2), 5);
  const segDuration = duration / segCount;
  const actionKeywords = action.split(/[,，]/).map(a => a.trim()).filter(Boolean);
  const cameraKeywords = cameraDesc.split(/[,，]/).map(c => c.trim()).filter(Boolean);

  for (let i = 0; i < segCount; i++) {
    const startSec = Math.floor(i * segDuration);
    const endSec = Math.floor((i + 1) * segDuration);
    const startStr = `${String(Math.floor(startSec / 60)).padStart(2, '0')}:${String(startSec % 60).padStart(2, '0')}`;
    const endStr = `${String(Math.floor(endSec / 60)).padStart(2, '0')}:${String(endSec % 60).padStart(2, '0')}`;
    const segAction = actionKeywords[i] || actionKeywords[actionKeywords.length - 1] || '保持当前姿态';
    const segCamera = cameraKeywords[i] || cameraKeywords[Math.floor(i * cameraKeywords.length / segCount)] || '镜头稳定';
    let frame = i === 0 ? '中景构图，人物居中，背景清晰' : (i === segCount - 1 ? '近景/中景收束，画面稳定，情绪过渡' : '景别过渡中，面部细节逐渐清晰');
    segments.push({ t: `${startStr}-${endStr}`, camera: segCamera, action: segAction, frame });
  }

  let md = `| 时间段 | 运镜 | 动作 | 画面描述 |\n`;
  md += `|--------|------|------|----------|\n`;
  segments.forEach(seg => { md += `| ${seg.t} | ${seg.camera} | ${seg.action} | ${seg.frame} |\n`; });
  return md;
}

function generateReport(result, outputPath) {
  const 标准镜头清单 = result.标准镜头清单 || result.stages?.output?.标准镜头清单 || [];
  const shots = 标准镜头清单.length > 0 ? 标准镜头清单 : (result.stages?.storyboard?.shots || []);
  const totalDuration = shots.reduce((sum, s) => sum + (s.时长 || s.duration || 0), 0);

  let currentTime = 0;
  const timelineData = shots.map(shot => {
    const duration = shot.时长 || shot.duration || 0;
    const start = currentTime;
    const end = currentTime + duration;
    const startStr = `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`;
    const endStr = `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
    currentTime = end;
    return { ...shot, id: shot.镜头编号 || shot.id || shot.shotId, duration, timeStart: startStr, timeEnd: endStr, timeStartSec: start, timeEndSec: end };
  });

  let md = `# 健康科普系列 - 预生产报告 (v6.6.6-fix)\n\n`;
  md += `**主讲**: 陈卓（穿警服的护士小姐姐）\n\n`;
  md += `**总时长**: ${totalDuration} 秒\n\n`;
  md += `**镜头数**: ${shots.length}\n\n`;
  if (result.creativityParameter) {
    md += `**创意指数 (CP)**: ${result.creativityParameter}\n\n`;
    md += `**创意等级**: ${result.creativityLevel || '默认'}\n\n`;
    md += `**视觉风格**: ${result.creativityStyle || '标准'}\n\n`;
  }
  md += `---\n\n`;

  md += `## 时间轴总览\n\n`;
  md += `| 镜头 | 时间段 | 时长 | 场景 | 内容 |\n`;
  md += `|------|--------|------|------|------|\n`;
  timelineData.forEach(s => {
    const contentType = s.镜头类型 === '片头' || s.type === 'opening' ? '片头' : (s.镜头类型 === '结尾' || s.type === 'ending' ? '结尾' : '内容');
    const sceneName = s.场景名称 || s.scene || s.name || contentType;
    md += `| ${s.id} | ${s.timeStart}-${s.timeEnd} | ${s.duration}s | ${sceneName} | ${contentType} |\n`;
  });
  md += `\n`;

  md += `## 镜头详情\n\n`;
  timelineData.forEach((shot, i) => {
    const shotId = shot.镜头编号 || shot.id || shot.shotId || `S${String(i).padStart(2, '0')}`;
    const sceneName = shot.场景名称 || shot.scene || shot.name || '待定义';
    md += `## ${shotId} - ${sceneName}\n\n`;
    md += `**镜头总时长**: ${shot.duration || 0}s\n\n`;
    md += `**镜头总时间轴**: ${shot.timeStart} - ${shot.timeEnd}\n\n`;
    md += `**类型**: ${shot.镜头类型 || shot.type || 'unknown'}\n\n`;
    md += `**场景**: ${sceneName}\n\n`;
    const charList = shot.人物列表 || shot.characters || [];
    md += `**角色**: ${charList.join(', ') || '无'}\n\n`;

    const rawRefImages = shot.绑定定妆照 || shot.referenceImages || [];
    const refImages = rawRefImages.filter(ref => {
      const imgPath = ref.路径 || ref.image_url?.url || ref.url || ref.file || '';
      return !imgPath.includes('casual');
    });
    md += `### 绑定定妆照\n\n`;
    if (refImages.length > 0) {
      refImages.forEach((ref, idx) => {
        const charId = ref.角色ID || ref.character || ref.characterId || '';
        const angle = ref.角度 || ref.angle || '';
        const imgPath = ref.路径 || ref.image_url?.url || ref.url || ref.file || '';
        const absPath = imgPath.startsWith('characters/') || imgPath.startsWith('portraits/')
          ? `/root/.openclaw/workspace/characters/chenzhuo/${imgPath}`
          : imgPath;
        md += `${idx + 1}. \`${absPath}\` (${charId}, ${angle})\n`;
      });
    } else {
      md += `*未绑定定妆照*\n`;
    }
    md += `\n`;

    md += `### 镜头内部详细时间轴\n\n`;
    md += generateInternalTimeline(shot, shot.duration || 0);
    md += `\n`;

    md += `### 台词\n\n`;
    md += `${shot.台词 || shot.dialogue || '(无台词)'}\n\n`;
    md += `### 动作\n\n`;
    md += `${shot.动作 || shot.action || shot.actionDescription || '(无动作描述)'}\n\n`;

    const promptText = shot.画面提示词 || shot.prompt || shot.visualPrompt || 'N/A';
    md += `### 完整 Prompt\n\n`;
    md += `\`\`\`\n${promptText}\n\`\`\`\n\n`;
    md += `---\n\n`;
  });

  md += `## 附录：本集使用定妆照清单\n\n`;
  const allRefs = new Set();
  timelineData.forEach(shot => {
    (shot.绑定定妆照 || shot.referenceImages || []).forEach(ref => {
      const p = ref.路径 || ref.file || ref.url || '';
      if (p && !p.includes('casual')) allRefs.add(p);
    });
  });
  if (allRefs.size > 0) {
    md += `| 文件名 | 角度 | 用途 | 绝对路径 |\n`;
    md += `|--------|------|------|----------|\n`;
    Array.from(allRefs).forEach(refPath => {
      const filename = refPath.split('/').pop();
      const angle = refPath.match(/portrait-(uniform|casual)-(\d+)/)?.[0] || 'unknown';
      const absPath = refPath.startsWith('characters/') || refPath.startsWith('portraits/')
        ? `/root/.openclaw/workspace/characters/chenzhuo/${refPath}`
        : refPath;
      md += `| ${filename} | ${angle} | 角色一致性参考 | \`${absPath}\` |\n`;
    });
  } else {
    md += `*本集未绑定定妆照*\n`;
  }

  fs.writeFileSync(outputPath, md);
  console.log('Report regenerated:', outputPath);
}

generateReport(result, path.join(OUTPUT, 'preproduction-report-v6.6.6-fix.md'));

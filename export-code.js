const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = '/root/.openclaw/workspace/video-system-full-code.md';

// 核心文件列表
const coreFiles = [
  // 入口脚本
  '/root/.openclaw/workspace/run-preproduction-v3.js',
  
  // zhuoyue-system 核心
  '/root/.openclaw/workspace/zhuoyue-system/core/nirath-master-pipeline.js',
  '/root/.openclaw/workspace/zhuoyue-system/core/promptforge-director-worker.js',
  '/root/.openclaw/workspace/zhuoyue-system/core/realism-enhancer-integration.js',
  '/root/.openclaw/workspace/zhuoyue-system/core/realism-prompt-enhancer.js',
  '/root/.openclaw/workspace/zhuoyue-system/core/stage84-film-cinematography-injection.js',
  '/root/.openclaw/workspace/zhuoyue-system/core/stage84-hollywood-skill-injection.js',
  '/root/.openclaw/workspace/zhuoyue-system/scripts/generate-portraits.js',
  '/root/.openclaw/workspace/zhuoyue-system/systems/creativity-index-parser.js',
  '/root/.openclaw/workspace/zhuoyue-system/systems/creativity-parameter-engine.js',
  '/root/.openclaw/workspace/zhuoyue-system/systems/creativity-parameter-engine-v2.js',
  '/root/.openclaw/workspace/zhuoyue-system/systems/critical-field-gate.js',
  '/root/.openclaw/workspace/zhuoyue-system/systems/field-loss-rootcause-logger.js',
  '/root/.openclaw/workspace/zhuoyue-system/systems/final-shot-standardizer.js',
  '/root/.openclaw/workspace/zhuoyue-system/systems/prompt-stability-guard.js',
  '/root/.openclaw/workspace/zhuoyue-system/systems/unified-shot-schema-zh.js',
  '/root/.openclaw/workspace/zhuoyue-system/systems/user-requirement-parser.js',
  
  // systems 目录（被引用的文件）
  '/root/.openclaw/workspace/systems/ambient-sound-designer.js',
  '/root/.openclaw/workspace/systems/audit-logger.js',
  '/root/.openclaw/workspace/systems/camera-movement-system-v2.js',
  '/root/.openclaw/workspace/systems/camera-movement-system-v3.js',
  '/root/.openclaw/workspace/systems/character-compliance-checker.js',
  '/root/.openclaw/workspace/systems/character-era-guide.js',
  '/root/.openclaw/workspace/systems/character-manager-v2.js',
  '/root/.openclaw/workspace/systems/character-prompt-builder.js',
  '/root/.openclaw/workspace/systems/char-counter.js',
  '/root/.openclaw/workspace/systems/closing-shot-emotional-booster.js',
  '/root/.openclaw/workspace/systems/continuity-engine.js',
  '/root/.openclaw/workspace/systems/director-style-library.js',
  '/root/.openclaw/workspace/systems/duration-calculator.js',
  '/root/.openclaw/workspace/systems/duration-narration-alignment.js',
  '/root/.openclaw/workspace/systems/execution-integrity-enforcer.js',
  '/root/.openclaw/workspace/systems/five-element-inspector.js',
  '/root/.openclaw/workspace/systems/fpv-cinematic-enhancement.js',
  '/root/.openclaw/workspace/systems/fpv-intelligence-engine.js',
  '/root/.openclaw/workspace/systems/generic-opening-system.js',
  '/root/.openclaw/workspace/systems/global-negative-prompts.js',
  '/root/.openclaw/workspace/systems/intra-shot-prompt-enhancer.js',
  '/root/.openclaw/workspace/systems/llm-enforcement-layer.js',
  '/root/.openclaw/workspace/systems/llm-reasoning-engine.js',
  '/root/.openclaw/workspace/systems/micro-expression-system-v2.js',
  '/root/.openclaw/workspace/systems/mock-data-cleanup-contract.js',
  '/root/.openclaw/workspace/systems/narration-auto-trim.js',
  '/root/.openclaw/workspace/systems/nirath-character-enhancement.js',
  '/root/.openclaw/workspace/systems/nirath-scene-mapper.js',
  '/root/.openclaw/workspace/systems/nirath-visual-anchor-injector.js',
  '/root/.openclaw/workspace/systems/opening-system-v3.js',
  '/root/.openclaw/workspace/systems/pipeline-checkpoint.js',
  '/root/.openclaw/workspace/systems/pipeline-integrity-validator.js',
  '/root/.openclaw/workspace/systems/post-production-pipeline.js',
  '/root/.openclaw/workspace/systems/pre-render-validation.js',
  '/root/.openclaw/workspace/systems/proactive-protagonist-injector.js',
  '/root/.openclaw/workspace/systems/prompt-channel-separator.js',
  '/root/.openclaw/workspace/systems/prompt-dedupe.js',
  '/root/.openclaw/workspace/systems/prompt-quality-gate.js',
  '/root/.openclaw/workspace/systems/prompt-standard-v3.js',
  '/root/.openclaw/workspace/systems/prompt-tier-architecture.js',
  '/root/.openclaw/workspace/systems/quality-gate.js',
  '/root/.openclaw/workspace/systems/reference-image-gate.js',
  '/root/.openclaw/workspace/systems/runtime-memory-guard.js',
  '/root/.openclaw/workspace/systems/shot-duration-allocator.js',
  '/root/.openclaw/workspace/systems/stage-performance-baseline.js',
  '/root/.openclaw/workspace/systems/stage-runner.js',
  '/root/.openclaw/workspace/systems/storyboard-validator.js',
  '/root/.openclaw/workspace/systems/tech-specs-emotion-mapper.js',
  '/root/.openclaw/workspace/systems/universal-style-injector.js',
  '/root/.openclaw/workspace/systems/worldview-scene-manager.js',
];

let output = '# 卓越视频生成系统 - 全量代码\n\n';
output += '> **生成时间**: ' + new Date().toISOString() + '\n';
output += '> **系统版本**: v6.6.2\n';
output += '> **文件总数**: ' + coreFiles.length + '\n\n';
output += '---\n\n';

let totalLines = 0;
let totalChars = 0;
let fileCount = 0;

for (const filePath of coreFiles) {
  if (!fs.existsSync(filePath)) {
    console.log('跳过缺失文件:', filePath);
    continue;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').length;
  const chars = content.length;
  
  totalLines += lines;
  totalChars += chars;
  fileCount++;
  
  const relativePath = filePath.replace('/root/.openclaw/workspace/', '');
  
  output += '## ' + relativePath + '\n\n';
  output += '**行数**: ' + lines + ' | **字符数**: ' + chars + '\n\n';
  output += '```javascript\n';
  output += content;
  output += '\n```\n\n';
  output += '---\n\n';
  
  console.log('已处理:', relativePath, '(' + lines + ' 行, ' + chars + ' 字符)');
}

output = '# 卓越视频生成系统 - 全量代码\n\n' +
  '> **生成时间**: ' + new Date().toISOString() + '\n' +
  '> **系统版本**: v6.6.2\n' +
  '> **文件总数**: ' + fileCount + '\n' +
  '> **总行数**: ' + totalLines + '\n' +
  '> **总字符数**: ' + totalChars + '\n\n' +
  '---\n\n' +
  output.replace(/^# 卓越视频生成系统 - 全量代码[\s\S]*?---\n\n/, '');

fs.writeFileSync(OUTPUT_FILE, output);

console.log('\n====================================');
console.log('生成完成!');
console.log('输出文件:', OUTPUT_FILE);
console.log('文件总数:', fileCount);
console.log('总行数:', totalLines);
console.log('总字符数:', totalChars);
console.log('文件大小:', (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2) + ' MB');
console.log('====================================');

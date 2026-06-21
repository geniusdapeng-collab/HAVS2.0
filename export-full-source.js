#!/usr/bin/env node
'use strict';

/**
 * Export all source code of Stormaxe AI Video System to a single MD file.
 * Includes: .js, .json, .md, .sh, .py, .yaml, .yml, .schema.json
 * Excludes: binaries, images, videos, logs, node_modules, output, portraits, large exports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = '/root/.openclaw/workspace';
const OUTPUT_FILE = path.join(ROOT, 'StormaxeAIVideoSystem-v6.6.5-full-source.md');

const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'output',
  'productions',
  'characters/chenzhuo/portraits',
  'memorized_media',
  'memory_consolidation/prompts/__pycache__',
  'memory_consolidation/state',
];

const EXCLUDE_FILES = [
  'video-system-full-code.md',
  'zhuoyue-system-full-code.md',
  'zhuoyue-system-full-code-part-aa',
  'zhuoyue-system-full-code-part-ab',
  'zhuoyue-system-full-code-part-ac',
  'zhuoyue-system-full-code-part-ad',
  'StormaxeAIVideoSystem-v6.6.5-full-source.md',
];

const EXCLUDE_EXTS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg',
  '.mp4', '.mov', '.avi', '.webm', '.mp3', '.wav', '.ogg',
  '.log', '.tmp', '.swp', '.pyc', '.zip', '.tar', '.gz',
  '.db', '.sqlite', '.sqlite3',
];

const MAX_FILE_SIZE = 1024 * 1024; // 1MB per file

function shouldExclude(relPath) {
  const base = path.basename(relPath);
  const ext = path.extname(relPath).toLowerCase();
  
  if (EXCLUDE_FILES.includes(base)) return true;
  if (EXCLUDE_EXTS.includes(ext)) return true;
  
  for (const dir of EXCLUDE_DIRS) {
    if (relPath.startsWith(dir + '/') || relPath === dir) return true;
  }
  
  return false;
}

function getGitTrackedFiles() {
  try {
    const stdout = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' });
    return stdout.split('\n').filter(f => f.trim());
  } catch (e) {
    console.error('Failed to get git tracked files:', e.message);
    return [];
  }
}

function getFileSize(relPath) {
  try {
    const stats = fs.statSync(path.join(ROOT, relPath));
    return stats.size;
  } catch (e) {
    return 0;
  }
}

function readFile(relPath) {
  try {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  } catch (e) {
    return `/* Error reading file: ${e.message} */`;
  }
}

function getLanguageTag(ext) {
  const map = {
    '.js': 'javascript',
    '.json': 'json',
    '.md': 'markdown',
    '.sh': 'bash',
    '.py': 'python',
    '.yaml': 'yaml',
    '.yml': 'yaml',
  };
  return map[ext.toLowerCase()] || '';
}

function main() {
  console.log('🔍 Collecting git tracked files...');
  const allFiles = getGitTrackedFiles();
  console.log(`  Total tracked: ${allFiles.length}`);
  
  const sourceFiles = allFiles.filter(f => {
    if (shouldExclude(f)) return false;
    const size = getFileSize(f);
    if (size === 0) return false;
    if (size > MAX_FILE_SIZE) {
      console.log(`  ⚠️ Skipped (too large ${(size/1024).toFixed(0)}KB): ${f}`);
      return false;
    }
    return true;
  });
  
  console.log(`  Source files to export: ${sourceFiles.length}`);
  
  // Sort by directory then filename
  sourceFiles.sort((a, b) => a.localeCompare(b));
  
  const sections = [];
  let totalChars = 0;
  let totalLines = 0;
  
  // Header
  sections.push(`# Stormaxe AI Video System - Full Source Code v6.6.5`);
  sections.push(`\n> Auto-generated export for OpenClaw one-click installation`);
  sections.push(`> Total files: ${sourceFiles.length}`);
  sections.push(`> Generated: ${new Date().toISOString()}`);
  sections.push(`> Repository: https://github.com/geniusdapeng-collab/StormaxeAIVideoSystem (private)`);
  sections.push(`\n---\n`);
  
  for (const relPath of sourceFiles) {
    const content = readFile(relPath);
    const ext = path.extname(relPath);
    const lang = getLanguageTag(ext);
    const size = getFileSize(relPath);
    const lines = content.split('\n').length;
    
    sections.push(`\n## 📄 ${relPath}`);
    sections.push(`\n> Size: ${(size/1024).toFixed(1)}KB | Lines: ${lines}`);
    sections.push(`\n\`\`\`${lang}`);
    sections.push(content);
    sections.push(`\`\`\``);
    
    totalChars += content.length;
    totalLines += lines;
  }
  
  const fullContent = sections.join('\n');
  fs.writeFileSync(OUTPUT_FILE, fullContent, 'utf8');
  
  const outputSize = fs.statSync(OUTPUT_FILE).size;
  console.log(`\n✅ Export complete!`);
  console.log(`  Output file: ${OUTPUT_FILE}`);
  console.log(`  Files: ${sourceFiles.length}`);
  console.log(`  Total chars: ${totalChars.toLocaleString()}`);
  console.log(`  Total lines: ${totalLines.toLocaleString()}`);
  console.log(`  Output size: ${(outputSize/1024/1024).toFixed(2)}MB`);
  console.log(`  Output chars: ${outputSize.toLocaleString()}`);
  
  // Verify no truncation by checking file size vs content length
  const written = fs.readFileSync(OUTPUT_FILE, 'utf8').length;
  if (written === fullContent.length) {
    console.log(`  ✅ Integrity check passed: written ${written.toLocaleString()} chars == expected ${fullContent.length.toLocaleString()} chars`);
  } else {
    console.log(`  ❌ MISMATCH: written ${written.toLocaleString()} chars != expected ${fullContent.length.toLocaleString()} chars`);
  }
  
  return {
    file: OUTPUT_FILE,
    files: sourceFiles.length,
    size: outputSize,
    chars: fullContent.length,
  };
}

const result = main();
console.log(`\n📦 Result: ${JSON.stringify(result, null, 2)}`);

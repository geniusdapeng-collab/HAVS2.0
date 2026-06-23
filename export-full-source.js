#!/usr/bin/env node
/**
 * 暴风战斧AI视频生成系统 - 全量代码导出工具
 * Stormaxe AI Video System - Full Code Export
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = '/root/.openclaw/workspace/Stormaxe-Full-Source-v6.7.0.md';

// 核心目录（排除output目录和备份文件）
const SOURCE_DIRS = [
  'zhuoyue-system',
  'systems', 
  'shanhaijing-render-engine',
  'agents'
];

const EXCLUDE_PATTERNS = [
  /output\//,
  /\.production-/,
  /-backup\./,
  /node_modules/,
  /\.git/,
  /memorized_/,
  /memory_/,
  /\.openclaw\/workspace\/(?!zhuoyue-system|systems|shanhaijing-render-engine|agents)/
];

function shouldExclude(filePath) {
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(filePath)) return true;
  }
  return false;
}

function getAllFiles() {
  const files = [];
  
  for (const dir of SOURCE_DIRS) {
    const fullDir = path.join('/root/.openclaw/workspace', dir);
    if (!fs.existsSync(fullDir)) continue;
    
    function walk(currentDir) {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relPath = path.relative('/root/.openclaw/workspace', fullPath);
        
        if (shouldExclude(relPath)) continue;
        
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (item.endsWith('.js') || item.endsWith('.json') || item.endsWith('.md')) {
          files.push(relPath);
        }
      }
    }
    
    walk(fullDir);
  }
  
  return files.sort();
}

function generateMarkdown() {
  const files = getAllFiles();
  
  let md = `# 暴风战斧AI视频生成系统 - 全量源码
# Stormaxe AI Video System - Full Source Code

> 版本: v6.7.0
> 生成时间: ${new Date().toISOString()}
> 文件总数: ${files.length}
> 总代码行数: ~110,000

---

## 目录结构

`;

  // 生成目录树
  const tree = {};
  for (const f of files) {
    const parts = f.split('/');
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = null;
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    }
  }
  
  function printTree(node, prefix = '') {
    const keys = Object.keys(node).sort();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const isLast = i === keys.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      if (node[key] === null) {
        md += `${prefix}${connector}${key}\n`;
      } else {
        md += `${prefix}${connector}${key}/\n`;
        printTree(node[key], prefix + (isLast ? '    ' : '│   '));
      }
    }
  }
  
  printTree(tree);
  
  md += `\n---\n\n`;
  
  // 生成每个文件的代码块
  let totalLines = 0;
  let fileCount = 0;
  
  for (const relPath of files) {
    const fullPath = path.join('/root/.openclaw/workspace', relPath);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n').length;
      totalLines += lines;
      fileCount++;
      
      const ext = path.extname(relPath).slice(1);
      const lang = ext === 'js' ? 'javascript' : ext === 'json' ? 'json' : ext === 'md' ? 'markdown' : '';
      
      md += `## ${relPath}\n\n`;
      md += `> 路径: \`${relPath}\` | 行数: ${lines}\n\n`;
      md += `\`\`\`${lang}\n`;
      md += content;
      if (!content.endsWith('\n')) md += '\n';
      md += `\`\`\`\n\n`;
      
      // 每10个文件输出进度
      if (fileCount % 10 === 0) {
        process.stderr.write(`Progress: ${fileCount}/${files.length} files, ${totalLines} lines...\n`);
      }
    } catch (e) {
      md += `## ${relPath}\n\n> 读取失败: ${e.message}\n\n`;
    }
  }
  
  md += `\n---\n\n# 文件统计\n\n- 总文件数: ${fileCount}\n- 总代码行数: ${totalLines}\n- 导出时间: ${new Date().toISOString()}\n`;
  
  fs.writeFileSync(OUTPUT_FILE, md);
  
  console.log(`\n✅ 导出完成!`);
  console.log(`文件: ${OUTPUT_FILE}`);
  console.log(`文件数: ${fileCount}`);
  console.log(`总行数: ${totalLines}`);
  console.log(`文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
}

generateMarkdown();

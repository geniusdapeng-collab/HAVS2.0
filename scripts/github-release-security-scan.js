#!/usr/bin/env node
/**
 * GitHub 发布安检机制 (GitHub Release Security Scanner)
 * 暴风战斧AI视频生成系统 (Stormaxe AI Video System)
 * 
 * 在推送代码到 GitHub 前自动扫描敏感信息
 * 用法: node scripts/github-release-security-scan.js
 */

const fs = require('fs');
const path = require('path');

// === 敏感信息检测规则 ===
const SENSITIVE_PATTERNS = [
  {
    name: 'API Key (ark-xxx)',
    pattern: /ark-[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}-\d+/gi,
    severity: 'CRITICAL',
    message: '发现火山引擎 API Key，必须移除'
  },
  {
    name: 'Endpoint ID (ep-xxx)',
    pattern: /ep-\d{10,}-[a-z0-9]+/gi,
    severity: 'HIGH',
    message: '发现模型接入点 ID，建议移至环境变量'
  },
  {
    name: 'Hardcoded Password',
    pattern: /password\s*[:=]\s*['"`][^'"`]{4,}['"`]/gi,
    severity: 'CRITICAL',
    message: '发现硬编码密码'
  },
  {
    name: 'Secret Token',
    pattern: /secret\s*[:=]\s*['"`][^'"`]{8,}['"`]/gi,
    severity: 'CRITICAL',
    message: '发现硬编码 Secret'
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/gi,
    severity: 'CRITICAL',
    message: '发现私钥文件内容'
  }
];

// === 禁止上传的文件/目录 ===
const FORBIDDEN_PATHS = [
  'config/env.js',
  'config/seedance.json',
  '.env',
  '.env.local',
  'characters/chenzhuo/portraits/',
  'output/',
  'productions/',
  'data/patients/',
  'node_modules/',
  'audit-logs/',
  'memory/',
  'memorized_diary/',
  'memorized_media/',
  '.openclaw/'
];

// === 扫描文件列表 ===
const SCAN_EXTENSIONS = ['.js', '.json', '.md', '.txt', '.yml', '.yaml'];
const SKIP_DIRS = ['node_modules', '.git', 'output', 'productions', 'audit-logs', 'memorized_media', 'memorized_diary'];

class GitHubReleaseSecurityScanner {
  constructor() {
    this.issues = [];
    this.scanned = 0;
  }

  scan() {
    console.log('🔒 暴风战斧AI视频生成系统 - GitHub 发布安检机制');
    console.log('=' .repeat(60));
    
    // 1. 扫描 git 跟踪的文件中的敏感信息
    this.scanGitTrackedFiles();
    
    // 2. 检查禁止路径是否在 git 跟踪中
    this.checkForbiddenPaths();
    
    // 3. 检查 .gitignore 是否生效
    this.checkGitignore();
    
    // 4. 输出报告
    return this.report();
  }

  scanGitTrackedFiles() {
    try {
      const { execSync } = require('child_process');
      const tracked = execSync('git ls-files', { encoding: 'utf8' });
      const trackedFiles = tracked.split('\n').filter(f => f.trim() && !f.includes('.example'));
      
      for (const relPath of trackedFiles) {
        const ext = path.extname(relPath);
        if (!SCAN_EXTENSIONS.includes(ext)) continue;
        
        // 跳过示例文件
        if (relPath.includes('.example')) continue;
        
        const fullPath = path.join('.', relPath);
        if (!fs.existsSync(fullPath)) continue;
        
        const content = fs.readFileSync(fullPath, 'utf8');
        this.scanned++;
        
        for (const rule of SENSITIVE_PATTERNS) {
          const matches = content.match(rule.pattern);
          if (matches) {
            this.issues.push({
              severity: rule.severity,
              file: relPath,
              rule: rule.name,
              message: rule.message,
              count: matches.length,
              preview: matches[0].substring(0, 30) + '...'
            });
          }
        }
      }
    } catch (e) {
      console.log('⚠️ 无法运行 git ls-files，回退到目录扫描');
      this.scanDirectory('.');
    }
  }

  scanDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relPath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (SKIP_DIRS.includes(item) || item.startsWith('.')) continue;
        this.scanDirectory(fullPath, relPath);
      } else if (stat.isFile() && SCAN_EXTENSIONS.includes(path.extname(item))) {
        this.scanFile(fullPath, relPath);
      }
    }
  }

  scanFile(fullPath, relPath) {
    // 跳过示例文件和已忽略文件
    if (relPath.includes('.example') || relPath.includes('.gitignore')) return;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    this.scanned++;
    
    for (const rule of SENSITIVE_PATTERNS) {
      const matches = content.match(rule.pattern);
      if (matches) {
        this.issues.push({
          severity: rule.severity,
          file: relPath,
          rule: rule.name,
          message: rule.message,
          count: matches.length,
          preview: matches[0].substring(0, 30) + '...'
        });
      }
    }
  }

  checkForbiddenPaths() {
    try {
      const tracked = require('child_process').execSync('git ls-files', { encoding: 'utf8' });
      const trackedFiles = tracked.split('\n').filter(f => f.trim());
      
      for (const forbidden of FORBIDDEN_PATHS) {
        // 精确路径匹配（去除末尾斜杠）
        const forbiddenClean = forbidden.replace(/\/$/, '');
        const matched = trackedFiles.filter(f => {
          const fileClean = f.replace(/\/$/, '');
          return fileClean === forbiddenClean || fileClean.startsWith(forbiddenClean + '/');
        });
        if (matched.length > 0) {
          this.issues.push({
            severity: 'CRITICAL',
            file: matched.join(', '),
            rule: 'Forbidden Path',
            message: `禁止上传的路径被 git 跟踪: ${forbidden}`,
            count: matched.length
          });
        }
      }
    } catch (e) {
      console.log('⚠️ 无法运行 git ls-files，跳过禁止路径检查');
    }
  }

  checkGitignore() {
    const gitignorePath = '.gitignore';
    if (!fs.existsSync(gitignorePath)) {
      this.issues.push({
        severity: 'CRITICAL',
        file: '.gitignore',
        rule: 'Missing .gitignore',
        message: '.gitignore 文件不存在'
      });
      return;
    }
    
    const content = fs.readFileSync(gitignorePath, 'utf8');
    const required = [
      'config/env.js',
      'config/seedance.json',
      '.env',
      'characters/',
      'output/',
      'node_modules/'
    ];
    
    for (const req of required) {
      if (!content.includes(req)) {
        this.issues.push({
          severity: 'HIGH',
          file: '.gitignore',
          rule: 'Incomplete .gitignore',
          message: `.gitignore 缺少: ${req}`
        });
      }
    }
  }

  report() {
    console.log(`\n📊 扫描完成: ${this.scanned} 个文件`);
    console.log(`🚨 发现问题: ${this.issues.length} 个\n`);
    
    const critical = this.issues.filter(i => i.severity === 'CRITICAL');
    const high = this.issues.filter(i => i.severity === 'HIGH');
    const warnings = this.issues.filter(i => i.severity === 'WARNING');
    
    if (critical.length === 0 && high.length === 0) {
      console.log('✅ 安检通过！可以安全推送到 GitHub。');
      if (warnings.length > 0) {
        console.log(`\n⚠️ 有 ${warnings.length} 项警告（非阻塞）:`);
        for (const w of warnings) {
          console.log(`  [${w.rule}] ${w.file}: ${w.message}`);
        }
      }
      return true;
    }
    
    if (critical.length > 0) {
      console.log('❌ CRITICAL (必须修复):');
      for (const issue of critical) {
        console.log(`  [${issue.rule}] ${issue.file}`);
        console.log(`    → ${issue.message}`);
        if (issue.preview) console.log(`    预览: ${issue.preview}`);
      }
      console.log('');
    }
    
    if (high.length > 0) {
      console.log('⚠️ HIGH (建议修复，但非阻塞):');
      for (const issue of high) {
        console.log(`  [${issue.rule}] ${issue.file}`);
        console.log(`    → ${issue.message}`);
      }
      console.log('');
    }
    
    if (critical.length > 0) {
      console.log('🔴 安检未通过！请修复 CRITICAL 问题后再推送。');
    } else {
      console.log('✅ 无 CRITICAL 问题，HIGH 级别问题非阻塞。可以推送。');
      return true;
    }
    
    console.log('\n💡 修复建议:');
    console.log('  1. 将 API Key 移至 .env 文件（确保 .env 在 .gitignore 中）');
    console.log('  2. 运行: git rm --cached config/env.js config/seedance.json');
    console.log('  3. 添加 .example 模板文件供参考');
    return false;
  }
}

// 运行扫描
if (require.main === module) {
  const scanner = new GitHubReleaseSecurityScanner();
  const passed = scanner.scan();
  process.exit(passed ? 0 : 1);
}

module.exports = { GitHubReleaseSecurityScanner };

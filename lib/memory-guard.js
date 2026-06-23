/**
 * MemoryGuard - 内存守卫模块
 * v6.7.0-fix: 1秒高频采样 + 分级阈值响应
 * 
 * 分级阈值：
 * - 65% 警告（日志提醒）
 * - 75% 强制 GC
 * - 85% 降级模式（切换轻量处理）
 * - 92% 紧急落盘（保存中间结果 + 强制 GC）
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

class MemoryGuard {
  constructor(options = {}) {
    this.totalMem = os.totalmem();
    this.warnThreshold = options.warnThreshold || 0.65;
    this.gcThreshold = options.gcThreshold || 0.75;
    this.degradeThreshold = options.degradeThreshold || 0.85;
    this.emergencyThreshold = options.emergencyThreshold || 0.92;
    this.intervalMs = options.intervalMs || 1000;
    this.logPrefix = options.logPrefix || '[MEM]';
    
    this._timer = null;
    this._lastAction = null;
    this._stats = {
      peakRss: 0,
      peakExternal: 0,
      gcCount: 0,
      degradeCount: 0,
      emergencyCount: 0
    };
  }

  start() {
    if (this._timer) return;
    this._timer = setInterval(() => this._check(), this.intervalMs);
    console.log(`${this.logPrefix} 监控启动 | 系统总内存=${(this.totalMem/1024/1024).toFixed(0)}MB | GC可用=${typeof global.gc === 'function'}`);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _check() {
    const usage = process.memoryUsage();
    const rssRatio = usage.rss / this.totalMem;
    const externalRatio = usage.external / this.totalMem;
    const heapRatio = usage.heapUsed / usage.heapTotal;
    
    // 更新峰值
    if (usage.rss > this._stats.peakRss) this._stats.peakRss = usage.rss;
    if (usage.external > this._stats.peakExternal) this._stats.peakExternal = usage.external;
    
    const maxRatio = Math.max(rssRatio, externalRatio);
    
    // 65% 警告
    if (maxRatio >= this.warnThreshold && this._lastAction !== 'warn') {
      this._lastAction = 'warn';
      console.log(`${this.logPrefix} 🟡 警告 RSS=${(usage.rss/1048576).toFixed(0)}MB (${(rssRatio*100).toFixed(1)}%) external=${(usage.external/1048576).toFixed(0)}MB heap=${(usage.heapUsed/1048576).toFixed(0)}/${(usage.heapTotal/1048576).toFixed(0)}MB`);
    }
    
    // 75% 强制 GC
    if (maxRatio >= this.gcThreshold && this._lastAction !== 'gc') {
      this._lastAction = 'gc';
      this._stats.gcCount++;
      const before = usage.rss;
      if (typeof global.gc === 'function') {
        global.gc();
        const after = process.memoryUsage().rss;
        console.log(`${this.logPrefix} 🟠 GC RSS=${(before/1048576).toFixed(0)}MB → ${(after/1048576).toFixed(0)}MB (释放 ${((before-after)/1048576).toFixed(0)}MB)`);
      } else {
        console.log(`${this.logPrefix} 🟠 GC不可用，建议启动时加 --expose-gc`);
      }
    }
    
    // 85% 降级模式
    if (maxRatio >= this.degradeThreshold && this._lastAction !== 'degrade') {
      this._lastAction = 'degrade';
      this._stats.degradeCount++;
      console.log(`${this.logPrefix} 🔴 降级 RSS=${(usage.rss/1048576).toFixed(0)}MB (${(rssRatio*100).toFixed(1)}%) 后续阶段切换轻量模式`);
      // 触发降级回调（由外部注册）
      if (this._onDegrade) this._onDegrade({ rss: usage.rss, ratio: rssRatio });
    }
    
    // 92% 紧急落盘
    if (maxRatio >= this.emergencyThreshold && this._lastAction !== 'emergency') {
      this._lastAction = 'emergency';
      this._stats.emergencyCount++;
      console.log(`${this.logPrefix} 🚨 紧急 RSS=${(usage.rss/1048576).toFixed(0)}MB (${(rssRatio*100).toFixed(1)}%) 执行紧急落盘`);
      this._emergencyDump(usage);
      if (typeof global.gc === 'function') {
        global.gc();
        global.gc();
      }
    }
    
    // 如果内存回落，重置状态
    if (maxRatio < this.warnThreshold * 0.9) {
      this._lastAction = null;
    }
  }

  _emergencyDump(usage) {
    try {
      const dumpPath = path.join(process.cwd(), 'output', `memory-emergency-${Date.now()}.json`);
      const dump = {
        timestamp: new Date().toISOString(),
        memoryUsage: {
          rss: usage.rss,
          heapTotal: usage.heapTotal,
          heapUsed: usage.heapUsed,
          external: usage.external,
          arrayBuffers: usage.arrayBuffers
        },
        stats: this._stats,
        pid: process.pid
      };
      fs.writeFileSync(dumpPath, JSON.stringify(dump, null, 2));
      console.log(`${this.logPrefix} 💾 紧急落盘已写入 ${dumpPath}`);
    } catch (e) {
      console.error(`${this.logPrefix} 紧急落盘失败: ${e.message}`);
    }
  }

  onDegrade(callback) {
    this._onDegrade = callback;
  }

  logSummary(tag) {
    const usage = process.memoryUsage();
    const rssRatio = usage.rss / this.totalMem;
    console.log(`${this.logPrefix} [${tag}] RSS=${(usage.rss/1048576).toFixed(0)}MB (${(rssRatio*100).toFixed(1)}%) external=${(usage.external/1048576).toFixed(0)}MB heap=${(usage.heapUsed/1048576).toFixed(0)}/${(usage.heapTotal/1048576).toFixed(0)}MB peakRSS=${(this._stats.peakRss/1048576).toFixed(0)}MB gc=${this._stats.gcCount}`);
  }

  getStats() {
    return { ...this._stats };
  }

  // 检查当前是否需要降级（供外部调用）
  shouldDegrade() {
    const usage = process.memoryUsage();
    return (usage.rss / this.totalMem) >= this.degradeThreshold;
  }
}

// 全局单例
let _globalGuard = null;

function getMemoryGuard(options) {
  if (!_globalGuard) {
    _globalGuard = new MemoryGuard(options);
  }
  return _globalGuard;
}

module.exports = { MemoryGuard, getMemoryGuard };

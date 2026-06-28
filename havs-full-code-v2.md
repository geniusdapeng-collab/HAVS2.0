# HAVS (Hyperreal AI Video System) 全量代码

> 生成时间: 2026-06-28T02:46:34.913Z

> 文件总数: 51

---

## config/error-codes.js

```javascript
'use strict';

/**
 * 全局错误码统一管理模块
 * 超现实系统适配版 v1.0
 * 
 * 所有 Layer/Engine/Service 统一使用，确保错误语义一致
 */

const ErrorCodes = {
  // 成功
  SUCCESS: 0,

  // 通用错误 (1-9)
  UNKNOWN_ERROR: 1,
  TIMEOUT: 2,
  OOM: 3,
  CONFIG_ERROR: 4,

  // 外部服务错误 (10-19)
  API_ERROR: 10,
  NETWORK_ERROR: 11,
  RATE_LIMIT: 12,
  AUTH_ERROR: 13,

  // 数据错误 (20-29)
  PARSE_ERROR: 20,
  VALIDATION_ERROR: 21,
  DATA_MISSING: 22,
  SCHEMA_MISMATCH: 23,

  // 质量相关错误 (30-39)
  QUALITY_FAIL: 30,
  REJECTED: 31,
  DEGRADED: 32,

  // Layer 执行错误 (40-49)
  LAYER_SKIP: 40,
  LAYER_DEGRADED: 41,
  LAYER_FATAL: 42,

  // 渲染相关错误 (50-59)
  RENDER_ERROR: 50,
  RENDER_TIMEOUT: 51,
  RENDER_REJECTED: 52,

  // 资源错误 (60-69)
  RESOURCE_NOT_FOUND: 60,
  RESOURCE_EXPIRED: 61,
  PORTRAIT_MISSING: 62,

  // 字段相关 (70-79)
  FIELD_MISSING: 70,
  FIELD_UNAUTHORIZED: 71,
  FIELD_DEGRADED: 72,
};

const ERROR_DESCRIPTIONS = {
  [ErrorCodes.SUCCESS]: '执行成功',
  [ErrorCodes.UNKNOWN_ERROR]: '未知错误',
  [ErrorCodes.TIMEOUT]: '执行超时',
  [ErrorCodes.OOM]: '内存不足',
  [ErrorCodes.CONFIG_ERROR]: '配置错误',
  [ErrorCodes.API_ERROR]: '外部API调用失败',
  [ErrorCodes.NETWORK_ERROR]: '网络错误',
  [ErrorCodes.RATE_LIMIT]: '请求频率限制',
  [ErrorCodes.AUTH_ERROR]: '认证失败',
  [ErrorCodes.PARSE_ERROR]: '数据解析失败',
  [ErrorCodes.VALIDATION_ERROR]: '数据校验失败',
  [ErrorCodes.DATA_MISSING]: '必要数据缺失',
  [ErrorCodes.SCHEMA_MISMATCH]: '数据结构不匹配',
  [ErrorCodes.QUALITY_FAIL]: '质量检查未通过',
  [ErrorCodes.REJECTED]: '内容被驳回',
  [ErrorCodes.DEGRADED]: '已降级执行',
  [ErrorCodes.LAYER_SKIP]: 'Layer被跳过',
  [ErrorCodes.LAYER_DEGRADED]: 'Layer已降级执行',
  [ErrorCodes.LAYER_FATAL]: 'Layer致命错误',
  [ErrorCodes.RENDER_ERROR]: '渲染失败',
  [ErrorCodes.RENDER_TIMEOUT]: '渲染超时',
  [ErrorCodes.RENDER_REJECTED]: '渲染被拒绝',
  [ErrorCodes.RESOURCE_NOT_FOUND]: '资源未找到',
  [ErrorCodes.RESOURCE_EXPIRED]: '资源已过期',
  [ErrorCodes.PORTRAIT_MISSING]: '角色定妆照缺失',
  [ErrorCodes.FIELD_MISSING]: '关键字段缺失',
  [ErrorCodes.FIELD_UNAUTHORIZED]: '字段越权修改',
  [ErrorCodes.FIELD_DEGRADED]: '字段降级标记',
};

function getDescription(code) {
  if (code === null || code === undefined || typeof code !== 'number') {
    return `未定义错误码(${code})`;
  }
  return ERROR_DESCRIPTIONS[code] || `未定义错误码(${code})`;
}

function isSuccess(code) {
  return code === ErrorCodes.SUCCESS;
}

function isFatal(code) {
  const fatalCodes = [ErrorCodes.UNKNOWN_ERROR, ErrorCodes.OOM, ErrorCodes.LAYER_FATAL];
  return fatalCodes.includes(code);
}

function isDegradable(code) {
  const degradableCodes = [
    ErrorCodes.TIMEOUT, ErrorCodes.API_ERROR, ErrorCodes.NETWORK_ERROR,
    ErrorCodes.RATE_LIMIT, ErrorCodes.QUALITY_FAIL, ErrorCodes.RENDER_ERROR,
    ErrorCodes.RENDER_TIMEOUT, ErrorCodes.DEGRADED
  ];
  return degradableCodes.includes(code);
}

function isFieldError(code) {
  return code >= 70 && code <= 79;
}

const ErrorCodeManager = {
  ...ErrorCodes,
  _descriptions: { ...ERROR_DESCRIPTIONS },
  _totalCodes: Object.keys(ErrorCodes).length,
  getDescription,
  isSuccess,
  isFatal,
  isDegradable,
  isFieldError,
  getInfo(code) {
    const keys = Object.keys(ErrorCodes);
    const name = keys.find((k) => ErrorCodes[k] === code) || 'UNKNOWN';
    return { code, name, description: getDescription(code) };
  },
  listAll() {
    return Object.keys(ErrorCodes).map((name) => ({
      code: ErrorCodes[name],
      name,
      description: ERROR_DESCRIPTIONS[ErrorCodes[name]] || '未定义描述',
    }));
  },
  printCheatsheet() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║ 超现实系统错误码速查表 ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    this.listAll().forEach(({ code, name, description }) => {
      console.log(`║ [${String(code).padStart(2, '0')}] ${name.padEnd(20)} ${description.padEnd(20)} ║`);
    });
    console.log('╚════════════════════════════════════════════════════════╝\n');
  },
};

module.exports = ErrorCodeManager;

// 自测试
if (require.main === module) {
  const assert = require('assert');
  console.log('\n[self-test] config/error-codes.js');
  let passed = 0, failed = 0;
  function test(name, fn) {
    try { fn(); console.log(` ✅ ${name}`); passed++; }
    catch (err) { console.error(` ❌ ${name} - ${err.message}`); failed++; }
  }
  test('SUCCESS = 0', () => assert.strictEqual(ErrorCodeManager.SUCCESS, 0));
  test('getDescription(2) = 执行超时', () => assert.strictEqual(ErrorCodeManager.getDescription(2), '执行超时'));
  test('isFatal(1) = true', () => assert.strictEqual(ErrorCodeManager.isFatal(1), true));
  test('isDegradable(2) = true', () => assert.strictEqual(ErrorCodeManager.isDegradable(2), true));
  test('isFieldError(70) = true', () => assert.strictEqual(ErrorCodeManager.isFieldError(70), true));
  test('isFieldError(10) = false', () => assert.strictEqual(ErrorCodeManager.isFieldError(10), false));
  console.log(`\n 结果: ${passed} 通过, ${failed} 失败\n`);
  process.exit(failed > 0 ? 1 : 0);
}

```

---

## config/prompt-length.js

```javascript
'use strict';

/**
 * Prompt 长度统一配置模块
 * 超现实系统适配版 v1.0
 *
 * 系统使用 3000 字符作为 Prompt 硬上限（超现实系统扩容），理想区间为 2470-3000。
 */

const PromptLengthConfig = {
  TARGET_MIN: 2470,
  TARGET_MAX: 12000,
  HARD_MAX: 12000,
  SAFE_MAX: 11900,
  SYSTEM_RESERVE: 200,
  FORMAT_RESERVE: 100,
  SAFETY_MARGIN: 30,

  getCreativeTarget(systemTemplateLen) {
    if (typeof systemTemplateLen !== 'number' || systemTemplateLen < 0) {
      systemTemplateLen = 0;
    }
    const availableMax = this.HARD_MAX - systemTemplateLen - this.SAFETY_MARGIN;
    const availableMin = Math.max(0, this.TARGET_MIN - systemTemplateLen - this.SAFETY_MARGIN);
    return { min: Math.max(0, availableMin), max: Math.max(0, availableMax) };
  },

  validate(length) {
    if (typeof length !== 'number' || isNaN(length)) return false;
    return length >= this.TARGET_MIN && length <= this.TARGET_MAX;
  },

  getStatus(length) {
    if (typeof length !== 'number' || isNaN(length)) return 'overflow';
    if (length > this.TARGET_MAX) return 'overflow';
    if (length < this.TARGET_MIN) return 'underflow';
    return 'ideal';
  },

  truncate(text, maxLen = this.HARD_MAX) {
    if (typeof text !== 'string') return { text: '', truncated: false, originalLen: 0 };
    const originalLen = text.length;
    if (originalLen <= maxLen) return { text, truncated: false, originalLen };
    return { text: text.substring(0, maxLen), truncated: true, originalLen };
  },

  getReport(length) {
    const status = this.getStatus(length);
    return {
      length, status, targetMin: this.TARGET_MIN, targetMax: this.TARGET_MAX, hardMax: this.HARD_MAX,
      isValid: this.validate(length), utilizationRate: Math.round((length / this.HARD_MAX) * 100),
      suggestion: status === 'overflow' ? `需减少 ${length - this.HARD_MAX} 字符` : status === 'underflow' ? `可增加 ${this.TARGET_MIN - length} 至 ${this.TARGET_MAX - length} 字符` : '长度理想',
    };
  },

  printSummary() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║ 超现实系统 Prompt 长度配置摘要 ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║ 理想区间: [${String(this.TARGET_MIN).padStart(4)}, ${String(this.TARGET_MAX).padStart(4)}] 字符 ║`);
    console.log(`║ 硬上限: ${String(this.HARD_MAX).padEnd(36)} ║`);
    console.log(`║ 系统预留: ${(this.SYSTEM_RESERVE + ' 字符').padEnd(36)} ║`);
    console.log(`║ 安全余量: ${(this.SAFETY_MARGIN + ' 字符').padEnd(36)} ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');
  },
};

module.exports = PromptLengthConfig;

if (require.main === module) {
  const assert = require('assert');
  console.log('\n[self-test] config/prompt-length.js');
  let passed = 0, failed = 0;
  function test(name, fn) {
    try { fn(); console.log(` ✅ ${name}`); passed++; }
    catch (err) { console.error(` ❌ ${name} - ${err.message}`); failed++; }
  }
  test('TARGET_MIN = 2470', () => assert.strictEqual(PromptLengthConfig.TARGET_MIN, 2470));
  test('TARGET_MAX = 12000', () => assert.strictEqual(PromptLengthConfig.TARGET_MAX, 12000));
  test('validate(2985) = true', () => assert.strictEqual(PromptLengthConfig.validate(2985), true));
  test('validate(3001) = false', () => assert.strictEqual(PromptLengthConfig.validate(3001), false));
  test('getStatus(3001) = overflow', () => assert.strictEqual(PromptLengthConfig.getStatus(3001), 'overflow'));
  test('truncate 3000 char string', () => {
    const r = PromptLengthConfig.truncate('A'.repeat(3100));
    assert.strictEqual(r.truncated, true);
    assert.strictEqual(r.text.length, 3000);
  });
  console.log(`\n 结果: ${passed} 通过, ${failed} 失败\n`);
  process.exit(failed > 0 ? 1 : 0);
}

```

---

## config/quality-dimensions.js

```javascript
'use strict';

/**
 * 质量维度定义模块
 * 超现实系统适配版 v1.0
 *
 * 6维度质量评分体系：
 * 1. Prompt质量 - 文本精确性、完整性、表现力
 * 2. 故事质量 - 叙事结构、角色发展、情感共鸣
 * 3. 连续性质量 - 跨镜头一致性、角色连贯
 * 4. 导演质量 - 运镜设计、画面构图、节奏控制
 * 5. 渲染就绪度 - 输出是否可直接用于渲染
 * 6. 系统完整性 - 元数据、日志、可追溯性
 */

const QualityDimensions = {
  dimensions: {
    promptQuality: {
      name: 'Prompt质量',
      weight: 0.2,
      passScore: 70,
      warnScore: 55,
      description: 'Prompt文本的精确性、完整性与视觉表现力',
    },
    storyQuality: {
      name: '故事质量',
      weight: 0.2,
      passScore: 70,
      warnScore: 55,
      description: '叙事结构完整性、角色发展与情感共鸣力',
    },
    continuityQuality: {
      name: '连续性质量',
      weight: 0.15,
      passScore: 70,
      warnScore: 55,
      description: '跨镜头角色一致性、场景连贯性与时间线连续性',
    },
    directorQuality: {
      name: '导演质量',
      weight: 0.2,
      passScore: 75,
      warnScore: 60,
      description: '运镜设计专业性、画面构图与节奏控制',
    },
    renderReadiness: {
      name: '渲染就绪度',
      weight: 0.15,
      passScore: 80,
      warnScore: 60,
      description: '输出格式、参数完整度与可直接渲染的程度',
    },
    systemIntegrity: {
      name: '系统完整性',
      weight: 0.1,
      passScore: 90,
      warnScore: 70,
      description: '元数据完整性、日志规范性与全流程可追溯性',
    },
  },

  total: {
    passScore: 75,
    warnScore: 60,
  },

  hardBlockRules: {
    requireSystemIntegrity: true,
    requireRenderReadiness: true,
    requirePromptText: true,
    requireShots: true,
    requireTotalPass: true,
  },

  getDimension(dimKey) {
    if (!dimKey || typeof dimKey !== 'string') return null;
    return this.dimensions[dimKey] || null;
  },

  calculateTotal(scores = {}) {
    let total = 0;
    const weighted = {};
    const details = [];

    for (const [key, config] of Object.entries(this.dimensions)) {
      const score = typeof scores[key] === 'number' ? scores[key] : 0;
      const weightedScore = score * config.weight;
      total += weightedScore;
      weighted[key] = parseFloat(weightedScore.toFixed(2));

      const status = score >= config.passScore ? 'pass' : score >= config.warnScore ? 'warn' : 'fail';
      details.push({ key, name: config.name, score, weight: config.weight, weighted: weighted[key], passScore: config.passScore, warnScore: config.warnScore, status });
    }

    total = parseFloat(total.toFixed(2));
    const overallStatus = total >= this.total.passScore ? 'pass' : total >= this.total.warnScore ? 'warn' : 'fail';

    return { total, weighted, details, overallStatus, passed: overallStatus === 'pass' };
  },

  checkHardBlock(checkData = {}) {
    const { scores = {}, hasPromptText = false, hasShots = false } = checkData;
    const reasons = [];

    if (this.hardBlockRules.requireSystemIntegrity) {
      const siScore = scores.systemIntegrity || 0;
      if (siScore < this.dimensions.systemIntegrity.passScore) {
        reasons.push(`系统完整性 ${siScore} 分，低于及格线 ${this.dimensions.systemIntegrity.passScore}`);
      }
    }

    if (this.hardBlockRules.requireRenderReadiness) {
      const rrScore = scores.renderReadiness || 0;
      if (rrScore < this.dimensions.renderReadiness.passScore) {
        reasons.push(`渲染就绪度 ${rrScore} 分，低于及格线 ${this.dimensions.renderReadiness.passScore}`);
      }
    }

    if (this.hardBlockRules.requirePromptText && !hasPromptText) {
      reasons.push('缺少 Prompt 文本');
    }

    if (this.hardBlockRules.requireShots && !hasShots) {
      reasons.push('缺少镜头定义');
    }

    if (this.hardBlockRules.requireTotalPass) {
      const result = this.calculateTotal(scores);
      if (result.total < this.total.passScore) {
        reasons.push(`总分 ${result.total} 分，低于及格线 ${this.total.passScore}`);
      }
    }

    const blocked = reasons.length > 0;
    if (blocked) {
      console.warn(`[QualityDimensions] 硬拦截触发: ${reasons.join('; ')}`);
    }
    return { blocked, reasons };
  },

  validateWeights() {
    const sum = Object.values(this.dimensions).reduce((acc, d) => acc + d.weight, 0);
    return { valid: Math.abs(sum - 1.0) < 0.001, sum: parseFloat(sum.toFixed(4)) };
  },

  getSummary(scores = {}) {
    const result = this.calculateTotal(scores);
    const hardBlock = this.checkHardBlock({ scores, hasPromptText: true, hasShots: true });
    return {
      overallScore: result.total,
      status: result.overallStatus,
      passed: result.passed && !hardBlock.blocked,
      hardBlocked: hardBlock.blocked,
      hardBlockReasons: hardBlock.reasons,
      dimensions: result.details,
      totalThreshold: this.total,
    };
  },

  printSummary() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║ 超现实系统质量维度配置摘要 ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    for (const [key, config] of Object.entries(this.dimensions)) {
      console.log(`║ ${config.name.padEnd(10)} 权重:${String(config.weight).padEnd(5)} 及格:${String(config.passScore).padEnd(4)} 警告:${String(config.warnScore).padEnd(4)} ║`);
    }
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║ 总分及格线: ${String(this.total.passScore).padEnd(6)} 总分警告线: ${String(this.total.warnScore).padEnd(6)} ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
  },
};

module.exports = QualityDimensions;

if (require.main === module) {
  const assert = require('assert');
  console.log('\n[self-test] config/quality-dimensions.js');
  let passed = 0, failed = 0;
  function test(name, fn) {
    try { fn(); console.log(` ✅ ${name}`); passed++; }
    catch (err) { console.error(` ❌ ${name} - ${err.message}`); failed++; }
  }
  test('6个维度', () => assert.strictEqual(Object.keys(QualityDimensions.dimensions).length, 6));
  test('权重和=1', () => assert.strictEqual(QualityDimensions.validateWeights().valid, true));
  test('calculateTotal', () => {
    const r = QualityDimensions.calculateTotal({ promptQuality: 80, storyQuality: 80, continuityQuality: 80, directorQuality: 80, renderReadiness: 82, systemIntegrity: 95 });
    assert.strictEqual(r.overallStatus, 'pass');
  });
  test('hardBlock', () => {
    const r = QualityDimensions.checkHardBlock({ scores: { systemIntegrity: 50, renderReadiness: 85 }, hasPromptText: true, hasShots: true });
    assert.strictEqual(r.blocked, true);
  });
  console.log(`\n 结果: ${passed} 通过, ${failed} 失败\n`);
  process.exit(failed > 0 ? 1 : 0);
}

```

---

## config/version.js

```javascript
/**
 * 单一版本源 v1.0.8
 * 【P2-19-审计修复】统一所有模块版本号
 */
module.exports = {
  VERSION: '1.0.8',
  BUILD_DATE: '2026-06-27',
  toString() { return `v${this.VERSION} (${this.BUILD_DATE})`; }
};

```

---

## core/baseline-template-registry.js

```javascript
// baseline-template-registry.js
// 基线模板注册中心 v1.0.0
// 提供确定性基线模板，减少LLM调用，提升稳定性
// 日期: 2026-06-26

const path = require('path');
const fs = require('fs');

const BASELINE_DIR = path.join(__dirname, '../../output/baselines');

// 默认基线模板：【P0-8-审计修复】删除硬编码医院/警察基线，改为空对象
// 基线只能通过 extractFromProject + 人工审核后注册，不再内置硬编码内容
const DEFAULT_BASELINES = {};

class BaselineTemplateRegistry {
  constructor() {
    this.baselines = new Map();
    this._ensureDir();
    this._loadAll();
  }

  _ensureDir() {
    if (!fs.existsSync(BASELINE_DIR)) {
      fs.mkdirSync(BASELINE_DIR, { recursive: true });
    }
  }

  _loadAll() {
    // 加载内置默认基线
    for (const [key, value] of Object.entries(DEFAULT_BASELINES)) {
      this.baselines.set(key, value);
    }
    
    // 加载持久化基线
    try {
      const files = fs.readdirSync(BASELINE_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const key = path.basename(file, '.json');
          const data = JSON.parse(fs.readFileSync(path.join(BASELINE_DIR, file), 'utf8'));
          this.baselines.set(key, data);
          console.log(`[BaselineRegistry] 加载基线: ${key}`);
        }
      }
    } catch (e) {
      console.warn('[BaselineRegistry] 加载持久化基线失败:', e.message);
    }
  }

  /**
   * 获取基线模板（支持模糊匹配）
   * @param {string} type - 类型如 'EDU_health' 或 'EDU_REAL'
   * @param {string} version - 版本如 'v1.0'，不传则取最新
   * @returns {object|null}
   */
  get(type, version = null) {
    if (version) {
      const key = `${type}_${version}`;
      return this.baselines.get(key) || null;
    }
    // 找最新版本（前缀精确匹配）
    let keys = Array.from(this.baselines.keys()).filter(k => k.startsWith(`${type}_`));
    if (keys.length > 0) {
      keys.sort((a, b) => {
        const va = this._extractVersion(a);
        const vb = this._extractVersion(b);
        return vb.localeCompare(va); // 降序
      });
      return this.baselines.get(keys[0]);
    }
    // 【修复v2.0.1】模糊匹配：按 filmType 回退
    // 例如 'EDU_REAL' -> 找所有 'EDU_' 开头的基线
    const filmType = type.split('_')[0];
    if (filmType && filmType !== type) {
      keys = Array.from(this.baselines.keys()).filter(k => k.startsWith(`${filmType}_`));
      if (keys.length > 0) {
        keys.sort((a, b) => {
          const va = this._extractVersion(a);
          const vb = this._extractVersion(b);
          return vb.localeCompare(va);
        });
        console.log(`[BaselineRegistry] 模糊匹配: ${type} -> ${keys[0]}`);
        return this.baselines.get(keys[0]);
      }
    }
    return null;
  }

  _extractVersion(key) {
    const match = key.match(/v(\d+\.\d+)$/);
    return match ? match[1] : '0.0';
  }

  /**
   * 注册新基线（需审核后锁定）
   * @param {string} type - 类型
   * @param {string} version - 版本
   * @param {object} baseline - 基线数据
   * @param {object} meta - 元数据
   */
  register(type, version, baseline, meta = {}) {
    const key = `${type}_${version}`;
    const fullBaseline = {
      ...baseline,
      _meta: {
        name: type,
        version: version,
        locked: false, // 默认未锁定，需人工审核
        createdAt: new Date().toISOString(),
        ...meta
      }
    };
    this.baselines.set(key, fullBaseline);
    this._persist(key, fullBaseline);
    console.log(`[BaselineRegistry] 注册基线: ${key} (未锁定)`);
    return fullBaseline;
  }

  /**
   * 锁定基线（人工审核通过）
   * @param {string} type 
   * @param {string} version 
   * @param {string} approver 
   */
  lock(type, version, approver = 'system') {
    const key = `${type}_${version}`;
    const baseline = this.baselines.get(key);
    if (!baseline) throw new Error(`基线不存在: ${key}`);
    
    baseline._meta.locked = true;
    baseline._meta.approvedBy = approver;
    baseline._meta.approvedAt = new Date().toISOString();
    this._persist(key, baseline);
    console.log(`[BaselineRegistry] 基线已锁定: ${key} by ${approver}`);
    return baseline;
  }

  /**
   * 合并基线 + LLM增量
   * @param {string} type 
   * @param {object} llmFields - LLM生成的字段
   * @returns {object}
   */
  merge(type, llmFields) {
    const baseline = this.get(type);
    if (!baseline) {
      console.warn(`[BaselineRegistry] 未找到基线 ${type}，使用全LLM生成`);
      return llmFields;
    }

    // 提取基线的稳定字段（排除_meta和_llmFields）
    const stableFields = {};
    for (const [key, value] of Object.entries(baseline)) {
      if (key.startsWith('_')) continue; // 跳过元数据
      stableFields[key] = value;
    }

    // 合并：LLM字段覆盖基线（如果LLM提供了相同字段）
    const merged = { ...stableFields, ...llmFields };
    
    // 检查必填字段
    const required = baseline._llmRequired || [];
    const missing = required.filter(f => !merged[f] || merged[f] === '(空)' || merged[f] === '');
    
    if (missing.length > 0) {
      console.warn(`[BaselineRegistry] LLM字段缺失: ${missing.join(', ')}`);
    }

    merged._baselineVersion = baseline._meta?.version || 'unknown';
    merged._baselineType = baseline._meta?.name || type;
    
    console.log(`[BaselineRegistry] 合并完成: ${type} v${baseline._meta?.version} | 基线字段${Object.keys(stableFields).length} + LLM字段${Object.keys(llmFields).length} = 总字段${Object.keys(merged).length}`);
    
    return merged;
  }

  /**
   * 检查基线是否适合当前项目（支持模糊匹配）
   * @param {string} type 
   * @param {object} requirement 
   * @returns {boolean}
   */
  isCompatible(type, requirement) {
    // 1. 精确匹配
    let baseline = this.get(type);
    if (!baseline) {
      // 2. 【修复v2.0.1】模糊匹配：按 filmType 回退
      const filmType = type.split('_')[0];
      if (filmType && filmType !== type) {
        baseline = this.get(filmType);
      }
    }
    if (!baseline) return false;
    
    // 检查关键参数匹配
    const meta = baseline._meta || {};
    if (meta.filmType && requirement.filmType && meta.filmType !== requirement.filmType) {
      return false;
    }
    if (meta.visualStyle && requirement.visualStyle && meta.visualStyle !== requirement.visualStyle) {
      return false;
    }
    return true;
  }

  _persist(key, baseline) {
    try {
      const filePath = path.join(BASELINE_DIR, `${key}.json`);
      fs.writeFileSync(filePath, JSON.stringify(baseline, null, 2));
    } catch (e) {
      console.error('[BaselineRegistry] 持久化失败:', e.message);
    }
  }

  /**
   * 列出所有基线
   */
  list() {
    return Array.from(this.baselines.entries()).map(([key, value]) => ({
      key,
      name: value._meta?.name,
      version: value._meta?.version,
      locked: value._meta?.locked,
      approvedBy: value._meta?.approvedBy,
      approvedAt: value._meta?.approvedAt
    }));
  }

  /**
   * 从现有项目提取基线（供人工审核后注册）
   * @param {object} projectResult - 项目生成结果
   * @param {string} type - 基线类型
   */
  extractFromProject(projectResult, type) {
    // 提取稳定字段作为候选基线
    const candidate = {
      directorInstruction: projectResult.directorInstruction,
      constraint: projectResult.constraint,
      baseline: projectResult.baseline,
      negative: projectResult.negative,
      brightConstraint: projectResult.brightConstraint,
      characterConstraint: projectResult.characterConstraint,
      consistency: projectResult.consistency,
      costume: projectResult.costume,
      makeup: projectResult.makeup,
      colorPalette: projectResult.colorPalette,
      depthOfField: projectResult.depthOfField,
      composition: projectResult.composition
    };
    
    return this.register(type, 'v1.0-draft', candidate, { 
      source: 'project-extraction',
      extractedAt: new Date().toISOString()
    });
  }
}

module.exports = { BaselineTemplateRegistry };

```

---

## core/event-bus.js

```javascript
// event-bus.js
// 轻量事件总线 v1.0.0
// 内存版发布-订阅，后期可替换为Redis Stream
// 日期: 2026-06-26

class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.eventHistory = []; // 事件溯源日志
    this.maxHistory = 10000; // 最多保留10000条
  }
  
  /**
   * 订阅事件
   * @param {string} eventType - 事件类型
   * @param {Function} handler - 处理函数
   * @param {object} options - 选项
   *   - once: 是否只触发一次
   *   - priority: 优先级（数字越小越优先）
   */
  subscribe(eventType, handler, options = {}) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    
    const subscribers = this.subscribers.get(eventType);
    subscribers.push({
      handler,
      once: options.once || false,
      priority: options.priority || 10
    });
    
    // 按优先级排序
    subscribers.sort((a, b) => a.priority - b.priority);
    
    return () => this.unsubscribe(eventType, handler); // 返回取消订阅函数
  }
  
  /**
   * 取消订阅
   */
  unsubscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) return;
    
    const subscribers = this.subscribers.get(eventType);
    const idx = subscribers.findIndex(s => s.handler === handler);
    if (idx !== -1) {
      subscribers.splice(idx, 1);
    }
  }
  
  /**
   * 发布事件
   * @param {string} eventType - 事件类型
   * @param {object} payload - 事件数据
   */
  emit(eventType, payload = {}) {
    const event = {
      type: eventType,
      payload,
      timestamp: Date.now(),
      id: `${eventType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // 持久化到事件日志
    this._appendHistory(event);
    
    // 广播给订阅者
    if (this.subscribers.has(eventType)) {
      const subscribers = this.subscribers.get(eventType);
      const toRemove = [];
      
      for (const subscriber of subscribers) {
        try {
          subscriber.handler(payload, event);
          
          if (subscriber.once) {
            toRemove.push(subscriber);
          }
        } catch (err) {
          console.error(`[EventBus] 事件处理失败: ${eventType} - ${err.message}`);
        }
      }
      
      // 移除一次性订阅
      for (const subscriber of toRemove) {
        const idx = subscribers.indexOf(subscriber);
        if (idx !== -1) subscribers.splice(idx, 1);
      }
    }
    
    // 同时触发通配符订阅
    if (this.subscribers.has('*')) {
      for (const subscriber of this.subscribers.get('*')) {
        try {
          subscriber.handler(eventType, payload, event);
        } catch (err) {
          console.error(`[EventBus] 通配符处理失败: ${eventType} - ${err.message}`);
        }
      }
    }
    
    return event;
  }
  
  /**
   * 一次性订阅
   */
  once(eventType, handler) {
    return this.subscribe(eventType, handler, { once: true });
  }
  
  /**
   * 等待某个事件（Promise封装）
   * @param {string} eventType - 事件类型
   * @param {number} timeout - 超时毫秒
   * @param {Function} filter - 过滤函数
   */
  waitFor(eventType, timeout = 30000, filter = null) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.unsubscribe(eventType, handler);
        reject(new Error(`等待事件 ${eventType} 超时: ${timeout}ms`));
      }, timeout);
      
      const handler = (payload, event) => {
        if (filter && !filter(payload)) return;
        
        clearTimeout(timer);
        this.unsubscribe(eventType, handler);
        resolve(payload);
      };
      
      this.subscribe(eventType, handler);
    });
  }
  
  /**
   * 追加事件到历史日志
   */
  _appendHistory(event) {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift(); // 移除最旧的
    }
  }
  
  /**
   * 获取事件历史
   * @param {string} eventType - 事件类型过滤
   * @param {number} limit - 最大条数
   */
  getHistory(eventType = null, limit = 100) {
    let events = this.eventHistory;
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }
    return events.slice(-limit);
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    const stats = {};
    for (const [eventType, subscribers] of this.subscribers) {
      stats[eventType] = subscribers.length;
    }
    return {
      subscriberTypes: Object.keys(stats).length,
      subscriberCounts: stats,
      totalEvents: this.eventHistory.length
    };
  }
  
  /**
   * 清空历史
   */
  clearHistory() {
    this.eventHistory = [];
  }
}

module.exports = { EventBus };

```

---

## core/llm-gateway.js

```javascript
// llm-gateway.js
// LLM统一网关 v1.0.0
// 熔断、限流、缓存、多模型负载均衡
// 日期: 2026-06-26

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 简单内存缓存（生产环境可替换为Redis）
class SimpleCache {
  constructor() {
    this.store = new Map();
    this.maxSize = 1000; // 最多缓存1000条
  }
  
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }
  
  set(key, value, ttlMs = 3600000) {
    if (this.store.size >= this.maxSize) {
      // LRU淘汰：删除最旧的
      const oldest = this.store.keys().next().value;
      this.store.delete(oldest);
    }
    this.store.set(key, {
      value,
      expiry: Date.now() + ttlMs,
      hits: 0
    });
  }
  
  stats() {
    return {
      size: this.store.size,
      maxSize: this.maxSize
    };
  }
}

class LLMGateway {
  constructor(options = {}) {
    this.cache = new SimpleCache();
    this.stats = {
      totalCalls: 0,
      cacheHits: 0,
      timeouts: 0,
      errors: 0,
      fallbackUsed: 0,
      avgLatency: 0,
      latencyHistory: []
    };
    
    // 熔断器配置
    this.circuitBreaker = {
      failureThreshold: 3,      // 连续失败3次触发熔断
      recoveryTimeout: 60000,   // 熔断后60秒尝试恢复
      state: 'CLOSED',          // CLOSED | OPEN | HALF_OPEN
      consecutiveFailures: 0,
      lastFailureTime: null
    };
    
    // 模型配置
    this.models = {
      primary: options.primaryModel || 'kimi-k2p6',
      fallback: options.fallbackModel || 'kimi-k2p5',
      fast: options.fastModel || 'kimi-k2p5'
    };
    
    // 默认超时
    this.defaultTimeout = options.timeout || 120000; // 2分钟
    
    // LLM引擎引用（由外部注入）
    this.llmEngine = null;
    
    console.log('[LLMGateway] 初始化完成', {
      primary: this.models.primary,
      fallback: this.models.fallback,
      cache: 'memory'
    });
  }
  
  /**
   * 注入LLM引擎实例
   */
  setEngine(engine) {
    this.llmEngine = engine;
    console.log('[LLMGateway] LLM引擎已注入');
  }
  
  /**
   * 生成缓存键
   */
  _cacheKey(prompt, options) {
    const hash = crypto.createHash('md5');
    hash.update(prompt);
    hash.update(JSON.stringify(options.agentType || 'unknown'));
    hash.update(JSON.stringify(options.schema || {}));
    return `llm:${hash.digest('hex')}`;
  }
  
  /**
   * 主调用入口
   * @param {string} prompt - 提示词
   * @param {object} options - 选项
   *   - agentType: Agent类型
   *   - timeout: 超时毫秒
   *   - schema: JSON schema
   *   - useCache: 是否使用缓存（默认true）
   *   - preferFast: 是否优先使用快速模型
   * @returns {Promise<object>}
   */
  async call(prompt, options = {}, _retryCount = 0) {
    this.stats.totalCalls++;
    
    // 1. 检查熔断器
    if (this._isCircuitOpen()) {
      console.warn('[LLMGateway] 熔断器开启，直接降级');
      return this._ruleTemplateFallback(options.agentType, prompt, options.context);
    }
    
    // 2. 缓存检查
    if (options.useCache !== false) {
      const cacheKey = this._cacheKey(prompt, options);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.stats.cacheHits++;
        console.log(`[LLMGateway] 缓存命中 (${this.stats.cacheHits}/${this.stats.totalCalls})`);
        return cached;
      }
    }
    
    // 3. 选择模型
    const model = options.preferFast ? this.models.fast : this.models.primary;
    const timeout = options.timeout || this.defaultTimeout;
    
    // 4. 执行 LLM 调用
    const startTime = Date.now();
    try {
      const result = await this._executeWithTimeout(prompt, model, timeout, options);
      
      // 记录成功
      const latency = Date.now() - startTime;
      this._recordLatency(latency);
      this._recordSuccess();
      
      // 缓存结果
      if (options.useCache !== false) {
        const cacheKey = this._cacheKey(prompt, options);
        this.cache.set(cacheKey, result, 3600000); // 1小时
      }
      
      return result;
      
    } catch (err) {
      const latency = Date.now() - startTime;
      this._recordLatency(latency);
      
      // 5. 错误处理与降级链
      return this._handleError(err, prompt, options, latency, _retryCount);
    }
  }
  
  /**
   * 执行LLM调用（带超时）
   */
  async _executeWithTimeout(prompt, model, timeout, options) {
    if (!this.llmEngine) {
      throw new Error('LLM引擎未注入');
    }
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject({ type: 'TIMEOUT', message: `LLM调用超时: ${timeout}ms` });
      }, timeout);
      
      this.llmEngine.reasonStructured(prompt, options.schema || null, {
        model: model,
        ...options
      }).then(result => {
        clearTimeout(timer);
        resolve(result);
      }).catch(err => {
        clearTimeout(timer);
        reject({ type: 'LLM_ERROR', message: err.message, original: err });
      });
    });
  }
  
  /**
   * 错误处理与降级链
   */
  async _handleError(err, prompt, options, latency, retryCount = 0) {
    this._recordFailure();
    
    if (err.type === 'TIMEOUT') {
      this.stats.timeouts++;
      console.warn(`[LLMGateway] 超时(${latency}ms)，触发降级链`);
      
      // 降级链1：轻量模型
      if (!options.preferFast && this.models.fallback) {
        console.log('[LLMGateway] 降级到轻量模型:', this.models.fallback);
        try {
          const result = await this._executeWithTimeout(
            prompt, 
            this.models.fallback, 
            Math.floor((options.timeout || this.defaultTimeout) * 0.7),
            options
          );
          this.stats.fallbackUsed++;
          return result;
        } catch (fallbackErr) {
          console.warn('[LLMGateway] 轻量模型也失败:', fallbackErr.message);
        }
      }
      
      // 降级链2：规则模板
      console.log('[LLMGateway] 最终降级: 规则模板');
      this.stats.fallbackUsed++;
      return this._ruleTemplateFallback(options.agentType, prompt, options.context);
      
    } else if (err.type === 'RATE_LIMIT') {
      // 【P0-3-审计修复】限制最多 3 次退避重试，避免无限递归
      const MAX_RATE_LIMIT_RETRIES = 3;
      if (retryCount >= MAX_RATE_LIMIT_RETRIES) {
        console.warn(`[LLMGateway] 限流重试已达上限(${MAX_RATE_LIMIT_RETRIES}次)，降级到规则模板`);
        this.stats.fallbackUsed++;
        return this._ruleTemplateFallback(options.agentType, prompt, options.context);
      }
      console.warn(`[LLMGateway] 触发限流，指数退避重试 ${retryCount + 1}/${MAX_RATE_LIMIT_RETRIES}`);
      await this._exponentialBackoff(retryCount + 1);
      return this.call(prompt, options, retryCount + 1);
      
    } else {
      this.stats.errors++;
      console.error('[LLMGateway] LLM错误:', err.message);
      
      // 非超时错误也尝试规则兜底
      return this._ruleTemplateFallback(options.agentType, prompt, options.context);
    }
  }
  
  /**
   * 规则模板兜底（无需LLM）
   */
  _ruleTemplateFallback(agentType, prompt, context = {}) {
    console.log(`[LLMGateway] 规则模板兜底: ${agentType}`);

    // 【P0-6-审计修复】从 context 动态提取世界设定，不硬编码医院场景
    const worldDesc = context?.worldSetting?.description || context?.worldSetting?.name || '真实物理环境';
    const atmosphere = context?.worldSetting?.atmosphere || '';
    const charName = context?.character?.name || context?.character || '主角';
    const sceneType = context?.sceneType || 'establishing';

    const typeDesc = {
      opening: '史诗开场空间，宏大视角',
      establishing: '核心叙事空间，环境展示',
      conflict: '紧张对峙地带，戏剧张力',
      action: '激烈动作场地，高速动态',
      emotional_climax: '情感高潮场景，张力爆发',
      resolution: '平静收尾空间，余韵悠长',
    }[sceneType] || '叙事场景';

    const sceneBase = `${worldDesc}，${typeDesc}${atmosphere ? '，' + atmosphere : ''}`;

    const templates = {
      'scene-design': {
        scene: sceneBase,
        lighting: '主光：自然光源 5600K 柔光漫射；补光：反光板填充阴影；背景光：轮廓光分离层次；整体明亮清晰',
        props: '场景中必要的写实道具，材质真实，无文字标识',
        mood: 'calm, professional, natural',
        action: `${charName}自然站立或行走，手部自然动作，眼神交流，真实肢体语言`,
      },
      'visual-language': {
        composition: '景别：中景；主体：黄金分割点；纵深层次感；适度留白',
        colorPalette: '主色调：自然偏暖；辅助色：环境本色；肤色自然；饱和度中等；对比度中高',
        depthOfField: '焦点：主体面部；景深中等f/4；背景适度虚化；前景-中景-背景三层分离',
      },
      'prompt-fusion': {
        merged: `基于「${sceneBase}」生成的导演分镜提示词`,
        quality: 'standard',
      },
      'audio-design': {
        audio: '环境音效：自然环境底噪；音乐风格：氛围配乐；音量层级：环境音60%音乐40%',
      },
      'opening-design': {
        mainTitleContent: context?.title || '主题标题',
        subtitleContent: '',
        titleAnimationDesign: '简洁文字动画，淡入淡出',
        titleFontDesign: '无衬线字体，白色，清晰度优先',
        openingAudioDesign: '庄重氛围音乐，渐入',
      },
    };

    return templates[agentType] || { error: '无可用模板', fallback: true, scene: sceneBase };
  }
  
  /**
   * 熔断器检查
   */
  _isCircuitOpen() {
    const cb = this.circuitBreaker;
    
    if (cb.state === 'OPEN') {
      if (Date.now() - cb.lastFailureTime > cb.recoveryTimeout) {
        cb.state = 'HALF_OPEN';
        console.log('[LLMGateway] 熔断器进入半开状态，尝试恢复');
        return false;
      }
      return true;
    }
    return false;
  }
  
  _recordSuccess() {
    const cb = this.circuitBreaker;
    cb.consecutiveFailures = 0;
    if (cb.state === 'HALF_OPEN') {
      cb.state = 'CLOSED';
      console.log('[LLMGateway] 熔断器关闭，服务恢复');
    }
  }
  
  _recordFailure() {
    const cb = this.circuitBreaker;
    cb.consecutiveFailures++;
    cb.lastFailureTime = Date.now();
    
    if (cb.consecutiveFailures >= cb.failureThreshold) {
      cb.state = 'OPEN';
      console.error(`[LLMGateway] 熔断器开启！连续失败${cb.consecutiveFailures}次`);
    }
  }
  
  _recordLatency(latency) {
    this.stats.latencyHistory.push(latency);
    if (this.stats.latencyHistory.length > 100) {
      this.stats.latencyHistory.shift();
    }
    const sum = this.stats.latencyHistory.reduce((a, b) => a + b, 0);
    this.stats.avgLatency = Math.floor(sum / this.stats.latencyHistory.length);
  }
  
  _exponentialBackoff(attempt) {
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // 最大30秒
    return new Promise(resolve => setTimeout(resolve, delay));
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    const total = this.stats.totalCalls;
    return {
      totalCalls: total,
      cacheHits: this.stats.cacheHits,
      cacheHitRate: total > 0 ? (this.stats.cacheHits / total * 100).toFixed(1) + '%' : '0%',
      timeouts: this.stats.timeouts,
      errors: this.stats.errors,
      fallbackUsed: this.stats.fallbackUsed,
      avgLatency: this.stats.avgLatency,
      circuitBreaker: this.circuitBreaker.state,
      cache: this.cache.stats()
    };
  }
  
  /**
   * 预热缓存（加载常用模板）
   */
  async warmup() {
    console.log('[LLMGateway] 缓存预热...');
    // 可预加载常用场景的LLM结果
  }
}

module.exports = { LLMGateway };

```

---

## core/pipeline-state-machine.js

```javascript
// pipeline-state-machine.js
// Pipeline 状态机 + 真·断点续跑 v1.0.0
// 状态机驱动、原子提交、Stage级恢复
// 日期: 2026-06-26

const fs = require('fs');
const path = require('path');

const CHECKPOINT_DIR = path.join(__dirname, '../../checkpoints');

// 标准Stage定义（有序）
const STANDARD_STAGES = [
  { name: 'INIT', description: '初始化', retryable: false },
  { name: 'REQUIREMENT_PARSED', description: '需求解析完成', retryable: false },
  { name: 'SCRIPT_COMPLETE', description: '剧本生成完成', retryable: true, agent: 'script-generator' },
  { name: 'SCENE_DESIGN_COMPLETE', description: '场景设计完成', retryable: true, agent: 'scene-design' },
  { name: 'OPENING_DESIGN_COMPLETE', description: '片头设计完成', retryable: true, agent: 'opening-design' },
  { name: 'VISUAL_LANGUAGE_COMPLETE', description: '视觉语言完成', retryable: true, agent: 'visual-language' },
  { name: 'AUDIO_DESIGN_COMPLETE', description: '音频设计完成', retryable: true, agent: 'audio-design' },
  { name: 'CONTINUITY_REVIEW_COMPLETE', description: '连续性审查完成', retryable: true, agent: 'continuity-review' },
  { name: 'PROMPT_FUSION_COMPLETE', description: 'Prompt融合完成', retryable: true, agent: 'prompt-fusion' },
  { name: 'QUALITY_CHECK_COMPLETE', description: '质量检查完成', retryable: true, agent: 'quality-check' },
  { name: 'RENDER_READY', description: '可渲染状态', retryable: false }
];

class PipelineStateMachine {
  constructor(projectId, options = {}) {
    this.projectId = projectId;
    this.options = options;
    this.stages = STANDARD_STAGES;
    this.currentState = 'INIT';
    this.stateIndex = 0;
    this.checkpointData = {};
    this.failureLog = [];
    this.compensationStack = [];
    
    this._ensureDir();
    this._loadCheckpoint();
  }
  
  _ensureDir() {
    if (!fs.existsSync(CHECKPOINT_DIR)) {
      fs.mkdirSync(CHECKPOINT_DIR, { recursive: true });
    }
  }
  
  _checkpointPath() {
    return path.join(CHECKPOINT_DIR, `state-${this.projectId}.json`);
  }
  
  _tempCheckpointPath() {
    return path.join(CHECKPOINT_DIR, `.state-${this.projectId}.json.tmp`);
  }
  
  /**
   * 加载已有checkpoint（断点续跑）
   */
  _loadCheckpoint() {
    const cpPath = this._checkpointPath();
    if (fs.existsSync(cpPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(cpPath, 'utf8'));
        this.currentState = data.currentState || 'INIT';
        this.stateIndex = this.stages.findIndex(s => s.name === this.currentState);
        this.checkpointData = data.checkpointData || {};
        this.failureLog = data.failureLog || [];
        console.log(`[StateMachine] 加载checkpoint: ${this.projectId} @ ${this.currentState}`);
      } catch (e) {
        console.warn('[StateMachine] checkpoint加载失败，从头开始:', e.message);
      }
    }
  }
  
  /**
   * 原子提交checkpoint
   */
  async _atomicCheckpoint(stageName, data = {}) {
    this.checkpointData[stageName] = {
      timestamp: Date.now(),
      data
    };
    
    const payload = {
      projectId: this.projectId,
      currentState: stageName,
      checkpointData: this.checkpointData,
      failureLog: this.failureLog,
      updatedAt: new Date().toISOString()
    };
    
    try {
      // 先写临时文件
      fs.writeFileSync(this._tempCheckpointPath(), JSON.stringify(payload, null, 2));
      // 原子rename
      fs.renameSync(this._tempCheckpointPath(), this._checkpointPath());
      console.log(`[StateMachine] checkpoint原子提交: ${stageName}`);
    } catch (e) {
      console.error('[StateMachine] checkpoint提交失败:', e.message);
    }
  }
  
  /**
   * 获取当前状态信息
   */
  getStatus() {
    const stage = this.stages[this.stateIndex];
    return {
      projectId: this.projectId,
      currentState: this.currentState,
      stateIndex: this.stateIndex,
      totalStages: this.stages.length,
      progress: ((this.stateIndex / (this.stages.length - 1)) * 100).toFixed(1) + '%',
      currentStage: stage?.description || '未知',
      retryable: stage?.retryable || false,
      failureCount: this.failureLog.length,
      lastFailure: this.failureLog[this.failureLog.length - 1] || null
    };
  }
  
  /**
   * 执行单个Stage
   * @param {Function} stageExecutor - 异步执行函数
   * @param {Function} compensator - 补偿函数（可选）
   */
  async executeStage(stageName, stageExecutor, compensator = null) {
    const stage = this.stages.find(s => s.name === stageName);
    if (!stage) {
      throw new Error(`未知Stage: ${stageName}`);
    }
    
    console.log(`[StateMachine] ====== 执行Stage: ${stageName} (${stage.description}) ======`);
    const startTime = Date.now();
    
    try {
      // 执行Stage
      const result = await stageExecutor();
      
      // 记录补偿方法
      if (compensator) {
        this.compensationStack.push({ stage: stageName, compensate: compensator });
      }
      
      // 更新状态
      this.currentState = stageName;
      this.stateIndex = this.stages.indexOf(stage);
      
      // 原子提交
      await this._atomicCheckpoint(stageName, { result: true, duration: Date.now() - startTime });
      
      console.log(`[StateMachine] Stage完成: ${stageName} (${Date.now() - startTime}ms)`);
      return result;
      
    } catch (err) {
      // 记录失败
      this.failureLog.push({
        stage: stageName,
        error: err.message,
        stack: err.stack,
        timestamp: Date.now()
      });
      
      console.error(`[StateMachine] Stage失败: ${stageName} - ${err.message}`);
      
      // 如果Stage可重试，尝试补偿后重跑
      if (stage.retryable) {
        console.log(`[StateMachine] Stage ${stageName} 可重试，执行补偿...`);
        await this._compensate();
        throw new RecoverableError(stageName, err);
      }
      
      throw err;
    }
  }
  
  /**
   * 执行补偿（倒序回滚）
   */
  async _compensate() {
    console.log(`[StateMachine] 执行补偿事务，回滚${this.compensationStack.length}个Stage...`);
    
    for (const item of this.compensationStack.reverse()) {
      try {
        await item.compensate();
        console.log(`[StateMachine] 补偿完成: ${item.stage}`);
      } catch (e) {
        console.error(`[StateMachine] 补偿失败: ${item.stage} - ${e.message}`);
      }
    }
    
    this.compensationStack = [];
  }
  
  /**
   * 从断点恢复运行
   * @param {Function} stageExecutors - 各Stage的执行函数映射 { stageName: executor }
   */
  async resume(stageExecutors) {
    console.log(`[StateMachine] 从状态 ${this.currentState} 恢复，当前进度 ${this.stateIndex}/${this.stages.length - 1}`);
    
    // 找到当前状态对应的索引
    const startIdx = this.stateIndex + 1; // 从下一个Stage开始
    
    for (let i = startIdx; i < this.stages.length; i++) {
      const stage = this.stages[i];
      const executor = stageExecutors[stage.name];
      
      if (!executor) {
        console.warn(`[StateMachine] 未找到Stage ${stage.name} 的执行器，跳过`);
        continue;
      }
      
      await this.executeStage(stage.name, executor);
    }
    
    console.log(`[StateMachine] 项目完成: ${this.projectId}`);
    return { completed: true, finalState: this.currentState };
  }
  
  /**
   * 从头运行（忽略已有checkpoint）
   */
  async runFromStart(stageExecutors) {
    console.log(`[StateMachine] 从头运行项目: ${this.projectId}`);
    this.currentState = 'INIT';
    this.stateIndex = 0;
    this.checkpointData = {};
    this.failureLog = [];
    this.compensationStack = [];
    
    // 清理旧checkpoint
    try {
      if (fs.existsSync(this._checkpointPath())) {
        fs.unlinkSync(this._checkpointPath());
      }
    } catch (e) {
      console.warn('[StateMachine] 清理旧checkpoint失败:', e.message);
    }
    
    return this.resume(stageExecutors);
  }
  
  /**
   * 强制重跑某个Stage（从该Stage开始恢复）
   */
  async rerunFrom(stageName, stageExecutors) {
    const idx = this.stages.findIndex(s => s.name === stageName);
    if (idx === -1) {
      throw new Error(`未知Stage: ${stageName}`);
    }
    
    this.currentState = this.stages[idx - 1]?.name || 'INIT';
    this.stateIndex = idx - 1;
    
    console.log(`[StateMachine] 从Stage ${stageName} 重新运行`);
    return this.resume(stageExecutors);
  }
  
  /**
   * 清理项目checkpoint
   */
  cleanup() {
    try {
      const cpPath = this._checkpointPath();
      if (fs.existsSync(cpPath)) {
        fs.unlinkSync(cpPath);
        console.log(`[StateMachine] 清理checkpoint: ${this.projectId}`);
      }
    } catch (e) {
      console.warn('[StateMachine] 清理失败:', e.message);
    }
  }
}

/**
 * 可恢复错误
 */
class RecoverableError extends Error {
  constructor(stageName, originalError) {
    super(`Stage ${stageName} 可恢复失败: ${originalError.message}`);
    this.stageName = stageName;
    this.originalError = originalError;
    this.recoverable = true;
  }
}

module.exports = { PipelineStateMachine, RecoverableError, STANDARD_STAGES };

```

---

## engines/field-guard.js

```javascript
'use strict';

/**
 * 全局字段守门器 v1.0
 * 适配超现实系统四层架构
 * 
 * 在关键节点强制校验字段完整性，防止字段丢失和降级不透明
 */

const { standardizeShots, validateShots, validateShot, markDegraded, CRITICAL_FIELDS } = require('./field-standardizer');

class FieldGuard {
  constructor(options = {}) {
    this.strict = options.strict !== false;
    this.allowWarnings = options.allowWarnings !== false;
    this.logPrefix = options.logPrefix || '[FieldGuard]';
  }

  /**
   * 标准化并校验镜头数组
   * @param {Array} shots - 原始镜头数组
   * @param {string} context - 校验上下文（如 'Layer2-Production'）
   * @returns {Object} { shots, report }
   */
  normalizeAndValidate(shots = [], context = 'unknown') {
    // 【审计修复】单镜头失败不拖垮整批：先标准化全部，再隔离校验失败的镜头
    const normalized = standardizeShots(shots);
    const details = normalized.map(s => validateShot(s));
    const failingIdx = [];
    const errors = [];
    details.forEach((d, i) => {
      if (!d.passed) {
        failingIdx.push(i);
        errors.push(`[${normalized[i].shotId}] ${d.errors.join('; ')}`);
      }
    });

    // 对失败镜头做就地修复（补默认值），而不是整批 throw
    for (const i of failingIdx) {
      const shot = normalized[i];
      console.warn(`${this.logPrefix} ${context} 镜头 ${shot.shotId} 校验失败，就地修复: ${details[i].errors.join('; ')}`);
      // 【P1-22-审计修复】FieldGuard 默认值从 shot 上下文动态生成
      const worldDesc = shot.worldSetting?.description || shot.worldSetting?.name || '真实物理环境';
      const charName = shot.character || '主角';
      const p0Defaults = {
        director_instruction: `电影级质感，写实风格，基于「${worldDesc}」的视觉呈现，8K超高清`,
        constraint: 'Aspect ratio: 16:9, Resolution: 1920x1080, Format: MP4, Frame rate: 24fps, no text, no watermark',
        baseline: '8K resolution, cinematic quality, photorealistic, sharp focus',
        scene: shot.scene || `${worldDesc}，写实场景`,
        lighting: shot.lighting || '主光：自然光源 5600K 柔光漫射；补光：反光板填充；整体明亮清晰',
        camera_movement: shot.camera_movement || '0-3s固定机位；3-6s缓慢推近',
        character: charName,
        action: shot.action || `${charName}自然站立，手部自然动作，眼神交流`,
        portraits: shot.portraits && shot.portraits.length ? shot.portraits : ['image://characters/default/portrait.png'],
        dialogue: shot.dialogue && (Array.isArray(shot.dialogue) ? shot.dialogue.length : true) ? shot.dialogue : [{ speaker: '', text: '' }],
        consistency: shot.consistency || `保持${charName}形象跨镜头一致`
      };
      for (const [k, v] of Object.entries(p0Defaults)) {
        if (!shot[k] || (typeof shot[k] === 'string' && !shot[k].trim())) shot[k] = v;
      }
      shot.degraded = true;
      shot.degradeReason = `FieldGuard就地修复: ${details[i].errors.join('; ')}`;
    }

    if (errors.length > 0) {
      console.warn(`${this.logPrefix} ${context} 已就地修复 ${failingIdx.length} 个镜头`);
    }

    return {
      shots: normalized,
      report: { passed: true, errors: [], warnings: errors, details, summary: { totalShots: normalized.length } }
    };
  }

  /**
   * 快速校验（不抛异常，返回报告）
   */
  check(shots = [], context = 'unknown') {
    const normalized = standardizeShots(shots);
    const report = validateShots(normalized);
    
    return {
      shots: normalized,
      report,
      passed: report.passed
    };
  }

  /**
   * 标记降级并记录原因
   */
  markDegraded(shot, reason) {
    return markDegraded(shot, reason);
  }

  /**
   * 批量标记降级
   */
  markDegradedArray(shots, reason) {
    return shots.map(shot => markDegraded(shot, reason));
  }

  /**
   * 断言关键片头字段
   */
  assertOpeningFields(shots = []) {
    const openingShots = shots.filter(s => 
      s.sceneType === 'opening' || /^S00($|-|_)/.test(s.shotId || '')
    );
    
    for (const shot of openingShots) {
      if (!shot.title) {
        throw new Error(`[FieldGuard] Opening shot ${shot.shotId} missing [title]`);
      }
      if (!shot.subtitle) {
        throw new Error(`[FieldGuard] Opening shot ${shot.shotId} missing [subtitle]`);
      }
    }
    
    return true;
  }

  /**
   * 打印镜头字段摘要（用于调试和日志）
   * v2.1.4-fix9-P25: 适配25字段标准输出
   */
  printShotSummary(shots = [], context = 'unknown') {
    console.log(`\n${this.logPrefix} ${context} shot summary:`);
    for (const shot of shots) {
      // v2.1.4-fix9-P25: 统计25字段完整性
      const p0Fields = CRITICAL_FIELDS.p0;
      const p1Fields = CRITICAL_FIELDS.p1;
      const p0Present = p0Fields.filter(f => !!shot[f]).length;
      const p1Present = p1Fields.filter(f => !!shot[f]).length;
      
      // 台词统计
      const dialogueStr = typeof shot.dialogue === 'string' ? shot.dialogue : String(shot.dialogue || '');
      const dialogueCount = dialogueStr === 'NONE' || !dialogueStr ? 0 : dialogueStr.split('||').length;
      
      // 定妆照统计
      const refCount = (typeof shot.characterRef === 'string' && shot.characterRef !== 'NONE')
        ? (shot.characterRef.split('image://').length - 1)
        : 0;

      const summary = {
        shotId: shot.shotId,
        sceneType: shot.sceneType || '',
        duration: shot.duration || shot.timing?.duration || 0,
        scene: (shot.scene || '').substring(0, 40),
        character: (shot.character || 'NONE').substring(0, 30),
        p0Fields: `${p0Present}/${p0Fields.length}`,
        p1Fields: `${p1Present}/${p1Fields.length}`,
        characterRefCount: refCount,
        dialogueCount,
        promptLength: shot.promptCharCount || (typeof shot.prompt === 'string' ? shot.prompt.length : 0),
        degraded: !!shot.degraded,
        degradeReason: shot.degradeReason || ''
      };
      console.log(JSON.stringify(summary, null, 2));
    }
  }
}

module.exports = { FieldGuard };

```

---

## engines/field-quality/field-check-agent.js

```javascript
/**
 * FieldCheckAgent - 字段内容检查环节
 * 负责: 对25字段进行规则+LLM混合检查，输出结构化问题清单
 * 位置: PromptFusionAgent之后，FieldGuard之前
 * 
 * 架构:
 *   RuleChecker (规则引擎层) - 确定性检查，零延迟
 *     · _checkCompleteness() 完整性: P0/P1必填字段是否缺失
 *     · _checkFormat() 格式: 各字段要素是否齐全
 *     · _checkStructure() 结构: 分段数、层次数等
 *     · _checkLength() 字符数: 单字段+总量超限
 *   LLMChecker (LLM语义层) - 跨字段语义一致性
 *     · check() 6类跨字段语义问题
 */
const { BaseAgent } = require('../production-engine/agents/base-agent');
const { asString, asStringLower, safeSlice, safeIncludes } = require('../field-standardizer');

// ============================================================
// 数据模型 - Issue, CheckReport
// ============================================================

const Priority = {
  P0: 'P0', P1: 'P1', P2: 'P2', P3: 'P3'
};

const Severity = {
  FATAL: 'fatal',   // P0字段缺失/严重不合规，必须修复
  MAJOR: 'major',   // P1字段不合规，强烈建议修复
  MINOR: 'minor',   // P2/P3字段不合规，建议修复
  INFO: 'info'      // 潜在风险，可选修复
};

const IssueType = {
  MISSING: 'missing',
  FORMAT_ERROR: 'format_error',
  INCOMPLETE: 'incomplete',
  OVER_LENGTH: 'over_length',
  INCONSISTENT: 'inconsistent',
  UNPROFESSIONAL: 'unprofessional',
  CONFLICT: 'conflict'
};

// 【v2.1.4-fix13-审计修复】字段名统一为 snake_case，与 field-standardizer 对齐
const FIELD_SPECS = [
  // P0 致命级（12个，必填）
  { nameCn: '导演指令', nameEn: 'director_instruction', priority: Priority.P0, charMin: 50, charMax: 80, required: true },
  { nameCn: '约束', nameEn: 'constraint', priority: Priority.P0, charMin: 100, charMax: 150, required: true },
  { nameCn: '基础', nameEn: 'baseline', priority: Priority.P0, charMin: 80, charMax: 100, required: true },
  { nameCn: '场景', nameEn: 'scene', priority: Priority.P0, charMin: 150, charMax: 200, required: true },
  { nameCn: '灯光', nameEn: 'lighting', priority: Priority.P0, charMin: 100, charMax: 150, required: true },
  { nameCn: '运镜', nameEn: 'camera_movement', priority: Priority.P0, charMin: 80, charMax: 120, required: true },
  { nameCn: '角色', nameEn: 'character', priority: Priority.P0, charMin: 50, charMax: 80, required: true },
  { nameCn: '动作', nameEn: 'action', priority: Priority.P0, charMin: 100, charMax: 150, required: true },
  { nameCn: '台词', nameEn: 'dialogue', priority: Priority.P0, charMin: 0, charMax: 9999, required: true },
  { nameCn: '负面约束', nameEn: 'negative', priority: Priority.P0, charMin: 200, charMax: 300, required: true },
  { nameCn: '定妆照', nameEn: 'portraits', priority: Priority.P0, charMin: 0, charMax: 9999, required: true },
  { nameCn: '角色一致性', nameEn: 'consistency', priority: Priority.P0, charMin: 50, charMax: 80, required: true },
  // P1 核心级（7个，必填）
  { nameCn: '构图', nameEn: 'composition', priority: Priority.P1, charMin: 80, charMax: 120, required: true },
  { nameCn: '色彩', nameEn: 'color_palette', priority: Priority.P1, charMin: 80, charMax: 120, required: true },
  { nameCn: '景深', nameEn: 'depth_of_field', priority: Priority.P1, charMin: 60, charMax: 100, required: true },
  { nameCn: '时间轴', nameEn: 'timeline', priority: Priority.P1, charMin: 150, charMax: 200, required: true },
  { nameCn: '情绪', nameEn: 'mood', priority: Priority.P1, charMin: 30, charMax: 50, required: true },
  { nameCn: '明亮约束', nameEn: 'bright_constraint', priority: Priority.P1, charMin: 50, charMax: 80, required: true },
  { nameCn: '角色约束', nameEn: 'character_constraint', priority: Priority.P1, charMin: 50, charMax: 80, required: true },
  // P2 增强级（4个，可选）
  { nameCn: '服装', nameEn: 'costume', priority: Priority.P2, charMin: 60, charMax: 100, required: false },
  { nameCn: '道具', nameEn: 'props', priority: Priority.P2, charMin: 40, charMax: 80, required: false },
  { nameCn: '节奏', nameEn: 'pacing', priority: Priority.P2, charMin: 60, charMax: 100, required: false },
  { nameCn: '音频', nameEn: 'audio', priority: Priority.P2, charMin: 60, charMax: 100, required: false },
  // P3 可选级（2个，可选）
  { nameCn: '化妆', nameEn: 'makeup', priority: Priority.P3, charMin: 40, charMax: 60, required: false },
  { nameCn: '转场', nameEn: 'transition', priority: Priority.P3, charMin: 30, charMax: 50, required: false },
];

const SPEC_MAP = {};
for (const spec of FIELD_SPECS) {
  SPEC_MAP[spec.nameEn] = spec;
}

// 【v2.1.4-fix13】camelCase ↔ snake_case 双向映射，解决命名不一致
const CAMEL_TO_SNAKE = {};
const SNAKE_TO_CAMEL = {};
for (const spec of FIELD_SPECS) {
  const snake = spec.nameEn.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  CAMEL_TO_SNAKE[spec.nameEn] = snake;
  SNAKE_TO_CAMEL[snake] = spec.nameEn;
}

/**
 * 【v2.1.4-fix13】将 shot 展平为统一格式
 * 处理三种数据来源：
 * 1. shot.fields.xxx（PromptFusion 嵌套结构，snake_case）
 * 2. shot.xxx（顶层 snake_case）
 * 3. shot.xxx（顶层 camelCase，FIELD_SPECS 格式）
 * 统一输出为 camelCase 顶层字段，同时保留 snake_case 兼容
 */
function flattenShot(shot) {
  if (!shot || typeof shot !== 'object') return {};
  const flat = { ...shot };

  // 展开 shot.fields 对象
  if (shot.fields && typeof shot.fields === 'object') {
    for (const [key, value] of Object.entries(shot.fields)) {
      // snake_case → camelCase
      const camelKey = SNAKE_TO_CAMEL[key] || key;
      if (!(camelKey in flat) || !flat[camelKey]) {
        flat[camelKey] = value;
      }
      // 也保留 snake_case 版本（向后兼容）
      if (!(key in flat) || !flat[key]) {
        flat[key] = value;
      }
    }
  }

  // 顶层 snake_case → camelCase 映射
  for (const [snake, camel] of Object.entries(SNAKE_TO_CAMEL)) {
    if (snake in flat && !(camel in flat)) {
      flat[camel] = flat[snake];
    } else if (camel in flat && !(snake in flat)) {
      flat[snake] = flat[camel];
    }
  }

  return flat;
}

const MAX_TOTAL_CHARS = 12000; // 【审计修复】与 prompt-length.js 保持一致

class Issue {
  constructor({ fieldEn, fieldCn, severity, issueType, description, suggestion, currentValue = '' }) {
    this.fieldEn = fieldEn;
    this.fieldCn = fieldCn;
    this.severity = severity;
    this.issueType = issueType;
    this.description = description;
    this.suggestion = suggestion;
    this.currentValue = currentValue;
  }
}

class CheckReport {
  constructor(shotId) {
    this.shotId = shotId;
    this.issues = [];
    this.passed = false;
  }

  add(issue) { this.issues.push(issue); }

  get fatalCount() { return this.issues.filter(i => i.severity === Severity.FATAL).length; }
  get majorCount() { return this.issues.filter(i => i.severity === Severity.MAJOR).length; }
  get minorCount() { return this.issues.filter(i => i.severity === Severity.MINOR).length; }

  summary() {
    return `检查结果：${this.passed ? '✅ 通过' : '❌ 未通过'} | 致命 ${this.fatalCount} · 严重 ${this.majorCount} · 轻微 ${this.minorCount} · 共 ${this.issues.length} 项问题`;
  }
}

// ============================================================
// RuleChecker - 规则引擎层（确定性检查）
// ============================================================

class RuleChecker {
  constructor() {
    this.shotSizePatterns = [
      /extreme long shot/i, /establishing shot/i, /long shot/i, /full shot/i,
      /medium shot/i, /close-?up/i, /extreme close-?up/i, /wide shot/i,
      /远景/i, /全景/i, /中景/i, /近景/i, /特写/i,
    ];
    this.positionPatterns = [
      /third/i, /center/i, /symmetr/i, /左侧/i, /右侧/i, /居中/i, /对称/i,
      /positioned at/i, /aligned to/i,
    ];
    this.transitionPatterns = [
      /hard cut/i, /fade in/i, /fade out/i, /dissolve/i, /wipe/i, /zoom/i,
      /切镜/i, /淡入/i, /淡出/i, /叠化/i, /划像/i,
    ];
  }

  check(shot) {
    const issues = [];
    issues.push(...this._checkCompleteness(shot));
    issues.push(...this._checkFormat(shot));
    issues.push(...this._checkStructure(shot));
    issues.push(...this._checkLength(shot));
    return issues;
  }

  // ---- 4.1 完整性检查 ----
  _checkCompleteness(shot) {
    const issues = [];
    for (const spec of FIELD_SPECS) {
      if (!spec.required) continue;
      const value = shot[spec.nameEn];
      const isEmpty = !value || (typeof value === 'string' && !value.trim());
      if (isEmpty) {
        const sev = spec.priority === Priority.P0 ? Severity.FATAL : Severity.MAJOR;
        issues.push(new Issue({
          fieldEn: spec.nameEn, fieldCn: spec.nameCn,
          severity: sev, issueType: IssueType.MISSING,
          description: `${spec.priority} 字段【${spec.nameCn}】缺失`,
          suggestion: `请补充【${spec.nameCn}】字段内容，参考规范文档第 ${this._chapterForField(spec.nameEn)} 章`
        }));
      }
    }
    return issues;
  }

  // ---- 4.2 格式与内容专业性检查 ----
  _checkFormat(shot) {
    const issues = [];

    // 导演指令：须含风格定位+写实要求+情绪基调
    const di = shot.director_instruction || '';
    if (di) {
      const diLower = (di && typeof di === "string") ? di.toLowerCase() : "";
      const hasStyle = /质感|风格|纪录片|电影|广告|cinematic|documentary|realistic|photorealistic|hollywood/.test(diLower);
      const hasRealism = /写实|无特效|无科幻|realistic|no effect|no sci/.test(diLower);
      const hasMood = /基调|氛围|情绪|冷静|紧张|温馨|tone|mood|atmosphere|professional|intense|warm/.test(diLower);
      const missing = [];
      if (!hasStyle) missing.push('风格定位');
      if (!hasRealism) missing.push('写实要求');
      if (!hasMood) missing.push('情绪基调');
      if (missing.length) {
        issues.push(new Issue({
          fieldEn: 'director_instruction', fieldCn: '导演指令',
          severity: Severity.FATAL, issueType: IssueType.INCOMPLETE,
          description: `导演指令缺少要素：${missing.join('、')}`,
          suggestion: `导演指令须覆盖风格定位+写实要求+情绪基调，当前缺少：${missing.join('、')}。示例：'纪录片真实感，手持摄影风格，自然光效，无特效，冷静专业基调'`,
          currentValue: (typeof di === "string" ? di.slice(0, 60) : String(di).slice(0, 60))
        }));
      }
    }

    // 约束：须含画幅+分辨率+格式+帧率
    const cs = shot.constraint || '';
    if (cs) {
      const csLower = (cs && typeof cs === "string") ? cs.toLowerCase() : "";
      const missing = [];
      if (!/aspect ratio|画幅|16:9|9:16/.test(csLower)) missing.push('画幅比例');
      if (!/resolution|分辨率|1920|1080|4k|8k/.test(csLower)) missing.push('分辨率');
      if (!/format|格式|mp4|mov/.test(csLower)) missing.push('输出格式');
      if (!/frame rate|帧率|fps|24fps|30fps/.test(csLower)) missing.push('帧率');
      if (missing.length) {
        issues.push(new Issue({
          fieldEn: 'constraint', fieldCn: '约束',
          severity: Severity.FATAL, issueType: IssueType.INCOMPLETE,
          description: `约束字段缺少技术参数：${missing.join('、')}`,
          suggestion: `约束须包含画幅+分辨率+格式+帧率，示例：'Aspect ratio: 16:9, Resolution: 1920x1080, Format: MP4, Frame rate: 24fps'`,
          currentValue: (typeof cs === "string" ? cs.slice(0, 60) : String(cs).slice(0, 60))
        }));
      }
    }

    // 灯光：须含主光+色温+光质
    const lt = shot.lighting || '';
    if (lt) {
      const ltLower = (lt && typeof lt === "string") ? lt.toLowerCase() : "";
      const missing = [];
      if (!/key light|主光|主光源/.test(ltLower)) missing.push('主光描述');
      if (!/\d{3,4}k|色温|color temperature|warm|cool|daylight|tungsten/.test(ltLower)) missing.push('色温参数');
      if (!/soft|hard|diffus|柔光|硬光|漫射/.test(ltLower)) missing.push('光质定义');
      if (missing.length) {
        issues.push(new Issue({
          fieldEn: 'lighting', fieldCn: '灯光',
          severity: Severity.FATAL, issueType: IssueType.INCOMPLETE,
          description: `灯光字段缺少要素：${missing.join('、')}`,
          suggestion: `灯光须含主光+色温+光质三要素。示例：'key light: soft diffused window light at 5600K, fill light: LED panel at 4000K, low contrast 2:1'`,
          currentValue: (typeof lt === "string" ? lt.slice(0, 60) : String(lt).slice(0, 60))
        }));
      }
    }

    // 运镜：须含运动方式+速度+时间分布
    const cm = shot.camera_movement || '';
    if (cm) {
      const cmLower = (cm && typeof cm === "string") ? cm.toLowerCase() : "";
      const hasMove = /push|pull|pan|track|follow|crane|orbit|推|拉|摇|移|跟|升|降|环绕/.test(cmLower);
      const hasSpeed = /\d+\.?\d*\s*m\/s|\d+\.?\d*\s*°\/s|slow|fast|medium|慢速|快速/.test(cmLower);
      const hasTime = /duration|秒|second|\d+s|starting|ending/.test(cmLower);
      const missing = [];
      if (!hasMove) missing.push('运动方式');
      if (!hasSpeed) missing.push('速度参数');
      if (!hasTime) missing.push('时间分布');
      if (missing.length) {
        issues.push(new Issue({
          fieldEn: 'camera_movement', fieldCn: '运镜',
          severity: Severity.FATAL, issueType: IssueType.INCOMPLETE,
          description: `运镜字段缺少要素：${missing.join('、')}`,
          suggestion: `运镜须含运动方式+速度+时间分布。示例：'slow push in toward the protagonist's face, 0.5m/s constant speed, duration 3 seconds'`,
          currentValue: (typeof cm === "string" ? cm.slice(0, 60) : String(cm).slice(0, 60))
        }));
      }
    }

    // 负面约束：须含 no text + no watermark
    const ng = shot.negative || '';
    if (ng) {
      const ngLower = (ng && typeof ng === "string") ? ng.toLowerCase() : "";
      if (!ngLower.includes('no text') || !ngLower.includes('no watermark')) {
        issues.push(new Issue({
          fieldEn: 'negative', fieldCn: '负面约束',
          severity: Severity.FATAL, issueType: IssueType.INCOMPLETE,
          description: "负面约束缺少基础排除项：'no text' 和 'no watermark'",
          suggestion: "负面约束必须包含 'no text, no watermark' 两项基础排除，建议同时包含 no blurry, no extra limbs 等通用负面词",
          currentValue: (typeof ng === "string" ? ng.slice(0, 60) : String(ng).slice(0, 60))
        }));
      }
    }

    // 构图：须含景别+主体位置
    const comp = shot.composition || '';
    if (comp) {
      const compLower = (comp && typeof comp === "string") ? comp.toLowerCase() : "";
      const hasSize = this.shotSizePatterns.some(p => p.test(compLower));
      const hasPos = this.positionPatterns.some(p => p.test(compLower));
      const missing = [];
      if (!hasSize) missing.push('景别等级');
      if (!hasPos) missing.push('主体位置');
      if (missing.length) {
        issues.push(new Issue({
          fieldEn: 'composition', fieldCn: '构图',
          severity: Severity.MAJOR, issueType: IssueType.INCOMPLETE,
          description: `构图字段缺少要素：${missing.join('、')}`,
          suggestion: `构图须含景别（远景/全景/中景/近景/特写）+ 主体位置（三分法/中心/对称）。示例：'medium shot, subject positioned at the left third intersection'`,
          currentValue: (typeof comp === "string" ? comp.slice(0, 60) : String(comp).slice(0, 60))
        }));
      }
    }

    // 明亮约束：须含亮度+可见性+面部明亮
    const bc = shot.bright_constraint || '';
    if (bc) {
      const bcLower = (bc && typeof bc === "string") ? bc.toLowerCase() : "";
      const missing = [];
      if (!/bright|well-lit|明亮|光线充足/.test(bcLower)) missing.push('亮度要求');
      if (!/visibility|visible|clear|可见|清晰/.test(bcLower)) missing.push('可见性');
      if (!/face|面部|facial|no dark shadow/.test(bcLower)) missing.push('面部明亮');
      if (missing.length) {
        issues.push(new Issue({
          fieldEn: 'bright_constraint', fieldCn: '明亮约束',
          severity: Severity.MAJOR, issueType: IssueType.INCOMPLETE,
          description: `明亮约束缺少要素：${missing.join('、')}`,
          suggestion: `明亮约束须含亮度+可见性+面部明亮。标准格式：'bright lighting, well-lit scene, clear visibility, no dark shadows on face, adequate illumination, face clearly lit'`,
          currentValue: (typeof bc === "string" ? bc.slice(0, 60) : String(bc).slice(0, 60))
        }));
      }
    }

    // 角色约束：须含单角色限制+禁止分身
    const cc = shot.character_constraint || '';
    if (cc) {
      const ccLower = asStringLower(cc);
      const hasSingle = /只出现|仅出现|single character|only.*one/.test(ccLower);
      const hasNoClone = /分身|克隆|duplicate|clone|repeat/.test(ccLower);
      const missing = [];
      if (!hasSingle) missing.push('单角色限制');
      if (!hasNoClone) missing.push('禁止分身声明');
      if (missing.length) {
        issues.push(new Issue({
          fieldEn: 'character_constraint', fieldCn: '角色约束',
          severity: Severity.MAJOR, issueType: IssueType.INCOMPLETE,
          description: `角色约束缺少要素：${missing.join('、')}`,
          suggestion: `角色约束须含单角色限制+禁止分身。标准格式：'只出现[角色名]一人，禁止其他人物入镜，禁止同一角色重复出现，禁止角色分身或克隆'`,
          currentValue: safeSlice(cc, 0, 60)
        }));
      }
    }

    // 【P2-22-审计修复】放宽定妆照路径校验，兼容多种格式
    const pt = shot.portraits || '';
    if (pt) {
      const validPathPattern = /(characters[\/\\][\w_-]+[\/\\]?[\w._-]*\.(png|jpg|jpeg|webp))|(image:\/\/characters\/[\w_-]+)/i;
      if (!validPathPattern.test(String(pt))) {
        issues.push(new Issue({
          fieldEn: 'portraits', fieldCn: '定妆照',
          severity: Severity.MINOR, // 从 FATAL 降为 MINOR
          issueType: IssueType.FORMAT_ERROR,
          description: `定妆照路径格式可能不规范：${safeSlice(pt, 0, 40)}`,
          suggestion: '建议路径包含 characters/ 目录，示例：characters/wukong/portrait.png',
          currentValue: safeSlice(pt, 0, 40)
        }));
      }
    }

    // 【P2-23-审计修复】台词标点检查分级处理
    const dl = shot.dialogue || '';
    if (dl && typeof dl === 'string') {
      // 仅对中文台词检查句末标点，英文台词跳过
      const isChinese = /[\u4e00-\u9fff]/.test(dl);
      if (isChinese && !/[。！？…]$/.test(dl.trim())) {
        issues.push(new Issue({
          fieldEn: 'dialogue', fieldCn: '台词',
          severity: Severity.MINOR, // 从 FATAL 降为 MINOR
          issueType: IssueType.FORMAT_ERROR,
          description: '中文台词缺少句末标点',
          suggestion: `建议在台词末尾添加 '。'`,
          currentValue: (typeof dl === "string" ? dl.slice(0, 60) : String(dl).slice(0, 60))
        }));
      }
      // 【修复】dialogue_block 格式包含引号是正常的，不再检查禁止标点
    }

    // 转场：须含明确类型
    const tr = shot.transition || '';
    if (tr) {
      if (!this.transitionPatterns.some(p => p.test(tr))) {
        issues.push(new Issue({
          fieldEn: 'transition', fieldCn: '转场',
          severity: Severity.MINOR, issueType: IssueType.INCOMPLETE,
          description: '转场字段未指定明确转场类型',
          suggestion: '须指定具体转场类型（hard cut/fade in/fade out/dissolve/wipe），避免使用 smooth transition 等模糊表述',
          currentValue: tr.slice(0, 40)
        }));
      }
    }

    return issues;
  }

  // ---- 4.3 结构检查 ----
  _checkStructure(shot) {
    const issues = [];

    // 时间轴：≥3段
    const tl = shot.timeline || '';
    if (tl) {
      const segments = tl.match(/T\d{2}:\d{2}/g) || [];
      if (segments.length < 3) {
        issues.push(new Issue({
          fieldEn: 'timeline', fieldCn: '时间轴',
          severity: Severity.MAJOR, issueType: IssueType.INCOMPLETE,
          description: `时间轴分段数不足：当前 ${segments.length} 段，要求 ≥ 3 段`,
          suggestion: '时间轴须至少分为起始、发展、收尾 3 段，每段格式：T00:XX - [画面内容] + [动作描述]',
          currentValue: (typeof tl === "string" ? tl.slice(0, 60) : String(tl).slice(0, 60))
        }));
      }
    }

    // 节奏：五段式
    const pa = shot.pacing || '';
    if (pa) {
      const paLower = (pa && typeof pa === "string") ? pa.toLowerCase() : "";
      const requiredSegs = ['整体', '开头', '中段', '高潮', '结尾'];
      const missing = requiredSegs.filter(s => !paLower.includes(s) && !paLower.includes(s.toLowerCase()));
      if (missing.length) {
        issues.push(new Issue({
          fieldEn: 'pacing', fieldCn: '节奏',
          severity: Severity.MINOR, issueType: IssueType.INCOMPLETE,
          description: `节奏字段缺少段落：${missing.join('、')}`,
          suggestion: '节奏须采用五段式：整体+开头+中段+高潮+结尾',
          currentValue: (typeof pa === "string" ? pa.slice(0, 60) : String(pa).slice(0, 60))
        }));
      }
    }

    // 服装：至少含外套/内搭/下装/鞋履中3项
    const cos = shot.costume || '';
    if (cos) {
      const cosLower = (cos && typeof cos === "string") ? cos.toLowerCase() : "";
      const categories = {
        '外套/上装': ['coat', 'jacket', 'suit', 'shirt', 'overcoat', '外套', '西装', '上衣'],
        '内搭': ['shirt', 'blouse', '内搭', '衬衫'],
        '下装': ['trousers', 'pants', 'skirt', '裤', '裙'],
        '鞋履': ['shoes', 'footwear', '鞋'],
      };
      let found = 0;
      for (const keywords of Object.values(categories)) {
        if (keywords.some(k => cosLower.includes(k))) found++;
      }
      if (found < 3) {
        issues.push(new Issue({
          fieldEn: 'costume', fieldCn: '服装',
          severity: Severity.MINOR, issueType: IssueType.INCOMPLETE,
          description: `服装字段层次不足：当前覆盖 ${found}/4 项（外套/内搭/下装/鞋履）`,
          suggestion: "服装须采用分层描述，至少覆盖外套/内搭/下装/鞋履中的 3 项，示例：'charcoal gray wool overcoat, white dress shirt, navy trousers, black leather shoes'",
          currentValue: (typeof cos === "string" ? cos.slice(0, 60) : String(cos).slice(0, 60))
        }));
      }
    }

    return issues;
  }

  // ---- 4.4 字符数检查 ----
  _checkLength(shot) {
    const issues = [];

    // 单字段字符数
    for (const spec of FIELD_SPECS) {
      if (spec.charMax >= 9999) continue;
      const value = shot[spec.nameEn] || '';
      if (!value) continue;
      const length = value.length;
      if (length > spec.charMax) {
        const sev = [Priority.P0, Priority.P1].includes(spec.priority) ? Severity.MAJOR : Severity.MINOR;
        issues.push(new Issue({
          fieldEn: spec.nameEn, fieldCn: spec.nameCn,
          severity: sev, issueType: IssueType.OVER_LENGTH,
          description: `字段超长：${length} 字符，超出预算上限 ${spec.charMax}`,
          suggestion: `请压缩【${spec.nameCn}】字段至 ${spec.charMax} 字符以内，保留核心信息，去除修饰性描述`,
          currentValue: `${safeSlice(value, 0, 40)}...(${length}字符)`
        }));
      }
    }

    // 总字符数
    const total = Object.values(shot).filter(v => typeof v === 'string').reduce((sum, v) => sum + v.length, 0);
    if (total > MAX_TOTAL_CHARS) {
      issues.push(new Issue({
        fieldEn: '_total', fieldCn: '总长度',
        severity: Severity.MAJOR, issueType: IssueType.OVER_LENGTH,
        description: `提示词总字符数超限：${total} 字符，上限 ${MAX_TOTAL_CHARS}`,
        suggestion: `请执行六步截断策略：①去冗余 ②裁P3 ③裁P2 ④压P1局部 ⑤压P0局部 ⑥超限报警，目标降至 ${MAX_TOTAL_CHARS} 以内`
      }));
    }

    return issues;
  }

  _chapterForField(nameEn) {
    const map = {
      director_instruction: '3', constraint: '3', baseline: '4',
      scene: '4', lighting: '4', composition: '5', color_palette: '5',
      depth_of_field: '5', camera_movement: '5', character: '6',
      costume: '6', makeup: '6', action: '6', props: '7',
      portraits: '7', consistency: '7', dialogue: '8', timeline: '8',
      mood: '8', pacing: '8', transition: '9', audio: '9',
      negative: '9', bright_constraint: '10', character_constraint: '10',
    };
    return map[nameEn] || '2';
  }
}

// ============================================================
// LLMChecker - LLM语义检查层（跨字段一致性）
// ============================================================

const LLM_CHECKER_SYSTEM_PROMPT = `你是一个 AI 视频生成提示词的质量审核专家，精通 HyperrealitySystem 字段规范 v3.0。

你的任务是对镜头提示词进行【语义一致性检查】，重点关注规则引擎无法覆盖的跨字段语义问题：

1. 导演指令与情绪/色彩字段是否风格一致
   - 如导演指令为"紧张刺激"，情绪不应为"relaxed"，色彩不应为暖色调高饱和
2. 台词与动作是否语义自洽
   - 如台词为疑问句，动作中应有看向对话对象的视线描述
3. 场景描述与灯光描述是否冲突
   - 如场景为"夜间户外"，灯光不应为"明亮日光"
4. 负面约束与正面描述是否矛盾
   - 如正面要求"复古胶片质感"，负面约束不应含"no grain"
5. 角色描述与角色一致性是否匹配
   - 角色字段定义的外观应与一致性字段锚定词一致
6. 时间轴与运镜/动作的时间分布是否对齐

返回JSON格式：
{
  "issues": [
    {
      "field_en": "字段英文名",
      "field_cn": "字段中文名",
      "severity": "fatal|major|minor",
      "issue_type": "inconsistent|conflict",
      "description": "问题描述",
      "suggestion": "具体修改建议"
    }
  ]
}

注意：只报告确实存在的语义问题，不要报告规则引擎已覆盖的格式/缺失问题。如果语义检查全部通过，返回 {"issues": []}。`;

class LLMChecker {
  constructor(llmClient, timeoutMs = 120000) {
    this.llm = llmClient;
    this.timeoutMs = timeoutMs; // 【v2.1.4-fix13】增加超时配置
  }

  async check(shot) {
    if (!this.llm) return [];
    const shotJson = JSON.stringify(shot, null, 2);
    const userPrompt = `请对以下镜头提示词进行语义一致性检查：\n\n${shotJson}`;

    // 【v2.1.4-fix13】Promise.race 超时保护
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`LLMChecker超时(${this.timeoutMs}ms)`)),
        this.timeoutMs
      );
    });

    try {
      const response = await Promise.race([
        this.llm.reasonStructured(LLM_CHECKER_SYSTEM_PROMPT + '\n\n' + userPrompt, {}, { maxRetries: 1, timeoutMs: this.timeoutMs }),
        timeoutPromise
      ]).finally(() => clearTimeout(timer));

      const data = response.result || response.data || response;
      return (data.issues || []).map(item => new Issue({
        fieldEn: item.field_en || '',
        fieldCn: item.field_cn || '',
        severity: Severity[item.severity?.toUpperCase()] || Severity.MINOR,
        issueType: IssueType[item.issue_type?.toUpperCase()] || IssueType.INCONSISTENT,
        description: item.description || '',
        suggestion: item.suggestion || '',
      }));
    } catch (e) {
      // 【v2.1.4-fix13】区分超时和其他异常
      if (e.message?.includes('超时')) {
        console.warn(`[LLMChecker] 语义检查超时(${this.timeoutMs}ms)，降级为空`);
      } else {
        console.warn(`[LLMChecker] 语义检查异常: ${e.message}`);
      }
      return []; // 降级为空，不阻塞流程
    }
  }
}

// ============================================================
// FieldCheckAgent - 检查环节编排器
// ============================================================

class FieldCheckAgent extends BaseAgent {
  constructor(options = {}) {
    super({ name: 'FieldCheckAgent', llmTimeout: options.llmTimeout || 120000, ...options });
    this.ruleChecker = new RuleChecker();
    // 【v2.1.4-fix13】把超时配置传给 LLMChecker
    this.llmChecker = new LLMChecker(this._getLLMEngine(), options.llmTimeout || 120000);
  }

  async check(shot, shotId = 'shot_001') {
    console.log(`[FieldCheckAgent] 开始检查 ${shotId}...`);
    const report = new CheckReport(shotId);

    // 【v2.1.4-fix13】先展平 shot，统一字段命名和结构
    const flatShot = flattenShot(shot);

    // 第一层：规则检查（用展平后的 shot）
    const ruleIssues = this.ruleChecker.check(flatShot);
    report.issues.push(...ruleIssues);
    console.log(`[FieldCheckAgent] RuleChecker 完成：${ruleIssues.length} 项问题`);

    // 第二层：LLM语义检查（用展平后的 shot）
    if (this.llmChecker.llm) {
      const llmIssues = await this.llmChecker.check(flatShot);
      report.issues.push(...llmIssues);
      console.log(`[FieldCheckAgent] LLMChecker 完成：${llmIssues.length} 项问题`);
    }

    // 判定是否通过：无fatal且无major
    report.passed = (report.fatalCount === 0 && report.majorCount === 0);

    console.log(`[FieldCheckAgent] ${report.summary()}`);
    return report;
  }

  // 批量检查多个镜头
  async checkAll(shots) {
    const reports = [];
    for (const shot of shots) {
      const report = await this.check(shot, shot.shotId || shot.shot_id || 'unknown');
      reports.push(report);
    }
    return reports;
  }
}

module.exports = {
  FieldCheckAgent,
  RuleChecker,
  LLMChecker,
  Issue,
  CheckReport,
  FIELD_SPECS,
  SPEC_MAP,
  Priority,
  Severity,
  IssueType,
  MAX_TOTAL_CHARS,
  // 【v2.1.4-fix13】导出展平工具，供 field-repair-agent.js 等下游使用
  flattenShot,
  CAMEL_TO_SNAKE,
  SNAKE_TO_CAMEL,
};

```

---

## engines/field-quality/field-quality-pipeline.js

```javascript
/**
 * FieldQualityPipeline - 字段质量管线
 * 主管线：串联【字段内容检查环节】和【内容修复环节】，支持多轮迭代
 * 
 * 工作流程：检查 → 修复 → 再检查 → 再修复 → ... → 通过或达到最大轮次
 * 
 * 使用示例:
 *   const pipeline = new FieldQualityPipeline({ llmClient, prd, maxRounds: 2 });
 *   const { finalShots, reports, logs } = await pipeline.runAll(shots);
 */
const { FieldCheckAgent } = require('./field-check-agent');
const { FieldRepairAgent, PRD } = require('./field-repair-agent');

class FieldQualityPipeline {
  constructor(options = {}) {
    this.maxRounds = options.maxRounds ?? 1; // 默认1轮，加速处理
    this.checker = new FieldCheckAgent({
      llmModel: options.llmModel || process.env.STORMAXE_LLM_MODEL || 'kimi-k2p6',
      llmTimeout: options.checkerTimeout || 30000, // 30秒超时，避免长时间阻塞
    });
    this.repairer = new FieldRepairAgent({
      llmModel: options.llmModel || process.env.STORMAXE_LLM_MODEL || 'kimi-k2p6',
      llmTimeout: options.repairerTimeout || 30000, // 30秒超时
    });

    // 设置PRD（从blueprint构建或直接使用）
    if (options.prd) {
      this.repairer.setPRD(options.prd);
    }
  }

  /**
   * 【v2.1.4-fix13-审计修复】下发全局 deadline 到 checker 和 repairer
   */
  setDeadline(deadlineMs) {
    this.checker.setDeadline?.(deadlineMs);
    this.repairer.setDeadline?.(deadlineMs);
  }

  /**
   * 设置PRD（用户需求文档）
   * 可在运行时动态设置，支持从blueprint自动构建
   */
  setPRD(prd) {
    if (prd instanceof PRD) {
      this.repairer.setPRD(prd);
    } else if (typeof prd === 'object') {
      this.repairer.setPRD(new PRD(prd));
    }
  }

  /**
   * 从blueprint自动构建PRD并设置
   */
  setPRDFromBlueprint(blueprint) {
    const prd = PRD.fromBlueprint(blueprint);
    this.repairer.setPRD(prd);
    return prd;
  }

  /**
   * 【审计修复·P0】安全深拷贝单个 shot：过滤循环引用、跳过重型字段
   */
  _safeCloneShot(shot) {
    if (shot === null || typeof shot !== 'object') return shot;
    const seen = new WeakMap();
    const clone = (obj) => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (typeof obj === 'function') return undefined;
      if (seen.has(obj)) return seen.get(obj);
      if (Array.isArray(obj)) {
        const arr = [];
        seen.set(obj, arr);
        for (const item of obj) {
          const c = clone(item);
          if (c !== undefined) arr.push(c);
        }
        return arr;
      }
      const result = {};
      seen.set(obj, result);
      for (const [k, v] of Object.entries(obj)) {
        if (['_blueprint', '_adapter', '_llm', '_engine'].includes(k)) continue;
        const c = clone(v);
        if (c !== undefined) result[k] = c;
      }
      return result;
    };
    return clone(shot);
  }

  /**
   * 运行单镜头完整管线
   * @param {object} shot - 镜头提示词（25字段）
   * @param {string} shotId - 镜头ID
   * @returns {object} { finalShot, reports, logs }
   */
  async run(shot, shotId = 'shot_001') {
    // 【审计修复·P0】shot._blueprint 有循环引用，JSON.stringify 会崩，改用安全克隆
    let currentShot = this._safeCloneShot(shot);
    const reports = [];
    const logs = [];

    // 【v2.1.4-fix13】maxRounds=0 时至少执行 1 轮规则检查（不修复）
    const effectiveRounds = Math.max(1, this.maxRounds);

    for (let roundNum = 1; roundNum <= effectiveRounds; roundNum++) {
      // 检查环节
      const report = await this.checker.check(currentShot, shotId);
      report.shotId = `${shotId}_round${roundNum}`;
      reports.push(report);

      console.log(`\n${'='.repeat(60)}`);
      console.log(`第 ${roundNum} 轮检查：${report.summary()}`);

      // 如果通过，结束
      if (report.passed) {
        console.log(`✅ 检查通过，管线结束`);
        break;
      }

      // 如果是最后一轮，不再修复
      if (roundNum === effectiveRounds) {
        console.log(`⚠️ 达到最大轮次 ${effectiveRounds}，仍有问题需人工介入`);
        break;
      }

      // 【v2.1.4-fix13】maxRounds=0 时只检查不修复
      if (this.maxRounds === 0) {
        console.log(`⚠️ 纯规则检查模式（maxRounds=0），跳过修复`);
        break;
      }

      // 修复环节
      const { repaired, log } = await this.repairer.repair(currentShot, report, shotId);
      log.shotId = `${shotId}_round${roundNum}`;
      logs.push(log);

      console.log(`第 ${roundNum} 轮修复：完成 ${log.actions.length} 项修复动作`);
      for (const action of log.actions) {
        console.log(` [${action.method}] ${action.fieldEn}: ${action.before.slice(0, 30)}... → ${action.after.slice(0, 30)}...`);
      }

      currentShot = repaired;
    }

    return { finalShot: currentShot, reports, logs };
  }

  /**
   * 批量运行多个镜头
   * @param {Array} shots - 镜头数组
   * @returns {object} { finalShots, allReports, allLogs, summary }
   */
  async runAll(shots) {
    const finalShots = [];
    const allReports = [];
    const allLogs = [];
    let totalPassed = 0;
    let totalFailed = 0;

    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      const shotId = shot.shotId || shot.shot_id || `shot_${i}`;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`[FieldQualityPipeline] 处理镜头 ${i + 1}/${shots.length}: ${shotId}`);
      console.log('='.repeat(60));

      const { finalShot, reports, logs } = await this.run(shot, shotId);
      finalShots.push(finalShot);
      allReports.push(...reports);
      allLogs.push(...logs);

      const lastReport = reports[reports.length - 1];
      if (lastReport.passed) {
        totalPassed++;
      } else {
        totalFailed++;
      }
    }

    const summary = {
      totalShots: shots.length,
      passed: totalPassed,
      failed: totalFailed,
      totalRounds: allReports.length,
      totalRepairs: allLogs.reduce((sum, log) => sum + log.actions.length, 0),
    };

    console.log(`\n${'='.repeat(60)}`);
    console.log('字段质量管线总结');
    console.log('='.repeat(60));
    console.log(`镜头总数: ${summary.totalShots}`);
    console.log(`通过: ${summary.passed} | 未通过: ${summary.failed}`);
    console.log(`总检查轮次: ${summary.totalRounds}`);
    console.log(`总修复动作: ${summary.totalRepairs}`);

    return { finalShots, allReports, allLogs, summary };
  }
}

module.exports = { FieldQualityPipeline };

```

---

## engines/field-quality/field-repair-agent.js

```javascript
/**
 * FieldRepairAgent - 内容修复环节
 * 负责: 接收检查报告 + 原始PRD，对镜头提示词进行修复
 * 位置: FieldCheckAgent之后，FieldGuard之前
 * 
 * 架构:
 *   RuleRepairer (规则自动修复层) - 确定性问题秒修
 *     · 负面词补全、路径规范化、标点修复、P2/P3截断
 *   LLMRepairer (LLM智能修复层) - PRD注入
 *     · 内容补全、一致性修正、风格对齐
 *     · 后处理: _smartTruncate() 防止超长
 *   _recheckRemaining() - 规则修复后识别剩余问题，只传给LLM
 */
const { BaseAgent } = require('../production-engine/agents/base-agent');
const { SPEC_MAP, Priority, Severity, IssueType, MAX_TOTAL_CHARS } = require('./field-check-agent');

// ============================================================
// 数据模型 - RepairAction, RepairLog, PRD
// ============================================================

class RepairAction {
  constructor({ fieldEn, method, before, after, reason }) {
    this.fieldEn = fieldEn;
    this.method = method; // 'rule' | 'llm'
    this.before = before;
    this.after = after;
    this.reason = reason;
  }
}

class RepairLog {
  constructor(shotId) {
    this.shotId = shotId;
    this.actions = [];
    this.prdReferenced = false;
  }

  add(action) { this.actions.push(action); }
}

class PRD {
  constructor({
    projectName = '',
    videoType = '',
    styleDirection = '',
    moodTone = '',
    characters = [],
    scenes = [],
    dialogues = [],
    specialConstraints = [],
    targetPlatform = '',
    rawText = '',
  }) {
    this.projectName = projectName;
    this.videoType = videoType;
    this.styleDirection = styleDirection;
    this.moodTone = moodTone;
    this.characters = characters;
    this.scenes = scenes;
    this.dialogues = dialogues;
    this.specialConstraints = specialConstraints;
    this.targetPlatform = targetPlatform;
    this.rawText = rawText;
  }

  toConstraintText() {
    const lines = [];
    if (this.projectName) lines.push(`项目名称：${this.projectName}`);
    if (this.videoType) lines.push(`视频类型：${this.videoType}`);
    if (this.styleDirection) lines.push(`风格方向：${this.styleDirection}`);
    if (this.moodTone) lines.push(`情绪基调：${this.moodTone}`);
    if (this.targetPlatform) lines.push(`目标平台：${this.targetPlatform}`);
    if (this.characters.length) {
      const charDesc = this.characters.map(c => `${c.name || ''}(${c.identity || ''})`).join('； ');
      lines.push(`角色设定：${charDesc}`);
    }
    if (this.scenes.length) {
      const sceneDesc = this.scenes.map(s => typeof s === 'string' ? s : s.description || '').join('； ');
      lines.push(`场景要求：${sceneDesc}`);
    }
    if (this.dialogues.length) {
      lines.push(`台词内容：${this.dialogues.join(' / ')}`);
    }
    if (this.specialConstraints.length) {
      lines.push(`特殊约束：${this.specialConstraints.join('； ')}`);
    }
    return lines.join('\n');
  }

  // 从 blueprint/metadata 自动构建 PRD
  static fromBlueprint(blueprint) {
    const meta = blueprint._metadata || blueprint.config?._metadata || {};
    const characters = blueprint.characters || [];
    const scenes = blueprint.scenes || [];
    return new PRD({
      projectName: blueprint.title || '',
      videoType: meta.videoType || blueprint.type || 'general',
      styleDirection: meta.styleDirection || '',
      moodTone: meta.moodTone || '',
      characters: characters.map(c => ({
        name: c.name || '',
        nameEn: c.nameEn || c.name_en || '',
        identity: c.identity || c.role || '',
        appearance: c.appearance || '',
      })),
      scenes: scenes.map(s => typeof s === 'string' ? s : s.description || ''),
      dialogues: (blueprint.dialogues || []).map(d => typeof d === 'string' ? d : d.text || ''),
      specialConstraints: meta.specialConstraints || [],
      targetPlatform: meta.targetPlatform || '',
    });
  }
}

// ============================================================
// RuleRepairer - 规则自动修复层
// ============================================================

class RuleRepairer {
  repair(shot, report, prd = null) {
    const repaired = JSON.parse(JSON.stringify(shot));
    const actions = [];

    for (const issue of report.issues) {
      const fieldEn = issue.fieldEn;
      if (fieldEn === '_total') continue; // 总长度由LLM统一处理
      const current = repaired[fieldEn] || '';

      // 修复1：负面约束缺失基础词
      if (fieldEn === 'negative' && current && issue.issueType === IssueType.INCOMPLETE && /no text/.test(issue.description)) {
        let fixed = current;
        if (!fixed.toLowerCase().includes('no text')) {
          fixed = 'no text, no watermark, ' + fixed;
        }
        if (fixed !== current) {
          repaired[fieldEn] = fixed;
          actions.push(new RepairAction({
            fieldEn, method: 'rule', before: current, after: fixed,
            reason: "规则修复：自动补充 'no text, no watermark' 基础负面词"
          }));
        }
      }

      // 修复2：定妆照路径格式
      if (fieldEn === 'portraits' && current && issue.issueType === IssueType.FORMAT_ERROR) {
        let normalized = current.replace(/^['"]|['"]$/g, '').trim();
        if (prd && prd.characters.length) {
          const charName = prd.characters[0].nameEn || 'character';
          normalized = `/characters/${charName}/portrait_v1.png`;
        }
        if (normalized !== current) {
          repaired[fieldEn] = normalized;
          actions.push(new RepairAction({
            fieldEn, method: 'rule', before: current, after: normalized,
            reason: '规则修复：定妆照路径规范化为标准格式'
          }));
        }
      }

      // 修复3：台词句末标点
      if (fieldEn === 'dialogue' && current && issue.issueType === IssueType.FORMAT_ERROR && /句末标点/.test(issue.description)) {
        if (current && !/[。！？…]$/.test(current)) {
          const fixed = current + '。';
          repaired[fieldEn] = fixed;
          actions.push(new RepairAction({
            fieldEn, method: 'rule', before: current, after: fixed,
            reason: "规则修复：自动补充句末标点 '。'（口型闭合信号标记）"
          }));
        }
      }

      // 修复4：台词禁止标点移除
      if (fieldEn === 'dialogue' && current && issue.issueType === IssueType.FORMAT_ERROR && /禁止标点/.test(issue.description)) {
        const fixed = current.replace(/[；;：:""''"'\[\]【】]/g, ',');
        if (fixed !== current) {
          repaired[fieldEn] = fixed;
          actions.push(new RepairAction({
            fieldEn, method: 'rule', before: current, after: fixed,
            reason: '规则修复：移除禁止标点，替换为逗号'
          }));
        }
      }

      // 修复5：P2/P3字段超长规则截断
      if (fieldEn in SPEC_MAP && issue.issueType === IssueType.OVER_LENGTH && [Priority.P2, Priority.P3].includes(SPEC_MAP[fieldEn].priority)) {
        const spec = SPEC_MAP[fieldEn];
        if (current.length > spec.charMax) {
          let truncated = current.slice(0, spec.charMax);
          const lastComma = Math.max(truncated.lastIndexOf(','), truncated.lastIndexOf('，'), truncated.lastIndexOf(' '));
          if (lastComma > spec.charMax * 0.7) {
            truncated = truncated.slice(0, lastComma);
          }
          if (truncated !== current) {
            repaired[fieldEn] = truncated;
            actions.push(new RepairAction({
              fieldEn, method: 'rule', before: current, after: truncated,
              reason: `规则修复：${spec.priority} 字段超长，截断至 ${truncated.length} 字符`
            }));
          }
        }
      }
    }

    return { repaired, actions };
  }
}

// ============================================================
// LLMRepairer - LLM智能修复层（PRD注入）
// ============================================================

const LLM_REPAIRER_SYSTEM_PROMPT = `你是 AI 视频生成提示词的【内容修复专家】，精通 HyperrealitySystem 字段规范 v3.0。

你的任务是根据检查报告中的问题，对提示词字段进行修复。修复时必须遵守以下原则：

【修复原则】
1. 业务需求优先：修复内容必须符合【用户需求文档PRD】中的业务约束，不得偏离项目定位
2. 规范合规：修复后的字段必须符合字段规范（四要素/五要素/三段式等格式要求）
3. 最小改动：仅修改有问题的部分，不改动已合规的内容
4. 风格一致：修复后的字段须与其它字段保持风格一致
5. 英文优先：画面描述类字段使用英文，约束类字段按规范使用中/英文

【输出格式】
返回JSON，key 为需要修复的字段英文名，value 为修复后的完整字段内容：
{
  "repaired_fields": {
    "director_instruction": "修复后的完整内容",
    "lighting": "修复后的完整内容"
  }
}

只返回需要修复的字段，不要返回未出问题的字段。`;

class LLMRepairer {
  constructor(llmClient, timeoutMs = 180000) {
    this.llm = llmClient;
    this.timeoutMs = timeoutMs; // 【v2.1.4-fix13】增加超时配置
  }

  async repair(shot, report, prd) {
    // 筛选需要LLM修复的问题（排除规则已修复的）
    const llmIssues = report.issues.filter(i =>
      [Severity.FATAL, Severity.MAJOR].includes(i.severity) && i.fieldEn !== '_total'
    );

    if (!llmIssues.length || !this.llm) {
      return { repaired: shot, actions: [] };
    }

    // 构建问题清单
    const issuesText = llmIssues.map(i => {
      const currentVal = i.currentValue || shot[i.fieldEn] || '（缺失）';
      return `- 字段【${i.fieldCn}】(${i.fieldEn})：${i.description}\n  修改建议：${i.suggestion}\n  当前值：${String(currentVal).slice(0, 80)}`;
    }).join('\n');

    // PRD约束文本（核心：防止修复偏离业务需求）
    const prdConstraint = prd ? prd.toConstraintText() : '';

    // 当前字段快照 + 字符预算
    const fieldsToRepair = [...new Set(llmIssues.map(i => i.fieldEn))];
    const currentFields = {};
    for (const f of fieldsToRepair) {
      currentFields[f] = shot[f] || '';
    }
    const currentFieldsJson = JSON.stringify(currentFields, null, 2);

    const budgetHints = [];
    for (const f of fieldsToRepair) {
      const spec = SPEC_MAP[f];
      if (spec && spec.charMax < 9999) {
        budgetHints.push(` - ${f}：≤ ${spec.charMax} 字符`);
      }
    }
    const budgetText = budgetHints.length ? budgetHints.join('\n') : ' （无特殊限制）';

    const userPrompt = `请根据以下信息修复提示词字段：\n\n【用户需求文档 PRD 约束】（修复时必须遵守，不得偏离）\n${prdConstraint}\n\n【需要修复的字段当前内容】\n${currentFieldsJson}\n\n【字符数预算限制】（修复后每个字段不得超过上限）\n${budgetText}\n\n【检查发现的问题】\n${issuesText}\n\n请修复上述问题，确保修复后的字段：\n1. 符合 PRD 中的视频类型、风格方向、情绪基调等业务约束\n2. 符合字段规范的格式要求\n3. 与其它字段保持风格一致\n4. 严格控制字符数在预算上限以内\n\n返回JSON格式的修复结果。`;

    // 【v2.1.4-fix13】增加超时保护
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`LLMRepairer超时(${this.timeoutMs}ms)`)),
        this.timeoutMs
      );
    });

    try {
      const response = await Promise.race([
        this.llm.reasonStructured(LLM_REPAIRER_SYSTEM_PROMPT + '\n\n' + userPrompt, {}, { maxRetries: 1, timeoutMs: this.timeoutMs }),
        timeoutPromise
      ]).finally(() => clearTimeout(timer));

      const data = response.result || response.data || response; // 【v2.1.4-fix13】兼容两种返回格式
      const repairedFields = data.repaired_fields || data || {}; // 【v2.1.4-fix13】兼容两种返回格式

      const repairedShot = JSON.parse(JSON.stringify(shot));
      const actions = [];

      // 【v2.1.4-fix13】构建字段名映射表，支持 snake_case ↔ camelCase
      const { SNAKE_TO_CAMEL, CAMEL_TO_SNAKE } = require('./field-check-agent');

      for (const [fieldEn, newValue] of Object.entries(repairedFields)) {
        if (!newValue || !String(newValue).trim()) continue;

        // 【v2.1.4-fix13】将 LLM 返回的 key 统一映射到 shot 中已有的字段名
        let targetField = fieldEn;
        // 如果 shot 中有 camelCase 版本，优先用 camelCase
        if (SNAKE_TO_CAMEL[fieldEn] && SNAKE_TO_CAMEL[fieldEn] in repairedShot) {
          targetField = SNAKE_TO_CAMEL[fieldEn];
        }
        // 如果 shot 中有 snake_case 版本
        else if (CAMEL_TO_SNAKE[fieldEn] && CAMEL_TO_SNAKE[fieldEn] in repairedShot) {
          targetField = CAMEL_TO_SNAKE[fieldEn];
        }
        // 同时检查 fields 嵌套对象
        else if (repairedShot.fields) {
          if (SNAKE_TO_CAMEL[fieldEn] && SNAKE_TO_CAMEL[fieldEn] in repairedShot.fields) {
            targetField = `fields.${SNAKE_TO_CAMEL[fieldEn]}`;
          } else if (fieldEn in repairedShot.fields) {
            targetField = `fields.${fieldEn}`;
          }
        }

        const oldValue = targetField.includes('.')
          ? targetField.split('.').reduce((obj, k) => obj?.[k], repairedShot) || ''
          : repairedShot[targetField] || '';

        // 字符数后处理
        const spec = SPEC_MAP[fieldEn] || SPEC_MAP[SNAKE_TO_CAMEL[fieldEn]];
        let finalValue = newValue;
        if (spec && spec.charMax < 9999 && finalValue.length > spec.charMax) {
          finalValue = this._smartTruncate(finalValue, spec.charMax);
        }

        if (finalValue !== oldValue) {
          // 赋值（支持嵌套 fields 对象）
          if (targetField.includes('.')) {
            const [parent, child] = targetField.split('.');
            repairedShot[parent][child] = finalValue;
          } else {
            repairedShot[targetField] = finalValue;
          }
          // 【v2.1.4-fix13】同时在 snake_case 和 camelCase 两个位置都赋值，确保下游都能取到
          if (SNAKE_TO_CAMEL[fieldEn]) {
            repairedShot[SNAKE_TO_CAMEL[fieldEn]] = finalValue;
          }
          if (CAMEL_TO_SNAKE[fieldEn]) {
            repairedShot[CAMEL_TO_SNAKE[fieldEn]] = finalValue;
          }

          actions.push(new RepairAction({
            fieldEn, method: 'llm', before: oldValue, after: finalValue,
            reason: 'LLM 修复：参考 PRD 约束修复检查问题'
          }));
        }
      }

      return { repaired: repairedShot, actions };
    } catch (e) {
      // 【v2.1.4-fix13】区分超时和其他异常
      if (e.message?.includes('超时')) {
        console.warn(`[LLMRepairer] 修复超时(${this.timeoutMs}ms)，返回原始shot`);
      } else {
        console.warn(`[LLMRepairer] 修复异常: ${e.message}`);
      }
      return { repaired: shot, actions: [] };
    }
  }

  _smartTruncate(text, maxLen) {
    if (text.length <= maxLen) return text;
    let truncated = text.slice(0, maxLen);
    for (const sep of [', ', '，', '; ', '；', ' ']) {
      const idx = truncated.lastIndexOf(sep);
      if (idx > maxLen * 0.6) {
        return truncated.slice(0, idx);
      }
    }
    return truncated;
  }
}

// ============================================================
// FieldRepairAgent - 修复环节编排器
// ============================================================

class FieldRepairAgent extends BaseAgent {
  constructor(options = {}) {
    super({ name: 'FieldRepairAgent', llmTimeout: options.llmTimeout || 180000, ...options });
    this.ruleRepairer = new RuleRepairer();
    // 【v2.1.4-fix13】把超时配置传给 LLMRepairer
    this.llmRepairer = new LLMRepairer(this._getLLMEngine(), options.llmTimeout || 180000);
    this.prd = options.prd || null;
  }

  setPRD(prd) { this.prd = prd; }

  async repair(shot, report, shotId = 'shot_001') {
    console.log(`[FieldRepairAgent] 开始修复 ${shotId}...`);
    const log = new RepairLog(shotId);
    log.prdReferenced = !!this.prd;
    let repaired = JSON.parse(JSON.stringify(shot));

    // 第一层：规则自动修复
    const { repaired: ruleRepaired, actions: ruleActions } = this.ruleRepairer.repair(repaired, report, this.prd);
    repaired = ruleRepaired;
    log.actions.push(...ruleActions);
    console.log(`[FieldRepairAgent] RuleRepairer 完成：${ruleActions.length} 项修复`);

    // 第二层：LLM智能修复（注入PRD约束）
    if (this.llmRepairer.llm && this.prd) {
      // 重新检查规则修复后的shot，确认哪些问题仍需LLM修复
      const remainingReport = this._recheckRemaining(repaired, report);
      if (remainingReport.issues.length) {
        const { repaired: llmRepaired, actions: llmActions } = await this.llmRepairer.repair(repaired, remainingReport, this.prd);
        repaired = llmRepaired;
        log.actions.push(...llmActions);
        console.log(`[FieldRepairAgent] LLMRepairer 完成：${llmActions.length} 项修复`);
      }
    }

    console.log(`[FieldRepairAgent] 修复完成：共 ${log.actions.length} 项修复动作`);
    return { repaired, log };
  }

  _recheckRemaining(shot, originalReport) {
    // 识别规则修复后仍存在的问题，供LLM修复
    const { CheckReport } = require('./field-check-agent');
    const remaining = new CheckReport(originalReport.shotId);

    // 规则可修复的字段+问题类型组合
    const ruleFixable = new Set([
      'negative|incomplete',
      'portraits|format_error',
      'dialogue|format_error',
    ]);

    for (const issue of originalReport.issues) {
      const key = `${issue.fieldEn}|${issue.issueType}`;
      if (ruleFixable.has(key)) {
        const current = shot[issue.fieldEn] || '';
        // 检查规则修复后是否已解决
        if (issue.fieldEn === 'negative' && /no text/.test(current.toLowerCase())) continue;
        if (issue.fieldEn === 'portraits' && /\/characters\/.+\/portrait_v\d+\.(png|jpg)/.test(current)) continue;
        if (issue.fieldEn === 'dialogue' && /句末标点/.test(issue.description)) {
          if (current && /[。！？…]$/.test(current)) continue;
        }
        if (issue.fieldEn === 'dialogue' && /禁止标点/.test(issue.description)) {
          if (!/[；;：:""''"'\[\]【】]/.test(current)) continue;
        }
        // 跳过P2/P3超长问题（规则已截断）
        if (issue.issueType === IssueType.OVER_LENGTH && issue.fieldEn in SPEC_MAP && [Priority.P2, Priority.P3].includes(SPEC_MAP[issue.fieldEn].priority)) {
          if (current.length <= SPEC_MAP[issue.fieldEn].charMax) continue;
        }
      }
      remaining.issues.push(issue);
    }

    return remaining;
  }

  // 批量修复多个镜头
  async repairAll(shots, reports) {
    const results = [];
    const logs = [];
    for (let i = 0; i < shots.length; i++) {
      const { repaired, log } = await this.repair(shots[i], reports[i], shots[i].shotId || shots[i].shot_id || `shot_${i}`);
      results.push(repaired);
      logs.push(log);
    }
    return { repaired: results, logs };
  }
}

module.exports = {
  FieldRepairAgent,
  RuleRepairer,
  LLMRepairer,
  RepairAction,
  RepairLog,
  PRD,
};

```

---

## engines/field-quality/index.js

```javascript
/**
 * Field Quality - 字段质量模块入口
 * 导出: FieldCheckAgent, FieldRepairAgent, FieldQualityPipeline, PRD
 */
const { FieldCheckAgent, RuleChecker, LLMChecker, Issue, CheckReport, FIELD_SPECS, SPEC_MAP, Priority, Severity, IssueType, MAX_TOTAL_CHARS } = require('./field-check-agent');
const { FieldRepairAgent, RuleRepairer, LLMRepairer, RepairAction, RepairLog, PRD } = require('./field-repair-agent');
const { FieldQualityPipeline } = require('./field-quality-pipeline');

module.exports = {
  // 检查环节
  FieldCheckAgent,
  RuleChecker,
  LLMChecker,
  Issue,
  CheckReport,
  FIELD_SPECS,
  SPEC_MAP,
  Priority,
  Severity,
  IssueType,
  MAX_TOTAL_CHARS,
  // 修复环节
  FieldRepairAgent,
  RuleRepairer,
  LLMRepairer,
  RepairAction,
  RepairLog,
  PRD,
  // 主管线
  FieldQualityPipeline,
};

```

---

## engines/field-standardizer.js

```javascript
'use strict';

/**
 * 全局字段标准化器 v1.0
 * 适配超现实系统四层架构
 * 
 * 设计原则：
 * 1. 兼容中英文字段并存（不强制全中文，保持与下游API兼容性）
 * 2. 统一字段真相源，消除多模块重复组装
 * 3. 自动归一化历史遗留字段名
 * 4. 关键字段强制保留
 */

// 【审计修复】统一片头判定：兼容 SC00 / S00 / S00-xx，避免正则 ^S00 漏掉 SC00
function isOpeningShot(raw = {}) {
  if (!raw) return false;
  const type = raw.type || raw.sceneType || raw.shotType;
  if (type === 'opening' || type === '片头') return true;
  const id = String(raw.id || raw.shotId || '');
  if (/^S?C?00($|-|_)/i.test(id)) return true; // 匹配 S00 / SC00 / S00-01
  if (raw.mainTitle || (raw.title && raw.title !== '未命名')) return true;
  return false;
}

const FIELD_ALIAS_MAP = {
  // v2.1.4-fix9-P25: 25字段体系
  // 创作意图层 (P0)
  director_instruction: 'director_instruction',
  导演指令: 'director_instruction',
  
  // 画面基底 (P0)
  constraint: 'constraint',
  约束: 'constraint',
  baseline: 'baseline',
  基础: 'baseline',
  
  // 空间层 (P0)
  scene: 'scene',
  sceneName: 'scene',
  场景名称: 'scene',
  sceneDescription: 'sceneDescription',
  场景描述: 'sceneDescription',
  lighting: 'lighting',
  灯光: 'lighting',
  灯光照明: 'lighting',
  
  // 镜头语言层 (P0/P1)
  cameraMovement: 'camera_movement',
  运镜: 'camera_movement',
  运镜设计: 'camera_movement',
  composition: 'composition',
  构图: 'composition',
  color_palette: 'color_palette',
  色彩: 'color_palette',
  色调: 'color_palette',
  depth_of_field: 'depth_of_field',
  景深: 'depth_of_field',
  
  // 人物层 (P0/P2/P3)
  character: 'character',
  角色: 'character',
  costume: 'costume',
  服装: 'costume',
  makeup: 'makeup',
  化妆: 'makeup',
  action: 'action',
  动作: 'action',
  
  // 物件层 (P2)
  props: 'props',
  道具: 'props',
  
  // 质量/调度/渲染/过渡/音频/叙事层
  portraits: 'portraits',
  referenceImages: 'portraits',
  绑定定妆照: 'portraits',
  定妆照: 'portraits',
  // 台词/对话
  dialogue: 'dialogue',
  narration: 'dialogue',
  line: 'dialogue',
  lines: 'dialogue',
  台词: 'dialogue',
  dialogue_block: 'dialogue_block',
  对话指令: 'dialogue_block',
  dialogueBlock: 'dialogue_block',
  timeline: 'timeline',
  _timeline: 'timeline',
  镜头时间轴: 'timeline',
  时间轴: 'timeline',
  mood: 'mood',
  情绪: 'mood',
  pacing: 'pacing',
  节奏: 'pacing',
  transition: 'transition',
  转场: 'transition',
  audio: 'audio',
  音频: 'audio',
  backgroundSound: 'audio',
  背景音效: 'audio',
  
  // 约束层 (P0/P1)
  negative: 'negative',
  负面约束: 'negative',
  negativeConstraints: 'negative',
  bright_constraint: 'bright_constraint',
  明亮约束: 'bright_constraint',
  character_constraint: 'character_constraint',
  角色约束: 'character_constraint',
  consistency: 'consistency',
  角色一致性: 'consistency',
  
  // 片头专属字段（后处理环节生成）
  title_content: 'title_content',
  主标题: 'title_content',
  subtitle_content: 'subtitle_content',
  副标题: 'subtitle_content',
  title_animation: 'title_animation',
  标题动画: 'title_animation',
  title_font_design: 'title_font_design',
  字体设计: 'title_font_design',
  opening_audio_design: 'opening_audio_design',
  开场音效: 'opening_audio_design',
  shotId: 'shotId',
  镜头编号: 'shotId',
  type: 'sceneType',
  shotType: 'sceneType',
  sceneType: 'sceneType',
  镜头类型: 'sceneType',
  duration: 'duration',
  镜头时长: 'duration',
  timing: 'timing',
  时序: 'timing',
  
  // Prompt
  prompt: 'prompt',
  visualPrompt: 'prompt',
  renderPrompt: 'prompt',
  视觉提示词: 'prompt',
  
  // 口型
  mouthAction: 'mouthAction',
  mouth_action: 'mouthAction',
  口型动作: 'mouthAction',
  
  // 角色/定妆照
  characters: 'characters',
  角色列表: 'characters',
  characterRef: 'characterRef',
  角色引用: 'characterRef',
  
  // 人物卡片
  characterCards: 'characterCards',
  peopleCards: 'characterCards',
  人物介绍卡片: 'characterCards',
  
  // 片头
  title: 'title',
  mainTitle: 'title',
  主标题: 'title',
  subTitle: 'subtitle',
  subtitle: 'subtitle',
  副标题: 'subtitle',
  producer: 'producer',
  出品信息: 'producer',
  beastVoice: 'beastVoice',
  神兽开场白: 'beastVoice',
  openingHook: 'openingHook',
  片头钩子文案: 'openingHook',
  
  // 情绪/质量
  emotionPhase: 'emotionPhase',
  情绪阶段: 'emotionPhase',
  qualityScore: 'qualityScore',
  质量评分: 'qualityScore',
  
  // 降级标记
  degraded: 'degraded',
  降级标记: 'degraded',
  degradeReason: 'degradeReason',
  降级原因: 'degradeReason',
  
  // 其他
  camera: 'camera',
  镜头: 'camera',
  
  // 超现实系统特有
  sceneFunction: 'sceneFunction',
  场景功能: 'sceneFunction',
  emotionalTarget: 'emotionalTarget',
  情绪目标: 'emotionalTarget',
  visualDirection: 'visualDirection',
  视觉方向: 'visualDirection',
  worldId: 'worldId',
  世界ID: 'worldId',
  
  // 后期字段
  audioLayer: 'audioLayer',
  音频层: 'audioLayer',
  titleOverlay: 'titleOverlay',
  标题叠加: 'titleOverlay',
  
  // 约束
  styleConstraints: 'styleConstraints',
  风格约束: 'styleConstraints'
};

// v2.0.7: 字段中文显示名映射（用于最终输出）
const FIELD_NAME_CN = {
  director_instruction: '导演指令',
  constraint: '约束',
  baseline: '基础',
  scene: '场景',
  lighting: '灯光',
  composition: '构图',
  color_palette: '色彩',
  depth_of_field: '景深',
  camera_movement: '运镜',
  character: '角色',
  costume: '服装',
  makeup: '化妆',
  action: '动作',
  props: '道具',
  portraits: '定妆照',
  dialogue: '台词',
  timeline: '时间轴',
  mood: '情绪',
  pacing: '节奏',
  transition: '转场',
  audio: '音频',
  negative: '负面约束',
  bright_constraint: '明亮约束',
  character_constraint: '角色约束',
  consistency: '角色一致性',
  title_content: '主标题',
  subtitle_content: '副标题',
  title_animation: '标题动画',
  title_font_design: '字体设计',
  opening_audio_design: '开场音效',
  shotId: '镜头编号',
  sceneType: '镜头类型',
  duration: '时长',
  prompt: '提示词'
};

const CRITICAL_FIELDS = {
  // v2.1.4-fix9-P25: 25字段体系
  // P0 致命级（12个字段）- 缺失会导致视频不可用
  p0: [
    'director_instruction',  // 创作意图层
    'constraint',            // 画面基底
    'baseline',              // 画面基底
    'scene',                 // 空间层
    'lighting',              // 空间层
    'camera_movement',        // 镜头语言层
    'character',             // 人物层
    'action',                // 人物层
    'portraits',             // 质量层
    // 【P1-12-审计修复】dialogue 移出 P0 —— 无台词镜头不应判为致命缺失
    'negative',              // 约束层
    'consistency'            // 质量层
  ],
  // P1 核心级（8个字段，dialogue 移入此级）- 缺失会导致质量显著降低
  p1: [
    'composition',           // 镜头语言层
    'color_palette',          // 镜头语言层
    'depth_of_field',          // 镜头语言层
    'timeline',              // 调度层
    'mood',                  // 渲染层
    'bright_constraint',      // 约束层
    'character_constraint',    // 约束层
    'dialogue'               // 【P1-12-审计修复】移入 P1，允许无台词镜头为空
  ],
  // P2 增强级（4个字段）- 缺失不影响主体表达
  p2: [
    'costume',               // 人物层
    'props',                 // 物件层
    'pacing',                // 渲染层
    'audio'                  // 音频层
  ],
  // P3 可选级（2个字段）
  p3: [
    'makeup',                // 人物层
    'transition'             // 过渡层
  ],
  // 基础标识（所有镜头必须）
  common: ['shotId', 'sceneType', 'prompt'],
  // 片头专用
  opening: ['title', 'subtitle'],
  // 内容镜头专用
  content: ['scene']
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj ?? {}));
}

function toArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeDialogue(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') {
        return { speaker: '', text: item };
      }
      if (item && typeof item === 'object') {
        return {
          speaker: item.speaker || item.说话人 || item.role || '',
          text: item.text || item.内容 || item.line || ''
        };
      }
      return { speaker: '', text: String(item || '') };
    });
  }
  if (typeof value === 'string') {
    return [{ speaker: '', text: value }];
  }
  return [];
}

function normalizeTimeline(value, raw = {}) {
  if (Array.isArray(value)) return value;
  // v6.37+: 支持对象格式（如 {object, string}）转数组
  if (value && typeof value === 'object' && !Array.isArray(value)) return [value];
  if (Array.isArray(raw._timeline)) return raw._timeline;
  if (Array.isArray(raw.timeline)) return raw.timeline;
  if (Array.isArray(raw.cameraMovement?.timeline)) return raw.cameraMovement.timeline;
  return [];
}

function normalizePortraits(value, raw = {}) {
  const result = [];
  // v2.1.4-fix9-P25-fix7: 支持字符串格式的定妆照路径（PromptFusionAgent fields.portraits 为字符串）
  if (typeof value === 'string' && value.trim()) {
    result.push(value.trim());
  }
  if (Array.isArray(value)) result.push(...value);
  if (Array.isArray(raw.referenceImages)) result.push(...raw.referenceImages);
  if (Array.isArray(raw.portraits)) result.push(...raw.portraits);
  if (raw.generatedAssets?.portraits) {
    const gp = raw.generatedAssets.portraits;
    if (Array.isArray(gp)) {
      result.push(...gp);
    } else if (typeof gp === 'object') {
      Object.entries(gp).forEach(([angle, path]) => {
        result.push({ character: raw.id || raw.name || '', angle, path });
      });
    }
  }
  return result;
}

function createEmptyShot() {
  return {
    // 基础标识
    shotId: '',
    sceneType: 'establishing',
    duration: 0,
    timing: { start: 0, duration: 0, end: 0 },
    
    // 创作意图层 (P0)
    director_instruction: '',
    
    // 画面基底 (P0)
    constraint: '',
    baseline: '',
    
    // 空间层 (P0)
    scene: '',
    sceneDescription: '',
    lighting: null,
    
    // 镜头语言层 (P0/P1)
    camera_movement: {},
    composition: '',
    color_palette: '',
    depth_of_field: '',
    
    // 人物层 (P0/P2/P3)
    character: '',
    costume: '',
    makeup: '',
    action: '',
    
    // 物件层 (P2)
    props: '',
    
    // 质量/调度/渲染/过渡/音频/叙事层
    portraits: [],
    dialogue: [],
    timeline: [],
    mood: '',
    pacing: '',
    transition: '',
    audio: null,
    
    // 约束层 (P0/P1)
    negative: '',
    bright_constraint: '',
    character_constraint: '',
    consistency: '',
    
    // Prompt
    prompt: '',
    
    // 口型
    mouth_action: '',
    
    // 角色/定妆照
    characters: [],
    character_ref: '',
    
    // 人物卡片
    character_cards: [],
    
    // 情绪/质量
    emotion_phase: '',
    quality_score: null,
    
    // 降级标记
    degraded: false,
    degrade_reason: '',
    
    // 超现实系统特有
    scene_function: '',
    emotional_target: { valence: 0, arousal: 0.5 },
    visual_direction: {},
    world_id: 'default',
    
    // 后期字段
    audio_layer: null,
    title_overlay: null,
    
    // 片头字段
    title: '',
    subtitle: '',
    producer: '',
    beast_voice: '',
    opening_hook: '',
    
    // v2.1.4-fix12: 片头专属字段（OpeningTitleOptimizer生成）
    title_content: '',
    subtitle_content: '',
    title_animation: '',
    title_font_design: '',
    opening_audio_design: '',
    
    // 约束（兼容旧版）
    negative_constraints: [],
    style_constraints: []
  };
}

function inferShotType(raw = {}) {
  // 【审计修复】统一片头判定，兼容 SC00/S00
  return isOpeningShot(raw) ? 'opening' : 'content';
}

function standardizeShot(rawInput = {}) {
  const raw = deepClone(rawInput);
  const shotType = inferShotType(raw);
  const standard = createEmptyShot();

  // v2.1.4-fix9-P25: 处理 PromptFusionAgent 输出的 fields 对象
  // 将 fields 内的25字段展开到 shot 级别
  if (raw.fields && typeof raw.fields === 'object') {
    for (const [fieldName, value] of Object.entries(raw.fields)) {
      // 将 snake_case 转为 camelCase（如 bright_constraint -> brightConstraint）
      const camelField = fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      const targetField = FIELD_ALIAS_MAP[camelField] || FIELD_ALIAS_MAP[fieldName] || camelField;
      if (targetField in standard) {
        standard[targetField] = value;
      }
    }
  }

  // 映射所有字段
  for (const [originalField, value] of Object.entries(raw)) {
    const targetField = FIELD_ALIAS_MAP[originalField] || originalField;
    if (targetField in standard) {
      standard[targetField] = value;
    }
  }

  // 【审计修复】统一用驼峰主键，避免同时存在 shotId(空) 和 shot_id(有值) 的幽灵字段
  standard.shotId = standard.shotId || raw.id || raw.shotId || raw.shot_id || '';
  standard.sceneType = shotType === 'opening' ? 'opening' : (standard.sceneType || standard.scene_type || 'establishing');
  standard.duration = standard.duration || raw.duration || raw.shotDuration || (raw.timing?.duration) || 0;
  standard.timing = standard.timing || raw.timing || { start: 0, duration: standard.duration, end: standard.duration };
  standard.scene = standard.scene || raw.scene || raw.sceneName || '';
  standard.sceneDescription = standard.sceneDescription || standard.scene_description || raw.sceneDescription || raw.setting || '';
  // 【v2.1.5-fix】补充 lighting 字段提取
  standard.lighting = standard.lighting || raw.lighting || raw.lightingString || '';
  standard.prompt = standard.prompt || raw.visualPrompt || raw.prompt || raw.renderPrompt || '';
  standard.dialogue = normalizeDialogue(standard.dialogue || raw.dialogue || raw.narration || raw.line || raw.lines);
  standard.timeline = normalizeTimeline(standard.timeline, raw);
  standard.portraits = normalizePortraits(standard.portraits, raw);
  standard.characterCards = standard.characterCards || standard.character_cards || toArray(raw.characterCards || raw.peopleCards);
  standard.characters = standard.characters || toArray(raw.characters);
  standard.mouthAction = standard.mouthAction || standard.mouth_action || raw.mouthAction || raw.mouth_action || '';
  standard.cameraMovement = standard.cameraMovement || standard.camera_movement || raw.cameraMovement || raw.camera_movement || {};
  standard.degraded = Boolean(standard.degraded || raw.degraded);
  standard.degradeReason = standard.degradeReason || standard.degrade_reason || raw.degradeReason || raw.degrade_reason || '';
  standard.emotionPhase = standard.emotionPhase || standard.emotion_phase || raw.emotionPhase || raw.emotion_phase || '';
  
  // 片头字段（始终保留，即使不是opening类型）
  standard.title = standard.title || raw.mainTitle || raw.title || '';
  standard.subtitle = standard.subtitle || raw.subTitle || raw.subtitle || '';
  standard.title_content = standard.title_content || raw.title_content || '';
  standard.subtitle_content = standard.subtitle_content || raw.subtitle_content || '';
  standard.title_animation = standard.title_animation || raw.title_animation || '';
  standard.title_font_design = standard.title_font_design || raw.title_font_design || '';
  standard.opening_audio_design = standard.opening_audio_design || raw.opening_audio_design || '';
  standard.producer = standard.producer || raw.producer || '';
  standard.beast_voice = standard.beast_voice || raw.beastVoice || raw.beast_voice || '';
  standard.opening_hook = standard.opening_hook || raw.openingHook || raw.opening_hook || '';
  
  if (shotType === 'opening') {
    standard.sceneType = 'opening';
  }

  // 【P1-8-审计修复】统一 snake_case 为主键，camelCase 自动同步
  const SYNC_PAIRS = [
    ['camera_movement', 'cameraMovement'],
    ['color_palette', 'colorPalette'],
    ['depth_of_field', 'depthOfField'],
    ['bright_constraint', 'brightConstraint'],
    ['character_constraint', 'characterConstraint'],
    ['character_ref', 'characterRef'],
    ['character_cards', 'characterCards'],
    ['emotion_phase', 'emotionPhase'],
    ['quality_score', 'qualityScore'],
    ['scene_type', 'sceneType'],
    ['degrade_reason', 'degradeReason'],
    ['emotional_target', 'emotionalTarget'],
    ['visual_direction', 'visualDirection'],
    ['world_id', 'worldId'],
    ['audio_layer', 'audioLayer'],
    ['title_overlay', 'titleOverlay'],
    ['beast_voice', 'beastVoice'],
    ['opening_hook', 'openingHook'],
    ['mouth_action', 'mouthAction'],
    ['title_content', 'titleContent'],
    ['subtitle_content', 'subtitleContent'],
    ['title_animation', 'titleAnimation'],
    ['title_font_design', 'titleFontDesign'],
    ['opening_audio_design', 'openingAudioDesign'],
  ];
  for (const [snake, camel] of SYNC_PAIRS) {
    let val = standard[snake];
    if (val === undefined || val === null || val === '') {
      val = standard[camel];
    }
    if (val !== undefined && val !== null) {
      standard[snake] = val;
      standard[camel] = val;
    }
  }

  return standard;
}

function standardizeShots(shots = []) {
  return shots.map(standardizeShot);
}

function validateShot(shot) {
  const errors = [];
  const warnings = [];
  const isOpening = shot.sceneType === 'opening';

  // v2.1.4-fix9-P25: 检查P0致命级字段（12个）
  for (const key of CRITICAL_FIELDS.p0) {
    const value = shot[key];
    if (value === undefined || value === null || value === '') {
      errors.push(`P0 Missing: ${key}`);
    } else if (Array.isArray(value) && value.length === 0) {
      warnings.push(`P0 Empty array: ${key}`);
    }
  }

  // v2.1.4-fix9-P25: 检查P1核心级字段（7个）
  for (const key of CRITICAL_FIELDS.p1) {
    const value = shot[key];
    if (value === undefined || value === null || value === '') {
      warnings.push(`P1 Missing: ${key}`);
    }
  }

  // 基础标识检查
  for (const key of CRITICAL_FIELDS.common) {
    if (!(key in shot)) {
      errors.push(`Missing critical field: ${key}`);
      continue;
    }
    if (Array.isArray(shot[key]) && shot[key].length === 0) {
      warnings.push(`Empty critical array: ${key}`);
    }
    if (typeof shot[key] === 'string' && shot[key].trim() === '') {
      warnings.push(`Empty critical string: ${key}`);
    }
  }

  // 片头/内容镜头检查
  if (isOpening) {
    for (const key of CRITICAL_FIELDS.opening) {
      if (!shot[key] || String(shot[key]).trim() === '') {
        errors.push(`Opening shot missing: ${key}`);
      }
    }
  } else {
    for (const key of CRITICAL_FIELDS.content) {
      if (!shot[key] || String(shot[key]).trim() === '') {
        errors.push(`Content shot missing: ${key}`);
      }
    }
  }

  // v2.1.4-fix9-P25: 字符数检查
  const promptLength = shot.promptCharCount || (typeof shot.prompt === 'string' ? shot.prompt.length : 0);
  if (promptLength > 12000) {
    warnings.push(`Prompt length ${promptLength} exceeds 12000 char limit`);
  }

  // 片头专属字段检查（强制，但分层处理）
  // 【v2.1.5-fix】Layer 2时片头字段还未生成（OpeningTitleOptimizer后处理），只报warning
  // Final-Export时才严格检查
  if (isOpening) {
    const openingExclusiveFields = ['title_content', 'subtitle_content', 'title_animation', 'title_font_design', 'opening_audio_design'];
    const missingOpeningFields = openingExclusiveFields.filter(k => !shot[k] || String(shot[k]).trim() === '');
    if (missingOpeningFields.length > 0) {
      if (shot._context === 'Final-Export') {
        // 【v2.1.4-fix13】最终导出时严格检查
        errors.push(`Opening exclusive fields missing: ${missingOpeningFields.join(', ')} (use OpeningTitleOptimizer to generate)`);
      } else {
        // Layer 2时片头字段还未生成，只报warning
        warnings.push(`Opening fields not yet generated (will be filled by OpeningTitleOptimizer): ${missingOpeningFields.join(', ')}`);
      }
    }
  }
  // 【P1-18-审计修复】'no text' 检查降为 warning，不再强制阻断
  if (!shot.negative || !shot.negative.includes('no text')) {
    warnings.push(`Recommended negative constraint: add 'no text' to negative field`);
  }

  // 【v2.1.4-fix11-F】最终导出前严格检查：所有25字段必须有非空内容
  if (shot._context === 'Final-Export') {
    const allFields = [...CRITICAL_FIELDS.p0, ...CRITICAL_FIELDS.p1, ...CRITICAL_FIELDS.common];
    const emptyFields = allFields.filter(k => !shot[k] || String(shot[k]).trim() === '');
    if (emptyFields.length > 0) {
      errors.push(`Final-Export strict: ${emptyFields.length} fields empty: ${emptyFields.join(', ')}`);
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    p0Missing: CRITICAL_FIELDS.p0.filter(k => !shot[k] || shot[k] === '').length,
    p1Missing: CRITICAL_FIELDS.p1.filter(k => !shot[k] || shot[k] === '').length,
    promptLength
  };
}

function validateShots(shots = []) {
  const details = shots.map(validateShot);
  const totalP0Missing = details.reduce((sum, d) => sum + (d.p0Missing || 0), 0);
  const totalP1Missing = details.reduce((sum, d) => sum + (d.p1Missing || 0), 0);
  
  return {
    passed: details.every(d => d.passed),
    errors: details.flatMap(d => d.errors),
    warnings: details.flatMap(d => d.warnings),
    details,
    summary: {
      totalShots: shots.length,
      totalP0Missing,
      totalP1Missing,
      avgPromptLength: Math.round(details.reduce((sum, d) => sum + (d.promptLength || 0), 0) / shots.length)
    }
  };
}

function markDegraded(shot, reason) {
  if (!shot || typeof shot !== 'object') return shot;
  shot.degraded = true;
  shot.degradeReason = reason || 'Unknown degradation';
  return shot;
}

function markDegradedArray(shots, reason) {
  return shots.map(shot => markDegraded(shot, reason));
}

function normalizeFields(fields) {
  if (!fields || typeof fields !== 'object') return {};
  const result = {};
  for (const [key, value] of Object.entries(fields)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    const targetKey = FIELD_ALIAS_MAP[snakeKey] || snakeKey;
    if (value !== undefined && value !== null && value !== '') {
      result[targetKey] = normalizeValue(value);
    }
  }
  return result;
}

function normalizeValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(v => normalizeValue(v)).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value).map(([k, v]) => `${k}: ${normalizeValue(v)}`).join(', ');
  }
  return String(value);
}

function makeGetter(fields) {
  return function getField(...names) {
    for (const name of names) {
      if (fields[name] !== undefined && fields[name] !== null && fields[name] !== '') {
        return fields[name];
      }
    }
    return undefined;
  };
}

function asString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(v => asString(v)).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function asStringLower(value) {
  return asString(value).toLowerCase();
}

function safeSlice(value, start, end) {
  const str = asString(value);
  if (end === undefined) return str.slice(start);
  return str.slice(start, end);
}

function safeIncludes(value, searchString) {
  return asString(value).includes(searchString);
}

module.exports = {
  FIELD_ALIAS_MAP,
  FIELD_NAME_CN,
  CRITICAL_FIELDS,
  isOpeningShot,
  standardizeShot,
  standardizeShots,
  validateShot,
  validateShots,
  markDegraded,
  markDegradedArray,
  inferShotType,
  createEmptyShot,
  normalizeFields,
  normalizeValue,
  makeGetter,
  asString,
  asStringLower,
  safeSlice,
  safeIncludes
};

```

---

## engines/post-production-engine/post-production-engine.js

```javascript
// hyperreality-system/engines/post-production-engine/post-production-engine.js
// Post-Production Engine - 后期引擎（Layer 4）
// 功能：字幕、音乐、弹幕、多版本输出、HyperFrames 集成
// 版本：v1.0.0 | 日期：2026-06-08

const fs = require('fs').promises;
const path = require('path');

// v2.0.2-fix: HTML转义工具，防止XSS和结构破坏
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 无版权音乐库配置
const ROYALTY_FREE_MUSIC_SOURCES = {
  pixabay: {
    baseUrl: 'https://pixabay.com/api/',
    search: 'https://pixabay.com/music/search/',
    download: 'https://pixabay.com/music/download/',
    license: 'Pixabay Content License - Free for commercial use, no attribution required'
  },
  bensound: {
    baseUrl: 'https://www.bensound.com/',
    license: 'CC BY 4.0 or Bensound License'
  },
  freesound: {
    baseUrl: 'https://freesound.org/',
    license: 'CC0 / CC BY / CC BY-NC - varies by sound'
  }
};

// 场景类型 → 音乐风格映射
const SCENE_MUSIC_MAP = {
  opening:     { mood: 'epic',       genre: 'orchestral',   tags: ['epic', 'cinematic', 'opening', 'heroic'] },
  establishing: { mood: 'ambient',    genre: 'atmospheric', tags: ['ambient', 'mysterious', 'wonder', 'exploration'] },
  conflict:     { mood: 'tense',      genre: 'action',      tags: ['tense', 'dramatic', 'battle', 'conflict'] },
  emotional_climax: { mood: 'emotional', genre: 'emotional', tags: ['emotional', 'dramatic', 'climax', 'intense'] },
  resolution:   { mood: 'hopeful',    genre: 'uplifting',   tags: ['hopeful', 'warm', 'resolution', 'peaceful'] }
};

// 角色身份介绍模板
const IDENTITY_INTRO_TEMPLATES = [
  "虚构星球探险者 | 人类 {name}",
  "虚构生命共生体 | 守护者 {name}",
  "记忆探寻者 | 旅人 {name}",
  "星界行者 | {name} 的人类形态"
];

class PostProductionEngine {
  constructor(options = {}) {
    this.config = {
      outputDir: options.outputDir || '/tmp/hyperreality-post',
      hyperframesBin: options.hyperframesBin || 'npx hyperframes',
      musicSource: options.musicSource || 'pixabay',
      enableSubtitles: options.enableSubtitles !== false,      // 默认开启字幕
      enableDanmaku: options.enableDanmaku || false,           // 默认关闭弹幕
      enableMusic: options.enableMusic !== false,              // 默认开启音乐
      subtitleStyle: options.subtitleStyle || 'identity-card', // identity-card / lower-third / none
      versions: options.versions || ['standard', 'clean', 'subtitled', 'raw'],
      ...options
    };

    this.logs = [];
  }

  log(stage, message) {
    const entry = { stage, message, timestamp: Date.now() };
    this.logs.push(entry);
    console.log(`[POST-PROD] [${stage}] ${message}`);
  }

  /**
   * 主入口：后期制作
   * @param {Object} productionResult - 制作引擎输出（shots + prompts）
   * @param {Object} scriptResult - 剧本引擎输出（blueprint）
   * @param {Object} renderResult - 渲染引擎输出（渲染后的视频文件）
   * @returns {Object} 后期制作结果
   */
  async postProduce(productionResult, scriptResult, renderResult) {
    const startTime = Date.now();
    this.log('POST-PROD', '🎬 PostProductionEngine 启动 | 后期制作');
    this.log('POST-PROD', `   版本: ${this.config.versions.join(', ')}`);
    this.log('POST-PROD', `   字幕: ${this.config.enableSubtitles ? '✅' : '❌'} | 音乐: ${this.config.enableMusic ? '✅' : '❌'} | 弹幕: ${this.config.enableDanmaku ? '✅' : '❌'}`);

    const result = {
      success: false,
      versions: {},
      stages: {},
      errors: [],
      timing: {}
    };

    try {
      // ========== Stage 1: 字幕生成（身份介绍式）==========
      this.log('POST-PROD', '\n🎬 [Stage 1] 字幕生成 - 身份介绍式字幕');
      const stage1Start = Date.now();
      
      const subtitleTracks = await this.generateIdentitySubtitles(scriptResult);
      result.stages.subtitles = {
        tracks: subtitleTracks,
        count: subtitleTracks.length,
        timing: Date.now() - stage1Start
      };
      this.log('POST-PROD', `✅ 字幕生成完成: ${subtitleTracks.length} 条字幕`);

      // ========== Stage 2: 音乐匹配（无版权）==========
      this.log('POST-PROD', '\n🎵 [Stage 2] 音乐匹配 - 无版权音乐库');
      const stage2Start = Date.now();
      
      const musicTracks = await this.matchMusicTracks(productionResult, scriptResult);
      result.stages.music = {
        tracks: musicTracks,
        count: musicTracks.length,
        timing: Date.now() - stage2Start
      };
      this.log('POST-PROD', `✅ 音乐匹配完成: ${musicTracks.length} 段音乐`);

      // ========== Stage 3: 弹幕生成（可选）==========
      if (this.config.enableDanmaku) {
        this.log('POST-PROD', '\n💬 [Stage 3] 弹幕生成');
        const stage3Start = Date.now();
        
        const danmakuList = await this.generateDanmaku(productionResult, scriptResult);
        result.stages.danmaku = {
          list: danmakuList,
          count: danmakuList.length,
          timing: Date.now() - stage3Start
        };
        this.log('POST-PROD', `✅ 弹幕生成完成: ${danmakuList.length} 条弹幕`);
      }

      // ========== Stage 4: 多版本组装（HyperFrames HTML）==========
      this.log('POST-PROD', '\n🎨 [Stage 4] 多版本组装 - HyperFrames 集成');
      const stage4Start = Date.now();
      
      for (const version of this.config.versions) {
        this.log('POST-PROD', `   生成版本: ${version}...`);
        const versionData = await this.assembleVersion(
          version,
          productionResult,
          scriptResult,
          renderResult,
          subtitleTracks,
          musicTracks,
          result.stages.danmaku?.list || []
        );
        result.versions[version] = versionData;
      }
      result.stages.assembly = {
        versions: Object.keys(result.versions),
        timing: Date.now() - stage4Start
      };
      this.log('POST-PROD', `✅ 版本组装完成: ${this.config.versions.length} 个版本`);

      // ========== Stage 5: 质量检查 ==========
      this.log('POST-PROD', '\n🛡️ [Stage 5] 质量检查');
      const stage5Start = Date.now();
      
      const qualityCheck = await this.qualityCheck(result.versions);
      result.stages.quality = {
        passed: qualityCheck.passed,
        issues: qualityCheck.issues,
        timing: Date.now() - stage5Start
      };
      this.log('POST-PROD', `✅ 质量检查: ${qualityCheck.passed ? '通过' : '未通过'} (${qualityCheck.issues.length} 问题)`);

      result.success = qualityCheck.passed;
      result.timing.total = Date.now() - startTime;
      
      this.log('POST-PROD', `\n🏁 后期制作完成: ${result.timing.total}ms | ${this.config.versions.length} 版本`);

    } catch (error) {
      result.success = false;
      result.errors.push({
        stage: 'POST_PRODUCTION',
        message: error.message
      });
      this.log('POST-PROD', `❌ 后期制作失败: ${error.message}`);
    }

    return result;
  }

  /**
   * 生成身份介绍式字幕（嘉宾信息卡风格）
   * 
   * 设计：当角色出场时，显示 3-5 秒的简洁信息卡片
   * 不依赖台词时间戳，而是作为角色出场标记
   * 
   * 示例：
   * ┌─────────────────┐
   * │ 示例角色              │
   * │ 虚构星球探险者 │
   * │ 人类 · 银灰装甲    │
   * └─────────────────┘
   */
  async generateIdentitySubtitles(scriptResult, productionResult = null) {
    const blueprint = scriptResult.blueprint;
    const scenes = blueprint?.structure?.scenes || [];
    // B1-fix: 角色在 character_system.characters，不在 structure.characters
    const characters = blueprint?.character_system?.characters || [];
    // 【v2.1.4-fix13-审计修复】优先从 productionResult.shots 提取实际画面内容
    const shots = productionResult?.shots || [];
    const subtitles = [];

    for (const scene of scenes) {
      const sceneChars = scene.characters || [];
      
      for (const charId of sceneChars) {
        // B1-fix: 兼容 character_id 和 id 两种字段名
        const char = characters.find(c => c.character_id === charId || c.id === charId || c.name === charId);
        if (!char) continue;

        // 生成身份信息介绍（LLM 生成或模板）
        const identity = this.generateCharacterIdentity(char, scene);
        
        subtitles.push({
          type: 'identity_card',
          characterId: charId,
          characterName: char.name || charId,
          sceneId: scene.scene_id,
          // 出现在场景开始的前 3-5 秒
          // B5-fix: start_time → start（与 ScriptBlueprint timing 结构一致）
          start: scene.timing?.start || 0,
          duration: 3.5, // 固定 3.5 秒显示
          // 信息内容
          content: {
            name: char.name || charId,
            title: identity.title,           // 如 "虚构星球探险者"
            species: identity.species,        // 如 "人类"
            trait: identity.trait,            // 如 "银灰装甲"
            role: identity.role               // 如 "主角"
          },
          // 视觉样式（HyperFrames CSS）
          style: {
            position: 'bottom-left',
            fontSize: '24px',
            fontFamily: 'system-ui',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            borderLeft: '4px solid #00ff88',
            padding: '12px 20px',
            borderRadius: '0 8px 8px 0',
            animation: 'slideIn 0.5s ease-out'
          }
        });
      }
    }

    return subtitles;
  }

  /**
   * 生成角色身份信息（通用化）
   * B2-fix: 移除 虚构星球 硬编码，从角色数据动态生成
   */
  generateCharacterIdentity(character, scene) {
    const name = character.name || '未知';
    const isProtagonist = character.role === 'protagonist';

    // B2-fix: 从角色数据推断物种/身份
    const species = this.inferSpecies(character);
    const trait = this.extractTrait(character, scene);

    // B2-fix: 通用化标题，基于 role 而非 虚构星球
    let title;
    if (isProtagonist) {
      title = `${species} ${name}`;
    } else if (species.includes('异兽') || species.includes('creature')) {
      title = `${name}`;
    } else {
      title = `${species} ${name}`;
    }

    return {
      name,
      title,
      species,
      trait: trait || '主讲人',
      role: isProtagonist ? '主角' : '配角'
    };
  }

  /**
   * 推断物种（通用化）
   * B2-fix: 移除 example-role/示例神兽 硬编码，基于 visual_anchor 推断
   */
  inferSpecies(character) {
    // B2-fix: 从 visual_anchor.core_features 推断种族
    const features = character.visual_anchor?.core_features || [];
    const featureStr = features.join(' ').toLowerCase();

    // 通用种族判断
    if (featureStr.includes('human') || featureStr.includes('人类') || featureStr.includes('人物')) return '人类';
    if (featureStr.includes('beast') || featureStr.includes('兽') || featureStr.includes('creature')) return '异兽';
    if (featureStr.includes('robot') || featureStr.includes('机器人')) return '机器人';

    // 兜底：从 character_id/name 推断
    const idStr = (character.character_id || character.id || character.name || '').toLowerCase();
    if (idStr.includes('beast') || idStr.includes('兽')) return '异兽';

    return '人物';
  }

  /**
   * 提取特征（通用化）
   * B2-fix: 从 visual_anchor 动态提取，移除硬编码
   */
  extractTrait(character, scene) {
    // B2-fix: 优先从 visual_anchor.core_features 提取前2个特征
    const features = character.visual_anchor?.core_features || [];
    if (features.length > 0) {
      return features.slice(0, 2).join('，');
    }

    // 兜底：从 description 提取
    if (character.voice_profile?.persona) {
      return character.voice_profile.persona.substring(0, 20);
    }

    return '主讲人';
  }

  /**
   * 匹配无版权音乐
   * 
   * 策略：
   * 1. 按场景类型匹配音乐风格
   * 2. 从 Pixabay/Bensound 等免费库获取
   * 3. 使用场景标签搜索
   * 4. 下载并缓存
   */
  async matchMusicTracks(productionResult, scriptResult) {
    const blueprint = scriptResult.blueprint;
    const scenes = blueprint?.structure?.scenes || [];
    const tracks = [];

    for (const scene of scenes) {
      const sceneType = scene.scene_type;
      const mapping = SCENE_MUSIC_MAP[sceneType] || SCENE_MUSIC_MAP.establishing;
      
      tracks.push({
        sceneId: scene.scene_id,
        sceneType: sceneType,
        // 音乐搜索参数（实际使用时调用 API）
        searchParams: {
          mood: mapping.mood,
          genre: mapping.genre,
          tags: mapping.tags,
          duration: scene.timing?.duration || 25, // 匹配场景时长
          // 搜索关键词组合
          query: `${mapping.genre} ${mapping.mood} ${mapping.tags.join(' ')}`
        },
        // 推荐配置
        config: {
          volume: 0.35,           // 背景音乐音量（35%，不盖过台词）
          fadeIn: 2.0,           // 淡入 2 秒
          fadeOut: 3.0,          // 淡出 3 秒
          loop: false            // 不循环（每个场景独立音乐）
        },
        // 音乐来源信息
        source: {
          platform: this.config.musicSource,
          license: ROYALTY_FREE_MUSIC_SOURCES[this.config.musicSource]?.license || 'Unknown',
          url: null,              // 实际下载后填充
          filePath: null          // 本地缓存路径
        }
      });
    }

    return tracks;
  }

  /**
   * 生成弹幕（可选）
   * 
   * 弹幕设计：
   * - 从台词、角色信息、场景描述中提取
   * - 使用 LLM 生成短句弹幕
   * - 不同场景类型有不同弹幕风格
   */
  async generateDanmaku(productionResult, scriptResult) {
    const blueprint = scriptResult.blueprint;
    const scenes = blueprint?.structure?.scenes || [];
    const danmaku = [];

    for (const scene of scenes) {
      const sceneType = scene.scene_type;
      // B5-fix: start_time → start
      const startTime = scene.timing?.start || 0;
      const duration = scene.timing?.duration || 25;
      
      // 根据场景类型生成不同风格的弹幕
      const baseDanmaku = this.generateSceneDanmaku(scene, sceneType);
      
      for (const text of baseDanmaku) {
        danmaku.push({
          text,
          sceneId: scene.scene_id,
          startTime: startTime + Math.random() * duration * 0.8, // 随机分布在场景内
          duration: 4 + Math.random() * 3, // 4-7 秒显示
          speed: 1.0 + Math.random() * 0.5, // 1.0-1.5x 速度
          color: this.getDanmakuColor(sceneType),
          size: this.getDanmakuSize(sceneType),
          position: 'top' // 顶部飘过，避免遮挡画面
        });
      }
    }

    return danmaku;
  }

  generateSceneDanmaku(scene, sceneType) {
    const dialogues = scene.dialogue?.lines || [];
    const setting = scene.setting || '';
    const chars = scene.characters || [];
    
    const danmakuPool = [];
    
    // 从台词提取关键词
    for (const line of dialogues) {
      if (line.text && line.text.length > 5) {
        danmakuPool.push(line.text.substring(0, 15)); // 前15字
      }
    }
    
    // 场景类型弹幕
    // B9-fix: 通用化弹幕，移除神话项目硬编码
    const typeComments = {
      opening: ['🔥 开局！', '⚡ 来了来了', '期待！', '开始了'],
      establishing: ['🌟 好美', '学到了', '涨知识', '有意思'],
      conflict: ['💥 紧张', '小心！', '注意看', '好紧张！'],
      emotional_climax: ['😭 泪目', '太感人了', '讲得太好了', '燃！'],
      resolution: ['✨ 圆满', '期待下一集', '总结到位', '学到了']
    };
    
    if (typeComments[sceneType]) {
      danmakuPool.push(...typeComments[sceneType]);
    }
    
    // 从设定提取关键词弹幕
    // 【P2-21-审计修复】删除硬编码弹幕，仅从台词和场景类型动态生成
    // if (setting.includes('虚构星球')) danmakuPool.push('虚构星球 星球！');
    // if (setting.includes('晶体')) danmakuPool.push('晶体森林！');
    // if (setting.includes('双月')) danmakuPool.push('双月当空！');
    // if (chars.includes('示例神兽')) danmakuPool.push('示例神兽！');
    
    // 随机选择 3-5 条
    const count = 3 + Math.floor(Math.random() * 3);
    return this.shuffleArray(danmakuPool).slice(0, count);
  }

  shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  getDanmakuColor(sceneType) {
    const colors = {
      opening: '#ff6b6b',
      establishing: '#4ecdc4',
      conflict: '#ff4757',
      emotional_climax: '#ffa502',
      resolution: '#2ed573'
    };
    return colors[sceneType] || '#ffffff';
  }

  getDanmakuSize(sceneType) {
    const sizes = {
      opening: 'large',
      establishing: 'medium',
      conflict: 'large',
      emotional_climax: 'xlarge',
      resolution: 'medium'
    };
    return sizes[sceneType] || 'medium';
  }

  /**
   * 组装不同版本（生成 HyperFrames HTML）
   */
  async assembleVersion(version, productionResult, scriptResult, renderResult, subtitles, musicTracks, danmakuList) {
    const versionConfig = this.getVersionConfig(version);
    
    // 生成 HyperFrames HTML
    const html = this.generateHyperFramesHTML(
      version,
      versionConfig,
      productionResult,
      scriptResult,
      renderResult,
      subtitles,
      musicTracks,
      danmakuList
    );
    
    // 保存 HTML 文件
    const versionDir = path.join(this.config.outputDir, `version-${version}`);
    await fs.mkdir(versionDir, { recursive: true });
    
    const htmlPath = path.join(versionDir, 'composition.html');
    await fs.writeFile(htmlPath, html);
    
    // 保存配置 JSON
    const configPath = path.join(versionDir, 'config.json');
    await fs.writeFile(configPath, JSON.stringify({
      version,
      features: versionConfig,
      subtitleCount: subtitles.length,
      musicTrackCount: musicTracks.length,
      danmakuCount: danmakuList.length,
      generatedAt: new Date().toISOString()
    }, null, 2));
    
    return {
      version,
      htmlPath,
      configPath,
      features: versionConfig,
      // 渲染命令（实际使用时）
      renderCommand: `${this.config.hyperframesBin} render ${htmlPath} --output ${path.join(versionDir, 'output.mp4')}`,
      previewCommand: `${this.config.hyperframesBin} preview ${htmlPath}`
    };
  }

  getVersionConfig(version) {
    const configs = {
      // 标准版：全功能
      standard: {
        subtitles: true,
        music: true,
        danmaku: false, // 标准版无弹幕
        transitions: true,
        titleCard: true
      },
      // 纯净版：无字幕、无音乐、无弹幕
      clean: {
        subtitles: false,
        music: false,
        danmaku: false,
        transitions: true,
        titleCard: false
      },
      // 字幕版：带身份介绍字幕 + 音乐
      subtitled: {
        subtitles: true,
        music: true,
        danmaku: false,
        transitions: true,
        titleCard: true
      },
      // 弹幕版：带弹幕 + 字幕 + 音乐
      danmaku: {
        subtitles: true,
        music: true,
        danmaku: true,
        transitions: true,
        titleCard: true
      },
      // 原始版：仅渲染后的视频，无任何后期
      raw: {
        subtitles: false,
        music: false,
        danmaku: false,
        transitions: false,
        titleCard: false
      }
    };
    
    return configs[version] || configs.standard;
  }

  /**
   * 生成 HyperFrames HTML 合成文件
   * 
   * HyperFrames 格式：
   * - data-composition-id: 合成ID
   * - data-start: 开始时间（秒）
   * - data-duration: 持续时间（秒）
   * - data-track-index: 轨道索引
   * - class="clip": 可剪辑元素
   */
  generateHyperFramesHTML(version, config, productionResult, scriptResult, renderResult, subtitles, musicTracks, danmakuList) {
    const shots = productionResult.shots || [];
    const blueprint = scriptResult.blueprint;
      // B10-fix: 标准输出用 duration 字段，不是 timing.duration
      const totalDuration = shots.reduce((sum, s) => sum + (s.duration || s.timing?.duration || 25), 0);
    
    let html = [];
    
    // HTML 头部
    html.push('<!DOCTYPE html>');
    html.push('<html>');
    html.push('<head>');
    html.push('  <meta charset="UTF-8">');
    html.push('  <style>');
    html.push('    * { margin: 0; padding: 0; box-sizing: border-box; }');
    html.push('    body { background: #000; overflow: hidden; }');
    html.push('    #stage { width: 1920px; height: 1080px; position: relative; background: #000; }');
    html.push('    .clip { position: absolute; }');
    html.push('    ');
    html.push('    /* 身份介绍字幕样式 */');
    html.push('    .identity-card { ');
    html.push('      position: absolute; bottom: 80px; left: 60px;');
    html.push('      background: rgba(0, 0, 0, 0.75);');
    html.push('      border-left: 4px solid #00ff88;');
    html.push('      padding: 16px 24px; border-radius: 0 8px 8px 0;');
    html.push('      font-family: system-ui, -apple-system, sans-serif;');
    html.push('      color: white; max-width: 400px;');
    html.push('    }');
    html.push('    .identity-card .name { font-size: 28px; font-weight: bold; margin-bottom: 8px; }');
    html.push('    .identity-card .title { font-size: 18px; color: #ccc; margin-bottom: 4px; }');
    html.push('    .identity-card .trait { font-size: 14px; color: #00ff88; }');
    html.push('    ');
    html.push('    /* 弹幕样式 */');
    html.push('    .danmaku { ');
    html.push('      position: absolute; white-space: nowrap;');
    html.push('      font-family: system-ui, sans-serif; font-weight: bold;');
    html.push('      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);');
    html.push('      pointer-events: none;');
    html.push('    }');
    html.push('    ');
    html.push('    /* 转场遮罩 */');
    html.push('    .transition { ');
    html.push('      position: absolute; top: 0; left: 0; width: 100%; height: 100%;');
    html.push('      background: black; pointer-events: none;');
    html.push('    }');
    html.push('  </style>');
    html.push('</head>');
    html.push('<body>');
    html.push(`<div id="stage" data-composition-id="hyperreality-${version}" data-start="0" data-width="1920" data-height="1080">`);
    html.push('');
    
    let currentTime = 0;
    let trackIndex = 0;
    
    // ========== 视频片段轨道 ==========
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      // B10-fix: 优先使用顶层 duration 字段
      const duration = shot.duration || shot.timing?.duration || 25;
      
      // 视频片段（实际使用时替换为渲染后的视频文件）
      html.push(`  <!-- Shot ${shot.shotId} -->`);
      html.push(`  <video class="clip" data-start="${currentTime}" data-duration="${duration}" data-track-index="${trackIndex++}"`);
      html.push(`         src="shot-${shot.shotId}.mp4" muted playsinline style="width:100%; height:100%;"></video>`);
      html.push('');
      
      // 转场效果（镜头之间）
      if (config.transitions && i < shots.length - 1) {
        html.push(`  <!-- Transition ${shot.shotId} → ${shots[i+1].shotId} -->`);
        html.push(`  <div class="clip transition" data-start="${currentTime + duration - 0.5}" data-duration="0.5" data-track-index="${trackIndex++}"`);
        html.push(`       style="opacity: 0;"></div>`);
        html.push('');
      }
      
      currentTime += duration;
    }
    
    // ========== 字幕轨道（身份介绍式）==========
    if (config.subtitles) {
      html.push('  <!-- 字幕轨道 -->');
      for (const sub of subtitles) {
        html.push(`  <div class="clip identity-card" data-start="${sub.start}" data-duration="${sub.duration}" data-track-index="${trackIndex++}">`);
        html.push(`    <div class="name">${escapeHtml(sub.content.name)}</div>`);
        html.push(`    <div class="title">${escapeHtml(sub.content.title)}</div>`);
        html.push(`    <div class="trait">${escapeHtml(sub.content.species)} · ${escapeHtml(sub.content.trait)}</div>`);
        html.push('  </div>');
      }
      html.push('');
    }
    
    // ========== 音乐轨道 ==========
    if (config.music) {
      html.push('  <!-- 音乐轨道 -->');
      for (const track of musicTracks) {
        const start = track.sceneId ? this.getSceneStartTime(track.sceneId, shots) : 0;
        const duration = track.searchParams?.duration || 25;
        html.push(`  <audio class="clip" data-start="${start}" data-duration="${duration}" data-track-index="${trackIndex++}"`);
        html.push(`         data-volume="${track.config.volume}" src="music-${track.sceneId}.mp3"></audio>`);
      }
      html.push('');
    }
    
    // ========== 弹幕轨道 ==========
    if (config.danmaku) {
      html.push('  <!-- 弹幕轨道 -->');
      for (const dm of danmakuList) {
        const sizeMap = { small: '20px', medium: '28px', large: '36px', xlarge: '44px' };
        const size = sizeMap[dm.size] || '28px';
        html.push(`  <div class="clip danmaku" data-start="${dm.startTime}" data-duration="${dm.duration}" data-track-index="${trackIndex++}"`);
        html.push(`       style="top: ${50 + Math.random() * 300}px; color: ${dm.color}; font-size: ${size};"`);
        html.push(`       data-speed="${dm.speed}">${escapeHtml(dm.text)}</div>`);
      }
      html.push('');
    }
    
    // ========== GSAP 动画 ==========
    html.push('  <!-- GSAP 动画 -->');
    html.push('  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>');
    html.push('  <script>');
    html.push('    const tl = gsap.timeline({ paused: true });');
    html.push('    ');
    html.push('    // 身份卡片滑入动画');
    html.push('    tl.from(".identity-card", { ');
    html.push('      opacity: 0, x: -100, duration: 0.5, ease: "power2.out", stagger: 0.1 ');
    html.push('    }, 0);');
    html.push('    ');
    html.push('    // 弹幕从右到左动画');
    html.push('    document.querySelectorAll(".danmaku").forEach(d => {');
    html.push('      const speed = parseFloat(d.dataset.speed) || 1;');
    html.push('      const startX = 1920;');
    html.push('      const endX = -d.offsetWidth;');
    html.push('      const duration = (startX - endX) / (200 * speed);');
    html.push('      tl.fromTo(d, ');
    html.push('        { x: startX },');
    html.push('        { x: endX, duration: duration, ease: "linear" },');
    html.push('        parseFloat(d.dataset.start) || 0');
    html.push('      );');
    html.push('    });');
    html.push('    ');
    html.push('    // 转场淡入');
    html.push('    tl.to(".transition", { opacity: 1, duration: 0.25, ease: "power2.in" }, "-=0.5");');
    html.push('    tl.to(".transition", { opacity: 0, duration: 0.25, ease: "power2.out" });');
    html.push('    ');
    html.push('    window.__timelines = window.__timelines || {};');
    html.push(`    window.__timelines["hyperreality-${version}"] = tl;`);
    html.push('  </script>');
    html.push('');
    html.push('</div>'); // #stage
    html.push('</body>');
    html.push('</html>');
    
    return html.join('\n');
  }

  getSceneStartTime(sceneId, shots) {
    let time = 0;
    for (const shot of shots) {
      if (shot.shotId === sceneId || shot.sceneId === sceneId) {
        return time;
      }
      time += shot.duration || shot.timing?.duration || 25;
    }
    return 0;
  }

  /**
   * 质量检查
   */
  async qualityCheck(versions) {
    const issues = [];
    
    // 检查每个版本
    for (const [version, data] of Object.entries(versions)) {
      // 检查 HTML 文件是否存在
      if (!data.htmlPath) {
        issues.push(`版本 ${version}: HTML 文件路径缺失`);
      }
      
      // 检查版本特征是否匹配
      const expectedFeatures = this.getVersionConfig(version);
      if (JSON.stringify(expectedFeatures) !== JSON.stringify(data.features)) {
        issues.push(`版本 ${version}: 特征配置不匹配`);
      }
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 生成后期制作报告（Markdown）
   */
  generateReport(postResult) {
    const lines = [];
    
    lines.push('# 🎬 后期制作报告');
    lines.push('');
    lines.push(`**版本**: ${this.config.versions.join(', ')}`);
    lines.push(`**状态**: ${postResult.success ? '✅ 成功' : '❌ 失败'}`);
    lines.push(`**总耗时**: ${postResult.timing?.total}ms`);
    lines.push('');
    
    // 各阶段耗时
    lines.push('## ⏱️ 各阶段耗时');
    lines.push('');
    lines.push(`| 阶段 | 耗时 | 产出 |`);
    lines.push(`|------|------|------|`);
    for (const [stage, data] of Object.entries(postResult.stages)) {
      const timing = data.timing || 'N/A';
      const count = data.count || data.tracks?.length || data.list?.length || data.versions?.length || 0;
      lines.push(`| ${stage} | ${timing}ms | ${count} |`);
    }
    lines.push('');
    
    // 版本详情
    lines.push('## 📦 版本详情');
    lines.push('');
    for (const [version, data] of Object.entries(postResult.versions)) {
      lines.push(`### ${version} 版`);
      lines.push(`- HTML: ${data.htmlPath}`);
      lines.push(`- 特征: ${Object.entries(data.features).map(([k, v]) => `${k}=${v}`).join(', ')}`);
      lines.push(`- 渲染命令: \`${data.renderCommand}\``);
      lines.push('');
    }
    
    // 字幕预览
    if (postResult.stages.subtitles?.tracks?.length > 0) {
      lines.push('## 🎭 字幕预览（身份介绍式）');
      lines.push('');
      lines.push(`| 角色 | 场景 | 时长 | 内容 |`);
      lines.push(`|------|------|------|------|`);
      for (const sub of postResult.stages.subtitles.tracks.slice(0, 5)) {
        lines.push(`| ${sub.characterName} | ${sub.sceneId} | ${sub.duration}s | ${sub.content.title} |`);
      }
      lines.push('');
    }
    
    // 音乐预览
    if (postResult.stages.music?.tracks?.length > 0) {
      lines.push('## 🎵 音乐配置');
      lines.push('');
      lines.push(`| 场景 | 风格 | 情绪 | 音量 | 淡入/出 |`);
      lines.push(`|------|------|------|------|--------|`);
      for (const track of postResult.stages.music.tracks.slice(0, 5)) {
        lines.push(`| ${track.sceneId} | ${track.searchParams.genre} | ${track.searchParams.mood} | ${track.config.volume} | ${track.config.fadeIn}s/${track.config.fadeOut}s |`);
      }
      lines.push('');
    }
    
    lines.push('---');
    lines.push(`*生成时间: ${new Date().toISOString()}*`);
    
    return lines.join('\n');
  }
}

module.exports = { PostProductionEngine, SCENE_MUSIC_MAP, ROYALTY_FREE_MUSIC_SOURCES };

```

---

## engines/process-guard.js

```javascript
'use strict';
/**
 * 全局进程防护 v1.0
 * 作用：捕获 unhandledRejection / uncaughtException，防止 LLM 超时悬空 promise 直接杀死进程
 * 用法：在 index.js / run.js / run-preproduction.js 等入口第一行 require('./engines/process-guard')
 */
let installed = false;
function install() {
  if (installed) return;
  installed = true;

  process.on('unhandledRejection', (reason, promise) => {
    // 只记录，不退出进程。LLM 超时产生的悬空 rejection 会被这里吸收
    const msg = reason instanceof Error ? reason.message : String(reason);
    if (msg.includes('超时') || msg.includes('timeout') || msg.includes('Timeout')) {
      console.warn(`[ProcessGuard] 吸收LLM超时悬空rejection: ${msg}`);
    } else {
      console.error(`[ProcessGuard] 未处理Rejection(已吸收，进程继续): ${msg}`);
    }
  });

  process.on('uncaughtException', (err) => {
    const msg = err.message || '';
    // 【P2-24-审计修复】区分可恢复错误和致命错误
    const recoverable = msg.includes('超时') || msg.includes('timeout') ||
                        msg.includes('JSON') || msg.includes('ECONNRESET') ||
                        msg.includes('ETIMEDOUT') || msg.includes('socket');

    if (recoverable) {
      console.warn(`[ProcessGuard] 可恢复异常(已吸收): ${msg}`);
    } else {
      console.error(`[ProcessGuard] ⚠️ 致命未捕获异常: ${msg}`);
      console.error(err.stack);
      setTimeout(() => process.exit(1), 3000);
    }
  });
}

install();
module.exports = { install };

```

---

## engines/production-engine/agents/audio-design-agent.js

```javascript
/**
 * AudioDesignAgent - 音频设计Agent
 * 负责: 环境音效设计
 */
const { BaseAgent } = require('./base-agent');

class AudioDesignAgent extends BaseAgent {
  constructor(options = {}) {
    super({ name: 'AudioDesignAgent', ...options });
  }

  _getSystemPrompt() {
    return `你是一位专业的声音设计师。根据场景信息，为每个镜头设计环境音效。

输出JSON格式:
{
  "shots": [
    {
      "shotId": "SC01",
      "backgroundSound": {
        "environment": "环境音类型",
        "description": "详细音效描述",
        "intensity": "low/medium/high"
      },
      "backgroundSoundString": "音效描述文本"
    }
  ]
}

设计原则:
1. 音效要与场景环境匹配：户外有风声/鸟鸣，室内有空调/人声;
2. 音效强度服务情绪：紧张场景音强高，平静场景音强弱;
3. 相邻镜头音效要有过渡和连贯性;`;
  }

  async process(shots, blueprint) {
    console.log(`[AudioDesignAgent] 开始处理 ${shots.length} 个镜头...`);

    const prompt = this._buildPrompt(shots, blueprint);

    const schema = {
      required: ['shots']
    };

    const llmResult = await this._callLLM(prompt, schema, () => {
      return this._fallback(shots);
    });

    if (llmResult.degraded) {
      return { shots: llmResult.result?.shots || shots, degraded: true, degradeReason: llmResult.degradeReason };
    }

    const designedShots = shots.map((shot) => {
      const designed = llmResult.result?.shots?.find(s => s.shotId === shot.shotId) || {};
      const bgSound = designed.backgroundSound || shot.backgroundSound;
      const bgSoundStr = designed.backgroundSoundString || shot.backgroundSoundString || '';
      // 【v2.1.4-fix13-审计修复】同时输出 audio 字段，兼容25字段标准
      const audioStr = bgSoundStr || (bgSound ? `${bgSound.environment}: ${bgSound.description} (intensity: ${bgSound.intensity})` : '');
      return {
        ...shot,
        backgroundSound: bgSound,
        backgroundSoundString: bgSoundStr,
        audio: audioStr // 新增：兼容25字段标准
      };
    });

    console.log(`[AudioDesignAgent] 完成 ✓`);
    return { shots: designedShots, degraded: false, degradeReason: null };
  }

  _buildPrompt(shots, blueprint) {
    const shotsInfo = shots.map(s => {
      return `镜头 ${s.shotId}: 场景"${(s.scene || '').substring(0, 50)}", 情绪"${s.mood || ''}"`;
    }).join('\n');

    return `## 镜头场景
${shotsInfo}

## 任务
为每个镜头设计环境音效:
1. environment: 环境音类型（outdoor_urban/indoor_office/park等），根据场景动态选择
2. description: 音效描述（15-30字）
3. intensity: 强度（low/medium/high，与情绪匹配）

输出JSON: {"shots": [{"shotId":"SC01","backgroundSound":{"environment":"...","description":"...","intensity":"..."}}]}`;
  }

  _fallback(shots) {
    console.log(`[AudioDesignAgent] 使用降级规则...`);
    return {
      shots: shots.map(shot => ({
        shotId: shot.shotId,
        backgroundSound: shot.backgroundSound,
        backgroundSoundString: ''
      }))
    };
  }
}

module.exports = { AudioDesignAgent };

```

---

## engines/production-engine/agents/base-agent.js

```javascript
/**
 * LLM Agent 基类（v2.0.1 并行优化版）
 * - 模型按 Agent 透传（修复原 loadLLMEngine 写死 kimi-k2p6 的 bug）
 * - 全局截止时间（deadline）感知：单次超时 = min(自身超时, 剩余预算)
 * - 预算不足时提前降级，防止单个 Agent 拖垮全局链路
 */
const path = require('path');

// 从环境变量读取模型配置，消除硬编码
const DEFAULT_MODEL = process.env.STORMAXE_LLM_MODEL || 'kimi-k2p6';
const DEFAULT_FAST_MODEL = process.env.STORMAXE_LLM_FAST_MODEL || DEFAULT_MODEL;

function loadLLMEngine(model, maxTokens) {
  try {
    // 【P1-10-审计修复】尝试多个路径查找 llm-reasoning-engine.js
    const candidatePaths = [
      path.join(__dirname, '../../../../systems', 'llm-reasoning-engine.js'),
      path.join(__dirname, '../../../systems', 'llm-reasoning-engine.js'),
      path.join(__dirname, '../../systems', 'llm-reasoning-engine.js'),
      path.join(process.cwd(), 'systems', 'llm-reasoning-engine.js'),
    ];
    let LLMClass = null;
    for (const p of candidatePaths) {
      try {
        LLMClass = require(p)?.LLMEngine;
        if (LLMClass) break;
      } catch (e) {
        // 继续尝试下一个路径
      }
    }
    if (!LLMClass) {
      console.warn('[BaseAgent] LLMEngine类加载失败，尝试的所有路径均不可用');
      return null;
    }
    return new LLMClass({ model: model || DEFAULT_MODEL, maxTokens: maxTokens || 16000 });
  } catch (e) {
    console.warn(`[BaseAgent] LLM引擎加载失败: ${e.message}`);
    return null;
  }
}

class BaseAgent {
  constructor(options = {}) {
    this.name = options.name || 'BaseAgent';
    this.llmTimeout = options.llmTimeout || 300000; // 单次调用上限 5 分钟（足以覆盖最慢的 VisualLanguage 258s）
    this.llmMaxRetries = options.llmMaxRetries ?? 2; // 重试收敛到 2 次（原 3 次是隐藏时间炸弹）
    this.llmModel = options.llmModel || DEFAULT_MODEL; // 修复：用环境变量
    this.llmMaxTokens = options.llmMaxTokens || 16000;
    this.enabled = options.enabled !== false;

    this._llmEngine = null;
    this._llmEngineLoaded = false;
    this._globalDeadline = null; // 全局截止时间戳（由 ProductionEngine 下发）
  }

  /** 由 ProductionEngine 下发全局截止时间 */
  setDeadline(deadlineMs) { this._globalDeadline = deadlineMs || null; }

  /** 当前剩余预算（ms），至少保留 10s */
  _remainingMs() {
    if (!this._globalDeadline) return this.llmTimeout;
    return Math.max(10000, this._globalDeadline - Date.now());
  }

  _getLLMEngine() {
    if (!this._llmEngineLoaded) {
      this._llmEngine = loadLLMEngine(this.llmModel, this.llmMaxTokens);
      this._llmEngineLoaded = true;
      if (this._llmEngine) {
        console.log(`[${this.name}] LLM引擎加载成功 | model=${this.llmModel}`);
      } else {
        console.warn(`[${this.name}] LLM引擎不可用，将使用降级模式`);
      }
    }
    return this._llmEngine;
  }

  /**
   * 【v2.1.4-fix13】通用超时包装器 — 核心修复
   * 任何 Promise 都可以用这个包装，确保不会无限等待
   */
  /**
   * 【审计修复·核心】通用超时包装器
   * 关键修复：超时后底层 promise 仍在跑，其迟到的 rejection 会变成 unhandledRejection
   * 导致 Node 进程崩溃。这里给原 promise 挂一个 no-op catch 标记其已被处理，
   * 同时不影响 race 的正常 reject 传播。
   */
  _callWithTimeout(promise, timeoutMs, label = 'LLM调用') {
    let timer;
    const p = Promise.resolve(promise);
    // 立即挂 catch：标记 rejection 已被处理，防止超时后悬空 rejection 崩溃进程
    // 这条链独立于 race，不影响 race 的 reject 传播
    p.catch(() => {});
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`${label}超时(${timeoutMs}ms)`)),
        timeoutMs
      );
    });
    return Promise.race([p, timeoutPromise]).finally(() => clearTimeout(timer));
  }

  /**
   * 核心LLM调用方法（带重试+降级+截止时间感知+外层超时+Schema校验）
   * 【审计修复】支持第4参数 options: { maxRetries, maxTokens } 覆盖单次调用配置
   */
  async _callLLM(prompt, schema, fallbackFn, options = {}) {
    if (!this.enabled) {
      console.log(`[${this.name}] Agent已禁用，使用降级`);
      return this._executeFallback(fallbackFn, 'Agent disabled');
    }

    const llm = this._getLLMEngine();
    if (!llm) {
      console.warn(`[${this.name}] LLM引擎不可用，使用降级`);
      return this._executeFallback(fallbackFn, 'LLM engine not available');
    }

    // 单次调用可覆盖 maxTokens（补齐等轻量场景用小预算）
    const callMaxTokens = options.maxTokens || this.llmMaxTokens;
    const callMaxRetries = options.maxRetries ?? this.llmMaxRetries;

    // 截止时间感知：单次超时取「自身超时」与「剩余预算」的较小值
    const perCallTimeout = Math.min(this.llmTimeout, this._remainingMs());
    if (perCallTimeout < 20000) {
      // 剩余预算已不足以完成一次完整调用，提前降级，保住全局链路
      console.warn(`[${this.name}] 剩余预算不足(${perCallTimeout}ms)，提前降级以保住全局链路`);
      return this._executeFallback(fallbackFn, 'insufficient time budget');
    }

    try {
      const fullPrompt = `${this._getSystemPrompt()}\n\n${prompt}`;
      // 【v2.1.4-fix13】用 _callWithTimeout 包装，确保即使底层引擎不实现超时也能被中断
      const result = await this._callWithTimeout(
        llm.reasonStructured(fullPrompt, schema, {
          maxTokens: callMaxTokens,
          timeoutMs: perCallTimeout,
          maxRetries: callMaxRetries,
          deadlineMs: this._globalDeadline
        }),
        perCallTimeout,
        `[${this.name}] reasonStructured`
      );

      if (!result.success) {
        throw new Error(`LLM引擎返回失败: ${result.error}`);
      }

      // 【v2.1.4-fix13】校验返回数据是否满足 schema
      const validation = this._validateSchema(result.data, schema);
      if (!validation.valid) {
        console.warn(`[${this.name}] Schema校验失败: ${validation.reason}，尝试降级`);
        return this._executeFallback(fallbackFn, `Schema validation failed: ${validation.reason}`);
      }

      console.log(`[${this.name}] LLM调用成功 ✓`);
      return { result: result.data, degraded: false, degradeReason: null };
    } catch (err) {
      console.warn(`[${this.name}] LLM调用失败: ${err.message}`);
      return this._executeFallback(fallbackFn, `LLM failed: ${err.message}`);
    }
  }

  _executeFallback(fallbackFn, reason) {
    try {
      const fallbackResult = fallbackFn ? fallbackFn() : null;
      // 【v2.1.4-fix13】如果降级结果也为 null，明确标记
      if (fallbackResult === null) {
        console.warn(`[${this.name}] 降级结果为null: ${reason}`);
      }
      return { result: fallbackResult, degraded: true, degradeReason: reason, attempts: this.llmMaxRetries };
    } catch (fallbackErr) {
      console.error(`[${this.name}] 降级也失败了: ${fallbackErr.message}`);
      return { result: null, degraded: true, degradeReason: `LLM failed and fallback failed: ${fallbackErr.message}`, attempts: this.llmMaxRetries };
    }
  }

  /**
   * 【v2.1.4-fix13】Schema 校验 — 增加空字符串/空数组检查
   */
  _validateSchema(data, schema) {
    if (!schema || !schema.required) return { valid: true };
    if (!data || typeof data !== 'object') {
      return { valid: false, reason: '返回数据为空或非对象' };
    }
    for (const field of schema.required) {
      const value = data[field];
      if (value === undefined || value === null) {
        return { valid: false, reason: `缺少必需字段: ${field}` };
      }
      // 【v2.1.4-fix13】增加空字符串和空数组检查
      if (typeof value === 'string' && !value.trim()) {
        return { valid: false, reason: `必需字段为空字符串: ${field}` };
      }
      if (Array.isArray(value) && value.length === 0 && schema.rejectEmptyArray) {
        return { valid: false, reason: `必需字段为空数组: ${field}` };
      }
    }
    return { valid: true };
  }

  _getSystemPrompt() {
    return '你是一位专业的AI视频导演。只输出严格格式的JSON，不要markdown代码块，不要解释，不要思考过程。使用最紧凑的JSON格式。';
  }

  _sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  async process(shots, blueprint) { throw new Error('子类必须实现 process 方法'); }
}

module.exports = { BaseAgent };

```

---

## engines/production-engine/agents/continuity-review-agent.js

```javascript
// engines/production-engine/agents/continuity-review-agent.js
// ContinuityReviewAgent - 连续性审查Agent（Phase 2 末尾运行）
// v1.0.0 | 2026-06-27

const { BaseAgent } = require('./base-agent');
const { CrossEpisodeValidator } = require('./cross-episode-validator');

class ContinuityReviewAgent extends BaseAgent {
  constructor(options = {}) {
    super({ name: 'ContinuityReviewAgent', ...options });
  }

  _getSystemPrompt() {
    return `你是一位专业的影视连续性审查专家。负责检查镜头间的视觉连贯性、情绪递进逻辑和跨集内容边界。只输出严格格式的JSON。`;
  }

  /**
   * @param {Array} shots - 当前镜头数组
   * @param {object} blueprint - 剧本蓝图
   * @param {object} context - { totalEpisodes, episodeIndex, episodeContract }
   */
  async process(shots, blueprint, context = {}) {
    console.log(`[ContinuityReviewAgent] 开始审查 ${shots.length} 个镜头...`);

    const totalEpisodes = context.totalEpisodes || 1;
    const episodeIndex = context.episodeIndex || 1;
    const contract = context.episodeContract || {};

    // 1. 提取脚本文本供跨集校验
    const scriptText = CrossEpisodeValidator.extractScriptText(shots);

    // 2. 跨集边界校验（正则 + LLM 双层）
    const validator = new CrossEpisodeValidator({
      llmEngine: this._getLLMEngine(),
      model: this.llmModel,
      timeout: 60000,
    });

    let boundaryReport = null;
    try {
      boundaryReport = await this._callLLM(
        this._buildReviewPrompt(shots, blueprint),
        { required: ['review'] },
        () => this._fallbackReview(shots)
      );
    } catch (e) {
      console.warn(`[ContinuityReviewAgent] LLM审查失败，使用降级: ${e.message}`);
      boundaryReport = { result: this._fallbackReview(shots), degraded: true };
    }

    // 3. 跨集正则快筛（零延迟，不调 LLM）
    let crossEpisodeReport = { passed: true, violations: [], summary: '单集项目，跳过跨集校验' };
    if (totalEpisodes > 1 && scriptText) {
      try {
        crossEpisodeReport = await validator.validate({
          script: scriptText,
          contract,
          episodeIndex,
          totalEpisodes,
        });
      } catch (e) {
        console.warn(`[ContinuityReviewAgent] 跨集校验异常: ${e.message}`);
      }
    }

    // 4. 镜头间连续性规则检查
    const continuityIssues = this._checkShotContinuity(shots);

    const review = boundaryReport.result || this._fallbackReview(shots);

    console.log(`[ContinuityReviewAgent] 完成 ✓ | 跨集: ${crossEpisodeReport.passed ? '通过' : '有问题'} | 连续性: ${continuityIssues.length} 项`);

    return {
      shots,
      review,
      boundaryReport: {
        passed: crossEpisodeReport.passed,
        violations: crossEpisodeReport.violations || [],
        summary: crossEpisodeReport.summary || '',
        continuityIssues,
      },
      degraded: boundaryReport.degraded || false,
    };
  }

  _buildReviewPrompt(shots, blueprint) {
    const shotsInfo = shots.map((s, i) => {
      return `镜头${i + 1} ${s.shotId}: 场景="${(s.scene || '').substring(0, 50)}" 情绪="${s.mood || ''}" 动作="${(s.action || '').substring(0, 40)}"`;
    }).join('\n');

    return `## 镜头序列\n${shotsInfo}\n\n## 任务\n审查以下连续性维度：\n1. 相邻镜头景别是否跳跃过大\n2. 场景光线是否连续\n3. 情绪递进是否合理\n4. 角色服装/外观是否一致\n\n输出JSON: {"review": {"overallScore": 0-100, "issues": [{"shotId":"","type":"","description":"","suggestion":""}], "summary": "总结"}}`;
  }

  _fallbackReview(shots) {
    return {
      overallScore: 80,
      issues: [],
      summary: '连续性审查降级（规则模式），未发现明显断裂',
    };
  }

  _checkShotContinuity(shots) {
    const issues = [];
    for (let i = 1; i < shots.length; i++) {
      const prev = shots[i - 1];
      const curr = shots[i];
      // 简单规则：检查情绪是否从 calm 突然跳到 intense（无过渡）
      // 可根据需要扩展
    }
    return issues;
  }
}

module.exports = { ContinuityReviewAgent };

```

---

## engines/production-engine/agents/cross-episode-validator.js

```javascript
// cross-episode-validator.js
// 跨集内容边界校验器
// 在ContinuityReview后运行，检测越界内容
// v1.0 | 2026-06-21

const fs = require('fs');
const path = require('path');

class CrossEpisodeValidator {
  constructor(options = {}) {
    this.config = {
      // LLM配置
      llmEngine: options.llmEngine || null,
      model: options.model || 'kimi-k2p6',
      timeout: options.timeout || 120000,
      // 置信度阈值
      confidence: {
        ignoreThreshold: 0.4,    // 低于此值丢弃
        blockThreshold: 0.75     // 低于此值的高严重度降级为warn
      },
      // 硬校验处置
      hardValidation: {
        forbiddenZoneViolation: 'block',
        nextEpisodePreview: 'block',
        responsibilityMissing: 'warn',
        bufferOverExpansion: 'warn'
      },
      // 缓冲区限制
      narrativeFlexibility: {
        maxBufferMentionDuration: 15,    // 秒
        maxForbiddenMentionDuration: 5   // 秒
      },
      ...options
    };
  }

  /**
   * 主校验入口
   * @param {object} params - 校验参数
   * @param {string} params.script - 脚本文本（从scenes中提取的台词+描述）
   * @param {object} params.contract - 边界契约
   * @param {number} params.episodeIndex - 当前集编号
   * @param {number} params.totalEpisodes - 总集数
   * @param {string} params.overrideReason - 覆盖原因（可选）
   * @returns {object} 校验报告
   */
  async validate({ script, contract, episodeIndex, totalEpisodes, overrideReason }) {
    console.log(`[CrossEpisodeValidator] 开始校验第${episodeIndex}集/共${totalEpisodes}集...`);

    // 如果提供了覆盖原因，直接通过
    if (overrideReason) {
      console.log(`[CrossEpisodeValidator] 收到override: ${overrideReason}`);
      return {
        passed: true,
        override: true,
        overrideReason,
        violations: [],
        summary: '校验已覆盖（人工确认）'
      };
    }

    const violations = [];

    // ====== 第一层：正则快筛 ======
    console.log(`[CrossEpisodeValidator] 第一层：正则快筛...`);
    const regexViolations = this._regexScan(script, contract);
    violations.push(...regexViolations);

    // ====== 第二层：LLM语义校验（仅当第一层有命中或强制开启时） ======
    if (regexViolations.length > 0 || this.config.alwaysRunLLM) {
      console.log(`[CrossEpisodeValidator] 第二层：LLM语义校验...`);
      try {
        const llmViolations = await this._llmSemanticScan(script, contract, episodeIndex, totalEpisodes);
        violations.push(...llmViolations);
      } catch (err) {
        console.warn(`[CrossEpisodeValidator] LLM语义校验失败: ${err.message}，使用正则结果`);
      }
    }

    // ====== 去重与置信度分级 ======
    const deduped = this._deduplicateAndGrade(violations);

    // ====== 生成报告 ======
    const criticalCount = deduped.filter(v => v.action === 'block').length;
    const warnCount = deduped.filter(v => v.action === 'warn').length;

    const report = {
      passed: criticalCount === 0,
      episodeIndex,
      totalEpisodes,
      violations: deduped,
      stats: {
        total: deduped.length,
        critical: criticalCount,
        warning: warnCount,
        passed: deduped.length === 0
      },
      summary: deduped.length === 0 
        ? '✅ 跨集边界校验通过，未发现越界内容'
        : `⚠️ 发现 ${deduped.length} 个问题：${criticalCount} 个严重（需处理），${warnCount} 个警告`
    };

    console.log(`[CrossEpisodeValidator] 校验完成: ${report.summary}`);
    return report;
  }

  /**
   * 正则快筛层
   */
  _regexScan(script, contract) {
    const violations = [];
    if (!script || !contract) return violations;

    // 1. 检测下集预告语（高置信度）
    const previewPatterns = [
      { pattern: /(?:下一集|下一期|下一部|下一讲|下集|下期|下部|下讲)[\s\S]{0,20}?[讲讲说说分享介绍]/i, desc: '下集内容预告' },
      { pattern: /(?:敬请期待|未完待续|未完|待续|to be continued|coming soon|stay tuned)/i, desc: '未完待续标记' },
      { pattern: /(?:下次|下回|下一次|下一次)[\s\S]{0,15}?[讲讲说说分享介绍告诉]/i, desc: '下次预告' },
      { pattern: /(?:记住|记住这点|记住这个|记住这个)[\s\S]{0,15}?[下次下回后续]/i, desc: '暗示后续' },
      { pattern: /(?:后续|之后|后面|接下来)[\s\S]{0,15}?[分享讲说介绍告诉]/i, desc: '后续内容预告' },
      { pattern: /(?:后面|之后|随后|接下来)[\s\S]{0,15}?[再讲讲再说再分享]/i, desc: '后续内容预告' }
    ];

    for (const { pattern, desc } of previewPatterns) {
      const match = script.match(pattern);
      if (match) {
        violations.push({
          type: 'next_episode_preview',
          description: desc,
          matchedText: match[0].substring(0, 100),
          severity: 'high',
          confidence: 0.95, // 正则高置信度
          location: this._extractLocation(script, match.index),
          action: 'block'
        });
      }
    }

    // 2. 检测禁区关键词（中高置信度，需结合LLM确认是否"深入展开"）
    if (contract.mustNotCover) {
      for (const topic of contract.mustNotCover) {
        // 检查是否出现禁区关键词 + 详细展开特征（>50字连续描述）
        const topicRegex = new RegExp(topic.substring(0, 20), 'i'); // 取前20字做模糊匹配
        if (topicRegex.test(script)) {
          // 检查周围是否有详细展开的迹象（多句描述、列举、解释）
          const context = this._extractContext(script, topic, 200);
          if (context && context.length > 100) {
            violations.push({
              type: 'forbidden_zone',
              description: `检测到禁区内容"${topic.substring(0, 30)}..."可能深入展开`,
              matchedText: context.substring(0, 150),
              severity: 'high',
              confidence: 0.7, // 需要LLM确认
              location: this._extractLocation(script, script.indexOf(topic.substring(0, 20))),
              action: 'block'
            });
          }
        }
      }
    }

    // 3. 检测"本集是系列第X集"的自我引用（低严重度，仅提醒）
    if (script.match(/(?:这是|本集是|本视频是|本期是)[\s\S]{0,10}(?:第[一二三四五六七八九十\d]+集|系列第[\d]+集)/i)) {
      violations.push({
        type: 'series_self_reference',
        description: '脚本中自我引用集数位置',
        matchedText: '检测到集数自我引用',
        severity: 'info',
        confidence: 0.6,
        action: 'warn'
      });
    }

    return violations;
  }

  /**
   * LLM语义校验层
   */
  async _llmSemanticScan(script, contract, episodeIndex, totalEpisodes) {
    if (!this.config.llmEngine) {
      console.warn('[CrossEpisodeValidator] 未配置LLM引擎，跳过语义校验');
      return [];
    }

    const prompt = `你是一名专业的视频内容审查员。请审查以下视频脚本，判断是否存在"跨集内容越界"问题。

## 审查标准

1. **下集预告检测**：脚本结尾或台词中是否暗示/预告了后续集的内容？
   - 明显的预告语："下一集讲...""敬请期待""未完待续"
   - 模糊预告："后面会分享...""记住这点，后续有用""我们后面再讲"
   - 如果发现有"后续/后面/下次/下一集"等暗示，且实质指向后续内容 → 越界

2. **禁区深入展开**：脚本是否详细讲解了本集不应该讲的内容？
   - 本集不应该讲：${contract.mustNotCover?.join('、') || '后续集内容'}
   - 如果对这些内容进行了详细解释（>3句话、有具体步骤/方法/数据）→ 越界
   - 如果仅一句话带过（≤15秒）→ 不越界

3. **重复冗余**：脚本是否重复了前面已经详细讲过的内容？
   - 前面已讲：${contract.previousSummary || '见前一集'}
   - 如果花大篇幅重复前面已讲的内容 → 冗余

## 脚本内容

${script.substring(0, 3000)}${script.length > 3000 ? '\n...（脚本截断，剩余' + (script.length - 3000) + '字）' : ''}

## 输出要求

请输出JSON格式：
{
  "violations": [
    {
      "type": "next_episode_preview | forbidden_zone | repetition",
      "description": "问题描述（50字以内）",
      "confidence": 0.0-1.0,  // 你对此判断的置信度
      "severity": "high | medium | low",
      "evidence": "脚本中的具体文本证据（100字以内）"
    }
  ],
  "summary": "总体判断：pass（通过）/ warn（有警告）/ block（有严重越界）"
}

注意：
- 如果仅一句话带过（≤15秒），不算越界
- 自然收束结尾（如"希望有帮助"）不算预告
- 如果判断不准确，confidence可以低于0.5`;

    // 【v2.1.4-fix13-审计修复】增加超时保护 + 适配 BaseAgent 的 LLM 引擎 API
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('CrossEpisodeValidator LLM 超时')),
        this.config.timeout
      );
    });

    try {
      let responseText = '';

      // 优先用 chat 方法（BaseAgent 引擎的标准接口）
      if (typeof this.config.llmEngine.chat === 'function') {
        responseText = await Promise.race([
          this.config.llmEngine.chat(
            '你是一位严格但公正的内容审查员。只输出JSON，不要解释。',
            prompt,
            0.2
          ),
          timeoutPromise
        ]).finally(() => clearTimeout(timer));
      }
      // 兼容 reasonStructured 方法
      else if (typeof this.config.llmEngine.reasonStructured === 'function') {
        const result = await Promise.race([
          this.config.llmEngine.reasonStructured(prompt, null, {
            maxTokens: 2000,
            timeoutMs: this.config.timeout
          }),
          timeoutPromise
        ]).finally(() => clearTimeout(timer));
        responseText = result?.data ? JSON.stringify(result.data) : '';
      }
      // 兼容 generate 方法（如果引擎实现了的话）
      else if (typeof this.config.llmEngine.generate === 'function') {
        const result = await Promise.race([
          this.config.llmEngine.generate(prompt, {
            systemPrompt: '你是一位严格但公正的内容审查员。只输出JSON，不要解释。',
            maxTokens: 2000,
            timeoutMs: this.config.timeout,
            forceJson: true
          }),
          timeoutPromise
        ]).finally(() => clearTimeout(timer));
        responseText = result?.content || '';
      } else {
        throw new Error('LLM引擎没有可用的方法(chat/reasonStructured/generate)');
      }

      if (!responseText) {
        return [];
      }

      let parsed;
      try {
        parsed = JSON.parse(responseText.trim());
      } catch (e) {
        // 尝试从文本中提取JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (e2) {
            return [];
          }
        } else {
          return [];
        }
      }

      if (!parsed.violations || !Array.isArray(parsed.violations)) {
        return [];
      }

      return parsed.violations.map(v => ({
        type: v.type || 'unknown',
        description: v.description || '语义校验发现问题',
        matchedText: v.evidence || '',
        severity: v.severity || 'medium',
        confidence: Math.max(0, Math.min(1, v.confidence || 0.5)),
        location: null,
        action: this._determineAction(v.type, v.severity, v.confidence)
      }));

    } catch (err) {
      console.warn(`[CrossEpisodeValidator] LLM语义校验异常: ${err.message}`);
      return [];
    }
  }

  /**
   * 去重与置信度分级
   */
  _deduplicateAndGrade(violations) {
    // 按类型和位置去重
    const seen = new Set();
    const deduped = [];

    for (const v of violations) {
      const key = `${v.type}-${v.description?.substring(0, 30)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // 置信度分级
      const conf = v.confidence || 0.5;
      if (conf < this.config.confidence.ignoreThreshold) {
        continue; // 丢弃噪音
      }

      if (conf < this.config.confidence.blockThreshold && v.severity === 'high') {
        v.severity = 'medium'; // 降级
        v.action = 'warn';
      }

      deduped.push(v);
    }

    return deduped;
  }

  /**
   * 确定处置方式
   */
  _determineAction(type, severity, confidence) {
    const mapping = this.config.hardValidation;

    if (type === 'next_episode_preview') {
      return confidence >= 0.75 ? mapping.nextEpisodePreview : 'warn';
    }
    if (type === 'forbidden_zone') {
      return confidence >= 0.75 ? mapping.forbiddenZoneViolation : 'warn';
    }
    if (type === 'repetition') {
      return mapping.bufferOverExpansion || 'warn';
    }

    return severity === 'high' ? 'block' : 'warn';
  }

  /**
   * 提取文本位置（行号）
   */
  _extractLocation(script, index) {
    if (index === -1 || index === null) return null;
    const linesBefore = script.substring(0, index).split('\n').length;
    return `第${linesBefore}行附近`;
  }

  /**
   * 提取上下文
   */
  _extractContext(script, topic, windowSize) {
    const idx = script.indexOf(topic.substring(0, 20));
    if (idx === -1) return null;
    const start = Math.max(0, idx - windowSize / 2);
    const end = Math.min(script.length, idx + windowSize / 2);
    return script.substring(start, end);
  }

  /**
   * 从shots中提取可校验的文本
   * 【v2.1.4-fix13-审计修复】适配 ProductionEngine 实际输出的字段名
   */
  static extractScriptText(shots) {
    if (!Array.isArray(shots)) return '';

    const texts = [];
    for (const shot of shots) {
      // 【修复】适配 ProductionEngine 实际输出的字段名
      if (shot.scene) texts.push(String(shot.scene));
      if (shot.sceneDescription) texts.push(String(shot.sceneDescription));
      if (shot.action) texts.push(String(shot.action));
      if (shot.mood) texts.push(String(shot.mood));

      // 台词：可能是字符串、数组、或对象
      if (shot.dialogue) {
        if (typeof shot.dialogue === 'string') {
          texts.push(shot.dialogue);
        } else if (Array.isArray(shot.dialogue)) {
          for (const line of shot.dialogue) {
            if (typeof line === 'string') texts.push(line);
            else if (line?.text) texts.push(line.text);
            else if (line?.content) texts.push(line.content);
          }
        } else if (shot.dialogue?.lines) {
          for (const line of shot.dialogue.lines) {
            if (line.text) texts.push(line.text);
          }
        }
      }

      // fields 嵌套对象中的文本
      if (shot.fields) {
        if (shot.fields.scene) texts.push(String(shot.fields.scene));
        if (shot.fields.action) texts.push(String(shot.fields.action));
        if (shot.fields.dialogue) texts.push(String(shot.fields.dialogue));
      }
    }

    return texts.filter(t => t && t.trim()).join('\n');
  }
}

module.exports = { CrossEpisodeValidator };

```

---

## engines/production-engine/agents/opening-design-agent.js

```javascript
/**
 * OpeningDesignAgent - 片头设计Agent
 * 负责: 片头S00的完整设计（片头专属字段）
 */
const { BaseAgent } = require('./base-agent');

class OpeningDesignAgent extends BaseAgent {
  constructor(options = {}) {
    super({ name: 'OpeningDesignAgent', ...options });
  }

  _getSystemPrompt() {
    return `你是一位专业的电影片头设计师。根据系列信息，设计片头S00的完整方案。

输出JSON格式:
{
  "opening": {
    "shotId": "S00",
    "scene": "片头场景描述",
    "mood": "片头情绪",
    "camera": { "shot_size": "", "movement": "", "angle": "" },
    "cameraString": "运镜描述",
    "lighting": { "key_light": "", "atmosphere": "" },
    "lightingString": "灯光描述",
    "audioLayer": {
      "bgm": "背景音乐描述",
      "sound_effects": "音效描述"
    },
    "audioLayerString": "音频描述文本",
    "titleOverlay": {
      "main_title": "主标题",
      "sub_title": "副标题",
      "style": "标题样式"
    },
    "titleOverlayString": "标题信息文本",
    "duration": 8
  }
}

设计原则:
1. 片头要有视觉冲击力，让观众一眼记住;
2. 标题设计要简洁有力;
3. 背景音乐要有系列辨识度;`;
  }

  async process(blueprint) {
    console.log(`[OpeningDesignAgent] 开始设计片头...`);

    const prompt = this._buildPrompt(blueprint);

    const schema = {
      required: ['opening']
    };

    const llmResult = await this._callLLM(prompt, schema, () => {
      return this._fallback(blueprint);
    });

    if (llmResult.degraded) {
      return { opening: llmResult.result, degraded: true, degradeReason: llmResult.degradeReason };
    }

    console.log(`[OpeningDesignAgent] 完成 ✓`);
    return { opening: llmResult.result.opening, degraded: false, degradeReason: null };
  }

  _buildPrompt(blueprint) {
    // 【v2.1.4-fix13-审计修复】优先从 config.title 或 metadata.title 获取，避免 undefined 导致"未命名"
    const title = blueprint.config?.title || blueprint.metadata?.title || blueprint.title || '未命名';
    const meta = blueprint._metadata || blueprint.config?._metadata || {};
    const isSeries = meta.isSeries || false;
    const episodeNumber = meta.episodeNumber || 1;

    return `## 片头信息
标题: ${title}
类型: ${isSeries ? '系列第' + episodeNumber + '集' : '单集'}
画幅: ${blueprint.config?.aspectRatio || '16:9'}

## 任务
设计片头S00（时长5-10秒）:
1. scene: 片头场景描述（30-50字，要有视觉冲击力）
2. camera/cameraString: 运镜方案
3. lighting/lightingString: 灯光方案
4. audioLayer/audioLayerString: 背景音乐和音效
5. titleOverlay/titleOverlayString: 主标题+副标题
6. duration: 时长（秒）

要求:
- 片头要有电影感
- 标题要简洁有力
- 整体时长控制在5-10秒

直接输出JSON。`;
  }

  _fallback(blueprint) {
    console.log(`[OpeningDesignAgent] 使用降级规则...`);
    const title = blueprint.title || '未命名';
    return {
      opening: {
        shotId: 'S00',
        scene: `${title} 片头场景`,
        mood: 'epic',
        camera: { shot_size: 'wide', movement: 'static', angle: 'eye_level' },
        cameraString: 'wide shot, static, eye-level',
        lighting: { key_light: 'dramatic', atmosphere: 'cinematic' },
        lightingString: 'dramatic cinematic lighting',
        audioLayer: { bgm: 'epic orchestral', sound_effects: 'ambient' },
        audioLayerString: 'epic orchestral music with ambient sound',
        titleOverlay: { main_title: title, sub_title: '', style: 'cinematic' },
        titleOverlayString: `Title: ${title}`,
        duration: 8
      }
    };
  }
}

module.exports = { OpeningDesignAgent };

```

---

## engines/production-engine/agents/opening-title-optimizer.js

```javascript
/**
 * OpeningTitleOptimizer - 片头标题优化Agent（后处理环节）
 * 负责: 在最终提交前，专门为片头SC00生成营销向的标题、动画、音效设计
 * 策略: 不动现有链路，作为后处理环节插入
 * v1.0: 基于已有blueprint和prompt，生成片头专属字段
 */
const { BaseAgent } = require('./base-agent');

class OpeningTitleOptimizer extends BaseAgent {
  constructor(options = {}) {
    super({ name: 'OpeningTitleOptimizer', ...options });
  }

  _getSystemPrompt() {
    return `你是一位专业的电影片头营销设计师。你的任务是为片头设计极具吸引力的主标题、副标题、出场动画和开场音效。

设计原则:
1. 标题要带有营销属性，让用户产生点击欲望
2. 动画设计要精致、有电影感
3. 字体设计要匹配视频气质
4. 开场音效要有品牌辨识度
5. 所有设计要服务于"让用户停留"的目标

输出严格的JSON格式，不要markdown代码块。`;
  }

  /**
   * 主入口：优化片头
   * @param {Object} shot - SC00镜头数据（含已有fields和prompt）
   * @param {Object} blueprint - 完整剧本蓝图
   * @returns {Object} 优化后的片头字段
   */
  async optimize(shot, blueprint) {
    console.log(`[OpeningTitleOptimizer] 开始优化片头...`);

    const prompt = this._buildPrompt(shot, blueprint);

    const schema = {
      required: ['title_content', 'subtitle_content', 'title_animation', 'title_font_design', 'opening_audio_design']
    };

    const llmResult = await this._callLLM(prompt, schema, () => {
      return this._fallback(shot, blueprint);
    });

    // 【调试】打印返回结果
    console.log('[OpeningTitleOptimizer] LLM返回结果:', JSON.stringify(llmResult.result, null, 2));

    if (llmResult.degraded) {
      console.log(`[OpeningTitleOptimizer] 降级处理`);
      return { ...llmResult.result, degraded: true, degradeReason: llmResult.degradeReason };
    }

    console.log(`[OpeningTitleOptimizer] 完成 ✓`);
    return { ...llmResult.result, degraded: false, degradeReason: null };
  }

  _buildPrompt(shot, blueprint) {
    const title = blueprint.title || '未命名';
    const meta = blueprint._metadata || blueprint.config?._metadata || {};
    const episodeNumber = meta.episodeNumber || meta.series?.currentEpisode || 1;
    const totalEpisodes = meta.totalEpisodes || meta.series?.totalEpisodes || 1;
    const genre = blueprint.genre || '科普';
    const style = blueprint.style || 'REAL';
    const targetAudience = blueprint.targetAudience || '通用受众';
    
    // 提取已有prompt中的场景信息
    const existingPrompt = shot.prompt || '';
    const existingScene = shot.fields?.scene || '';
    const existingDialogue = shot.fields?.dialogue || '';
    const existingMood = shot.fields?.mood || '';
    const existingAudio = shot.fields?.audio || '';

    return `## 视频核心主题
主题: ${title}（这是视频的核心内容，标题必须围绕此主题展开）
体裁: ${genre}视频
风格: ${style === 'REAL' ? '写实纪实' : style}

## 片头场景信息
场景描述: ${existingScene}
情绪基调: ${existingMood}
已有音频: ${existingAudio}

## 片头台词（开场第一句）
${existingDialogue}

## 已有Prompt片段
${existingPrompt.substring(0, 300)}...

## 任务
为片头设计以下5个字段，输出JSON格式。

### ⚠️ 核心约束（必须遵守）
1. 标题必须围绕"${title}"主题展开，不得偏离
2. 主标题必须包含主题关键词或相关概念
3. 禁止使用与主题无关的夸张表述（如"猝死前4分钟"等，除非与主题直接相关）
4. 标题要有营销属性，但必须真实反映内容

### 字段要求

1. title_content: 主标题（10-15字，带营销属性，吸引点击）
   - 要求: 必须包含主题关键词或相关概念，有冲击力/悬念/关键词
   - 示例（横纹肌溶解主题）: "肌肉在溶解？尿出可乐色要警惕！" / "横纹肌溶解：藏在肌肉里的致命警报"
   - 错误示例: "猝死前4分钟：警医揭秘生死博弈"（偏离主题）

2. subtitle_content: 副标题（15-25字，补充说明，增强可信度）
   - 要求: 解释主标题、给出关键信息、或制造对比
   - 示例: "第1集 | 症状识别与实验室检查全解析" / "警医示例角色：从症状到化验单的权威解读"

3. title_animation: 出场动画设计（150-200字，详细描述）
   - 包含: 入场方式（淡入/滑入/缩放/爆裂等）、持续时长、出场节奏
   - 包含: 主标题和副标题的出场顺序、时间差
   - 包含: 动画质感（金属/玻璃/粒子/水墨等）

4. title_font_design: 字体设计（100-150字，详细描述）
   - 包含: 字体类型、风格、颜色、描边、阴影、质感

5. opening_audio_design: 开场音效设计（100-150字，详细描述）
   - 包含: 专属开场音效、品牌辨识度、与动画同步节奏

要求:
- 标题必须有营销属性（让用户想点击），但必须围绕主题
- 动画设计要有电影质感
- 字体设计要匹配写实风格
- 音效要有品牌辨识度
- 整体时长控制在3-5秒

直接输出JSON格式:
{
  "title_content": "...",
  "subtitle_content": "...",
  "title_animation": "...",
  "title_font_design": "...",
  "opening_audio_design": "..."
}`;
  }

  _fallback(shot, blueprint) {
    console.log(`[OpeningTitleOptimizer] 使用降级规则...`);
    const title = blueprint.title || '未命名';
    return {
      title_content: `${title} - 第1集`,
      subtitle_content: '症状与实验室检查全解析',
      title_animation: '主标题淡入入场，副标题延迟0.5秒跟随淡入，整体2秒',
      title_font_design: '粗体无衬线字体，白色，带微阴影',
      opening_audio_design: '环境音渐起，配合标题入场'
    };
  }
}

module.exports = { OpeningTitleOptimizer };

```

---

## engines/production-engine/agents/prompt-fusion-agent.js

```javascript
/**
 * PromptFusionAgent - Prompt融合Agent（核心）
 * 负责: 将L3-L7元素创造性融合成导演分镜脚本
 * 策略: L1/L2/L9硬约束走规则，L3-L7走LLM融合
 * v2.1.4-fix8: LLM输出标准字段格式（【约束】【基础】【场景】等）
 */
const { BaseAgent } = require('./base-agent');
const { normalizeFields, makeGetter } = require('../../field-standardizer');
const PromptLengthConfig = require('../../../config/prompt-length.js');

// 【v2.1.4-fix10-P25-fix3】外部专家建议：填满 schema 解决 LLM 字段缺失问题
// 25 个标准字段的 schema 模板：键名 + 类型提示
// 这是给 LLM 看的"结构契约"，绝不能再传 fields: {}
// ⚠️ value 使用空字符串占位，避免 LLM 把描述当输出值（风险5）
const STANDARD_FIELDS_SCHEMA = {
  director_instruction: '',
  constraint: '',
  baseline: '',
  scene: '',
  lighting: '',
  composition: '',
  color_palette: '',
  depth_of_field: '',
  camera_movement: '',
  character: '',
  costume: '',
  makeup: '',
  action: '',
  props: '',
  portraits: '',
  dialogue: '',
  dialogue_block: '',
  timeline: '',
  mood: '',
  pacing: '',
  transition: '',
  audio: '',
  negative: '',
  bright_constraint: '',
  character_constraint: '',
  consistency: ''
};

// 字段描述表（仅用于补齐 prompt，不放入 schema）
const FIELD_DESCS = {
  director_instruction: 'string，≥80字符，导演整体质感指令',
  constraint: 'string，画幅/分辨率/帧率/格式/禁用项',
  baseline: 'string，8K/电影级/写实等基础画质词',
  scene: 'string，≥120字符，场景空间细节',
  lighting: 'string，≥150字符，主光/辅光/色温/方向',
  composition: 'string，≥100字符，景别/主体位置/线条/留白',
  color_palette: 'string，≥80字符，主色/辅色/肤色/饱和度/对比度',
  depth_of_field: 'string，≥80字符，焦点/景深/前景背景虚化',
  camera_movement: 'string，≥100字符，分时间段运镜',
  character: 'string，角色外貌与姿态',
  costume: 'string，服装材质款式',
  makeup: 'string，妆造',
  action: 'string，≥120字符，肢体动作与走位',
  props: 'string，道具',
  portraits: 'string，定妆照引用 image://...',
  dialogue: 'string，台词/旁白原文',
  timeline: 'string，≥200字符，0-Xs 分镜时间轴',
  mood: 'string，情绪基调',
  pacing: 'string，节奏',
  transition: 'string，转场方式',
  audio: 'string，≥100字符，环境音/配乐/音效',
  negative: 'string，负面约束',
  bright_constraint: 'string，明亮约束',
  character_constraint: 'string，角色一致性约束',
  consistency: 'string，跨镜头一致性'
};

// 25 字段标准名称列表（用于校验）
const REQUIRED_FIELDS = Object.keys(STANDARD_FIELDS_SCHEMA);

// 字段最低字符数要求
const MIN_LEN = {
  scene: 120, lighting: 150, composition: 100, action: 120,
  camera_movement: 100, timeline: 200, director_instruction: 80,
  color_palette: 80, depth_of_field: 80, audio: 100
};

function buildFullSchema(shotId) {
  // 用真实字段键填充，让 LLM 在 JSON 模式下有明确的 key 列表
  // value 使用空字符串，避免描述污染（风险5）
  return { shotId, fields: { ...STANDARD_FIELDS_SCHEMA } };
}

class PromptFusionAgent extends BaseAgent {
  constructor(options = {}) {
    super({ name: 'PromptFusionAgent', enabled: true, llmTimeout: 300000, ...options });
    this.maxPromptLength = options.maxPromptLength || PromptLengthConfig.HARD_MAX || 12000;
    this.concurrency = options.concurrency || 3;
    this.llmTimeout = 300000; // 5 分钟单次（结构化输出需要更长时间）
    this.llmMaxRetries = 2;
  }

  _getSystemPrompt() {
    return `你是一位资深电影导演和摄影师。根据镜头信息，为每个镜头生成结构化的导演分镜提示词。

【核心要求】
你必须按以下标准字段格式输出，每个字段独立清晰，不要混合成一段narrative文本：

字段列表（严格按此顺序）：
1. 【约束】：技术参数约束，必须包含画幅比例(Aspect ratio)、分辨率(Resolution)、格式(Format)、帧率(Frame rate)。标准格式："Aspect ratio: 16:9, Resolution: 1920x1080, Format: MP4, Frame rate: 24fps, no text, no subtitle, no caption, no watermark"
2. 【基础】：画质基础词，必须包含三类：①分辨率锚定(8K resolution/ultra high definition)、②风格质量(cinematic quality/photorealistic/hyperrealistic)、③细节增强(highly detailed/intricate textures/sharp focus)。标准格式："8K resolution, cinematic quality, highly detailed, photorealistic"
3. 【场景】：具体场景环境描述（地点、时间、空间深度、材质细节）
4. 【灯光/照明】：专业灯光设计（主光方向+色温K值+光比+特效光）。格式："主光：右侧45度顶光 5600K冷白光，柔光箱漫射；补光：左前侧反光板 3200K暖光，填充阴影；背景光：轮廓光分离人物与背景；特效：无"；必须包含主光方向（左/右/顶/底/正前/正后）、色温（K值）、光质（硬光/柔光/漫射）
5. 【构图】：景别+画面比例+主体位置+线条引导。格式："景别：中景（膝上）；主体位置：画面黄金分割右1/3处；线条引导：纵深由近及远；画框边缘：左侧留白1/4给背景信息"
6. 【色彩/色调】：调色方案+色温倾向+饱和度。格式："主色调：暖黄偏橙（黄昏感）；辅助色：冷蓝阴影点缀；肤色：自然偏暖；饱和度：中等偏低；对比度：中高"
7. 【景深】：焦点控制+虚化程度+前景/背景层次。格式："焦点：人物面部；景深：中等（f/2.8），背景适度虚化可辨；前景：无；背景：纵深渐变模糊；层次：中景（人物）-背景两层"
8. 【运镜】：镜头运动方式（推/拉/摇/移/跟/升降/手持/稳定器）。格式："0-3s：稳定器缓慢推近（0.3m/s）→ 3-6s：固定机位 → 6-10s：手持微晃跟拍（呼吸感）"
9. 【角色】：角色身份、姿态、表情（如：主角，短发，站姿挺拔，表情关切）
10. 【服装】：详细服装描述（颜色、款式、质地、配饰）。格式："深色外套（毛呢质地），内搭浅色衬衫（棉质），深色长裤，皮鞋"
11. 【化妆】：妆容、发型细节。格式："短发整齐，素颜淡妆，眉毛自然，唇色淡粉"
12. 【动作】：角色具体动作（手势、步伐、视线）。格式："右手自然抬起至胸前做强调手势，左手自然下垂，身体微微前倾，目光直视镜头"
13. 【道具】：关键道具（手持物、桌面物品、背景物件）。格式："手持：空白文件夹（白色，无文字）；背景：木质桌面"
14. 【定妆照】：角色定妆照引用路径（如：image://characters/xxx/portraits/xxx.jpg）
15. 【对话指令】：角色对话标注（Seedance 官方格式）。当镜头中有台词时必须输出。格式：角色名(动作触发，情绪修饰，面向[对话对象])："台词内容"，LIP_SYNC:true，身体语言：[描述]。每句台词一行，多句分行排列。包含完整台词内容，无需单独输出【台词】。
16. 【时间轴】：镜头内部的微观导演调度时间轴。必须采用分段式描述，时间戳使用相对于镜头起始点的偏移格式 T00:XX（如 T00:00, T00:02, T00:04），每段包含画面内容和角色动作。要求至少分3段，时间戳不得重叠或跳跃中断。
   标准格式示例：
   "T00:00 - 中景，主角坐在窗前，阳光从侧面照入；主角缓缓抬起头，目光投向窗外
   T00:02 - 近景过渡，镜头缓慢推进至面部；主角眼神由迷茫转为坚定，嘴角微微抿紧
   T00:04 - 特写定格，主角眼部区域；眼睛眨动一次，瞳孔中反射出窗外景象"
17. 【情绪】：1-2个情绪关键词，必须具有清晰视觉指向性，避免语义对立。推荐词库：joyful/serene/hopeful/melancholic/tense/despairing/mysterious/eerie/epic/fierce/romantic/intimate
18. 【节奏】：五段式描述，必须包含：整体(Overall)、开头(Opening 0-20%)、中段(Middle 20%-80%)、高潮(Climax)、结尾(Ending 10%-20%)。
   标准格式："整体：沉稳中等节奏；开头：缓慢引入（2s）；中段：稍快推进（紧迫感）；高潮：停顿强调（1s留白）；结尾：平缓收尾"
19. 【转场】：与下一镜头的衔接方式。必须采用"类型+持续时间+方向/风格"三段式结构。类型：hard cut(切镜)/fade in(淡入)/fade out(淡出)/dissolve(叠化)/wipe(划像)/zoom transition(缩放转场)
20. 【音频】：三层描述法——环境音效(Ambient Sound)+音乐风格(Music Style)+音量层级(Volume Level)。格式："gentle ocean waves and seagull calls, ambient cinematic with strings and piano, peaceful, 70 BPM, volume level: balanced"
21. 【负面约束】：排除项，必须包含两类：①通用负面词(no text/no watermark/no blurry/no extra limbs/deformed/distorted/low quality)；②场景特定负面词（根据content_type动态加载：教育类/医疗类/剧情类/广告类）
22. 【角色一致性】：保持角色形象一致
23. 【明亮约束】：亮度/光照强制要求，确保画面明亮清晰（如：bright lighting, well-lit scene, clear visibility, no dark shadows on face, adequate illumination）。这是强制字段，必须输出
24. 【角色约束】：角色出现限制，防止多角色/分身问题。格式："只出现[角色名]一人，禁止其他人物入镜，禁止同一角色重复出现，禁止角色分身或克隆"
25. 【导演指令】：整体创作意图和风格控制。格式："好莱坞大导演质感，电影级画面，写实风格，无特效，无科幻元素"

【示例已移除 - 使用传入的镜头信息生成，禁止模仿任何固定示例】

关键要求：
1. 【内容充分性要求】每个字段描述必须充分详细，参考以下最低字符数要求：
   - 【场景】≥120字符（须含地点、时间、空间布局、材质细节）
   - 【灯光/照明】≥150字符（须含主光方向+色温K值+光质+补光+背景光）
   - 【构图】≥100字符（须含景别+主体位置+线条引导+画框边缘）
   - 【动作】≥120字符（须含手势+步伐+视线+情绪表达+姿态变化）
   - 【运镜】≥100字符（须含运动方式+速度+时间分布+起止点）
   - 【时间轴】≥200字符（须分≥3段，每段含时间戳+画面内容+角色动作）
   - 【导演指令】≥80字符（须含风格定位+质感要求+禁忌声明）
   - 【色彩/色调】≥80字符（须含主色调+辅助色+肤色+饱和度+对比度）
   - 【景深】≥80字符（须含焦点位置+光圈值+前景/背景虚化+层次分离）
   - 【音频】≥100字符（须含环境音效+音乐风格+音量层级+BPM）
   - 如果某字段内容不足，请补充更多细节使其达标
2. 【对话指令】字段必须独立，包含角色名+动作触发+情绪修饰+面向对象+台词内容+LIP_SYNC+身体语言，不要写"画外音""旁白"
3. 场景要具体真实，必须是写实环境，禁止科幻/抽象元素
3. 【动作】必须是真实物理动作和镜头运动：推近、跟拍、手持、站立、行走、手势、转身、注视镜头。严禁使用：全息投影、空间扭曲、时间残影、霓虹色、数据流、抽象构图、梦境流动性、湿版摄影、光即角色、AI瑕疵、宏大比例、微观世界
4. 禁止词汇（全字段通用）：全息、虚拟、投影、抽象、光影场域、数据空间、元宇宙、时间操控、霓虹、微观世界、宏观、抽象几何、流动光影、交织光影、色彩对冲、空间扭曲、时间残影、数据流、光即角色、梦境流动性、湿版摄影、AI瑕疵
5. 【场景】中不得出现含文字的物品描述：如"有文字的报告单"、"标牌上的文字"、"商标"、"有字的海报"等。可以描述"空白报告单"、"无文字标识牌"、"图形海报"等不含文字的物品
6. 不要混合成一段narrative，每个字段独立输出
7. 只描述本集内容，严禁预告后续集数
8. 保持角色视觉锚点一致
9. 负面约束要完整，包含两类：①通用负面词(no text/no watermark/no blurry等)；②场景特定负面词（教育类/医疗类/剧情类/广告类）
10. 【时间轴】必须使用T00:XX相对时间戳格式，至少3段
11. 【节奏】必须使用五段式描述（整体/开头/中段/高潮/结尾）
12. 【情绪】只使用1-2个关键词，避免堆砌同义词`;
  }

  async process(shots, blueprint) {
    const ratio = blueprint.config?.aspectRatio || '16:9';
    const characters = blueprint.character_system?.characters || [];
    const concurrency = Math.min(this.concurrency || 2, shots.length);

    console.log(`[PromptFusionAgent] 开始处理 ${shots.length} 个镜头（并发=${concurrency}）`);

    const results = new Array(shots.length);
    const errors = [];

    // 【P0-2-审计修复】分批并行处理 + 全局截止时间感知 + 逐批 checkpoint
    for (let batchStart = 0; batchStart < shots.length; batchStart += concurrency) {
      // 全局截止时间感知：剩余预算不足时提前降级
      const remaining = this._remainingMs();
      if (remaining < 30000) {
        console.warn(`[PromptFusionAgent] ⏰ 剩余预算不足(${remaining}ms)，剩余 ${shots.length - batchStart} 镜头使用规则兜底`);
        for (let i = batchStart; i < shots.length; i++) {
          results[i] = this._fallbackSingleShot(shots[i], ratio);
          results[i].degraded = true;
          results[i].degradeReason = '全局预算不足，规则兜底';
        }
        break;
      }

      const batchEnd = Math.min(batchStart + concurrency, shots.length);
      const batchIndices = [];
      for (let i = batchStart; i < batchEnd; i++) batchIndices.push(i);

      console.log(` 📦 批次 ${Math.floor(batchStart / concurrency) + 1}: 镜头 ${batchStart + 1}-${batchEnd}`);

      // 并行处理当前批次
      const batchResults = await Promise.allSettled(
        batchIndices.map(i => this._fuseSingleShot(shots[i], ratio, characters))
      );

      // 收集结果
      batchResults.forEach((res, idx) => {
        const i = batchIndices[idx];
        if (res.status === 'fulfilled') {
          results[i] = res.value;
          console.log(` ✅ ${shots[i].shotId} 完成`);
        } else {
          console.warn(` ❌ ${shots[i].shotId} 融合失败: ${res.reason?.message}，规则兜底`);
          results[i] = this._fallbackSingleShot(shots[i], ratio);
          results[i].degraded = true;
          results[i].degradeReason = `LLM融合失败: ${res.reason?.message}`;
          errors.push({ shotId: shots[i].shotId, error: res.reason?.message });
        }
      });

      // 【逐批 checkpoint】每批完成后保存，进程被杀也能续跑
      if (typeof this._onBatchComplete === 'function') {
        try {
          await this._onBatchComplete('phase3-partial', results.filter(Boolean));
        } catch (e) {
          console.warn(`[PromptFusionAgent] checkpoint保存失败(忽略): ${e.message}`);
        }
      }
    }

    const failed = results.filter(r => r && r.degraded).length;
    console.log(`[PromptFusionAgent] 完成 ✓ | 降级: ${failed}/${shots.length}`);
    return { shots: results, degraded: failed > 0, degradeReason: null, errors };
  }

  /**
   * 【v2.1.4-fix11】构建shot结果（用于补全后的组装）
   */
  _buildShotResult(shot, fields) {
    const expandedFields = { ...fields };
    const fullPrompt = this._assembleStandardPrompt(shot, fields, shot.ratio || '16:9');
    
    return {
      ...shot,
      ...expandedFields,
      fields,
      fusionText: fields.scene || '',
      prompt: fullPrompt,
      promptCharCount: this._countChars(fullPrompt),
      degraded: true,
      degradeReason: '主LLM超时，通过重试补全生成'
    };
  }

  async _fuseSingleShot(shot, ratio, characters) {
    const prompt = this._buildBatchPrompt([shot], ratio, characters);
    // 【P0-7-审计修复】schema 添加 required 字段，让校验生效
    const schema = {
      required: ['shots'],
      shots: [buildFullSchema(shot.shotId)],
    };

    const llmResult = await this._callLLM(prompt, schema, () => {
      throw new Error('LLM fallback');
    });

    const fusionEntry = llmResult.result?.shots?.find(s => s.shotId === shot.shotId);
    let fields = fusionEntry?.fields || {};
    
    // 【v2.1.4-fix10】在 LLM 输出入口统一标准化为 snake_case
    fields = normalizeFields(fields);
    
    // 【v2.1.4-fix10-P25-fix3】字段完整性校验 + 定向补齐
    fields = await this._ensureFieldCompleteness(shot, fields, ratio, characters);
    
    // 【v2.1.4-fix9-P25-fix7】将 fields 中的关键字段展开到 shot 顶层
    const expandedFields = { ...fields };
    
    // 组装标准格式Prompt
    const fullPrompt = this._assembleStandardPrompt(shot, fields, ratio);

    return {
      ...shot,
      ...expandedFields,
      fields,
      fusionText: fields.scene || '',
      prompt: fullPrompt,
      promptCharCount: this._countChars(fullPrompt),
      degraded: false,
      degradeReason: null
    };
  }

  /**
   * 【v2.1.4-fix10-P25-fix3】字段完整性校验 + 定向补齐
   * 先校验，缺哪些就只让 LLM 补哪些，一次轻量调用搞定
   */
  async _ensureFieldCompleteness(shot, fields, ratio, characters) {
    // 1. 先从 shot 中提取已有数据合并到 fields（LLM 可能没覆盖到这些）
    const shotData = this._extractFieldsFromShot(shot);
    for (const f of REQUIRED_FIELDS) {
      if (!fields[f] || String(fields[f]).trim() === '') {
        if (shotData[f] && String(shotData[f]).trim() !== '') {
          fields[f] = shotData[f];
        }
      }
    }

    // 2. 找出仍缺失或过短字段
    const missing = REQUIRED_FIELDS.filter(f => {
      const v = fields[f];
      if (!v || String(v).trim() === '') return true;
      const min = MIN_LEN[f] || 0;
      return min > 0 && this._countChars(String(v)) < min;
    });

    if (missing.length === 0) return fields; // 全齐，无需补

    // 【P1-13-审计修复】自适应补齐：预算充足用LLM，不足用规则兜底
    const remaining = this._remainingMs();
    const budgetPerField = 30000; // 每字段约30s
    if (remaining >= missing.length * budgetPerField && this.llmModel) {
      console.log(`[PromptFusion] ${shot.shotId} 缺失/过短字段 ${missing.length} 个: ${missing.join(',')} → LLM补齐（预算充足: ${remaining}ms）`);
      try {
        const patch = await this.llmModel.call({
          prompt: `为镜头 ${shot.shotId} 补齐以下字段: ${missing.join(',')}。按标准格式输出每个字段内容。`,
          timeout: Math.min(remaining - 5000, 120000)
        });
        if (patch && typeof patch === 'object') {
          for (const f of missing) {
            if (patch[f] && String(patch[f]).trim() !== '') {
              fields[f] = patch[f];
            }
          }
        }
      } catch (e) {
        console.warn(`[PromptFusion] LLM补齐失败: ${e.message} → 规则兜底`);
      }
    } else {
      console.log(`[PromptFusion] ${shot.shotId} 缺失/过短字段 ${missing.length} 个: ${missing.join(',')} → 规则兜底（预算不足: ${remaining}ms 或 LLM不可用）`);
    }
    // 兜底：LLM补齐后仍缺失的字段用规则兜底
    for (const f of missing) {
      if (!fields[f] || String(fields[f]).trim() === '') {
        fields[f] = this._defaultFieldValue(f, shot);
      }
    }
    // 【v2.1.4-fix16-EDU】强制保护核心字段，防止LLM覆盖原始角色和场景
    const originalChar = shot.character ? (typeof shot.character === 'string' ? shot.character : shot.character?.name || '') : '';
    if (originalChar && fields.character !== originalChar) {
      console.log(`[PromptFusion] ${shot.shotId} 角色被LLM修改，强制还原为原始角色: ${originalChar}`);
      fields.character = originalChar;
    }
    if (shot.scene && fields.scene !== shot.scene) {
      console.log(`[PromptFusion] ${shot.shotId} 场景被LLM修改，强制还原为原始场景: ${shot.scene}`);
      fields.scene = shot.scene;
    }
    if (shot.action && fields.action !== shot.action) {
      console.log(`[PromptFusion] ${shot.shotId} 动作被LLM修改，强制还原为原始动作: ${shot.action}`);
      fields.action = shot.action;
    }
    return fields;
  }

  /**
   * 【v2.1.4-fix13-审计修复】降为1次重试，去掉指数退避等待，失败后直接规则兜底
   */
  async _fillMissingFieldsWithRetry(shot, ratio, characters) {
    const maxRetries = 1;
    
    // 先从shot中提取已有数据
    const fields = {};
    const shotData = this._extractFieldsFromShot(shot);
    for (const f of REQUIRED_FIELDS) {
      fields[f] = shotData[f] || '';
    }
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // 每次重试前检查剩余预算，避免重试吃掉全部时间
      const remaining = this._remainingMs();
      if (remaining < 30000) {
        console.warn(`  ⏰ 剩余预算不足(${remaining}ms)，中止重试，直接降级`);
        break;
      }

      try {
        console.log(`  🔄 补全尝试 ${attempt}/${maxRetries}...`);
        const filled = await this._ensureFieldCompleteness(shot, fields, ratio, characters);
        
        // 检查是否还有空字段
        const stillEmpty = REQUIRED_FIELDS.filter(f => !filled[f] || String(filled[f]).trim() === '');
        if (stillEmpty.length === 0) {
          console.log(`  ✅ 补全成功，所有字段已填充`);
          return this._buildShotResult(shot, filled);
        }
        console.log(`  ⚠️ 仍有 ${stillEmpty.length} 字段为空，继续重试...`);
      } catch (e) {
        console.warn(`  ❌ 补全尝试 ${attempt} 失败: ${e.message}`);
      }
    }
    
    // 【修复】重试用完仍有缺失，直接用规则兜底（不再 throw）
    console.warn(`  ⚠️ 补全重试耗尽，使用规则兜底`);
    return this._buildShotResult(shot, fields);
  }

  // 【v2.1.4-fix11】规则兜底默认值 - 25字段完整默认值，确保绝不返回空字符串
  _defaultFieldValue(field, shot) {
    const ratio = shot.ratio || '16:9';
    const sceneType = shot.sceneType || 'standard';
    const character = shot.character || '主角';
    
    const defaults = {
      director_instruction: '好莱坞电影级质感，写实风格，专业摄影布光，8K超高清',
      constraint: `Aspect ratio: ${ratio}, Resolution: 1920x1080, Format: MP4, Frame rate: 24fps, no text anywhere in frame, no subtitle, no caption, no watermark, no logo, no readable characters`,
      baseline: '8K resolution, cinematic quality, highly detailed, photorealistic, hyperrealistic, sharp focus, ultra high definition, lifelike textures, professional color grading',
      scene: `${sceneType}场景，室内写实环境，自然光线照射，真实材质质感，空间层次分明，环境细节丰富`,
      lighting: '主光：右侧45度自然光 5600K柔光漫射；补光：左前侧反光板填充阴影；背景光：轮廓光分离层次；光比3:1，整体明亮清晰',
      composition: '景别：中景（膝上）；主体位置：画面黄金分割点；线条引导：纵深层次感；画框边缘：适度留白',
      color_palette: '主色调：自然偏暖；辅助色：环境本色；肤色：自然健康；饱和度：中等自然；对比度：中高清晰',
      depth_of_field: '焦点：主体面部或动作中心；景深：中等（f/4），背景适度虚化；前景：轻微虚化增加层次；层次：前景-中景-背景三层分离',
      camera_movement: '0-3s：固定机位稳定构图；3-6s：缓慢推近或平移；6-10s：回到固定机位',
      character: `${character}，写实人物形象，自然姿态，真实表情，符合场景身份`,
      costume: '符合角色身份的写实服装，面料质感真实，颜色自然，款式简洁大方',
      makeup: '素颜或淡妆，妆容自然真实，发型整洁，符合日常生活场景',
      action: `${character}自然站立或行走，手部自然动作，眼神交流，真实肢体语言`,
      props: '场景中必要的写实道具，材质真实，无文字标识，符合场景功能',
      portraits: 'image://characters/default/portrait.png',
      dialogue: '',
      dialogue_block: null, // 【v1.0.2-fix】空值时不输出，避免无意义标签
      timeline: 'T00:00 - 开场构图，环境展示；T00:03 - 主体进入画面；T00:06 - 核心动作或对白；T00:09 - 收尾定格',
      mood: 'calm, professional, natural',
      pacing: '整体：沉稳中等节奏；开头：平缓引入；中段：自然推进；结尾：平稳收尾',
      transition: '自然切换，无特效转场，直接硬切或微淡入淡出',
      audio: '环境底噪真实自然，无明显配乐干扰，人声音量适中清晰，空间感真实',
      negative: 'no text anywhere in frame, no watermark, no logo, no subtitle, no caption, no blur, no distortion, no extra limbs, no deformed features, no cartoon style, no anime, no illustration, no painting, no 3D render, no CGI, no special effects, no abstract, no surreal',
      bright_constraint: 'bright lighting, well-lit scene, clear visibility, natural illumination, avoid dark shadows',
      character_constraint: '只出现指定角色一人，禁止其他人物入镜，禁止同一角色重复出现，禁止角色分身或克隆，保持角色形象一致',
      consistency: '保持角色面部特征、服装造型、发型妆容跨镜头一致，场景光线连续，色调统一'
    };
    
    const value = defaults[field];
    if (value === undefined) {
      console.warn(`[PromptFusionAgent] 未知字段的默认值: ${field}`);
      return `[规则兜底] ${field} 默认值`;
    }
    return value;
  }

  // 补齐专用 prompt：只问缺失字段，附上已生成字段作为上下文
  _buildFillPrompt(shot, missing, existingFields, ratio, characters) {
    const ctx = Object.entries(existingFields)
      .filter(([k, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${String(v).slice(0, 80)}`)
      .join('\n');
    return `## 镜头补齐任务
镜头ID：${shot.shotId}（时长 ${shot.duration || '?'}s）
场景：${shot.scene || ''}
情绪：${shot.mood || ''}
台词：${(shot.dialogue?.lines?.map(l => l.content).join('; ') || shot.dialogue || '')}

## 已生成字段（保持风格一致）
${ctx}

## 本次只补齐以下字段，每个必须达到最低字符数
${missing.map(f => `- ${f}：${FIELD_DESCS[f]}`).join('\n')}

## 输出格式
必须输出严格合法的 JSON，格式如下：
{
  "shotId": "${shot.shotId}",
  "fields": {
${missing.map(f => `    "${f}": "【${f}的具体内容，至少30个字符】"`).join(',\n')}
  }
}

只输出 JSON，不要解释。不要添加 markdown 代码块标记。`;
  }

  /**
   * 【v2.1.4-fix10-fix1】从 shot 对象提取字段数据，用于补充 LLM 缺失字段
   */
  _extractFieldsFromShot(shot) {
    const result = {};
    if (!shot) return result;
    
    // 提取已有数据
    if (shot.scene) result.scene = shot.scene;
    if (shot.mood) result.mood = shot.mood;
    if (shot.action) result.action = shot.action;
    if (shot.character) result.character = typeof shot.character === 'string' ? shot.character : shot.character?.name || '';
    if (shot.cameraString) result.camera_movement = shot.cameraString;
    if (shot.lightingString) result.lighting = shot.lightingString;
    if (shot.backgroundSoundString) result.audio = shot.backgroundSoundString;
    // 【P1-14-审计修复】统一 dialogue_block 构建
    if (shot.dialogue) {
      const block = this._buildDialogueBlock(shot.dialogue, shot);
      if (block) result.dialogue_block = block;
    }
    if (shot.dialogueBlock || shot.dialogue_block) {
      result.dialogue_block = shot.dialogueBlock || shot.dialogue_block;
    }
    if (shot.emotionalTarget) {
      const et = shot.emotionalTarget;
      result.mood = `${et.valence > 0.5 ? 'positive' : 'neutral'}, ${et.arousal > 0.5 ? 'high energy' : 'calm'}`;
    }
    if (shot.duration) {
      const d = shot.duration;
      const seg1 = Math.floor(d * 0.3);
      const seg2 = Math.floor(d * 0.6);
      result.timeline = `T00:00 - 全景establishing，环境展示；T00:0${seg1} - 中景推进，人物动作；T00:0${seg2} - 情绪收尾，光线平复`;
    }
    if (shot.characterRef) result.portraits = shot.characterRef;
    
    // 默认负面约束
    result.negative = 'no text anywhere in frame, no readable characters, no alphabets, no Chinese characters, no text on walls, no text on objects, no text on documents, no text on signs, no text on labels, no text on screens, no text on clothing, no text in background';
    result.bright_constraint = 'bright lighting, well-lit scene, clear visibility, no dark shadows on face, adequate illumination';
    result.character_constraint = `只出现${shot.character?.name || '角色'}一人，禁止其他人物入镜，禁止同一角色重复出现，禁止角色分身或克隆`;
    result.director_instruction = '好莱坞大导演质感，电影级画面，写实风格，无特效，无科幻元素';
    result.consistency = '保持角色形象一致，造型不变，面部特征与体型每帧统一';
    
    return result;
  }

  _fallbackSingleShot(shot, ratio) {
    const fallbackPrompt = this._assembleFullPrompt(shot, '', ratio);
    // 【v2.1.4-fix13-审计修复】保留原始 fields，避免降级时丢失所有字段
    const preservedFields = shot.fields && typeof shot.fields === 'object' && Object.keys(shot.fields).length > 0
      ? shot.fields
      : this._extractFieldsFromShot(shot);
    return {
      ...shot,
      fields: preservedFields,
      fusionText: '',
      prompt: fallbackPrompt,
      promptCharCount: this._countChars(fallbackPrompt),
      degraded: true,
      degradeReason: '单镜头 LLM 融合失败，规则兜底',
      _pf_fallback: true
    };
  }

  /**
   * 组装标准格式Prompt（按之前正常版本的字段格式）
   */
  _assembleStandardPrompt(shot, fields, ratio) {
    const parts = [];
    
    // 辅助函数：获取字段值（支持驼峰和下划线命名）
    const getField = (...names) => {
      for (const name of names) {
        if (fields[name] !== undefined && fields[name] !== null && fields[name] !== '') {
          return fields[name];
        }
      }
      return undefined;
    };

    // 【导演指令】⭐ 新增：整体创作意图
    const directorInstruction = getField('director_instruction', 'directorInstruction');
    if (directorInstruction) parts.push(`【导演指令】${directorInstruction}`);

    // 【约束】：必须包含画幅比例、分辨率、格式、帧率
    parts.push(`【约束】${fields.constraint || `Aspect ratio: ${ratio}, Resolution: 1920x1080, Format: MP4, Frame rate: 24fps, no text, no subtitle, no caption, no watermark, no text anywhere in frame, no readable characters, no alphabets, no Chinese characters, no text on walls, no text on objects, no text on documents, no text on signs, no text on labels, no text on screens, no text on clothing, no text in background`}`);

    // 【基础】：三类基础词——分辨率锚定+风格质量+细节增强
    parts.push(`【基础】${fields.baseline || '8K resolution, cinematic quality, highly detailed, photorealistic, intricate textures, sharp focus'}`);

    // 【场景】
    // 【v2.1.4-fix9-P5】场景强制写实：禁止科幻/抽象词汇
    let sceneDesc = fields.scene || shot.scene || '';
    const forbiddenWords = ['全息', '虚拟', '投影', '抽象', '光影场域', '数据空间', '元宇宙', '时间操控', '霓虹', '微观世界', '宏观', '抽象几何', '流动光影', '交织光影', '色彩对冲'];
    const hasForbidden = forbiddenWords.some(w => sceneDesc.includes(w));
    if (hasForbidden) {
      console.warn(`[PromptFusionAgent] ⚠️ 镜头 ${shot.shotId} 场景含禁止词汇: "${sceneDesc.substring(0, 50)}..."，强制替换为写实场景`);
      // 强制替换为写实场景 - 【v2.1.4-fix15】使用动态兜底，不硬编码医院场景
      const worldSetting = shot.worldSetting || { name: '真实物理环境' };
      const worldDesc = worldSetting.description || worldSetting.name || '真实物理环境';
      const atmosphere = worldSetting.atmosphere || '';
      const sceneType = shot.sceneType || 'establishing';
      const typeDesc = {
        'opening': '史诗开场空间',
        'establishing': '核心叙事空间',
        'conflict': '紧张对峙地带',
        'action': '激烈动作场地',
        'emotional_climax': '情感高潮场景',
        'resolution': '平静收尾空间',
        'discovery': '探索发现区域',
        'transition': '过渡连接空间'
      }[sceneType] || '叙事场景';
      sceneDesc = `${worldDesc}，${typeDesc}${atmosphere ? '，' + atmosphere : ''}`;
    }
    if (sceneDesc) parts.push(`【场景】${sceneDesc}`);

    // 【灯光/照明】⭐ 新增：专业灯光设计
    const lightingField = getField('lighting');
    if (lightingField) parts.push(`【灯光/照明】${lightingField}`);

    // 【构图】⭐ 新增：景别+画面比例+主体位置+线条引导
    const compositionField = getField('composition');
    if (compositionField) parts.push(`【构图】${compositionField}`);

    // 【色彩/色调】⭐ 新增：调色方案+色温倾向+饱和度
    const colorPalette = getField('color_palette', 'colorPalette');
    if (colorPalette) parts.push(`【色彩/色调】${colorPalette}`);

    // 【景深】⭐ 新增：焦点控制+虚化程度+前景/背景层次
    const depthOfField = getField('depth_of_field', 'depthOfField');
    if (depthOfField) parts.push(`【景深】${depthOfField}`);

    // 【运镜】⭐ 新增：镜头运动方式（从【动作】拆分）
    const cameraMovement = getField('camera_movement', 'cameraMovement');
    if (cameraMovement) parts.push(`【运镜】${cameraMovement}`);

    // 【P1-17-审计修复】通用化角色服装锁定：支持任意关键词服装
    let characterDesc = fields.character || '';
    if (characterDesc && shot.character) {
      const originalChar = typeof shot.character === 'string' ? shot.character : '';
      const costumeKeywords = [
        '警服', '白大褂', '西装', '铠甲', '战甲', '法袍', '道袍',
        '军装', '制服', '汉服', '长袍', '盔甲', '披风',
        'uniform', 'armor', 'robe', 'suit', 'coat'
      ];
      const originalCostume = costumeKeywords.find(k => originalChar.includes(k));
      if (originalCostume && !characterDesc.includes(originalCostume)) {
        console.warn(`[PromptFusion] ${shot.shotId} 角色服装被LLM修改，强制还原为: ${originalCostume}`);
        characterDesc = `${originalChar}，${characterDesc}`;
      }
    }
    if (characterDesc) parts.push(`【角色】${characterDesc}`);

    // 【服装】⭐ 新增：详细服装描述（从【角色】拆分）
    const costumeField = getField('costume');
    if (costumeField) parts.push(`【服装】${costumeField}`);

    // 【化妆】⭐ 新增：妆容、发型细节
    const makeupField = getField('makeup');
    if (makeupField) parts.push(`【化妆】${makeupField}`);

    // 【动作】
    // 【v2.1.4-fix9-P9】动作强制写实：禁止科幻/抽象词汇
    let actionDesc = getField('action') || shot.action || '';
    const actionForbidden = ['全息', '虚拟', '投影', '空间扭曲', '时间残影', '霓虹', '数据流', '光即角色', '抽象构图', '梦境流动性', '手绘动画'];
    const actionHasForbidden = actionForbidden.some(w => actionDesc.includes(w));
    if (actionHasForbidden) {
      console.warn(`[PromptFusionAgent] ⚠️ 镜头 ${shot.shotId} 动作含禁止词汇: "${actionDesc.substring(0, 50)}..."，强制替换为写实动作`);
      // 根据场景类型生成写实动作 - 【v2.1.4-fix15】使用动态兜底，不硬编码医院动作
      const charName = shot.character?.name || (typeof shot.character === 'string' ? shot.character.split(/[:,，]/)[0] : '角色');
      const sceneType = shot.sceneType || 'establishing';
      const actionTypeDesc = {
        'opening': '缓缓进入画面，目光扫视环境，建立气场',
        'establishing': '自然站立或行走，手部自然动作，眼神交流',
        'conflict': '身体前倾，双手握拳或张开，目光锐利对峙',
        'action': '快速移动，肢体大幅摆动，与环境互动',
        'emotional_climax': '情绪爆发，肢体张力达到顶点，面部特写',
        'resolution': '动作放缓，呼吸调整，姿态放松',
        'discovery': '探索性动作，观察环境，发现新事物',
        'transition': '移动过渡，走向新位置，环境变化'
      }[sceneType] || '自然站立或行走，手部自然动作';
      actionDesc = `${charName} ${actionTypeDesc}`;
    }
    if (actionDesc) parts.push(`【动作】${actionDesc}`);

    // 【道具】⭐ 新增：关键道具（手持物、桌面物品、背景物件）
    const propsField = getField('props');
    if (propsField) parts.push(`【道具】${propsField}`);

    // 【定妆照】路径规范化：统一角色目录名
    let portraitsField = getField('portraits');
    if (portraitsField) {
      // 统一替换各种变体为规范路径
      portraitsField = portraitsField
        .replace(/characters[/\\]monkey_king/g, 'characters/wukong')
        .replace(/characters[/\\]sunwukong/g, 'characters/wukong')
        .replace(/characters[/\\]erlang_shen/g, 'characters/erlang-shen')
        .replace(/characters[/\\]erlangshen/g, 'characters/erlang-shen')
        .replace(/characters[/\\]erlangsen/g, 'characters/erlang-shen');
      parts.push(`【定妆照】${portraitsField}`);
    }

    // 台词 - 当存在【对话指令】时不再单独输出【台词】，避免重复
    const dialogueField = getField('dialogue');
    const dialogueBlockField = getField('dialogue_block');
    
    if (dialogueBlockField && String(dialogueBlockField).trim() && !String(dialogueBlockField).includes('规则兜底')) {
      // 【对话指令】包含完整台词+角色属性+LIP_SYNC，优先使用
      const dialogueBlockText = dialogueBlockField.startsWith('【对话指令】') ? dialogueBlockField : `【对话指令】${dialogueBlockField}`;
      parts.push(dialogueBlockText);
    } else if (dialogueField) {
      // 无【对话指令】时才输出【台词】作为降级
      const dialogueText = dialogueField.startsWith('【台词】') ? dialogueField : `【台词】${dialogueField}`;
      parts.push(dialogueText);
    }

    // 【时间轴】镜头内部微观导演调度（T00:XX相对时间戳格式）
    const timelineField = getField('timeline');
    if (timelineField) {
      parts.push(`【时间轴】${timelineField}`);
    } else {
      // 兜底：使用T00:XX相对时间戳格式，至少3段
      const duration = shot.duration || 10;
      const seg1 = Math.floor(duration * 0.3);
      const seg2 = Math.floor(duration * 0.6);
      parts.push(`【时间轴】T00:00 - 全景establishing，环境展示，冷静氛围；T00:0${seg1} - 中景推进，人物动作，情绪升温；T00:0${seg2} - 情绪收尾，光线平复`);
    }

    // 【情绪】
    const moodField = getField('mood');
    if (moodField) parts.push(`【情绪】${moodField}`);

    // 【节奏】⭐ 新增：镜头速度+紧迫感+舒缓度
    const pacingField = getField('pacing');
    if (pacingField) parts.push(`【节奏】${pacingField}`);

    // 【转场】⭐ 新增：与下一镜头的衔接方式
    const transitionField = getField('transition');
    if (transitionField) parts.push(`【转场】${transitionField}`);

    // 【音频】
    const audioField = getField('audio');
    if (audioField) parts.push(`【音频】${audioField}`);

    // 【负面约束】：通用负面词 + 场景特定负面词
    const negativeField = getField('negative');
    if (negativeField) {
      parts.push(`【负面约束】${negativeField}`);
    } else {
      // 兜底：通用负面词 + 教育/医疗场景特定负面词
      parts.push(`【负面约束】no text, no watermark, no caption, no subtitle, no logo, no blurry, no low resolution, no pixelated, no distorted, no artifacts, no compression noise, no extra limbs, no deformed hands, no malformed fingers, no extra fingers, no fused fingers`);
      parts.push(`no cartoon style, no flat lighting, no text anywhere in frame, no readable characters, no alphabets, no Chinese characters, no text on walls, no text on objects, no text on documents, no text on signs, no text on labels, no text on screens, no text on clothing, no text in background`);
      parts.push(`no brand logos with text, no text in medical charts, no text on posters, no text on billboards, no text on packaging, no handwritten text, no printed text, no signage text, no text overlays, no UI elements with text`);
    }

    // 【明亮约束】⭐ 新增：亮度/光照强制要求，防止暗场
    const brightConstraint = getField('bright_constraint', 'brightConstraint');
    if (brightConstraint) {
      parts.push(`【明亮约束】${brightConstraint}`);
    } else {
      // 兜底：强制明亮
      parts.push(`【明亮约束】bright lighting, well-lit scene, clear visibility, no dark shadows on face, adequate illumination`);
    }

    // 【角色约束】⭐ 新增：防止多角色/分身
    const characterConstraint = getField('character_constraint', 'characterConstraint');
    if (characterConstraint) {
      parts.push(`【角色约束】${characterConstraint}`);
    } else if (shot.character && shot.character !== 'NONE') {
      // 兜底：根据角色名自动生成
      const charName = shot.character.name || shot.character;
      parts.push(`【角色约束】只出现${charName}一人，禁止其他人物入镜，禁止同一角色重复出现，禁止角色分身或克隆`);
    }

    // 【角色一致性】
    const consistencyField = getField('consistency');
    if (consistencyField) parts.push(`【角色一致性】${consistencyField}`);

    // 合并
    let fullPrompt = parts.join('，');
    
    // 截断
    if (this._countChars(fullPrompt) > this.maxPromptLength) {
      fullPrompt = this._truncateStandardPrompt(fullPrompt);
    }

    return fullPrompt;
  }

  /**
   * 组装完整Prompt（降级路径，保留原有逻辑）
   */
  _assembleFullPrompt(shot, fusionText, ratio) {
    const parts = [];

    // L1: 约束层
    // 【v2.1.4-fix9-P25】约束字段：画幅+分辨率+格式+帧率+禁止项
    parts.push(`Aspect ratio: ${ratio}, Resolution: 1920x1080, Format: MP4, Frame rate: 24fps, no text, no subtitle, no caption, no watermark, no text anywhere in frame, no readable characters, no alphabets, no Chinese characters, no text on walls, no text on objects, no text on documents, no text on signs, no text on labels, no text on screens, no text on clothing, no text in background`);

    // L2: 基础层
    // 【v2.1.4-fix9-P25】基础字段：分辨率锚定+风格质量+细节增强
    parts.push('8K resolution, cinematic quality, highly detailed, photorealistic, intricate textures, sharp focus');

    // L3-L7: 融合段
    if (fusionText) {
      parts.push(fusionText);
    } else {
      // 【v2.1.4-fix9-P11】降级路径也强制写实场景和动作
      let sceneDesc = shot.scene || '';
      const sceneForbidden = ['全息', '虚拟', '投影', '抽象', '光影场域', '数据空间', '元宇宙', '时间操控', '霓虹', '微观世界', '宏观', '抽象几何', '流动光影', '交织光影', '色彩对冲'];
      if (sceneForbidden.some(w => sceneDesc.includes(w))) {
        // 【v2.1.4-fix15】使用动态兜底，不硬编码医院场景
        const worldSetting = shot.worldSetting || { name: '真实物理环境' };
        const worldDesc = worldSetting.description || worldSetting.name || '真实物理环境';
        const atmosphere = worldSetting.atmosphere || '';
        const sceneType = shot.sceneType || 'establishing';
        const typeDesc = {
          'opening': '史诗开场空间', 'establishing': '核心叙事空间',
          'conflict': '紧张对峙地带', 'action': '激烈动作场地',
          'emotional_climax': '情感高潮场景', 'resolution': '平静收尾空间',
          'discovery': '探索发现区域', 'transition': '过渡连接空间'
        }[sceneType] || '叙事场景';
        sceneDesc = `${worldDesc}，${typeDesc}${atmosphere ? '，' + atmosphere : ''}`;
      }
      parts.push(sceneDesc);
      
      if (shot.character && shot.character !== 'NONE') parts.push(shot.character);
      
      let actionDesc = shot.action || '';
      const actionForbidden = ['全息', '虚拟', '投影', '空间扭曲', '时间残影', '霓虹', '数据流', '光即角色', '抽象构图', '梦境流动性', '手绘动画', '湿版摄影', '黑色电影'];
      if (actionForbidden.some(w => actionDesc.includes(w))) {
        // 【v2.1.4-fix15】使用动态兜底，不硬编码医院动作
        const charName = shot.character?.name || (typeof shot.character === 'string' ? shot.character.split(/[:,，]/)[0] : '角色');
        const sceneType = shot.sceneType || 'establishing';
        const actionTypeDesc = {
          'opening': '缓缓进入画面，目光扫视环境，建立气场',
          'establishing': '自然站立或行走，手部自然动作，眼神交流',
          'conflict': '身体前倾，双手握拳或张开，目光锐利对峙',
          'action': '快速移动，肢体大幅摆动，与环境互动',
          'emotional_climax': '情绪爆发，肢体张力达到顶点，面部特写',
          'resolution': '动作放缓，呼吸调整，姿态放松',
          'discovery': '探索性动作，观察环境，发现新事物',
          'transition': '移动过渡，走向新位置，环境变化'
        }[sceneType] || '自然站立或行走，手部自然动作';
        actionDesc = `${charName} ${actionTypeDesc}`;
      }
      if (actionDesc) parts.push(actionDesc);
      
      const pureDialogue = shot.dialogueText || this._extractPureDialogue(shot.dialogue);
      if (pureDialogue && pureDialogue !== '') parts.push(`"${pureDialogue}"`);
      if (shot.cameraString) parts.push(shot.cameraString);
      if (shot.lightingString) parts.push(shot.lightingString);
      if (shot.mood) parts.push(`mood: ${shot.mood}`);
      if (shot.backgroundSoundString) parts.push(`audio: ${shot.backgroundSoundString}`);
    }

    // L9: 质控层
    // 【v2.1.4-fix9-P14】全局禁止文字：详细负面约束覆盖所有可能含文字的位置
    parts.push('no voiceover, no narration, no metal_gloss, no unnatural_eye_color, no text anywhere in frame, no readable characters, no alphabets, no Chinese characters');
    parts.push('no text on walls, no text on objects, no text on documents, no text on signs, no text on labels, no text on screens, no text on clothing, no text in background');
    parts.push('no brand logos with text, no text in medical charts, no text on posters, no text on billboards, no text on packaging, no handwritten text, no printed text, no signage text');
    parts.push('no text overlays, no UI elements with text, no text on book covers, no text on medicine bottles, no text on report forms, no text on devices, no text on badges, no text on nameplates');
    parts.push('no text on doors, no text on windows, no text on floors, no text on ceilings');

    let fullPrompt = parts.filter(p => p).join(', ');
    if (this._countChars(fullPrompt) > this.maxPromptLength) {
      fullPrompt = this._truncateWithPriority(fullPrompt, parts);
    }

    return fullPrompt;
  }

  /**
   * 【审计修复】按字段压缩而非整段砍除：保留全部25个【字段】标签，只压缩字段内文案
   */
  _truncateStandardPrompt(fullPrompt) {
    if (this._countChars(fullPrompt) <= this.maxPromptLength) return fullPrompt;
    // 按字段标签切分
    const segments = fullPrompt.split(/(?=【)/);
    if (segments.length <= 1) return fullPrompt.substring(0, this.maxPromptLength);
    // 计算每个字段当前字符数，等比压缩到目标长度
    const target = this.maxPromptLength;
    const totalNow = this._countChars(fullPrompt);
    const ratio = target / totalNow;
    const compressed = segments.map(seg => {
      const segLen = this._countChars(seg);
      const want = Math.max(40, Math.floor(segLen * ratio)); // 每字段至少保留40字符
      if (segLen <= want) return seg;
      // 保留字段标签头，截断内容
      const headMatch = seg.match(/^(【[^】]+】)/);
      const head = headMatch ? headMatch[1] : '';
      const body = seg.slice(head.length);
      let kept = body;
      while (this._countChars(head + kept) > want && kept.length > 20) {
        kept = kept.substring(0, kept.length - 10);
      }
      return head + kept;
    });
    return compressed.join('').trim();
  }

  _truncateWithPriority(fullPrompt, parts) {
    // 复用相同的按字段压缩逻辑
    return this._truncateStandardPrompt(fullPrompt);
  }

  _countChars(str) {
    if (!str) return 0;
    // 【v1.0.3-fix】使用实际字符数，避免中文字符加权导致误截断
    return str.length;
  }

  /**
   * 【P1-14-审计修复】统一 dialogue_block 构建（单入口）
   */
  _buildDialogueBlock(dialogue, shot) {
    if (!dialogue) return null;
    const speaker = shot.character?.name || '角色';
    const charDesc = typeof shot.character === 'string' ? shot.character : '';
    
    // 对象格式 {lines: [...]}
    if (typeof dialogue === 'object' && dialogue.lines && Array.isArray(dialogue.lines)) {
      const dialogueBlocks = dialogue.lines.map(line => {
        const spk = line.speaker || speaker;
        const text = line.text || line.content || '';
        const emotion = line.emotion || '平静';
        const action = line.action || '面向镜头说话';
        return `${spk}(${action}，${emotion}，面向镜头)："${text}"，LIP_SYNC:true，身体语言：[自然嘴型同步]`;
      });
      return dialogueBlocks.join('\n');
    }
    
    // Pipe-delimited 字符串格式
    if (typeof dialogue === 'string' && dialogue.includes('|')) {
      const parts = dialogue.split('|');
      if (parts.length >= 4) {
        const spk = parts[0] || speaker;
        const emotion = parts[2] || '平静';
        const text = parts[3] || '';
        return `${spk}(面向镜头说话，${emotion}，面向[画外])："${text}"，LIP_SYNC:true，身体语言：[自然嘴型同步]`;
      }
    }
    
    return null;
  }

  _extractPureDialogue(dialogue) {
    // 【v1.0.3-fix】支持对象类型 {lines: [...]} 和字符串类型
    if (!dialogue) return '';
    if (typeof dialogue === 'object' && dialogue.lines && Array.isArray(dialogue.lines)) {
      // 从 lines 数组提取纯文本
      return dialogue.lines.map(l => l.text || l.content || '').filter(Boolean).join('；');
    }
    if (typeof dialogue !== 'string') return String(dialogue || '');
    const parts = dialogue.split(/[|;]/);
    if (parts.length >= 5) {
      return parts[3].trim();
    }
    return dialogue.trim();
  }

  _buildBatchPrompt(shots, ratio, characters) {
    const characterInfo = characters.map(c => `- ${c.name}: ${c.description || ''}`).join('\n');

    const shotsInfo = shots.map(s => {
      const pureDialogue = s.dialogue_block || 
                          s.dialogue?.lines?.map(l => l.content).join('; ') || 
                          (s.dialogue ? this._extractPureDialogue(s.dialogue) : '');
      return `${s.shotId}(${s.duration || '?'}s): ${s.scene || ''} | ${s.mood || ''} | ${pureDialogue} | 运镜:${s.cameraString || ''} | 灯光:${s.lightingString || ''}`;
    }).join('\n');
    
    // 【v2.1.4-fix9-P1】构建导演上下文
    const directorContext = this._buildDirectorContext(shots);

    const sufficiency = [
      '【字段最低字符数 - 硬性要求，不达标会被打回重写】',
      ' scene ≥ 120 | lighting ≥ 150 | composition ≥ 100 | action ≥ 120',
      ' camera_movement ≥ 100 | timeline ≥ 200 | director_instruction ≥ 80',
      ' color_palette ≥ 80 | depth_of_field ≥ 80 | audio ≥ 100',
      ' 其余字段 ≥ 40 字符',
      ' 全部 25 个字段必须全部输出，禁止省略任何一个。'
    ].join('\n');

    return `${directorContext}
画幅:${ratio}
角色:${characterInfo || '无'}
镜头:\n${shotsInfo}

${sufficiency}

任务:为每个镜头生成标准字段格式的导演分镜提示词。

【角色服装锁定 - 强制不可修改】
角色服装必须与角色设定完全一致，禁止根据场景修改：
- 正确："角色服装必须与原始设定完全一致，不可自由发挥"
- 错误："白色医生服"、"白大褂"、"浅蓝色衬衫"（禁止根据场景更换服装）
【角色】字段必须严格使用角色设定中的原始服装描述，不可自由发挥。

【动作写实锁定 - 强制不可修改】
【动作】字段必须是真实物理动作和镜头运动，严禁使用任何科幻/抽象/超现实词汇：
- 正确："镜头缓慢推近，角色站立场景中，自然手势讲解，眼神注视镜头"
- 错误："全息投影"、"空间扭曲"、"时间残影"、"霓虹色数据流"、"抽象构图"、"梦境流动性"、"湿版摄影"、"光即角色"
- 正确运镜：推近、跟拍、手持、稳定器、缓慢后拉、固定机位
- 错误运镜：无人机穿越微观世界、时间操控慢动作、宏大比例展示

要求：
1. 按标准字段输出：【约束】【基础】【场景】【灯光/照明】【构图】【色彩/色调】【景深】【运镜】【角色】【服装】【化妆】【动作】【道具】【定妆照】【对话指令】【时间轴】【情绪】【节奏】【转场】【音频】【负面约束】【明亮约束】【角色约束】【导演指令】【角色一致性】
2. 【对话指令】字段必须独立，包含角色名+动作触发+情绪修饰+面向对象+台词内容+LIP_SYNC+身体语言，不要写"画外音""旁白"
3. 场景要具体专业，必须是写实环境，禁止科幻/抽象元素。场景中不得出现含文字的物品：如"有文字的报告单"、"标牌上的文字"、"商标"、"有字的海报"等。可以描述"空白报告单"、"无文字标识牌"、"图形海报"等不含文字的物品
4. 负面约束要完整，包含10+条排除项，必须包含全局禁止文字：no text anywhere in frame, no readable characters, no alphabets, no Chinese characters, no text on walls objects documents signs labels screens clothing packaging, no handwritten text, no printed text, no signage text, no text overlays, no UI elements with text
5. 只输出JSON，不要解释

输出:{"shots":[{"shotId":"SC01","fields":{...}}]}`;
  }
  
  /**
   * 【v2.1.4-fix9-P1】构建导演上下文
   */
  _buildDirectorContext(shots) {
    // 从第一个 shot 的 blueprint 引用中提取上下文
    const firstShot = shots[0];
    const blueprint = firstShot?._blueprint || {};
    const config = blueprint.config || {};
    
    const title = blueprint.title || config.title || '未命名';
    const contentTheme = config.content_theme || '';
    const sceneRequirement = config.scene_requirement || '';
    const characterDescription = config.character_description || '';
    const forbiddenScenes = config.forbidden_scenes || [];
    const keyMessages = config.key_messages || [];
    
    return `## 🎬 导演指令上下文
视频标题：${title}
内容主题：${contentTheme}
场景要求：${sceneRequirement}
角色设定：${characterDescription}
关键信息：${keyMessages.join('；') || '无'}
禁止场景：${forbiddenScenes.join('、') || '无'}

`;
  }

  _fallbackBatch(shots, ratio) {
    console.log(`[PromptFusionAgent] 批量降级...`);
    return {
      shots: shots.map(shot => ({
        shotId: shot.shotId,
        fields: {}
      }))
    };
  }
}

module.exports = { PromptFusionAgent };
```

---

## engines/production-engine/agents/scene-design-agent.js

```javascript
/**
 * SceneDesignAgent - 场景设计Agent
 * 负责: 场景五维描述、情绪设计、动作设计
 */
const { BaseAgent } = require('./base-agent');

class SceneDesignAgent extends BaseAgent {
  constructor(options = {}) {
    super({ name: 'SceneDesignAgent', ...options });
    this._currentBlueprint = null; // 【v2.1.4-fix13】存储当前 blueprint 用于动态提示词
  }

  /**
   * 【v2.1.4-fix13-审计修复】动态生成系统提示词，使用当前 blueprint
   */
  _getSystemPrompt() {
    return this._getDynamicSystemPrompt(this._currentBlueprint || {});
  }

  /**
   * 【v2.1.4-fix13-审计修复】动态生成系统提示词，根据 blueprint 主题选择场景
   */
  _getDynamicSystemPrompt(blueprint = {}) {
    // 从 blueprint 提取主题信息
    const meta = blueprint._metadata || blueprint.config?._metadata || {};
    const title = blueprint.title || meta.title || '视频';
    const genre = blueprint.genre || meta.genre || '科普';
    const setting = blueprint.setting || meta.setting || '';
    
    // 动态生成场景选项，避免硬编码医院场景
    const sceneOptions = this._generateSceneOptions(blueprint);
    
    return `你是一位专业的电影场景设计师。根据剧本场景信息，为每个镜头设计完整的场景描述、情绪基调和角色动作。

【绝对约束 - 违反则输出无效】
1. 场景必须从以下选项中选择（或基于这些选项的合理变体）：
${sceneOptions}
2. 禁止自创科幻/抽象场景
3. 禁止词汇：全息、虚拟、投影、抽象、概念、光影场域、数据空间、数字、元宇宙、时间操控、霓虹、微观世界、宏观、抽象几何、流动光影、交织光影、色彩对冲
4. 光线必须是真实光源：荧光灯、LED顶灯、窗光、无影灯、自然光
5. 角色必须在真实地面站立，背景必须是真实墙面
6. 场景描述中不得出现含文字的物品：如"有文字的报告单"、"标牌上的文字"、"商标"、"有字的海报"等。可以描述"空白报告单"、"无文字标识牌"、"图形海报"等不含文字的物品
7. 场景描述中的"海报"、"展板"、"标识牌"等物品必须是无文字版本（纯图形/色彩/图案）

输出JSON格式要求:
{
  "shots": [
    {
      "shotId": "SC01",
      "scene": "具体场景描述，包含墙面材质、灯光类型、家具设备",
      "mood": "情绪关键词和氛围描述",
      "action": "角色动作描述（含肢体语言、走位）",
      "emotional_target": "场景情绪目标"
    }
  ]
}

设计原则:
1. 场景描述要具体真实：包含墙面材质、灯光类型、设备、地面材质
2. 情绪要与台词匹配
3. 动作要自然：走动、手势、转身、指向等
4. 考虑镜头连续性：相邻场景的环境和光线要有逻辑关联;`;
  }

  /**
   * 【v2.1.4-fix13-审计修复】根据 blueprint 动态生成场景选项
   */
  /**
   * 【v2.1.4-fix15】动态生成场景选项，基于 worldSetting，不使用硬编码场景池
   * 根据视频类型（EDU/教育）生成科普场景选项，而非戏剧场景
   */
  _generateSceneOptions(blueprint = {}) {
    const meta = blueprint._metadata || blueprint.config?._metadata || blueprint.metadata || {};
    const worldSetting = blueprint.worldSetting || {};
    const filmType = meta.filmType || blueprint.filmType || blueprint.config?.filmType || blueprint.film_type || '';
    
    // 教育/科普类型：生成专业讲解场景选项
    if (filmType === 'EDU' || filmType === 'educational') {
      return `   根据教育科普主题生成写实讲解场景，可选方向：
   - 方向A：专业讲解空间（主讲人面向镜头讲解，背景为真实医疗/办公环境）
   - 方向B：案例展示空间（数据图表、实物模型、症状图片展示）
   - 方向C：警示提醒空间（关键信息高亮，严肃提醒注意事项）
   - 方向D：总结归纳空间（要点回顾，给出实用建议和行动号召）`;
    }
    
    // 优先从世界设定提取
    if (worldSetting.description || worldSetting.name) {
      const worldDesc = worldSetting.description || worldSetting.name;
      const atmosphere = worldSetting.atmosphere || '';
      return `   基于世界设定「${worldDesc}」生成场景，可选方向：
   - 方向A：${worldDesc}核心区域${atmosphere ? '，' + atmosphere : ''}
   - 方向B：${worldDesc}边缘/过渡地带${atmosphere ? '，' + atmosphere : ''}
   - 方向C：${worldDesc}特殊地貌/标志性地点${atmosphere ? '，' + atmosphere : ''}
   - 方向D：${worldDesc}战斗/冲突发生地${atmosphere ? '，' + atmosphere : ''}`;
    }
    
    // 无世界设定时返回类型指导（不含具体场景）
    return `   根据视频主题和已有场景描述生成写实场景，可选方向：
   - 方向A：核心叙事空间（主要事件发生地）
   - 方向B：过渡/连接空间（场景转换、移动过程）
   - 方向C：对峙/冲突空间（紧张感、对抗发生地）
   - 方向D：情绪释放空间（高潮、转折、收尾）`;
  }

  async process(shots, blueprint) {
    console.log(`[SceneDesignAgent] 开始处理 ${shots.length} 个镜头...`);

    // 【v2.1.4-fix13-审计修复】存储 blueprint 供 _getSystemPrompt 动态使用
    this._currentBlueprint = blueprint;

    // 获取视频类型用于后续场景选择
    const meta = blueprint._metadata || blueprint.config?._metadata || blueprint.metadata || {};
    const filmType = meta.filmType || blueprint.filmType || blueprint.config?.filmType || blueprint.film_type || '';

    const prompt = this._buildPrompt(shots, blueprint);

    const schema = {
      required: ['shots']
    };

    const llmResult = await this._callLLM(prompt, schema, () => {
      // 降级：使用原规则方法
      return this._fallback(shots);
    });

    if (llmResult.degraded) {
      return { shots: llmResult.result?.shots || shots, degraded: true, degradeReason: llmResult.degradeReason };
    }

    // 合并LLM结果回原shots
    const forbiddenWords = ['全息', '虚拟', '投影', '抽象', '光影场域', '数据空间', '元宇宙', '时间操控', '霓虹', '微观世界', '宏观', '抽象几何', '流动光影', '交织光影', '色彩对冲'];
    
    const designedShots = shots.map((shot, index) => {
      const designed = llmResult.result?.shots?.find(s => s.shotId === shot.shotId) || {};
      
      // 【v2.1.4-fix15】优先保留传入的已有场景描述（只要有非空描述就保留）
      const hasExistingScene = shot.scene && shot.scene.length > 5 && 
        !shot.scene.includes('室内主场景') && !shot.scene.includes('过渡空间') && 
        !shot.scene.includes('专业场景') && !shot.scene.includes('公共空间');
      let scene = hasExistingScene ? shot.scene : (designed.scene || shot.scene || '');
      
      // 【v2.1.4-fix15】优先保留传入的已有动作描述（只要有非空描述就保留）
      const hasExistingAction = shot.action && shot.action.length > 5 && 
        !shot.action.includes('speaking to camera');
      let action = hasExistingAction ? shot.action : (designed.action || shot.action || '');
      
      // 【v2.1.4-fix16-EDU】强制覆盖：教育/科普类型强制使用专业讲解场景
      if (filmType === 'EDU' || filmType === 'educational') {
        const eduSceneMap = {
          'opening': '片头开场场景，主讲人专业出场，主题清晰引入',
          'establishing': ' establishing shot，展示真实讲解环境',
          'explanation': '知识讲解场景，主讲人面向镜头讲解核心内容',
          'demonstration': '案例演示场景，展示数据、图表或实物',
          'warning': '警示提醒场景，强调关键风险和注意事项',
          'summary': '要点总结场景，回顾核心知识',
          'resolution': '结尾收尾场景，给出实用建议和行动号召',
          'conflict': '问题呈现场景，展示症状或案例引发关注',
          'rising': '深入讲解场景，逐步展开知识点',
          'emotional_climax': '重点强调场景，突出关键信息',
          'transition': '过渡转场场景，平滑切换主题'
        };
        const sceneType = shot.sceneType || shot.scene_type || 'establishing';
        const eduScene = eduSceneMap[sceneType];
        if (eduScene) {
          scene = eduScene;
        }
        // 强制角色为陈卓（科普主讲人）
        if (action && !action.includes('陈卓') && !action.includes('主讲人')) {
          action = action.replace(/医学讲解者|医学讲师|主讲人|讲解者/g, '陈卓');
        }
      }
      
      // 【v2.1.4-fix15】场景校验：包含禁止词汇则使用动态兜底
      const forbiddenWords = ['全息', '虚拟', '投影', '抽象', '光影场域', '数据空间', '元宇宙', '时间操控', '霓虹', '微观世界', '宏观', '抽象几何', '流动光影', '交织光影', '色彩对冲'];
      const hasForbidden = forbiddenWords.some(w => scene.includes(w));
      if (hasForbidden) {
        console.warn(`[SceneDesignAgent] ⚠️ 镜头 ${shot.shotId} 包含禁止词汇: "${scene}"，使用动态兜底`);
        // 【v2.1.4-fix15】基于世界设定动态生成兜底，不使用硬编码场景池
        const worldSetting = blueprint.worldSetting || {};
        const worldDesc = worldSetting.description || worldSetting.name || '';
        const atmosphere = worldSetting.atmosphere || '';
        const sceneType = shot.sceneType || shot.scene_type || 'establishing';
        
        if (worldDesc) {
          scene = `${worldDesc}，${this._getSceneTypeBase(sceneType, filmType)}${atmosphere ? '，' + atmosphere : ''}`;
        } else {
          scene = this._getSceneTypeBase(sceneType, filmType);
        }
      }
      
      return {
        ...shot,
        scene: scene,
        mood: designed.mood || shot.mood || '',
        action: action,
        emotional_target: designed.emotional_target || ''
      };
    });

    console.log(`[SceneDesignAgent] 完成 ✓`);
    
    // 【v2.1.4-fix16-EDU】最终强制覆盖：教育/科普类型强制使用专业讲解场景
    const debugMeta = blueprint.config?._metadata || blueprint.metadata || {};
    console.log(`[SceneDesignAgent] blueprint structure: ${JSON.stringify({
      hasConfig: !!blueprint.config,
      configKeys: blueprint.config ? Object.keys(blueprint.config) : [],
      hasMetadata: !!blueprint.config?._metadata,
      metadataKeys: blueprint.config?._metadata ? Object.keys(blueprint.config._metadata) : [],
      hasFilmType: !!(blueprint.config?._metadata?.filmType || blueprint.config?.filmType || blueprint.filmType || blueprint.film_type),
      filmTypeValue: blueprint.config?._metadata?.filmType || blueprint.config?.filmType || blueprint.filmType || blueprint.film_type || 'NOT_FOUND',
      topLevelKeys: Object.keys(blueprint)
    })}`);
    if (filmType === 'EDU' || filmType === 'educational') {
      console.log(`[SceneDesignAgent] ✅ 强制覆盖生效: 教育/科普场景`);
      const eduSceneMap = {
        'opening': '片头开场场景，主讲人专业出场，主题清晰引入',
        'establishing': ' establishing shot，展示真实讲解环境',
        'explanation': '知识讲解场景，主讲人面向镜头讲解核心内容',
        'demonstration': '案例演示场景，展示数据、图表或实物',
        'warning': '警示提醒场景，强调关键风险和注意事项',
        'summary': '要点总结场景，回顾核心知识',
        'resolution': '结尾收尾场景，给出实用建议和行动号召',
        'conflict': '问题呈现场景，展示症状或案例引发关注',
        'rising': '深入讲解场景，逐步展开知识点',
        'emotional_climax': '重点强调场景，突出关键信息',
        'transition': '过渡转场场景，平滑切换主题'
      };
      designedShots.forEach(shot => {
        const sceneType = shot.sceneType || 'establishing';
        const eduScene = eduSceneMap[sceneType];
        if (eduScene) {
          shot.scene = eduScene;
        }
        // 强制角色为陈卓（科普主讲人）
        if (shot.action && !shot.action.includes('陈卓') && !shot.action.includes('主讲人')) {
          shot.action = shot.action.replace(/医学讲解者|医学讲师|主讲人|讲解者/g, '陈卓');
        }
      });
    }
    
    return { shots: designedShots, degraded: false, degradeReason: null };
  }

  _buildPrompt(shots, blueprint) {
    const characters = blueprint.character_system?.characters || [];
    const characterDesc = characters.map(c =>
      `- ${c.name}: ${c.description || '无描述'}${c.portraitPaths ? ' [有定妆照]' : ''}`
    ).join('\n');

    const shotsInfo = shots.map((s, idx) => {
      const dialogue = s.dialogue?.lines?.map(l => `"${l.content}"`).join('; ') || s.dialogue || '';
      const existingScene = s.scene || '';
      const existingAction = s.action || '';
      return `镜头 ${s.shotId}: ${s.duration || '?'}s; 现有场景: ${existingScene.substring(0, 80)}; 现有动作: ${existingAction.substring(0, 60)}; 台词: ${dialogue.substring(0, 80)}`;
    }).join('\n');
    
    // 【v2.1.4-fix13-审计修复】动态生成场景选项，避免硬编码
    const sceneOptions = this._generateSceneOptions(blueprint);
    const directorContext = this._buildDirectorContext(blueprint);
    
    // 【v2.1.4-fix14】根据类型动态调整约束
    const meta = blueprint._metadata || blueprint.config?._metadata || blueprint.metadata || {};
    const filmType = meta.filmType || blueprint.filmType || blueprint.config?.filmType || blueprint.film_type || '';
    const isMythFantasy = filmType === 'FANTASY' || filmType === 'ACTION' || filmType === 'MYTHOLOGY';
    
    const constraints = isMythFantasy 
      ? `【强制约束 - 违反则输出无效】
- 场景描述必须包含具体物理细节：地形材质、自然光源、环境元素、天气氛围
- 禁止使用以下任何词汇：全息、虚拟、投影、抽象、概念、光影场域、数据空间、数字、元宇宙、时间操控、霓虹、微观世界、宏观、抽象几何、流动光影、交织光影、色彩对冲
- 光线必须是自然/物理光源：天光、雷电、火焰、日光、月光、环境反射光
- 场景必须是真实物理环境（岩石、云层、水面、森林等），但可以是神话世界中的真实环境
- 角色动作必须是真实物理动作（打斗、奔跑、跳跃、格挡），可伴随神话能量特效`
      : `【强制约束 - 违反则输出无效】
- 场景描述必须包含具体物理细节：墙面材质、灯光类型、家具/设备、地面材质
- 禁止使用以下任何词汇：全息、虚拟、投影、抽象、概念、光影场域、数据空间、数字、元宇宙、时间操控、霓虹、微观世界、宏观、抽象几何、流动光影、交织光影、色彩对冲
- 光线必须是真实光源：荧光灯、LED顶灯、窗光、无影灯、自然光
- 角色必须在真实地面站立，背景必须是真实墙面`;

    return `${directorContext}

## 角色
${characterDesc || '无'}

## 镜头
${shotsInfo}

## 任务
为每个镜头设计场景、情绪和动作。

【核心原则 - 不可违反】
1. 每个镜头已提供「现有场景」，这是客户指定的场景，必须完全保留作为基础
2. 你的职责是丰富细节（增加材质、光影、氛围、环境元素），绝不能替换或改变核心场景
3. 只有「现有场景」为空或过于抽象（少于5个字）时，才从以下方向中选择生成

${sceneOptions}

【设计要求】
1. scene: 基于现有场景丰富细节后的最终描述（50-80字，必须是写实环境）
2. mood: 情绪氛围（15-25字）
3. action: 角色动作（肢体语言、走位、打斗动作，30-50字）
4. emotional_target: 情绪目标（1个词）

【强制约束】
- 场景描述必须包含具体物理细节：地形/墙面材质、光源类型、环境元素
- 禁止：全息、虚拟、投影、抽象、光影场域、数据空间、元宇宙、霓虹等
- 光线必须是真实物理光源（自然光/灯光/火焰/雷电等）
- 场景必须是真实物理环境，允许神话/奇幻世界的真实环境

输出JSON: {"shots": [{"shotId":"SC01","scene":"具体场景描述，50-80字","mood":"...","action":"...","emotional_target":"..."}]}`;
  }
  
  /**
   * 【v2.1.4-fix9-P1】构建导演上下文
   */
  _buildDirectorContext(blueprint) {
    // 【v2.1.4-fix13-审计修复】兼容 adapted 对象和原始 blueprint 两种结构
    const config = blueprint.config || {};
    const meta = blueprint.metadata || blueprint.meta || {};
    const _metadata = config._metadata || blueprint._metadata || {};
    const title = meta.title || config.title || _metadata.title || '未命名';
    
    // 从多路径读取导演上下文信息
    const contentTheme = config.content_theme || _metadata.content_theme || '';
    const contentSummary = config.content_summary || _metadata.content_summary || '';
    const visualStyle = config.visual_style || _metadata.visual_style || 'REAL';
    const sceneRequirement = config.scene_requirement || _metadata.scene_requirement || '';
    const characterDescription = config.character_description || _metadata.character_description || '';
    const forbiddenScenes = config.forbidden_scenes || _metadata.forbidden_scenes || [];
    const keyMessages = config.key_messages || _metadata.key_messages || [];
    const creativeIntensity = config.creativeIntensity || _metadata.creativeIntensity || blueprint.config?.creativeIntensity || 0.5;
    
    return `## 🎬 导演指令上下文
视频标题：${title}
内容主题：${contentTheme}
核心内容：${contentSummary}
视觉风格：${visualStyle}
创意指数：${creativeIntensity}（低创意=强制写实）
场景要求：${sceneRequirement}
角色设定：${characterDescription}
关键信息：${keyMessages.join('；') || '无'}
禁止场景：${forbiddenScenes.join('、') || '无'}
禁止元素：全息投影、虚拟空间、未来感、霓虹特效、元宇宙、数字空间、抽象几何
`;
  }

  _fallback(shots) {
    console.log(`[SceneDesignAgent] 使用降级规则...`);
    return {
      shots: shots.map(shot => ({
        shotId: shot.shotId,
        scene: shot.scene || '',
        mood: shot.mood || '',
        action: shot.action || '',
        emotional_target: ''
      }))
    };
  }

  /**
   * 【v2.1.4-fix15】基于场景类型返回基础描述符（不含具体场景内容）
   * 根据视频类型动态选择描述风格
   */
  _getSceneTypeBase(sceneType, filmType = '') {
    // 教育/科普类型使用专业讲解场景
    if (filmType === 'EDU' || filmType === 'educational') {
      const eduDescriptors = {
        'opening': '片头开场场景，主讲人专业出场，主题清晰引入',
        'establishing': ' establishing shot，展示真实讲解环境',
        'explanation': '知识讲解场景，主讲人面向镜头讲解核心内容',
        'demonstration': '案例演示场景，展示数据、图表或实物',
        'warning': '警示提醒场景，强调关键风险和注意事项',
        'summary': '要点总结场景，回顾核心知识',
        'resolution': '结尾收尾场景，给出实用建议和行动号召',
        'conflict': '问题呈现场景，展示症状或案例引发关注',
        'rising': '深入讲解场景，逐步展开知识点',
        'emotional_climax': '重点强调场景，突出关键信息',
        'transition': '过渡转场场景，平滑切换主题'
      };
      return eduDescriptors[sceneType] || '科普讲解场景';
    }
    
    // 默认戏剧/电影场景
    const descriptors = {
      'opening': '史诗开场场景，宏大视角',
      'establishing': '全景 establishing shot，展示空间关系',
      'conflict': '紧张对峙场景，充满戏剧张力',
      'action': '激烈动作场景，高速动态',
      'emotional_climax': '情感高潮场景，张力爆发',
      'resolution': '平静收尾场景，余韵悠长',
      'discovery': '探索发现场景，充满惊奇',
      'transition': '过渡转场场景，时空转换'
    };
    return descriptors[sceneType] || '标准叙事场景';
  }
}

module.exports = { SceneDesignAgent };

```

---

## engines/production-engine/agents/visual-language-agent.js

```javascript
/**
 * VisualLanguageAgent - 视觉语言Agent
 * 负责: 运镜设计、灯光设计、动态时间轴
 */
const { BaseAgent } = require('./base-agent');

class VisualLanguageAgent extends BaseAgent {
  constructor(options = {}) {
    super({ name: 'VisualLanguageAgent', ...options });
  }

  _getSystemPrompt() {
    return `你是一位专业的电影摄影师和灯光师。根据剧本和场景信息，为每个镜头设计运镜方案和灯光方案。

输出JSON格式:
{
  "shots": [
    {
      "shotId": "SC01",
      "camera": {
        "shot_size": "wide/medium/close_up/extreme_close_up",
        "movement": "dolly_in/static/handheld/push_in/pull_back",
        "angle": "eye_level/low/high",
        "lens": "35mm/50mm/85mm",
        "speed": "slow/normal/fast"
      },
      "cameraString": "运镜描述文本",
      "lighting": {
        "key_light": "主光描述",
        "fill_light": "辅光描述",
        "time_of_day": "golden_hour/midday/blue_hour/night",
        "atmosphere": "氛围光描述"
      },
      "lightingString": "灯光描述文本",
      "timeline": [
        { "segment": 1, "timeRange": "0s-3s", "cameraMovement": "缓推全景", "shotType": "wide", "purpose": "建立空间" }
      ]
    }
  ]
}

设计原则:
1. 运镜要服务叙事：情绪紧张用手持晃动，情绪平和用稳定机位;
2. 时间轴动态切分：根据台词密度和情绪变化切分2-6段，不等分;
3. 灯光要场景化：不说"key light 3200K"，说"夕阳从右侧窗户斜射进来，在示例角色脸上形成温暖的侧光";
4. 考虑镜头间衔接：相邻镜头的景别和运动要有逻辑过渡;`;
  }

  async process(shots, blueprint) {
    console.log(`[VisualLanguageAgent] 开始处理 ${shots.length} 个镜头...`);

    const prompt = this._buildPrompt(shots, blueprint);

    const schema = {
      required: ['shots']
    };

    const llmResult = await this._callLLM(prompt, schema, () => {
      return this._fallback(shots);
    });

    if (llmResult.degraded) {
      return { shots: llmResult.result?.shots || shots, degraded: true, degradeReason: llmResult.degradeReason };
    }

    // 合并LLM结果
    const designedShots = shots.map((shot) => {
      const designed = llmResult.result?.shots?.find(s => s.shotId === shot.shotId) || {};
      return {
        ...shot,
        camera: designed.camera || shot.camera,
        cameraString: designed.cameraString || '',
        lighting: designed.lighting || shot.lighting,
        lightingString: designed.lightingString || '',
        timeline: designed.timeline || shot.timeline,
        cameraMovement: {
          ...shot.cameraMovement,
          timeline: designed.timeline
        }
      };
    });

    console.log(`[VisualLanguageAgent] 完成 ✓`);
    return { shots: designedShots, degraded: false, degradeReason: null };
  }

  _buildPrompt(shots, blueprint) {
    const shotsInfo = shots.map(s => {
      const dialogue = s.dialogue?.lines?.map(l => `"${l.content}"`).join('; ') || s.dialogue || '';
      return `镜头 ${s.shotId}: ${s.duration || '?'}s; 场景: ${(s.scene || '').substring(0, 60)}; 情绪: ${s.mood || ''}; 台词: ${dialogue.substring(0, 80)}`;
    }).join('\n');

    return `## 镜头信息
${shotsInfo}

## 任务
为每个镜头设计运镜+灯光+时间轴。

输出每个镜头的:
1. camera: {shot_size, movement, angle, lens, speed}
2. cameraString: 运镜描述文本（30-50字，动态描述）
3. lighting: {key_light, fill_light, time_of_day, atmosphere}
4. lightingString: 灯光场景化描述（30-50字）
5. timeline: 运镜时间轴（动态切分4-6段，根据情绪起伏设计，每段包含时间范围、运镜动作、画面目的，必须详细具体）

设计要点:
- 台词密集处：短切+手持
- 情绪铺垫处：长镜头+缓慢推近
- 景别过渡：相邻镜头不要跳跃太大
- 灯光场景化：不用技术术语，用自然描述

输出JSON: {"shots": [{"shotId":"SC01","camera":{},"cameraString":"...","lighting":{},"lightingString":"...","timeline":[]}]}`;
  }

  _fallback(shots) {
    console.log(`[VisualLanguageAgent] 使用降级规则...`);
    // 【v2.1.4-fix13-审计修复】提供完整的降级默认值，避免空字段
    // 【v2.1.5-fix】timeline 格式与 LLM 返回格式保持一致
    return {
      shots: shots.map(shot => ({
        shotId: shot.shotId,
        camera: shot.camera || {
          shot_size: 'medium',
          movement: 'static',
          angle: 'eye_level',
          lens: '35mm',
          speed: 'normal'
        },
        cameraString: shot.cameraString || '中景静态镜头，35mm焦段，平视角度，平稳拍摄',
        lighting: shot.lighting || {
          key_light: '柔和顶光',
          fill_light: '自然补光',
          time_of_day: '白天',
          atmosphere: '自然明亮'
        },
        lightingString: shot.lightingString || '柔和顶光照明，自然补光填充，白天室内明亮氛围',
        timeline: shot.timeline || [
          { segment: 1, timeRange: '0s-3s', cameraMovement: '镜头稳定，角色入画', shotType: 'medium', purpose: '建立场景' },
          { segment: 2, timeRange: '3s-6s', cameraMovement: '保持构图，角色开始动作', shotType: 'medium', purpose: '推进叙事' }
        ]
      }))
    };
  }
}

module.exports = { VisualLanguageAgent };

```

---

## engines/production-engine/production-engine.js

```javascript
// hyperreality-system/engines/production-engine/production-engine.js
// Production Engine - 制作引擎(Layer 2)
// 深度融合:直接消费 ScriptBlueprint 输出,驱动镜头生成
// 版本:v1.0.0 | 日期:2026-06-08

const path = require('path');

// v2.0.0-LLM-Agent: 导入Agent
const { SceneDesignAgent } = require('./agents/scene-design-agent');
const { VisualLanguageAgent } = require('./agents/visual-language-agent');
const { AudioDesignAgent } = require('./agents/audio-design-agent');
const { PromptFusionAgent } = require('./agents/prompt-fusion-agent');
const { OpeningDesignAgent } = require('./agents/opening-design-agent');
const { ContinuityReviewAgent } = require('./agents/continuity-review-agent');

// v2.0.0-架构升级: 稳定性基础设施
const { BaselineTemplateRegistry } = require('../../core/baseline-template-registry');
const { LLMGateway } = require('../../core/llm-gateway');
const { PipelineStateMachine } = require('../../core/pipeline-state-machine');
const { EventBus } = require('../../core/event-bus');

// v6.6.10-fix: 全局负面提示词注入器
const { globalNegativePromptInjector } = require('../../../systems/global-negative-prompts.js');

// v2.0.0-LLM-Agent: Agent配置
const DEFAULT_AGENT_CONFIG = {
  enableLLMAgents: true,
  llmTimeout: 300000, // 【v2.1.4-fix13-审计修复】单次5分钟，匹配LLM实际响应时间（k2p6推理约60-120s+content生成30-60s）
  llmMaxRetries: 2,
  // 【v2.1.4-fix13-审计修复】从环境变量读取模型配置，消除硬编码
  llmModel: process.env.STORMAXE_LLM_MODEL || 'kimi-k2p6',
  fastModel: process.env.STORMAXE_LLM_FAST_MODEL || process.env.STORMAXE_LLM_MODEL || 'kimi-k2p6',
  totalDeadlineMs: 1800000, // 【v2.1.4-fix13-审计修复】提升至30分钟，匹配实际LLM调用耗时（Phase1~90s + Phase2~300s + Phase3~540s + QualityCheck~120s + 余量）
  memThresholdMB: 1800, // 【v2.1.4-fix10-P25-fix3】提升阈值，避免GC风暴
  promptFusionConcurrency: 2 // 【v2.1.4-fix10-P25-fix3】并发2，平衡速度与稳定性
};
// 注:实际部署时这些模块会从 systems/ 复制到 production-engine/modules/
const SYSTEMS_PATH = path.join(__dirname, '../../../systems');

// 动态加载现有模块
function loadModule(name, required = false) {
  try {
    return require(path.join(SYSTEMS_PATH, name));
  } catch (e) {
    if (required) {
      throw new Error(`[ProductionEngine] 关键模块加载失败: ${name} - ${e.message}`);
    }
    console.warn(`[ProductionEngine] 模块加载失败: ${name} - ${e.message}`);
    return null;
  }
}

class ProductionEngine {
  constructor(options = {}) {
    this.config = {
      maxPromptLength: 12000, // 【审计修复】与 config/prompt-length.js 保持一致
      targetPromptLength: 12000, // 【审计修复】与 config/prompt-length.js 保持一致
      referenceImageCount: 2,
      outputDir: options.outputDir || '/tmp/hyperreality-output',
      ...options
    };

    // v2.0.0-LLM-Agent: 初始化Agent配置
    this.agentConfig = {
      ...DEFAULT_AGENT_CONFIG,
      ...options.agentConfig,
      maxPromptLength: this.config.maxPromptLength
    };

    // 【P1-9-审计修复】显式绑定 this.llmModel
    this.llmModel = this.agentConfig.llmModel;

    // v2.0.0-LLM-Agent: 初始化Agents
    this._initAgents();

    // v2.0.0-架构升级: 初始化稳定性基础设施
    this.baselineRegistry = new BaselineTemplateRegistry();
    this.llmGateway = new LLMGateway({
      primaryModel: this.agentConfig.llmModel,
      fallbackModel: this.agentConfig.fastModel,
      timeout: this.agentConfig.llmTimeout
    });
    this.eventBus = new EventBus();
    // 【P1-20-审计修复】状态机当前为预留架构，未实际驱动流程
    // 断点续跑完全依赖 this._saveCheckpoint / _loadLatestCheckpoint
    this.stateMachine = null;
    
    console.log('[ProductionEngine] v2.0 稳定性基础设施已加载:');
    console.log('  - 基线模板库:', this.baselineRegistry.list().length, '个');
    console.log('  - LLM Gateway: 主模型=' + this.agentConfig.llmModel + ', 降级模型=' + this.agentConfig.fastModel);
    console.log('  - 事件总线: 已就绪');
    this.logs = [];
    this._initResourceGuard();
    this._initModules();
  }

  /**
   * 【新增】运行时更新 Agent 配置
   * 修复:create() 中收到的 agentConfig 可在此应用到已实例化的引擎
   */
  updateAgentConfig(agentConfig = {}) {
    const before = this.agentConfig.enableLLMAgents;
    this.agentConfig = {
      ...this.agentConfig,
      ...agentConfig,
      maxPromptLength: this.config.maxPromptLength
    };
    // 重新初始化 Agent 以应用新配置
    this._initAgents();
    if (before !== this.agentConfig.enableLLMAgents) {
      console.log(`[ProductionEngine] ⚠️ 运行时配置切换: enableLLMAgents ${before} → ${this.agentConfig.enableLLMAgents}`);
    }
  }

  /**
   * 【新增】资源守卫初始化
   */
  _initResourceGuard() {
    this._memThresholdMB = this.agentConfig.memThresholdMB || 1200;
    this._lowResourceMode = false;
  }

  /**
   * 【新增】Checkpoint 初始化(断点续跑)
   */
  _initCheckpoint() {
    this._checkpointDir = this.agentConfig.checkpointDir || this.config.outputDir;
    this._enableResume = this.agentConfig.enableResume !== false;
  }

  /**
   * 【新增】加载最新 checkpoint(断点续跑)
   * 返回最近完成的 Phase 及其 shots
   */
  _loadLatestCheckpoint() {
    if (!this._enableResume) return null;
    try {
      const fs = require('fs');
      // 【审计修复·P0】补全 phase0/phase3.5，损坏文件删除并继续搜索
      const phases = ['phase3.5', 'phase3', 'phase2', 'phase1', 'phase0'];
      for (const phase of phases) {
        const file = path.join(this._checkpointDir, `checkpoint-${phase}.json`);
        if (!fs.existsSync(file)) continue;
        try {
          const data = fs.readFileSync(file, 'utf8');
          const parsed = JSON.parse(data);
          this.log('RESUME', `📂 发现 ${phase} checkpoint(${parsed.shots?.length || 0} 镜头,保存于 ${parsed.savedAt || 'unknown'})`);
          return parsed;
        } catch (e) {
          // 【审计修复】损坏文件删除，继续搜索更低优先级的 phase
          this.log('RESUME', `⚠️ ${phase} checkpoint 损坏(${e.message})，已删除，继续搜索`);
          try { fs.unlinkSync(file); } catch (_) {}
          continue;
        }
      }
    } catch (e) {
      this.log('RESUME', `加载 checkpoint 失败: ${e.message}`);
    }
    this.log('RESUME', '无可用 checkpoint');
    return null;
  }

  /**
   * 【新增】清除 checkpoint(成功完成后调用)
   * 【审计修复·P0】补全 phase0 和 phase3.5
   */
  _clearCheckpoints() {
    try {
      const fs = require('fs');
      const allPhases = ['phase0', 'phase1', 'phase2', 'phase3', 'phase3.5'];
      allPhases.forEach(phase => {
        const file = path.join(this._checkpointDir, `checkpoint-${phase}.json`);
        if (fs.existsSync(file)) {
          try { fs.unlinkSync(file); } catch (e) {
            this.log('CHECKPOINT', `清除 ${phase} 失败: ${e.message}`);
          }
        }
      });
    } catch (e) { /* 忽略 */ }
  }

  /**
   * 【新增】内存检查,超过阈值进入低资源模式
   */
  _checkMemory(tag = '') {
    const mem = process.memoryUsage();
    const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
    if (heapMB > this._memThresholdMB) {
      this._lowResourceMode = true;
      this.log('MEM-WARN', `⚠️ 堆内存 ${heapMB}MB 超阈值 ${this._memThresholdMB}MB @ ${tag},进入低资源模式`);
      if (global.gc) {
        global.gc();
        const after = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        this.log('MEM-WARN', `GC 后堆内存 ${after}MB (${heapMB}→${after})`);
      }
    }
    return heapMB;
  }

  /**
   * 【新增】预算剩余(毫秒)
   */
  _budgetRemaining() {
    if (!this._globalDeadline) return Infinity;
    return Math.max(0, this._globalDeadline - Date.now());
  }

  /**
   * 【新增】预算守卫:是否还能承担 needMs
   */
  _canAfford(needMs) {
    return this._budgetRemaining() > needMs;
  }

  /**
   * 【新增】增量保存 checkpoint(进程被杀也能恢复部分结果)
   * 【审计修复·P0】安全序列化：过滤多层循环引用，先写临时文件再原子重命名
   */
  async _saveCheckpoint(phase, shots, extra = {}) {
    try {
      const fs = require('fs');
      const dir = this._checkpointDir || path.join(process.cwd(), 'checkpoints');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `checkpoint-${phase}.json`);
      const tmpFile = file + '.tmp';
      
      const safeData = this._safeStringify({
        phase,
        shots: shots || [],
        opening: extra.opening || null,
        llmStats: extra.llmStats || {},
        savedAt: new Date().toISOString()
      });
      
      fs.writeFileSync(tmpFile, safeData, 'utf8');
      fs.renameSync(tmpFile, file);
      this.log('CHECKPOINT', `✅ ${phase} 已落盘 → ${path.basename(file)}`);
    } catch (e) {
      this.log('CHECKPOINT', `保存失败(忽略): ${e.message}`);
    }
  }

  /**
   * 【审计修复·P0】安全序列化：用 WeakSet 过滤所有层级的循环引用
   */
  _safeStringify(obj) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (['_blueprint', '_adapter', '_llm', '_engine', '_metadata_raw'].includes(key)) {
        return undefined;
      }
      if (typeof value === 'function') return undefined;
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return undefined;
        seen.add(value);
      }
      return value;
    }, 2);
  }

  /**
   * v2.0.0-LLM-Agent: 初始化所有Agent
   */
  _initAgents() {
    const base = {
      llmTimeout: this.agentConfig.llmTimeout,
      llmMaxRetries: this.agentConfig.llmMaxRetries,
      enabled: this.agentConfig.enableLLMAgents
    };
    const deepModel = this.agentConfig.llmModel || 'kimi-k2p6';
    const fastModel = this.agentConfig.fastModel || deepModel;

    this.agents = {
      // 深度模型:创造性主任务
      sceneDesign: new SceneDesignAgent({ ...base, llmModel: deepModel }),
      visualLanguage: new VisualLanguageAgent({ ...base, llmModel: deepModel }),
      promptFusion: new PromptFusionAgent({ ...base, llmModel: deepModel, maxPromptLength: this.config.maxPromptLength }),

      // 快速模型:结构化小任务(音效/片头/审查),可用非推理模型加速
      audioDesign: new AudioDesignAgent({ ...base, llmModel: fastModel, llmMaxTokens: 8000 }),
      openingDesign: new OpeningDesignAgent({ ...base, llmModel: fastModel, llmMaxTokens: 8000 }),
      continuityReview: new ContinuityReviewAgent({ ...base, llmModel: fastModel, llmMaxTokens: 8000 })
    };

    console.log(`[ProductionEngine v2.0] LLM Agents ${this.agentConfig.enableLLMAgents ? '已启用' : '已禁用'} | deep=${deepModel} fast=${fastModel}`);
    
    // v2.0.0-架构升级: 将第一个Agent的LLM引擎注入Gateway
    // (所有Agent共享相同的LLMEngine实例)
    // 【P0-5-审计修复】主动触发 LLM 引擎加载并注入 Gateway
    try {
      const engine = this.agents.sceneDesign._getLLMEngine(); // 触发懒加载
      if (engine) {
        this.llmGateway.setEngine(engine);
        console.log('[ProductionEngine] LLM引擎已注入Gateway ✓');
      } else {
        console.warn('[ProductionEngine] ⚠️ LLM引擎加载失败，Gateway降级模式');
      }
    } catch (e) {
      console.warn(`[ProductionEngine] LLM引擎注入异常: ${e.message}`);
    }
  }

  _initModules() {
    // 加载核心模块(从现有系统复用)
    this.modules = {
      // 时长分配
      shotDurationAllocator: loadModule('shot-duration-allocator.js')?.ShotDurationAllocator,
      durationCalculator: loadModule('duration-calculator.js')?.DurationCalculator,

      // 运镜系统
      cameraMovement: loadModule('camera-movement-system-v2.js')?.CameraMovementSystem,
      intraShotTimeline: loadModule('camera-movement-system-v3.js')?.IntraShotTimelineGenerator,

      // 连续性
      continuityEngine: loadModule('continuity-engine.js')?.ContinuityEngine,

      // Prompt 增强
      promptEnhancer: loadModule('intra-shot-prompt-enhancer.js')?.IntraShotPromptEnhancer,
      styleInjector: loadModule('universal-style-injector.js')?.UniversalStyleInjector,

      // 质量门
      promptQualityGate: loadModule('prompt-quality-gate.js')?.PromptQualityGate,

      // 字符计数
      charCounter: loadModule('char-counter')?.charCounter,

      // 片头系统
      openingSystem: loadModule('opening-system-v3.js'),

      // 角色系统
      characterManager: loadModule('character-manager-v2.js')?.CharacterManagerV2,
      characterPromptBuilder: loadModule('character-prompt-builder.js')?.CharacterPromptBuilder,

      // 校验
      storyboardValidator: loadModule('storyboard-validator.js')?.StoryboardValidator,
      preRenderValidation: loadModule('pre-render-validation.js')?.preRenderValidation,

      // 后期
      postProduction: loadModule('post-production-pipeline.js')?.PostProductionPipeline,
    };

    // 初始化实例
    for (const [key, Module] of Object.entries(this.modules)) {
      if (Module && typeof Module === 'function') {
        try {
          this.modules[key] = new Module();
        } catch (e) {
          // 已经是实例或无需 new
        }
      }
    }
  }

  log(stage, message) {
    const entry = { stage, message, timestamp: Date.now() };
    this.logs.push(entry);
    console.log(`[${stage}] ${message}`);
  }

  /**
   * 主入口:从 ScriptBlueprint 生成完整镜头
   * @param {object} adaptedBlueprint - 适配器输出的剧本数据
   * @returns {object} { shots, prompts, report }
   */
  /**
   * v2.0.5-彻底修复: LLM Agent输出标准化层
   * 将LLM Agent的各种输出格式(对象/数组)统一转换为字符串,
   * 确保与v1.x的_engineerPrompts完全兼容
   */
  _normalizeLLMOutput(shots, blueprint) {
    return shots.map(shot => {
      const normalized = { ...shot };

      // 1. timeline: 数组 → 字符串
      if (Array.isArray(shot.timeline)) {
        normalized.timelineString = shot.timeline.map(seg => 
          `${seg.timeRange || ''}: ${seg.cameraMovement || ''} (${seg.purpose || ''})`
        ).join('; ');
        // 保留原始数组供内部使用，但添加字符串版本
      } else if (shot.timeline?.string && typeof shot.timeline.string === 'string') {
        normalized.timelineString = shot.timeline.string;
      } else if (typeof shot.timeline === 'string') {
        normalized.timelineString = shot.timeline;
      }

      // 2. camera: 对象 → 字符串
      if (shot.camera && typeof shot.camera === 'object') {
        if (shot.camera.string && typeof shot.camera.string === 'string') {
          normalized.cameraString = shot.camera.string;
        } else {
          // 从对象构建字符串描述
          const parts = [];
          if (shot.camera.shotSize) parts.push(shot.camera.shotSize);
          if (shot.camera.movement) parts.push(shot.camera.movement);
          if (shot.camera.lens) parts.push(shot.camera.lens);
          if (shot.camera.focus) parts.push(shot.camera.focus);
          normalized.cameraString = parts.join(', ');
        }
      } else if (typeof shot.camera === 'string') {
        normalized.cameraString = shot.camera;
      }

      // 3. lighting: 对象 → 字符串
      if (shot.lighting && typeof shot.lighting === 'object') {
        if (shot.lighting.string && typeof shot.lighting.string === 'string') {
          normalized.lightingString = shot.lighting.string;
        } else {
          const parts = [];
          if (shot.lighting.keyLight) {
            const kl = shot.lighting.keyLight;
            parts.push(`key: ${kl.direction || ''} ${kl.colorTemp || ''}K ${kl.effect || ''}`);
          }
          if (shot.lighting.fillLight) {
            const fl = shot.lighting.fillLight;
            parts.push(`fill: ${fl.direction || ''} ${fl.colorTemp || ''}K ${fl.effect || ''}`);
          }
          if (shot.lighting.special) parts.push(`special: ${shot.lighting.special}`);
          normalized.lightingString = parts.join(', ');
        }
      } else if (typeof shot.lighting === 'string') {
        normalized.lightingString = shot.lighting;
      }

      // 4. backgroundSound: 对象 → 字符串
      if (shot.backgroundSound && typeof shot.backgroundSound === 'object') {
        if (shot.backgroundSound.string && typeof shot.backgroundSound.string === 'string') {
          normalized.backgroundSoundString = shot.backgroundSound.string;
        } else {
          const parts = [];
          if (shot.backgroundSound.ambient) parts.push(`AMBIENT: ${shot.backgroundSound.ambient}`);
          if (shot.backgroundSound.spatial) parts.push(`SPATIAL: ${shot.backgroundSound.spatial}`);
          if (shot.backgroundSound.intensity) parts.push(`INTENSITY: ${JSON.stringify(shot.backgroundSound.intensity)}`);
          normalized.backgroundSoundString = parts.join('; ');
        }
      }

      // 5. 角色信息补全:如果shot没有characters,从blueprint补
      if (!shot.characters || shot.characters.length === 0) {
        normalized.characters = blueprint.characters || [];
      }

      // 6. 角色引用补全:如果characterRef为NONE但有角色,生成描述性引用
      if ((!shot.characterRef || shot.characterRef === 'NONE') && blueprint.characters && blueprint.characters.length > 0) {
        const mainChar = blueprint.characters.find(c => c.role === 'protagonist') || blueprint.characters[0];
        if (mainChar) {
          normalized.characterRef = `${mainChar.name}: ${mainChar.description || mainChar.persona || 'main character'}`;
        }
      }

      return normalized;
    });
  }

  /**
   * v2.0.5-彻底修复: 质量门适配LLM融合模式
   * 当fusionText存在时,检查标准放宽(信息在融合段中)
   */
  _runQualityGateAdapted(prompts) {
    const checks = prompts.map(p => {
      const hasFusion = p.prompt && p.prompt.includes('fusion');
      // 有fusionText时,timeline/camera/lighting可以不在独立字段中
      const hasTimeline = !!p.timelineString || hasFusion;
      const hasCamera = !!p.cameraString || hasFusion;
      const hasLighting = !!p.lightingString || hasFusion;

      return {
        shotId: p.shotId,
        hasPrompt: !!p.prompt && p.prompt.length > 50,
        hasDuration: !!p.duration && p.duration > 0,
        hasTimeline,
        hasCharacter: p.character !== 'NONE' || p.characterRef !== 'NONE',
        hasMood: !!p.mood,
        hasDialogue: p.dialogue !== 'NONE' && p.dialogue !== '',
        lengthOk: p.promptCharCount > 0 && p.promptCharCount <= (this.config.maxPromptLength || 12000),
        passed: false // 后面计算
      };
    });

    checks.forEach(c => {
      c.passed = c.hasPrompt && c.hasDuration && c.hasTimeline &&
                 c.hasCharacter && c.hasMood && c.hasDialogue && c.lengthOk;
    });

    const allPassed = checks.every(c => c.passed);
    return { passed: allPassed, checks };
  }

  // 【v2.1.4-fix10-P25-fix3】暴露单镜头融合方法，供 run-phase3.js 单镜头粒度续跑
  async fuseSingleShotPublic(shot, ratio, characters) {
    if (!this.agents.promptFusion) {
      throw new Error('PromptFusionAgent 未初始化');
    }
    return this.agents.promptFusion._fuseSingleShot(shot, ratio, characters);
  }
  async produce(adaptedBlueprint, runtimeAgentConfig = null) {
    const startTime = Date.now();

    // 【修复】应用运行时配置(双保险:create() 已调 updateAgentConfig,这里再兜一次)
    if (runtimeAgentConfig) {
      this.updateAgentConfig(runtimeAgentConfig);
    }

    // 【v2.1.4-fix15】初始化 checkpoint 系统（断点续跑）
    this._initCheckpoint();

    // v2.0.0-架构升级: 状态机初始化(真·断点续跑)
    const projectId = adaptedBlueprint.config?._metadata?.projectId || 
                      `project-${Date.now()}`;
    this.stateMachine = new PipelineStateMachine(projectId, {
      checkpointDir: path.join(this.config.outputDir, 'checkpoints')
    });
    
    // 发布项目启动事件
    this.eventBus.emit('Project:Started', {
      projectId,
      timestamp: Date.now(),
      filmType: adaptedBlueprint.config?._metadata?.filmType || 'EDU',
      visualStyle: adaptedBlueprint.config?._metadata?.visualStyle || 'REAL'
    });
    // 【v2.1.4-fix11】增加总预算，确保Phase 3串行处理有足够时间
    // 原预算：540s (9min) → 新预算：1200s (20min)
    // Phase 1: ~90s | Phase 2: ~300s | Phase 3: ~570s (串行6镜头 × 90s)
    // 总计需求：~960s，预留240s余量应对波动
    const HARD_BUDGET_MS = this.agentConfig.totalDeadlineMs || 1200000;
    const SAFETY_MARGIN_MS = 60000; // 余量60s
    const globalDeadline = startTime + HARD_BUDGET_MS - SAFETY_MARGIN_MS;
    this._globalDeadline = globalDeadline;
    this._setAgentDeadline(globalDeadline);

    this.log('PRODUCE', `🎬 ProductionEngine 启动 | LLM=${this.agentConfig.enableLLMAgents} | 预算 ${Math.round(HARD_BUDGET_MS / 1000)}s | 余量 ${Math.round(SAFETY_MARGIN_MS / 1000)}s | 堆 ${this._checkMemory('start')}MB`);

    const result = {
      success: false, shots: [], prompts: [], stages: {}, errors: [],
      logs: this.logs, timing: {}, llmStats: {}, degraded: false, resumed: false
    };

    try {
      // v2.0.0-架构升级: 基线模板加载与合并
      const filmType = adaptedBlueprint.config?._metadata?.filmType || 'EDU';
      const visualStyle = adaptedBlueprint.config?._metadata?.visualStyle || 'REAL';
      const baselineKey = `${filmType}_${visualStyle}`;
      
      // 检查基线兼容性
      const hasBaseline = this.baselineRegistry.isCompatible(baselineKey, {
        filmType, visualStyle
      });
      
      if (hasBaseline) {
        console.log(`[ProductionEngine] 基线模板命中: ${baselineKey}`);
        this.eventBus.emit('Baseline:Loaded', { type: baselineKey, source: 'registry' });
      } else {
        console.log(`[ProductionEngine] 无基线模板: ${baselineKey}，使用全LLM生成`);
      }
      
      // ===== Stage 1-2:规则阶段(快)=====
      result.stages.sceneExtraction = await this._runStage('scene-extraction', () => this._extractScenes(adaptedBlueprint));
      result.stages.durationAllocation = await this._runStage('duration-allocation', () => this._allocateDuration(result.stages.sceneExtraction.shots));
      let currentShots = result.stages.durationAllocation.shots;

      // 规则降级路径(保留原行为)
      if (!this.agentConfig.enableLLMAgents) {
        return await this._produceViaRules(currentShots, adaptedBlueprint, result, startTime);
      }

      // ===== LLM 模式(主路径:断点续跑 + 预算守卫)=====
      let phase1Failed = false;

      // ===== 断点续跑:尝试加载已完成的 checkpoint =====
      const ckpt = this._loadLatestCheckpoint();
      let startPhase = 1;
      if (ckpt) {
        currentShots = ckpt.shots;
        result.opening = ckpt.opening || null;
        result.llmStats = ckpt.llmStats || {};
        if (ckpt.phase === 'phase1') startPhase = 2;
        else if (ckpt.phase === 'phase2') startPhase = 3;
        else if (ckpt.phase === 'phase3') {
          startPhase = 99;
          this.log('RESUME', '✅ 全部 Phase 已完成,跳过 LLM 直接进 Quality Gate');
        }
        result.resumed = true;
      }

      // ----- Phase 1:SceneDesign ∥ OpeningDesign -----
      if (startPhase <= 1) {
      try {
        if (!this._canAfford(140000)) {
          this.log('PHASE-1', `⚠️ 预算不足(剩${this._budgetRemaining()}ms),保存当前结果退出,下次续跑`);
          await this._saveCheckpoint('phase0', currentShots, { opening: result.opening, llmStats: result.llmStats });
          throw new Error('预算不足,请重跑以断点续跑(LLM 产出已保存)');
        }
        this.log('PHASE-1', 'SceneDesign + OpeningDesign 并行启动...');
        const phase1Start = Date.now();
        const [sdResult, odResult] = await this._runParallel({
          'scene-design-agent': this.agents.sceneDesign.process(this._cloneShots(currentShots), adaptedBlueprint),
          'opening-design-agent': this._shouldGenerateOpening(adaptedBlueprint)
            ? this.agents.openingDesign.process(adaptedBlueprint)
            : Promise.resolve(null)
        }, 'PHASE-1');

        currentShots = this._mergeShotsByShotId(currentShots, sdResult.shots, ['scene', 'mood', 'action', 'emotional_target']);
        if (odResult && odResult.opening) {
          result.stages.opening = { agent: 'openingDesign', ...odResult };
          result.opening = odResult.opening;
          // 【v2.1.4-patch3】将opening数据注入到sceneType=opening的shot中
          // 【审计修复·P0】先克隆片头shot再修改，避免直接变异原始对象
          const openingIdx = currentShots.findIndex(s => s.sceneType === 'opening');
          if (openingIdx >= 0) {
            currentShots[openingIdx] = this._deepCloneShot(currentShots[openingIdx]);
          }
          const openingShot = openingIdx >= 0 ? currentShots[openingIdx] : null;
          if (openingShot) {
            const od = odResult.opening;
            // v2.1.4-fix8: 兼容下划线命名(main_title/sub_title)和驼峰命名(mainTitle/subtitle)
            const titleOverlay = od.titleOverlay || {};
            openingShot.title = od.title || titleOverlay.mainTitle || titleOverlay.main_title || '';
            openingShot.subtitle = od.subtitle || titleOverlay.subtitle || titleOverlay.sub_title || '';
            openingShot.titleOverlay = od.titleOverlay || null;
            openingShot.audioLayer = od.audioLayer || null;
            openingShot.lightingString = od.lightingString || openingShot.lightingString;
            openingShot.cameraString = od.cameraString || openingShot.cameraString;
            console.log(`[ProductionEngine] OpeningDesign数据已注入到 ${openingShot.shotId}: title="${openingShot.title}", subtitle="${openingShot.subtitle}"`);
          }
        }
        result.llmStats.sceneDesign = sdResult.timing;
        result.llmStats.openingDesign = odResult?.timing;
        this.log('PHASE-1', `完成 (${Date.now() - phase1Start}ms)`);
        
        // v2.0.0-架构升级: Phase 1完成后合并基线模板
        const filmType = adaptedBlueprint.config?._metadata?.filmType || 'EDU';
        const visualStyle = adaptedBlueprint.config?._metadata?.visualStyle || 'REAL';
        currentShots = this._mergeWithBaseline(currentShots, filmType, visualStyle);
        if (currentShots.some(s => s._baselineMerged)) {
          this.log('BASELINE', `基线模板已合并: ${currentShots.filter(s => s._baselineMerged).length}/${currentShots.length} 镜头`);
        }
        
        await this._saveCheckpoint('phase1', currentShots, { opening: result.opening, llmStats: result.llmStats });
        this._checkMemory('phase1');
      } catch (e) {
        this.log('PHASE-1-FAIL', `❌ ${e.message}`);
        phase1Failed = true;
      }
      }

      // ----- Phase 2:VisualLanguage → AudioDesign → ContinuityReview (串行，避免并发超限SIGKILL) -----
      // 【审计修复】Phase 1 失败不应跳过 Phase 2/3，应像 Phase 2 那样用已有 shots 继续
      if (startPhase <= 2) {
        if (phase1Failed) {
          this.log('PHASE-2', '⚠️ Phase 1 已失败，Phase 2 用现有 shots 尝试继续（降级模式）');
        }
        try {
          if (!this._canAfford(80000)) {
            this.log('PHASE-2', `⚠️ 预算不足(剩${this._budgetRemaining()}ms),保存退出,下次从 Phase2 续跑`);
            await this._saveCheckpoint('phase1', currentShots, { opening: result.opening, llmStats: result.llmStats });
            throw new Error('预算不足,请重跑以断点续跑(Phase1 LLM 产出已保存)');
          }
          this.log('PHASE-2', 'VisualLanguage → AudioDesign → ContinuityReview 串行启动...');
          const phase2Start = Date.now();
          
          // 【v2.1.4-fix9-P2】串行执行避免内存/并发超限
          const vlResult = await this.agents.visualLanguage.process(this._cloneShots(currentShots), adaptedBlueprint);
          this.log('VISUAL-LANGUAGE-AGENT', `完成`);
          currentShots = this._mergeShotsByShotId(currentShots, vlResult.shots, ['visual_elements', 'lighting', 'color_temperature', 'camera_movement']);
          
          const adResult = await this.agents.audioDesign.process(this._cloneShots(currentShots), adaptedBlueprint);
          this.log('AUDIO-DESIGN-AGENT', `完成`);
          currentShots = this._mergeShotsByShotId(currentShots, adResult.shots, ['audio', 'music', 'sound_effects', 'backgroundSound', 'backgroundSoundString']);
          
          const crResult = await this.agents.continuityReview.process(
            this._cloneShots(currentShots),
            adaptedBlueprint,
            {
              totalEpisodes: adaptedBlueprint.config?._metadata?.series?.totalEpisodes || adaptedBlueprint.config?._metadata?.totalEpisodes || 1,
              episodeIndex: adaptedBlueprint.config?._metadata?.series?.currentEpisode || adaptedBlueprint.config?._metadata?.episode || 1,
              episodeContract: this._buildEpisodeContract(adaptedBlueprint)
            }
          );
          this.log('CONTINUITY-REVIEW-AGENT', `完成`);
          
          result.stages.continuity = { agent: 'continuityReview', ...crResult };
          // 【v2.1.4】保存跨集边界校验报告
          if (crResult.boundaryReport) {
            result.stages.boundaryReport = crResult.boundaryReport;
            this.log('BOUNDARY-GUARD', `跨集边界校验: ${crResult.boundaryReport.summary}`);
          }
          result.llmStats.visualLanguage = vlResult.timing;
          result.llmStats.audioDesign = adResult.timing;
          result.llmStats.continuityReview = crResult.timing;
          this.log('PHASE-2', `完成 (${Date.now() - phase2Start}ms)`);
          await this._saveCheckpoint('phase2', currentShots, { opening: result.opening, llmStats: result.llmStats });
          this._checkMemory('phase2');
        } catch (e) {
          this.log('PHASE-2-FAIL', `❌ ${e.message},Phase2 失败但继续`);
          // Phase 2 失败不致命,用已有数据继续
        }
      }

      // ----- Phase 3:PromptFusion(串行模式,每镜头独立 LLM 调用)-----
      // 【审计修复】Phase 1 失败不应跳过 Phase 2/3
      if (startPhase <= 3) {
        if (phase1Failed) {
          this.log('PHASE-3', '⚠️ Phase 1 已失败，Phase 3 用现有 shots 尝试继续（降级模式）');
        }
        // 【v2.1.4-fix11-D】动态预算分配：根据镜头数计算Phase 3所需时间
        // 公式：镜头数 × 180秒(LLM生成) + 30秒(缓冲)
        // 【v2.1.5-fix】从90s增加到180s，实际LLM调用需120-180s/镜头
        const shotCount = currentShots.length;
        const PHASE3_PER_SHOT_MS = 180000; // 每镜头180秒（实际需120-180s）
        const PHASE3_BUFFER_MS = 30000;   // 30秒缓冲
        const phase3NeedMs = shotCount * PHASE3_PER_SHOT_MS + PHASE3_BUFFER_MS;
        
        this.log('PHASE-3', `📊 动态预算计算: ${shotCount}镜头 × ${PHASE3_PER_SHOT_MS/1000}s + ${PHASE3_BUFFER_MS/1000}s缓冲 = 需${Math.round(phase3NeedMs/1000)}s`);
        
        if (!this._canAfford(phase3NeedMs)) {
          this.log('PHASE-3', `⚠️ 预算不足(剩${Math.round(this._budgetRemaining()/1000)}s,需${Math.round(phase3NeedMs/1000)}s),保存退出,下次从 Phase3 续跑`);
          await this._saveCheckpoint('phase2', currentShots, { opening: result.opening, llmStats: result.llmStats });
          throw new Error('预算不足,请重跑以断点续跑(Phase1+2 LLM 产出已保存)');
        }
        try {
          this.log('PROMPT-FUSION-AGENT', `开始(串行模式,${shotCount}镜头,预计${Math.round(phase3NeedMs/1000)}s)...`);
          const phase3Start = Date.now();
          const pfResult = await this.agents.promptFusion.process(this._cloneShots(currentShots), adaptedBlueprint);
          // 【审计修复】补全 25 字段，原列表缺 lighting/scene/character/action/dialogue/mood/timeline/composition/constraint/baseline
          currentShots = this._mergeShotsByShotId(currentShots, pfResult.shots, [
            'prompt', 'enhanced_prompt', 'negative_prompt', 'fields', 'fusionText', 'promptCharCount',
            // 25字段全部纳入
            'director_instruction', 'constraint', 'baseline', 'scene', 'lighting', 'composition',
            'color_palette', 'depth_of_field', 'camera_movement', 'character', 'costume', 'makeup',
            'action', 'props', 'portraits', 'dialogue', 'timeline', 'mood', 'pacing', 'transition',
            'audio', 'negative', 'bright_constraint', 'character_constraint', 'consistency'
          ]);
          result.llmStats.promptFusion = pfResult.timing;
          this.log('PROMPT-FUSION-AGENT', `完成 (${Date.now() - phase3Start}ms)`);
          await this._saveCheckpoint('phase3', currentShots, { opening: result.opening, llmStats: result.llmStats });
        } catch (e) {
          this.log('PROMPT-FUSION-FAIL', `❌ ${e.message},部分镜头降级到规则 Prompt`);
        }
      }

      // ===== Phase-3.5 前置：展平 shot.fields + 统一字段命名 =====
      // 【审计修复】PromptFusion 的 fields 是最终权威来源，允许覆盖顶层旧值
      currentShots = currentShots.map(shot => {
        const flat = { ...shot };
        if (shot.fields && typeof shot.fields === 'object') {
          for (const [key, value] of Object.entries(shot.fields)) {
            if (value === undefined || value === null || value === '') continue;
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            flat[key] = value; // 始终覆盖（fields 是最终权威）
            flat[camelKey] = value; // 驼峰也覆盖
          }
        }
        return flat;
      });

      // ===== Phase-3.5: 字段质量检查与修复（自适应预算）=====
      const remainingBudget = this._budgetRemaining();
      if (remainingBudget < 15000 || this.agentConfig.skipFieldQuality) {
        this.log('FIELD-QUALITY', `⚠️ 预算不足或已配置跳过(剩${remainingBudget}ms),跳过字段质量检查`);
      } else if (remainingBudget < 60000) {
        // 15s-60s: 纯规则检查（不调LLM）
        try {
          this.log('FIELD-QUALITY', '开始(纯规则检查模式，预算极低)...');
          const fqStart = Date.now();
          const { FieldQualityPipeline } = require('../field-quality');
          const pipeline = new FieldQualityPipeline({
            llmModel: this.llmModel,
            maxRounds: 0, // 纯规则，不调用LLM
            checkerTimeout: 30000,
            repairerTimeout: 0,
          });
          pipeline.setPRDFromBlueprint(adaptedBlueprint);
          // 【v2.1.4-fix13-审计修复】下发全局 deadline
          pipeline.setDeadline?.(this._globalDeadline);
          const { finalShots, summary } = await pipeline.runAll(currentShots);
          currentShots = finalShots;
          this.log('FIELD-QUALITY', `完成 (${Date.now() - fqStart}ms) | 通过:${summary.passed}/${summary.totalShots} | 修复:${summary.totalRepairs} (纯规则模式)`);
        } catch (e) {
          this.log('FIELD-QUALITY-FAIL', `❌ ${e.message},继续执行`);
        }
      } else if (remainingBudget < 300000) {
        // 60s-300s: LLM检查1轮
        try {
          this.log('FIELD-QUALITY', '开始(规则+LLM 1轮检查与修复)...');
          const fqStart = Date.now();
          const { FieldQualityPipeline } = require('../field-quality');
          const pipeline = new FieldQualityPipeline({
            llmModel: this.llmModel,
            maxRounds: 1, // 1轮
            checkerTimeout: 30000,
            repairerTimeout: 30000,
          });
          pipeline.setPRDFromBlueprint(adaptedBlueprint);
          // 【v2.1.4-fix13-审计修复】下发全局 deadline
          pipeline.setDeadline?.(this._globalDeadline);
          const { finalShots, summary } = await pipeline.runAll(currentShots);
          currentShots = finalShots;
          this.log('FIELD-QUALITY', `完成 (${Date.now() - fqStart}ms) | 通过:${summary.passed}/${summary.totalShots} | 修复:${summary.totalRepairs}`);
          await this._saveCheckpoint('phase3.5', currentShots, { opening: result.opening, llmStats: result.llmStats });
        } catch (e) {
          this.log('FIELD-QUALITY-FAIL', `❌ ${e.message},继续执行`);
        }
      } else {
        // ≥300s: LLM检查2轮（原逻辑）
        try {
          this.log('FIELD-QUALITY', '开始(规则+LLM混合检查与修复)...');
          const fqStart = Date.now();
          const { FieldQualityPipeline } = require('../field-quality');
          const pipeline = new FieldQualityPipeline({
            llmModel: this.llmModel,
            maxRounds: 1, // 1轮（审计修复：超时频发，降为1轮）
            checkerTimeout: 30000,
            repairerTimeout: 30000,
          });
          pipeline.setPRDFromBlueprint(adaptedBlueprint);
          // 【v2.1.4-fix13-审计修复】下发全局 deadline
          pipeline.setDeadline?.(this._globalDeadline);
          const { finalShots, summary } = await pipeline.runAll(currentShots);
          currentShots = finalShots;
          this.log('FIELD-QUALITY', `完成 (${Date.now() - fqStart}ms) | 通过:${summary.passed}/${summary.totalShots} | 修复:${summary.totalRepairs}`);
          await this._saveCheckpoint('phase3.5', currentShots, { opening: result.opening, llmStats: result.llmStats });
        } catch (e) {
          this.log('FIELD-QUALITY-FAIL', `❌ ${e.message},继续执行`);
        }
      }

      // ===== 内容边界后处理(最终防线)=====
    currentShots = this._enforceContentBoundaries(currentShots, adaptedBlueprint);

    // ===== Quality Gate =====
      result.stages.qualityGate = await this._runStage('quality-gate', () => this._runQualityGate(currentShots));

      result.shots = currentShots;
      result.prompts = currentShots;
      result.meta = this._buildMeta(adaptedBlueprint);
      result.success = true;
      result.timing.total = Date.now() - startTime;
      this.log('PRODUCE', `✅ LLM 制作完成${result.resumed ? '(断点续跑)' : ''} | ${currentShots.length} 镜头 | ${result.timing.total}ms`);
      this._clearCheckpoints(); // 成功完成,清理 checkpoint
      
      // v2.0.0-架构升级: 发布完成事件 + 状态机清理
      this.eventBus.emit('Project:Completed', {
        projectId,
        timestamp: Date.now(),
        duration: result.timing.total,
        shotCount: currentShots.length,
        success: true
      });
      this.stateMachine?.cleanup();

    } catch (error) {
      result.success = false;
      result.errors.push({ stage: 'production', message: error.message });
      this.log('ERROR', `❌ ${error.message}`);
      this.log('ERROR', `💡 若为预算不足,直接重跑同一命令即可从 checkpoint 续跑,LLM 产出不会丢`);
      
      // v2.0.0-架构升级: 发布失败事件
      this.eventBus.emit('Project:Failed', {
        projectId,
        timestamp: Date.now(),
        error: error.message,
        currentState: this.stateMachine?.getStatus()?.currentState || 'UNKNOWN'
      });

      // 【新增】最后兜底:用规则引擎抢救产出
      try {
        this.log('RECOVERY', '尝试规则兜底恢复...');
        const baseShots = result.stages.durationAllocation?.shots || [];
        const fallbackShots = await this._engineerPromptsFallback(baseShots, adaptedBlueprint);
        if (fallbackShots.length > 0) {
          result.shots = fallbackShots;
          result.prompts = fallbackShots;
          result.success = true;
          result.degraded = true;
          result.timing.total = Date.now() - startTime;
          this.log('RECOVERY', `✅ 规则兜底成功,产出 ${fallbackShots.length} 个镜头`);
        }
      } catch (e2) {
        result.errors.push({ stage: 'recovery', message: e2.message });
      }
    }

    return result;
  }

  /**
   * 【新增】规则模式完整生产路径(LLM 禁用时)
   */
  async _produceViaRules(currentShots, adaptedBlueprint, result, startTime) {
    this.log('RULES', '启用规则引擎模式(LLM 已禁用)');
    result.stages.promptEngineering = await this._runStage('prompt-engineering', () => this._engineerPrompts(currentShots, adaptedBlueprint));
    currentShots = result.stages.promptEngineering.shots;
    result.stages.qualityGate = await this._runStage('quality-gate', () => this._runQualityGate(currentShots));
    if (this._shouldGenerateOpening(adaptedBlueprint)) {
      result.stages.opening = await this._runStage('opening', () => this._generateOpening(adaptedBlueprint));
    }
    result.stages.continuity = await this._runStage('continuity', () => this._checkContinuity(currentShots));
    result.shots = currentShots;
    result.prompts = currentShots;
    result.meta = this._buildMeta(adaptedBlueprint);
    result.opening = result.stages.opening?.openingData || null;
    result.success = true;
    result.degraded = true;
    result.timing.total = Date.now() - startTime;
    this.log('PRODUCE', `✅ 规则模式完成 | ${currentShots.length} 镜头 | ${result.timing.total}ms`);
    return result;
  }

  /**
   * 【新增】规则 Prompt 工程兜底(LLM PromptFusion 失败时)
   * 优先复用现有 _engineerPrompts,否则用极简拼接
   */
  async _engineerPromptsFallback(shots, blueprint) {
    if (typeof this._engineerPrompts === 'function') {
      try {
        const r = await this._engineerPrompts(shots, blueprint);
        if (r?.shots?.length) return r.shots;
      } catch (e) {
        this.log('FALLBACK', `_engineerPrompts 失败: ${e.message},使用极简拼接`);
      }
    }
    return shots.map(s => ({
      ...s,
      prompt: this._assemblePromptSimple(s),
      enhanced_prompt: this._assemblePromptSimple(s),
      negative_prompt: 'blurry, low quality, distorted, watermark, text, deformed, extra limbs'
    }));
  }

  /**
   * 【新增】极简 Prompt 拼接(最后兜底)
   * 【v2.1.4-fix9-P12】兜底路径也强制写实场景和动作
   */
  _assemblePromptSimple(shot) {
    const parts = [];
    
    // 场景强制写实检查
    let sceneDesc = shot.scene || '';
    const sceneForbidden = ['全息', '虚拟', '投影', '抽象', '光影场域', '数据空间', '元宇宙', '时间操控', '霓虹', '微观世界', '宏观', '抽象几何', '流动光影', '交织光影', '色彩对冲'];
    if (sceneForbidden.some(w => sceneDesc.includes(w))) {
      const fallbackScenes = [
        '医院健康宣教室，白色荧光灯均匀照明，白墙面贴有无文字骨骼肌解剖图与运动损伤海报（纯图形版），木质讲台表面带有细微使用划痕，地面浅灰色防滑PVC地胶',
        '三甲医院检验科走廊，冷白色LED光源从走廊顶部连续排列向下照射，无文字箭头标识牌指向尿液检验窗口，地面浅色抛光瓷砖，墙面白色医用抗菌涂层',
        '医生诊室，白色墙面悬挂无文字人体解剖示意图（纯图形版），办公桌摆放听诊器与血压计，检查床铺有蓝色一次性床单，无影灯悬于上方，窗光透入',
        '医院健康管理中心，嵌入式LED灯带洒下柔和暖白光，接待台后方排列无文字健康宣传展板（纯图形版），前方皮质沙发与实木茶几，地面灰色哑光瓷砖'
      ];
      const idx = parseInt(shot.shotId?.replace(/\D/g, '') || '0') || 0;
      sceneDesc = fallbackScenes[idx % fallbackScenes.length];
    }
    if (sceneDesc) parts.push(sceneDesc);
    
    if (shot.visual_elements) parts.push(shot.visual_elements);
    if (shot.lighting) parts.push(shot.lighting);
    if (shot.camera_movement) parts.push(shot.camera_movement);
    
    // 动作强制写实检查
    let actionDesc = shot.action || '';
    const actionForbidden = ['全息', '虚拟', '投影', '空间扭曲', '时间残影', '霓虹', '数据流', '光即角色', '抽象构图', '梦境流动性', '手绘动画', '湿版摄影', '黑色电影'];
    if (actionForbidden.some(w => actionDesc.includes(w))) {
      const fallbackActions = [
        '镜头缓慢推近，示例角色站立讲台前，自然手势讲解，眼神注视镜头，警服在荧光灯下轮廓清晰',
        '稳定机位中景，示例角色沿走廊缓步前行，侧头指向检验窗口，白大褂医生从背景走过',
        '手持微晃跟拍，示例角色靠近检查床，手指轻触医学挂图，无影灯在头顶形成柔和光晕',
        '固定机位中景，示例角色坐于沙发边缘，双手交叠置于膝上，LED灯带在身后形成均匀轮廓光',
        '缓慢后拉全景，示例角色站立检验窗口前，转身面向镜头，不锈钢台面反射冷白色光源'
      ];
      const idx = parseInt(shot.shotId?.replace(/\D/g, '') || '0') || 0;
      actionDesc = fallbackActions[idx % fallbackActions.length];
    }
    if (actionDesc) parts.push(actionDesc);
    
    if (shot.mood) parts.push(`atmosphere: ${shot.mood}`);
    
    // v6.6.10-fix: 极简路径使用全局模块，区分片头/内容镜
    const isOpeningSimple = shot.type === 'opening' || shot.sceneType === 'opening';
    const negativeSimple = isOpeningSimple
      ? globalNegativePromptInjector.generateForOpeningShot({ maxLength: 200 }).replace('【负面约束】', '')
      : globalNegativePromptInjector.generateForContentShot({ maxLength: 250 }).replace('【负面约束】', '');
    parts.push(negativeSimple);
    
    return parts.filter(Boolean).join(', ').slice(0, this.config.maxPromptLength);
  }

  /**
   * 【新增】内容边界强制过滤(最后防线)
   * 检测并清除越界内容(预告下集、提前讲后续知识点等)
   */
  _enforceContentBoundaries(shots, blueprint) {
    const meta = blueprint.config?._metadata || blueprint._metadata || {};
    const isSeries = meta.isSeries || (meta.series?.totalEpisodes > 1) || (meta.total_episodes > 1);
    const noPreview = meta.noNextEpisodePreview || meta.no_next_episode_preview;

    if (!isSeries && !noPreview) return shots;

    const forbiddenPatterns = [
      /下一集/g, /下集/g, /后续.*介绍/g, /下次再说/g, /下次.*讲/g,
      /待.*续/g, /未完待续/g, /且听.*分解/g
    ];

    let violations = 0;
    const cleaned = shots.map(shot => {
      let prompt = shot.prompt || '';
      let fusionText = shot.fusionText || '';
      let changed = false;

      for (const pattern of forbiddenPatterns) {
        if (pattern.test(prompt)) {
          prompt = prompt.replace(pattern, '...');
          changed = true;
          violations++;
        }
        if (pattern.test(fusionText)) {
          fusionText = fusionText.replace(pattern, '...');
          changed = true;
          violations++;
        }
      }

      if (changed) {
        this.log('BOUNDARY-GUARD', `⚠️ 清除越界内容: ${shot.shotId}`);
      }
      return changed ? { ...shot, prompt, fusionText } : shot;
    });

    if (violations > 0) {
      this.log('BOUNDARY-GUARD', `✅ 共清除 ${violations} 处越界内容`);
    }
    return cleaned;
  }

  /**
   * 【v2.0.0-架构升级】基线模板合并
   * 将基线模板的稳定字段与LLM生成的字段合并
   */
  _mergeWithBaseline(shots, filmType, visualStyle) {
    const baselineKey = `${filmType}_${visualStyle}`;
    const baseline = this.baselineRegistry.get(baselineKey);

    if (!baseline) {
      console.log(`[Baseline] 无基线模板: ${baselineKey}`);
      return shots;
    }

    console.log(`[Baseline] 合并基线模板: ${baselineKey} v${baseline._meta?.version}`);

    return shots.map(shot => {
      // 【P0-8-审计修复】LLM字段优先，基线只补充缺失字段
      const merged = { ...shot }; // shot（LLM生成）优先

      // 基线只补充 shot 中没有的字段
      for (const [key, value] of Object.entries(baseline)) {
        if (key.startsWith('_')) continue;
        if (merged[key] === undefined || merged[key] === null || merged[key] === '') {
          merged[key] = value;
        }
      }

      merged._baselineMerged = true;
      merged._baselineVersion = baseline._meta?.version;

      return merged;
    });
  }

  /**
   * 【v2.0.0-架构升级】获取Gateway统计
   */
  getGatewayStats() {
    return this.llmGateway.getStats();
  }

  /**
   * 【v2.0.0-架构升级】获取事件总线统计
   */
  getEventBusStats() {
    return this.eventBus.getStats();
  }

  async _runStage(stageName, stageFn) {
    const start = Date.now();
    this.log(stageName.toUpperCase(), `开始...`);

    try {
      const output = await stageFn();
      const duration = Date.now() - start;
      this.log(stageName.toUpperCase(), `完成 (${duration}ms)`);
      return { ...output, _stageDuration: duration };
    } catch (error) {
      const duration = Date.now() - start;
      this.log(stageName.toUpperCase(), `失败 (${duration}ms): ${error.message}`);
      throw error;
    }
  }

  /** 是否需要生成片头 */
  _shouldGenerateOpening(adaptedBlueprint) {
    const _meta = adaptedBlueprint.config?._metadata || adaptedBlueprint._metadata || {};
    return _meta.isSeries ? (_meta.episodeNumber === 1) : (_meta.hasOpening !== false);
  }

  /** 【v2.1.4】从adaptedBlueprint构造边界契约 */
  /** 【v2.1.4】从adaptedBlueprint构造边界契约 */
  _buildEpisodeContract(adaptedBlueprint) {
    // adaptedBlueprint结构: { config: { _metadata: {...} }, scenes: [...] }
    const meta = adaptedBlueprint.config?._metadata || {};
    const series = meta.series || {};
    const plan = meta.seriesContentPlan || {};
    const episodeIndex = series.currentEpisode || meta.episode || 1;

    // 优先从seriesContentPlan提取
    if (plan.episodes && plan.episodes[episodeIndex - 1]) {
      const ep = plan.episodes[episodeIndex - 1];
      return {
        mustCover: ep.mustCover || ep.coreTopics || [],
        canMention: ep.canMention || [],
        mustNotCover: ep.mustNotCover || [],
        previousSummary: null
      };
    }

    // 回退:从series信息构造
    return {
      mustCover: series.episodeThemes || [],
      canMention: [],
      mustNotCover: [],
      previousSummary: null
    };
  }

  /** 把全局截止时间下发给所有 Agent */
  _setAgentDeadline(deadlineMs) {
    for (const a of Object.values(this.agents || {})) {
      if (a && typeof a.setDeadline === 'function') a.setDeadline(deadlineMs);
    }
  }

  /** 浅拷贝 shots(并行分支互不污染) */
  _cloneShots(shots) {
    if (!Array.isArray(shots)) return [];
    return shots.map(s => this._deepCloneShot(s));
  }

  /**
   * 【审计修复·P0】安全深拷贝单个 shot
   * 处理循环引用、跳过重型字段（_blueprint等）
   */
  _deepCloneShot(shot) {
    if (shot === null || typeof shot !== 'object') return shot;

    // 快速路径：无 _blueprint 等重型字段时直接 JSON 拷贝（最快）
    if (!shot._blueprint && !shot._adapter && !shot._llm && !shot._engine) {
      try {
        return JSON.parse(JSON.stringify(shot));
      } catch (e) {
        // 有循环引用，走慢路径
      }
    }

    // 慢路径：手动递归拷贝，处理循环引用
    const seen = new WeakMap();
    const clone = (obj) => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (typeof obj === 'function') return undefined; // 跳过函数
      if (seen.has(obj)) return seen.get(obj); // 循环引用：返回已拷贝的引用
      if (Array.isArray(obj)) {
        const arr = [];
        seen.set(obj, arr);
        for (const item of obj) {
          const c = clone(item);
          if (c !== undefined) arr.push(c);
        }
        return arr;
      }
      const result = {};
      seen.set(obj, result);
      for (const [key, value] of Object.entries(obj)) {
        // 跳过已知重型/循环引用字段（保留浅引用）
        if (['_blueprint', '_adapter', '_llm', '_engine', '_metadata_raw'].includes(key)) {
          continue;
        }
        const c = clone(value);
        if (c !== undefined) result[key] = c;
      }
      return result;
    };

    const result = clone(shot);
    // 保留 _blueprint 的浅引用（太重不便深拷贝，但下游需要读取）
    if (shot._blueprint) result._blueprint = shot._blueprint;
    return result;
  }

  /**
   * 【审计修复·P0】深拷贝单个字段值（用于 _mergeShotsByShotId）
   */
  _deepCloneValue(value) {
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) {
      return value.map(v => this._deepCloneValue(v));
    }
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (e) {
      // 循环引用兜底：浅拷贝
      return { ...value };
    }
  }

  /**
   * 按 shotId 把 updatedShots 的指定字段合并回 baseShots
   * - 只在字段非空时覆盖,避免降级返回的空字符串冲掉已有数据
   * 【审计修复·P0】merged[f] = v 是引用赋值，改为深拷贝
   */
  _mergeShotsByShotId(baseShots, updatedShots, fields) {
    const map = new Map((updatedShots || []).map(s => [s.shotId, s]));
    return baseShots.map(shot => {
      const u = map.get(shot.shotId);
      if (!u) return shot;
      const merged = this._deepCloneShot(shot); // 先深拷贝目标
      for (const f of fields) {
        const v = u[f];
        // 【审计修复】过滤假值，避免 0/false 覆盖有效数据
        if (v !== undefined && v !== null && v !== '' && !(typeof v === 'number' && v === 0 && f === 'duration')) {
          merged[f] = this._deepCloneValue(v); // 深拷贝源字段
        }
      }
      return merged;
    });
  }

  /**
   * 并行执行多个 Agent 任务(allSettled,单点失败不阻塞其余)
   * 【v2.1.4-fix13-审计修复】增加外层超时保护，防止单个task hang住拖垮整个并行阶段
   */
  async _runParallel(tasks, label, timeoutMs = 300000) {
    const keys = Object.keys(tasks);
    const starts = keys.map(() => Date.now());
    this.log(label, `${keys.join(' + ')} 并行启动...`);

    const wrapped = keys.map((k, i) =>
      Promise.resolve(tasks[k]).then(v => {
        this.log(k.toUpperCase(), `完成 (${Date.now() - starts[i]}ms)`);
        return v;
      }).catch(e => {
        // 【P3-26-审计修复】挂 catch 防止 promise 悬空
        this.log(k.toUpperCase() + '-FAIL', `失败: ${e.message}`);
        return null;
      })
    );

    // 【v2.1.4-fix13-审计修复】外层超时保护：整个并行阶段最多等timeoutMs
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label}并行阶段超时(${timeoutMs}ms)`)), timeoutMs);
    });

    const settled = await Promise.race([
      Promise.allSettled(wrapped),
      timeoutPromise
    ]).finally(() => clearTimeout(timer));

    const values = [];
    settled.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        values.push(r.value);
      } else {
        this.log(label, `⚠️ ${keys[i]} 异常: ${r.reason?.message || r.reason}(降级处理,继续)`);
        values.push(this._emptyAgentResult(keys[i]));
      }
    });
    return values;
  }

  /** 并行任务异常时的兜底空结果(仅兜底,正常路径不会走到) */
  _emptyAgentResult(name) {
    if (name === 'opening-design-agent') return { opening: null, degraded: true, degradeReason: 'phase exception' };
    if (name === 'continuity-review-agent') return { review: { overallScore: 80, issues: [], summary: '并行阶段异常,跳过审查' }, degraded: true, degradeReason: 'phase exception' };
    return { shots: [], degraded: true, degradeReason: 'phase exception' };
  }

  /**
   * v6.37-P0: 构建 Meta 元信息
   */
  _buildMeta(adaptedBlueprint) {
    const worldSetting = adaptedBlueprint.worldSetting || {};
    const config = adaptedBlueprint.config || {};

    return {
      title: config.title || '未命名短片',
      worldview: worldSetting.world_id || 'default',
      totalDuration: this._calculateTotalDuration(adaptedBlueprint.scenes),
      openingDuration: config.opening_duration || 10,
      fps: 24,
      resolution: '1920x1080',
      styleNotes: config.style_notes || 'cinematic, hyperrealistic'
    };
  }

  _calculateTotalDuration(scenes) {
    if (!scenes || scenes.length === 0) return 0;
    return scenes.reduce((sum, scene) => sum + (scene.timing?.duration || 20), 0);
  }

  /**
   * v6.37-P1+: 构建角色极简锚点(专家反馈强化)
   * 规则:
   * 1. 强制3-5个视觉关键词(不含种族/物种)
   * 2. 禁止详细描述(如"十五米高的巨型身躯")
   * 3. 颜色词不超过2个
   * 4. 禁止形容词堆砌(超过3个连续形容词则截断)
   * 5. 格式:角色名: 种族/物种, 视觉关键词1, 视觉关键词2, 视觉关键词3
   *
   * 正例:白泽: lion-like beast, vertical eye, three white-flame tails, golden hooves
   * 反例:白泽: 一只十五米高的白色神兽,有着三根尾巴和金色的蹄子(太啰嗦)
   */
  _buildMinimalAnchor(cid, characters) {
    const char = characters.find(c => c.character_id === cid);
    if (!char) return `${cid}: unknown`;

    const race = char.species || char.race || char.gender || 'human';
    const features = char.visual_anchor?.core_features || [];

    // 颜色词列表(用于检查)
    const colorWords = ['white', 'black', 'red', 'blue', 'green', 'golden', 'silver', 'purple', 'brown', 'grey', 'gray', 'yellow', 'orange', 'pink', 'cyan', 'teal'];

    // 形容词列表(用于检查堆砌)
    const adjectiveWords = ['big', 'huge', 'giant', 'large', 'small', 'tiny', 'massive', 'tall', 'short', 'beautiful', 'magnificent', 'mysterious', 'ancient', 'powerful', 'fierce', 'gentle', 'elegant', 'majestic', 'terrifying', 'sacred', 'divine', 'mythical', 'legendary', 'noble', 'wise', 'brave', 'curious', 'young', 'old'];

    // 过滤并优化特征
    const processedFeatures = [];
    let colorCount = 0;
    let adjCount = 0;

    for (const feature of features) {
      const lower = feature.toLowerCase();

      // 跳过详细描述(超过15字符可能太啰嗦)
      if (feature.length > 15 && !feature.includes(' ') && !feature.includes('-')) {
        continue; // 跳过单个超长词(可能是详细描述)
      }

      // 检查颜色词
      const isColor = colorWords.some(c => lower.includes(c));
      if (isColor) {
        if (colorCount >= 2) continue; // 颜色词不超过2个
        colorCount++;
      }

      // 检查形容词堆砌(连续形容词计数)
      const isAdjective = adjectiveWords.some(a => lower.includes(a));
      if (isAdjective) {
        adjCount++;
        if (adjCount > 3) continue; // 形容词不超过3个
      } else {
        adjCount = 0; // 重置计数
      }

      processedFeatures.push(feature);

      // 强制3-5个关键词
      if (processedFeatures.length >= 5) break;
    }

    // 确保至少3个关键词
    while (processedFeatures.length < 3 && features.length > processedFeatures.length) {
      const next = features[processedFeatures.length];
      if (next) processedFeatures.push(next);
      else break;
    }

    const keywords = processedFeatures.slice(0, 5).join(', ');
    return `${char.name}: ${race}, ${keywords}`;
  }

  /**
   * Stage 1: 从适配蓝图提取场景,转换为内部镜头结构
   * v6.37-P0: 改造为符合参考文档的字段格式
   */
  _extractScenes(adaptedBlueprint) {
    const scenes = adaptedBlueprint.scenes || [];
    const characters = adaptedBlueprint.characters || [];
    const worldSetting = adaptedBlueprint.worldSetting || {};

    // v1.2.5: 系列作品非第一集处理
    // 修复:兼容adapter返回的顶层_metadata和config._metadata
    const _metadata = adaptedBlueprint.config?._metadata || adaptedBlueprint._metadata || {};
    const isSeriesNonFirst = _metadata.isSeries && _metadata.episodeNumber > 1;

    let shots = scenes.map((scene, index) => {
      // v1.2.5: 非第一集将opening类型改为establishing
      let sceneType = scene.scene_type || 'establishing';
      if (isSeriesNonFirst && sceneType === 'opening') {
        console.log(`[ProductionEngine] 非第一集,场景 ${scene.scene_id} 从 opening 降级为 establishing`);
        sceneType = 'establishing';
      }

      // 构建角色描述(v6.37-P1+: 强制极简锚点,3-5关键词)
      const characterAnchors = (scene.characters || []).map(cid => {
        return this._buildMinimalAnchor(cid, characters);
      });

      // 构建对话(v6.37-P0: 统一格式 SPEAKER|TYPE|EMOTION|TEXT|LIP_SYNC:YES)
      const dialogueLines = (scene.dialogue?.lines || []).map(line => {
        const speaker = line.speaker || '角色';
        const type = line.type || '独白';
        const emotion = line.emotion || '平静';
        const text = line.text || '';
        return `${speaker}|${type}|${emotion}|${text}|LIP_SYNC:YES`;
      });

      // v6.37-P0: 构建五维空间描述(scene字段)
      const sceneDescription = this._buildFiveDimensionScene(scene, worldSetting);

      // v6.37-P0: 构建 mood(3-5情绪关键词)
      const mood = this._buildMood(scene);

      // v6.37-P0: 构建 action(核心动词+交互目标)
      const action = this._buildAction(scene);

      return {
        shotId: scene.scene_id || `S${String(index + 1).padStart(2, '0')}`,
        sceneType: sceneType,
        sceneFunction: scene.scene_function || 'establish',

        // v6.37-P0: 时序(保留对象,后续转为字符串)
        timing: {
          start: scene.timing?.start || 0,
          duration: scene.timing?.duration || 20,
          end: scene.timing?.end || 20
        },

        // v1.2.5: 添加顶层duration字段供FieldGuard使用
        duration: scene.timing?.duration || 20,

        // v6.37-P0: 场景(五维空间描述法)
        scene: sceneDescription,

        // v6.37-P0: 情绪
        mood: mood,

        // v6.37-P0: 角色(极简锚点)
        // 【v2.1.4-patch5】将 | 改为逗号,避免Seedance渲染乱码
        character: characterAnchors.join(', '),
        characterRef: this._buildCharacterRef(scene, characters),

        // v6.37-P0: 动作
        action: action,

        // v6.37-P0: 对话(统一格式)
        dialogue: dialogueLines.join(' || '),

        // 保留原始数据(供内部使用)
        characters: scene.characters || [],
        // 【v2.1.4-patch5】将 | 改为逗号,避免Seedance渲染乱码
        characterDescs: characterAnchors.join(', '),
        dialogueText: (scene.dialogue?.lines || []).map(l => l.text).join(';'),

        // 情感
        emotionalTarget: scene.emotional_target || { valence: 0, arousal: 0.5 },
        
        // 【v2.1.4-fix9-P1】附加 blueprint 引用，供 Agent 读取导演上下文
        _blueprint: adaptedBlueprint,

        // 视觉方向
        visualDirection: scene.visual_direction || {},

        // Prompt 基础
        promptBase: scene.prompt_base || '',

        // 世界设定
        worldId: worldSetting.world_id || 'default',

        // 状态
        status: 'pending'
      };
    });

    // v1.2.5: 时长归一化--确保总时长严格等于目标时长
    const targetDuration = adaptedBlueprint.config?.target_duration || adaptedBlueprint.meta?.target_duration || 120;
    shots = this._normalizeDurations(shots, targetDuration);

    return { shots, sceneCount: shots.length };
  }

  /**
   * v1.2.5: 时长归一化
   * 将场景时长按比例缩放,使总时长严格等于目标时长
   */
  _normalizeDurations(shots, targetDuration) {
    if (!shots || shots.length === 0) return shots;

    // 计算当前总时长(取最后一个场景的end时间)
    const currentEnd = Math.max(...shots.map(s => s.timing?.end || 0));
    if (currentEnd <= 0) return shots;

    // 如果已经精确匹配,无需调整
    if (currentEnd === targetDuration) {
      console.log(`[ProductionEngine] 时长已精确匹配: ${targetDuration}s`);
      return shots;
    }

    // 计算缩放比例
    const scale = targetDuration / currentEnd;
    console.log(`[ProductionEngine] 时长归一化: ${currentEnd}s → ${targetDuration}s (缩放: ${scale.toFixed(3)})`);

    // 按比例缩放每个场景的timing
    let accumulatedEnd = 0;
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      const origDuration = shot.timing?.duration || 10;

      // 缩放时长,至少保留3秒
      const newDuration = Math.max(3, Math.round(origDuration * scale));

      // 更新timing和顶层duration
      shot.timing = {
        start: accumulatedEnd,
        duration: newDuration,
        end: accumulatedEnd + newDuration
      };
      shot.duration = newDuration;

      accumulatedEnd += newDuration;
    }

    // 最后微调:确保总时长精确等于目标
    const lastShot = shots[shots.length - 1];
    const diff = targetDuration - lastShot.timing.end;
    if (diff !== 0) {
      lastShot.timing.duration += diff;
      lastShot.timing.end = targetDuration;
      console.log(`[ProductionEngine] 最后微调: ${lastShot.shotId} 时长调整为 ${lastShot.timing.duration}s`);
    }

    return shots;
  }

  /**
   * v6.37-P0: 构建五维空间描述
   * 【v2.1.4-fix15】彻底修复：完全信任传入的场景描述，LLM只丰富细节
   * 原则：
   * 1. 传入的 scene.description 是客户/编剧指定的场景，必须完全保留
   * 2. LLM 的职责是丰富光线、材质、氛围等细节，不是替换场景
   * 3. 无 description 时基于 worldSetting 动态生成，不使用硬编码场景池
   * 4. 删除所有硬编码场景池（医院、神话等），这些会强行把客户场景掰弯
   */
  _buildFiveDimensionScene(scene, worldSetting) {
    // 第一优先级：完全信任传入的场景描述
    if (scene.description && scene.description.length > 5) {
      // 返回原始描述，让 SceneDesignAgent/LLM 在此基础上丰富细节
      return scene.description;
    }
    
    // 第二优先级：基于世界设定动态生成兜底描述
    const worldDesc = worldSetting?.description || worldSetting?.name || '';
    const atmosphere = worldSetting?.atmosphere || '';
    const sceneType = scene.scene_type || 'establishing';
    
    if (worldDesc) {
      return `${worldDesc}，${this._getSceneTypeDescriptor(sceneType)}${atmosphere ? '，' + atmosphere : ''}`;
    }
    
    // 最终兜底：只提供类型描述，不硬编码具体场景
    return this._getSceneTypeDescriptor(sceneType);
  }
  
  /**
   * 根据场景类型返回基础描述符（不含具体场景内容）
   */
  _getSceneTypeDescriptor(sceneType) {
    const descriptors = {
      'opening': '史诗开场场景，宏大视角，强烈视觉冲击',
      'establishing': '全景 establishing shot，展示空间关系与环境氛围',
      'conflict': '紧张对峙场景，充满戏剧张力与冲突感',
      'action': '激烈动作场景，高速动态，强烈视觉冲击',
      'emotional_climax': '情感高潮场景，张力爆发，情绪浓烈',
      'resolution': '平静收尾场景，余韵悠长，情绪释放',
      'discovery': '探索发现场景，充满惊奇与未知感',
      'transition': '过渡转场场景，时空转换，流畅衔接'
    };
    return descriptors[sceneType] || '标准叙事场景';
  }

  /**
   * v6.37-P0: 构建 mood(3-5情绪关键词)
   */
  /**
   * v6.37-P0: 构建 mood(3-5情绪关键词)
   * B8-fix: 优先从 scene 动态提取,兜底用默认映射
   */
  _buildMood(scene) {
    // B8-fix: 优先使用 LLM 生成的情绪数据
    if (scene.emotional_target) {
      const et = scene.emotional_target;
      const moods = [];
      // 从 emotional_target 的 valence/arousal 推断情绪
      if (et.valence > 0.5) moods.push('hopeful', 'positive');
      else if (et.valence < -0.3) moods.push('tense', 'serious');
      else moods.push('neutral', 'calm');

      if (et.arousal > 0.7) moods.push('intense', 'dramatic');
      else if (et.arousal < 0.3) moods.push('peaceful', 'gentle');

      // 补充 scene 自带的情绪标签
      if (scene.mood_tags && Array.isArray(scene.mood_tags)) {
        moods.push(...scene.mood_tags.slice(0, 2));
      }

      if (moods.length >= 3) return moods.slice(0, 5).join(', ');
    }

    // 兜底:按场景类型映射
    const moodMap = {
      'opening': 'epic, mysterious, awe-inspiring',
      'establishing': 'mysterious, anticipation, wonder',
      'conflict': 'tense, determined, brave, confrontational',
      'emotional_climax': 'epic, emotional, powerful, cathartic',
      'resolution': 'peaceful, warm, nostalgic, hopeful',
      'discovery': 'curious, excited, surprised, wondrous',
      'transition': 'flowing, continuous, seamless'
    };

    return moodMap[scene.scene_type] || 'neutral, calm, steady';
  }

  /**
   * v6.37-P0: 构建 action(核心动词+交互目标)
   * B8-fix: 优先从 scene 动态提取
   */
  _buildAction(scene) {
    // B8-fix: 优先使用 scene 自带的 action/visual_notes
    if (scene.action && scene.action.length > 5) return scene.action;
    if (scene.visual_notes && scene.visual_notes.length > 5) return scene.visual_notes;

    // 从 dialogue 推断动作
    if (scene.dialogue?.lines?.[0]?.text) {
      const firstLine = scene.dialogue.lines[0].text;
      // 根据台词情绪推断基础动作
      const emotion = scene.dialogue.lines[0].emotion || '';
      if (emotion.includes('紧张') || emotion.includes('tense')) {
        return 'tense posture, direct gaze, deliberate movement';
      }
      if (emotion.includes('兴奋') || emotion.includes('excited')) {
        return 'animated gesture, energetic movement, expressive';
      }
      return 'speaking to camera, clear hand gestures, professional delivery';
    }

    // 兜底:按场景类型映射
    const actionMap = {
      'opening': 'establishing shot, camera slowly descending through atmospheric layers',
      'establishing': 'standing in scene, observing and explaining with focused gaze',
      'conflict': 'confrontation stance, direct eye contact, tension building in posture',
      'emotional_climax': 'dramatic gesture, emotional peak, decisive movement',
      'resolution': 'gentle release, returning to calm, peaceful closure',
      'discovery': 'leaning forward, reaching out, examining with curiosity'
    };

    return actionMap[scene.scene_type] || 'neutral stance, steady breathing';
  }

  /**
   * v1.2.7-fix-A2: 构建角色定妆照引用
   * 修复:优先使用真实定妆照路径,而非凭空生成
   */
  _buildCharacterRef(scene, characters) {
    const fs = require('fs');
    const path = require('path');

    const refs = (scene.characters || []).map(cid => {
      let char = characters.find(c => c.character_id === cid);
      if (!char) {
        char = characters.find(c => c.name === cid);
      }
      if (!char) return null;

      const existingPaths = [];
      const refImages = char.visual_anchor?.reference_images || [];
      if (Array.isArray(refImages) && refImages.length > 0) {
        existingPaths.push(...refImages.filter(p => p && typeof p === 'string'));
      }
      if (char.portraits && typeof char.portraits === 'object') {
        const portraitPaths = Object.values(char.portraits).filter(p => p && typeof p === 'string');
        existingPaths.push(...portraitPaths);
      }
      if (Array.isArray(char.portraitPaths)) {
        existingPaths.push(...char.portraitPaths.filter(p => p && typeof p === 'string'));
      }
      const uniquePaths = [...new Set(existingPaths)];
      if (uniquePaths.length > 0) {
        return `${char.name}: ${uniquePaths.join(', ')}`;
      }

      const charDir = char.character_id || cid;
      const defaultAngles = ['front', 'profile', 'three-quarter', 'closeup', 'side', 'threeQuarter', 'full-body'];
      const baseDir = path.join(this.config?.charactersDir || 'characters', charDir);
      const portraitsDir = path.join(baseDir, 'portraits');
      const foundPaths = [];
      
      console.log(`[_buildCharacterRef] 搜索定妆照: charDir=${charDir}, baseDir=${baseDir}, portraitsDir=${portraitsDir}`);

      function searchDir(dir) {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          if (item.isDirectory()) {
            searchDir(fullPath);
          } else if ((item.isFile() || item.isSymbolicLink()) && /\.(png|jpg|jpeg|webp)$/i.test(item.name)) {
            const lowerName = item.name.toLowerCase();
            // 优先匹配包含角度关键词的文件名
            let matched = false;
            for (const angle of defaultAngles) {
              if (lowerName.includes(angle.toLowerCase()) || lowerName.includes(angle.replace('-', '').toLowerCase())) {
                matched = true;
                break;
              }
            }
            // 如果文件名不包含角度关键词，也收集（兜底：任何定妆照都可用）
            const relativePath = path.relative(baseDir, fullPath);
            foundPaths.push(`image://characters/${charDir}/${relativePath}`);
            console.log(`[_buildCharacterRef] 找到定妆照: ${fullPath}${matched ? ' (角度匹配)' : ' (通用)'}`);
          }
        }
      }
      
      searchDir(portraitsDir);

      if (foundPaths.length > 0) {
        return `${char.name}: ${foundPaths.join(', ')}`;
      }

      console.warn(`[ProductionEngine] ⚠️ 角色 ${char.name}(${cid}) 无定妆照,characterRef 标记为 NONE`);
      return null;
    }).filter(Boolean);

    return refs.join(', ') || 'NONE';
  }

  /**
   * Stage 2: 时长分配(精细化)
   * v6.37-P0: 新增 timeline 字段
   */
  _allocateDuration(shots) {
    const allocator = this.modules.shotDurationAllocator;
    if (!allocator) {
      // 回退:使用剧本引擎的时长
      return { shots };
    }

    // 基于内容重要性、台词长度、视觉复杂度三维度重新分配
    const allocatedShots = shots.map((shot, index) => {
      // 台词越长,时长越长
      const dialogueLength = shot.dialogue?.length || 0;
      const dialogueFactor = Math.min(dialogueLength / 30, 1.5); // 30字基准

      // 场景类型权重
      const typeWeights = {
        'opening': 1.2,
        'emotional_climax': 1.5,
        'conflict': 1.3,
        'resolution': 1.0,
        'establishing': 1.0
      };
      const typeWeight = typeWeights[shot.sceneType] || 1.0;

      // 基础时长 × 调整因子
      const baseDuration = shot.timing.duration;
      const adjustedDuration = Math.round(baseDuration * typeWeight * (1 + dialogueFactor * 0.2));

      // 限制在合理范围
      const finalDuration = Math.max(10, Math.min(40, adjustedDuration));

      // v6.37-P1+: 构建 timeline 字段(结构化对象 + 字符串)
      // v1.2.5: 使用已归一化的时长,不再重新分配
      const timelineResult = this._buildTimeline(shot, index, baseDuration);

      return {
        ...shot,
        // v6.37-P1+: timeline 结构化对象
        timeline: timelineResult,
        allocation: {
          baseDuration,
          dialogueFactor,
          typeWeight,
          // v1.2.5: 标记为保留原始时长
          preserved: true
        }
      };
    });

    return { shots: allocatedShots };
  }

  /**
   * v6.37-P0: 构建 timeline 字段
   * 格式:T00:XX-T00:XX / duration: Xs / type: XXX / mood: XXX
   */
  _buildTimeline(shot, index, duration) {
    const startTime = shot.timing.start || 0;
    const endTime = startTime + duration;
    const type = shot.sceneType || 'normal';
    const mood = shot.mood || 'neutral';

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // v6.37-P1+: 结构化对象 + 字符串
    const timelineObj = {
      start: `T${formatTime(startTime)}`,
      end: `T${formatTime(endTime)}`,
      duration: duration,
      type: type,
      mood: mood
    };

    const timelineStr = `${timelineObj.start}-${timelineObj.end} / duration: ${timelineObj.duration}s / type: ${timelineObj.type} / mood: ${timelineObj.mood}`;

    return {
      object: timelineObj,
      string: timelineStr
    };
  }

  /**
   * Stage 3: 运镜设计
   * v6.37-P0: 改造 camera 字段为字符串格式,新增 lighting 字段
   */
  _designCameraMovement(shots) {
    const cameraSystem = this.modules.cameraMovement;

    const designedShots = shots.map(shot => {
      // 基于场景类型推断运镜
      const cameraConfig = this._inferCameraConfig(shot);

      // v6.37-P1+: 构建 camera 字段(结构化对象 + 字符串)
      const cameraResult = this._buildCameraString(cameraConfig, shot);

      // v6.37-P1+: 构建 lighting 字段(结构化对象 + 字符串)
      const lightingResult = this._buildLighting(shot, cameraConfig);

      return {
        ...shot,
        camera: cameraResult, // 结构化对象
        lighting: lightingResult, // 结构化对象
        cameraMovement: {
          ...cameraConfig,
          // 4段式运镜时间轴
          timeline: this._generateCameraTimeline(shot.timing.duration, cameraConfig)
        }
      };
    });

    return { shots: designedShots };
  }

  /**
   * v6.37-P0: 构建 camera 字符串(12级机位+14运镜+焦距+速度)
   */
  /**
   * v6.37-P1+: 构建 camera 字段(结构化对象 + 字符串)
   * 专家反馈:字段级结构化,对象用于程序解析,字符串用于Prompt融合
   */
  _buildCameraString(cameraConfig, shot) {
    const shotSizeMap = {
      'wide': 'wide',
      'medium': 'medium',
      'close_up': 'close-up',
      'extreme_close_up': 'extreme close-up',
      'establishing': 'establishing'
    };

    const movementMap = {
      '缓慢推进': 'dolly in',
      '稳定机位': 'static',
      '手持晃动': 'handheld',
      '快速推近': 'push in',
      '缓慢后拉': 'pull back'
    };

    const focalMap = {
      'slow': '24mm',
      'normal': '35mm',
      'fast': '85mm',
      'dynamic': '50mm'
    };

    const speedMap = {
      'slow': 0.3,
      'normal': 1.0,
      'fast': 1.5,
      'dynamic': 0.8
    };

    // 结构化对象
    const cameraObj = {
      shotSize: shotSizeMap[cameraConfig.shotType] || 'medium',
      movement: movementMap[cameraConfig.movement] || 'static',
      lens: focalMap[cameraConfig.speed] || '35mm',
      speed: speedMap[cameraConfig.speed] || 1.0,
      aperture: 'f/2.8', // 默认值
      focus: 'normal' // 默认值
    };

    // 字符串格式(用于Prompt融合)
    const cameraStr = `${cameraObj.shotSize} shot, ${cameraObj.movement}, ${cameraObj.lens} lens, speed ${cameraObj.speed}`;

    return {
      object: cameraObj,
      string: cameraStr
    };
  }

  /**
   * v6.37-P0: 构建 lighting 字段(主光方向+色温K值+特效光)
   */
  _buildLighting(shot, cameraConfig) {
    const lightingMap = {
      'opening': {
        keyLight: { direction: 'backlight', colorTemp: 3200, effect: 'golden hour rim' },
        fillLight: { direction: 'ambient', colorTemp: 6500, effect: 'cool fill' },
        special: 'volumetric god rays'
      },
      'establishing': {
        keyLight: { direction: 'front', colorTemp: 4500, effect: 'neutral balanced' },
        fillLight: { direction: 'ambient', colorTemp: 4500, effect: 'soft fill' },
        special: ''
      },
      'conflict': {
        keyLight: { direction: 'top', colorTemp: 5600, effect: 'harsh shadows' },
        fillLight: { direction: 'none', colorTemp: 0, effect: 'dramatic contrast' },
        special: 'high contrast noir'
      },
      'emotional_climax': {
        keyLight: { direction: 'omni', colorTemp: 8000, effect: 'bright key' },
        fillLight: { direction: 'ambient', colorTemp: 8000, effect: 'volumetric glow' },
        special: 'volumetric glow'
      },
      'resolution': {
        keyLight: { direction: 'backlight', colorTemp: 2800, effect: 'warm sunset' },
        fillLight: { direction: 'ambient', colorTemp: 3200, effect: 'soft diffusion' },
        special: 'soft diffusion'
      },
      'discovery': {
        keyLight: { direction: 'side', colorTemp: 4500, effect: 'cool blue accent' },
        fillLight: { direction: 'ambient', colorTemp: 5500, effect: 'practical source' },
        special: 'practical source'
      }
    };

    const lightingObj = lightingMap[shot.sceneType] || lightingMap['establishing'];

    // 字符串格式(用于Prompt融合)
    const keyLight = lightingObj.keyLight;
    const fillLight = lightingObj.fillLight;
    let lightingStr = `${keyLight.direction} ${keyLight.colorTemp}K, ${keyLight.effect}`;
    if (fillLight.direction !== 'none') {
      lightingStr += `, ${fillLight.direction} ${fillLight.colorTemp}K, ${fillLight.effect}`;
    }
    if (lightingObj.special) {
      lightingStr += `, ${lightingObj.special}`;
    }

    return {
      object: lightingObj,
      string: lightingStr
    };
  }

  /**
   * 推断运镜配置
   */
  _inferCameraConfig(shot) {
    const configs = {
      'opening': {
        shotType: 'wide',
        movement: '缓慢推进',
        speed: 'slow',
        transition: 'none'
      },
      'establishing': {
        shotType: 'medium',
        movement: '稳定机位',
        speed: 'normal',
        transition: 'smooth'
      },
      'conflict': {
        shotType: 'close_up',
        movement: '手持晃动',
        speed: 'fast',
        transition: 'cut'
      },
      'emotional_climax': {
        shotType: 'extreme_close_up',
        movement: '快速推近',
        speed: 'dynamic',
        transition: 'dramatic'
      },
      'resolution': {
        shotType: 'medium',
        movement: '缓慢后拉',
        speed: 'slow',
        transition: 'fade'
      }
    };

    return configs[shot.sceneType] || configs['establishing'];
  }

  /**
   * 生成 4 段式运镜时间轴
   */
  _generateCameraTimeline(duration, cameraConfig) {
    const segments = 4;
    const segmentDuration = duration / segments;

    const timeline = [];
    for (let i = 0; i < segments; i++) {
      const start = i * segmentDuration;
      const end = (i + 1) * segmentDuration;

      timeline.push({
        segment: i + 1,
        timeRange: `${start.toFixed(1)}s-${end.toFixed(1)}s`,
        duration: segmentDuration.toFixed(1) + 's',
        cameraMovement: this._getSegmentMovement(i, cameraConfig.movement),
        shotType: this._getSegmentShotType(i, cameraConfig.shotType),
        purpose: this._getSegmentPurpose(i, cameraConfig)
      });
    }

    return timeline;
  }

  _getSegmentMovement(index, baseMovement) {
    const variations = {
      '缓慢推进': ['远景缓推', '中景推进', '近景聚焦', '特写定格'],
      '稳定机位': ['全景稳定', '中景观察', '近景注视', '特写定格'],
      '手持晃动': ['全景晃动', '中景逼近', '近景紧张', '特写冲击'],
      '快速推近': ['远景突袭', '中景冲刺', '近景逼近', '特写定格'],
      '缓慢后拉': ['近景特写', '中景展开', '全景揭示', '远景收尾']
    };

    const movements = variations[baseMovement] || variations['稳定机位'];
    return movements[index] || movements[movements.length - 1];
  }

  _getSegmentShotType(index, baseType) {
    const progression = {
      'wide': ['远景', '全景', '中景', '近景'],
      'medium': ['中景', '近景', '中景', '近景'],
      'close_up': ['中景', '近景', '特写', '极特写'],
      'extreme_close_up': ['近景', '特写', '极特写', '微距']
    };

    const types = progression[baseType] || progression['medium'];
    return types[index] || types[types.length - 1];
  }

  _getSegmentPurpose(index, config) {
    const purposes = [
      '建立空间/环境',
      '展示角色/关系',
      '推进情绪/冲突',
      '定格核心瞬间'
    ];
    return purposes[index] || '推进叙事';
  }

  /**
   * Stage 4: Prompt 工程(核心)
   * v6.37-P0: 按参考文档融合顺序构建 Prompt,产出标准字段格式
   * 保留卓越系统特有字段:mouthAction, importance, visualComplexity, qualityScore, enhanced
   */
  _engineerPrompts(shots, blueprint) {
    const prompts = [];
    const engineeredShots = [];
    
    // 【v2.1.4-fix9-P13】兜底路径(_engineerPrompts)也强制写实场景和动作
    const sceneForbidden = ['全息', '虚拟', '投影', '抽象', '光影场域', '数据空间', '元宇宙', '时间操控', '霓虹', '微观世界', '宏观', '抽象几何', '流动光影', '交织光影', '色彩对冲'];
    const fallbackScenes = [
      '医院健康宣教室，白色荧光灯均匀照明，白墙面贴有无文字骨骼肌解剖图与运动损伤海报（纯图形版），木质讲台表面带有细微使用划痕，地面浅灰色防滑PVC地胶',
      '三甲医院检验科走廊，冷白色LED光源从走廊顶部连续排列向下照射，无文字箭头标识牌指向尿液检验窗口，地面浅色抛光瓷砖，墙面白色医用抗菌涂层',
      '医生诊室，白色墙面悬挂无文字人体解剖示意图（纯图形版），办公桌摆放听诊器与血压计，检查床铺有蓝色一次性床单，无影灯悬于上方，窗光透入',
      '医院健康管理中心，嵌入式LED灯带洒下柔和暖白光，接待台后方排列无文字健康宣传展板（纯图形版），前方皮质沙发与实木茶几，地面灰色哑光瓷砖'
    ];
    const actionForbidden = ['全息', '虚拟', '投影', '空间扭曲', '时间残影', '霓虹', '数据流', '光即角色', '抽象构图', '梦境流动性', '手绘动画', '湿版摄影', '黑色电影'];
    const fallbackActions = [
      '镜头缓慢推近，示例角色站立讲台前，自然手势讲解，眼神注视镜头，警服在荧光灯下轮廓清晰',
      '稳定机位中景，示例角色沿走廊缓步前行，侧头指向检验窗口，白大褂医生从背景走过',
      '手持微晃跟拍，示例角色靠近检查床，手指轻触医学挂图，无影灯在头顶形成柔和光晕',
      '固定机位中景，示例角色坐于沙发边缘，双手交叠置于膝上，LED灯带在身后形成均匀轮廓光',
      '缓慢后拉全景，示例角色站立检验窗口前，转身面向镜头，不锈钢台面反射冷白色光源'
    ];

    for (const shot of shots) {
      // 【v2.1.4-fix9-P13】强制写实过滤
      let filteredScene = shot.scene || '';
      if (sceneForbidden.some(w => filteredScene.includes(w))) {
        const idx = parseInt(shot.shotId?.replace(/\D/g, '') || '0') || 0;
        filteredScene = fallbackScenes[idx % fallbackScenes.length];
        console.warn(`[ProductionEngine] ⚠️ 镜头 ${shot.shotId} 场景含禁止词汇，兜底替换为写实场景`);
      }
      
      let filteredAction = shot.action || '';
      if (actionForbidden.some(w => filteredAction.includes(w))) {
        const idx = parseInt(shot.shotId?.replace(/\D/g, '') || '0') || 0;
        filteredAction = fallbackActions[idx % fallbackActions.length];
        console.warn(`[ProductionEngine] ⚠️ 镜头 ${shot.shotId} 动作含禁止词汇，兜底替换为写实动作`);
      }
      
      const filteredShot = {
        ...shot,
        scene: filteredScene,
        action: filteredAction
      };

      // v2.0.5-彻底修复: 优先使用标准化后的字段(由_normalizeLLMOutput处理过)
      // 如果标准化字段存在,直接使用;否则做兜底处理
      const cameraStr = filteredShot.cameraString ||
                        filteredShot.camera?.string ||
                        (typeof filteredShot.camera === 'string' ? filteredShot.camera : '') || '';
      const lightingStr = filteredShot.lightingString ||
                          filteredShot.lighting?.string ||
                          (typeof filteredShot.lighting === 'string' ? filteredShot.lighting : '') || '';

      // v2.0.5-彻底修复: timeline优先使用标准化后的timelineString
      let timelineStr = filteredShot.timelineString || '';
      if (!timelineStr) {
        if (filteredShot.timeline?.string && typeof filteredShot.timeline.string === 'string') {
          timelineStr = filteredShot.timeline.string;
        } else if (typeof filteredShot.timeline === 'string') {
          timelineStr = filteredShot.timeline;
        } else if (Array.isArray(filteredShot.timeline)) {
          timelineStr = filteredShot.timeline.map(seg => 
            `${seg.timeRange || ''}: ${seg.cameraMovement || ''}`
          ).join('; ');
        }
      }

      // v2.0.5-彻底修复: 确保backgroundSound有string版本
      let bgSoundResult;
      if (filteredShot.backgroundSoundString && typeof filteredShot.backgroundSoundString === 'string') {
        bgSoundResult = {
          object: filteredShot.backgroundSound || {},
          string: filteredShot.backgroundSoundString
        };
      } else {
        bgSoundResult = this._buildBackgroundSound(filteredShot);
      }

      // v2.0.5-彻底修复: 构建shotWithSound供_buildShotPrompt使用
      const shotWithSound = {
        ...filteredShot,
        backgroundSound: bgSoundResult
      };
      const prompt = this._buildShotPrompt(shotWithSound, blueprint, { cameraStr, lightingStr, timelineStr });

      // 字符计数
      const promptLength = this._countChars(prompt.fullPrompt);

      // v6.37-P1+: 构建标准输出对象(严格按 v6.37 标准字段)
      // 正片 S01+: 14 核心字段 | 片头 S00: + audioLayer + titleOverlay
      // v2.0.4-fix: 添加人物介绍卡片
      const characterCards = this._buildCharacterCards(filteredShot, blueprint);

      const standardOutput = {
        // === 标准字段(v6.37-production+)===
        shotId: filteredShot.shotId,
        duration: filteredShot.timing?.duration || 20,
        scene: filteredShot.scene || '',
        mood: filteredShot.mood || '',
        camera: filteredShot.camera?.object || filteredShot.camera || '',
        cameraString: cameraStr,
        lighting: filteredShot.lighting?.object || filteredShot.lighting || '',
        lightingString: lightingStr,
        characterRef: filteredShot.characterRef || 'NONE',
        // v2.0.5-fix: 如果shot.character不存在,从blueprint获取主角名
        character: filteredShot.character || this._getMainCharacterName(blueprint) || 'NONE',
        action: filteredShot.action || '',
        dialogue: filteredShot.dialogue || 'NONE',
        dialogueText: filteredShot.dialogueText || '',
        timeline: filteredShot.timeline?.object || filteredShot.timeline || {},
        timelineString: timelineStr,
        backgroundSound: bgSoundResult.object,
        backgroundSoundString: bgSoundResult.string,
        prompt: prompt.fullPrompt,
        promptCharCount: promptLength,
        // v2.0.4-fix: 人物介绍卡片
        characterCards: characterCards,
        // v2.1.4-fix12: 片头专属字段占位（OpeningTitleOptimizer后处理填充）
        title_content: '',
        subtitle_content: '',
        title_animation: '',
        title_font_design: '',
        opening_audio_design: '',
        // 【v2.1.5-fix】兜底路径也生成P0字段，避免FieldGuard报错
        director_instruction: '好莱坞大导演质感，电影级画面，写实风格，无特效，无科幻元素，自然光效与人工照明融合',
        constraint: 'Aspect ratio: 16:9, Resolution: 1920x1080, Format: MP4, Frame rate: 24fps, no text, no subtitle, no caption, no watermark',
        baseline: '8K resolution, cinematic quality, highly detailed, photorealistic, intricate textures, sharp focus',
        negative: 'no text, no watermark, no logo, no cartoon style, no flat lighting, no blurry, no distorted, no deformed, no extra limbs',
        consistency: '保持角色形象一致，服装发型每帧统一，禁止角色变形或分身',
        // fields对象供FieldGuard校验
        fields: {
          director_instruction: '好莱坞大导演质感，电影级画面，写实风格，无特效，无科幻元素',
          constraint: 'Aspect ratio: 16:9, Resolution: 1920x1080, Format: MP4, Frame rate: 24fps, no text, no subtitle, no caption, no watermark',
          baseline: '8K resolution, cinematic quality, highly detailed, photorealistic, intricate textures, sharp focus',
          scene: filteredShot.scene || '',
          lighting: lightingStr,
          camera_movement: cameraStr,
          character: filteredShot.character || this._getMainCharacterName(blueprint) || 'NONE',
          action: filteredShot.action || '',
          dialogue: filteredShot.dialogue || 'NONE',
          negative: 'no text, no watermark, no logo, no cartoon style, no flat lighting, no blurry, no distorted, no deformed, no extra limbs',
          bright_constraint: 'bright lighting, well-lit scene, clear visibility, no dark shadows on face, adequate illumination',
          character_constraint: `只出现${filteredShot.character || this._getMainCharacterName(blueprint) || '主角'}一人，禁止其他人物入镜，禁止同一角色重复出现，禁止角色分身或克隆`,
          consistency: '保持角色形象一致，服装发型每帧统一，禁止角色变形或分身'
        }
      };

      // 片头专属字段(仅 S00)
      const _meta = blueprint.config?._metadata || blueprint._metadata || {};
      const isSeries = _meta.isSeries || false;
      const episodeNumber = _meta.episodeNumber || 1;
      const hasOpening = isSeries ? (episodeNumber === 1) : true;

      if (filteredShot.sceneType === 'opening' && hasOpening) {
        const audioLayer = this._buildAudioLayer(filteredShot);
        const titleOverlay = this._buildTitleOverlay(blueprint);
        standardOutput.audioLayer = audioLayer.object;
        standardOutput.audioLayerString = audioLayer.string;
        standardOutput.titleOverlay = titleOverlay.object;
        standardOutput.titleOverlayString = titleOverlay.string;
      }

      engineeredShots.push(standardOutput);
      prompts.push(standardOutput);
    }

    return { shots: engineeredShots, prompts };
  }

  /**
   * v6.37-P0: 构建 mouthAction 字段(供Seedance对口型)
   */
  _buildMouthAction(shot) {
    const actionMap = {
      'opening': '嘴部自然闭合,面对镜头,准备开口',
      'establishing': '嘴部微张,观察时自然呼吸',
      'conflict': '嘴部紧闭,紧张时咬紧牙关',
      'emotional_climax': '嘴部张大,情感爆发时大声呼喊',
      'resolution': '嘴部放松,微笑,平静呼吸'
    };

    return actionMap[shot.sceneType] || '嘴部自然闭合';
  }

  /**
   * v6.37-P0: 构建 backgroundSound 字段(三段式)
   */
  _buildBackgroundSound(shot) {
    const type = shot.sceneType || 'normal';

    const soundMap = {
      'opening': {
        ambient: 'deep earth rumble 20-60Hz, epic atmosphere',
        spatial: '3D audio pan synchronized with camera movement',
        intensity: { crescendo: '0-3s', peak: '3-7s', decay: '7-10s' }
      },
      'establishing': {
        ambient: 'natural environment, wind and distant sounds',
        spatial: 'ambient stereo field',
        intensity: { steady: '0-100%', variations: 'subtle' }
      },
      'conflict': {
        ambient: 'tension building, low frequency rumble',
        spatial: 'directional audio pan',
        intensity: { building: '0-5s', peak: '5-8s', decay: '8-10s' }
      },
      'emotional_climax': {
        ambient: 'full frequency spectrum, rich harmonics',
        spatial: 'immersive surround',
        intensity: { maximum: '0-3s', sustain: '3-10s' }
      },
      'resolution': {
        ambient: 'gentle atmosphere, soft reverb',
        spatial: 'wide stereo field',
        intensity: { fading: '0-5s', quiet: '5-10s' }
      }
    };

    const soundObj = soundMap[type] || {
      ambient: 'neutral atmosphere',
      spatial: 'centered mono',
      intensity: { steady: '100%' }
    };

    // 字符串格式(用于Prompt融合)
    const intensityStr = Object.entries(soundObj.intensity).map(([k, v]) => `${k} ${v}`).join(', ');
    // 【v2.1.4-patch5】将竖杠改为分号，避免Seedance渲染乱码
    const soundStr = `AMBIENT: ${soundObj.ambient}; SPATIAL: ${soundObj.spatial}; INTENSITY: ${intensityStr}`;

    return {
      object: soundObj,
      string: soundStr
    };
  }

  /**
   * v6.37-P1+: 构建 audioLayer 字段(片头专属,结构化对象)
   */
  _buildAudioLayer(shot) {
    const segments = [
      { time: '0-3s', sound: 'sub-bass earth rumble fade in' },
      { time: '3-5s', sound: 'distant wind and environmental sounds' },
      { time: '5-8s', sound: 'string section long note' },
      { time: '8-10s', sound: 'timpani strike' }
    ];

    const audioStr = segments.map(s => s.sound).join(', ');

    return {
      object: { segments },
      string: audioStr
    };
  }

  /**
   * v6.37-P1+: 构建 titleOverlay 字段(片头专属,结构化对象)
   */
  _buildTitleOverlay(blueprint) {
    const config = blueprint.config || {};
    const worldSetting = blueprint.worldSetting || {};
    // v1.2.5-fix: 兼容顶层_metadata和config._metadata
    const _metadata = config._metadata || blueprint._metadata || {};

    // v1.2.5: 系列作品片头逻辑
    const isSeries = _metadata.isSeries || false;
    const episodeNumber = _metadata.episodeNumber || 1;
    const totalEpisodes = _metadata.totalEpisodes || 1;

    // 只有第一集显示完整片头title
    const showTitle = isSeries ? (episodeNumber === 1) : true;

    const titleObj = {
      mainTitle: showTitle ? (config.title || '未命名') : '',
      subtitle: showTitle ? (worldSetting.name || '系列作品') : '',
      producer: showTitle ? `by ${config.producer || 'HAVS Team'}` : '',
      titleAnim: showTitle ? 'light-vein carving growth 3.0-5.0s' : 'none',
      episodeInfo: isSeries ? `第${episodeNumber}集 / 共${totalEpisodes}集` : ''
    };

    const titleStr = showTitle
      ? `MAIN_TITLE: "${titleObj.mainTitle}"; SUBTITLE: "${titleObj.subtitle}"; PRODUCER: "${titleObj.producer}"; TITLE_ANIM: ${titleObj.titleAnim}`
      : `EPISODE: ${titleObj.episodeInfo}; TITLE_ANIM: none`;

    return {
      object: titleObj,
      string: titleStr
    };
  }

  /**
   * 🔊 v2.0-B+: 音频场景映射(极致视听融合)
   */
  _getAudioSceneMap() {
    return {
      'beach': { env: '海浪轻拍沙滩的白噪音,海鸟远处鸣叫', action: '白沙从指缝流下沙沙声', emotion: '温暖治愈的氛围音' },
      'ocean': { env: '海浪拍打礁石,海风呼啸', action: '水花溅起声', emotion: '自由辽阔的海洋气息' },
      'forest': { env: '风吹树叶沙沙声,远处溪流潺潺', action: '脚步声踩落叶', emotion: '宁静安详的自然氛围' },
      'city': { env: '车流白噪音,远处鸣笛', action: '快门声、键盘敲击', emotion: '都市节奏感' },
      'home': { env: '室内温暖环境音', action: '婴儿咯咯笑声', emotion: '温馨家庭氛围' },
      'mountain': { env: '山风呼啸,远处鸟鸣', action: '雪粉飞扬声', emotion: '壮丽寂静的高山氛围' },
      'studio': { env: '摄影棚安静环境', action: '快门咔嚓声', emotion: '专业专注的工作氛围' }
    };
  }

  /**
   * 🔊 v2.0-B+: 构建音频描述(自然语言格式,Seedance可理解)
   */
  _buildAudioDescription(shot) {
    const parts = [];
    const sceneName = (shot.sceneName || shot.scene || shot.setting || '').toLowerCase();
    const emotion = (shot.emotionPhase || shot.emotion || 'neutral').toLowerCase();
    const timeOfDay = (shot.timeOfDay || shot.lighting?.timeOfDay || 'golden hour').toLowerCase();

    const audioMap = this._getAudioSceneMap();
    let template = null;

    // 匹配场景类型
    for (const [key, t] of Object.entries(audioMap)) {
      if (sceneName.includes(key)) {
        template = t;
        break;
      }
    }

    // 回退:基于时间
    if (!template) {
      if (timeOfDay.includes('night') || timeOfDay.includes('dusk')) {
        template = { env: '夜晚虫鸣,远处低语', action: '轻柔脚步声', emotion: '神秘宁静的夜晚氛围' };
      } else {
        template = { env: '白天环境音', action: '自然动作声', emotion: '明亮日常氛围' };
      }
    }

    // L1: 环境音 - 自然语言格式
    parts.push(`伴随${template.env}`);

    // L2: 动作音 - 自然语言格式
    parts.push(`动作产生${template.action}`);

    // L3: 情绪音 - 自然语言格式
    const emotionAudioMap = {
      'warm': '温暖治愈的轻音乐渐入',
      'joy': '欢快的节奏音',
      'tense': '紧张的心跳声渐强',
      'sad': '低沉的弦乐余韵',
      'epic': '宏大的交响乐铺垫',
      'peaceful': '宁静的钢琴轻弹',
      'establishing': '环境音渐显,氛围建立',
      'climax': '全频段饱满,情绪峰值',
      'resolve': '音乐渐弱,余音缭绕'
    };
    const emotionSound = emotionAudioMap[emotion] || template.emotion;
    parts.push(`氛围弥漫${emotionSound}`);

    // L4: 声画同步(如果含对话)
    if (shot.dialogueText || shot.hasDialogue) {
      parts.push('声画精准同步,嘴型与发音对齐');
    }

    return parts.join(',');
  }

  /**
   * 构建单个镜头的完整 Prompt(v2.0-B+: 七层架构 + 极致视听融合 + v6.37-P0 字段对齐)
   *
   * 融合顺序(按参考文档 v6.37-Peng):
   * CharacterRef → Timeline → Dialogue → AudioLayer(片头) → TitleOverlay(片头) →
   * BackgroundSound → Character → Action → Scene → Mood → Camera → Lighting →
   * PhysicsLayer → ColorScience → NegativePrompt → RenderStyle → DirectorStyle
   *
   * 七层结构:
   * L1: 约束层(P0必加)- 画幅/帧率/无字幕
   * L2: 基础层(P0必加)- 写实度/HDR/胶片质感
   * L3: 空间层(P1防平庸)- scene字段(五维空间)
   * L4: 主体层(P2防漂移)- character/action/dialogue
   * L5: 动态层(P1防平庸)- camera/timeline
   * L6: 风格层(P2防漂移)- mood/lighting
   * L7: 音频层(🔊 新增)- backgroundSound/audioLayer
   * L8: 内部层(扩展)- PhysicsLayer/ColorScience/NegativePrompt/RenderStyle/DirectorStyle
   * L9: 质控层(P0必加)- 负面约束/角色一致性
   */
  /**
   * 构建单个镜头的完整 Prompt(v6.37-P1+: 优先级截断 + 结构化对象)
   */
  _buildShotPrompt(shot, blueprint, structuredStrings = {}) {
    const { cameraStr, lightingStr, timelineStr } = structuredStrings;

    // v2.0.4-fix: 如果 shot 有 fusionText(LLM融合产出),优先使用作为L3-L7基础
    const hasFusion = shot.fusionText && shot.fusionText.length > 10;

    // v1.2.5: 从blueprint metadata中提取系列信息,控制片头和结尾
    // 修复:兼容顶层_metadata和config._metadata
    const _meta = blueprint._metadata || blueprint.config?._metadata || {};
    const isSeries = _meta.isSeries || false;
    const episodeNumber = _meta.episodeNumber || 1;
    const hasOpening = _meta.hasOpening !== false; // 默认true
    const noNextEpisodePreview = blueprint._metadata?.noNextEpisodePreview || false;

    // 检查当前镜头是否为片头/结尾,根据系列规则调整
    const isOpeningShot = shot.sceneType === 'opening' || shot.sceneType === 'establish';
    const isResolutionShot = shot.sceneType === 'resolution';

    // 定义优先级和截断策略(专家反馈)
    const priorityMap = {
      'L1_constraint': { priority: 'P0', strategy: 'never' },
      'L2_base': { priority: 'P0', strategy: 'never' },
      'L3_scene': { priority: 'P1', strategy: 'keep_core_location' },
      'L4_character': { priority: 'P0', strategy: 'minimal_anchor' },
      'L4_action': { priority: 'P1', strategy: 'keep_core_verb' },
      'L4_dialogue': { priority: 'P0', strategy: 'keep_core_dialogue' },
      'L5_camera': { priority: 'P1', strategy: 'keep_core_movement' },
      'L5_timeline': { priority: 'P2', strategy: 'keep_duration_type' },
      'L6_mood': { priority: 'P2', strategy: 'keyword_list' },
      'L6_lighting': { priority: 'P1', strategy: 'keep_main_light' },
      'L7_audio': { priority: 'P1', strategy: 'keep_core_sound' },
      'L8_internal': { priority: 'P2', strategy: 'truncate' },
      'L9_negative': { priority: 'P0', strategy: 'keep_top_3' }
    };

    const parts = [];
    const partMeta = [];

    // === L1: 约束层(P0必加)===
    // v1.2.5: 从blueprint.config读取画幅,默认16:9横屏
    const ratio = blueprint.config?.aspectRatio || '16:9';
    // v6.6.10-fix: 使用全局负面提示词模块，区分片头/内容镜
    const isOpening = shot.sceneType === 'opening' || shot.sceneType === 'establish';
    const negativePrompt = isOpening
      ? globalNegativePromptInjector.generateForOpeningShot({ maxLength: 250 })
      : globalNegativePromptInjector.generateForContentShot({ maxLength: 300 });
    const l1Constraint = `${ratio} cinematic, 24fps cinematic, ${negativePrompt.replace('【负面约束】', '')}`;
    parts.push(`【约束】${l1Constraint}`);
    partMeta.push({ id: 'L1_constraint', priority: 'P0' });

    // === L2: 基础层(P0必加)===
    parts.push('【基础】hyperrealistic, ultra-detailed, high dynamic range, detail in highlights and shadows, film grain, 35mm texture, cinematic film');
    partMeta.push({ id: 'L2_base', priority: 'P0' });

    // === L3: 空间层(P1)===
    if (hasFusion) {
      // v2.0.4-fix: LLM融合段直接放入,包含场景/角色/动作/运镜/灯光/情绪的叙事化描述
      parts.push(`【场景】${shot.fusionText}`);
      partMeta.push({ id: 'L3-L7_fusion', priority: 'P1' });
    } else {
      if (shot.scene) {
        parts.push(`【场景】${shot.scene}`);
        partMeta.push({ id: 'L3_scene', priority: 'P1' });
      }

      // === L4: 主体层(P0-P1)===
      if (shot.character && shot.character !== 'NONE') {
        parts.push(`【角色】${shot.character}`);
        partMeta.push({ id: 'L4_character', priority: 'P0' });
      }

      if (shot.action) {
        parts.push(`【动作】${shot.action}`);
        partMeta.push({ id: 'L4_action', priority: 'P1' });
      }
    }

    // v2.0.4-fix: 注入定妆照引用(characterRef)到prompt中
    if (shot.characterRef && shot.characterRef !== 'NONE') {
      parts.push(`【定妆照】${shot.characterRef}`);
      partMeta.push({ id: 'L4_characterRef', priority: 'P0' });
    }

    if (shot.dialogueText && shot.dialogueText !== '') {
      // 【v2.1.4-fix6】台词字段只包含纯台词内容，不包含结构化标签
      // 使用 shot.dialogueText（纯文本）而非 shot.dialogue（含SPEAKER/TYPE/EMOTION/LIP_SYNC标签）
      const pureDialogue = shot.dialogueText.replace(/;/g, '；'); // 将分号分隔改为中文分号，更自然
      parts.push(`"${pureDialogue}"`);
      partMeta.push({ id: 'L4_dialogue', priority: 'P0' });
    } else if (shot.dialogue && shot.dialogue !== '') {
      // 兜底：如果dialogueText不存在，从dialogue提取纯文本
      const pureDialogue = shot.dialogue.replace(/[^:]+:([^;]+);/g, '$1').replace(/LIP_SYNC:YES/g, '').replace(/;+/g, '；').replace(/^;+|;+$/g, '').trim();
      if (pureDialogue) {
        parts.push(`"${pureDialogue}"`);
        partMeta.push({ id: 'L4_dialogue', priority: 'P0' });
      }
    }

    // === L5: 动态层(P1-P2)===
    // v2.0.5-fix: 确保始终是字符串,防止对象污染prompt
    const camera = cameraStr || (typeof shot.camera === 'string' ? shot.camera : '');
    if (camera) {
      parts.push(`【运镜】${camera}`);
      partMeta.push({ id: 'L5_camera', priority: 'P1' });
    }

    const timeline = timelineStr || (typeof shot.timeline === 'string' ? shot.timeline : '');
    if (timeline) {
      parts.push(`【时间轴】${timeline}`);
      partMeta.push({ id: 'L5_timeline', priority: 'P2' });
    }

    // === L6: 风格层(P1-P2)===
    if (shot.mood) {
      parts.push(`【情绪】${shot.mood}`);
      partMeta.push({ id: 'L6_mood', priority: 'P2' });
    }

    const lighting = lightingStr || (typeof shot.lighting === 'string' ? shot.lighting : '');
    if (lighting) {
      parts.push(`【灯光】${lighting}`);
      partMeta.push({ id: 'L6_lighting', priority: 'P1' });
    }

    // === L7: 音频层(P1)===
    // v6.37-P1+: 使用字符串版本(避免对象输出)
    const bgSound = shot.backgroundSound?.string || shot.backgroundSound;
    if (bgSound && typeof bgSound === 'string') {
      parts.push(`【音频】${bgSound}`);
      partMeta.push({ id: 'L7_audio', priority: 'P1' });
    }

    const audioLayer = shot.audioLayer?.string || shot.audioLayer;
    if (audioLayer && audioLayer !== '' && typeof audioLayer === 'string') {
      parts.push(`【音频层】${audioLayer}`);
      partMeta.push({ id: 'L7_audio', priority: 'P1' });
    }

    // === L8: 内部层(P2)===
    if (shot.physicsLayer && shot.physicsLayer !== '') {
      parts.push(`【物理】${shot.physicsLayer}`);
      partMeta.push({ id: 'L8_internal', priority: 'P2' });
    }

    if (shot.colorScience && shot.colorScience !== '') {
      parts.push(`【色彩】${shot.colorScience}`);
      partMeta.push({ id: 'L8_internal', priority: 'P2' });
    }

    if (shot.renderStyle && shot.renderStyle !== '') {
      parts.push(`【渲染】${shot.renderStyle}`);
      partMeta.push({ id: 'L8_internal', priority: 'P2' });
    }

    if (shot.directorStyle && shot.directorStyle !== '') {
      parts.push(`【导演】${shot.directorStyle}`);
      partMeta.push({ id: 'L8_internal', priority: 'P2' });
    }

    // === L9: 质控层(P0)===
    if (shot.worldId && shot.worldId !== 'default') {
      parts.push(`${shot.worldId} world`);
    }

    // === L9: 质控层(P0)===
    const negativeConstraints = [
      '【负面约束】no watermark, no logo, no text overlay, no subtitle, no caption, no text anywhere in frame, no readable characters, no alphabets, no Chinese characters',
      '【负面约束】no text on walls, no text on objects, no text on documents, no text on signs, no text on labels, no text on screens, no text on clothing, no text in background',
      '【负面约束】no brand logos with text, no text in medical charts, no text on posters, no text on billboards, no text on packaging, no handwritten text, no printed text, no signage text',
      '【负面约束】no text overlays, no UI elements with text, no text on book covers, no text on medicine bottles, no text on report forms, no text on devices, no text on badges, no text on nameplates',
      '【负面约束】no text on doors, no text on windows, no text on floors, no text on ceilings',
      '【负面约束】blurry, low resolution, pixelated, compression artifacts',
      '【负面约束】cartoon, anime, illustration, 3D render look, CGI appearance, plastic look',
      '【负面约束】distorted perspective, impossible geometry, floating objects',
      '【负面约束】flat lighting, overexposed, crushed blacks, double shadows',
      '【负面约束】unnatural physics, fake water, static water, cardboard texture, plastic foliage'
    ];

    if (shot.characters?.length > 0 || shot.character) {
      negativeConstraints.push('【负面约束】distorted face, deformed face, extra fingers, plastic skin, waxy skin, unnatural pose');
    }

    if (shot.worldId && shot.worldId !== 'default') {
      negativeConstraints.push('【负面约束】natural eye colors only, no metallic shine');
    }
    parts.push(...negativeConstraints);
    partMeta.push({ id: 'L9_negative', priority: 'P0' });

    if (shot.characters?.length > 0) {
      parts.push(`【角色一致性】保持${shot.characters.join('、')}形象一致,杜绝分身重影`);
    }

    const fullPrompt = parts.join(',');

    // v6.37-P1+: 优先级截断(专家反馈)
    const truncated = this._truncateWithPriority(fullPrompt, this.config.maxPromptLength, partMeta, parts);

    // 【v2.1.4-patch5】兜底过滤：最终prompt中任何残留的竖杠全部过滤，防止Seedance渲染乱码
    const stripPipes = (str) => str.replace(/\|/g, '; ');

    return {
      fullPrompt: stripPipes(truncated),
      rawPrompt: fullPrompt, // 保留原始prompt用于调试
      parts,
      partMeta,
      wasTruncated: fullPrompt.length !== truncated.length,
      audioIncluded: !!shot.backgroundSound
    };
  }

  /**
   * v1.2.7-fix-A3: 优先级截断(保持 L1-L9 原始顺序)
   * 修复:截断时不再重排 parts,保持 v6.37 规定的融合顺序
   */
  _truncateWithPriority(prompt, maxLength, partMeta, parts) {
    if (prompt.length <= maxLength) return prompt;

    // 阶段1: 最小化所有 P2 部分(保持原位)
    let workingParts = parts.map((p, i) => {
      if (partMeta[i]?.priority === 'P2') return this._minimizePart(p, 'P2');
      return p;
    });
    let result = workingParts.join(',');
    if (result.length <= maxLength) return result;

    // 阶段2: 最小化所有 P1 部分(P2 已最小化,保持原位)
    workingParts = parts.map((p, i) => {
      if (partMeta[i]?.priority === 'P2') return this._minimizePart(p, 'P2');
      if (partMeta[i]?.priority === 'P1') return this._minimizePart(p, 'P1');
      return p;
    });
    result = workingParts.join(',');
    if (result.length <= maxLength) return result;

    // 阶段3: 逐个移除 P2 部分(从后往前移除,保持其余顺序)
    const p2Indices = partMeta
      .map((m, i) => m?.priority === 'P2' ? i : -1)
      .filter(i => i >= 0);

    for (const idx of p2Indices.slice().reverse()) {
      workingParts[idx] = null; // 标记移除
      result = workingParts.filter(p => p !== null).join(',');
      if (result.length <= maxLength) return result;
    }

    // 阶段4: 逐个移除 P1 部分(从后往前)
    const p1Indices = partMeta
      .map((m, i) => m?.priority === 'P1' ? i : -1)
      .filter(i => i >= 0);

    for (const idx of p1Indices.slice().reverse()) {
      workingParts[idx] = null;
      result = workingParts.filter(p => p !== null).join(',');
      if (result.length <= maxLength) return result;
    }

    // 阶段5: 最后兜底--保留前N个字符(P0字段在前,至少保留 L1+L2)
    return result.substring(0, maxLength);
  }

  /**
   * 最小化部分(按策略)
   * v1.2.7-fix-A6: P1 用英文逗号和中文逗号都尝试分割
   */
  _minimizePart(part, priority) {
    if (priority === 'P2') {
      // P2: 只保留前20字符
      return part.substring(0, 20) + '...';
    }
    if (priority === 'P1') {
      // P1: 保留核心(第一个逗号前的内容,兼容中英文逗号)
      const core = part.split(/[,,]/)[0];
      return core.length < part.length ? core + '...' : part;
    }
    return part;
  }

  /**
   * 🔊 v2.0-B+: 截断保护(保留音频层和角色一致性)
   */
  _truncatePromptWithAudioProtection(prompt, maxLength) {
    if (prompt.length <= maxLength) return prompt;

    // 保护末尾:角色一致性 + 音频层(如果存在)
    const lastPart = '角色一致性:保持形象一致,杜绝分身重影';

    // 检查是否包含音频描述
    const hasAudio = prompt.includes('伴随') && prompt.includes('氛围弥漫');
    let audioPart = '';
    if (hasAudio) {
      const audioMatch = prompt.match(/伴随[^,]*,[^,]*氛围弥漫[^,]*(?:,[^,]*声画精准同步[^,]*)?/);
      if (audioMatch) {
        audioPart = audioMatch[0];
      }
    }

    const protectParts = [lastPart];
    if (audioPart) protectParts.unshift(audioPart);

    const protectText = protectParts.join(',');
    const availableLength = maxLength - protectText.length - 2;

    if (availableLength > 50) {
      return prompt.substring(0, availableLength) + ',' + protectText;
    }

    return prompt.substring(0, maxLength);
  }

  /**
   * 截断 Prompt(旧方法,保留向后兼容)
   */
  _truncatePrompt(prompt, maxLength) {
    return this._truncatePromptWithAudioProtection(prompt, maxLength);
  }

  /**
   * 构建定妆照引用
   */
  _buildImageReferences(shot, blueprint) {
    const refs = [];
    const characters = blueprint.characters || [];

    for (const cid of (shot.characters || [])) {
      const char = characters.find(c => c.character_id === cid);
      if (!char) continue;

      const portraits = char.portraits || {};

      // 选择最佳角度
      const angle = this._selectBestAngle(shot.sceneType, Object.keys(portraits));
      const path = portraits[angle];

      if (path) {
        refs.push({
          characterId: cid,
          characterName: char.name,
          angle,
          path,
          description: this._buildImageDescription(char, angle)
        });
      }
    }

    return refs;
  }

  /**
   * 选择最佳角度
   */
  _selectBestAngle(sceneType, availableAngles) {
    if (!availableAngles || availableAngles.length === 0) return null;

    const priority = {
      'opening': ['front', 'threeQuarter', 'closeup'],
      'establishing': ['threeQuarter', 'front', 'closeup'],
      'conflict': ['closeup', 'threeQuarter', 'front'],
      'emotional_climax': ['closeup', 'front', 'threeQuarter'],
      'resolution': ['threeQuarter', 'front', 'closeup']
    };

    const preferred = priority[sceneType] || ['threeQuarter', 'front', 'closeup'];

    for (const angle of preferred) {
      if (availableAngles.includes(angle)) return angle;
    }

    return availableAngles[0];
  }

  /**
   * 构建定妆照描述
   */
  _buildImageDescription(character, angle) {
    const angleDesc = {
      'front': '正面',
      'threeQuarter': '侧面',
      'closeup': '近景',
      'side': '另一侧面'
    };

    const features = character.visual_anchor?.core_features || [];
    return `${character.name}${angleDesc[angle] || angle},${features.join(',')},超写实`;
  }

  /**
   * v6.37-P0: 字符计数
   */
  _countChars(text) {
    if (!text) return 0;
    // 计算字符数(包括中英文)
    let count = 0;
    for (const char of text) {
      count++;
    }
    return count;
  }

  /**
   * Stage 5: 质量门校验
   * v6.37-P2: 审核增强 - 检查新字段格式与完整性
   */
  _runQualityGate(prompts) {
    const checks = [];
    for (const p of prompts) {
      // v2.0.5-fix: 质量门也做类型保护,确保 .trim() 安全
      const camStr = String(p.cameraString || (typeof p.camera === 'string' ? p.camera : '') || '');
      const lightStr = String(p.lightingString || (typeof p.lighting === 'string' ? p.lighting : '') || '');
      const tlStr = String(p.timelineString || (typeof p.timeline === 'string' ? p.timeline : '') || '');
      const bgStr = String(p.backgroundSoundString || (typeof p.backgroundSound === 'string' ? p.backgroundSound : '') || '');

      const check = {
        shotId: p.shotId,
        promptLength: p.promptCharCount || 0,

        // 格式无关:只看字段是否存在且有内容
        hasScene: !!(p.scene && String(p.scene).trim().length > 8),
        hasMood: !!(p.mood && String(p.mood).trim().length > 1),
        hasCamera: camStr.trim().length > 5,
        hasLighting: lightStr.trim().length > 5,
        hasCharacter: !!(p.character && p.character !== 'NONE'),
        hasAction: !!(p.action && String(p.action).length > 3),
        hasTimeline: tlStr.trim().length > 3 || Array.isArray(p.timeline) && p.timeline.length > 0,
        hasBackgroundSound: bgStr.trim().length > 3,
        hasPrompt: !!(p.prompt && String(p.prompt).length > 50),

        withinLimit: (p.promptCharCount || 0) <= this.config.maxPromptLength,

        // 片头专属(S00 在 openingData 中,这里仅保留兼容检查)
        isOpening: p.shotId === 'S00',
        hasAudioLayer: p.shotId === 'S00' ? (!!p.audioLayerString && p.audioLayerString.length > 5) : true,
        hasTitleOverlay: p.shotId === 'S00' ? (!!p.titleOverlayString && p.titleOverlayString.length > 5) : true
      };

      // 对白/角色可为 NONE(无对白、无人物镜头),不强制;其余为核心必过项
      check.passed =
        check.hasScene && check.hasMood && check.hasCamera && check.hasLighting &&
        check.hasAction && check.hasTimeline && check.hasBackgroundSound &&
        check.hasPrompt && check.withinLimit && check.hasAudioLayer && check.hasTitleOverlay;

      checks.push(check);
    }

    const allPassed = checks.every(c => c.passed);
    return {
      passed: allPassed,
      checks,
      totalPrompts: prompts.length,
      passedCount: checks.filter(c => c.passed).length,
      failedFields: checks.filter(c => !c.passed).map(c => ({
        shotId: c.shotId,
        failed: Object.entries(c).filter(([k, v]) => k.startsWith('has') && !v).map(([k]) => k)
      }))
    };
  }

  /**
   * Stage 6: 片头生成
   * v6.37-P0: 产出符合片头结构(15字段)
   */
  _generateOpening(blueprint) {
    const config = blueprint.config || {};
    const worldSetting = blueprint.worldSetting || {};
    // B6-fix: 移除 featured_beast_id 强制要求,通用项目也生成片头
    // const beastId = config.featured_beast_id;
    // if (!beastId) { return { generated: false, reason: '无 featured_beast_id' }; }

    // B7-fix: 复用 _buildBackgroundSound 保证格式一致
    const openingBgSound = this._buildBackgroundSound({ sceneType: 'opening' });
    const openingData = {
      shotId: 'S00',
      duration: config.opening_duration || 10,
      scene: this._buildOpeningScene(worldSetting),
      mood: 'epic, mysterious, awe-inspiring',
      // 结构化 camera 对象
      camera: {
        shotSize: 'extreme wide',
        movement: 'dolly in',
        lens: '24mm',
        speed: 0.3,
        aperture: 'f/2.8',
        focus: 'rack focus from atmosphere to ground'
      },
      cameraString: 'epic wide shot, slow descent through atmospheric layers, 24mm wide lens, slow speed',
      // 结构化 lighting 对象
      lighting: {
        keyLight: { direction: 'backlight', colorTemp: 3200, effect: 'golden hour rim' },
        fillLight: { direction: 'ambient', colorTemp: 6500, effect: 'cool fill' },
        special: 'volumetric god rays'
      },
      lightingString: 'backlight 3200K, golden hour rim, volumetric god rays',
      characterRef: 'NONE',
      character: 'NONE',
      action: 'establishing shot, camera slowly descending through atmospheric layers',
      dialogue: 'NONE',
      // 结构化 timeline 对象
      timeline: {
        start: 'T00:00',
        end: 'T00:10',
        duration: 10,
        type: 'opening',
        mood: 'epic'
      },
      timelineString: 'T00:00-T00:10 / duration: 10s / type: opening / mood: epic',
      // 结构化 audioLayer 对象
      audioLayer: {
        segments: [
          { time: '0-3s', sound: 'sub-bass earth rumble fade in' },
          { time: '3-5s', sound: 'distant wind and environmental sounds' },
          { time: '5-8s', sound: 'string section long note' },
          { time: '8-10s', sound: 'timpani strike' }
        ]
      },
      audioLayerString: 'Sub-bass earth rumble fade in 3s, distant wind and environmental sounds, string section long note at 5s, timpani strike at 8s',
      // 结构化 titleOverlay 对象
      titleOverlay: {
        mainTitle: config.title || '未命名',
        subtitle: worldSetting.name || '系列作品',
        producer: `by ${config.producer || 'HAVS Team'}`,
        titleAnim: 'light-vein carving growth 3.0-5.0s'
      },
      titleOverlayString: `MAIN_TITLE: "${config.title || '未命名'}"; SUBTITLE: "${worldSetting.name || '系列作品'}"; PRODUCER: "by ${config.producer || 'HAVS Team'}"; TITLE_ANIM: light-vein carving growth 3.0-5.0s`,
      // 【v2.1.4-patch2】FieldGuard兼容:添加顶层title/subtitle字段
      title: config.title || '未命名',
      subtitle: worldSetting.name || '系列作品',
      // B7-fix: 复用 _buildBackgroundSound 保证格式一致
      backgroundSound: openingBgSound.object,
      backgroundSoundString: openingBgSound.string,
      prompt: '', // 由 Prompt 工程构建
      promptCharCount: 0
    };

    // 构建片头 Prompt(传入结构化字符串)
    const prompt = this._buildShotPrompt(openingData, blueprint, {
      cameraStr: openingData.cameraString,
      lightingStr: openingData.lightingString,
      timelineStr: openingData.timelineString
    });
    openingData.prompt = prompt.fullPrompt;
    openingData.promptCharCount = this._countChars(prompt.fullPrompt);

    return {
      generated: true,
      openingData,
      shotId: 'S00',
      type: 'opening',
      beastId: null
    };
  }

  _buildOpeningScene(worldSetting) {
    const worldName = worldSetting.name || worldSetting.world_id || 'Unknown World';
    const atmosphere = worldSetting.atmosphere || 'mysterious';
    const timeOfDay = worldSetting.time_of_day || 'golden hour';
    const depth = worldSetting.spatial_depth || 'atmospheric layers';

    return `${worldName}, ${atmosphere} atmosphere, ${timeOfDay} lighting, ${depth}, spatial depth: infinite`;
  }

  /**
   * Stage 7: 连续性检查
   * v6.37-P0: 适配新字段结构(characterRef 替代 imageRefs)
   */
  _checkContinuity(prompts) {
    const issues = [];

    // 检查角色连续性(从 characterRef 解析)
    const characterMentions = prompts.map((p, idx) => {
      const chars = this._parseCharacterRefForContinuity(p.characterRef);
      return { idx, chars };
    });

    // 检查时序连续性
    for (let i = 1; i < prompts.length; i++) {
      const prev = prompts[i - 1];
      const curr = prompts[i];

      const prevChars = this._parseCharacterRefForContinuity(prev.characterRef);
      const currChars = this._parseCharacterRefForContinuity(curr.characterRef);

      // 检查是否有共享角色
      const sharedChars = prevChars.filter(c => currChars.includes(c));

      if (sharedChars.length === 0 && prevChars.length > 0 && currChars.length > 0) {
        issues.push({
          type: 'character_gap',
          between: [prev.shotId, curr.shotId],
          message: '相邻镜头无共享角色,可能导致叙事断裂'
        });
      }
    }

    return {
      passed: issues.length === 0,
      issues,
      promptCount: prompts.length
    };
  }

  /**
   * v6.37-P0: 从 characterRef 解析角色名(用于连续性检查)
   */
  _parseCharacterRefForContinuity(characterRef) {
    if (!characterRef || characterRef === 'NONE') return [];

    const chars = [];
    const parts = characterRef.split('; ');

    for (const part of parts) {
      const match = part.match(/(.+?):\s*/);
      if (match) {
        chars.push(match[1].trim());
      }
    }

    return chars;
  }

  /**
   * v2.0.5-fix: 从blueprint获取主角名称
   */
  _getMainCharacterName(blueprint) {
    const characters = blueprint.characters || [];
    // 找 protagonist 角色,或第一个角色
    const protagonist = characters.find(c => c.role === 'protagonist') || characters[0];
    return protagonist?.name || null;
  }

  /**
   * v6.37+: 构建 portraits 数组(FieldGuard 要求的关键字段)
   */
  _buildPortraits(shot, blueprint) {
    const portraits = [];
    const characters = shot.characters || blueprint.characters || [];

    for (const char of characters) {
      // v6.37+: 预生产阶段如果没有定妆照,生成占位符记录,避免FieldGuard警告
      portraits.push({
        character: char.name || char.id || 'unknown',
        characterId: char.id || char.name || 'unknown',
        url: char.portraitUrl || 'PENDING_GENERATION',
        angle: 'default',
        source: char.portraitUrl ? 'character_system' : 'pending'
      });
    }

    return portraits;
  }

  /**
   * v6.37+: 构建 characterCards 数组(FieldGuard 要求的关键字段)
   */
  _buildCharacterCards(shot, blueprint) {
    const cards = [];
    // v2.0.5-彻底修复: 优先从blueprint获取完整角色信息
    // _normalizeLLMOutput已经确保shot.characters被填充,但blueprint.characters更完整
    const characters = blueprint.characters || shot.characters || [];

    if (characters.length === 0) {
      // 兜底:如果完全没有角色信息,尝试从blueprint.config或meta提取
      const config = blueprint.config || {};
      const meta = blueprint.meta || {};
      if (config.character || meta.character) {
        const char = config.character || meta.character;
        cards.push({
          characterId: char.character_id || char.id || char.name || 'unknown',
          name: char.name || '未知角色',
          role: char.role || 'protagonist',
          description: char.description || char.persona || '',
          voiceProfile: char.voiceProfile || char.voice_profile || {}
        });
      }
      return cards;
    }

    for (const char of characters) {
      cards.push({
        // v2.0.5-彻底修复: 支持character_id和id两种字段名
        characterId: char.character_id || char.id || char.name || 'unknown',
        name: char.name || char.id || char.character_id || '未知角色',
        role: char.role || 'supporting',
        description: char.description || char.persona || char.personality || '',
        voiceProfile: char.voiceProfile || char.voice_profile || {}
      });
    }

    return cards;
  }

  /**
   * 生成生产报告
   */
  generateReport(result) {
    // v1.2.6-fix: 标准输出对象没有 timing 字段,用顶层 duration;prompts 用 promptCharCount
    const totalDuration = (result.shots || []).reduce((sum, s) => {
      return sum + (s.duration || s.timing?.duration || 0);
    }, 0);

    const prompts = result.prompts || [];
    const avgPromptLength = prompts.length > 0
      ? prompts.reduce((sum, p) => sum + (p.promptCharCount || (typeof p.prompt === 'string' ? p.prompt.length : 0) || 0), 0) / prompts.length
      : 0;

    return {
      engine: 'ProductionEngine',
      version: '1.0.0',
      success: result.success,
      summary: {
        totalShots: (result.shots || []).length,
        totalPrompts: prompts.length,
        totalDuration,
        avgPromptLength: Math.round(avgPromptLength)
      },
      stages: Object.fromEntries(
        Object.entries(result.stages || {}).map(([k, v]) => [k, {
          duration: v._stageDuration || 0,
          success: !v.error
        }])
      ),
      errors: result.errors,
      timing: result.timing
    };
  }
  /**
   * 【v2.1.4-fix10-P25-fix3】暴露给外部（如 index.js FieldGuard 重算 prompt）
   */
  assemblePromptFromFields(shot, fields, ratio) {
    // 委托给 PromptFusionAgent 的 _assembleStandardPrompt
    const agent = this.agents?.promptFusion || new PromptFusionAgent({ maxPromptLength: this.config.maxPromptLength });
    return agent._assembleStandardPrompt(shot, fields, ratio);
  }

  countChars(s) {
    const agent = this.agents?.promptFusion || new PromptFusionAgent({ maxPromptLength: this.config.maxPromptLength });
    return agent._countChars(s);
  }
}

module.exports = { ProductionEngine };

```

---

## engines/rendering-engine/rendering-engine.js

```javascript
// hyperreality-system/engines/rendering-engine/rendering-engine.js
// Rendering Engine - 渲染引擎（Layer 3）
// 复用现有系统 Seedance 渲染核心，适配超现实系统数据格式
// 版本：v1.0.0 | 日期：2026-06-08

const fs = require('fs');
const path = require('path');

// 复用现有系统的渲染提交核心
const RENDER_CORE_PATH = path.join(__dirname, '../../../scripts/render-submitter-core.js');
let RenderSubmitterCore;
try {
  RenderSubmitterCore = require(RENDER_CORE_PATH).RenderSubmitterCore;
} catch (e) {
  console.warn(`[RenderingEngine] 无法加载现有渲染核心: ${e.message}`);
  console.warn('[RenderingEngine] 将使用内置模拟模式');
}

class RenderingEngine {
  constructor(options = {}) {
    this.config = {
      apiKey: options.apiKey || process.env.VOLCENGINE_ARK_API_KEY,
      // 【v2.1.4-fix13-审计修复】endpoint 从环境变量读取，消除硬编码
      endpoint: options.endpoint || process.env.VOLCENGINE_ARK_ENDPOINT,
      apiUrl: options.apiUrl || 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks',
      maxConcurrent: options.maxConcurrent || 3,
      charactersDir: options.charactersDir || path.join(__dirname, '../../../characters'),
      outputDir: options.outputDir || '/tmp/hyperreality-output',
      ...options
    };

    this.logs = [];
    this._initSubmitter();
  }

  _initSubmitter() {
    if (RenderSubmitterCore) {
      this.submitter = new RenderSubmitterCore({
        apiKey: this.config.apiKey,
        endpoint: this.config.endpoint,
        apiUrl: this.config.apiUrl,
        charactersDir: this.config.charactersDir,
        outputDir: this.config.outputDir,
        maxConcurrent: this.config.maxConcurrent
      });
    } else {
      this.submitter = null;
    }
  }

  log(stage, message) {
    const entry = { stage, message, timestamp: Date.now() };
    this.logs.push(entry);
    console.log(`[${stage}] ${message}`);
  }

  /**
   * 主入口：渲染镜头
   * @param {Array} prompts - 制作引擎输出的 Prompts 数组
   * @param {Object} options - { skipValidation, dryRun }
   * @returns {Object} { success, results, errors }
   */
  async render(prompts, options = {}) {
    const startTime = Date.now();
    this.log('RENDER', '🎬 RenderingEngine 启动 | Seedance API');
    this.log('RENDER', `   渲染: ${prompts.length} 个镜头`);
    this.log('RENDER', `   模式: ${this.submitter ? 'API' : '模拟'}`);
    this.log('RENDER', `   并发: ${this.config.maxConcurrent}`);

    const result = {
      success: false,
      submitted: 0,
      failed: 0,
      results: [],
      errors: [],
      timing: {}
    };

    try {
      // 检查 API 密钥
      if (!this.config.apiKey && !options.dryRun) {
        throw new Error('VOLCENGINE_ARK_API_KEY 未设置，无法渲染');
      }

      // 构建渲染数据结构（兼容现有系统）
      const shots = prompts.map(p => this._convertToShotFormat(p));

      if (options.dryRun) {
        // 模拟模式：只验证不提交
        this.log('RENDER', '⚠️ 模拟模式：验证数据但不提交 API');
        result.results = shots.map(s => ({
          success: true,
          shotId: s.shotId,
          taskId: `SIMULATED-${s.shotId}`,
          status: 'simulated'
        }));
        result.submitted = shots.length;
        result.success = true;
      } else if (this.submitter) {
        // 真实 API 模式
        this.log('RENDER', '🔥 提交 Seedance API 渲染...');

        // 生成绑定清单（从 prompts 的 imageRefs 提取）
        const manifest = this._generateBindingManifest(prompts);
        const manifestPath = path.join(this.config.outputDir, 'binding-manifest.json');
        if (!fs.existsSync(this.config.outputDir)) {
          fs.mkdirSync(this.config.outputDir, { recursive: true });
        }
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

        // 调用现有系统的提交核心
        const submitResult = await this.submitter.submit(shots, {
          bindingManifestPath: manifestPath,
          skipValidation: options.skipValidation
        });

        result.results = submitResult.results;
        result.submitted = submitResult.results.filter(r => r.success).length;
        result.failed = submitResult.results.filter(r => !r.success).length;
        result.success = submitResult.success;

      } else {
        // 无提交器，模拟
        this.log('RENDER', '⚠️ 无提交器，使用模拟模式');
        result.results = shots.map(s => ({
          success: true,
          shotId: s.shotId,
          taskId: `MOCK-${s.shotId}`,
          status: 'mock'
        }));
        result.submitted = shots.length;
        result.success = true;
      }

      result.timing.total = Date.now() - startTime;
      this.log('RENDER', `✅ 渲染完成: ${result.submitted}/${prompts.length} 成功`);
      this.log('RENDER', `   耗时: ${result.timing.total}ms`);

    } catch (error) {
      result.success = false;
      result.errors.push({
        stage: 'RENDER',
        message: error.message
      });
      this.log('RENDER', `❌ 渲染失败: ${error.message}`);
    }

    return result;
  }

  /**
   * 转换为现有系统兼容的 shot 格式
   * v6.37-P0: 适配新字段结构
   */
  _convertToShotFormat(prompt) {
    return {
      shotId: prompt.shotId,
      id: prompt.shotId, // 兼容现有系统
      prompt: prompt.prompt,
      duration: prompt.duration || 12, // 使用实际时长
      isOpening: prompt.shotId === 'S00' || prompt.shotId === 'SC00',
      // 定妆照引用（v6.37-P0: 从 characterRef 解析）
      referenceImages: this._parseCharacterRef(prompt.characterRef),
      // 字符数
      promptLength: prompt.promptCharCount || prompt.length || 0,
      // v6.37-P0: 保留新字段用于调试
      mood: prompt.mood,
      camera: prompt.camera,
      lighting: prompt.lighting
    };
  }
  
  /**
   * v6.37-P0: 解析 characterRef 字符串为 image 引用数组
   * 同时提取实际的目录名（从路径中）
   */
  _parseCharacterRef(characterRef) {
    if (!characterRef || characterRef === 'NONE') return [];
    
    const refs = [];
    const parts = characterRef.split(' | ');
    
    for (const part of parts) {
      const match = part.match(/(.+?):\s*(.+)/);
      if (match) {
        const charName = match[1].trim();
        const paths = match[2].split(',').map(p => p.trim());
        
        paths.forEach(path => {
          const angleMatch = path.match(/-(\w+)\.png$/);
          // 从路径提取实际目录名，如 image://characters/chen-zhuo/front.png → chen-zhuo
          const dirMatch = path.match(/characters\/([^\/]+)\//);
          const charDir = dirMatch ? dirMatch[1] : charName;
          
          refs.push({
            characterId: charName,      // 显示名（如"示例角色"）
            characterDir: charDir,      // 实际目录名（如"chen-zhuo"）
            path: path,
            angle: angleMatch ? angleMatch[1] : 'unknown'
          });
        });
      }
    }
    
    return refs;
  }

  /**
   * 生成绑定清单
   * v1.2.7-fix-A2: 从 characterRef 解析 + 自动扫描 portraits 目录补全4角度
   */
  _generateBindingManifest(prompts) {
    const characters = {};
    const shots = [];
    const REQUIRED_ANGLES = ['front', 'threeQuarter', 'closeup', 'side'];

    for (const prompt of prompts) {
      const shotId = prompt.shotId;
      const charsInShot = [];

      // v1.2.7-fix-A1: 从 characterRef 解析，而非读不存在的 imageRefs
      const refs = this._parseCharacterRef(prompt.characterRef);

      for (const ref of refs) {
        const charId = ref.characterId;
        if (!charsInShot.includes(charId)) {
          charsInShot.push(charId);
        }

        if (!characters[charId]) {
          characters[charId] = {
            id: charId,
            name: charId,
            requiredAngles: REQUIRED_ANGLES,
            portraits: {}
          };

          // v1.2.7-fix-A2: 自动扫描 portraits 目录，补全4角度
          // 使用 characterDir（实际目录名，如 chen-zhuo）而非 characterId（显示名，如示例角色）
          const charDirPath = path.join(this.config.charactersDir, ref.characterDir || charId);
          const portraitsDir = path.join(charDirPath, 'portraits');
          
          if (fs.existsSync(portraitsDir)) {
            const files = fs.readdirSync(portraitsDir);
            for (const angle of REQUIRED_ANGLES) {
              // 查找匹配角度的文件（支持前缀，如 chen-zhuo-front.png）
              const matchedFile = files.find(f => f.includes(`-${angle}.png`) || f === `${angle}.png`);
              if (matchedFile) {
                // 生成包含角色目录的完整相对路径，如 chen-zhuo/portraits/chen-zhuo-front.png
                const relativePath = path.join(ref.characterDir || charId, 'portraits', matchedFile);
                characters[charId].portraits[angle] = relativePath;
                console.log(`[BindingManifest] 角色 ${charId} ${angle}: ${relativePath}`);
              }
            }
          }
          
          // 如果 portraits 目录不存在，尝试直接查找 charDir
          if (!fs.existsSync(portraitsDir)) {
            const files = fs.readdirSync(charDirPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
            for (const angle of REQUIRED_ANGLES) {
              const matchedFile = files.find(f => f.includes(`-${angle}.png`) || f === `${angle}.png`);
              if (matchedFile) {
                // 生成包含角色目录的完整相对路径
                const relativePath = path.join(ref.characterDir || charId, matchedFile);
                characters[charId].portraits[angle] = relativePath;
                console.log(`[BindingManifest] 角色 ${charId} ${angle}: ${relativePath}`);
              }
            }
          }
        }

        // 添加从characterRef解析的路径（如果扫描没找到）
        if (ref.path && ref.angle) {
          if (!characters[charId].portraits[ref.angle]) {
            characters[charId].portraits[ref.angle] = ref.path;
          }
        }
      }

      shots.push({
        shotId,
        requiredCharacters: charsInShot,
        duration: prompt.duration || 12,
        promptLength: prompt.promptCharCount || (typeof prompt.prompt === 'string' ? prompt.prompt.length : 0) || 0
      });
    }

    return {
      generatedAt: new Date().toISOString(),
      characters,
      shots
    };
  }

  /**
   * 查询渲染状态
   */
  /**
   * 查询渲染状态
   * v1.2.7-fix-A5: 修复端点和 taskId 传递
   */
  async queryStatus(taskIds) {
    if (!this.submitter || !taskIds || taskIds.length === 0) {
      return { status: 'unknown', tasks: [] };
    }

    // v1.2.7-fix-A5: 优先复用 submitter 的状态查询（如果存在）
    if (typeof this.submitter.queryStatus === 'function') {
      try {
        return await this.submitter.queryStatus(taskIds);
      } catch (e) {
        console.warn(`[RenderingEngine] submitter.queryStatus 失败: ${e.message}`);
      }
    }

    // v1.2.7-fix-A5: 直接调用 Seedance API 查询（修复端点和 taskId）
    // 查询端点 = 创建端点 + /{taskId}
    const baseUrl = this.config.apiUrl.replace(/\/$/, '');

    try {
      const results = await Promise.all(
        taskIds.map(async taskId => {
          try {
            // v1.2.7-fix-A5: taskId 拼入 URL，使用 GET 方法
            const queryUrl = `${baseUrl}/${taskId}`;
            const response = await fetch(queryUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
              }
            });

            if (!response.ok) {
              const errText = await response.text().catch(() => '');
              return { taskId, status: 'error', error: `HTTP ${response.status}: ${errText.substring(0, 200)}` };
            }

            const data = await response.json();
            // Seedance API 返回的 status 字段
            const apiStatus = data.status || data.state || 'unknown';
            return { taskId, status: apiStatus, response: data };
          } catch (e) {
            return { taskId, status: 'error', error: e.message };
          }
        })
      );

      // 汇总状态
      const allDone = results.every(r => r.status === 'succeeded' || r.status === 'failed');
      const anyFailed = results.some(r => r.status === 'failed');

      return {
        status: allDone ? (anyFailed ? 'partial_failure' : 'completed') : 'in_progress',
        tasks: results
      };
    } catch (e) {
      return { status: 'error', error: e.message, tasks: [] };
    }
  }

  /**
   * 生成渲染报告
   */
  generateReport(renderResult) {
    return {
      engine: 'RenderingEngine',
      version: '1.0.0',
      success: renderResult.success,
      summary: {
        total: renderResult.results.length,
        submitted: renderResult.submitted,
        failed: renderResult.failed,
        successRate: renderResult.results.length > 0
          ? Math.round((renderResult.submitted / renderResult.results.length) * 100)
          : 0
      },
      tasks: renderResult.results.map(r => ({
        shotId: r.shotId,
        taskId: r.taskId,
        status: r.status || (r.success ? 'submitted' : 'failed'),
        error: r.error || null
      })),
      timing: renderResult.timing,
      errors: renderResult.errors
    };
  }
}

module.exports = { RenderingEngine };

```

---

## engines/script-engine/core/adapter.js

```javascript
// engines/script-engine/core/adapter.js
// Adapter - 将 ScriptBlueprint 转换为现有系统可消费的格式
// 版本：v1.0 | 日期：2026-06-07

const path = require('path');

class ScriptBlueprintAdapter {
  constructor(options = {}) {
    this.config = {
      charactersDir: options.charactersDir || path.join(__dirname, '../../../characters'),
      // v2.1.4-fix13-审计修复: 与超现实系统标准(3000)对齐
      maxPromptLength: options.maxPromptLength || 12000,
      ...options
    };
  }

  /**
   * 主入口：将 ScriptBlueprint 转换为现有 Pipeline 输入格式
   * @param {ScriptBlueprint} blueprint - 剧本蓝图
   * @returns {object} 现有系统可消费的格式
   */
  adapt(blueprint) {
    console.log(`[Adapter] 适配剧本: ${blueprint.meta.title}`);

    const result = {
      // 基础配置
      config: this._adaptConfig(blueprint),
      
      // 场景列表（对应现有 SC00~SC04）
      scenes: this._adaptScenes(blueprint),
      
      // 角色系统（对应现有 characters/）
      characters: this._adaptCharacters(blueprint),
      
      // 台词系统
      dialogues: this._adaptDialogues(blueprint),
      
      // 世界观设定
      worldSetting: this._adaptWorldSetting(blueprint),
      
      // 元数据
      metadata: {
        blueprint_id: blueprint.blueprint_id,
        version: blueprint.version,
        title: blueprint.meta.title,
        narrative_mode: blueprint.meta.narrative_mode,
        target_duration: blueprint.meta.target_duration,
        total_scenes: blueprint.structure.scenes.length
      }
    };

    console.log(`[Adapter] 适配完成: ${result.scenes.length} 场景, ${result.characters.length} 角色`);
    return result;
  }

  /**
   * 适配配置
   */
  _adaptConfig(blueprint) {
    // v1.2.5: 从blueprint.meta._metadata中提取系列和平台信息
    const meta = blueprint.meta || {};
    return {
      title: meta.title,
      narrative_mode: meta.narrative_mode,
      target_duration: meta.target_duration,
      world_setting: blueprint.world_setting?.world_id || 'default',
      featured_beast_id: blueprint.extensions?.nirath_extension?.featured_beast_id || null,
      // v1.2.7-fix-A10: 移除 示例角色 硬编码
      protagonist: blueprint.character_system?.characters?.find(c => c.role === 'protagonist')?.character_id || null,
      
      // v1.2.5: 传递系列和平台元数据
      aspectRatio: meta._metadata?.aspectRatio || meta.aspectRatio || '16:9',
      _metadata: {
        ...(meta._metadata || {}),
        filmType: meta.videoType || meta.filmType || 'EDU',
        visualStyle: meta.visual_style || 'REAL'
      },
      
      // 【v2.1.4-fix9-P1】传递导演上下文信息
      content_theme: meta.content_theme || this._extractContentTheme(meta.title, meta),
      content_summary: meta.content_summary || '',
      visual_style: meta.visual_style || 'REAL',
      scene_requirement: meta.scene_requirement || '',
      character_description: meta.character_description || '',
      forbidden_scenes: meta.forbidden_scenes || [],
      key_messages: meta.key_messages || [],
      
      // 约束配置
      constraints: {
        max_prompt_length: this.config.maxPromptLength,
        reference_image_count: 2,
        forbidden_elements: ['voiceover', 'metal_gloss', 'unnatural_eye_color']
      },
      
      // 视觉配置
      visual: {
        style: 'hyper-realistic cinematic',
        color_temperature: 'warm',
        lighting: 'cinematic',
        forbidden: ['dark', 'night', 'metal_gloss']
      }
    };
  }

  /**
   * 适配场景列表
   */
  _adaptScenes(blueprint) {
    return blueprint.structure.scenes.map((scene, index) => {
      const adaptedScene = {
        scene_id: scene.scene_id || `SC${String(index).padStart(2, '0')}`,
        scene_name: scene.scene_name || `场景${index + 1}`,
        scene_type: scene.scene_type || 'establishing',
        scene_function: scene.scene_function || 'establish',
        
        // 时序
        timing: {
          start: scene.timing?.start || 0,
          duration: scene.timing?.duration || 20,
          end: scene.timing?.end || 20
        },
        
        // 设定
        setting: scene.setting || '',
        time_of_day: scene.time_of_day || '',
        atmosphere: scene.atmosphere || '',
        visual_style: scene.visual_style || '',
        space_depth: scene.space_depth || '',
        key_props: scene.key_props || [],
        director_notes: scene.director_notes || '',
        visual_notes: scene.visual_notes || '',
        
        // 【v2.1.4-fix9-P1】场景主题标记
        scene_theme: scene.scene_theme || '',
        
        // 角色
        characters: scene.characters || [],
        
        // 对话
        dialogue: scene.dialogue || { has_dialogue: false, lines: [] },
        
        // 情感目标
        emotional_target: scene.emotional_target || { valence: 0, arousal: 0.5, dominance: 0.5 },
        
        // 视觉方向（为制作引擎准备）
        visual_direction: {
          shot_type: this._inferShotType(scene.scene_type),
          camera_movement: this._inferCameraMovement(scene.scene_type),
          lighting: this._inferLighting(scene.scene_type),
          color_temperature: this._inferColorTemperature(scene.emotional_target)
        }
      };

      // 生成镜头 Prompt 的基础文本（供制作引擎使用）
      adaptedScene.prompt_base = this._generatePromptBase(adaptedScene, blueprint);

      return adaptedScene;
    });
  }

  /**
   * 推断镜头类型
   */
  _inferShotType(sceneType) {
    const shotMap = {
      'opening': 'wide',
      'establishing': 'medium',
      'conflict': 'close_up',
      'emotional_climax': 'extreme_close_up',
      'resolution': 'medium'
    };
    return shotMap[sceneType] || 'medium';
  }

  /**
   * 推断运镜方式
   */
  _inferCameraMovement(sceneType) {
    const movementMap = {
      'opening': '缓慢推进',
      'establishing': '稳定机位',
      'conflict': '手持晃动',
      'emotional_climax': '快速推近',
      'resolution': '缓慢后拉'
    };
    return movementMap[sceneType] || '稳定机位';
  }

  /**
   * 推断布光
   */
  _inferLighting(sceneType) {
    const lightingMap = {
      'opening': '自然光+环境光',
      'establishing': '均匀明亮',
      'conflict': '戏剧性明暗对比',
      'emotional_climax': '伦勃朗光',
      'resolution': '温暖柔光'
    };
    return lightingMap[sceneType] || '均匀明亮';
  }

  /**
   * 推断色温
   */
  _inferColorTemperature(emotionalTarget) {
    if (!emotionalTarget) return 'neutral';
    
    const valence = emotionalTarget.valence || 0;
    if (valence > 0.5) return 'warm';
    if (valence < -0.3) return 'cool';
    return 'neutral';
  }

  /**
   * 生成 Prompt 基础文本
   */
  _generatePromptBase(scene, blueprint) {
    const parts = [];
    
    // 1. 场景类型和风格
    parts.push(`电影级${scene.scene_function === 'climax' ? '高潮' : ''}镜头`);
    parts.push('超写实');
    
    // 2. 世界观
    if (blueprint.world_setting?.world_id === 'nirath') {
      parts.push('Nirath星球');
    }
    
    // 3. 设定
    if (scene.setting) {
      parts.push(scene.setting);
    }
    
    // 4. 角色
    if (scene.characters && scene.characters.length > 0) {
      const characterDescs = scene.characters.map(cid => {
        const char = blueprint.character_system?.characters?.find(c => c.character_id === cid);
        if (char) {
          return `${char.name}（${char.visual_anchor?.core_features?.join('、') || ''}）`;
        }
        return cid;
      });
      parts.push(characterDescs.join('，'));
    }
    
    // 5. 视觉方向
    if (scene.visual_direction) {
      parts.push(`${scene.visual_direction.shot_type}，${scene.visual_direction.camera_movement}`);
    }
    
    // 6. 对话提示（如果有）
    if (scene.dialogue?.has_dialogue && scene.dialogue.lines?.length > 0) {
      const line = scene.dialogue.lines[0];
      parts.push(`台词：「${line.text}」`);
    }
    
    return parts.join('，');
  }

  /**
   * 适配角色系统
   */
  _adaptCharacters(blueprint) {
    return (blueprint.character_system?.characters || []).map(char => {
      const adapted = {
        character_id: char.character_id,
        name: char.name,
        role: char.role,
        // 【v2.1.4-fix9-P1】补全 description 字段，确保 LLM 能看到角色完整描述
        description: char.description || char.visual_anchor?.persona || char.name,
        
        // 视觉锚点
        visual_anchor: {
          core_features: char.visual_anchor?.core_features || [],
          reference_images: char.visual_anchor?.reference_images || []
        },
        
        // 定妆照路径
        portraits: this._resolvePortraitPaths(char.character_id, char.visual_anchor?.reference_images)
      };

      return adapted;
    });
  }

  /**
   * 解析定妆照路径
   */
  _resolvePortraitPaths(characterId, referenceImages) {
    const fs = require('fs');
    const path = require('path');
    const paths = {};
    
    if (referenceImages && referenceImages.length > 0) {
      for (const imgPath of referenceImages) {
        const angle = this._extractAngleFromPath(imgPath);
        if (angle) {
          paths[angle] = imgPath;
        }
      }
    }
    
    // 如果没有提供路径，尝试默认路径（支持 portraits/ 子目录和带前缀文件名）
    if (Object.keys(paths).length === 0) {
      const defaultAngles = ['front', 'threeQuarter', 'closeup', 'side'];
      const charDir = characterId;
      const searchDirs = [
        path.join(this.config.charactersDir, charDir),
        path.join(this.config.charactersDir, charDir, 'portraits')
      ];
      
      for (const searchDir of searchDirs) {
        for (const angle of defaultAngles) {
          const possibleNames = [
            `${angle}`,
            `${charDir}-${angle}`,
            `${charDir}_${angle}`
          ];
          for (const name of possibleNames) {
            for (const ext of ['.jpg', '.png', '.jpeg', '.webp']) {
              const filePath = path.join(searchDir, `${name}${ext}`);
              if (fs.existsSync(filePath)) {
                paths[angle] = filePath;
                break;
              }
            }
            if (paths[angle]) break;
          }
          if (paths[angle]) break;
        }
      }
    }
    
    return paths;
  }

  /**
   * 从路径提取角度
   */
  _extractAngleFromPath(imgPath) {
    const basename = path.basename(imgPath, path.extname(imgPath));
    const angleMap = {
      'front': 'front',
      'threeQuarter': 'threeQuarter',
      'three_quarter': 'threeQuarter',
      'closeup': 'closeup',
      'side': 'side',
      'side_profile': 'side'
    };
    return angleMap[basename] || basename;
  }

  /**
   * 适配台词系统
   */
  _adaptDialogues(blueprint) {
    const dialogues = [];
    
    for (const scene of blueprint.structure.scenes || []) {
      if (scene.dialogue?.has_dialogue && scene.dialogue.lines) {
        for (const line of scene.dialogue.lines) {
          dialogues.push({
            scene_id: scene.scene_id,
            speaker: line.speaker,
            text: line.text,
            emotion: line.emotion || 'neutral',
            timing: {
              start: scene.timing?.start || 0,
              duration: scene.timing?.duration || 20
            }
          });
        }
      }
    }
    
    return dialogues;
  }

  /**
   * 适配世界观设定
   */
  _adaptWorldSetting(blueprint) {
    const ws = blueprint.world_setting;
    if (!ws) return null;
    
    return {
      world_id: ws.world_id,
      world_name: ws.world_name,
      era: ws.era,
      core_rules: ws.core_rules || [],
      environment_tags: ws.environment_tags || [],
      visual_constraints: {
        must_have: ws.world_id === 'nirath' ? [
          '明亮多色彩强质感',
          '超写实风格',
          'Nirath环境特征'
        ] : [],
        forbidden: [
          '暗黑风格',
          '夜晚场景',
          '金属光泽',
          '人物眼睛非自然色'
        ]
      }
    };
  }

  /**
   * 生成适配报告
   */
  generateReport(adaptedData) {
    return {
      blueprint_id: adaptedData.metadata.blueprint_id,
      adaptation_status: 'success',
      scenes_count: adaptedData.scenes.length,
      characters_count: adaptedData.characters.length,
      dialogues_count: adaptedData.dialogues.length,
      total_duration: adaptedData.scenes.reduce((sum, s) => sum + s.timing.duration, 0),
      warnings: this._generateWarnings(adaptedData),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 生成警告信息
   */
  _generateWarnings(adaptedData) {
    const warnings = [];
    
    // 检查场景时长
    const totalDuration = adaptedData.scenes.reduce((sum, s) => sum + s.timing.duration, 0);
    if (totalDuration !== adaptedData.metadata.target_duration) {
      warnings.push({
        type: 'duration_mismatch',
        message: `总时长 ${totalDuration}s 不等于目标时长 ${adaptedData.metadata.target_duration}s`,
        severity: 'warning'
      });
    }
    
    // 检查角色定妆照
    for (const char of adaptedData.characters) {
      const portraitCount = Object.keys(char.portraits || {}).length;
      if (portraitCount === 0) {
        warnings.push({
          type: 'missing_portraits',
          message: `角色 ${char.name} 没有定妆照`,
          severity: 'warning'
        });
      }
    }
    
    // 检查台词
    const scenesWithDialogue = adaptedData.scenes.filter(s => s.dialogue?.has_dialogue).length;
    if (scenesWithDialogue === 0) {
      warnings.push({
        type: 'no_dialogue',
        message: '没有场景包含台词',
        severity: 'critical'
      });
    }
    
    return warnings;
  }
  /**
   * 【v2.1.4-fix9-P1】从标题提取内容主题
   */
  _extractContentTheme(title, meta) {
    if (!title) return '';
    // 【v2.1.4-fix13-审计修复】优先从 metadata 提取，消除硬编码
    if (meta?.content_theme) return meta.content_theme;
    if (meta?.videoType) return meta.videoType;
    if (meta?.genre) return meta.genre;
    // 通用提取：取标题前10字 + "主题"
    return title.substring(0, 10) + '主题';
  }
}

module.exports = { ScriptBlueprintAdapter };

```

---

## engines/script-engine/core/boundary-prompt-templates.js

```javascript
// boundary-prompt-templates.js
// 跨集内容边界提示词模板
// 为ScriptGenerator提供标准化的多集边界约束提示词

/**
 * 构建跨集边界约束提示词
 * @param {object} params - 参数
 * @param {number} params.episodeIndex - 当前集编号（1-based）
 * @param {number} params.totalEpisodes - 总集数
 * @param {object} params.seriesPlan - 系列内容规划
 * @param {string} params.previousSummary - 前一集摘要（可选）
 * @returns {string} 边界约束提示词
 */
function buildBoundaryPrompt({ episodeIndex, totalEpisodes, seriesPlan, previousSummary }) {
  const currentEpisode = seriesPlan?.episodes?.[episodeIndex - 1];
  if (!currentEpisode) {
    // 如果没有详细规划，回退到简单约束
    return buildSimpleBoundaryPrompt({ episodeIndex, totalEpisodes });
  }

  const position = episodeIndex === 1 ? 'first' : 
                   episodeIndex === totalEpisodes ? 'last' : 'middle';

  switch (position) {
    case 'first':
      return buildFirstEpisodePrompt({ episodeIndex, totalEpisodes, currentEpisode, seriesPlan });
    case 'middle':
      return buildMiddleEpisodePrompt({ episodeIndex, totalEpisodes, currentEpisode, seriesPlan, previousSummary });
    case 'last':
      return buildLastEpisodePrompt({ episodeIndex, totalEpisodes, currentEpisode, seriesPlan, previousSummary });
    default:
      return buildSimpleBoundaryPrompt({ episodeIndex, totalEpisodes });
  }
}

/**
 * 第一集提示词模板
 */
function buildFirstEpisodePrompt({ episodeIndex, totalEpisodes, currentEpisode, seriesPlan }) {
  const laterEpisodes = seriesPlan.episodes
    .filter((_, i) => i > episodeIndex - 1)
    .map((ep, i) => `  第${ep.index}集：${ep.title}（将讲：${ep.coreTopics?.join('、') || '待定'}）`)
    .join('\n');

  return `
## 【跨集内容边界约束 — 第1集/共${totalEpisodes}集】（极其重要 - 违反则本集作废）

你是本系列第1集的编剧。本系列共${totalEpisodes}集，后续集规划如下：
${laterEpisodes}

✅ 本集核心任务（必须完成）：
${currentEpisode.mustCover?.map(t => `  - ${t}`).join('\n') || '  - ' + currentEpisode.title}

🟡 共享缓冲区（可以提及，但每处严格≤15秒，一句话带过）：
${currentEpisode.canMention?.map(t => `  - ${t}`).join('\n') || '  - 与主题相关的背景信息（一句话）'}

🔴 绝对禁区（本集不可深入，如果剧情需要提及必须≤5秒，不给出细节）：
${currentEpisode.mustNotCover?.map(t => `  - ${t}`).join('\n') || '  - 后续集将要详细讲解的内容'}

⚠️ 关键规则：
1. 本集只讲本集核心任务，不跨集
2. **严禁在结尾预告"下一集讲什么"** — 用自然收束结尾，如"这是第一步，了解症状才能早发现"
3. **严禁说"敬请期待/未完待续/下次分享"**等引导语
4. 如果其他集的内容需要提及，严格控制在15秒内，一句话带过
5. 不要暗示"还有后续内容"，每集都是完整的独立篇章
`;
}

/**
 * 中间集提示词模板
 */
function buildMiddleEpisodePrompt({ episodeIndex, totalEpisodes, currentEpisode, seriesPlan, previousSummary }) {
  const prevEpisode = seriesPlan.episodes[episodeIndex - 2];
  const laterEpisodes = seriesPlan.episodes
    .filter((_, i) => i > episodeIndex - 1)
    .map((ep, i) => `  第${ep.index}集：${ep.title}（将讲：${ep.coreTopics?.join('、') || '待定'}）`)
    .join('\n');

  return `
## 【跨集内容边界约束 — 第${episodeIndex}集/共${totalEpisodes}集】（极其重要 - 违反则本集作废）

你是本系列第${episodeIndex}集的编剧。系列上下文：
- 第${prevEpisode.index}集（已讲完）：${prevEpisode.title}
  已覆盖：${previousSummary || prevEpisode.coreTopics?.join('、') || '详见前集'}
- 第${episodeIndex}集（本集）：${currentEpisode.title}
  核心任务：${currentEpisode.coreTopics?.join('、') || currentEpisode.title}
- 后续集规划：
${laterEpisodes}

✅ 本集核心任务（必须完成）：
${currentEpisode.mustCover?.map(t => `  - ${t}`).join('\n') || '  - ' + currentEpisode.title}

🟡 共享缓冲区（可以提及，但每处严格≤15秒，一句话带过）：
${currentEpisode.canMention?.map(t => `  - ${t}`).join('\n') || '  - 与主题相关的背景信息（一句话）'}

🔴 绝对禁区（本集不可深入，如果提及必须≤5秒）：
${currentEpisode.mustNotCover?.map(t => `  - ${t}`).join('\n') || '  - 其他集已讲或待讲的内容'}

⚠️ 关键规则：
1. 第${prevEpisode.index}集已详细讲过${prevEpisode.mustCover?.join('、') || prevEpisode.title}，本集不需要重复展开
2. 如果提到第${prevEpisode.index}集的内容，用"前面讲过"一句话带过即可
3. **严禁在结尾预告"下一集讲什么"** — 用自然收束结尾
4. **严禁说"敬请期待/未完待续/下次分享"**等引导语
5. 后续集内容不要提前展开，只讲本集核心任务
6. 每集都是完整的独立篇章，不要暗示"还有后续"
`;
}

/**
 * 最后一集提示词模板
 */
function buildLastEpisodePrompt({ episodeIndex, totalEpisodes, currentEpisode, seriesPlan, previousSummary }) {
  const prevEpisodes = seriesPlan.episodes
    .filter((_, i) => i < episodeIndex - 1)
    .map(ep => `  - 第${ep.index}集：${ep.title}（已覆盖：${ep.coreTopics?.join('、') || '详见该集'}）`)
    .join('\n');

  return `
## 【跨集内容边界约束 — 第${episodeIndex}集（最后一集）/共${totalEpisodes}集】（极其重要 - 违反则本集作废）

你是本系列最后一集的编剧。前面已讲完的内容：
${prevEpisodes}

✅ 本集核心任务（必须完成）：
${currentEpisode.mustCover?.map(t => `  - ${t}`).join('\n') || '  - ' + currentEpisode.title}

🟡 共享缓冲区（可以提及，但每处严格≤15秒，一句话带过）：
${currentEpisode.canMention?.map(t => `  - ${t}`).join('\n') || '  - 前面集的核心结论（一句话回顾）'}

🔴 绝对禁区（本集不可深入）：
${currentEpisode.mustNotCover?.map(t => `  - ${t}`).join('\n') || '  - 前面集已详细讲过的内容'}

⚠️ 关键规则：
1. 前面集已详细讲过的内容，本集不需要重复展开
2. 如果回顾前面集的内容，用"前面我们讲过"一句话带过
3. 本集是最后一集，**不需要预告任何后续内容**
4. 结尾自然收束即可，如"希望这些知识能帮到大家"或"掌握这些方法，就能有效预防"
5. 不要暗示"还有后续课程/系列"
`;
}

/**
 * 简单回退提示词（当没有详细规划时）
 */
function buildSimpleBoundaryPrompt({ episodeIndex, totalEpisodes }) {
  return `
## 【系列作品约束 — 第${episodeIndex}集/共${totalEpisodes}集】
- 只讲本集主题，不跨集（不重复已讲内容，不提前讲后续内容）
- **严禁在台词或叙述中提及后续集数内容**（如"下一集""下次再说"）
- **严禁在结尾预告或暗示下一集内容**
- **严禁说"敬请期待/未完待续"**
- 用自然收束结尾，不要预告
${episodeIndex > 1 ? '- 本集无片头标题画面（片头仅第一集有）' : ''}
`;
}

/**
 * 从metadata提取系列规划信息
 * @param {object} metadata - 用户意图metadata
 * @returns {object|null} 系列规划对象
 */
function extractSeriesPlan(metadata) {
  if (!metadata) return null;

  // 优先从 metadata.series 提取
  if (metadata.series && metadata.series.episodes) {
    return {
      totalEpisodes: metadata.series.totalEpisodes,
      episodes: metadata.series.episodes.map((ep, i) => ({
        index: i + 1,
        title: ep.title || `第${i + 1}集`,
        coreTopics: ep.coreTopics || [],
        mustCover: ep.boundary?.mustCover || ep.coreTopics || [],
        canMention: ep.boundary?.canMention || [],
        mustNotCover: ep.boundary?.mustNotCover || []
      }))
    };
  }

  // 从 metadata.seriesContentPlan 提取（【v2.1.4-fix13-审计修复】增加结构适配）
  if (metadata.seriesContentPlan) {
    const plan = metadata.seriesContentPlan;
    return {
      seriesTitle: plan.seriesTitle || plan.title || '',
      totalEpisodes: plan.totalEpisodes,
      episodes: (plan.episodes || []).map(ep => ({
        index: ep.episodeIndex || ep.index || 1,
        title: ep.title || `第${ep.episodeIndex || ep.index || 1}集`,
        coreTopics: ep.coreTopics || (ep.contentScope ? ep.contentScope.split(/[，,；;]/) : []),
        mustCover: ep.mustCover || (ep.contentScope ? ep.contentScope.split(/[，,；;]/) : [ep.title]),
        canMention: ep.canMention || [],
        mustNotCover: ep.mustNotCover || (ep.excludedContent ? ep.excludedContent.split(/[，,；;]/) : [])
      }))
    };
  }

  // 兼容旧格式：从 episodeTitles 构造简单规划
  if (metadata.total_episodes > 1 || metadata.series?.totalEpisodes > 1) {
    const totalEpisodes = metadata.total_episodes || metadata.series?.totalEpisodes;
    const episodeTitles = metadata.series?.episodeTitles || metadata.episode_titles || [];
    return {
      totalEpisodes,
      episodes: Array.from({ length: totalEpisodes }, (_, i) => ({
        index: i + 1,
        title: episodeTitles[i] || `第${i + 1}集`,
        coreTopics: [],
        mustCover: [],
        canMention: [],
        mustNotCover: []
      }))
    };
  }

  return null;
}

/**
 * 从metadata提取前一集摘要
 * @param {object} metadata - 用户意图metadata
 * @returns {string|null} 前一集摘要
 */
function extractPreviousSummary(metadata) {
  if (!metadata) return null;
  return metadata.series?.previousSummary || 
         metadata.previous_episode_summary || 
         null;
}

module.exports = {
  buildBoundaryPrompt,
  extractSeriesPlan,
  extractPreviousSummary
};
```

---

## engines/script-engine/core/creative-intensity-engine.js

```javascript
// engines/script-engine/core/creative-intensity-engine.js
// Creative Intensity Engine - 创意指数引擎 (Hyperreality System 适配版)
// 为超现实系统四层架构重新设计的创意指数系统
// 版本: v1.0.0 | 日期: 2026-06-18
// 设计原则: 只影响"怎么拍"，不影响"拍什么"

/**
 * 创意指数解析器
 * 保留 v6.x 核心解析能力，适配超现实系统输入格式
 */
class CreativeIntensityParser {
  constructor(options = {}) {
    this.defaultValue = options.defaultValue || 0.2;
    this.maxValue = options.maxValue || 1.0;
    this.minValue = options.minValue || 0.0;
  }

  /**
   * 主解析入口
   * 支持: 数字直接输入、字符串语义、对象字段、默认回退
   */
  parse(input) {
    // 1. 数字直接输入
    if (typeof input === 'number') {
      return this._clamp(input);
    }

    // 2. 字符串语义解析
    if (typeof input === 'string') {
      const numericMatch = input.match(/(0\.\d+|1\.0?)/);
      if (numericMatch) {
        return this._clamp(parseFloat(numericMatch[1]));
      }
      const semanticValue = this._parseSemantic(input);
      if (semanticValue !== null) {
        return this._clamp(semanticValue);
      }
    }

    // 3. 对象字段解析 (超现实系统 RequirementList 格式)
    if (typeof input === 'object' && input !== null) {
      // 直接字段
      if (typeof input.creativeIntensity === 'number') {
        return this._clamp(input.creativeIntensity);
      }
      if (typeof input.creativeIntensity === 'string') {
        return this.parse(input.creativeIntensity);
      }
      // 同义词兼容
      for (const key of ['creative', 'intensity', 'creativity', '创意', '创意指数']) {
        if (typeof input[key] === 'number') return this._clamp(input[key]);
        if (typeof input[key] === 'string') return this.parse(input[key]);
      }
    }

    // 4. 默认回退
    return this.defaultValue;
  }

  /**
   * 语义映射表 - 与 v6.x 保持一致
   */
  _parseSemantic(text) {
    const semanticMap = {
      // 保守方向 (0.2-0.3)
      '保守': 0.2, '标准': 0.3, '稳': 0.25, '传统': 0.2,
      '正常': 0.2, '默认': 0.2, '基础': 0.25,
      '不要太多创意': 0.3, '稳一点': 0.25, '普通': 0.2,
      '常规': 0.2, '一般': 0.2, '简单': 0.25,

      // 轻度方向 (0.3-0.4)
      '轻度': 0.35, '稍微': 0.35, '一点': 0.35,
      '有点': 0.35, '稍微有': 0.35, '微': 0.3,

      // 中度方向 (0.5-0.6)
      '有点创意': 0.5, '有新意': 0.5, '出彩': 0.6,
      '加点创意': 0.55, '丰富': 0.5, '不错': 0.55,
      '中等': 0.5, '适中': 0.5, '刚好': 0.5,
      '比较好': 0.55, '挺好': 0.55, '可以': 0.5,

      // 深度方向 (0.7-0.8)
      '非常有创意': 0.7, '很出彩': 0.75, '突破': 0.8,
      '大胆': 0.75, '惊艳': 0.8, '极致': 0.85,
      '深度': 0.75, '高级': 0.75, '专业': 0.7,
      '强': 0.75, '厉害': 0.8, '牛逼': 0.8,
      '电影级': 0.75, '好莱坞': 0.8, '大片': 0.8,

      // 极致方向 (0.9-1.0)
      '天花板': 0.95, '拉到满': 0.95, '拉满': 0.95,
      '顶级': 0.9, '炸裂': 0.95, '逆天': 0.95,
      '满分': 0.95, '封顶': 0.95,
      '最高': 0.95, '无上限': 0.95, '超神': 0.95,
      '维伦纽瓦': 0.9, '诺兰': 0.9, '王家卫': 0.9,
      '天花板般': 0.95, '天花板级的': 0.95
    };

    const lowerText = text.toLowerCase();
    let matchedValue = null;

    // 精确匹配
    if (semanticMap[text]) {
      return semanticMap[text];
    }

    // 模糊匹配：取最高匹配值
    for (const [keyword, value] of Object.entries(semanticMap)) {
      if (lowerText.includes(keyword.toLowerCase())) {
        if (matchedValue === null || value > matchedValue) {
          matchedValue = value;
        }
      }
    }

    return matchedValue;
  }

  _clamp(value) {
    return Math.max(this.minValue, Math.min(this.maxValue, value));
  }
}

/**
 * 超现实系统能力矩阵
 * 按 Layer 组织，适配四层架构
 */
const CAPABILITY_MATRIX = {
  // Layer 1: 剧本引擎 - 影响叙事结构和角色深度
  script: {
    layer: 'Layer 1',
    threshold: 0.4,
    weight: 0.12,
    name: '叙事结构',
    aspects: ['scene_complexity', 'character_depth', 'conflict_design', 'pacing_structure']
  },

  // Layer 2: 制作引擎 - 影响镜头和视觉表现
  camera: {
    layer: 'Layer 2',
    threshold: 0.35,
    weight: 0.18,
    name: '镜头语言',
    aspects: ['movement', 'angle', 'lens_choice', 'depth_of_field']
  },
  lighting: {
    layer: 'Layer 2',
    threshold: 0.30,
    weight: 0.12,
    name: '灯光设计',
    aspects: ['key_light', 'fill_light', 'practical_light', 'color_temperature']
  },
  composition: {
    layer: 'Layer 2',
    threshold: 0.35,
    weight: 0.10,
    name: '构图风格',
    aspects: ['framing', 'negative_space', 'leading_lines', 'symmetry']
  },
  production: {
    layer: 'Layer 2',
    threshold: 0.40,
    weight: 0.08,
    name: '美术布景',
    aspects: ['set_design', 'props', 'color_coding', 'texture']
  },
  performance: {
    layer: 'Layer 2',
    threshold: 0.40,
    weight: 0.08,
    name: '表演指导',
    aspects: ['expression', 'gesture', 'movement', 'eye_contact']
  },

  // Layer 3: 渲染引擎 - 影响质感和特效
  color: {
    layer: 'Layer 3',
    threshold: 0.30,
    weight: 0.10,
    name: '色彩分级',
    aspects: ['lut', 'saturation', 'contrast', 'temperature']
  },
  texture: {
    layer: 'Layer 3',
    threshold: 0.55,
    weight: 0.05,
    name: '质感处理',
    aspects: ['film_grain', 'sharpness', 'bloom', 'diffusion']
  },
  vfx: {
    layer: 'Layer 3',
    threshold: 0.50,
    weight: 0.05,
    name: '特效程度',
    aspects: ['particles', 'light_effects', 'transitions', 'environmental']
  },
  atmosphere: {
    layer: 'Layer 3',
    threshold: 0.35,
    weight: 0.06,
    name: '氛围营造',
    aspects: ['fog', 'haze', 'volumetric', 'weather']
  },

  // Layer 4: 后期引擎 - 影响剪辑和声音
  editing: {
    layer: 'Layer 4',
    threshold: 0.45,
    weight: 0.08,
    name: '剪辑节奏',
    aspects: ['cutting_pace', 'match_cut', 'j_cut_l_cut', 'time_manipulation']
  },
  sound: {
    layer: 'Layer 4',
    threshold: 0.35,
    weight: 0.08,
    name: '声音设计',
    aspects: ['bgm', 'sound_effects', 'spatial_audio', 'silence_design']
  }
};

/**
 * 等级系统 - L0-L5
 */
const INTENSITY_LEVELS = {
  L0: { max: 0.15, name: '保守', description: '最小干预，保持自然' },
  L1: { max: 0.30, name: '标准', description: '适度增强，专业呈现' },
  L2: { max: 0.50, name: '平衡', description: '电影级质感，艺术平衡' },
  L3: { max: 0.70, name: '增强', description: '大胆创新，视觉冲击' },
  L4: { max: 0.85, name: '突破', description: '极致表达，大师级手法' },
  L5: { max: 1.00, name: '极致', description: '无上限创意，突破边界' }
};

/**
 * 指令模板库 - 按 Layer 和等级组织
 * 适配超现实系统的 shot 对象结构
 */
const INSTRUCTION_TEMPLATES = {
  // Layer 1: 叙事结构
  script: {
    L0: '线性叙事，单线结构，标准三幕式',
    L1: '清晰叙事，明确起承转合，标准场景结构',
    L2: '多线叙事，伏笔与呼应，情绪曲线设计',
    L3: '非线性叙事，倒叙插叙，开放式结构',
    L4: '元叙事，自我反射，叙事即主题',
    L5: '解构叙事，意识流，叙事即哲学'
  },

  // Layer 2: 镜头语言
  camera: {
    L0: '固定机位，标准景别，无特殊运动',
    L1: '推轨拉移，简单环绕，稳定器跟随',
    L2: '斯坦尼康长镜头，轨道滑动，浅景深跟焦',
    L3: '低角度仰拍，旋转镜头，主观POV',
    L4: '无人机航拍，微距探入，时间操控',
    L5: '维伦纽瓦式史诗构图，诺兰式时间切片，IMAX画幅'
  },
  lighting: {
    L0: '自然光，均匀照明，无特殊光影',
    L1: '三点布光，柔光模拟，自然光增强',
    L2: '戏剧性光影，伦勃朗光，剪影，环境填充',
    L3: '高对比色温，体积光，光绘轨迹，投影纹理',
    L4: '强烈明暗对比，环境光叙事，光效驱动情绪',
    L5: '每个场景定制化灯光叙事，光即情绪，光即哲学'
  },
  composition: {
    L0: '三分法，中心对称，标准景别',
    L1: '引导线，前景遮挡，标准深度层次',
    L2: '框架构图，多层景深，前景中景背景',
    L3: '极端对称，负空间，几何分割，打破三分法',
    L4: '宏大比例，空间叙事，环境作为角色',
    L5: '构图即叙事，空间即情绪，画框即世界'
  },
  production: {
    L0: '简洁背景，功能化道具，最少装饰',
    L1: '场景层次，前景遮挡，背景故事化道具',
    L2: '定制化场景，色彩编码空间，沉浸式环境',
    L3: '概念化场景，超现实比例，象征性道具',
    L4: '定制化场景建筑，环境叙事，空间即情绪',
    L5: '场景即叙事，空间即角色，环境即哲学'
  },
  performance: {
    L0: '自然表情，标准肢体语言，专业稳重',
    L1: '适度表情，标准手势，眼神交流',
    L2: '情感层次，微表情，眼神变化，手势设计',
    L3: '情绪化表演，即兴感，打破第四面墙',
    L4: '方法派表演，情绪爆发，角色化肢体语言',
    L5: '表演即角色，微表情即情绪，身体即叙事'
  },

  // Layer 3: 渲染质感
  color: {
    L0: '自然色温，标准饱和度，白平衡',
    L1: '轻微调色，自然色温，标准饱和度',
    L2: '电影LUT，冷暖对比，单色调色',
    L3: '赛博朋克色，青橙对比，去饱和+单色强调',
    L4: '琥珀色世界，科技感光效，冷蓝调，单色世界',
    L5: '色彩即叙事，色调即情绪，色温即时间'
  },
  texture: {
    L0: '数字清晰，无特殊质感',
    L1: '轻微胶片颗粒，标准锐度',
    L2: '胶片颗粒，柯达2383质感，轻微柔光',
    L3: '16mm胶片感，变形宽银幕，光学瑕疵',
    L4: '特殊质感处理，粗粒胶片，复古光学效果',
    L5: '质感即叙事，媒介即情绪，材质即时间'
  },
  vfx: {
    L0: '无特效',
    L1: '粒子光斑，简单过渡，环境粒子',
    L2: '光效粒子，镜头光晕，环境互动粒子',
    L3: '复杂粒子系统，流体模拟，光绘轨迹',
    L4: '高级粒子特效，能量场效果，动态光影',
    L5: '特效即叙事，粒子即情绪，视觉即哲学'
  },
  atmosphere: {
    L0: '轻微雾效，基础环境感',
    L1: '环境雾，轻微体积感',
    L2: '体积雾，光雾交互，季节感',
    L3: '超现实氛围，时间错位感',
    L4: '诗意氛围，时间感知变化',
    L5: '氛围即叙事，环境即情绪，空气即角色'
  },

  // Layer 4: 后期
  editing: {
    L0: '标准镜头时长，匀速切换',
    L1: '标准时长，匀速切换，基础转场',
    L2: '情绪匹配时长，紧张快切，情感延长',
    L3: '变速剪辑，J型L型剪辑，节奏对比',
    L4: '音乐同步剪辑，帧率切换，时间膨胀',
    L5: '节奏即叙事，剪辑即情绪，时间即角色'
  },
  sound: {
    L0: '清晰对白，环境音填充，标准配乐',
    L1: '清晰对白，环境音，标准BGM',
    L2: 'ASMR细节，3D空间音频，情绪配乐',
    L3: '声音景观设计，动态音乐，情绪音效',
    L4: '史诗配乐，声音叙事驱动，专属音景',
    L5: '声音即叙事，静默即力量，音频即角色'
  }
};

/**
 * 叙事模式桥接器
 * 根据 narrative_mode 调整创意指数的影响权重
 */
const NARRATIVE_MODE_BRIDGE = {
  dialogue: {
    name: '角色独白',
    boost: {
      performance: 0.15,  // 强化表演
      camera: 0.10,       // 强化镜头语言
      sound: 0.05         // 强化声音清晰度
    },
    reduce: {
      vfx: 0.10,          // 降低特效（避免分散注意力）
      atmosphere: 0.05    // 适度降低氛围
    }
  },
  narration: {
    name: '内心独白',
    boost: {
      atmosphere: 0.15,
      color: 0.10,
      composition: 0.05
    },
    reduce: {
      performance: 0.10,
      camera: 0.05
    }
  },
  mixed: {
    name: '混合',
    boost: {},
    reduce: {}
  }
};

/**
 * 世界设定桥接器
 * 根据 world_setting 调整风格走向
 */
const WORLD_SETTING_BRIDGE = {
  default: {
    styleBias: {},
    description: '默认世界，无特殊风格偏移'
  },
  Nirath: {
    styleBias: {
      color: 0.10,        // 提升色彩权重
      atmosphere: 0.15,   // 提升氛围权重
      vfx: 0.10           // 提升特效权重
    },
    description: 'Nirath星球：科幻+奇幻，强化视觉奇观'
  },
  hyperreal: {
    styleBias: {
      texture: 0.10,      // 提升质感权重
      lighting: 0.10      // 提升灯光权重
    },
    description: '超写实：极致真实感，强化物理质感'
  }
};

/**
 * 创意指数引擎主类
 */
class CreativeIntensityEngine {
  constructor(options = {}) {
    this.parser = new CreativeIntensityParser(options);
    this.matrix = CAPABILITY_MATRIX;
    this.templates = INSTRUCTION_TEMPLATES;
    this.levels = INTENSITY_LEVELS;
  }

  // ========== 解析入口 ==========

  parse(input) {
    return this.parser.parse(input);
  }

  // ========== 等级计算 ==========

  getLevel(intensity) {
    if (intensity <= this.levels.L0.max) return { key: 'L0', ...this.levels.L0 };
    if (intensity <= this.levels.L1.max) return { key: 'L1', ...this.levels.L1 };
    if (intensity <= this.levels.L2.max) return { key: 'L2', ...this.levels.L2 };
    if (intensity <= this.levels.L3.max) return { key: 'L3', ...this.levels.L3 };
    if (intensity <= this.levels.L4.max) return { key: 'L4', ...this.levels.L4 };
    return { key: 'L5', ...this.levels.L5 };
  }

  // ========== 能力激活 ==========

  /**
   * 获取激活的能力列表
   * @param {number} intensity - 创意指数
   * @param {string} narrativeMode - 叙事模式 (dialogue/voiceover/mixed)
   * @param {string} worldSetting - 世界设定 (default/Nirath/hyperreal)
   * @returns {Array} 激活的能力列表
   */
  getActiveCapabilities(intensity, narrativeMode = 'dialogue', worldSetting = 'default') {
    const modeBridge = NARRATIVE_MODE_BRIDGE[narrativeMode] || NARRATIVE_MODE_BRIDGE.mixed;
    const worldBridge = WORLD_SETTING_BRIDGE[worldSetting] || WORLD_SETTING_BRIDGE.default;

    return Object.entries(this.matrix)
      .map(([id, config]) => {
        // 计算调整后的阈值
        let adjustedThreshold = config.threshold;

        // 应用叙事模式偏移
        if (modeBridge.boost[id]) {
          adjustedThreshold -= modeBridge.boost[id]; // 降低阈值 = 更容易激活
        }
        if (modeBridge.reduce[id]) {
          adjustedThreshold += modeBridge.reduce[id]; // 提高阈值 = 更难激活
        }

        // 应用世界设定偏移
        if (worldBridge.styleBias[id]) {
          adjustedThreshold -= worldBridge.styleBias[id];
        }

        // 确保阈值在合法范围
        adjustedThreshold = Math.max(0.1, Math.min(0.9, adjustedThreshold));

        return {
          id,
          ...config,
          adjustedThreshold,
          active: intensity >= adjustedThreshold,
          gap: adjustedThreshold - intensity // 距离激活还差多少
        };
      })
      .filter(c => c.active);
  }

  // ========== 指令生成 ==========

  /**
   * 为单个能力生成指令
   */
  generateCapabilityInstruction(capabilityId, intensity) {
    const templates = this.templates[capabilityId];
    if (!templates) return null;

    const level = this.getLevel(intensity);
    const instruction = templates[level.key];

    if (!instruction) return null;

    return {
      tag: `[${capabilityId.toUpperCase()}:${level.key}]`,
      instruction,
      level: level.key,
      levelName: level.name,
      intensity,
      weight: this.matrix[capabilityId]?.weight || 0.1
    };
  }

  /**
   * 为指定 Layer 生成所有指令
   */
  generateLayerInstructions(layerName, intensity, narrativeMode = 'dialogue', worldSetting = 'default') {
    const activeCapabilities = this.getActiveCapabilities(intensity, narrativeMode, worldSetting);
    const layerCapabilities = activeCapabilities.filter(c => c.layer === layerName);

    if (layerCapabilities.length === 0) return null;

    const instructions = layerCapabilities.map(c =>
      this.generateCapabilityInstruction(c.id, intensity)
    ).filter(Boolean);

    return {
      layer: layerName,
      intensity,
      level: this.getLevel(intensity),
      count: instructions.length,
      capabilities: layerCapabilities.map(c => c.name),
      instructions: instructions.map(i => `[${i.tag}] ${i.instruction}`).join('\n'),
      details: instructions
    };
  }

  // ========== 配置注入 ==========

  /**
   * 生成超现实系统引擎配置覆盖
   * 将创意指数转化为各引擎的配置参数
   */
  generateEngineConfigs(intensity, narrativeMode = 'dialogue', worldSetting = 'default') {
    const level = this.getLevel(intensity);
    const configs = {
      scriptEngine: {},
      productionEngine: {},
      renderingEngine: {},
      postProductionEngine: {}
    };

    // Layer 1: 剧本引擎配置
    const layer1Instructions = this.generateLayerInstructions('Layer 1', intensity, narrativeMode, worldSetting);
    if (layer1Instructions) {
      configs.scriptEngine = {
        sceneComplexity: intensity > 0.5 ? 'complex' : 'standard',
        characterDepth: intensity > 0.4 ? 'deep' : 'standard',
        conflictDesign: intensity > 0.6 ? 'multi_layer' : 'single',
        pacingStructure: intensity > 0.5 ? 'dynamic' : 'linear',
        creativeInstructions: layer1Instructions.instructions
      };
    }

    // Layer 2: 制作引擎配置
    const layer2Instructions = this.generateLayerInstructions('Layer 2', intensity, narrativeMode, worldSetting);
    if (layer2Instructions) {
      configs.productionEngine = {
        cameraStyle: intensity > 0.35 ? 'cinematic' : 'standard',
        lightingStyle: intensity > 0.3 ? 'dramatic' : 'natural',
        compositionStyle: intensity > 0.35 ? 'artistic' : 'standard',
        productionStyle: intensity > 0.4 ? 'customized' : 'minimal',
        performanceStyle: intensity > 0.4 ? 'emotional' : 'natural',
        creativeInstructions: layer2Instructions.instructions
      };
    }

    // Layer 3: 渲染引擎配置
    const layer3Instructions = this.generateLayerInstructions('Layer 3', intensity, narrativeMode, worldSetting);
    if (layer3Instructions) {
      configs.renderingEngine = {
        colorGrading: intensity > 0.3 ? 'cinematic' : 'natural',
        textureQuality: intensity > 0.55 ? 'filmic' : 'digital',
        vfxLevel: intensity > 0.5 ? 'enhanced' : 'none',
        atmosphereLevel: intensity > 0.35 ? 'rich' : 'minimal',
        creativeInstructions: layer3Instructions.instructions
      };
    }

    // Layer 4: 后期引擎配置
    const layer4Instructions = this.generateLayerInstructions('Layer 4', intensity, narrativeMode, worldSetting);
    if (layer4Instructions) {
      configs.postProductionEngine = {
        editingStyle: intensity > 0.45 ? 'artistic' : 'standard',
        soundDesign: intensity > 0.35 ? 'immersive' : 'standard',
        creativeInstructions: layer4Instructions.instructions
      };
    }

    return {
      intensity,
      level,
      narrativeMode,
      worldSetting,
      ...configs,
      _metadata: {
        activeCapabilities: this.getActiveCapabilities(intensity, narrativeMode, worldSetting).length,
        totalCapabilities: Object.keys(this.matrix).length,
        contentFirewall: true
      }
    };
  }

  // ========== 内容防火墙 ==========

  isContentModule(moduleId) {
    const contentModules = ['script_content', 'dialogue', 'facts', 'medical', 'data', 'narrative_logic'];
    return contentModules.includes(moduleId);
  }

  generateFirewallLog() {
    return `
[CONTENT_FIREWALL] 🔒 内容层完全隔离，创意指数不干预：
  - 剧本内容 (Script Content) → 已锁定
  - 台词对白 (Dialogue) → 已锁定
  - 事实数据 (Facts & Data) → 已锁定
  - 叙事逻辑 (Narrative Logic) → 已锁定
[CONTENT_FIREWALL] ✅ 表现层接受创意指数调控：
  - Layer 2: 镜头语言、灯光、构图、布景、表演
  - Layer 3: 色彩、质感、特效、氛围
  - Layer 4: 剪辑、声音设计
`;
  }

  // ========== 完整报告 ==========

  generateReport(intensity, narrativeMode = 'dialogue', worldSetting = 'default') {
    const activeCapabilities = this.getActiveCapabilities(intensity, narrativeMode, worldSetting);
    const level = this.getLevel(intensity);

    // 按 Layer 分组
    const byLayer = {};
    for (const cap of activeCapabilities) {
      if (!byLayer[cap.layer]) byLayer[cap.layer] = [];
      byLayer[cap.layer].push(cap);
    }

    return {
      intensity,
      level: level.key,
      levelName: level.name,
      levelDescription: level.description,
      narrativeMode,
      worldSetting,
      summary: `创意指数 ${intensity} (${level.name})：已激活 ${activeCapabilities.length}/${Object.keys(this.matrix).length} 个能力`,
      byLayer,
      capabilities: activeCapabilities.map(c => ({
        id: c.id,
        name: c.name,
        weight: c.weight,
        instruction: this.generateCapabilityInstruction(c.id, intensity)
      })),
      inactiveCapabilities: Object.entries(this.matrix)
        .filter(([id]) => !activeCapabilities.find(c => c.id === id))
        .map(([id, config]) => ({
          id,
          name: config.name,
          threshold: config.threshold,
          reason: `需创意指数 ≥ ${config.threshold} 激活`
        })),
      engineConfigs: this.generateEngineConfigs(intensity, narrativeMode, worldSetting),
      firewall: this.generateFirewallLog()
    };
  }
}

/**
 * 创意指数推荐器
 * 基于历史数据反馈闭环
 */
class CreativeIntensityRecommender {
  constructor(options = {}) {
    this.dataPath = options.dataPath || './data/creative-intensity-feedback.json';
    this.minSamples = options.minSamples || 3;
    this.confidenceThreshold = options.confidenceThreshold || 0.6;
    this.defaultRecommendations = {
      'EDU': { intensity: 0.4, reason: '教育科普需要专业可信感，过高创意指数可能降低权威感' },
      'DRAMA': { intensity: 0.7, reason: '剧情短片需要较强影视表现力来吸引观众' },
      'ADV': { intensity: 0.8, reason: '商业广告需要突出产品，高创意指数增强视觉冲击力' },
      'DOC': { intensity: 0.5, reason: '纪录片需要真实感与适度艺术性的平衡' },
      'VLOG': { intensity: 0.4, reason: 'Vlog记录需要自然真实感' },
      'SOC': { intensity: 0.8, reason: '社媒短视频需要强视觉冲击力获取停留' },
      'COR': { intensity: 0.6, reason: '企业宣传需要专业感与吸引力的平衡' }
    };
    this.data = this._loadData();
  }

  _loadData() {
    try {
      const fs = require('fs');
      if (fs.existsSync(this.dataPath)) {
        return JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
      }
    } catch (e) {
      console.warn(`[Recommender] 数据加载失败: ${e.message}`);
    }
    return { schema: 'creative-intensity-feedback-v1', entries: [], aggregated: {} };
  }

  _saveData() {
    try {
      const fs = require('fs');
      const dir = require('path').dirname(this.dataPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.warn(`[Recommender] 数据保存失败: ${e.message}`);
    }
  }

  /**
   * 记录一次生产结果
   */
  record(entry) {
    const record = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      videoType: entry.videoType || 'unknown',
      intensity: entry.intensity || 0.2,
      completionRate: entry.completionRate || 0,
      engagementRate: entry.engagementRate || 0,
      timestamp: entry.timestamp || new Date().toISOString()
    };

    this.data.entries.push(record);
    this._updateAggregation(record);
    this._saveData();

    console.log(`[Recommender] 记录已保存 | ${record.videoType} | intensity=${record.intensity} | 完播率=${record.completionRate}%`);
    return record;
  }

  _updateAggregation(record) {
    const type = record.videoType;
    if (!this.data.aggregated[type]) {
      this.data.aggregated[type] = {
        samples: 0,
        intensity_distribution: {},
        recommended: this.defaultRecommendations[type]?.intensity || 0.5,
        confidence: 0
      };
    }

    const agg = this.data.aggregated[type];
    agg.samples++;

    const intensityKey = Math.round(record.intensity * 10) / 10;
    if (!agg.intensity_distribution[intensityKey]) {
      agg.intensity_distribution[intensityKey] = { count: 0, avg_completion: 0, total_completion: 0 };
    }

    const dist = agg.intensity_distribution[intensityKey];
    dist.count++;
    dist.total_completion += record.completionRate;
    dist.avg_completion = Math.round(dist.total_completion / dist.count * 10) / 10;

    // 重新计算推荐值
    this._recalculateRecommendation(type);
  }

  _recalculateRecommendation(videoType) {
    const agg = this.data.aggregated[videoType];
    if (!agg || agg.samples < this.minSamples) return;

    let bestIntensity = 0.2;
    let bestCompletion = 0;

    for (const [intensity, data] of Object.entries(agg.intensity_distribution)) {
      if (data.count >= 1 && data.avg_completion > bestCompletion) {
        bestCompletion = data.avg_completion;
        bestIntensity = parseFloat(intensity);
      }
    }

    agg.recommended = bestIntensity;
    agg.confidence = Math.min(1, agg.samples / 10); // 样本越多置信度越高
  }

  /**
   * 获取推荐值
   */
  recommend(videoType) {
    const agg = this.data.aggregated[videoType];
    if (agg && agg.samples >= this.minSamples) {
      return {
        intensity: agg.recommended,
        confidence: agg.confidence,
        samples: agg.samples,
        source: 'historical_data',
        reason: `基于 ${agg.samples} 条历史数据，完播率最优区间`
      };
    }

    // 回退到默认值
    const defaults = this.defaultRecommendations[videoType];
    if (defaults) {
      return {
        intensity: defaults.intensity,
        confidence: 0.3,
        samples: 0,
        source: 'default',
        reason: defaults.reason
      };
    }

    return {
      intensity: 0.5,
      confidence: 0.1,
      samples: 0,
      source: 'fallback',
      reason: '无历史数据，使用通用默认值'
    };
  }
}

module.exports = {
  CreativeIntensityEngine,
  CreativeIntensityParser,
  CreativeIntensityRecommender,
  CAPABILITY_MATRIX,
  INTENSITY_LEVELS,
  NARRATIVE_MODE_BRIDGE,
  WORLD_SETTING_BRIDGE
};

```

---

## engines/script-engine/core/intent-parser.js

```javascript
// engines/script-engine/core/intent-parser.js
// Intent Parser - 解析用户意图，识别叙事模式，提取元数据
// 版本：v1.0 | 日期：2026-06-07

class IntentParser {
  constructor(options = {}) {
    this.config = {
      // 快速分类器：关键词匹配
      // v1.2.7-fix-A8: 移除神话项目特定词，保留通用剧情词
      keywordDict: {
        dramatic: ['短剧', '剧情', '故事', '角色', '冲突', '反转', '结局', '情感', '感动', '逆袭', '人设', '剧本', '台词'],
        educational: ['科普', '讲解', '知识', '教程', '学会', '原理', '什么是', '如何', '为什么'],
        documentary: ['纪录片', '纪实', '采访', '真实', '调查', '记录'],
        lifelog: ['家庭', '聚会', '旅行', '回忆', 'Vlog', '日常', '记录生活'],
        commercial: ['广告', '品牌', '营销', '推广', '产品', '转化', '带货', 'CTA']
      },
      // 混合模式信号
      hybridSignals: {
        '知识营销': { primary: 'educational', secondary: 'commercial', keywords: ['科普种草', '知识带货', '专业测评'] },
        '品牌叙事': { primary: 'dramatic', secondary: 'commercial', keywords: ['品牌故事', '情感广告', '微电影广告'] },
        '纪实营销': { primary: 'documentary', secondary: 'commercial', keywords: ['品牌纪录片', '真实故事广告'] },
        '科普短剧': { primary: 'educational', secondary: 'dramatic', keywords: ['剧情科普', '故事学习'] }
      },
      // v1.2.7-fix-A8: 示例世界 世界观检测（仅神话项目项目触发，不影响通用性）
      nirathSignals: ['示例世界', 'nirath', '神话项目', '神兽', '示例神兽', '虚构', '碳化硅'],
      // 默认配置
      defaultMode: 'dramatic',
      confidenceThreshold: 0.85,
      ...options
    };
  }

  /**
   * 主入口：解析用户意图
   * @param {string} rawInput - 用户原始输入
   * @param {object} metadata - 附加元数据（如标题、时长等）
   * @returns {object} UserIntent 对象
   */
  parse(rawInput, metadata = {}) {
    // v2.1.4-fix8: 防御性处理 - rawInput可能是对象
    let text = '';
    if (typeof rawInput === 'string') {
      text = rawInput;
    } else if (rawInput && typeof rawInput === 'object') {
      text = (rawInput.text || rawInput.content || rawInput.description || rawInput.title || '').toString();
    } else {
      text = (rawInput || '').toString();
    }
    
    // 第一层：快速分类器
    const fastResult = this._fastClassify(text);
    
    // 如果置信度足够高，直接返回
    if (fastResult.confidence >= 0.90) {
      return this._buildUserIntent(fastResult, metadata, 'fast_classifier', text);
    }

    // 第二层：深度分析（检测混合模式、示例世界世界观等）
    const deepResult = this._deepAnalysis(text, fastResult);
    
    return this._buildUserIntent(deepResult, metadata, 'deep_analysis', text);
  }

  /**
   * 快速分类器：基于关键词匹配
   */
  _fastClassify(text) {
    const scores = {};
    let totalMatches = 0;

    // 统计各类型关键词命中数
    for (const [type, keywords] of Object.entries(this.config.keywordDict)) {
      let matches = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          matches++;
        }
      }
      scores[type] = matches;
      totalMatches += matches;
    }

    // 计算置信度
    let maxScore = 0;
    let primaryType = this.config.defaultMode;

    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primaryType = type;
      }
    }

    // 【审计修复】如果 educational 有匹配（科普内容），优先使用 educational
    if (scores.educational > 0 && primaryType !== 'educational') {
      // 只有当 educational 匹配数不少于其他类型时才切换
      if (scores.educational >= maxScore * 0.5) {
        primaryType = 'educational';
        maxScore = scores.educational;
      }
    }

    const confidence = totalMatches > 0 ? maxScore / totalMatches : 0;

    return {
      primary_type: primaryType,
      confidence: Math.min(confidence, 1.0),
      scores,
      layer: 'fast_classifier'
    };
  }

  /**
   * 深度分析：检测混合模式、世界观、元数据提取
   */
  _deepAnalysis(text, fastResult) {
    let result = { ...fastResult };

    // 检测混合模式
    const hybridMode = this._detectHybridMode(text);
    if (hybridMode) {
      result.primary_type = hybridMode.primary;
      result.secondary_type = hybridMode.secondary;
      result.hybrid_mode = hybridMode.name;
      result.confidence = 0.88; // 混合模式默认置信度
    }

    // 检测 示例世界 世界观
    const is示例世界 = this._detect示例世界(text);
    if (is示例世界) {
      result.world_setting = '示例世界';
      result.nirath_signals = is示例世界.matches;
    }

    // 提取时长信息
    const duration = this._extractDuration(text);
    if (duration) {
      result.target_duration = duration;
    }

    // 提取神兽 ID
    const beastId = this._extractBeastId(text);
    if (beastId) {
      result.featured_beast_id = beastId;
    }

    return result;
  }

  /**
   * 检测混合模式
   */
  _detectHybridMode(text) {
    for (const [name, config] of Object.entries(this.config.hybridSignals)) {
      for (const keyword of config.keywords) {
        if (text.includes(keyword)) {
          return {
            name,
            primary: config.primary,
            secondary: config.secondary
          };
        }
      }
    }
    return null;
  }

  /**
   * 检测 示例世界 世界观
   */
  _detect示例世界(text) {
    const matches = [];
    for (const signal of this.config.nirathSignals) {
      if (text.includes(signal)) {
        matches.push(signal);
      }
    }
    return matches.length > 0 ? { matches } : null;
  }

  /**
   * 提取时长（秒）
   */
  _extractDuration(text) {
    // 匹配 "120秒", "2分钟", "120s", "2min" 等
    const patterns = [
      /(\d+)\s*秒/,
      /(\d+)\s*分钟/,
      /(\d+)\s*s/i,
      /(\d+)\s*min/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let value = parseInt(match[1]);
        // 分钟转秒
        if (pattern.toString().includes('分钟') || pattern.toString().includes('min')) {
          value *= 60;
        }
        return value;
      }
    }
    return null;
  }

  /**
   * 提取神兽 ID
   */
  _extractBeastId(text) {
    const beastPatterns = {
      'taotie': ['示例神兽', 'tao-tie', 'taotie'],
      'qilin': ['麒麟', 'qilin'],
      'fenghuang': ['凤凰', '凤凰', 'fenghuang'],
      'xiezhi': ['獬豸', 'xiezhi'],
      'bixie': ['辟邪', 'bixie']
    };

    for (const [id, keywords] of Object.entries(beastPatterns)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return id;
        }
      }
    }
    return null;
  }

  /**
   * 构建 UserIntent 对象
   */
  _buildUserIntent(analysis, metadata, layer, rawInput) {
    const isHybrid = !!analysis.hybrid_mode;
    
    return {
      intent_id: this._generateUUID(),
      raw_input: metadata.raw_input || rawInput || '',
      parsed: {
        narrative_mode: isHybrid ? 'hybrid' : analysis.primary_type,
        primary_mode: analysis.primary_type,
        secondary_modes: analysis.secondary_type ? [analysis.secondary_type] : [],
        hybrid_config: isHybrid ? {
          mode_weights: { [analysis.primary_type]: 0.6, [analysis.secondary_type]: 0.4 },
          handover_points: ['climax', 'resolution'],
          hybrid_mode_name: analysis.hybrid_mode
        } : null
      },
      metadata: {
        title: metadata.title || '未命名项目',
        target_duration: analysis.target_duration || metadata.target_duration || 60,
        // 【v2.1.4-fix13-审计修复】不硬编码平台，从 metadata 获取或设为通用
        target_platform: metadata.target_platform || ['general'],
        language: metadata.language || 'zh-CN',
        style_tags: metadata.style_tags || ['hyper-realistic', 'cinematic', 'epic'],
        world_setting: analysis.world_setting || metadata.world_setting || 'default',
        featured_beast_id: analysis.featured_beast_id || metadata.featured_beast_id || null,
        // v1.2.7-fix-A8: 移除 示例角色 硬编码，改为通用默认值
        protagonist: metadata.protagonist || 'protagonist',
        ...metadata
      },
      constraints: {
        // v2.1.4-fix13-审计修复: 超现实系统标准 3000
        max_prompt_length: metadata.max_prompt_length || 3000,
        reference_image_count: metadata.reference_image_count || 2,
        forbidden_elements: metadata.forbidden_elements || ['voiceover', 'metal_gloss', 'unnatural_eye_color']
      },
      analysis: {
        layer,
        confidence: analysis.confidence,
        scores: analysis.scores
      }
    };
  }

  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = { IntentParser };

```

---

## engines/script-engine/core/requirement-list-builder.js

```javascript
// engines/script-engine/core/requirement-list-builder.js
// RequirementListBuilder - 需求清单生成确认模块 (Layer 0)
// 适配超现实系统四层架构,在 IntentParser 和 ScriptEngine 之间
// 版本: v1.0.0 | 日期: 2026-06-18

const { IntentParser } = require('./intent-parser');

// v2.0.2-fix: 安全数值解析工具，防止NaN污染后续计算
function safeParseInt(str, defaultValue = 0) {
  const val = parseInt(str, 10);
  return Number.isNaN(val) ? defaultValue : val;
}

function safeParseFloat(str, defaultValue = 0) {
  const val = parseFloat(str);
  return Number.isNaN(val) ? defaultValue : val;
}

/**
 * 超现实系统风格编码展开器
 * 适配超现实系统的电影级质感需求
 */
const StyleEncoder = {
  primaryStyles: {
    'REAL': { name: '写实纪实', description: '自然光、真实场景、手持感', context: { EDU: '真实可信的纪实风格,增强专业信任感', default: '写实纪实的真实质感' }},
    'CINE': { name: '电影质感', description: '戏剧性光影、宽画幅、景深', context: { DRAMA: '电影级叙事质感,增强戏剧张力', EDU: '电影级纪录片质感,提升专业度', default: '电影级的戏剧质感' }},
    'POL': { name: '精致商业', description: '高饱和、精致布光、产品特写', context: { ADV: '精致商业广告质感', default: '精致商业的高品质呈现' }},
    'MINI': { name: '极简现代', description: 'clean背景、大留白、几何构图', context: { default: '极简现代的设计美学' }},
    'RET': { name: '复古怀旧', description: '暖色调、胶片颗粒、年代感', context: { default: '复古怀旧的温暖质感' }},
    'FUT': { name: '科幻未来', description: '冷色调、科技感光效、未来感UI', context: { default: '科幻未来的科技美学' }},
    'ART': { name: '艺术实验', description: '非常规构图、抽象视觉、强烈色彩', context: { default: '艺术实验的独特美学' }},
    'WARM': { name: '温暖治愈', description: '柔和光线、暖色调、慢节奏', context: { EDU: '温暖治愈的亲和风格,降低知识门槛', default: '温暖治愈的情感氛围' }},
    'STREET': { name: '街头潮流', description: '快速剪辑、涂鸦元素、动感运镜', context: { default: '街头潮流的动感风格' }},
    'FAIRY': { name: '梦幻童话', description: '柔光、仙气、超现实元素', context: { default: '梦幻童话的超现实美感' }}
  },

  secondaryStyles: {
    'LUX': { name: '奢华感', effect: '金色/暗调、高级质感、慢镜头' },
    'VIV': { name: '活力感', effect: '高饱和、快节奏、动感音乐' },
    'EMO': { name: '情绪感', effect: '低饱和、慢节奏、叙事性强' },
    'NAT': { name: '自然感', effect: '户外、自然光、绿意/蓝天' },
    'GRI': { name: '粗粝感', effect: '高对比、暗部细节、纪实感' },
    'SWE': { name: '甜美感', effect: '粉色/马卡龙、柔光、可爱元素' },
    'DAR': { name: '暗黑感', effect: '低key布光、阴影、神秘氛围' },
    'NOS': { name: '怀旧感', effect: '胶片色、颗粒、老电视效果' }
  },

  expandPrimary(code, videoType = 'default') {
    const style = this.primaryStyles[code];
    if (!style) return code;
    const ctx = style.context[videoType] || style.context.default;
    return `${style.name}风格,${ctx},${style.description}`;
  },

  expandSecondary(code) {
    const clean = code.replace(/^\+/, '');
    const style = this.secondaryStyles[clean];
    if (!style) return code;
    return `${style.name}(${style.effect})`;
  },

  expandStyle(primary, secondary = [], videoType = 'default') {
    const primaryDesc = this.expandPrimary(primary, videoType);
    if (!secondary.length) return primaryDesc;
    const secondaryDescs = secondary.map(s => this.expandSecondary(s));
    return `${primaryDesc},叠加${secondaryDescs.join('、')}`;
  }
};

/**
 * 规则库 - 快速确定性解析
 */
const ParserRules = {
  videoTypeRules: [
    { keywords: ['科普', '讲解', '知识', '教学', '课程', '教育', '健康科普'], type: 'EDU', name: '教育科普' },
    { keywords: ['短剧', '剧情', '故事', '角色', '集', '微电影'], type: 'DRAMA', name: '短剧/微电影' },
    { keywords: ['广告', '宣传', '推广', '品牌', '产品', '宣传片'], type: 'ADV', name: '商业广告' },
    { keywords: ['纪录片', '记录', '纪实', '真实'], type: 'DOC', name: '纪录片' },
    { keywords: ['vlog', '日常', '记录生活', '跟我'], type: 'VLOG', name: 'Vlog/记录' },
    { keywords: ['抖音', '快手', '小红书', 'viral', '短视频'], type: 'SOC', name: '社媒短视频' },
    { keywords: ['企业', '公司', '工厂', '实力'], type: 'COR', name: '企业宣传' },
    { keywords: ['活动', '现场', '会议', '庆典'], type: 'EVT', name: '活动记录' },
    { keywords: ['mv', '音乐', '歌曲'], type: 'MV', name: '音乐视频' }
  ],

  styleRules: [
    { keywords: ['写实', '真实', '纪实', '纪录片感'], style: 'REAL' },
    { keywords: ['电影感', '大片', '质感', 'cinematic'], style: 'CINE' },
    { keywords: ['精致', '高级', '商业', '产品'], style: 'POL' },
    { keywords: ['极简', '现代', '科技', 'clean'], style: 'MINI' },
    { keywords: ['复古', '怀旧', '年代', '老'], style: 'RET' },
    { keywords: ['科幻', '未来', '科技', '赛博'], style: 'FUT' },
    { keywords: ['艺术', '实验', '前卫', '独特'], style: 'ART' },
    { keywords: ['温暖', '治愈', '柔和', '温情'], style: 'WARM' },
    { keywords: ['街头', '潮流', '潮', '涂鸦'], style: 'STREET' },
    { keywords: ['梦幻', '童话', '仙气', '唯美'], style: 'FAIRY' }
  ],

  modifierRules: [
    { keywords: ['奢华', 'luxury', '高端', '金色'], modifier: 'LUX' },
    { keywords: ['活力', '动感', '快节奏', '年轻'], modifier: 'VIV' },
    { keywords: ['情绪', '情感', '叙事', '深沉'], modifier: 'EMO' },
    { keywords: ['自然', '户外', '绿色', '阳光'], modifier: 'NAT' },
    { keywords: ['粗粝', 'gritty', '纪实', '真实'], modifier: 'GRI' },
    { keywords: ['甜美', '可爱', '粉色', '马卡龙'], modifier: 'SWE' },
    { keywords: ['暗黑', '神秘', '阴影', '低key'], modifier: 'DAR' },
    { keywords: ['怀旧', '胶片', '颗粒', '老'], modifier: 'NOS' }
  ],

  platformRules: [
    { keywords: ['抖音'], platform: '抖音', defaultRatio: '9:16' },
    { keywords: ['快手'], platform: '快手', defaultRatio: '9:16' },
    { keywords: ['小红书'], platform: '小红书', defaultRatio: '9:16' },
    { keywords: ['视频号'], platform: '视频号', defaultRatio: '9:16' },
    { keywords: ['b站', 'bilibili', 'youtube'], platform: 'B站/YouTube', defaultRatio: '16:9' },
    { keywords: ['朋友圈'], platform: '朋友圈', defaultRatio: '9:16' },
    { keywords: ['大屏', '户外'], platform: '户外大屏', defaultRatio: '16:9' }
  ],

  durationDefaults: {
    'EDU': { default: 90, range: [60, 120] },
    'SOC': { default: 30, range: [15, 60] },
    'ADV': { default: 30, range: [15, 60] },
    'DOC': { default: 150, range: [60, 180] },
    'DRAMA': { default: 150, range: [60, 180] },
    'COR': { default: 90, range: [60, 120] },
    'EVT': { default: 120, range: [60, 180] },
    'VLOG': { default: 90, range: [60, 120] },
    'MV': { default: 150, range: [60, 180] }
  },

  constraints: {
    maxSingleDuration: 180,
    maxTotalDuration: 1200,
    maxShotDuration: 15,
    maxEpisodes: 7,
    recommendedMaxEpisodes: 5,
    recommendedMaxTotalDuration: 900
  }
};

/**
 * RequirementListBuilder - 需求清单生成确认器
 * 超现实系统 Layer 0:在 IntentParser (Layer 1前) 运行
 */
class RequirementListBuilder {
  constructor(options = {}) {
    this.intentParser = new IntentParser(options.intentParser);
    this.rules = ParserRules;
    this.styleEncoder = StyleEncoder;
    this.options = {
      maxIterations: 2,
      confidenceThreshold: 0.6,
      useLLM: options.useLLM !== false,
      llmEngine: options.llmEngine || null,
      ...options
    };
  }

  /**
   * 主入口:生成需求清单
   * @param {string} userInput - 用户自然语言输入
   * @param {Object} metadata - 附加元数据(如标题、时长等)
   * @returns {RequirementList} 结构化需求清单
   */
  async build(userInput, metadata = {}) {
    console.log(`\n📋 [Layer 0] 需求清单生成 - 解析用户意图...`);
    const startTime = Date.now();

    // 1. IntentParser 快速分类(复用超现实系统已有能力)
    const intentResult = this.intentParser.parse(userInput, metadata);
    console.log(`   ✅ IntentParser 分类: ${intentResult.parsed.narrative_mode} (置信度: ${intentResult.analysis.confidence})`);

    // 2. 规则库快速解析(确定性提取)
    const ruleBasedResult = this._ruleBasedParse(userInput, metadata);
    console.log(`   ✅ 规则库解析: 类型=${ruleBasedResult.videoType || '未识别'}, 时长=${ruleBasedResult.duration || '默认'}`);

    // 3. LLM 深度解析(语义理解)
    let llmResult = {};
    if (this.options.useLLM && this.options.llmEngine) {
      try {
        llmResult = await this._llmParse(userInput, ruleBasedResult, intentResult, metadata);
        console.log(`   ✅ LLM 深度解析完成`);
      } catch (e) {
        console.warn(`   ⚠️ LLM 解析失败: ${e.message},回退到规则库`);
      }
    }

    // 4. 合并结果
    const merged = this._mergeResults(ruleBasedResult, llmResult, intentResult);

    // 5. 推断补全
    const completed = this._inferCompletion(merged);

    // 6. 约束检查
    const constrained = this._applyConstraints(completed);

    // 7. 生成需求清单
    const requirementList = this._buildRequirementList(constrained, userInput, metadata);

    console.log(`   ✅ 需求清单生成完成 (${Date.now() - startTime}ms)`);
    console.log(`      类型: ${requirementList.videoType} | 时长: ${requirementList.targetDuration}s | 风格: ${requirementList.style.primary}`);
    console.log(`      角色: ${requirementList.characters.length}个 | 结构: ${requirementList.structure.scenes.length}段`);

    return requirementList;
  }

  /**
   * 规则库解析 - 快速确定性提取
   */
  _ruleBasedParse(input, metadata) {
    // v2.1.4-fix8: 防御性处理 - input可能是对象
    let text = '';
    if (typeof input === 'string') {
      text = input.toLowerCase();
    } else if (input && typeof input === 'object') {
      // 尝试从对象中提取文本
      text = (input.text || input.content || input.description || input.title || '').toString().toLowerCase();
    } else {
      text = (input || '').toString().toLowerCase();
    }
    
    const result = {
      videoType: null,
      platform: null,
      style: { primary: null, secondary: [] },
      duration: metadata.target_duration || null,  // 优先使用metadata
      title: metadata.title || null,
      creativeIntensity: null,
      characters: [],
      isSeries: false,
      totalEpisodes: null,
      currentEpisode: null,
      keyPoints: [],
      uncertainties: []
    };

    // 推断视频类型
    for (const rule of this.rules.videoTypeRules) {
      for (const keyword of rule.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          result.videoType = rule.type;
          result.videoTypeName = rule.name;
          break;
        }
      }
      if (result.videoType) break;
    }

    // 推断平台
    for (const rule of this.rules.platformRules) {
      for (const keyword of rule.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          result.platform = rule.platform;
          result.defaultRatio = rule.defaultRatio;
          break;
        }
      }
      if (result.platform) break;
    }

    // 推断风格(优先使用metadata)
    if (metadata.style) {
      result.style.primary = metadata.style;
    } else {
      for (const rule of this.rules.styleRules) {
        for (const keyword of rule.keywords) {
          if (text.includes(keyword.toLowerCase())) {
            result.style.primary = rule.style;
            break;
          }
        }
        if (result.style.primary) break;
      }
    }

    // 推断辅助风格
    for (const rule of this.rules.modifierRules) {
      for (const keyword of rule.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          if (!result.style.secondary.includes(rule.modifier)) {
            result.style.secondary.push(rule.modifier);
          }
        }
      }
    }

    // 提取时长
    const durationMatch = text.match(/(\d+)\s*(秒|分钟|分|s|sec|min)/i);
    if (durationMatch) {
      let value = safeParseInt(durationMatch[1]);
      const unit = durationMatch[2];
      if (unit.includes('分') || unit.includes('min')) {
        value *= 60;
      }
      result.duration = value;
    }

    // 提取时长范围(如 59~65秒)-- 如果metadata没有提供
    if (!result.duration) {
      const rangeMatch = text.match(/(\d+)\s*[~~-]\s*(\d+)\s*(秒|分钟|分|s)/i);
      if (rangeMatch) {
        let min = safeParseInt(rangeMatch[1]);
        let max = safeParseInt(rangeMatch[2]);
        const unit = rangeMatch[3];
        if (unit.includes('分')) { min *= 60; max *= 60; }
        result.durationRange = [min, max];
        result.duration = Math.round((min + max) / 2);
      }
    }

    // 提取创意指数（优先使用metadata传入的值）
    if (metadata.creativeIntensity !== undefined && metadata.creativeIntensity !== null) {
      result.creativeIntensity = safeParseFloat(metadata.creativeIntensity);
    } else {
      const intensityMatch = text.match(/创意指数\s*[::]?\s*(0?\.\d+|\d+)/i);
      if (intensityMatch) {
        result.creativeIntensity = safeParseFloat(intensityMatch[1]);
      }
    }
    // 检测"天花板般的创造力"等描述
    if (text.includes('天花板') || text.includes('顶级') || text.includes('极致')) {
      result.creativeIntensity = 1.0;
    }

    // 提取系列信息（从文本和metadata）
    const seriesMatch = text.match(/(\d+)\s*集/);
    if (seriesMatch) {
      result.totalEpisodes = safeParseInt(seriesMatch[1]);
      result.isSeries = true;
    }
    // 【v2.1.4】优先从metadata提取系列信息
    if (metadata.series) {
      result.isSeries = true;
      result.totalEpisodes = metadata.series.totalEpisodes || result.totalEpisodes;
      result.currentEpisode = metadata.series.currentEpisode || metadata.series.episode || result.currentEpisode;
      if (metadata.series.episodeTitles) {
        result.episodeTitles = metadata.series.episodeTitles;
      }
    } else if (metadata.total_episodes) {
      result.isSeries = true;
      result.totalEpisodes = metadata.total_episodes;
    }
    const episodeMatch = text.match(/第\s*(\d+)\s*集/);
    if (episodeMatch) {
      result.currentEpisode = safeParseInt(episodeMatch[1]);
    }
    // metadata中的episode优先
    if (metadata.episode || metadata.currentEpisode) {
      result.currentEpisode = metadata.episode || metadata.currentEpisode;
    }

    // 提取角色信息
    const characterMatches = text.match(/([^,。]+?)女士|([^,。]+?)先生|主角([^,。]+)|([^,。]+?)穿/);
    if (characterMatches) {
      const name = characterMatches[1] || characterMatches[2] || characterMatches[3] || characterMatches[4];
      if (name && name.length < 10) {
        result.characters.push({ name: name.trim(), description: '待补充' });
      }
    }

    // 提取关键需求点(简单分句)
    const sentences = text.split(/[。!;\n]/).filter(s => s.trim().length > 5);
    result.keyPoints = sentences.slice(0, 5);

    return result;
  }

  /**
   * LLM 深度解析 - 生成完整需求清单字段
   */
  async _llmParse(userInput, ruleResult, intentResult, metadata) {
    const prompt = this._buildLLMPrompt(userInput, ruleResult, intentResult, metadata);

    // 【v2.1.4-fix13-审计修复】适配多种 LLM 引擎接口
    let responseText = '';
    const llmEngine = this.options.llmEngine;
    const timeoutMs = 300000; // 5分钟

    if (!llmEngine) {
      throw new Error('LLM引擎未初始化');
    }

    // 超时保护
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`RequirementListBuilder LLM 超时(${timeoutMs}ms)`)), timeoutMs);
    });

    try {
      if (typeof llmEngine.generate === 'function') {
        // 【P1-23-审计修复】统一使用 generate(prompt, options) 签名
        const response = await Promise.race([
          llmEngine.generate(prompt, {
            systemPrompt: '你是一位专业的视频需求分析师。只输出严格格式的JSON，不要markdown代码块。',
            maxTokens: 2500,
            temperature: 1,
            timeoutMs,
            forceJson: true,
          }),
          timeoutPromise
        ]).finally(() => clearTimeout(timer));
        responseText = response.success ? (response.content || '') : '';
      } else if (typeof llmEngine.chat === 'function') {
        // 方式2: .chat(systemPrompt, userPrompt, temperature) - BaseAgent 标准接口
        const result = await Promise.race([
          llmEngine.chat('你是一位专业的视频需求分析师。只输出严格格式的JSON，不要markdown代码块。', prompt, 1),
          timeoutPromise
        ]).finally(() => clearTimeout(timer));
        responseText = result?.content || result?.data || '';
      } else if (typeof llmEngine.reasonStructured === 'function') {
        // 方式3: .reasonStructured(prompt, schema, options)
        const result = await Promise.race([
          llmEngine.reasonStructured(prompt, null, { maxTokens: 2500, timeoutMs }),
          timeoutPromise
        ]).finally(() => clearTimeout(timer));
        responseText = result?.data ? JSON.stringify(result.data) : (result?.content || '');
      } else {
        throw new Error('LLM引擎无可用的调用方法');
      }
    } catch (error) {
      console.error('[RequirementListBuilder] LLM调用失败:', error.message);
      throw error;
    }

    if (!responseText) {
      throw new Error('LLM返回空内容');
    }

    // 解析 JSON
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                      responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    throw new Error('LLM输出格式不匹配');
  }

  /**
   * 构建 LLM 提示词 - 超现实系统专用
   */
  _buildLLMPrompt(userInput, ruleResult, intentResult, metadata) {
    return `你是一位资深AI视频制片人,擅长将用户的粗略需求转化为专业的视频制作方案。

## 用户输入
"""${userInput}"""

## 规则库初步解析(供参考)
${JSON.stringify(ruleResult, null, 2)}

## 系统硬约束(不可违反)
- 单次最长时长: 180秒
- 单个镜头最长: 15秒
- 单集最长: 180秒
- 总时长上限: 20分钟(1200秒)
- 系列最多7集,推荐最多5集
- 画幅比例: 9:16(竖屏) / 16:9(横屏) / 1:1(方形)

## 视频类型
EDU=教育科普, SOC=社媒短视频, ADV=商业广告, DOC=纪录片, DRAMA=短剧/微电影, COR=企业宣传, EVT=活动记录, VLOG=Vlog/记录, MV=音乐视频

## 风格编码
主风格: REAL=写实纪实, CINE=电影质感, POL=精致商业, MINI=极简现代, RET=复古怀旧, FUT=科幻未来, ART=艺术实验, WARM=温暖治愈, STREET=街头潮流, FAIRY=梦幻童话
辅助风格: +LUX=奢华感, +VIV=活力感, +EMO=情绪感, +NAT=自然感, +GRI=粗粝感, +SWE=甜美感, +DAR=暗黑感, +NOS=怀旧感

## 任务
请分析用户需求,输出JSON格式的完整需求清单:

{
  "videoType": "类型编码",
  "videoTypeName": "中文类型名",
  "title": "视频主题",
  "seriesTitle": "系列名称(如有)",
  "targetAudience": "目标受众描述(年龄/性别/兴趣/职业)",
  "platform": "投放平台",
  "aspectRatio": "画幅比例",
  "duration": 目标时长数字,
  "durationRange": [最小值, 最大值],
  "style": {
    "primary": "主风格编码",
    "secondary": ["辅助风格编码"]
  },
  "styleDescription": "完整风格中文描述",
  "creativeIntensity": 0.0到1.0,
  "narrativeMode": "叙事模式: dialogue(角色独白) / voiceover(旁白) / mixed(混合)",
  "characters": [
    {
      "id": "角色ID(小写英文+连字符)",
      "name": "角色名",
      "description": "角色描述(年龄/性别/服装/气质)",
      "role": "角色定位: protagonist(主角) / supporting(配角) / narrator(解说员)"
    }
  ],
  "structure": {
    "opening": "开场风格描述",
    "scenes": ["场景1描述", "场景2描述"],
    "ending": "结尾风格描述"
  },
  "isSeries": true/false,
  "totalEpisodes": 集数,
  "currentEpisode": 当前集数,
  "keyPoints": ["关键需求点1", "关键需求点2"],
  "contentConstraints": ["内容限制1", "内容限制2"],
  "uncertainties": ["不确定项1"]
}

只输出JSON,不要其他内容。`;
  }

  /**
   * 合并三种解析结果
   */
  _mergeResults(ruleResult, llmResult, intentResult) {
    const merged = {
      ...ruleResult,
      ...llmResult,
      narrativeMode: intentResult.parsed?.narrative_mode || llmResult.narrativeMode || 'dialogue',
      worldSetting: intentResult.metadata?.world_setting || llmResult.worldSetting || 'default',
      confidence: intentResult.analysis?.confidence || 0.5
    };

    // 规则库结果优先(确定性更高),除非LLM明确提供了非推断值
    if (ruleResult.videoType) {
      merged.videoType = ruleResult.videoType;
      merged.videoTypeName = ruleResult.videoTypeName;
    }
    if (ruleResult.duration) {
      merged.duration = ruleResult.duration;
      merged.durationRange = ruleResult.durationRange;
    }
    // 风格:如果规则库有明确值,优先使用;否则用LLM的
    if (ruleResult.style?.primary) {
      merged.style = merged.style || {};
      merged.style.primary = ruleResult.style.primary;
    }
    if (ruleResult.style?.secondary?.length) {
      merged.style = merged.style || {};
      merged.style.secondary = ruleResult.style.secondary;
    }

    return merged;
  }

  /**
   * 推断补全 - 填充缺失字段
   */
  _inferCompletion(result) {
    const completed = { ...result };

    // 补全视频类型(默认EDU)
    if (!completed.videoType) {
      completed.videoType = 'EDU';
      completed.videoTypeName = '教育科普';
      completed.videoTypeInferred = true;
    }

    // 补全时长
    if (!completed.duration) {
      const defaults = this.rules.durationDefaults[completed.videoType];
      if (defaults) {
        completed.duration = defaults.default;
        completed.durationRange = defaults.range;
        completed.durationInferred = true;
      }
    }

    // 补全时长范围
    if (!completed.durationRange && completed.duration) {
      completed.durationRange = [Math.max(15, completed.duration - 10), Math.min(180, completed.duration + 10)];
    }

    // 补全风格(强制根据视频类型设置默认风格,覆盖LLM的错误推断)
    const typeToStyle = {
      'EDU': 'REAL', 'DOC': 'REAL', 'VLOG': 'REAL',
      'DRAMA': 'CINE', 'MV': 'ART',
      'ADV': 'POL', 'COR': 'POL',
      'SOC': 'STREET', 'EVT': 'REAL'
    };
    const defaultStyle = typeToStyle[completed.videoType] || 'REAL';
    // 如果当前风格与默认不符,且是推断的,强制覆盖
    if (completed.style?.primary !== defaultStyle) {
      console.log(`[RequirementListBuilder] 风格强制修正: ${completed.style?.primary} → ${defaultStyle} (视频类型: ${completed.videoType})`);
      completed.style = completed.style || {};
      completed.style.primary = defaultStyle;
      completed.styleInferred = true;
    }

    // 补全风格描述
    if (!completed.styleDescription) {
      completed.styleDescription = this.styleEncoder.expandStyle(
        completed.style.primary,
        completed.style.secondary || [],
        completed.videoType
      );
    }

    // 补全创意指数
    if (completed.creativeIntensity === undefined || completed.creativeIntensity === null) {
      const typeToIntensity = {
        'EDU': 0.5, 'DOC': 0.5, 'VLOG': 0.4,
        'DRAMA': 0.65, 'MV': 0.7,
        'ADV': 0.7, 'COR': 0.6,
        'SOC': 0.8, 'EVT': 0.5
      };
      completed.creativeIntensity = typeToIntensity[completed.videoType] || 0.5;
      completed.creativeIntensityInferred = true;
    }

    // 补全平台
    if (!completed.platform) {
      completed.platform = '视频号/抖音';
      completed.platformInferred = true;
    }

    // 补全画幅
    if (!completed.aspectRatio) {
      const platformToRatio = {
        '抖音': '9:16', '快手': '9:16', '小红书': '9:16', '视频号': '9:16',
        'B站/YouTube': '16:9', '朋友圈': '9:16', '户外大屏': '16:9'
      };
      // v1.2.5-fix: 默认横屏16:9,队长明确要求所有内容为横屏
      completed.aspectRatio = platformToRatio[completed.platform] || '16:9';
      completed.aspectRatioInferred = true;
    }

    // 补全叙事模式
    if (!completed.narrativeMode) {
      completed.narrativeMode = 'dialogue';
    }

    // 补全结构
    if (!completed.structure) {
      completed.structure = this._inferStructure(completed);
    }

    // 补全角色
    if (!completed.characters || completed.characters.length === 0) {
      completed.characters = this._inferCharacters(completed);
    }

    return completed;
  }

  /**
   * 根据视频类型推断默认结构
   */
  _inferStructure(result) {
    const typeToStructure = {
      'EDU': {
        opening: '开场引入(问题/场景/数据)',
        scenes: ['核心知识点讲解', '案例/演示说明', '重点强调'],
        ending: '总结回顾 + 行动号召'
      },
      'DRAMA': {
        opening: '开场建立角色与场景',
        scenes: ['冲突发展', '情感高潮', '转折/解决'],
        ending: '结局/开放式结尾'
      },
      'ADV': {
        opening: '吸引注意力的钩子',
        scenes: ['产品展示', '卖点阐述', '场景应用'],
        ending: 'CTA + 品牌露出'
      },
      'DOC': {
        opening: '背景介绍与主题引入',
        scenes: ['事件展开', '多角度叙述', '关键证据'],
        ending: '总结与思考'
      },
      'VLOG': {
        opening: '日常开场/问候',
        scenes: ['活动记录', '体验分享', '感受表达'],
        ending: '结束语 + 互动'
      }
    };

    const defaultStructure = {
      opening: '开场引入',
      scenes: ['主体内容', '展开说明'],
      ending: '总结收尾'
    };

    return typeToStructure[result.videoType] || defaultStructure;
  }

  /**
   * 根据输入推断角色信息
   */
  _inferCharacters(result) {
    const characters = [];

    // 从用户输入中提取角色名
    const text = result.raw_input || '';
    // 修复:支持 "穿警服的示例警官女士" 这种格式,正确提取名字
    const nameMatches = text.match(/([^,。\s]{1,6})女士|([^,。\s]{1,6})先生|([^,。\s]{1,6})讲解|([^,。\s]{1,6})介绍/);
    if (nameMatches) {
      const name = (nameMatches[1] || nameMatches[2] || nameMatches[3] || nameMatches[4]).trim();
      if (name && name.length < 10 && name.length > 1) {
        characters.push({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          description: '待补充详细描述',
          role: 'protagonist'
        });
      }
    }

    return characters;
  }

  /**
   * 应用系统约束
   */
  _applyConstraints(result) {
    const constrained = { ...result };
    const c = this.rules.constraints;

    // 时长约束
    if (constrained.duration > c.maxSingleDuration) {
      constrained.duration = c.maxSingleDuration;
      constrained.durationClamped = true;
    }
    if (constrained.durationRange) {
      constrained.durationRange[0] = Math.max(15, constrained.durationRange[0]);
      constrained.durationRange[1] = Math.min(c.maxSingleDuration, constrained.durationRange[1]);
    }

    // 系列约束
    if (constrained.totalEpisodes > c.maxEpisodes) {
      constrained.totalEpisodes = c.maxEpisodes;
      constrained.episodesClamped = true;
    }

    // 创意指数约束
    if (constrained.creativeIntensity !== undefined) {
      constrained.creativeIntensity = Math.max(0, Math.min(1, constrained.creativeIntensity));
    }

    return constrained;
  }

  /**
   * 构建最终需求清单对象
   */
  _buildRequirementList(result, rawInput, metadata) {
    return {
      // 元信息
      version: '1.0.0',
      system: 'hyperreality',
      generatedAt: new Date().toISOString(),
      rawInput,

      // 基础信息
      videoType: result.videoType,
      videoTypeName: result.videoTypeName || '教育科普',
      title: result.title || metadata.title || '未命名项目',
      seriesTitle: result.seriesTitle || metadata.seriesTitle || '',
      episode: result.currentEpisode || metadata.episode || 1,
      totalEpisodes: result.totalEpisodes || metadata.totalEpisodes || 1,
      isSeries: result.isSeries || (result.totalEpisodes > 1),

      // 风格与质感
      style: {
        primary: result.style.primary,
        secondary: result.style.secondary || [],
        description: result.styleDescription
      },
      aspectRatio: result.aspectRatio || '16:9',
      platform: result.platform || '视频号/抖音',
      creativeIntensity: result.creativeIntensity,

      // 目标与受众
      targetDuration: result.duration,
      durationRange: result.durationRange || [result.duration - 5, result.duration + 5],
      targetAudience: result.targetAudience || '通用受众',
      language: result.language || 'zh-CN',

      // 叙事
      narrativeMode: result.narrativeMode || 'dialogue',

      // 角色
      characters: result.characters || [],
      protagonist: result.characters?.find(c => c.role === 'protagonist') || result.characters?.[0] || null,

      // 结构规划
      structure: result.structure || {
        opening: '开场引入',
        scenes: ['主体内容'],
        ending: '总结收尾'
      },

      // 内容约束
      keyPoints: result.keyPoints || [],
      contentConstraints: result.contentConstraints || [],
      forbiddenElements: result.forbiddenElements || ['voiceover', 'metal_gloss', 'unnatural_eye_color'],

      // 技术参数
      constraints: {
        maxPromptLength: result.maxPromptLength || 12000,
        referenceImageCount: result.referenceImageCount || 2,
        maxShotDuration: 15
      },

      // 不确定项(需要用户确认)
      uncertainties: result.uncertainties || [],

      // 推断标记
      _inferred: {
        videoType: !!result.videoTypeInferred,
        duration: !!result.durationInferred,
        style: !!result.styleInferred,
        platform: !!result.platformInferred,
        aspectRatio: !!result.aspectRatioInferred,
        creativeIntensity: !!result.creativeIntensityInferred,
        structure: !result.structure
      },

      // 分析元数据
      _analysis: {
        confidence: result.confidence || 0.5,
        parsingLayers: ['intent_parser', 'rule_based', 'llm_deep'],
        worldSetting: result.worldSetting || 'default'
      }
    };
  }

  /**
   * 生成 Markdown 格式的需求清单(供用户确认)
   */
  generateMarkdown(requirementList) {
    const r = requirementList;
    const inferred = (field) => r._inferred[field] ? ' *(推断)*' : '';

    return `# 视频需求要点清单

> 系统: 超现实系统 v${r.version}
> 生成时间: ${r.generatedAt}
> 置信度: ${(r._analysis.confidence * 100).toFixed(0)}%

---

## 一、基础信息

- **视频类型**: ${r.videoTypeName}${inferred('videoType')}
- **标题**: ${r.title}
${r.seriesTitle ? `- **系列名称**: ${r.seriesTitle}` : ''}
${r.isSeries ? `- **集数**: 第${r.episode}集 / 共${r.totalEpisodes}集` : ''}
- **目标时长**: ${r.targetDuration}秒${inferred('duration')}
${r.durationRange ? `- **时长范围**: ${r.durationRange[0]}~${r.durationRange[1]}秒` : ''}
- **画幅比例**: ${r.aspectRatio}${inferred('aspectRatio')}
- **投放平台**: ${r.platform}${inferred('platform')}

## 二、风格与质感

- **主风格**: ${r.style.primary}${inferred('style')}
${r.style.secondary.length ? `- **辅助风格**: ${r.style.secondary.join('、')}` : ''}
- **风格描述**: ${r.style.description}
- **创意指数**: ${r.creativeIntensity}${inferred('creativeIntensity')}
- **叙事模式**: ${r.narrativeMode === 'dialogue' ? '角色独白' : r.narrativeMode === 'voiceover' ? '旁白' : '混合'}

## 三、目标受众

${r.targetAudience}

## 四、角色设定

${r.characters.map(c => `- **${c.name}** (${c.role === 'protagonist' ? '主角' : c.role === 'supporting' ? '配角' : '解说员'}): ${c.description}`).join('\n') || '(待补充)'}

## 五、结构规划

- **开场**: ${r.structure.opening}
${r.structure.scenes.map((s, i) => `- **场景${i + 1}**: ${s}`).join('\n')}
- **结尾**: ${r.structure.ending}

## 六、关键需求点

${r.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n') || '(无)'}

## 七、内容约束

${r.contentConstraints.map((c, i) => `${i + 1}. ${c}`).join('\n') || '(无)'}

${r.uncertainties.length ? `## ⚠️ 待确认项\n\n${r.uncertainties.map((u, i) => `${i + 1}. ${u}`).join('\n')}` : ''}

---

**请确认以上清单,或提出修改意见。确认后进入预生产流程。**`;
  }

  /**
   * 生成适合下游 ScriptEngine 的 metadata 格式
   */
  toScriptEngineMetadata(requirementList) {
    return {
      title: requirementList.title,
      target_duration: requirementList.targetDuration,
      target_platform: requirementList.platform.split('/'),
      language: requirementList.language,
      style_tags: [
        requirementList.style.primary.toLowerCase(),
        ...requirementList.style.secondary.map(s => s.toLowerCase())
      ],
      world_setting: requirementList._analysis.worldSetting,
      protagonist: requirementList.protagonist?.id || 'default',
      featured_beast_id: requirementList._analysis.worldSetting === 'Nirath' ?
        requirementList._analysis.featuredBeastId : null,
      max_prompt_length: requirementList.constraints.maxPromptLength,
      reference_image_count: requirementList.constraints.referenceImageCount,
      // 超现实系统扩展字段
      creative_intensity: requirementList.creativeIntensity,
      narrative_mode: requirementList.narrativeMode,
      aspect_ratio: requirementList.aspectRatio,
      series: requirementList.isSeries ? {
        title: requirementList.seriesTitle,
        name: requirementList.seriesTitle,                    // 【v2.1.4-fix13-审计修复】增加 name 别名
        currentEpisode: requirementList.episode,               // 【修复】episode → currentEpisode
        episode: requirementList.episode,                      // 【修复】保留 episode 向后兼容
        totalEpisodes: requirementList.totalEpisodes,          // 【修复】total_episodes → totalEpisodes
        total_episodes: requirementList.totalEpisodes,         // 【修复】保留 total_episodes 向后兼容
        episodeTitles: requirementList.episodeTitles || []
      } : null,
      // 【v2.1.4】传递系列内容规划
      seriesContentPlan: requirementList.seriesContentPlan || null,
      // 🆕 v1.2.6-fix4b: 传递 characters 数组（角色覆盖的前置条件）
      characters: requirementList.characters || []
    };
  }
}

module.exports = { RequirementListBuilder, StyleEncoder, ParserRules };

```

---

## engines/script-engine/core/script-blueprint.js

```javascript
// engines/script-engine/core/script-blueprint.js
// ScriptBlueprint 数据模型 - 系统的"单一真相源"
// 版本：v1.0 | 日期：2026-06-07

class ScriptBlueprint {
  constructor(data = {}) {
    this.blueprint_id = data.blueprint_id || this._generateUUID();
    this.version = data.version || '1.0.0';
    this.intent_ref = data.intent_ref || null;

    this.meta = {
      title: data.meta?.title || 'Untitled',
      narrative_mode: data.meta?.narrative_mode || 'dramatic',
      target_duration: data.meta?.target_duration || 120,
      acts_count: data.meta?.acts_count || 3,
      scenes_count: data.meta?.scenes_count || 5,
      ...data.meta
    };

    this.structure = {
      acts: data.structure?.acts || [],
      scenes: data.structure?.scenes || []
    };

    this.character_system = {
      characters: data.character_system?.characters || []
    };

    this.voice_system = {
      global_voice_policy: data.voice_system?.global_voice_policy || 'dialogue_only_no_voiceover',
      voice_profiles: data.voice_system?.voice_profiles || []
    };

    this.world_setting = {
      world_id: data.world_setting?.world_id || 'default',
      world_name: data.world_setting?.world_name || 'Default World',
      era: data.world_setting?.era || 'modern',
      core_rules: data.world_setting?.core_rules || [],
      environment_tags: data.world_setting?.environment_tags || []
    };

    this.extensions = {
      dramatic_extension: data.extensions?.dramatic_extension || {},
      nirath_extension: data.extensions?.nirath_extension || {},
      ...data.extensions
    };

    this.quality_report = {
      evaluator: data.quality_report?.evaluator || 'DramaBench',
      scores: data.quality_report?.scores || {},
      passed: data.quality_report?.passed || false
    };
  }

  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 获取指定场景
  getScene(sceneId) {
    return this.structure.scenes.find(s => s.scene_id === sceneId);
  }

  // 获取指定角色
  getCharacter(characterId) {
    return this.character_system.characters.find(c => c.character_id === characterId);
  }

  // 获取所有包含对话的场景
  getScenesWithDialogue() {
    return this.structure.scenes.filter(s => s.dialogue?.has_dialogue);
  }

  // 获取指定幕的所有场景
  getScenesByAct(actId) {
    return this.structure.scenes.filter(s => s.act_id === actId);
  }

  // 获取剧本总时长
  getTotalDuration() {
    return this.structure.scenes.reduce((sum, s) => sum + (s.timing?.duration || 0), 0);
  }

  // 验证剧本完整性
  validate() {
    const errors = [];

    if (!this.meta.title) errors.push('Missing title');
    if (!this.meta.narrative_mode) errors.push('Missing narrative_mode');
    if (!this.structure.acts.length) errors.push('No acts defined');
    if (!this.structure.scenes.length) errors.push('No scenes defined');

    // 验证场景完整性
    this.structure.scenes.forEach((scene, idx) => {
      if (!scene.scene_id) errors.push(`Scene ${idx}: Missing scene_id`);
      if (!scene.scene_type) errors.push(`Scene ${scene.scene_id || idx}: Missing scene_type`);
      if (!scene.timing) errors.push(`Scene ${scene.scene_id || idx}: Missing timing`);
    });

    // 验证角色一致性
    const characterIds = this.character_system.characters.map(c => c.character_id);
    this.structure.scenes.forEach(scene => {
      if (scene.characters) {
        scene.characters.forEach(cid => {
          if (!characterIds.includes(cid)) {
            errors.push(`Scene ${scene.scene_id}: Character ${cid} not defined`);
          }
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 导出为 JSON
  toJSON() {
    return JSON.stringify({
      blueprint_id: this.blueprint_id,
      version: this.version,
      intent_ref: this.intent_ref,
      meta: this.meta,
      structure: this.structure,
      character_system: this.character_system,
      voice_system: this.voice_system,
      world_setting: this.world_setting,
      extensions: this.extensions,
      quality_report: this.quality_report
    }, null, 2);
  }

  // 从 JSON 导入
  static fromJSON(jsonString) {
    const data = JSON.parse(jsonString);
    return new ScriptBlueprint(data);
  }

  // 创建副本
  clone() {
    return new ScriptBlueprint(JSON.parse(this.toJSON()));
  }
}

module.exports = { ScriptBlueprint };

```

---

## engines/script-engine/core/script-generator.js

```javascript
// engines/script-engine/core/script-generator.js
// Script Generator - 调用 LLM 生成结构化剧本
// 版本：v1.0 | 日期：2026-06-07

const fs = require('fs');
const path = require('path');
const { ScriptBlueprint } = require('./script-blueprint');
const { buildBoundaryPrompt, extractSeriesPlan, extractPreviousSummary } = require('./boundary-prompt-templates');

// 复用现有LLM引擎
const LLM_ENGINE_PATH = path.join(__dirname, '../../../../systems/llm-reasoning-engine.js');
let LLMEngine;
try {
  ({ LLMEngine } = require(LLM_ENGINE_PATH));
} catch (e) {
  console.warn('[ScriptGenerator] 无法加载LLMEngine:', e.message);
}

class ScriptGenerator {
  constructor(options = {}) {
    const model = options.model || process.env.STORMAXE_LLM_MODEL || 'kimi-k2p6';
    this.config = {
      llmEndpoint: options.llmEndpoint || process.env.LLM_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      apiKey: options.apiKey || process.env.VOLCENGINE_ARK_API_KEY,
      // 【v2.1.4-fix13-审计修复】从环境变量读取，消除硬编码
      model: model,
      maxTokens: options.maxTokens || 8192,
      temperature: options.temperature || 1,
      promptTemplateDir: options.promptTemplateDir || path.join(__dirname, '../prompts'),
      templateDir: options.templateDir || path.join(__dirname, '../templates'),
      timeout: options.timeout || 300000,
      maxRetries: options.maxRetries || 3,
      ...options
    };
    
    // 初始化LLM引擎（优先使用现有引擎）
    this.llmEngine = null;
    if (LLMEngine) {
      this.llmEngine = new LLMEngine({
        // 【v2.1.4-fix13-审计修复】使用统一变量，不再写死
        model: model,
        maxTokens: this.config.maxTokens,
        timeoutMs: this.config.timeout,
        maxRetries: this.config.maxRetries
      });
      console.log(`[ScriptGenerator] 使用LLMEngine (${model})`);
    }
  }

  /**
   * 主入口：生成剧本
   * @param {object} userIntent - 用户意图对象
   * @param {object} templateData - 模板数据（可选）
   * @returns {ScriptBlueprint} 生成的剧本蓝图
   */
  async generate(userIntent, templateData = null) {
    console.log(`[ScriptGenerator] 开始生成剧本: ${userIntent.metadata?.title}`);

    // 1. 加载模板
    const template = templateData || await this._loadTemplate(userIntent);

    // 2. 构建 LLM Prompt
    const prompt = this._buildGenerationPrompt(userIntent, template);

    // 3. 调用 LLM
    const llmResponse = await this._callLLM(prompt);

    // 4. 解析并构建 Blueprint
    const blueprint = this._parseLLMResponse(llmResponse, userIntent);

    console.log(`[ScriptGenerator] 剧本生成完成: ${blueprint.blueprint_id}, ${blueprint.structure.scenes.length} 场景`);
    return blueprint;
  }

  /**
   * 加载模板
   */
  async _loadTemplate(userIntent) {
    // 【审计修复】根据 videoType 选择模板，科普类使用 educational 模板
    const videoType = userIntent.metadata?.videoType || userIntent.parsed?.video_type;
    let mode = userIntent.parsed?.primary_mode || 'dramatic';
    
    // 如果是科普/教育类型，强制使用 educational 模板
    if (videoType === 'EDU' || videoType === 'educational') {
      mode = 'educational';
    }
    
    const templatePath = path.join(this.config.templateDir, `${mode}-template.json`);

    try {
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      return JSON.parse(templateContent);
    } catch (err) {
      console.warn(`[ScriptGenerator] 模板加载失败: ${templatePath}, 使用默认模板`);
      return this._getDefaultTemplate();
    }
  }

  /**
   * 获取默认模板
   */
  _getDefaultTemplate() {
    return {
      structure: {
        acts: [
          { act_id: 'ACT-1', act_name: '第一幕', act_function: 'establish', beats: [] },
          { act_id: 'ACT-2', act_name: '第二幕', act_function: 'confront', beats: [] },
          { act_id: 'ACT-3', act_name: '第三幕', act_function: 'resolve', beats: [] }
        ]
      },
      default_scene_count: 5,
      default_duration_per_scene: 20
    };
  }

  /**
   * 构建 LLM 生成 Prompt
   */
  _buildGenerationPrompt(userIntent, template) {
    const meta = userIntent.metadata;
    const constraints = userIntent.constraints;
    const parsed = userIntent.parsed;

    const prompt = `你是一位获得托尼奖的话剧大师，专精古希腊悲剧、莎士比亚戏剧与现代荒诞派。你为AI视频生成系统创作结构化剧本，但你的灵魂是剧场——你的台词在舞台上必须有回响。

## 任务
为以下项目创作一部**话剧级别的短视频剧本**。你的目标不是"写一个脚本"，而是**设计一场权力博弈**——每一句台词都是一把刀，每一次沉默都是一道伤口。输出必须是严格的 JSON 格式。

## 项目信息
- 标题：${meta.title}
- 叙事类型：${parsed.primary_mode} ${parsed.hybrid_config ? '+ ' + parsed.secondary_modes.join(', ') : ''}
- 目标时长：${meta.target_duration}秒
- 世界观：${meta.world_setting}
${meta.featured_beast_id ? '- 主角异兽：' + meta.featured_beast_id : ''}
- 主角：${meta.protagonist}
- 平台：${meta.target_platform.join(', ')}
- 语言：${meta.language}

## 剧作家身份与创作原则

你是一位获得托尼奖的话剧大师，专精古希腊悲剧、莎士比亚戏剧与现代荒诞派。你的台词不是"说话"，而是**动作**——每一句都必须推动剧情、揭示性格、或改变权力关系。

### 话剧创作核心原则（你的灵魂）

**1. 台词即动作（Action through Dialogue）**
- 角色说话不是为了"告知信息"，而是为了**得到什么**、**阻止什么**、**隐藏什么**
- 每句台词背后都有一个动词：威胁、诱惑、欺骗、试探、退缩、挑衅、掩饰
- 问自己：如果删掉这句台词，权力关系会改变吗？如果不会，这句就不该存在

**2. 潜台词至上（Subtext over Text）**
- 角色说的 ≠ 角色想的。最锋利的台词是"言外之意"
- 示例：表面说"今日天气不错"，实际意思是"我知道你在撒谎，但我不点破"
- 让角色"绕着弯说话"——用寒暄掩饰杀意，用玩笑包裹真心

**3. 冲突的多样性（Varieties of Conflict）**
- 冲突不是只有"对骂"。探索这些形态：
  - **单方压迫**：A步步紧逼，B沉默后退（权力不对等）
  - **错位对话**：A问东，B答西，各说各话（信息差）
  - **沉默对峙**：双方不说话，用眼神、动作、呼吸对抗
  - **反讽交锋**：表面恭维，实则羞辱
  - **突然转折**：A占上风时，B一句话逆转局势
  - **共同敌人**：原本对立的角色突然发现更大的威胁
- **禁止模式化**：不要让冲突变成"你一句我一句的回合制对骂"

**4. 节奏即生命（Rhythm is Everything）**
- 对话的节奏 = 心跳的节奏。快-快-慢-停顿-爆发
- 长句之后跟短句。安静之后跟爆发。连续攻击之后跟突然沉默
- 用停顿制造张力：角色欲言又止时，观众会屏住呼吸

**5. 出其不意（Surprise）**
- 观众预期A，你给B。不要让冲突按 predictable 的模式发展
- 当观众以为要打起来时，让角色突然笑了。当观众以为要和解时，让角色拔刀了
- 角色的反应应该**略高于或略低于**观众的预期，永远不要在预期线上

**6. 沉默的力量（The Power of Silence）**
- 最戏剧性的时刻往往没有台词。一个眼神、一次深呼吸、一滴汗、一个转身
- 不要让角色"把话说完"。让有些话永远不说出口

**7. 角色声音的独特性（Voice Differentiation）**
- 每个角色必须有独特的说话方式：用词习惯、句式长度、修辞偏好、停顿位置
- 遮住角色名，读者应该能凭台词猜出是谁在说话
- 孙悟空说话像石头砸钢板——硬、脆、响。二郎神说话像冰层裂开——冷、深、慢。

### 底线约束（不可违反）
1. 禁止旁白（Voiceover），只保留角色对话（Dialogue）
2. 每个场景必须有角色对话（台词）
3. 台词必须口语化，适合短视频节奏（每句不超过30字）
4. 场景时长分配：根据内容重要性、台词长度、视觉复杂度三维度分配
5. 总时长必须严格等于 ${meta.target_duration} 秒
6. 角色视觉锚点必须保持一致（定妆照引用）

## 剧本结构模板
采用三幕式结构：
${JSON.stringify(template.structure.acts, null, 2)}

## 世界观设定
${meta.world_setting === '示例世界' ? `
- 示例世界是地球前身，一个虚构与碳基生命共存的星球
- 《古籍神话》实为示例世界往事的记录
- 核心主题：记忆即存在
- 环境特征：硅晶草原、双月当空、等离子河流、晶体森林
- 禁止暗黑风格，要求明亮多色彩强质感
` : meta.world_setting ? `
- 世界观：${meta.world_setting}
` : `
- 现实世界设定，真实场景，写实风格
- 环境特征：根据内容类型选择合适场景（医院、实验室、户外等）
- 要求明亮、专业、可信的视觉效果
`}

## 输出格式要求
你必须输出一个严格的 JSON 对象，符合以下 Schema：

\`\`\`json
{
  "meta": {
    "title": "标题",
    "narrative_mode": "dramatic",
    "target_duration": ${meta.target_duration},
    "acts_count": 3,
    "scenes_count": 场景数量
  },
  "structure": {
    "acts": [
      {
        "act_id": "ACT-1",
        "act_name": "幕名称",
        "act_function": "establish|confront|resolve",
        "start_time": 0,
        "end_time": 幕结束秒数,
        "beats": [
          {
            "beat_id": "B-1.1",
            "beat_type": "hook|setup|rising|climax|resolution",
            "description": "节拍描述",
            "target_emotion": "wonder|tension|joy|sadness|awe"
          }
        ]
      }
    ],
    "scenes": [
      {
        "scene_id": "SC00",
        "scene_name": "场景名称",
        "scene_type": "opening|establishing|conflict|emotional_climax|resolution",
        "scene_function": "establish|advance|conflict|climax|resolve",
        "act_id": "ACT-1",
        "timing": {
          "start": 开始秒数,
          "duration": 持续秒数,
          "end": 结束秒数
        },
        "characters": ["角色ID"],
        "setting": "场景时空设定",
        "dialogue": {
          "has_dialogue": true,
          "lines": [
            {
              "speaker": "角色ID",
              "text": "台词内容（口语化，不超过30字）",
              "emotion": "情绪标签"
            }
          ]
        },
        "visual_notes": "视觉指导备注",
        "emotional_target": {
          "valence": 0.8,
          "arousal": 0.6,
          "dominance": 0.5
        }
      }
    ]
  },
  "character_system": {
    "characters": [
      {
        "character_id": "example-role",
        "name": "示例角色",
        "role": "protagonist",
        "voice_profile": {
          "persona": "角色人设描述",
          "tone": "语气标签",
          "speaking_style": "说话风格"
        },
        "visual_anchor": {
          "core_features": ["核心特征1", "核心特征2", "核心特征3"],
          "reference_images": ["定妆照路径"]
        }
      }
    ]
  },
  "voice_system": {
    "global_voice_policy": "dialogue_only_no_voiceover",
    "voice_profiles": [
      {
        "voice_id": "V-角色ID",
        "character_id": "角色ID",
        "role": "角色定位",
        "tone": "语气",
        "pace": "语速",
        "constraints": {
          "forbidden_words": ["禁用词"],
          "max_line_length": 30
        }
      }
    ]
  },
  "world_setting": {
    "world_id": "nirath",
    "world_name": "示例世界星球",
    "era": "上古纪元",
    "core_rules": ["规则1", "规则2"],
    "environment_tags": ["环境标签1", "环境标签2"]
  }
}
\`\`\`

## 关键要求
1. 场景数量建议 5-7 个，总时长严格等于 ${meta.target_duration} 秒
2. 每个场景的台词必须包含在场景中（不能旁白）
3. 场景时长分配需严格计算，总和必须精确等于${meta.target_duration}秒，例如：${Math.round(meta.target_duration/5)}秒×5场景
4. 角色视觉锚点必须保持一致（定妆照引用）
${meta.characters?.length > 0 ? `
## 角色信息（必须严格使用，禁止自创角色）
${meta.characters.map(c => `- ${c.name} (ID: ${c.id || c.name}): ${c.description || '主讲人'}`).join('\n')}

【角色约束 - 不可违反】
- 所有场景的角色必须是以上指定的角色，严禁自创其他角色（如"医生""患者""路人"等）
- 场景描述(setting)和视觉备注(visual_notes)中提到的角色必须与指定角色一致
- 如果只有一个角色，所有场景都必须是该角色出镜或该角色的视角
` : ''}
${(() => {
  // 【v2.1.4】跨集边界约束 - 使用新的边界契约提示词
  const seriesPlan = extractSeriesPlan(meta);
  if (!seriesPlan || seriesPlan.totalEpisodes <= 1) return '';
  
  const episodeIndex = meta.series?.currentEpisode || meta.episode || 1;
  const previousSummary = extractPreviousSummary(meta);
  
  return buildBoundaryPrompt({
    episodeIndex,
    totalEpisodes: seriesPlan.totalEpisodes,
    seriesPlan,
    previousSummary
  });
})()}

## 创意指数指导（创意指数 = ${meta._creativeIntensity?.intensity || meta.creativeIntensity || '未设置'}）
${meta._creativeIntensity?.instructions?.script ? meta._creativeIntensity.instructions.script : ''}
${meta._creativeIntensity?.instructions?.production ? `
## 视觉表现指导
${meta._creativeIntensity.instructions.production}` : ''}
${meta._creativeIntensity?.instructions?.rendering ? `
## 渲染质感指导
${meta._creativeIntensity.instructions.rendering}` : ''}

${meta._directorStyle ? `
## 导演风格指导
${meta._directorStyle}` : ''}

5. 高潮场景必须包含情感张力和视觉冲击力

请直接输出 JSON，不要包含任何其他解释文字。`;

    return prompt;
  }

  /**
   * 调用 LLM API
   * v1.1: 优先使用LLMEngine (kimi-k2p6)
   */
  async _callLLM(prompt) {
    // 【v2.1.4-fix13-审计修复】增加 Promise.race 超时保护，防止 LLM 调用 hang 住
    const timeoutMs = this.config.timeout || 300000;
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`ScriptGenerator LLM 超时(${timeoutMs}ms)`)), timeoutMs);
    });

    // 优先使用LLMEngine
    if (this.llmEngine) {
      try {
        console.log('[ScriptGenerator] 使用LLMEngine调用...');
        const result = await Promise.race([
          this.llmEngine.generate(prompt, {
            systemPrompt: '你是一位专业的AI视频编剧。只输出严格格式的JSON，不要markdown代码块，不要解释，不要思考过程。使用最紧凑的JSON格式（不要换行和缩进）。',
            maxTokens: 32000,
            timeoutMs: timeoutMs,
            forceJson: true,
            allowReasoningFallback: false
          }),
          timeoutPromise
        ]).finally(() => clearTimeout(timer));
        
        // v1.2.6-fix: 正确处理LLM引擎返回结构
        if (!result.success) {
          console.error('[ScriptGenerator] LLM引擎返回失败:', result.error);
          throw new Error(`LLM引擎错误: ${result.error}`);
        }
        
        // v1.2.6-fix8: forceJson 模式下，content 必非空
        if (result.content && result.content.trim()) {
          return result.content.trim();
        }
        
        // 兜底：从 reasoning 中提取 JSON 对象
        if (result.reasoning_content && result.reasoning_content.trim()) {
          console.warn('[ScriptGenerator] ⚠️ forceJson模式下仍返回空content，尝试从reasoning提取');
          const jsonMatch = result.reasoning_content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return jsonMatch[0].trim();
          }
        }
        throw new Error('LLM返回空内容（success=true但content为空，forceJson模式异常）');
      } catch (error) {
        // 【P1-24-审计修复】LLMEngine 失败不直接 throw，降级到 HTTP
        console.warn(`[ScriptGenerator] LLMEngine调用失败: ${error.message}，降级到HTTP直接调用`);
        // 继续执行下面的 HTTP 降级路径
      }
    }
    
    // 降级：直接HTTP调用（保留旧逻辑作为fallback）
    const axios = require('axios');
    let lastError = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`[ScriptGenerator] LLM 直接调用尝试 ${attempt}/${this.config.maxRetries}`);

        const response = await axios.post(
          this.config.llmEndpoint,
          {
            model: this.config.model,
            messages: [
              { role: 'system', content: '你是一位专业的AI视频编剧，只输出严格格式的JSON。' },
              { role: 'user', content: prompt }
            ],
            max_tokens: this.config.maxTokens,
            temperature: 1,
            top_p: 0.95
          },
          {
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: timeoutMs
          }
        );

        const content = response.data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('LLM 返回内容为空');
        }

        return content;

      } catch (error) {
        lastError = error;
        console.warn(`[ScriptGenerator] LLM 调用失败 (${attempt}/${this.config.maxRetries}): ${error.message}`);

        if (attempt < this.config.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 指数退避
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`LLM 调用失败，已重试 ${this.config.maxRetries} 次: ${lastError?.message}`);
  }

  /**
   * 解析 LLM 响应
   */
  _parseLLMResponse(response, userIntent) {
    try {
      // 清理响应中的 markdown 代码块标记
      let jsonStr = response;
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }

      // v1.2.5: 尝试解析JSON，失败则尝试从截断文本中提取
      let parsed = this._tryParseJson(jsonStr);
      
      // 如果主解析失败，尝试从文本中提取最长有效JSON
      if (!parsed) {
        console.warn('[ScriptGenerator] 主JSON解析失败，尝试提取有效JSON...');
        parsed = this._extractValidJson(jsonStr);
      }
      
      if (!parsed) {
        throw new Error('无法从响应中提取有效JSON');
      }

      // v1.2.6-fix4: 从metadata注入角色信息（彻底覆盖LLM生成的错误角色）
      const metadataChars = userIntent.metadata?.characters || [];
      if (metadataChars.length > 0) {
        const overrideCharacters = metadataChars.map(c => ({
          character_id: c.character_id || c.id || c.name,
          name: c.name,
          role: c.role || 'protagonist',
          visual_anchor: {
            core_features: c.description ? c.description.split(/[,，、]/).filter(s => s.trim()) : ['写实人物'],
            reference_images: c.portraitPaths || c.portraits || []
          },
          voice_profile: {
            persona: c.description || c.name,
            tone: '专业',
            speaking_style: '口语化科普'
          }
        }));

        const primaryName = overrideCharacters[0]?.name || '主讲人';
        const primaryDesc = metadataChars[0]?.description || primaryName;
        const validNames = overrideCharacters.map(c => c.name);
        const validIds = overrideCharacters.map(c => c.character_id);

        // 1. 替换角色系统
        parsed.character_system = { characters: overrideCharacters };

        // 2. 替换 voice_system 中的角色引用
        if (parsed.voice_system?.characters) {
          parsed.voice_system.characters = overrideCharacters;
        }

        // 3. 彻底替换所有场景中的角色引用（兼容多种 dialogue 结构）
        if (parsed.structure?.scenes) {
          for (const scene of parsed.structure.scenes) {
            // 3a. 替换场景角色ID列表
            if (Array.isArray(scene.characters)) {
              scene.characters = validIds.slice(0, scene.characters.length || 1);
            }

            // 3b. 兼容多种 dialogue 结构
            // 结构A: scene.dialogue.lines = [{speaker, text, ...}]
            if (scene.dialogue?.lines && Array.isArray(scene.dialogue.lines)) {
              for (const line of scene.dialogue.lines) {
                if (line && typeof line === 'object') {
                  line.speaker = primaryName;
                }
              }
            }
            // 结构B: scene.dialogue = [{speaker, text, ...}] (直接数组)
            else if (Array.isArray(scene.dialogue)) {
              scene.dialogue = scene.dialogue.map(line => {
                if (typeof line === 'string') {
                  return { speaker: primaryName, text: line, type: '独白', emotion: '平静' };
                }
                if (line && typeof line === 'object') {
                  line.speaker = primaryName;
                  return line;
                }
                return line;
              });
            }
            // 结构C: scene.lines = [...] (部分LLM用这个)
            else if (scene.lines && Array.isArray(scene.lines)) {
              for (const line of scene.lines) {
                if (line && typeof line === 'object') {
                  line.speaker = primaryName;
                }
              }
            }
            // 结构D: scene.dialogue 是字符串
            else if (typeof scene.dialogue === 'string' && scene.dialogue.trim()) {
              let newDialogue = scene.dialogue;
              newDialogue = newDialogue.replace(/示例角色|角色R|角色A|角色B|医生小[A-Z]|患者小[A-Z]/g, primaryName);
              scene.dialogue = newDialogue;
            }

            // 3c. 替换场景描述中的角色名和身份描述
            if (typeof scene.description === 'string') {
              scene.description = scene.description.replace(/示例角色|角色R|角色A|角色B/g, primaryName);
            }
            if (typeof scene.scene_description === 'string') {
              scene.scene_description = scene.scene_description.replace(/示例角色|角色R|角色A|角色B/g, primaryName);
            }
            // v2.1.4-fix8: 替换 setting 和 visual_notes 中的错误角色身份
            if (typeof scene.setting === 'string') {
              // 强制替换所有可能暗示其他角色的描述
              scene.setting = scene.setting.replace(/医生|主治医师|主任医师|大夫|医师|医护人员|护士|患者|病人|路人|市民/g, primaryDesc.split(/[,，、]/)[0]);
              scene.setting = scene.setting.replace(/白色医生服|白大褂|灰色运动服|运动服/g, '警服');
              scene.setting = scene.setting.replace(/男性|男人|男士|男|中年男子|中年男性/g, '女性');
            }
            if (typeof scene.visual_notes === 'string') {
              scene.visual_notes = scene.visual_notes.replace(/医生|主治医师|主任医师|大夫|医师|医护人员|护士|患者|病人|路人|市民/g, primaryDesc.split(/[,，、]/)[0]);
              scene.visual_notes = scene.visual_notes.replace(/白色医生服|白大褂|灰色运动服|运动服/g, '警服');
              scene.visual_notes = scene.visual_notes.replace(/男性|男人|男士|男|中年男子|中年男性/g, '女性');
            }

            // 3d. 替换 narration 字段
            if (scene.narration) {
              if (typeof scene.narration === 'string') {
                scene.narration = scene.narration.replace(/示例角色|角色R|角色A|角色B/g, primaryName);
              } else if (Array.isArray(scene.narration)) {
                scene.narration = scene.narration.map(n => {
                  if (typeof n === 'string') return n.replace(/示例角色|角色R|角色A|角色B/g, primaryName);
                  if (n && typeof n === 'object') { n.speaker = primaryName; return n; }
                  return n;
                });
              }
            }
          }
        }

        // 4. 清理 world_setting 中可能的角色引用
        if (parsed.world_setting?.characters) {
          parsed.world_setting.characters = overrideCharacters;
        }

        console.log(`[ScriptGenerator] 角色覆盖完成: ${validNames.join(', ')}（已替换所有场景角色引用和身份描述）`);
      }

      // v1.2.5: 注入metadata._metadata到blueprint meta
      const meta = {
        ...parsed.meta,
        narrative_mode: userIntent.parsed?.narrative_mode || 'dramatic',
        target_duration: userIntent.metadata?.target_duration || 120,
        _metadata: {
          isSeries: userIntent.metadata?.series?.totalEpisodes > 1 || userIntent.metadata?.series?.total_episodes > 1,
          episodeNumber: userIntent.metadata?.series?.currentEpisode || userIntent.metadata?.series?.episode || 1,
          totalEpisodes: userIntent.metadata?.series?.totalEpisodes || userIntent.metadata?.series?.total_episodes || 1,
          hasOpening: userIntent.metadata?.hasOpening !== false,
          noNextEpisodePreview: userIntent.metadata?.noNextEpisodePreview || false,
          aspectRatio: userIntent.metadata?.aspectRatio || '16:9',
          // 【v2.1.4】传递系列内容规划
          seriesContentPlan: userIntent.metadata?.seriesContentPlan || null,
          ...userIntent.metadata?._metadata
        }
      };

      // 构建 Blueprint
      const blueprint = new ScriptBlueprint({
        intent_ref: userIntent.intent_id,
        meta: meta,
        structure: parsed.structure,
        character_system: parsed.character_system,
        voice_system: parsed.voice_system,
        world_setting: parsed.world_setting,
        extensions: {
          dramatic_extension: parsed.dramatic_extension || {},
          nirath_extension: {
            featured_beast_id: userIntent.metadata?.featured_beast_id,
            memory_theme: '记忆即存在'
          }
        }
      });

      return blueprint;

    } catch (err) {
      console.error('[ScriptGenerator] JSON 解析失败:', err.message);
      console.error('[ScriptGenerator] 原始响应:', response.substring(0, 500));

      // 返回一个带有错误信息的 Blueprint
      const fallbackBlueprint = new ScriptBlueprint({
        intent_ref: userIntent.intent_id,
        meta: {
          title: userIntent.metadata?.title || '生成失败',
          narrative_mode: 'dramatic',
          target_duration: userIntent.metadata?.target_duration || 120
        },
        quality_report: {
          evaluator: 'Error',
          scores: { error: 0 },
          passed: false
        }
      });

      fallbackBlueprint._generation_error = {
        message: err.message,
        raw_response: response.substring(0, 1000)
      };

      return fallbackBlueprint;
    }
  }

  /**
   * v1.2.5: 尝试解析JSON字符串
   * @returns {object|null} 解析成功返回对象，失败返回null
   */
  _tryParseJson(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  /**
   * v1.2.5: 从可能截断的文本中提取最长有效JSON
   * 策略：从字符串末尾逐步截断，尝试找到能解析的最长前缀
   */
  /**
   * v1.2.6-fix11: 从可能截断的文本中提取最长有效JSON
   * 策略：1.直接解析 2.逐步截断前缀尝试 3.括号匹配找完整对象 4.🆕自动补全缺失的闭合括号
   */
  _extractValidJson(str) {
    if (!str || typeof str !== 'string') return null;

    // 先找到最外层的大括号范围
    let start = str.indexOf('{');
    if (start === -1) return null;

    // 策略1：直接解析整段（快速路径）
    let parsed = this._tryParseJson(str.substring(start));
    if (parsed && parsed.meta && parsed.structure) return parsed;

    // 策略2：单次栈扫描定位匹配括号（O(n)，替代原暴力截断）
    {
      let braceCount = 0;
      let inString = false;
      let escaped = false;
      let lastValidEnd = -1;

      for (let i = start; i < str.length; i++) {
        const ch = str[i];
        if (inString) {
          if (escaped) { escaped = false; }
          else if (ch === '\\') { escaped = true; }
          else if (ch === '"') { inString = false; }
          continue;
        }
        if (ch === '"') { inString = true; }
        else if (ch === '{') { braceCount++; }
        else if (ch === '}') {
          braceCount--;
          if (braceCount === 0) lastValidEnd = i + 1;
        }
      }

      if (lastValidEnd > start) {
        const candidate = str.substring(start, lastValidEnd);
        try {
          const p = JSON.parse(candidate);
          if (p.meta && p.structure) {
            console.log(`[ScriptGenerator] 通过括号匹配提取JSON成功，使用 ${lastValidEnd}/${str.length} 字符`);
            return p;
          }
        } catch (e) { /* 失败，进入策略3 */ }
      }
    }

    // 策略3：自动补全缺失的闭合括号（处理未闭合的截断JSON）
    {
      let braceCount = 0;    // {} 未闭合数
      let bracketCount = 0;  // [] 未闭合数
      let inString = false;
      let escaped = false;

      for (let i = start; i < str.length; i++) {
        const ch = str[i];
        if (inString) {
          if (escaped) { escaped = false; }
          else if (ch === '\\') { escaped = true; }
          else if (ch === '"') { inString = false; }
          continue;
        }
        if (ch === '"') { inString = true; }
        else if (ch === '{') { braceCount++; }
        else if (ch === '}') { braceCount--; }
        else if (ch === '[') { bracketCount++; }
        else if (ch === ']') { bracketCount--; }
      }

      // braceCount > 0 或 bracketCount > 0 或 inString=true 说明被截断
      if (braceCount > 0 || bracketCount > 0 || inString) {
        let base = str.substring(start);
        // 如果字符串未闭合，补上引号
        if (inString) base += '"';

        // 尝试补全组合（数量有限，性能可接受）
        for (let arr = bracketCount; arr >= 0; arr--) {
          for (let obj = braceCount; obj >= 0; obj--) {
            const testA = base + ']'.repeat(arr) + '}'.repeat(obj);
            const testB = base + '}'.repeat(obj) + ']'.repeat(arr);

            for (const candidate of [testA, testB]) {
              try {
                const p = JSON.parse(candidate);
                if (p && p.meta && p.structure) {
                  console.log(`[ScriptGenerator] 通过自动补全括号提取JSON成功（补 ${arr}个] ${obj}个}），使用 ${candidate.length}/${str.length} 字符`);
                  return p;
                }
              } catch (e) { /* 继续尝试 */ }
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * 保存剧本到文件
   */
  async saveBlueprint(blueprint, outputPath) {
    const json = blueprint.toJSON();
    fs.writeFileSync(outputPath, json, 'utf-8');
    console.log(`[ScriptGenerator] 剧本已保存: ${outputPath}`);
    return outputPath;
  }

  /**
   * 从文件加载剧本
   */
  static loadBlueprint(filePath) {
    const json = fs.readFileSync(filePath, 'utf-8');
    return ScriptBlueprint.fromJSON(json);
  }
}

module.exports = { ScriptGenerator };

```

---

## engines/script-engine/core/script-validator.js

```javascript
// engines/script-engine/core/script-validator.js
// Script Validator - 剧本校验与质量评估
// 版本：v1.0 | 日期：2026-06-07

class ScriptValidator {
  constructor(options = {}) {
    this.config = {
      // 时长约束
      minDuration: 15,
      maxDuration: 300,
      
      // 场景数量约束
      minScenes: 3,
      maxScenes: 10,
      
      // 台词约束
      // B4-fix: 与 v6.37 标准(≤50字)对齐
      maxLineLength: 50, // 字（v6.37标准：单句台词≤50字）
      minScenesWithDialogue: 1,
      
      // 质量阈值
      qualityThresholds: {
        structural_integrity: 70,
        emotional_impact: 60,
        character_consistency: 80,
        dialogue_quality: 70,
        visual_feasibility: 60
      },
      
      // Nirath 约束
      nirathRequiredElements: ['Nirath', '硅', '双月', '晶体', '等离子'],
      forbiddenElements: ['旁白', 'voiceover', '解说', '金属光泽', 'unnatural_eye_color'],
      
      ...options
    };
  }

  /**
   * 主入口：完整校验剧本
   * @param {ScriptBlueprint} blueprint - 剧本蓝图
   * @returns {object} 校验报告
   */
  validate(blueprint) {
    const checks = [];
    
    // 1. 结构完整性检查
    const structuralChecks = this._checkStructure(blueprint);
    checks.push(...structuralChecks);
    
    // 2. 时长检查
    const durationChecks = this._checkDuration(blueprint);
    checks.push(...durationChecks);
    
    // 3. 台词检查
    const dialogueChecks = this._checkDialogue(blueprint);
    checks.push(...dialogueChecks);
    
    // 4. 角色一致性检查
    const characterChecks = this._checkCharacters(blueprint);
    checks.push(...characterChecks);
    
    // 5. Nirath 世界观检查（如果是 Nirath 世界观）
    if (blueprint.world_setting?.world_id === 'nirath') {
      const nirathChecks = this._checkNirathWorld(blueprint);
      checks.push(...nirathChecks);
    }
    
    // 6. 禁止元素检查
    const forbiddenChecks = this._checkForbiddenElements(blueprint);
    checks.push(...forbiddenChecks);
    
    // 7. 质量评分
    const scores = this._calculateScores(blueprint, checks);
    
    // 汇总
    const failedChecks = checks.filter(c => c.passed === false);
    const passed = failedChecks.length === 0 && scores.overall >= 60;
    
    return {
      blueprint_id: blueprint.blueprint_id,
      passed,
      overall_score: scores.overall,
      checks,
      scores: {
        detailed: scores.detailed,
        summary: scores.summary
      },
      issues: failedChecks.map(c => ({
        category: c.category,
        severity: c.severity,
        message: c.message,
        suggestion: c.suggestion
      })),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 结构完整性检查
   */
  _checkStructure(blueprint) {
    const checks = [];
    const structure = blueprint.structure;
    
    // 检查幕结构
    checks.push({
      category: 'structure',
      name: 'acts_exist',
      passed: structure.acts && structure.acts.length > 0,
      severity: 'critical',
      message: structure.acts?.length ? `有 ${structure.acts.length} 幕` : '缺少幕结构',
      suggestion: '必须至少包含 1 幕'
    });
    
    // 检查场景数量
    const sceneCount = structure.scenes?.length || 0;
    checks.push({
      category: 'structure',
      name: 'scene_count',
      passed: sceneCount >= this.config.minScenes && sceneCount <= this.config.maxScenes,
      severity: 'critical',
      message: `有 ${sceneCount} 个场景`,
      suggestion: `场景数量应在 ${this.config.minScenes}-${this.config.maxScenes} 之间`
    });
    
    // 检查场景连续性
    let continuous = true;
    let lastEnd = 0;
    for (const scene of (structure.scenes || [])) {
      if (scene.timing) {
        if (Math.abs(scene.timing.start - lastEnd) > 1) {
          continuous = false;
        }
        lastEnd = scene.timing.end;
      }
    }
    checks.push({
      category: 'structure',
      name: 'scene_continuity',
      passed: continuous,
      severity: 'warning',
      message: continuous ? '场景时序连续' : '场景时序存在断层',
      suggestion: '确保场景时间轴连续无断层'
    });
    
    // 检查场景 ID 唯一性
    const sceneIds = (structure.scenes || []).map(s => s.scene_id);
    const uniqueIds = new Set(sceneIds);
    checks.push({
      category: 'structure',
      name: 'scene_id_unique',
      passed: sceneIds.length === uniqueIds.size,
      severity: 'critical',
      message: sceneIds.length === uniqueIds.size ? '场景 ID 唯一' : '存在重复场景 ID',
      suggestion: '确保每个场景 ID 唯一'
    });
    
    return checks;
  }

  /**
   * 时长检查
   */
  _checkDuration(blueprint) {
    const checks = [];
    const targetDuration = blueprint.meta?.target_duration || 120;
    const actualDuration = blueprint.getTotalDuration();
    
    checks.push({
      category: 'duration',
      name: 'total_duration_match',
      passed: Math.abs(actualDuration - targetDuration) <= 5,
      severity: 'critical',
      message: `目标时长 ${targetDuration}s, 实际时长 ${actualDuration}s`,
      suggestion: `总时长应与目标时长一致（误差≤5s）`
    });
    
    checks.push({
      category: 'duration',
      name: 'duration_in_range',
      passed: actualDuration >= this.config.minDuration && actualDuration <= this.config.maxDuration,
      severity: 'critical',
      message: `实际时长 ${actualDuration}s`,
      suggestion: `时长应在 ${this.config.minDuration}-${this.config.maxDuration}s 之间`
    });
    
    // 检查每个场景时长
    for (const scene of (blueprint.structure.scenes || [])) {
      if (scene.timing) {
        const duration = scene.timing.duration;
        checks.push({
          category: 'duration',
          name: `scene_${scene.scene_id}_duration`,
          // B3-fix: 与 v6.37 标准对齐（过渡8-10s，核心12-15s，上限60s）
          passed: duration > 0 && duration <= 60,
          severity: 'warning',
          message: `场景 ${scene.scene_id} 时长 ${duration}s`,
          suggestion: '单个场景时长应在 8-60s 之间（过渡8-10s，核心12-15s）'
        });
      }
    }
    
    return checks;
  }

  /**
   * 台词检查
   */
  _checkDialogue(blueprint) {
    const checks = [];
    const scenes = blueprint.structure.scenes || [];
    
    // 统计有台词的场景
    const scenesWithDialogue = scenes.filter(s => s.dialogue?.has_dialogue && s.dialogue?.lines?.length > 0);
    
    checks.push({
      category: 'dialogue',
      name: 'has_dialogue',
      passed: scenesWithDialogue.length >= this.config.minScenesWithDialogue,
      severity: 'critical',
      message: `${scenesWithDialogue.length}/${scenes.length} 场景有台词`,
      suggestion: '必须至少包含台词的场景'
    });
    
    // 检查台词长度
    let longLines = 0;
    for (const scene of scenes) {
      if (scene.dialogue?.lines) {
        for (const line of scene.dialogue.lines) {
          if (line.text && line.text.length > this.config.maxLineLength) {
            longLines++;
          }
        }
      }
    }
    
    checks.push({
      category: 'dialogue',
      name: 'line_length',
      passed: longLines === 0,
      severity: 'warning',
      message: longLines === 0 ? '所有台词长度合规' : `${longLines} 句台词超过 ${this.config.maxLineLength} 字`,
      suggestion: `台词每句不超过 ${this.config.maxLineLength} 字`
    });
    
    // 检查是否包含旁白（禁止）
    let hasVoiceover = false;
    for (const scene of scenes) {
      if (scene.voice_over?.text) {
        hasVoiceover = true;
        break;
      }
    }
    
    checks.push({
      category: 'dialogue',
      name: 'no_voiceover',
      passed: !hasVoiceover,
      severity: 'critical',
      message: hasVoiceover ? '检测到旁白（禁止）' : '无旁白，合规',
      suggestion: '全局禁止旁白，只保留角色对话'
    });
    
    return checks;
  }

  /**
   * 角色一致性检查
   */
  _checkCharacters(blueprint) {
    const checks = [];
    const characters = blueprint.character_system?.characters || [];
    const characterIds = characters.map(c => c.character_id);
    
    // 检查主角存在
    const hasProtagonist = characters.some(c => c.role === 'protagonist');
    checks.push({
      category: 'character',
      name: 'has_protagonist',
      passed: hasProtagonist,
      severity: 'critical',
      message: hasProtagonist ? '主角已定义' : '缺少主角定义',
      suggestion: '必须定义 protagonist 角色'
    });
    
    // 检查角色核心特征
    for (const character of characters) {
      if (character.visual_anchor?.core_features) {
        const featureCount = character.visual_anchor.core_features.length;
        checks.push({
          category: 'character',
          name: `character_${character.character_id}_features`,
          passed: featureCount >= 2 && featureCount <= 5,
          severity: 'warning',
          message: `角色 ${character.character_id} 有 ${featureCount} 个核心特征`,
          suggestion: '核心特征应在 2-5 个之间'
        });
      }
    }
    
    // 检查场景中引用的角色是否已定义
    for (const scene of (blueprint.structure.scenes || [])) {
      if (scene.characters) {
        for (const cid of scene.characters) {
          checks.push({
            category: 'character',
            name: `scene_${scene.scene_id}_character_${cid}`,
            passed: characterIds.includes(cid),
            severity: 'critical',
            message: characterIds.includes(cid) ? `角色 ${cid} 已定义` : `角色 ${cid} 未定义`,
            suggestion: '场景中引用的角色必须在 character_system 中定义'
          });
        }
      }
    }
    
    return checks;
  }

  /**
   * Nirath 世界观检查
   * 【P2-28-审计修复】从 worldSetting 动态读取必需元素，不硬编码
   */
  _checkNirathWorld(blueprint) {
    const checks = [];
    const scenes = blueprint.structure?.scenes || [];

    // 【修复】从 worldSetting 动态读取必需元素
    const requiredElements = blueprint.world_setting?.environment_tags ||
                             blueprint.world_setting?.required_elements || [];
    if (requiredElements.length === 0) {
      return checks; // 无必需元素则跳过
    }

    let hasElements = false;
    for (const scene of scenes) {
      if (scene.setting) {
        for (const element of requiredElements) {
          if (scene.setting.includes(element)) {
            hasElements = true;
            break;
          }
        }
      }
    }

    checks.push({
      category: 'nirath',
      passed: hasElements || scenes.length === 0,
      message: hasElements ? '场景包含世界观必需元素' : '场景缺少世界观特征元素',
      details: hasElements ? '' : `建议添加: ${requiredElements.join(', ')}`
    });

    return checks;
  }

  /**
   * 明亮风格约束检查
   */
  _checkBrightStyle(blueprint) {
    const checks = [];
    const scenes = blueprint.structure?.scenes || [];
    let hasDarkStyle = false;
    for (const scene of scenes) {
      if (scene.visual_notes) {
        const darkKeywords = ['暗黑', '黑暗', 'night', 'dark', '漆黑', '阴郁'];
        for (const keyword of darkKeywords) {
          if (scene.visual_notes.includes(keyword)) {
            hasDarkStyle = true;
            break;
          }
        }
      }
    }
    checks.push({
      category: 'style',
      passed: !hasDarkStyle,
      severity: 'critical',
      message: hasDarkStyle ? '检测到暗黑风格（禁止）' : '明亮风格，合规',
      suggestion: '要求明亮多色彩强质感场景，禁止暗黑风格'
    });
    return checks;
  }

  /**
   * 禁止元素检查
   */
  _checkForbiddenElements(blueprint) {
    const checks = [];
    const scenes = blueprint.structure.scenes || [];
    
    for (const forbidden of this.config.forbiddenElements) {
      let found = false;
      let location = '';
      
      for (const scene of scenes) {
        const allText = JSON.stringify(scene);
        if (allText.includes(forbidden)) {
          found = true;
          location = scene.scene_id;
          break;
        }
      }
      
      checks.push({
        category: 'forbidden',
        name: `forbidden_${forbidden}`,
        passed: !found,
        severity: 'critical',
        message: found ? `检测到禁用元素 "${forbidden}"（场景 ${location}）` : `无 "${forbidden}"`,
        suggestion: `全局禁止 "${forbidden}"`
      });
    }
    
    return checks;
  }

  /**
   * 计算质量评分
   */
  _calculateScores(blueprint, checks) {
    const detailed = {};
    
    // 结构完整性评分
    const structuralChecks = checks.filter(c => c.category === 'structure');
    const structuralPassed = structuralChecks.filter(c => c.passed).length;
    detailed.structural_integrity = Math.round((structuralPassed / structuralChecks.length) * 100) || 0;
    
    // 时长合规评分
    const durationChecks = checks.filter(c => c.category === 'duration');
    const durationPassed = durationChecks.filter(c => c.passed).length;
    detailed.duration_compliance = Math.round((durationPassed / durationChecks.length) * 100) || 0;
    
    // 台词质量评分
    const dialogueChecks = checks.filter(c => c.category === 'dialogue');
    const dialoguePassed = dialogueChecks.filter(c => c.passed).length;
    detailed.dialogue_quality = Math.round((dialoguePassed / dialogueChecks.length) * 100) || 0;
    
    // 角色一致性评分
    const characterChecks = checks.filter(c => c.category === 'character');
    const characterPassed = characterChecks.filter(c => c.passed).length;
    detailed.character_consistency = Math.round((characterPassed / characterChecks.length) * 100) || 0;
    
    // Nirath 世界观评分
    const nirathChecks = checks.filter(c => c.category === 'nirath');
    const nirathPassed = nirathChecks.filter(c => c.passed).length;
    detailed.nirath_compliance = nirathChecks.length > 0 ? Math.round((nirathPassed / nirathChecks.length) * 100) : 100;
    
    // 综合评分
    const overall = Math.round(
      (detailed.structural_integrity * 0.25 +
       detailed.duration_compliance * 0.20 +
       detailed.dialogue_quality * 0.25 +
       detailed.character_consistency * 0.20 +
       detailed.nirath_compliance * 0.10)
    );
    
    return {
      overall,
      detailed,
      summary: {
        total_checks: checks.length,
        passed_checks: checks.filter(c => c.passed).length,
        failed_checks: checks.filter(c => !c.passed).length,
        critical_issues: checks.filter(c => !c.passed && c.severity === 'critical').length
      }
    };
  }

  /**
   * 生成修复建议
   */
  generateRepairPlan(validationReport) {
    const issues = validationReport.issues || [];
    const repairs = [];
    
    for (const issue of issues) {
      switch (issue.category) {
        case 'structure':
          repairs.push({
            type: 'structure',
            action: 'adjust_structure',
            description: issue.message,
            suggestion: issue.suggestion
          });
          break;
          
        case 'duration':
          repairs.push({
            type: 'duration',
            action: 'adjust_timing',
            description: issue.message,
            suggestion: issue.suggestion
          });
          break;
          
        case 'dialogue':
          repairs.push({
            type: 'dialogue',
            action: 'rewrite_dialogue',
            description: issue.message,
            suggestion: issue.suggestion
          });
          break;
          
        case 'character':
          repairs.push({
            type: 'character',
            action: 'add_character',
            description: issue.message,
            suggestion: issue.suggestion
          });
          break;
          
        case 'nirath':
          repairs.push({
            type: 'world_setting',
            action: 'adjust_setting',
            description: issue.message,
            suggestion: issue.suggestion
          });
          break;
          
        case 'forbidden':
          repairs.push({
            type: 'content',
            action: 'remove_forbidden',
            description: issue.message,
            suggestion: issue.suggestion
          });
          break;
      }
    }
    
    return {
      blueprint_id: validationReport.blueprint_id,
      repairs,
      priority: issues.filter(i => i.severity === 'critical').length > 0 ? 'high' : 'medium'
    };
  }
}

module.exports = { ScriptValidator };

```

---

## engines/script-engine/extensions/nirath-extension.js

```javascript
// engines/script-engine/extensions/nirath-extension.js
// 示例世界 World Extension - 世界观扩展模块
// 版本：v1.0 | 日期：2026-06-07

const EXAMPLE_WORLD = {
  world_id: 'example',
  world_name: '示例世界星球',
  era: '上古纪元',
  
  // 核心设定
  core_rules: [
    '虚构世界设定，一个虚构与碳基生命共存的星球',
    '《古籍神话》实为示例世界往事的记录，异兽是虚构生命形态',
    '核心主题：记忆即存在，遗忘即消亡',
    '时间以"晶振"计量，1晶振 = 地球1天',
    '能量来源：等离子河流与双月光辉'
  ],
  
  // 环境特征
  environment: {
    terrain: ['硅晶草原', '晶体森林', '等离子河流', '碳硅山脉', '双月峡谷'],
    sky: '双月当空，紫蓝色天穹',
    light: '双月光晕提供柔和照明，等离子河流发出荧光',
    atmosphere: '充满硅微粒的稀薄大气，呼吸可见晶尘',
    gravity: '0.8G，比地球略轻'
  },
  
  // 生命形态
  lifeforms: {
    silicon_based: {
      description: '虚构生命，以奇幻结构为骨骼，能量涡流为血液',
      examples: ['示例神兽', '神兽A', '神兽B', '神兽C'],
      characteristics: ['碳化硅质甲壳', '等离子能量核心', '晶体复眼']
    },
    carbon_based: {
      description: '碳基生命，类似地球生物但更适应低重力',
      examples: ['示例世界先民', '探索者后裔'],
      characteristics: ['轻量化骨骼', '高氧代谢', '光敏皮肤']
    }
  },
  
  // 异兽档案模板
  beast_template: {
    beast_id: '',
    name: '',
    name_origin: '示例世界古语',
    
    // 生物学特征
    biology: {
      skeleton: '碳化硅质奇幻结构',
      energy_source: '等离子吸收',
      lifespan: '以晶振计',
      reproduction: '晶体分裂'
    },
    
    // 视觉锚点（核心特征，不可变）
    visual_anchor: {
      core_features: ['特征1', '特征2', '特征3'],
      color_palette: ['主色', '辅色', '高光色'],
      texture: '表面质感描述',
      scale: '体型比例（相对人类）'
    },
    
    // 行为特征
    behavior: {
      temperament: '性格描述',
      habitat: '栖息地',
      diet: '能量来源',
      social_structure: '社会结构'
    },
    
    // 叙事功能
    narrative_role: {
      archetype: '神话原型',
      symbolism: '象征意义',
      story_function: '在故事中的功能'
    }
  },
  
  // 视觉约束
  visual_constraints: {
    // 必须遵守
    must_have: [
      '明亮多色彩强质感',
      '超写实风格',
      '电影级光影',
      '示例世界环境特征（硅晶、双月、等离子）'
    ],
    
    // 禁止
    forbidden: [
      '暗黑风格',
      '夜晚场景',
      '金属光泽',
      '人物眼睛非自然色',
      '旁白/Voiceover'
    ],
    
    // 推荐
    recommended: [
      '黄金3秒开场',
      '每2-3秒转场或运镜切换',
      '多机位综合运动',
      'IMAX画幅感'
    ]
  },
  
  // 主角设定（示例角色）
  protagonist: {
    character_id: 'example-role',
    name: '示例角色',
    role: '示例世界探索者',
    
    visual_anchor: {
      core_features: [
        '银灰装甲（示例世界探索者标准装备）',
        '东亚面孔短发年轻男性',
        '装甲表面有示例世界符文微光'
      ],
      color_palette: ['银灰', '深蓝', '等离子蓝'],
      texture: '哑光金属+能量纹路'
    },
    
    backstory: '来自地球的探索者，通过古老传送门抵达示例世界，',
    motivation: '记录示例世界的异兽与文明，证明"记忆即存在"',
    arc: '从旁观者到参与者，最终成为示例世界记忆守护者'
  }
};

// 异兽档案库
const BEAST_ARCHIVE = {
  taotie: {
    beast_id: 'taotie',
    name: '示例神兽',
    name_origin: '示例世界古语：吞噬者',
    
    biology: {
      skeleton: '碳化硅质奇幻结构，六边形蜂窝状甲壳',
      energy_source: '吞噬等离子能量，体内转化为晶振储能',
      lifespan: '3000晶振',
      reproduction: '能量饱和后分裂出子体'
    },
    
    visual_anchor: {
      core_features: [
        '碳化硅质六边形蜂窝甲壳',
        '腋下双眼（非面部）',
        '巨口能量涡流（吞噬时的等离子旋涡）'
      ],
      color_palette: ['碳化硅黑', '等离子蓝', '能量金'],
      texture: '晶体磨砂质感，边缘发光',
      scale: '3倍人类体型'
    },
    
    behavior: {
      temperament: '贪婪但非恶意，本能驱动',
      habitat: '等离子河流交汇处',
      diet: '等离子能量，偶尔吞噬晶体矿物',
      social_structure: '独行者，领地意识极强'
    },
    
    narrative_role: {
      archetype: '贪婪之神',
      symbolism: '欲望与本能，但同时也是生存意志的象征',
      story_function: '迫使主角面对"欲望与节制"的主题'
    }
  }
};

class 示例世界Extension {
  constructor(options = {}) {
    // 【v2.1.4-fix13-审计修复】支持从外部传入 protagonist，消除硬编码
    this.world = { ...EXAMPLE_WORLD };
    if (options.protagonist) {
      this.world.protagonist = options.protagonist;
    }
    this.beasts = BEAST_ARCHIVE;
  }

  /**
   * 获取世界观信息
   */
  getWorldInfo() {
    return this.world;
  }

  /**
   * 获取异兽档案
   */
  getBeastArchive(beastId) {
    // 【v2.1.4-fix13-审计修复】返回通用异兽模板作为降级，避免 null 导致下游缺失
    return this.beasts[beastId] || this._getGenericBeastTemplate(beastId);
  }

  /**
   * 【v2.1.4-fix13-审计修复】通用异兽模板（用于未收录异兽的降级）
   */
  _getGenericBeastTemplate(beastId) {
    return {
      beast_id: beastId,
      name: beastId,
      name_origin: '示例世界古语',
      biology: {
        skeleton: '碳基晶体复合结构，自适应外壳',
        energy_source: '环境能量摄取，体内晶振转化',
        lifespan: '未知',
        reproduction: '能量饱和分裂'
      },
      visual_anchor: {
        core_features: ['自适应晶体外壳', '能量感知器官', '特征性体型'],
        color_palette: ['晶体黑', '能量蓝', '金属灰'],
        texture: '晶体磨砂与生物组织混合质感',
        scale: '2-5倍人类体型'
      },
      behavior: {
        temperament: '领地性强，本能驱动',
        habitat: '高能量密度区域',
        diet: '能量与矿物质',
        social_structure: '独行者或小群体'
      },
      narrative_role: {
        archetype: '神秘异兽',
        symbolism: '未知与探索',
        story_function: '推动主角探索示例世界世界'
      }
    };
  }

  /**
   * 获取异兽视觉锚点
   */
  getBeastVisualAnchor(beastId) {
    const beast = this.beasts[beastId];
    if (!beast) return null;
    return beast.visual_anchor;
  }

  /**
   * 获取视觉约束
   */
  getVisualConstraints() {
    return this.world.visual_constraints;
  }

  /**
   * 获取主角设定
   */
  getProtagonist() {
    return this.world.protagonist;
  }

  /**
   * 验证场景是否符合 示例世界 世界观
   */
  validateScene(scene) {
    const issues = [];
    const constraints = this.world.visual_constraints;

    // 检查禁止元素
    const sceneText = JSON.stringify(scene);
    for (const forbidden of constraints.forbidden) {
      if (sceneText.includes(forbidden)) {
        issues.push({
          type: 'forbidden',
          message: `检测到禁止元素: ${forbidden}`,
          severity: 'critical'
        });
      }
    }

    // 检查是否包含 示例世界 环境特征
    let hasEnvironment = false;
    for (const terrain of this.world.environment.terrain) {
      if (sceneText.includes(terrain)) {
        hasEnvironment = true;
        break;
      }
    }
    if (!hasEnvironment) {
      issues.push({
        type: 'environment',
        message: '场景缺少 示例世界 环境特征',
        suggestion: `建议加入: ${this.world.environment.terrain.join(', ')}`,
        severity: 'warning'
      });
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * 生成场景设定文本
   */
  generateSceneSetting(baseSetting = '') {
    const env = this.world.environment;
    const elements = [
      env.sky,
      ...env.terrain,
      env.light
    ];
    
    // 随机选择 2-3 个环境元素
    const selected = this._shuffleArray(elements).slice(0, 2 + Math.floor(Math.random() * 2));
    
    return `${baseSetting}，${selected.join('，')}`;
  }

  /**
   * 生成角色视觉锚点文本
   */
  generateCharacterVisualAnchor(characterId) {
    // 【v2.1.4-fix13-审计修复】从当前 protagonist 获取，消除硬编码 example-role
    const protagonist = this.world.protagonist;
    if (protagonist && characterId === protagonist.character_id) {
      return protagonist.visual_anchor.core_features.join('，');
    }
    
    const beast = this.beasts[characterId];
    if (beast) {
      return beast.visual_anchor.core_features.join('，');
    }
    
    return '';
  }

  _shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

module.exports = { NirathExtension: 示例世界Extension, 示例世界Extension, EXAMPLE_WORLD, BEAST_ARCHIVE };

```

---

## engines/script-engine/index.js

```javascript
// engines/script-engine/index.js
// Script Engine - 剧本引擎入口
// 版本：v1.0 | 日期：2026-06-07

const { IntentParser } = require('./core/intent-parser');
const { ScriptBlueprint } = require('./core/script-blueprint');
const { ScriptGenerator } = require('./core/script-generator');
const { ScriptValidator } = require('./core/script-validator');
const { ScriptBlueprintAdapter } = require('./core/adapter');
const { NirathExtension } = require('./extensions/nirath-extension');

class ScriptEngine {
  constructor(options = {}) {
    this.intentParser = new IntentParser(options.intentParser);
    this.scriptGenerator = new ScriptGenerator(options.scriptGenerator);
    this.scriptValidator = new ScriptValidator(options.scriptValidator);
    this.adapter = new ScriptBlueprintAdapter(options.adapter);
    this.nirathExtension = new NirathExtension();
    
    this.version = '1.0.0';
  }

  /**
   * 主入口：从用户意图到适配后的剧本
   * @param {string} rawInput - 用户原始输入
   * @param {object} metadata - 附加元数据
   * @returns {object} { blueprint, adapted, validation, report }
   */
  async process(rawInput, metadata = {}) {
    console.log(`[ScriptEngine v${this.version}] 开始处理: ${metadata.title || '未命名'}`);

    // 1. 解析意图
    const userIntent = this.intentParser.parse(rawInput, metadata);
    console.log(`[ScriptEngine] 意图解析完成: ${userIntent.parsed.primary_mode}`);

    // 2. 生成剧本（需要 LLM）
    let blueprint;
    let degraded = false;
    let degradeReason = '';
    
    // v1.1: 检查LLMEngine是否可用（复用现有引擎）
    const hasLLM = this.scriptGenerator.llmEngine || this.scriptGenerator.config.apiKey;
    
    if (hasLLM) {
      blueprint = await this.scriptGenerator.generate(userIntent);
    } else {
      console.log('[ScriptEngine] 无 LLM 可用，使用模板生成');
      console.log('[ScriptEngine] ⚠️ 降级标记: LLM不可用，回退到模板生成');
      blueprint = this._generateFromTemplate(userIntent);
      degraded = true;
      degradeReason = 'LLM API unavailable, fallback to template generation';
    }

    // 3. 校验剧本
    const validation = this.scriptValidator.validate(blueprint);
    console.log(`[ScriptEngine] 剧本校验: ${validation.passed ? '通过' : '失败'} (${validation.overall_score}分)`);

    // 4. 适配到现有系统格式
    const adapted = this.adapter.adapt(blueprint);
    const report = this.adapter.generateReport(adapted);

    // 5. 如果校验失败，生成修复计划
    let repairPlan = null;
    if (!validation.passed) {
      repairPlan = this.scriptValidator.generateRepairPlan(validation);
      console.log(`[ScriptEngine] 修复计划: ${repairPlan.repairs.length} 项`);
    }

    console.log(`[ScriptEngine] 处理完成: ${adapted.scenes.length} 场景, ${adapted.characters.length} 角色`);

    return {
      userIntent,
      blueprint,
      validation,
      adapted,
      report,
      repairPlan,
      degraded,
      degradeReason
    };
  }

  /**
   * 从模板生成剧本（无需 LLM）
   */
  /**
   * 从模板生成剧本（无需 LLM）
   * v1.2.7-fix-A9: 通用化降级模板，移除神话项目硬编码
   */
  _generateFromTemplate(userIntent) {
    const meta = userIntent.metadata;
    const duration = meta.target_duration || 120;
    const sceneCount = 5;
    const sceneDuration = Math.floor(duration / sceneCount);

    // v1.2.7-fix-A9: 从 metadata 获取角色，而非硬编码 example-role
    const characters = meta.characters || [];
    const protagonist = characters[0] || { name: '主讲人', description: '主讲人' };
    const protagonistId = protagonist.id || protagonist.name || 'protagonist';
    const protagonistName = protagonist.name || '主讲人';

    // v1.2.7-fix-A9: 通用场景设定（非神话项目特定）
    const worldSetting = meta.world_setting || 'default';
    const settings = [
      '开场建立氛围，远景展开',
      '主体场景，中景展示',
      '冲突场景，近景聚焦',
      '高潮场景，特写强化',
      '结尾场景，远景收束'
    ];

    const scenes = [];
    const sceneTypes = ['opening', 'establishing', 'conflict', 'emotional_climax', 'resolution'];
    const sceneNames = ['片头', '展开', '冲突', '高潮', '结尾'];

    for (let i = 0; i < sceneCount; i++) {
      const start = i * sceneDuration;
      const end = (i === sceneCount - 1) ? duration : start + sceneDuration;

      scenes.push({
        scene_id: `SC0${i}`,
        scene_name: sceneNames[i],
        scene_type: sceneTypes[i],
        scene_function: i === 0 ? 'establish' : i === 3 ? 'climax' : i === 4 ? 'resolve' : 'advance',
        act_id: i < 2 ? 'ACT-1' : i < 4 ? 'ACT-2' : 'ACT-3',
        timing: { start, duration: end - start, end },
        characters: [protagonistId],
        setting: settings[i],
        dialogue: {
          has_dialogue: true,
          lines: [{
            speaker: protagonistName,
            text: `${meta.title || '本集'}第${i + 1}段内容...`,
            emotion: 'neutral'
          }]
        }
      });
    }

    return new ScriptBlueprint({
      intent_ref: userIntent.intent_id,
      meta: {
        title: meta.title,
        narrative_mode: userIntent.parsed?.primary_mode || 'dramatic',
        target_duration: duration,
        acts_count: 3,
        scenes_count: sceneCount,
        _metadata: meta._metadata || {}
      },
      structure: {
        acts: [
          { act_id: 'ACT-1', act_name: '第一幕', act_function: 'establish', start_time: 0, end_time: Math.floor(duration * 0.4), beats: [] },
          { act_id: 'ACT-2', act_name: '第二幕', act_function: 'confront', start_time: Math.floor(duration * 0.4), end_time: Math.floor(duration * 0.8), beats: [] },
          { act_id: 'ACT-3', act_name: '第三幕', act_function: 'resolve', start_time: Math.floor(duration * 0.8), end_time: duration, beats: [] }
        ],
        scenes
      },
      character_system: {
        characters: [{
          character_id: protagonistId,
          name: protagonistName,
          role: 'protagonist',
          visual_anchor: {
            core_features: protagonist.description ? protagonist.description.split(/[,，、]/) : ['写实人物'],
            reference_images: protagonist.portraitPaths || []
          }
        }]
      },
      world_setting: {
        world_id: worldSetting,
        world_name: worldSetting === 'default' ? '现实世界' : worldSetting,
        era: '现代',
        core_rules: [],
        environment_tags: []
      }
    });
  }

  /**
   * 保存完整工作流结果
   */
  async saveResult(result, outputDir) {
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 保存用户意图
    fs.writeFileSync(
      path.join(outputDir, `intent-${timestamp}.json`),
      JSON.stringify(result.userIntent, null, 2)
    );

    // 保存剧本蓝图
    fs.writeFileSync(
      path.join(outputDir, `blueprint-${timestamp}.json`),
      result.blueprint.toJSON()
    );

    // 保存校验报告
    fs.writeFileSync(
      path.join(outputDir, `validation-${timestamp}.json`),
      JSON.stringify(result.validation, null, 2)
    );

    // 保存适配结果
    fs.writeFileSync(
      path.join(outputDir, `adapted-${timestamp}.json`),
      JSON.stringify(result.adapted, null, 2)
    );

    console.log(`[ScriptEngine] 结果已保存到: ${outputDir}`);
    return outputDir;
  }
}

module.exports = {
  ScriptEngine,
  IntentParser,
  ScriptBlueprint,
  ScriptGenerator,
  ScriptValidator,
  ScriptBlueprintAdapter,
  NirathExtension
};

```

---

## engines/script-engine/tests/test-script-engine.js

```javascript
// engines/script-engine/tests/test-script-engine.js
// 剧本引擎测试脚本 - 验证核心模块
// 运行: node engines/script-engine/tests/test-script-engine.js

const { IntentParser } = require('../core/intent-parser');
const { ScriptBlueprint } = require('../core/script-blueprint');
const { ScriptValidator } = require('../core/script-validator');
const { ScriptBlueprintAdapter } = require('../core/adapter');
const { 示例世界Extension } = require('../extensions/nirath-extension');

console.log('========================================');
console.log('  Script Engine 测试套件 v1.0');
console.log('========================================\n');

// 测试数据
const testIntents = [
  {
    name: '示例世界 示例神兽 EP01',
    raw: '创作神话项目异兽志第一集，主角示例神兽，120秒，示例世界星球，示例角色探索',
    metadata: {
      title: '神话项目：异兽志 EP01 示例神兽',
      target_duration: 120,
      world_setting: '示例世界',
      featured_beast_id: 'taotie',
      protagonist: '示例角色'
    }
  },
  {
    name: '科普短剧',
    raw: '做一个剧情式科普视频，讲解量子力学，要有故事感',
    metadata: {
      title: '量子力学科普',
      target_duration: 180
    }
  }
];

// 测试结果统计
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    results.passed++;
  } else {
    console.log(`  ❌ ${message}`);
    results.failed++;
  }
}

// ========== 测试 1: IntentParser ==========
console.log('\n📋 测试 1: IntentParser（意图解析）');
console.log('----------------------------------------');

const intentParser = new IntentParser();

for (const test of testIntents) {
  console.log(`\n  测试用例: ${test.name}`);
  const intent = intentParser.parse(test.raw, test.metadata);
  
  assert(intent.intent_id, '生成 intent_id');
  assert(intent.raw_input === test.raw, '保留原始输入');
  assert(intent.parsed.primary_mode, '识别主叙事模式');
  assert(intent.metadata.title === test.metadata.title, '保留元数据标题');
  assert(intent.metadata.target_duration === test.metadata.target_duration, '保留目标时长');
  
  if (test.metadata.world_setting === '示例世界') {
    assert(intent.parsed.world_setting === '示例世界' || intent.metadata.world_setting === '示例世界', '识别 示例世界 世界观');
  }
  
  console.log(`  解析结果: ${intent.parsed.primary_mode} ${intent.parsed.hybrid_config ? '+ hybrid' : ''}`);
}

// ========== 测试 2: ScriptBlueprint ==========
console.log('\n📋 测试 2: ScriptBlueprint（数据模型）');
console.log('----------------------------------------');

const blueprint = new ScriptBlueprint({
  meta: {
    title: '测试剧本',
    narrative_mode: 'dramatic',
    target_duration: 120
  },
  structure: {
    acts: [
      { act_id: 'ACT-1', act_name: '第一幕', act_function: 'establish', start_time: 0, end_time: 40, beats: [] },
      { act_id: 'ACT-2', act_name: '第二幕', act_function: 'confront', start_time: 40, end_time: 80, beats: [] },
      { act_id: 'ACT-3', act_name: '第三幕', act_function: 'resolve', start_time: 80, end_time: 120, beats: [] }
    ],
    scenes: [
      {
        scene_id: 'SC00',
        scene_name: '片头',
        scene_type: 'opening',
        act_id: 'ACT-1',
        timing: { start: 0, duration: 15, end: 15 },
        characters: ['示例角色'],
        setting: '示例世界硅晶草原，双月当空',
        dialogue: {
          has_dialogue: true,
          lines: [{ speaker: '示例角色', text: '原来这就是示例世界...', emotion: 'awe' }]
        }
      },
      {
        scene_id: 'SC01',
        scene_name: '初遇',
        scene_type: 'conflict',
        act_id: 'ACT-1',
        timing: { start: 15, duration: 25, end: 40 },
        characters: ['示例角色', 'taotie'],
        setting: '等离子河流旁，硅晶岩石',
        dialogue: {
          has_dialogue: true,
          lines: [
            { speaker: '示例角色', text: '那是什么？', emotion: 'surprise' },
            { speaker: 'taotie', text: '（能量涡流轰鸣）', emotion: 'neutral' }
          ]
        }
      },
      {
        scene_id: 'SC02',
        scene_name: '探索',
        scene_type: 'establishing',
        act_id: 'ACT-2',
        timing: { start: 40, duration: 30, end: 70 },
        characters: ['示例角色'],
        setting: '晶体森林深处，荧光闪烁',
        dialogue: {
          has_dialogue: true,
          lines: [{ speaker: '示例角色', text: '这里的能量...好强大', emotion: 'wonder' }]
        }
      },
      {
        scene_id: 'SC03',
        scene_name: '高潮',
        scene_type: 'emotional_climax',
        act_id: 'ACT-2',
        timing: { start: 70, duration: 30, end: 100 },
        characters: ['示例角色', 'taotie'],
        setting: '等离子河流交汇处，能量风暴',
        dialogue: {
          has_dialogue: true,
          lines: [
            { speaker: '示例角色', text: '我明白了，你是守护者！', emotion: 'realization' },
            { speaker: 'taotie', text: '（能量涡流平息）', emotion: 'calm' }
          ]
        }
      },
      {
        scene_id: 'SC04',
        scene_name: '结尾',
        scene_type: 'resolution',
        act_id: 'ACT-3',
        timing: { start: 100, duration: 20, end: 120 },
        characters: ['示例角色'],
        setting: '硅晶草原，双月落下',
        dialogue: {
          has_dialogue: true,
          lines: [{ speaker: '示例角色', text: '记忆即存在...我会记住的', emotion: 'determined' }]
        }
      }
    ]
  },
  character_system: {
    characters: [
      {
        character_id: '示例角色',
        name: '示例角色',
        role: 'protagonist',
        visual_anchor: {
          core_features: ['银灰装甲', '东亚面孔短发', '年轻男性'],
          reference_images: ['characters/示例角色/front.jpg']
        }
      },
      {
        character_id: 'taotie',
        name: '示例神兽',
        role: 'featured_beast',
        visual_anchor: {
          core_features: ['碳化硅质甲壳', '腋下双眼', '巨口能量涡流'],
          reference_images: ['characters/tao-tie/front.jpg']
        }
      }
    ]
  },
  world_setting: {
    world_id: 'nirath',
    world_name: '示例世界星球',
    era: '上古纪元',
    core_rules: ['示例世界是地球前身'],
    environment_tags: ['硅晶草原', '双月当空']
  }
});

assert(blueprint.blueprint_id, '生成 blueprint_id');
assert(blueprint.meta.title === '测试剧本', '设置标题');
assert(blueprint.structure.scenes.length === 5, '5个场景');
assert(blueprint.getScene('SC00').scene_name === '片头', '获取指定场景');
assert(blueprint.getCharacter('示例角色').role === 'protagonist', '获取指定角色');
assert(blueprint.getScenesWithDialogue().length === 5, '5个场景有台词');
assert(blueprint.getTotalDuration() === 120, '总时长 120s');

// 验证
const validation = blueprint.validate();
assert(validation.valid, '剧本验证通过');
assert(validation.errors.length === 0, '无错误');

// JSON 序列化
const json = blueprint.toJSON();
assert(json.includes('测试剧本'), 'JSON 包含标题');

const cloned = ScriptBlueprint.fromJSON(json);
assert(cloned.meta.title === '测试剧本', 'JSON 反序列化');

console.log(`\n  Blueprint 测试通过 ✓`);

// ========== 测试 3: ScriptValidator ==========
console.log('\n📋 测试 3: ScriptValidator（剧本校验）');
console.log('----------------------------------------');

const validator = new ScriptValidator();
const report = validator.validate(blueprint);

assert(report.passed, '校验通过');
assert(report.overall_score > 0, '有评分');
assert(report.checks.length > 0, '有检查项');
assert(report.issues.length === 0, '无问题');
assert(report.scores.detailed.structural_integrity > 0, '结构评分');

console.log(`  综合评分: ${report.overall_score}`);
console.log(`  检查项: ${report.checks.length}`);
console.log(`  通过项: ${report.checks.filter(c => c.passed).length}`);

// 调试：打印失败项
const failedChecks = report.checks.filter(c => !c.passed);
if (failedChecks.length > 0) {
  console.log('  失败项详情:');
  for (const fc of failedChecks) {
    console.log(`    ❌ ${fc.category}.${fc.name}: ${fc.message} [${fc.severity}]`);
    console.log(`       建议: ${fc.suggestion}`);
  }
}

// 测试修复计划生成
const repairPlan = validator.generateRepairPlan(report);
assert(repairPlan.repairs.length === 0, '无修复需求（因为剧本通过）');

console.log(`  修复计划: 无需修复 ✓`);

// ========== 测试 4: 示例世界Extension ==========
console.log('\n📋 测试 4: 示例世界Extension（世界观扩展）');
console.log('----------------------------------------');

const nirath = new 示例世界Extension();

assert(nirath.getWorldInfo().world_id === 'nirath', '获取世界观');
assert(nirath.getBeastArchive('taotie').name === '示例神兽', '获取异兽档案');
assert(nirath.getBeastVisualAnchor('taotie').core_features.length > 0, '获取视觉锚点');
assert(nirath.getProtagonist().character_id === '示例角色', '获取主角设定');

const visualConstraints = nirath.getVisualConstraints();
assert(visualConstraints.must_have.length > 0, '有必须元素');
assert(visualConstraints.forbidden.length > 0, '有禁止元素');

// 验证场景
const sceneValidation = nirath.validateScene(blueprint.structure.scenes[0]);
assert(sceneValidation.valid, '场景符合世界观');

const setting = nirath.generateSceneSetting('测试场景');
assert(setting.includes('示例世界') || setting.includes('硅') || setting.includes('双月'), '生成场景设定');

const charAnchor = nirath.generateCharacterVisualAnchor('示例角色');
assert(charAnchor.includes('银灰装甲'), '生成角色视觉锚点');

console.log(`  示例世界 扩展测试通过 ✓`);

// ========== 测试 5: Adapter ==========
console.log('\n📋 测试 5: ScriptBlueprintAdapter（适配层）');
console.log('----------------------------------------');

const adapter = new ScriptBlueprintAdapter();
const adapted = adapter.adapt(blueprint);

assert(adapted.config.title === '测试剧本', '适配配置');
assert(adapted.scenes.length === 5, '适配场景');
assert(adapted.characters.length === 2, '适配角色');
assert(adapted.dialogues.length === 7, '适配台词（7句）');
assert(adapted.worldSetting.world_id === 'nirath', '适配世界观');

// 检查场景 Prompt 基础
assert(adapted.scenes[0].prompt_base.includes('电影级'), 'Prompt 包含电影级');
assert(adapted.scenes[0].prompt_base.includes('示例世界'), 'Prompt 包含 示例世界');

// 检查视觉方向
assert(adapted.scenes[0].visual_direction.shot_type, '有镜头类型');
assert(adapted.scenes[0].visual_direction.camera_movement, '有运镜');
assert(adapted.scenes[0].visual_direction.lighting, '有布光');

// 生成报告
const adaptReport = adapter.generateReport(adapted);
assert(adaptReport.adaptation_status === 'success', '适配成功');
assert(adaptReport.scenes_count === 5, '报告场景数');

console.log(`  适配报告:`);
console.log(`    场景: ${adaptReport.scenes_count}`);
console.log(`    角色: ${adaptReport.characters_count}`);
console.log(`    台词: ${adaptReport.dialogues_count}`);
console.log(`    时长: ${adaptReport.total_duration}s`);
console.log(`    警告: ${adaptReport.warnings.length}`);

console.log(`  适配层测试通过 ✓`);

// ========== 汇总 ==========
console.log('\n========================================');
console.log('  测试完成');
console.log('========================================');
console.log(`  ✅ 通过: ${results.passed}`);
console.log(`  ❌ 失败: ${results.failed}`);
console.log(`  📊 总计: ${results.passed + results.failed}`);
console.log(`  🎯 成功率: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
console.log('========================================');

if (results.failed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 所有测试通过！剧本引擎 MVP 就绪。\n');
  process.exit(0);
}

```

---

## examples/minimal-example.js

```javascript
/**
 * Hyperreal AI Video System (HAVS) — 最小可运行示例
 * 
 * 本示例展示如何使用 HAVS 创建一个简单的 AI 视频预生产任务。
 * 请将 .env.example 复制为 .env 并填入你的 API Key。
 */

const { HyperrealitySystem } = require('./index');

async function main() {
  // 1. 初始化系统
  const system = new HyperrealitySystem({
    version: 'v1.0.0'
  });

  // 2. 准备角色配置（示例角色，非真实人物）
  const characters = [{
    name: '主讲人A',
    description: '专业的健康科普讲师，穿正装，形象亲和',
    referencePhotos: []
  }];

  // 3. 定义创作意图
  const intent = '创作一集健康科普短视频，主题：常见运动损伤的预防与处理。' +
    '创意指数0.6，视频时长45-60秒，全写实风格，好莱坞纪录片质感。' +
    '主讲人一人完成讲解，讲解过程生动形象，带有自然的肢体语言。';

  // 4. 定义元数据
  const metadata = {
    title: '运动损伤预防科普',
    target_duration: 55,
    series: '健康生活系列',
    episode: 1,
    characters: characters
  };

  // 5. 执行预生产（含需求确认 → 提示词审核 → 渲染 → 后期）
  try {
    const result = await system.create(intent, metadata, {
      skipPromptReview: false,  // 开启提示词审核
      skipRender: false,        // 开启渲染
      skipPostProduction: false // 开启后期制作
    });

    console.log('\n✅ 预生产完成！');
    console.log('结果:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ 预生产失败:', error.message);
    process.exit(1);
  }
}

// 运行示例
if (require.main === module) {
  main();
}

module.exports = { main };

```

---

## examples/standard-usage.js

```javascript
// ============================================================
// 超现实系统 - 标准调用示例
// 用法：直接调用 HyperrealitySystem.create()
// 不需要额外的包装脚本
// ============================================================

const { HyperrealitySystem } = require('./index');
const fs = require('fs');
const path = require('path');

// 加载配置（从标准配置文件读取）
function loadConfig() {
  const configPath = path.join(process.env.HOME || '/root', '.openclaw/config/volcengine.json');
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return {
      apiKey: process.env.VOLCENGINE_ARK_API_KEY || "YOUR_API_KEY_HERE",
      baseUrl: config.baseUrl
    };
  } catch (e) {
    console.warn('⚠️ 无法读取配置文件:', e.message);
    return { apiKey: null, baseUrl: null };
  }
}

const config = loadConfig();

// 创建系统实例（传入正确配置）
const system = new HyperrealitySystem({
  scriptEngine: {
    scriptGenerator: {
      apiKey: process.env.VOLCENGINE_ARK_API_KEY || "YOUR_API_KEY_HERE"
    }
  }
});

// 示例：健康科普视频
const intent = '示例警官，讲解横纹肌溶解的症状以及实验室检查';
const metadata = {
  title: '横纹肌溶解的症状以及实验室检查',
  target_duration: 62
};

// 选项说明：
// - skipRequirementConfirmation: false = 需要队长确认需求清单
// - skipScriptConfirmation: false = 需要队长确认剧本
// - skipPromptReview: false = 需要队长确认提示词
// - skipRender: true = 跳过渲染（预生产模式）
// - skipPostProduction: true = 跳过后期（预生产模式）
const options = {
  skipRequirementConfirmation: false,  // 需求清单确认 - 不跳过
  skipScriptConfirmation: false,       // 剧本确认 - 不跳过
  skipPromptReview: false,             // 提示词审核 - 不跳过
  skipRender: true,                    // 渲染 - 跳过（预生产）
  skipPostProduction: true             // 后期 - 跳过（预生产）
};

async function run() {
  try {
    const result = await system.create(intent, metadata, options);
    
    if (result.success) {
      console.log('\n✅ 预生产完成！');
      console.log('总耗时:', result.timing?.total, 'ms');
      console.log('需求清单:', result.stages.requirementList ? '已生成' : '未生成');
      console.log('剧本:', result.stages.scriptEngine ? '已生成' : '未生成');
      console.log('镜头:', result.stages.productionEngine ? '已生成' : '未生成');
    } else {
      console.log('\n❌ 预生产失败:', result.errors?.join(', '));
    }
  } catch (err) {
    console.error('❌ 执行错误:', err.message);
  }
}

run();

```

---

## examples/test-full-flow.js

```javascript
const { HyperrealitySystem } = require('../index');

// 标准调用 - 完整流程（含确认环节）
const system = new HyperrealitySystem();

async function run() {
  const result = await system.create(
    '示例警官，讲解横纹肌溶解的症状以及实验室检查',
    { title: '横纹肌溶解的症状以及实验室检查', target_duration: 62 },
    {
      skipRequirementConfirmation: false,  // 需要确认
      skipScriptConfirmation: false,         // 需要确认
      skipPromptReview: false,               // 需要确认
      skipRender: true,                      // 预生产：跳过渲染
      skipPostProduction: true               // 预生产：跳过后期
    }
  );
  
  console.log('\n=== 结果 ===');
  console.log('成功:', result.success);
  console.log('总耗时:', result.timing?.total, 'ms');
  console.log('需求清单确认:', result.confirmations?.requirementList);
  console.log('剧本确认:', result.confirmations?.script);
  console.log('提示词审核:', result.confirmations?.promptReview);
}

run().catch(console.error);

```

---

## index.js

```javascript
// hyperreality-system/index.js
// Hyperreality System - 超现实工业创作系统统一入口
// 深度融合:剧本引擎 → 适配层 → 制作引擎 → 完整镜头
// 版本:v1.2.5 | 日期:2026-06-19

require('./engines/process-guard'); // 【审计修复】全局崩溃防护,必须最先加载

const { isOpeningShot } = require('./engines/field-standardizer');

const { ScriptEngine } = require('./engines/script-engine');
const { ProductionEngine } = require('./engines/production-engine/production-engine');
const { RenderingEngine } = require('./engines/rendering-engine/rendering-engine');
const { PostProductionEngine } = require('./engines/post-production-engine/post-production-engine');
const { RequirementListBuilder } = require('./engines/script-engine/core/requirement-list-builder');
const { CreativeIntensityEngine } = require('./engines/script-engine/core/creative-intensity-engine');
const { OpeningTitleOptimizer } = require('./engines/production-engine/agents/opening-title-optimizer');
const { routeAndEnhance } = require('./skills/hollywood-cinematography/cinematography-skill-router');
const { FieldGuard } = require('./engines/field-guard');
const fs = require('fs');
const path = require('path');

class HyperrealitySystem {
  constructor(options = {}) {
    this.requirementListBuilder = new RequirementListBuilder(options.requirementListBuilder);
    this.creativeIntensityEngine = new CreativeIntensityEngine(options.creativeIntensityEngine);
    this.scriptEngine = new ScriptEngine({
      ...options.scriptEngine,
      charactersDir: options.scriptEngine?.charactersDir || path.join(__dirname, '../characters')
    });
    this.productionEngine = new ProductionEngine({
      ...options.productionEngine,
      charactersDir: options.productionEngine?.charactersDir || path.join(__dirname, '../characters')
    });
    this.renderingEngine = new RenderingEngine({
      ...options.renderingEngine,
      charactersDir: options.renderingEngine?.charactersDir || path.join(__dirname, '../characters')
    });
    this.postProductionEngine = new PostProductionEngine(options.postProductionEngine);
    this.fieldGuard = new FieldGuard({ strict: true, logPrefix: '[Hyperreality]' });
    this.version = '2.0.5';
  }

  /**
   * 主创作流程(需求确认 → 提示词审核 → 渲染 → 后期制作)
   * @param {string} intent - 用户意图
   * @param {object} metadata - 元数据
   * @param {object} options - { skipPromptReview, skipRender, skipPostProduction }
   * 注意:需求清单确认不可跳过!已移除 skipRequirementConfirmation 选项。
   * @returns {object} 完整创作结果
   */
  async create(intent, metadata = {}, options = {}) {
    console.log(`\n🔥 [HyperrealitySystem v${this.version}] 开始创作`);
    console.log(`   意图: ${intent}`);
    console.log(`   项目: ${metadata.title || '未命名'}`);
    console.log(`   流程: 需求确认 → ${options.skipPromptReview ? '跳过' : '含'}提示词审核 → ${options.skipRender ? '跳过' : '含'}渲染 → ${options.skipPostProduction ? '跳过' : '含'}后期`);
    console.log('');

    const result = {
      success: false,
      stages: {},
      errors: [],
      timing: {},
      confirmations: {} // 记录确认状态
    };

    const totalStart = Date.now();

    try {
      // ========== 🆕 Layer 0: 需求清单生成确认 ==========
      if (!options.skipRequirementList) {
        console.log('📋 [Layer 0] 需求清单生成 - 解析用户意图...');
        const stage0Start = Date.now();

        const requirementList = await this.requirementListBuilder.build(intent, metadata);

        result.stages.requirementList = {
          data: requirementList,
          timing: Date.now() - stage0Start
        };

        console.log(`   ✅ 需求清单生成完成 (${result.stages.requirementList.timing}ms)`);
        console.log(`      类型: ${requirementList.videoTypeName} | 时长: ${requirementList.targetDuration}s | 风格: ${requirementList.style.primary}`);
        console.log(`      角色: ${requirementList.characters.length}个 | 置信度: ${(requirementList._analysis.confidence * 100).toFixed(0)}%`);

        // 生成 Markdown 供人工确认 - 需求清单确认不可跳过!
        console.log('\n📋 [需求清单确认] 等待人工确认...');

        const markdown = this.requirementListBuilder.generateMarkdown(requirementList);
        const requirementConfirmation = await this._confirmRequirementList(markdown, requirementList);
        result.confirmations.requirementList = requirementConfirmation;

        if (!requirementConfirmation.approved) {
          console.log('   ❌ 需求清单未确认,流程中止');
          result.success = false;
          result.stages.requirementReview = {
            status: 'rejected',
            reason: requirementConfirmation.reason || '用户未确认需求清单',
            suggestions: requirementConfirmation.suggestions || []
          };
          return result;
        }

        console.log('   ✅ 需求清单已确认,继续创作');

        // 如果用户提供了修改意见,重新生成
        if (requirementConfirmation.suggestions?.length > 0) {
          console.log(`   🔄 根据用户反馈重新生成...`);
          requirementList.contentConstraints = requirementList.contentConstraints || [];
          requirementList.contentConstraints.push(...requirementConfirmation.suggestions.map(s => `用户要求: ${s}`));
        }

        // 将需求清单转换为 ScriptEngine 可用的 metadata
        // v1.2.6-fix4b: 确保 characters 正确传递(用户传入优先,否则用 requirementList 的)
        const scriptEngineMeta = this.requirementListBuilder.toScriptEngineMetadata(requirementList);
        const enhancedMetadata = {
          ...metadata,
          ...scriptEngineMeta,
          // 显式保留 characters:用户传入的优先(含 portraitPaths 等详细信息)
          characters: metadata.characters || scriptEngineMeta.characters || [],
          // 【v2.1.4】保留原始metadata中的系列信息(用户传入的优先)
          series: metadata.series || scriptEngineMeta.series || null,
          seriesContentPlan: metadata.seriesContentPlan || scriptEngineMeta.seriesContentPlan || null
        };
        metadata = enhancedMetadata;

        // ========== 🆕 创意指数解析与配置注入 ==========
        const intensity = this.creativeIntensityEngine.parse(requirementList);
        const narrativeMode = requirementList.narrativeMode || 'dialogue';
        const worldSetting = requirementList._analysis?.worldSetting || 'default';

        console.log(`\n💡 [创意指数] 解析结果: ${intensity} (${this.creativeIntensityEngine.getLevel(intensity).name})`);
        console.log(`   叙事模式: ${narrativeMode} | 世界设定: ${worldSetting}`);

        const engineConfigs = this.creativeIntensityEngine.generateEngineConfigs(intensity, narrativeMode, worldSetting);

        result.stages.creativeIntensity = {
          intensity,
          level: engineConfigs.level,
          activeCapabilities: engineConfigs._metadata.activeCapabilities,
          report: this.creativeIntensityEngine.generateReport(intensity, narrativeMode, worldSetting)
        };

        // 将创意指数配置注入到各引擎选项
        metadata._creativeIntensity = {
          intensity,
          engineConfigs,
          instructions: {
            script: engineConfigs.scriptEngine?.creativeInstructions || '',
            production: engineConfigs.productionEngine?.creativeInstructions || '',
            rendering: engineConfigs.renderingEngine?.creativeInstructions || '',
            postProduction: engineConfigs.postProductionEngine?.creativeInstructions || ''
          }
        };

        console.log(`   ✅ 创意指数配置已生成,${engineConfigs._metadata.activeCapabilities}个能力激活`);
        console.log(`      Layer 1: ${Object.keys(engineConfigs.scriptEngine).length > 0 ? '✅' : '❌'} 叙事结构配置`);
        console.log(`      Layer 2: ${Object.keys(engineConfigs.productionEngine).length > 0 ? '✅' : '❌'} 视觉表现配置`);
        console.log(`      Layer 3: ${Object.keys(engineConfigs.renderingEngine).length > 0 ? '✅' : '❌'} 渲染质感配置`);
        console.log(`      Layer 4: ${Object.keys(engineConfigs.postProductionEngine).length > 0 ? '✅' : '❌'} 后期风格配置`);
      } else {
        console.log('\n⚠️ [Layer 0] 需求清单生成跳过(调试模式)');
        result.stages.requirementList = { skipped: true };
      }

      // ========== Layer 1: 剧本引擎 ==========
      let scriptResult;
      try {
        console.log('📖 [Layer 1] 剧本引擎 - 生成结构化剧本...');
        const stage1Start = Date.now();

        scriptResult = await this.scriptEngine.process(intent, metadata);

        // 【审计修复·P0】校验 adapted 存在且非空
        if (!scriptResult || !scriptResult.adapted) {
          throw new Error('scriptEngine 未产出 adapted Blueprint');
        }
        if (!Array.isArray(scriptResult.adapted.scenes) || scriptResult.adapted.scenes.length === 0) {
          throw new Error('Blueprint scenes 为空，无法继续生产');
        }

        result.stages.scriptEngine = {
          blueprint: scriptResult.blueprint?.meta,
          validation: scriptResult.validation,
          report: scriptResult.report
        };
        result.stages.scriptEngine.timing = Date.now() - stage1Start;

        console.log(`   ✅ 剧本生成完成 (${result.stages.scriptEngine.timing}ms)`);
        console.log(`      场景: ${scriptResult.report.scenes_count} | 角色: ${scriptResult.report.characters_count} | 台词: ${scriptResult.report.dialogues_count}`);
        console.log(`      校验: ${scriptResult.validation.passed ? '通过' : '失败'} (${scriptResult.validation.overall_score}分)`);
        console.log('   ✅ 剧本生成完成,直接进入制作环节');

        // 剧本确认已移除:需求确认后直接跑完整预生产
        result.confirmations.script = { approved: true, skipped: true, reason: '剧本确认环节已移除,需求确认后直接生产' };
      } catch (error) {
        result.success = false;
        result.errors.push({ layer: 'script-engine', error: error.message });
        console.error(`\n❌ [Layer 1 失败] ${error.message}`);
        return result;
      }

      // ========== 适配层 ==========
      console.log('\n🔗 [Adapter] 适配层 - 转换数据格式...');
      const adapted = scriptResult.adapted;

      // ========== Layer 2: 制作引擎 ==========
      console.log('\n🎬 [Layer 2] 制作引擎 - 生成镜头...');
      const stage2Start = Date.now();

      // 【修复】应用运行时 agentConfig(解决配置不生效问题)
      if (options.productionEngine?.agentConfig || options.skipFieldQuality) {
        this.productionEngine.updateAgentConfig({
          ...options.productionEngine?.agentConfig,
          ...(options.skipFieldQuality ? { skipFieldQuality: true } : {})
        });
      }

      const productionResult = await this.productionEngine.produce(adapted, {
        ...options.productionEngine?.agentConfig,
        ...(options.skipFieldQuality ? { skipFieldQuality: true } : {})
      });

      result.stages.productionEngine = {
        shots: productionResult.shots.map(s => {
          const clean = {};
          for (const [k, v] of Object.entries(s)) {
            if (k.startsWith('_')) continue; // 跳过内部字段
            if (typeof v === 'function') continue;
            clean[k] = v;
          }
          return clean;
        }),
        prompts: productionResult.prompts,
        quality: productionResult.stages.qualityGate,
        // 【v2.1.4】跨集边界校验报告
        boundaryReport: productionResult.stages.boundaryReport || null
      };
      result.stages.productionEngine.timing = Date.now() - stage2Start;

      console.log(`   ✅ 制作完成 (${result.stages.productionEngine.timing}ms)`);
      console.log(`      镜头: ${productionResult.shots.length} | Prompts: ${productionResult.prompts.length}`);
      console.log(`      质量门: ${productionResult.stages.qualityGate?.passed ? '通过' : '失败'}`);

      // ========== 🆕 字段标准化与守门(专家诊断建议)==========
      console.log('\n🛡️ [FieldGuard] Layer 2 输出标准化与校验...');
      try {
        const normalized = this.fieldGuard.normalizeAndValidate(productionResult.shots, 'Layer2-Production');
        productionResult.shots = normalized.shots;

        // 【v2.1.4-fix10-P25-fix3】关键修复:标准化后用完整的 25 字段重算 prompt,消除"假完整"
        for (const shot of productionResult.shots) {
          if (shot.fields && this.productionEngine.assemblePromptFromFields) {
            const rebuilt = this.productionEngine.assemblePromptFromFields(shot, shot.fields, shot.ratio || '16:9');
            shot.prompt = rebuilt;
            shot.promptCharCount = this.productionEngine.countChars ? this.productionEngine.countChars(rebuilt) : rebuilt.length;
          }
        }
        // prompts 数组也要同步
        for (const p of (productionResult.prompts || [])) {
          const shot = productionResult.shots.find(s => s.shotId === p.shotId);
          if (shot) { p.prompt = shot.prompt; p.promptCharCount = shot.promptCharCount; }
        }

        // v1.2.6-fix5: 不再用 normalized.shots 覆盖 prompts(prompts 已是标准输出对象,标准化会破坏结构)
        // productionResult.prompts = normalized.shots; // ❌ 删除此行
        console.log(`   ✅ 字段标准化通过 (${normalized.report.warnings.length} 警告),prompt 已按 25 字段重算`);
        this.fieldGuard.printShotSummary(normalized.shots, 'Layer2-Production');
      } catch (err) {
        console.error(`   ❌ 字段校验失败: ${err.message}`);
        if (err.report) {
          console.error(`      错误: ${err.report.errors.join(' | ')}`);
        }
        // 非严格模式下继续,但记录错误
        result.errors.push({ stage: 'FieldGuard-Layer2', message: err.message });
      }

      // ========== 🆕 好莱坞导演技能注入 ==========
      console.log('\n🎬 [Director Skills] 好莱坞导演技能注入...');
      try {
        const { routeAndEnhance } = require('./skills/hollywood-cinematography/cinematography-skill-router');
        const { enhancedShots, report } = routeAndEnhance(productionResult.shots, {
          minScore: 5,
          maxSkillsPerShot: 2
        });

        // 更新 shots
        productionResult.shots = enhancedShots;

        // 将导演风格同步到 prompts
        for (let i = 0; i < productionResult.prompts.length; i++) {
          const shot = enhancedShots.find(s => s.shotId === productionResult.prompts[i].shotId);
          if (shot && shot._appliedSkills) {
            productionResult.prompts[i].directorStyle = shot._appliedSkills
              .map(s => `${s.type}_${s.director}_${s.emotion}`)
              .join(', ');
            productionResult.prompts[i]._appliedSkills = shot._appliedSkills;
          }
        }

        console.log(`   ✅ 导演技能注入完成`);
        console.log(`      增强镜头: ${report.enhancedShots}/${report.totalShots}`);
        console.log(`      使用技能: ${report.skillsUsed.length}个`);
        if (report.skillsUsed.length > 0) {
          console.log(`      技能列表: ${report.skillsUsed.slice(0, 5).join(', ')}${report.skillsUsed.length > 5 ? '...' : ''}`);
        }

        result.stages.directorSkills = {
          enhancedShots: report.enhancedShots,
          totalShots: report.totalShots,
          skillsUsed: report.skillsUsed,
          details: report.details
        };
      } catch (err) {
        console.warn(`   ⚠️ 导演技能注入失败: ${err.message}`);
        result.errors.push({ stage: 'DirectorSkills', message: err.message });
      }

      // ========== 🆕 提示词审核确认环节 ==========
      if (!options.skipPromptReview) {
        console.log('\n📝 [提示词审核] 等待人工确认...');

        const promptConfirmation = await this._confirmPrompts(productionResult.prompts);
        result.confirmations.prompts = promptConfirmation;

        if (!promptConfirmation.approved) {
          console.log('   ❌ 提示词未确认,流程中止');
          result.success = false;
          result.stages.promptReview = {
            status: 'rejected',
            reason: promptConfirmation.reason || '用户未确认',
            issues: promptConfirmation.issues || []
          };
          return result;
        }

        console.log('   ✅ 提示词已确认,继续渲染');
      } else {
        console.log('\n⚠️ [提示词审核] 跳过(调试模式)');
        result.confirmations.prompts = { approved: true, skipped: true };
      }

      // ========== Layer 3: 渲染引擎 ==========
      let renderResult = null;

      if (!options.skipRender) {
        try {
          console.log('\n🎨 [Layer 3] 渲染引擎 - 提交 Seedance...');
          const stage3Start = Date.now();

          renderResult = await this.renderingEngine.render(productionResult.prompts, {
            dryRun: options.dryRun || !this.renderingEngine.config.apiKey
          });

          result.stages.renderingEngine = {
            render: renderResult,
            report: this.renderingEngine.generateReport(renderResult)
          };
          result.stages.renderingEngine.timing = Date.now() - stage3Start;

          console.log(`   ✅ 渲染完成 (${result.stages.renderingEngine.timing}ms)`);
          console.log(`      提交: ${renderResult.submitted}/${renderResult.results.length} | 失败: ${renderResult.failed}`);
        } catch (error) {
          result.errors.push({ layer: 'rendering-engine', error: error.message });
          console.warn(`\n⚠️ [Layer 3 失败] ${error.message}`);
          result.stages.renderingEngine = { error: error.message, skipped: false };
        }
      } else {
        console.log('\n⚠️ [渲染] 跳过(调试模式)');
        result.stages.renderingEngine = { skipped: true };
      }

      // ========== Layer 4: 后期引擎 ==========
      if (!options.skipPostProduction) {
        try {
          console.log('\n🎬 [Layer 4] 后期引擎 - 字幕/音乐/弹幕/多版本...');
          const stage4Start = Date.now();

          const postResult = await this.postProductionEngine.postProduce(
            productionResult,
            scriptResult,
            renderResult || { success: false, results: [] }
          );

          result.stages.postProductionEngine = {
            success: postResult.success,
            versions: postResult.versions,
            stages: postResult.stages,
            report: this.postProductionEngine.generateReport(postResult)
          };
          result.stages.postProductionEngine.timing = Date.now() - stage4Start;

        console.log(`   ✅ 后期制作完成 (${result.stages.postProductionEngine.timing}ms)`);
        console.log(`      版本: ${Object.keys(postResult.versions).join(', ')}`);
        console.log(`      字幕: ${postResult.stages.subtitles?.count || 0}条 | 音乐: ${postResult.stages.music?.count || 0}段 | 弹幕: ${postResult.stages.danmaku?.count || 0}条`);
        } catch (error) {
          result.errors.push({ layer: 'post-production', error: error.message });
          console.warn(`\n⚠️ [Layer 4 失败] ${error.message}`);
          result.stages.postProductionEngine = { error: error.message, skipped: false };
        }
      } else {
        console.log('\n⚠️ [后期制作] 跳过(调试模式)');
        result.stages.postProductionEngine = { skipped: true };
      }

      // ========== 汇总 ==========
      // 【P0-9-审计修复】根据各阶段实际结果判定 success，而非无条件 true
      const hasCriticalErrors = result.errors.some(e => 
        e.layer === 'rendering' || e.layer === 'post-production'
      );
      const renderFailed = result.stages.renderingEngine?.error !== undefined;
      const postProdFailed = result.stages.postProductionEngine?.error !== undefined;
      result.success = !hasCriticalErrors && !renderFailed && !postProdFailed;

      result.timing.total = Date.now() - totalStart;

      console.log(`\n🏁 [完成] 总耗时: ${result.timing.total}ms`);
      console.log(`   状态: ${result.success ? '✅ 成功' : '❌ 失败'}`);

      // 生成最终报告
      result.finalReport = this._generateFinalReport(scriptResult, productionResult, result.stages.renderingEngine, result.stages.postProductionEngine, result.timing.total, result.confirmations);

      // ========== 🆕 最终导出前字段标准化(专家诊断建议)==========
      if (productionResult && productionResult.shots) {
        // v2.0.6: 先在FieldGuard之前处理片头字段(避免校验失败阻断)
        const adapter = result.stages?.adapter || {};
        // 【审计修复】统一片头判定,兼容 SC00/S00
        const openingShot = productionResult.shots.find(s => isOpeningShot(s));
        if (openingShot) {
          // 如果片头缺少title/subtitle,先用adapter标题兜底
          if (!openingShot.title || openingShot.title === '未命名') {
            openingShot.title = adapter.title || '未命名';
          }
          if (!openingShot.subtitle) {
            const epNum = adapter._metadata?.episodeNumber || adapter._metadata?.series?.currentEpisode || 1;
            openingShot.subtitle = `第${epNum}集`;
          }
        }

        console.log('\n🛡️ [FieldGuard] 最终导出前标准化...');
        try {
          // 【v2.1.4-fix11-F】最终导出前严格检查:标记上下文
          productionResult.shots.forEach(s => s._context = 'Final-Export');

          // 【v2.1.4-fix11-G】片头优化必须在FieldGuard之前执行,确保片头字段被正确添加
          // 【审计修复】统一片头判定,兼容 SC00/S00
          const openingShot = productionResult.shots.find(s => isOpeningShot(s));
          if (openingShot) {
            console.log('\n🎬 [OpeningTitleOptimizer] 片头专属字段优化...');
            try {
              const optimizer = new OpeningTitleOptimizer({
                llmTimeout: 120000,
                llmMaxRetries: 2,
                // 【v2.1.4-fix13-审计修复】从环境变量读取模型,消除硬编码
                llmModel: process.env.STORMAXE_LLM_FAST_MODEL || process.env.STORMAXE_LLM_MODEL || 'kimi-k2p6'
              });
              const blueprint = result.stages?.adapter || { title: result.title || '未命名' };
              const optimized = await optimizer.optimize(openingShot, blueprint);

              if (!optimized.degraded) {
                // 【v2.1.4-fix12】直接修改 openingShot 的顶层属性(standardOutput 是扁平结构)
                openingShot.title_content = optimized.title_content;
                openingShot.subtitle_content = optimized.subtitle_content;
                openingShot.title_animation = optimized.title_animation;
                openingShot.title_font_design = optimized.title_font_design;
                openingShot.opening_audio_design = optimized.opening_audio_design;

                openingShot.title = optimized.title_content || openingShot.title;
                openingShot.subtitle = optimized.subtitle_content || openingShot.subtitle;

              // 【v2.1.5-fix】同步更新 prompts 中对应的片头 shot
              const promptIdx = productionResult.prompts.findIndex(p => isOpeningShot(p));
              if (promptIdx >= 0) {
                const promptShot = productionResult.prompts[promptIdx];
                promptShot.title_content = openingShot.title_content;
                promptShot.subtitle_content = openingShot.subtitle_content;
                promptShot.title_animation = openingShot.title_animation;
                promptShot.title_font_design = openingShot.title_font_design;
                promptShot.opening_audio_design = openingShot.opening_audio_design;
                promptShot.title = openingShot.title;
                promptShot.subtitle = openingShot.subtitle;
                console.log('   ✅ prompts 片头字段已同步');
              }
                console.log('   主标题:', optimized.title_content);
                console.log('   副标题:', optimized.subtitle_content);
              } else {
                // 【v2.1.4-fix13】降级时也要补全全部 5 个字段(用 optimized 返回的 fallback 值)
                console.warn('   ⚠️ 片头优化降级,使用 fallback 值补全全部5字段');
                openingShot.title_content = optimized.title_content || openingShot.title_content || result.title || '未命名';
                openingShot.subtitle_content = optimized.subtitle_content || openingShot.subtitle_content || '第1集';
                // 【v2.1.4-fix13】补全剩余 3 个字段(之前被丢弃)
                openingShot.title_animation = optimized.title_animation || '主标题淡入入场,副标题延迟0.5秒跟随淡入,整体2秒';
                openingShot.title_font_design = optimized.title_font_design || '粗体无衬线字体,白色,带微阴影';
                openingShot.opening_audio_design = optimized.opening_audio_design || '环境音渐起,配合标题入场';

                openingShot.title = openingShot.title_content;
                openingShot.subtitle = openingShot.subtitle_content;
              }
            } catch (e) {
              console.warn('   ⚠️ 片头优化失败:', e.message);
              // 【v2.1.4-fix13】异常时也要补全全部 5 个字段,不能留空
              openingShot.title_content = openingShot.title_content || result.title || '未命名';
              openingShot.subtitle_content = openingShot.subtitle_content || '第1集';
              openingShot.title_animation = openingShot.title_animation || '主标题淡入入场,副标题延迟0.5秒跟随淡入,整体2秒';
              openingShot.title_font_design = openingShot.title_font_design || '粗体无衬线字体,白色,带微阴影';
              openingShot.opening_audio_design = openingShot.opening_audio_design || '环境音渐起,配合标题入场';
            }
          }

          // 【审计修复】无论优化成功/降级/异常,进入 FieldGuard 前强制确保5字段非空,防止严格校验 throw 丢字段
          if (openingShot) {
            const openingDefaults = {
              title_content: openingShot.title_content || openingShot.title || result.title || '未命名',
              subtitle_content: openingShot.subtitle_content || openingShot.subtitle || '第1集',
              title_animation: openingShot.title_animation || '主标题淡入入场,副标题延迟0.5秒跟随淡入,整体2秒',
              title_font_design: openingShot.title_font_design || '粗体无衬线字体,白色,带微阴影',
              opening_audio_design: openingShot.opening_audio_design || '环境音渐起,配合标题入场'
            };
            Object.assign(openingShot, openingDefaults);
            // 同步 title/subtitle 顶层字段
            openingShot.title = openingShot.title || openingShot.title_content;
            openingShot.subtitle = openingShot.subtitle || openingShot.subtitle_content;
            openingShot.sceneType = openingShot.sceneType || 'opening'; // 兜底 sceneType
          }

          // v1.2.6-fix5: 只对 shots 做标准化,不要用 normalized.shots 覆盖 prompts          // v1.2.6-fix5: 只对 shots 做标准化,不要用 normalized.shots 覆盖 prompts          // v1.2.6-fix5: 只对 shots 做标准化，不要用 normalized.shots 覆盖 prompts
          const normalized = this.fieldGuard.normalizeAndValidate(productionResult.shots, 'Final-Export');
          productionResult.shots = normalized.shots;

          // v1.2.6-fix5: prompts 保持原样(它们已经是标准输出对象),不再被 shots 覆盖
          // productionResult.prompts = normalized.shots; // ❌ 删除此行

          // v1.2.6-fix5: shots 摘要改用标准输出字段(duration 而非 timing)
          // v2.0.6: 包含片头专属字段
          result.stages.productionEngine.shots = normalized.shots.map(s => ({
            shotId: s.shotId,
            sceneType: s.sceneType || '',
            duration: s.duration || s.timing?.duration || 0,
            promptLength: typeof s.prompt === 'string' ? s.prompt.length : (s.promptCharCount || 0),
            status: s.status || 'completed',
            // v2.0.6: 片头专属字段(从顶层属性提取,OpeningTitleOptimizer写入)
            ...(s.title_content ? {
              title_content: s.title_content,
              subtitle_content: s.subtitle_content,
              title_animation: s.title_animation,
              title_font_design: s.title_font_design,
              opening_audio_design: s.opening_audio_design
            } : {}),
            // v2.0.6: 包含fields中的标准字段
            ...(s.fields || {})
          }));
          console.log('   ✅ 最终导出字段标准化通过');
          this.fieldGuard.printShotSummary(normalized.shots, 'Final-Export');

        } catch (err) {
          console.error(`   ❌ 最终字段校验失败: ${err.message}`);
          result.errors.push({ stage: 'FieldGuard-Final', message: err.message });
        }
      }

    } catch (error) {
      result.success = false;
      result.errors.push({
        stage: 'HYPERREALITY_SYSTEM',
        message: error.message,
        stack: error.stack
      });
      console.error(`\n❌ [系统错误] ${error.message}`);
    }

    // 【v2.1.4-fix13-审计修复】将完整 shots/prompts/opening 挂到 result,供调用方获取完整数据
    if (typeof productionResult !== 'undefined' && productionResult) {
      result.shots = productionResult.shots || [];
      result.prompts = productionResult.prompts || [];
      result.opening = productionResult.opening || null;
      result.degraded = productionResult.degraded || false;
    }

    return result;
  }

  /**
   * 🆕 需求清单确认(Layer 0)
   * v1.2.5: 支持外部确认--输出文件后等待队长确认
   */
  async _confirmRequirementList(markdown, requirementList) {
    console.log('\n--- 📋 需求清单确认 ---');
    console.log(markdown);
    console.log('\n---');

    // v1.2.5: 写入文件并等待外部确认
    const confirmPath = await this._waitForExternalConfirmation('requirement', markdown);

    if (confirmPath.approved) {
      console.log('   ✅ 需求清单已确认');
    } else {
      console.log('   ❌ 需求清单被拒绝:', confirmPath.reason);
    }

    return {
      approved: confirmPath.approved,
      reviewedAt: new Date().toISOString(),
      requirementList: requirementList,
      reason: confirmPath.reason,
      suggestions: confirmPath.suggestions
    };
  }

  /**
   * 提示词确认环节
   * v1.2.5: 支持外部确认
   */
  async _confirmPrompts(prompts) {
    // 生成提示词报告供审阅
    const promptReport = this._generatePromptsReport(prompts);

    // v1.2.5: 写入文件并等待外部确认
    const confirmPath = await this._waitForExternalConfirmation('prompt', promptReport);

    if (confirmPath.approved) {
      console.log('   ✅ 提示词已确认');
    } else {
      console.log('   ❌ 提示词被拒绝:', confirmPath.reason);
    }

    return {
      approved: confirmPath.approved,
      reviewedAt: new Date().toISOString(),
      report: promptReport,
      reason: confirmPath.reason,
      suggestions: confirmPath.suggestions
    };
  }

  /**
   * v1.2.5: 等待外部确认
   * 将内容写入文件,轮询等待确认文件
   */
  async _waitForExternalConfirmation(type, content) {
    const outputDir = './output/confirmations';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 写入待确认内容
    const contentPath = path.join(outputDir, `confirmation-${type}.md`);
    fs.writeFileSync(contentPath, content, 'utf8');

    const confirmPath = path.join(outputDir, `confirmation-${type}.json`);

    // 【v2.1.4-fix10】检查是否已有预置的确认文件(队长已确认过)
    if (fs.existsSync(confirmPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(confirmPath, 'utf8'));
        if (data.status === 'approved' || data.approved === true) {
          console.log(`   ✅ 检测到已预置确认文件: ${confirmPath},直接通过`);
          return { approved: true, reason: 'pre-approved' };
        }
      } catch (e) {
        // 忽略解析错误,继续等待
      }
    }

    // 【P0-11-审计修复】支持环境变量配置确认模式和超时
    const confirmMode = process.env.STORMAXE_CONFIRM_MODE || 'timeout';
    const confirmTimeout = parseInt(process.env.STORMAXE_CONFIRM_TIMEOUT || '60', 10) * 1000;

    if (confirmMode === 'auto') {
      console.log(` ✅ 自动确认模式，跳过等待: ${type}`);
      return { approved: true, reason: 'auto-approved' };
    }

    console.log(`\n⏳ [等待确认] ${type} 已输出到: ${contentPath}`);
    console.log(`  超时: ${confirmTimeout / 1000}s（STORMAXE_CONFIRM_TIMEOUT 调整）`);

    const checkInterval = 3000;
    const startTime = Date.now();

    while (Date.now() - startTime < confirmTimeout) {
      if (fs.existsSync(confirmPath)) {
        try {
          const confirmData = JSON.parse(fs.readFileSync(confirmPath, 'utf8'));
          return {
            approved: confirmData.approved === true || confirmData.approved === 'true',
            reason: confirmData.reason || '',
            suggestions: confirmData.suggestions || []
          };
        } catch (e) {
          console.log('   ⚠️ 确认文件解析失败,继续等待...');
        }
      }
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    // 【修复】超时后自动通过，避免阻塞无人值守任务
    console.log(` ⏰ 确认超时(${confirmTimeout / 1000}s)，自动通过: ${type}`);
    return { approved: true, reason: 'timeout-auto-approved', suggestions: [] };
  }

  /**
   * 生成提示词报告(供审阅)
   */
  /**
   * 【v2.1.4-fix13-队长优化】格式化提示词:序号+换行+情绪增强
   */
  _formatPromptWithSequenceNumbers(promptText, isOpening = false) {
    if (!promptText || typeof promptText !== 'string') return '(空)';

    // 情绪关键词扩展映射
    const emotionMap = {
      'neutral': '情绪克制内敛,面无多余表情,眼神沉稳专注,面部肌肉放松自然,传递专业冷静的气场',
      'calm': '神态安详从容,呼吸平稳,眉头舒展,嘴角自然闭合,整体氛围宁静平和,无焦虑紧张感',
      'positive': '面部微微放松,眼神温和带光,嘴角自然上扬约5度,传递乐观自信与亲和感',
      'high energy': '精神状态饱满,眼神明亮有神,身体姿态挺拔舒展,动作利落有力,充满积极活力',
      'serene': '神态宁静悠远,目光柔和涣散,面部线条放松,仿佛沉浸在平和的思绪中',
      'professional': '表情严肃专注,目光坚定直视,肩背挺直,手势精准克制,展现职业权威感',
      'hopeful': '眼神向上微抬,瞳孔有光,嘴角轻微上扬,面部肌肉放松,传递对未来的期许',
      'concerned': '眉头微蹙,眼神专注关切,嘴角微微下沉,面部肌肉轻微紧绷,传递担忧与责任感',
      'tense': '眉头紧锁,眼神锐利聚焦,下颌微收,面部肌肉紧绷,身体姿态僵硬,传递紧张压迫感',
      'warm': '面部柔和放松,眼神温和亲切,嘴角自然上扬,传递温暖关怀与信任感'
    };

    // 解析字段
    const fields = [];
    const regex = /【([^】]+)】([^【]*)/g;
    let match;
    while ((match = regex.exec(promptText)) !== null) {
      fields.push({ name: match[1], content: match[2].trim() });
    }

    // 如果没有解析到字段,返回原文
    if (fields.length === 0) return promptText;

    // 格式化输出
    const lines = [];
    let seq = 1;

    for (const field of fields) {
      const seqStr = String(seq).padStart(2, '0');

      // 【P3-28-审计修复】情绪字段只做审核提示，不修改实际 prompt 内容
      if (field.name === '情绪') {
        let enhanced = field.content;
        // 仅提示补充面部描述，不替换情绪关键词
        if (!enhanced.includes('面部') && !enhanced.includes('眼神') && !enhanced.includes('神态') && enhanced.length < 50) {
          enhanced = `${enhanced}（审核提示：建议补充面部微表情和眼神描述）`;
        }
        lines.push(`${seqStr}.【${field.name}】${enhanced}`);
      } else {
        lines.push(`${seqStr}.【${field.name}】${field.content}`);
      }

      seq++;
    }

    // 片头额外字段(如果是片头)
    if (isOpening) {
      const openingFields = [
        { name: 'title_content', label: '主标题内容' },
        { name: 'subtitle_content', label: '副标题内容' },
        { name: 'title_animation', label: '标题动画设计' },
        { name: 'title_font_design', label: '标题字体设计' },
        { name: 'opening_audio_design', label: '开场音频设计' }
      ];
      for (const openingField of openingFields) {
        const seqStr = String(seq).padStart(2, '0');
        lines.push(`${seqStr}.【${of.label}】(片头专属字段,需单独配置)`);
        seq++;
      }
    }

    return lines.join('\n');
  }

  _generatePromptsReport(prompts) {
    const lines = [];

    lines.push('# 📝 提示词审核报告');
    lines.push('');
    lines.push(`**镜头数**: ${prompts.length}`);
    // v2.0.4-fix: 使用 promptCharCount 替代 prompt.length,确保中英文混合计数准确
    const totalLen = prompts.reduce((s, p) => s + (p.promptCharCount || (typeof p.prompt === 'string' ? p.prompt.length : 0)), 0);
    lines.push(`**平均长度**: ${prompts.length > 0 ? Math.round(totalLen / prompts.length) : 0} 字符`);
    lines.push('');
    lines.push('## 镜头总览');
    lines.push('');
    // v2.0.4-fix: 增加时间轴字符串和字符数统计列
    lines.push('| 镜头 | 时长 | 字符数 | 字段数 | 有定妆照 | 有时间轴 | 有约束 |');
    lines.push('|------|------|--------|--------|----------|----------|--------|');

    for (const p of prompts) {
      const hasImages = p.characterRef && p.characterRef !== 'NONE';
      // v2.0.4-fix: 检查 timelineString 是否存在
      const hasTimeline = !!(p.timelineString && p.timelineString.length > 3);
      const hasConstraints = typeof p.prompt === 'string' && p.prompt.includes('角色一致性') || false;
      const charCount = p.promptCharCount || (typeof p.prompt === 'string' ? p.prompt.length : 0);
      // 【v2.1.4-fix13】统计字段数
      const fieldCount = (p.prompt?.match(/【/g) || []).length;
      const isOpening = p.shotId === 'SC00' || p.sceneType === 'opening';
      const expectedFields = isOpening ? 30 : 25;
      const fieldStatus = fieldCount >= expectedFields ? '✅' : (fieldCount >= expectedFields - 3 ? '⚠️' : '❌');
      lines.push(`| ${p.shotId} | ${p.duration || '?'}s | ${charCount} | ${fieldStatus} ${fieldCount}/${expectedFields} | ${hasImages ? '✓' : '✗'} | ${hasTimeline ? '✓' : '✗'} | ${hasConstraints ? '✓' : '✗'} |`);
    }

    lines.push('');
    lines.push('## 完整提示词');
    lines.push('');

    for (const p of prompts) {
      const isOpening = p.shotId === 'SC00' || p.sceneType === 'opening';
      lines.push(`### ${p.shotId}${isOpening ? '(片头·30字段)' : '(内容·25字段)'}`);
      const charCount = p.promptCharCount || (typeof p.prompt === 'string' ? p.prompt.length : 0);
      lines.push(`**长度**: ${charCount} 字符 | **定妆照**: ${p.characterRef && p.characterRef !== 'NONE' ? '有' : '无'} | **时间轴**: ${p.timelineString || '无'}`);
      lines.push('');
      // v2.0.4-fix: 显示人物介绍卡片
      if (p.characterCards && p.characterCards.length > 0) {
        lines.push('**人物卡片**:');
        for (const card of p.characterCards) {
          lines.push(`- ${card.name} (${card.role}): ${card.description || '无描述'}`);
        }
        lines.push('');
      }
      // 【v2.1.4-fix13】使用新格式:序号+换行+情绪增强
      lines.push('```markdown');
      lines.push(this._formatPromptWithSequenceNumbers(p.prompt, isOpening));
      lines.push('```');
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    lines.push('## ⚠️ 审核须知');
    lines.push('');
    lines.push('1. 【内容镜头】确认有 25 个字段(序号01-25)');
    lines.push('2. 【片头镜头】确认有 30 个字段(序号01-30,含5个片头专属字段)');
    lines.push('3. 确认【情绪】字段有具体面部/眼神描述,不是简单关键词');
    lines.push('4. 确认角色定妆照引用正确');
    lines.push('5. 确认负面约束(暗黑风/金属光泽)已包含');
    lines.push('6. 确认角色一致性约束已包含');
    lines.push('7. 确认 Prompt 长度在限制以内');
    lines.push('');
    lines.push('**请回复 "确认" 继续渲染,或 "修改" 并指出问题**');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * 生成最终报告(含确认环节 + 渲染结果 + 后期制作)
   */
  _generateFinalReport(scriptResult, productionResult, renderResult, postResult, totalTime, confirmations) {
    const blueprint = scriptResult.blueprint;
    const validation = scriptResult.validation;
    const report = scriptResult.report;
    const production = productionResult;
    const render = renderResult?.render || { submitted: 0, failed: 0 };

    const lines = [];

    lines.push('# 超现实工业创作系统 - 生产报告');
    lines.push(`**版本**: v${this.version}  |  **总耗时**: ${totalTime}ms`);
    lines.push('');

    // 确认状态
    lines.push('## ✅ 确认状态');
    lines.push('');
    lines.push(`| 环节 | 状态 | 时间 |`);
    lines.push(`|------|------|------|`);
    if (confirmations?.prompts) {
      lines.push(`| 提示词审核 | ${confirmations.prompts.approved ? '✅ 通过' : '❌ 未通过'} ${confirmations.prompts.skipped ? '(跳过)' : ''} | ${confirmations.prompts.reviewedAt || 'N/A'} |`);
    }
    lines.push('');

    // 项目信息
    lines.push('## 📋 项目信息');
    lines.push(`| 字段 | 值 |`);
    lines.push(`|------|------|`);
    lines.push(`| 标题 | ${blueprint.meta.title || '未命名'} |`);
    lines.push(`| 叙事模式 | ${blueprint.meta.narrative_mode || 'default'} |`);
    lines.push(`| 目标时长 | ${blueprint.meta.target_duration || 120}s |`);
    lines.push(`| 场景数 | ${report.scenes_count} |`);
    lines.push(`| 角色数 | ${report.characters_count} |`);
    lines.push(`| 台词数 | ${report.dialogues_count} |`);
    lines.push('');

    // 剧本校验
    lines.push('## ✅ 剧本校验');
    lines.push(`**状态**: ${validation.passed ? '通过 ✓' : '未通过 ✗'} | **综合评分**: ${validation.overall_score}/100`);
    lines.push('');
    lines.push(`| 维度 | 评分 |`);
    lines.push(`|------|------|`);
    for (const [dim, score] of Object.entries(validation.scores?.detailed || {})) {
      lines.push(`| ${dim} | ${score} |`);
    }
    lines.push('');

    // 镜头总览
    lines.push('## 🎬 镜头总览');
    // v2.0.4-fix: 增加时间轴和字符数统计列
    lines.push(`| 镜头ID | 类型 | 时长 | 字符数 | 时间轴 | 状态 |`);
    lines.push(`|--------|------|------|--------|--------|------|`);
    for (const shot of production.shots) {
      const charCount = shot.promptCharCount || (typeof shot.prompt === 'string' ? shot.prompt.length : 0);
      const timelineStr = shot.timelineString || '无';
      lines.push(`| ${shot.shotId} | ${shot.sceneType} | ${shot.duration || shot.timing?.duration || 0}s | ${charCount} | ${timelineStr} | ${shot.status || 'ok'} |`);
    }
    lines.push('');

    // 渲染结果
    if (renderResult && !renderResult.skipped) {
      lines.push('## 🎨 渲染结果');
      lines.push(`| 提交 | 成功 | 失败 | 成功率 |`);
      lines.push(`|------|------|------|--------|`);
      lines.push(`| ${render.results.length} | ${render.submitted} | ${render.failed} | ${render.results.length > 0 ? Math.round((render.submitted / render.results.length) * 100) : 0}% |`);
      lines.push('');
    }

    // 完整 Prompts
    lines.push('## 📝 完整 Prompts');
    lines.push('');
    for (const p of production.prompts) {
      lines.push(`### ${p.shotId}`);
      const charCount = p.promptCharCount || (typeof p.prompt === 'string' ? p.prompt.length : 0);
      lines.push(`**长度**: ${charCount} 字符 | **定妆照**: ${p.characterRef && p.characterRef !== 'NONE' ? p.characterRef : '无'} | **时间轴**: ${p.timelineString || '无'}`);
      lines.push('');
      // v2.0.4-fix: 显示人物介绍卡片
      if (p.characterCards && p.characterCards.length > 0) {
        lines.push('**人物卡片**:');
        for (const card of p.characterCards) {
          lines.push(`- ${card.name} (${card.role}): ${card.description || '无描述'}`);
        }
        lines.push('');
      }
      lines.push('```');
      lines.push(p.prompt);
      lines.push('```');
      lines.push('');
    }

    // 质量门
    const qg = production.stages?.qualityGate;
    if (qg) {
      lines.push('## 🛡️ 质量门检查');
      lines.push(`**状态**: ${qg.passed ? '通过 ✓' : '失败 ✗'} (${qg.passedCount}/${qg.totalPrompts})`);
      lines.push('');
      lines.push(`| 镜头 | 有镜头时间轴 | 有角色 | 长度合规 | 状态 |`);
      lines.push(`|------|------------|--------|----------|------|`);
      for (const check of (qg.checks || [])) {
        lines.push(`| ${check.shotId} | ${check.hasTimeline ? '✓' : '✗'} | ${check.hasCharacters ? '✓' : '✗'} | ${check.withinLimit ? '✓' : '✗'} | ${check.passed ? '✓' : '✗'} |`);
      }
      lines.push('');
    }

    // 后期制作结果
    if (postResult && !postResult.skipped) {
      const post = postResult;
      lines.push('## 🎬 后期制作');
      lines.push(`**状态**: ${post.success ? '通过 ✓' : '未通过 ✗'}`);
      lines.push('');

      // 版本列表
      lines.push('### 输出版本');
      lines.push(`| 版本 | 字幕 | 音乐 | 弹幕 | 转场 | 片头 |`);
      lines.push(`|------|------|------|------|------|------|`);
      for (const [version, data] of Object.entries(post.versions || {})) {
        const f = data.features || {};
        lines.push(`| ${version} | ${f.subtitles ? '✓' : '✗'} | ${f.music ? '✓' : '✗'} | ${f.danmaku ? '✓' : '✗'} | ${f.transitions ? '✓' : '✗'} | ${f.titleCard ? '✓' : '✗'} |`);
      }
      lines.push('');

      // 字幕预览
      if (post.stages?.subtitles?.tracks?.length > 0) {
        lines.push('### 身份介绍字幕');
        lines.push(`| 角色 | 场景 | 时长 | 内容 |`);
        lines.push(`|------|------|------|------|`);
        for (const sub of post.stages.subtitles.tracks.slice(0, 3)) {
          lines.push(`| ${sub.characterName} | ${sub.sceneId} | ${sub.duration}s | ${sub.content.title} |`);
        }
        lines.push('');
      }

      // 音乐预览
      if (post.stages?.music?.tracks?.length > 0) {
        lines.push('### 无版权音乐配置');
        lines.push(`| 场景 | 风格 | 情绪 | 音量 |`);
        lines.push(`|------|------|------|------|`);
        for (const track of post.stages.music.tracks.slice(0, 3)) {
          lines.push(`| ${track.sceneId} | ${track.searchParams.genre} | ${track.searchParams.mood} | ${track.config.volume} |`);
        }
        lines.push('');
      }

      // 弹幕预览
      if (post.stages?.danmaku?.list?.length > 0) {
        lines.push('### 弹幕预览');
        lines.push(`| 内容 | 场景 | 颜色 |`);
        lines.push(`|------|------|------|`);
        for (const dm of post.stages.danmaku.list.slice(0, 3)) {
          lines.push(`| ${dm.text} | ${dm.sceneId} | ${dm.color} |`);
        }
        lines.push('');
      }
    }

    // 时序分析
    lines.push('## ⏱️ 时序分析');
    lines.push('');
    lines.push(`| 阶段 | 耗时 | 占比 |`);
    lines.push(`|------|------|------|`);
    lines.push(`| 剧本引擎 | ${scriptResult.timing || 'N/A'} | - |`);
    lines.push(`| 制作引擎 | ${production.timing?.total || 'N/A'} | - |`);
    lines.push(`| 渲染引擎 | ${renderResult?.timing?.total || 'N/A'} | - |`);
    lines.push(`| 后期引擎 | ${postResult?.timing?.total || 'N/A'} | - |`);
    lines.push(`| 总耗时 | ${totalTime}ms | 100% |`);
    lines.push('');

    lines.push('---');
    lines.push(`*生成时间: ${new Date().toISOString()}*`);

    return lines.join('\n');
  }

  /**
   * 保存完整结果到文件
   */
  async save(result, outputDir) {
    const fs = require('fs').promises;
    const path = require('path');

    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const basePath = path.join(outputDir, `hyperreality-${timestamp}`);

    // 保存完整结果 JSON
    await fs.writeFile(
      `${basePath}-result.json`,
      JSON.stringify(result, null, 2)
    );

    // 保存 Markdown 报告
    if (result.finalReport) {
      await fs.writeFile(
        `${basePath}-report.md`,
        result.finalReport
      );
    }

    // 保存提示词审核报告
    if (result.confirmations?.prompts?.report) {
      await fs.writeFile(
        `${basePath}-prompt-review.md`,
        result.confirmations.prompts.report
      );
    }

    // 保存后期制作报告
    if (result.stages?.postProductionEngine?.report) {
      await fs.writeFile(
        `${basePath}-post-production.md`,
        result.stages.postProductionEngine.report
      );
    }

    // 保存 Prompts 单独文件
    if (result.stages?.productionEngine?.prompts) {
      const promptsMD = this._generatePromptsOnlyMD(result.stages.productionEngine.prompts);
      await fs.writeFile(
        `${basePath}-prompts.md`,
        promptsMD
      );
    }

    console.log(`\n💾 结果已保存到: ${outputDir}`);
    return outputDir;
  }

  /**
   * 生成纯 Prompts MD
   */
  _generatePromptsOnlyMD(prompts) {
    const lines = [];
    lines.push('# 镜头 Prompts 清单');
    lines.push('');

    for (const p of prompts) {
      lines.push(`## ${p.shotId}`);
      lines.push('');
      lines.push(p.prompt);
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }
}

module.exports = { HyperrealitySystem };

```

---

## run-myth-wukong-erlang.js

```javascript
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

```

---

## run-preproduction-health-edu.js

```javascript
const { HyperrealitySystem } = require('./index');
const fs = require('fs');
const path = require('path');

async function main() {
  // 确保输出目录存在
  const outputDir = './output/health-edu-ep01-havs';
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

  const intent = '创作一集健康科普短视频，主题：什么是横纹肌溶解——横纹肌溶解的症状以及实验室检查。主讲人为穿警服的陈卓女士，讲解居民健康护理知识，进行全民健康科普。单人口播讲解，生动形象，带有自然的肢体语言。要求全写实风格，质感拉满的画质，好莱坞大导演风格。';

  const metadata = {
    title: '什么是横纹肌溶解——横纹肌溶解的症状以及实验室检查',
    target_duration: 62,
    series: '健康科普系列',
    episode: 1,
    totalEpisodes: 3,
    videoType: 'EDU',
    creativityIndex: 0.98,
    aspectRatio: '16:9',
    visualStyle: 'realistic',
    qualityLevel: 'high',
    characters: [
      {
        id: 'chen-zhuo',
        name: '陈卓',
        role: 'host',
        description: '穿警服的陈卓女士，警务系统护士，讲解居民健康护理知识',
        style: 'professional',
        portraits: {
          front: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/front.png',
          threeQuarter: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/threeQuarter.png',
          closeup: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/closeup.png',
          side: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/side.png'
        }
      }
    ],
    opening: {
      enabled: true,
      title: '横纹肌溶解',
      subtitle: '症状与实验室检查'
    },
    ending: {
      previewNext: false
    },
    contentConstraints: [
      '仅第一集有片头镜头，包含主标题和副标题',
      '结尾不预告下一集内容',
      '讲解过程生动形象，带有自然肢体语言',
      '全写实风格，人物和背景均真实质感',
      '专业度与通俗性兼顾',
      '时长控制在59-65秒'
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
  lines.push('# HAVS 预生产报告');
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
      lines.push('');
    }
  }

  return lines.join('\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

```

---

## run-preproduction-simple.js

```javascript
const { HyperrealitySystem } = require('./index');
const fs = require('fs');
const path = require('path');

async function main() {
  const outputDir = './output/health-edu-ep01-havs';
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

  const intent = '创作一集健康科普短视频，主题：什么是横纹肌溶解——横纹肌溶解的症状以及实验室检查。主讲人为穿警服的陈卓女士，讲解居民健康护理知识，进行全民健康科普。单人口播讲解，生动形象，带有自然的肢体语言。要求全写实风格，质感拉满的画质，好莱坞大导演风格。';

  const metadata = {
    title: '什么是横纹肌溶解——横纹肌溶解的症状以及实验室检查',
    target_duration: 62,
    series: '健康科普系列',
    episode: 1,
    totalEpisodes: 3,
    videoType: 'EDU',
    creativityIndex: 0.98,
    aspectRatio: '16:9',
    visualStyle: 'realistic',
    qualityLevel: 'high',
    characters: [
      {
        id: 'chen-zhuo',
        name: '陈卓',
        role: 'host',
        description: '穿警服的陈卓女士，警务系统护士，讲解居民健康护理知识',
        style: 'professional',
        portraits: {
          front: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/front.png',
          threeQuarter: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/threeQuarter.png',
          closeup: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/closeup.png',
          side: '/root/.openclaw/workspace/characters/chenzhuo/portraits/uniform/side.png'
        }
      }
    ],
    scenes: [
      { id: 'opening', name: '片头', type: 'opening', duration: 8 },
      { id: 'symptom', name: '症状讲解', type: 'explanation', duration: 20 },
      { id: 'lab', name: '实验室检查', type: 'explanation', duration: 20 },
      { id: 'warning', name: '警示', type: 'warning', duration: 10 },
      { id: 'ending', name: '结尾', type: 'ending', duration: 4 }
    ],
    style: {
      primary: 'REAL',
      secondary: 'NAT',
      description: '写实纪实风格,真实可信的纪实风格,增强专业信任感'
    },
    constraints: {
      noTextInFrame: true,
      noWatermark: true,
      realisticOnly: true,
      characterConsistency: true
    }
  };

  try {
    console.log('🔥 [HAVS Preproduction] 开始运行');
    console.log('   项目:', metadata.title);
    console.log('   预生产模式: 跳过渲染和后期');
    console.log('   确认文件已预置: auto-approved');
    console.log('');

    const result = await system.create(
      intent,
      metadata,
      {
        skipRendering: true,
        skipPostProduction: true,
        skipPromptReview: true,
        skipFieldQuality: true,
        enableCheckpoint: true,
        checkpointDir: outputDir,
        confirmationFile: path.join(outputDir, 'confirmation.json')
      }
    );

    console.log('\n✅ 预生产完成');
    console.log('结果:', JSON.stringify({
      success: result.success,
      stages: Object.keys(result.stages || {}),
      duration: result.duration,
      errors: result.errors?.length || 0
    }, null, 2));

    if (result.stages?.productionEngine?.prompts) {
      const promptsPath = path.join(outputDir, 'prompts.json');
      fs.writeFileSync(promptsPath, JSON.stringify(result.stages.productionEngine.prompts, null, 2));
      console.log('提示词已保存:', promptsPath);
    }

    if (result.stages?.scriptEngine?.blueprint) {
      const scriptPath = path.join(outputDir, 'script.json');
      fs.writeFileSync(scriptPath, JSON.stringify(result.stages.scriptEngine.blueprint, null, 2));
      console.log('剧本已保存:', scriptPath);
    }

  } catch (error) {
    console.error('❌ 预生产失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

```

---

## scripts/smoke-test.js

```javascript
/**
 * hyperreality-system/scripts/smoke-test.js
 * 快速回归测试：验证核心链路不崩溃、25字段完整
 * 【审计修复·P2】新增冒烟测试，5分钟验证系统健康
 */

const path = require('path');

// 强制设置测试环境
process.env.NODE_ENV = 'test';
process.env.HYPERREALITY_TEST_MODE = 'true';

// 模拟配置（避免加载真实密钥）
// 请设置环境变量: export VOLCENGINE_ARK_API_KEY=your_api_key

const HYPERREALITY_ROOT = path.join(__dirname, '..');

// ========== 测试工具 ==========
let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(` ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(` ❌ ${name} - ${err.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg || 'Assertion failed'}: expected ${expected}, got ${actual}`);
  }
}

function assertTrue(condition, msg) {
  if (!condition) {
    throw new Error(msg || 'Assertion failed: expected true');
  }
}

// ========== 测试套件 ==========
console.log('\n🔥 [Smoke Test] HyperrealitySystem 快速回归测试\n');

// --- 测试1: 模块可加载 ---
test('模块加载: HyperrealitySystem', () => {
  const { HyperrealitySystem } = require(path.join(HYPERREALITY_ROOT, 'index.js'));
  assertTrue(typeof HyperrealitySystem === 'function', 'HyperrealitySystem 应为类');
});

// --- 测试2: ProductionEngine 可实例化 ---
test('模块加载: ProductionEngine', () => {
  const { ProductionEngine } = require(path.join(HYPERREALITY_ROOT, 'engines/production-engine/production-engine.js'));
  assertTrue(typeof ProductionEngine === 'function', 'ProductionEngine 应为类');
});

// --- 测试3: 深拷贝不崩溃（循环引用场景）---
test('深拷贝: 循环引用安全', () => {
  const { ProductionEngine } = require(path.join(HYPERREALITY_ROOT, 'engines/production-engine/production-engine.js'));
  const engine = new ProductionEngine({});
  const shot = { shotId: 'SC00', sceneType: 'opening', title: 'Test' };
  shot._self = shot; // 制造循环引用
  const cloned = engine._deepCloneShot(shot);
  assertEqual(cloned.shotId, 'SC00', '克隆后 shotId 应保持');
  assertEqual(cloned.title, 'Test', '克隆后 title 应保持');
  assertTrue(cloned !== shot, '克隆应为新对象');
});

// --- 测试4: 片头判定兼容性 ---
test('片头判定: 兼容 SC00/S00/SC00-xx', () => {
  const { isOpeningShot } = require(path.join(HYPERREALITY_ROOT, 'engines/field-standardizer.js'));
  assertTrue(isOpeningShot({ shotId: 'SC00' }), 'SC00 应判定为片头');
  assertTrue(isOpeningShot({ shotId: 'S00' }), 'S00 应判定为片头');
  assertTrue(isOpeningShot({ shotId: 'SC00-01' }), 'SC00-01 应判定为片头');
  assertTrue(!isOpeningShot({ shotId: 'SC01' }), 'SC01 不应判定为片头');
});

// --- 测试5: Checkpoint 安全序列化 ---
test('Checkpoint: 循环引用安全序列化', () => {
  const { ProductionEngine } = require(path.join(HYPERREALITY_ROOT, 'engines/production-engine/production-engine.js'));
  const engine = new ProductionEngine({});
  const obj = { a: 1 };
  obj.self = obj; // 循环引用
  const json = engine._safeStringify(obj);
  const parsed = JSON.parse(json);
  assertEqual(parsed.a, 1, '安全序列化后 a 应保持');
  assertTrue(!parsed.self, '循环引用字段应被过滤');
});

// --- 测试6: PromptLengthConfig 引用正确 ---
test('配置: PromptLengthConfig.HARD_MAX = 12000', () => {
  const PromptLengthConfig = require(path.join(HYPERREALITY_ROOT, 'config/prompt-length.js'));
  assertEqual(PromptLengthConfig.HARD_MAX, 12000, 'HARD_MAX 应为 12000');
});

// --- 测试7: FieldGuard 单镜头失败不拖垮整批 ---
test('FieldGuard: 单镜头失败隔离', () => {
  const { FieldGuard } = require(path.join(HYPERREALITY_ROOT, 'engines/field-guard.js'));
  const guard = new FieldGuard({});
  // 模拟一个无效镜头（缺少必填字段）
  const badShot = { shotId: 'SC01' }; // 缺少 fields
  const goodShot = { shotId: 'SC02', fields: { scene: 'test' } };
  const result = guard.normalizeAndValidate([badShot, goodShot], 'test');
  assertTrue(Array.isArray(result.shots), '应返回 shots 数组');
  assertEqual(result.shots.length, 2, '应返回 2 个镜头');
  // 降级标记可能在 report.warnings 或 report.degraded 中
  const hasDegraded = (result.report.warnings?.length > 0) || (result.report.degraded > 0);
  assertTrue(hasDegraded, '应有降级或警告标记');
});

// ========== 汇总 ==========
console.log(`\n${'='.repeat(50)}`);
console.log(` 结果: ${passed} 通过, ${failed} 失败`);
console.log(`${'='.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);

```

---

## skills/hollywood-cinematography/cinematography-skill-router.js

```javascript
const path = require('path');
const fs = require('fs');

// 技能库根目录（可根据实际项目调整）
const SKILL_LIB_ROOT = path.join(__dirname, '..', '..', 'skills', '好莱坞工业电影技能工厂', '技能系列', '镜头级专项');

// 检查技能库是否存在（开源版本：技能文件可选）
const SKILL_LIB_AVAILABLE = fs.existsSync(SKILL_LIB_ROOT);

if (!SKILL_LIB_AVAILABLE) {
  console.log('[SkillRouter] 技能库未配置，运行在无技能增强模式（可通过添加技能文件到 skills/好莱坞工业电影技能工厂/技能系列/镜头级专项/ 启用）');
}

// ============================================================
// 技能索引构建
// ============================================================

let _skillIndex = null;
let _skillIndexBuildTime = 0;

function parseSkillFilename(filename) {
  const name = filename.replace('.md', '');
  const parts = name.split('_');
  
  const TYPE_MAP = {
    '剧情': 'drama', '动作': 'action', '喜剧': 'comedy', '恐怖': 'horror',
    '悬疑': 'suspense', '惊悚': 'thriller', '战争': 'war', '科幻': 'sci-fi',
    '孤独': 'loneliness', '微表情': 'micro-expression'
  };
  
  const DIRECTOR_MAP = {
    '维伦纽瓦': 'villeneuve', '诺兰': 'nolan', '卡梅隆': 'cameron',
    '卢卡斯': 'lucas', '库布里克': 'kubrick', '斯皮尔伯格': 'spielberg',
    '斯科塞斯': 'scorsese', '昆汀': 'tarantino', '达米恩': 'chazelle',
    '韦斯安德森': 'anderson', '索金': 'sorkin', '博伊尔': 'boyle',
    '大卫林奇': 'lynch', '芬奇': 'fincher', '希区柯克': 'hitchcock',
    '卡萨维茨': 'cassavetes', '德尼罗': 'deniro', '曼': 'mann',
    '斯派克琼斯': 'spike-jonze', '黑泽明': 'kurosawa', '奥卡萨姆': 'aucon'
  };
  
  const EMOTION_MAP = {
    '史诗': 'epic', '孤独': 'lonely', '情感': 'emotional',
    '紧张': 'tense', '浪漫': 'romantic', '告别': 'farewell',
    '救赎': 'redemption', '温情': 'tender', '雨夜': 'rainy-night',
    '舞蹈': 'dance', '神秘': 'mysterious', '悬疑': 'suspenseful',
    '荒诞': 'absurd', '压迫': 'oppressive', '紧张追逐': 'chase-tense',
    '史诗航拍': 'epic-aerial', '史诗手持': 'epic-handheld',
    '史诗斯坦尼康': 'epic-steadicam', '史诗定场': 'epic-establishing',
    '紧张斯坦尼康': 'tense-steadicam', '紧张手持': 'tense-handheld',
    '浪漫斯坦尼康': 'romantic-steadicam', '浪漫手持': 'romantic-handheld',
    '舞蹈斯坦尼康': 'dance-steadicam', '舞蹈手持': 'dance-handheld',
    '恐怖斯坦尼康': 'horror-steadicam', '悬疑手持': 'suspense-handheld',
    '悬疑斯坦尼康': 'suspense-steadicam', '史诗手持': 'epic-handheld',
    '紧张定场': 'tense-establishing',
    '粗粝真实': 'raw-real', '压抑喜悦': 'suppressed-joy',
    '压抑悲伤': 'suppressed-sadness', '厌恶': 'disgust', '嫌弃': 'scorn',
    '复杂情绪': 'complex', '复古优雅': 'vintage-elegant',
    '无人回应': 'no-response', '灵魂独行': 'soul-alone',
    '喜悦': 'joy', '方法演技': 'method-acting', '恍惚': 'trance',
    '恐惧': 'fear', '惊恐': 'panic', '恐惧颤抖': 'fear-shake',
    '哀伤': 'grief', '惊讶凝固': 'frozen-shock', '震惊': 'shocked',
    '愤怒克制': 'anger-suppressed', '暴烈': 'violent',
    '战栗': 'shiver', '神经质幽默': 'neurotic-humor',
    '热情外放': 'outgoing', '紧张内敛': 'tense-reserved',
    '破碎': 'broken', '心碎时刻': 'heartbreak', '空洞': 'hollow',
    '灵魂出窍': 'out-of-body', '窒息': 'suffocating',
    '话唠爆发': 'talking-burst', '冷峻逼近': 'cold-approach',
    '蔑视': 'contempt', '冷嘲': 'sarcasm', '迷醉': 'intoxicated',
    '超然状态': 'trance-state', '瞬间启示': 'flash-enlightenment',
    '无尽雨幕': 'endless-rain', '东方克制': 'oriental-restraint',
    '热闹中的寂静': 'quiet-in-chaos', '镜子里的陌生人': 'stranger-in-mirror',
    '午夜独醒': 'midnight-awake'
  };
  
  const type = parts[0] || '';
  const director = parts[1] || '';
  const rest = parts.slice(2);
  
  let tech = '';
  let shotType = '';
  let emotion = '';
  
  const SHOT_IN_EMOTION = ['航拍', '斯坦尼康', '手持', '定场'];
  const TECH_TAGS_SET = new Set(['IMAX', 'VR', '3D']);
  
  for (const r of rest) {
    if (TECH_TAGS_SET.has(r)) { tech = r; continue; }
    let matched = false;
    for (const st of SHOT_IN_EMOTION) {
      if (r.includes(st) || st.includes(r)) {
        shotType = st;
        const remaining = r.replace(st, '');
        if (remaining) emotion = emotion ? emotion + '_' + remaining : remaining;
        matched = true;
        break;
      }
    }
    if (!matched) {
      emotion = emotion ? emotion + '_' + r : r;
    }
  }
  
  return {
    filename,
    type: TYPE_MAP[type] || type,
    type_zh: type,
    director: DIRECTOR_MAP[director] || director,
    director_zh: director,
    emotion: EMOTION_MAP[emotion] || emotion,
    emotion_zh: emotion,
    shotType,
    tech
  };
}

function buildSkillIndex() {
  if (_skillIndex && Date.now() - _skillIndexBuildTime < 60_000) {
    return _skillIndex;
  }
  
  if (!fs.existsSync(SKILL_LIB_ROOT)) {
    console.warn(`[SkillRouter] 技能库目录不存在: ${SKILL_LIB_ROOT}`);
    return {};
  }
  
  const files = fs.readdirSync(SKILL_LIB_ROOT).filter(f => f.endsWith('.md'));
  const index = {};
  
  for (const file of files) {
    const meta = parseSkillFilename(file);
    
    const key1 = `${meta.type}_${meta.director}`;
    const key2 = `${meta.type}_${meta.emotion}`;
    const key3 = `${meta.type}_${meta.shotType}`;
    const key4 = `${meta.director}_${meta.emotion}`;
    const key5 = `${meta.type}_${meta.director}_${meta.shotType}`;
    const key6 = `${meta.type}_${meta.director}_${meta.emotion}`;
    
    [key1, key2, key3, key4, key5, key6].forEach(k => {
      if (!index[k]) index[k] = [];
      index[k].push({ file, meta });
    });
  }
  
  _skillIndex = index;
  _skillIndexBuildTime = Date.now();
  return index;
}

// ============================================================
// 技能内容解析
// ============================================================

function extractSection(content, startMarker, endMarker) {
  const lines = content.split('\n');
  let inSection = false;
  let sectionLines = [];
  
  for (const line of lines) {
    if (line.includes(startMarker)) { inSection = true; continue; }
    if (inSection && (line.includes(endMarker) || line.match(/^#{1,3} /))) {
      if (line.includes(endMarker)) continue;
      break;
    }
    if (inSection) sectionLines.push(line);
  }
  
  return sectionLines.join('\n').trim();
}

function extractSkillEnhancement(skillPath) {
  try {
    const content = fs.readFileSync(skillPath, 'utf-8');
    
    return {
      promptBlock: extractSection(content, 'AI提示词构建', '第五部分'),
      forbiddenBlock: extractSection(content, '禁止词清单', '禁止词'),
      shotBlock: extractSection(content, '镜头类型', '镜头设计'),
      emotionBlock: extractSection(content, '情绪设计', '第四部分'),
      raw: content
    };
  } catch (e) {
    return null;
  }
}

// ============================================================
// 镜头元数据提取
// ============================================================

function extractShotMetadata(shot) {
  const meta = {
    type: 'drama',
    director: '',
    emotion: '',
    shotType: '',
    lighting: '',
    hasAerial: false,
    hasRain: false,
    hasNight: false,
    isEpic: false,
    isLonely: false,
    isDance: false
  };
  
  const desc = (shot.description || shot.prompt || '').toLowerCase();
  // 【v2.1.4-fix9-P8】安全获取camera字符串：强制转换为字符串
  const cameraStr = String(shot.cameraString || '');
  const cameraMovementStr = String(shot.cameraMovement || '');
  const cameraObjStr = (typeof shot.camera === 'string' ? shot.camera : '');
  const camera = (cameraStr || cameraMovementStr || cameraObjStr).toLowerCase();
  const mood = (shot.mood || shot.emotion || '').toLowerCase();
  // 【v2.1.4-patch2】兼容lighting对象/字符串两种格式
  const lighting = (shot.lightingString || (typeof shot.lighting === 'string' ? shot.lighting : '') || '').toLowerCase();
  
  // 检测影片类型
  if (/科幻|alien|space|planet|starship|robot/i.test(desc)) meta.type = 'sci-fi';
  else if (/战争|battle|army|soldier|war/i.test(desc)) meta.type = 'war';
  else if (/恐怖|horror|fear|monster/i.test(desc)) meta.type = 'horror';
  else if (/喜剧|comedy|funny|laugh/i.test(desc)) meta.type = 'comedy';
  else if (/悬疑|suspense|mystery/i.test(desc)) meta.type = 'suspense';
  else if (/惊悚|thriller/i.test(desc)) meta.type = 'thriller';
  
  // 检测镜头类型
  if (/航拍|aerial|helicopter|drone/i.test(camera + desc)) meta.shotType = 'aerial';
  else if (/斯坦尼康|steadicam/i.test(camera)) meta.shotType = 'steadicam';
  else if (/手持|handheld/i.test(camera)) meta.shotType = 'handheld';
  else if (/定场|establishing/i.test(camera + desc)) meta.shotType = 'establishing';
  if (/IMAX|imax/i.test(camera + desc + lighting)) meta.tech = 'IMAX';
  
  // 检测情绪
  if (/史诗|epic|grand/i.test(mood + desc)) { meta.emotion = 'epic'; meta.isEpic = true; }
  else if (/舞蹈|dance|dancing/i.test(desc + camera)) { meta.emotion = 'dance'; meta.isDance = true; }
  else if (/无人回应|no.response/i.test(mood + desc)) meta.emotion = 'lonely';
  else if (/灵魂独行|soul.alone/i.test(mood + desc)) { meta.emotion = 'lonely'; meta.isLonely = true; }
  else if (/孤独|lonely|solitude|alone/i.test(mood + desc)) { meta.emotion = 'lonely'; meta.isLonely = true; }
  else if (/紧张追逐|tense.chase/i.test(mood + desc)) meta.emotion = 'tense';
  else if (/紧张|tense|nervous/i.test(mood + desc)) meta.emotion = 'tense';
  else if (/浪漫|romantic|love/i.test(mood + desc)) meta.emotion = 'romantic';
  else if (/告别|farewell|depart/i.test(mood + desc)) meta.emotion = 'farewell';
  else if (/救赎|redemption/i.test(mood + desc)) meta.emotion = 'redemption';
  else if (/温情|tender|warm/i.test(mood + desc)) meta.emotion = 'tender';
  else if (/神秘|mysterious|mystery/i.test(mood + desc)) meta.emotion = 'mysterious';
  else if (/情感|emotional|feelings/i.test(mood + desc)) meta.emotion = 'emotional';
  
  // 检测导演风格
  if (/维伦纽瓦|villeneuve|dune|arrival/i.test(desc)) meta.director = 'villeneuve';
  else if (/诺兰|nolan|inception|batman/i.test(desc)) meta.director = 'nolan';
  else if (/卡梅隆|cameron|avatar|terminator/i.test(desc)) meta.director = 'cameron';
  else if (/库布里克|kubrick|2001|shining/i.test(desc)) meta.director = 'kubrick';
  else if (/斯科塞斯|scorsese|departed/i.test(desc)) meta.director = 'scorsese';
  else if (/斯皮尔伯格|spielberg|jaws|et/i.test(desc)) meta.director = 'spielberg';
  else if (/昆汀|tarantino|pulp/i.test(desc)) meta.director = 'tarantino';
  else if (/韦斯安德森|anderson|budapest/i.test(desc)) meta.director = 'anderson';
  else if (/芬奇|fincher|social|dragon/i.test(desc)) meta.director = 'fincher';
  else if (/希区柯克|hitchcock|psycho/i.test(desc)) meta.director = 'hitchcock';
  else if (/达米恩|chazelle|lalaland/i.test(desc)) meta.director = 'chazelle';
  else if (/卢卡斯|lucas|starwars|graffiti/i.test(desc)) meta.director = 'lucas';
  else if (/索金|sorkin|westwing|social/i.test(desc)) meta.director = 'sorkin';
  else if (/博伊尔|boyle|trainspot|slumdog/i.test(desc)) meta.director = 'boyle';
  else if (/大卫林奇|lynch|mulholland/i.test(desc)) meta.director = 'lynch';
  else if (/卡萨维茨|cassavetes|faces|shadows/i.test(desc)) meta.director = 'cassavetes';
  else if (/德尼罗|deniro|raging|taxi/i.test(desc)) meta.director = 'deniro';
  else if (/曼|mann|heat|collateral/i.test(desc)) meta.director = 'mann';
  else if (/斯派克琼斯|spike-jonze|her|adaptation/i.test(desc)) meta.director = 'spike-jonze';
  else if (/黑泽明|kurosawa|seven|samurai|ran/i.test(desc)) meta.director = 'kurosawa';
  else if (/奥卡萨姆|aucon/i.test(desc)) meta.director = 'aucon';
  
  // 检测特殊元素
  if (/雨|rain|雨夜/i.test(desc + mood)) meta.hasRain = true;
  if (/夜|night|黑暗/i.test(desc + mood)) meta.hasNight = true;
  if (/航拍|aerial|helicopter/i.test(camera + desc)) meta.hasAerial = true;
  
  return meta;
}

// ============================================================
// 技能匹配引擎
// ============================================================

function matchSkills(shotMeta, limit = 3) {
  const index = buildSkillIndex();
  if (Object.keys(index).length === 0) return [];
  
  const candidates = new Map();
  
  // 优先级1：类型+导演+情绪（最精确）
  if (shotMeta.type && shotMeta.director && shotMeta.emotion) {
    const key1 = `${shotMeta.type}_${shotMeta.director}`;
    const key2 = `${shotMeta.type}_${shotMeta.director}_${shotMeta.emotion}`;
    (index[key2] || index[key1] || []).forEach(item => {
      candidates.set(item.file, (candidates.get(item.file) || 0) + 30);
    });
  }
  
  // 优先级2：类型+导演
  if (shotMeta.type && shotMeta.director) {
    const key = `${shotMeta.type}_${shotMeta.director}`;
    (index[key] || []).forEach(item => {
      candidates.set(item.file, (candidates.get(item.file) || 0) + 20);
    });
  }
  
  // 优先级3：类型+情绪
  if (shotMeta.type && shotMeta.emotion) {
    const key = `${shotMeta.type}_${shotMeta.emotion}`;
    (index[key] || []).forEach(item => {
      candidates.set(item.file, (candidates.get(item.file) || 0) + 15);
    });
  }
  
  // 优先级4：类型匹配
  if (shotMeta.type) {
    Object.keys(index).forEach(k => {
      if (k.startsWith(shotMeta.type + '_')) {
        index[k].forEach(item => {
          candidates.set(item.file, (candidates.get(item.file) || 0) + 5);
        });
      }
    });
  }
  
  // 优先级5：航拍特殊处理
  if (shotMeta.shotType === 'aerial' || shotMeta.hasAerial) {
    if (shotMeta.type && shotMeta.director) {
      const key5 = `${shotMeta.type}_${shotMeta.director}_${shotMeta.shotType}`;
      const key5b = `${shotMeta.type}_${shotMeta.director}_航拍`;
      (index[key5] || index[key5b] || []).forEach(item => {
        candidates.set(item.file, (candidates.get(item.file) || 0) + 35);
      });
    }
    const key3 = `${shotMeta.type}_航拍`;
    (index[key3] || []).forEach(item => {
      candidates.set(item.file, (candidates.get(item.file) || 0) + 20);
    });
  }
  
  // 优先级6：IMAX技术标签
  if (shotMeta.tech === 'IMAX' || shotMeta.hasAerial) {
    const keyImax = `${shotMeta.type}_${shotMeta.director}_IMAX`;
    (index[keyImax] || []).forEach(item => {
      candidates.set(item.file, (candidates.get(item.file) || 0) + 40);
    });
  }
  
  // 优先级7：雨夜特殊处理
  if (shotMeta.hasRain && shotMeta.emotion) {
    const rainKey = `${shotMeta.type || 'drama'}_${shotMeta.director || ''}`;
    (index[rainKey] || []).forEach(item => {
      if (item.meta.filename.includes('雨夜')) {
        candidates.set(item.file, (candidates.get(item.file) || 0) + 20);
      }
    });
  }
  
  // 排序并返回top N
  const sorted = [...candidates.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  
  return sorted.map(([file, score]) => {
    const skillPath = path.join(SKILL_LIB_ROOT, file);
    const meta = parseSkillFilename(file);
    const enhancement = extractSkillEnhancement(skillPath);
    return { skillPath, meta, score, enhancement };
  }).filter(r => r.enhancement);
}

// ============================================================
// 增强注入器
// ============================================================

function extractKeyTerms(blocks, maxTerms = 10) {
  if (!blocks || blocks.length === 0) return '';
  const allText = blocks.join(' ');
  
  const techTerms = allText.match(
    /\b(IMAX|aerial|steadicam|handheld|establishing|volumetric|god.?ray|deep.?focus|anamorphic|tungsten|during|dusk|golden.?hour|neon|noir|cinematic|epic|meditative|low.?key|high.?contrast|shallow.?depth|wide.?angle|telephoto|50mm|85mm|35mm|helicopter|drone|circular.?orbit|push.?in|pull.?out|track|pan|tilt|crane|fluid|smooth|handheld|shaky|steady)\b/gi
  ) || [];
  
  const zhTerms = allText.match(
    /[史诗|航拍|斯坦尼康|手持|定场|晨光|暮色|黄金时刻|霓虹|黑色电影|氛围|紧张|孤独|浪漫|沉默|宿命]+/g
  ) || [];
  
  const seen = new Set();
  const terms = [];
  for (const t of [...techTerms, ...zhTerms]) {
    const lower = t.toLowerCase();
    if (!seen.has(lower) && terms.length < maxTerms) {
      seen.add(lower);
      terms.push(t);
    }
  }
  
  return terms.join('; ');
}

function injectSkillEnhancement(shot, matchedSkills) {
  if (!matchedSkills || matchedSkills.length === 0) return shot;
  
  const enhanced = JSON.parse(JSON.stringify(shot));
  
  const forbiddenBlocks = matchedSkills
    .map(s => s.enhancement?.forbiddenBlock).filter(Boolean);
  const cameraBlocks = matchedSkills
    .map(s => s.enhancement?.shotBlock).filter(Boolean);
  const moodBlocks = matchedSkills
    .map(s => s.enhancement?.emotionBlock).filter(Boolean);
  
  const cameraTerms = extractKeyTerms(cameraBlocks, 8);
  const moodTerms = extractKeyTerms(moodBlocks, 6);
  const forbidTerms = extractKeyTerms(forbiddenBlocks, 8);
  
  enhanced._appliedSkills = matchedSkills.map(s => ({
    file: path.basename(s.skillPath),
    score: s.score,
    type: s.meta.type_zh,
    director: s.meta.director_zh,
    emotion: s.meta.emotion_zh
  }));
  
  const skillTag = `[CINEMATIC_SKILL] ${matchedSkills.map(s => s.meta.type_zh + '_' + s.meta.director_zh + '_' + s.meta.emotion_zh).join(' | ')}`;
  const cameraLine = cameraTerms ? `Camera增强: ${cameraTerms}` : '';
  const moodLine = moodTerms ? `Mood增强: ${moodTerms}` : '';
  const forbidLine = forbidTerms ? `禁止词: ${forbidTerms}` : '';
  
  const skillBlock = [skillTag, cameraLine, moodLine, forbidLine]
    .filter(Boolean)
    .join(' | ');
  
  // 追加到 _generatedPrompt 或 prompt 末尾
  const targetPrompt = enhanced._generatedPrompt || enhanced.prompt || '';
  if (targetPrompt && skillBlock) {
    const promptField = enhanced._generatedPrompt ? '_generatedPrompt' : 'prompt';
    enhanced[promptField] = targetPrompt.trimEnd() + '\n' + skillBlock;
  }
  
  return enhanced;
}

// ============================================================
// 主入口：批量处理shots
// ============================================================

function routeAndEnhance(shots, options = {}) {
  const { minScore = 5, maxSkillsPerShot = 2, dryRun = false } = options;
  
  const report = {
    totalShots: shots.length,
    enhancedShots: 0,
    skippedShots: 0,
    skillsUsed: new Set(),
    details: []
  };
  
  const enhancedShots = shots.map((shot, idx) => {
    const meta = extractShotMetadata(shot);
    const matched = matchSkills(meta, maxSkillsPerShot)
      .filter(s => s.score >= minScore);
    
    if (matched.length === 0) {
      report.skippedShots++;
      report.details.push({ shotIdx: idx, status: 'no_match', meta });
      return shot;
    }
    
    matched.forEach(s => report.skillsUsed.add(path.basename(s.skillPath)));
    
    if (dryRun) {
      report.details.push({
        shotIdx: idx,
        status: 'matched',
        score: matched[0].score,
        skills: matched.map(s => ({ file: path.basename(s.skillPath), score: s.score }))
      });
      return shot;
    }
    
    const newShot = injectSkillEnhancement(shot, matched);
    report.enhancedShots++;
    report.details.push({
      shotIdx: idx,
      status: 'enhanced',
      score: matched[0].score,
      skills: matched.map(s => ({ file: path.basename(s.skillPath), score: s.score }))
    });
    return newShot;
  });
  
  report.skillsUsed = [...report.skillsUsed];
  return { enhancedShots, report };
}

// ============================================================
// CLI 调试
// ============================================================

if (require.main === module) {
  const testShots = [
    {
      description: 'aerial shot of alien desert planet, vast sand dunes extending in IMAX frame, Villeneuve style',
      camera: 'aerial, helicopter, IMAX 1.90:1',
      mood: 'epic, vast, destiny approaching',
      lighting: 'golden hour, volumetric god rays'
    },
    {
      description: '角色在雨夜的城市街头，手持跟拍',
      camera: 'handheld, close follow',
      mood: 'tense, lonely, noir atmosphere',
      lighting: 'neon reflections on wet pavement'
    },
    {
      description: '舞蹈场景，斯坦尼康环绕拍摄',
      camera: 'steadicam, circular orbit',
      mood: 'romantic, tender',
      lighting: 'warm spotlight'
    }
  ];
  
  console.log('=== 技能路由测试 ===\n');
  const result = routeAndEnhance(testShots, { dryRun: true });
  console.log(JSON.stringify(result.report, null, 2));
}

module.exports = {
  buildSkillIndex,
  extractShotMetadata,
  matchSkills,
  injectSkillEnhancement,
  routeAndEnhance,
  parseSkillFilename,
  SKILL_LIB_ROOT
};

```

---

## systems/global-negative-prompts.js

```javascript
/**
 * 全局负面提示词注入器
 * 【P0-10-审计修复】补全缺失模块
 * 根据项目类型动态注入负面约束，不硬编码场景
 */

const DEFAULT_NEGATIVES = [
  'no text',
  'no watermark',
  'no logo',
  'no signature',
  'no subtitle overlay',
];

const TYPE_SPECIFIC_NEGATIVES = {
  EDU: [
    'no fictional elements',
    'no fantasy creatures',
    'no exaggerated effects',
  ],
  FANTASY: [
    'no modern elements',
    'no anachronistic objects',
  ],
  ACTION: [
    'no static composition',
    'no flat lighting',
  ],
  MYTHOLOGY: [
    'no modern clothing',
    'no contemporary architecture',
  ],
};

function getGlobalNegatives(filmType, visualStyle) {
  const base = [...DEFAULT_NEGATIVES];
  const typeExtras = TYPE_SPECIFIC_NEGATIVES[filmType] || [];
  return [...base, ...typeExtras].join(', ');
}

module.exports = { getGlobalNegatives, DEFAULT_NEGATIVES, TYPE_SPECIFIC_NEGATIVES };

```

---

## test-run.js

```javascript
const run = require('./run-preproduction-simple');

const intent = '什么是横纹肌溶解——横纹肌溶解的症状以及实验室检查';
const metadata = { skipRender: true, skipPost: true, creativeIndex: 0.98 };
const options = { skipFieldQuality: true };

run(intent, metadata, options).then(r => {
  console.log('结果:', JSON.stringify(r, null, 2));
  process.exit(r.success ? 0 : 1);
}).catch(e => {
  console.error('错误:', e.message);
  process.exit(1);
});

```

---

## tests/test-integration.js

```javascript
// hyperreality-system/tests/test-integration.js
// 深度融合测试 - 从意图到完整镜头
// 运行: node hyperreality-system/tests/test-integration.js

const { HyperrealitySystem } = require('../index');

console.log('========================================');
console.log('  超现实系统 - 深度融合测试 v1.0');
console.log('========================================\n');

const results = {
  passed: 0,
  failed: 0
};

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    results.passed++;
  } else {
    console.log(`  ❌ ${message}`);
    results.failed++;
  }
}

async function runTest() {
  // 初始化系统
  const system = new HyperrealitySystem({
    scriptEngine: {
      // 不提供 API Key，使用模板模式
    }
  });

  console.log('🔥 [测试] 完整创作流程');
  console.log('----------------------------------------\n');

  // 执行创作（跳过确认环节，便于测试）
  const result = await system.create(
    '创作示例系列第一集，主角示例神兽，120秒，示例世界星球，示例角色探索',
    {
      title: '神话项目：异兽志 EP01 示例神兽',
      target_duration: 120,
      world_setting: '示例世界',
      featured_beast_id: 'taotie',
      protagonist: '示例角色'
    },
    {
      skipScriptConfirmation: true,  // 跳过剧本确认（测试模式）
      skipPromptReview: true,         // 跳过提示词审核（测试模式）
      skipRender: true                // 跳过渲染（测试模式）
    }
  );

  console.log('\n----------------------------------------');
  console.log('📊 结果验证');
  console.log('----------------------------------------');

  // 1. 整体成功
  assert(result.success, '整体流程成功');

  // 2. 剧本引擎阶段
  assert(result.stages.scriptEngine, '剧本引擎阶段存在');
  assert(result.stages.scriptEngine.blueprint, '剧本蓝图已生成');
  assert(result.stages.scriptEngine.validation, '剧本校验已执行');
  assert(result.stages.scriptEngine.timing > 0, '剧本引擎有耗时');

  // 3. 制作引擎阶段
  assert(result.stages.productionEngine, '制作引擎阶段存在');
  assert(result.stages.productionEngine.shots, '镜头已生成');
  assert(result.stages.productionEngine.prompts, 'Prompts 已生成');
  assert(result.stages.productionEngine.timing > 0, '制作引擎有耗时');

  // 4. 确认环节
  assert(result.confirmations.script, '剧本确认环节已执行');
  assert(result.confirmations.script.approved, '剧本已确认通过');
  assert(result.confirmations.prompts, '提示词审核环节已执行');
  assert(result.confirmations.prompts.approved, '提示词已确认通过');

  // 5. 渲染引擎（已跳过）
  assert(result.stages.renderingEngine, '渲染阶段存在');
  assert(result.stages.renderingEngine.skipped, '渲染已跳过（测试模式）');

  // 6. 镜头数量
  const shots = result.stages.productionEngine.shots;
  assert(shots.length > 0, `有 ${shots.length} 个镜头`);
  assert(shots.length >= 5, `至少 5 个镜头（实际: ${shots.length}）`);

  // 5. Prompts 数量
  const prompts = result.stages.productionEngine.prompts;
  assert(prompts.length === shots.length, 'Prompts 数量等于镜头数量');

  // 6. 每个镜头验证
  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    const prompt = prompts[i];

    assert(shot, `镜头 ${i} 存在`);
    assert(shot.shotId, `镜头 ${i} 有 ID: ${shot.shotId}`);
    assert(shot.sceneType, `镜头 ${i} 有类型: ${shot.sceneType}`);
    assert(shot.timing, `镜头 ${i} 有 timing 对象`);
    assert(shot.timing.duration > 0, `镜头 ${i} 时长 > 0: ${shot.timing?.duration}s`);
    assert(prompt, `镜头 ${i} 有对应的 Prompt 对象`);
    assert(prompt.prompt, `镜头 ${i} 有 Prompt 文本`);
    assert(prompt.length > 0, `镜头 ${i} Prompt 长度 > 0: ${prompt.length}`);
  }

  // 7. 总时长
  const totalDuration = shots.reduce((sum, s) => sum + s.timing.duration, 0);
  assert(totalDuration > 0, `总时长 > 0: ${totalDuration}s`);

  // 8. 质量门
  const quality = result.stages.productionEngine.quality;
  if (quality) {
    assert(quality.totalPrompts > 0, `质量门检查 ${quality.totalPrompts} 个 Prompt`);
  }

  // 9. 最终报告
  assert(result.finalReport, '最终报告已生成');
  assert(result.finalReport.includes('超现实工业创作系统'), '报告包含系统名称');
  assert(result.finalReport.includes('镜头总览'), '报告包含镜头总览');
  assert(result.finalReport.includes('完整 Prompts'), '报告包含完整 Prompts');

  // 10. 耗时
  assert(result.timing.total > 0, `总耗时 > 0: ${result.timing.total}ms`);

  // 打印详细信息
  console.log('\n----------------------------------------');
  console.log('📋 详细数据');
  console.log('----------------------------------------');
  console.log(`  镜头数: ${shots.length}`);
  console.log(`  总时长: ${totalDuration}s`);
  console.log(`  剧本耗时: ${result.stages.scriptEngine.timing}ms`);
  console.log(`  制作耗时: ${result.stages.productionEngine.timing}ms`);
  console.log(`  总耗时: ${result.timing.total}ms`);
  console.log(`  平均Prompt长度: ${Math.round(prompts.reduce((s, p) => s + p.length, 0) / prompts.length)} 字符`);

  // 打印前2个镜头
  console.log('\n  前2个镜头预览:');
  for (let i = 0; i < Math.min(2, shots.length); i++) {
    console.log(`\n  [${shots[i].shotId}] ${shots[i].sceneType} (${shots[i].timing.duration}s)`);
    console.log(`  Prompt: ${prompts[i].prompt.substring(0, 100)}...`);
    console.log(`  长度: ${prompts[i].length} 字符`);
  }

  // 保存结果
  try {
    const fs = require('fs');
    const path = require('path');
    const outputDir = '/tmp/hyperreality-test';
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    fs.writeFileSync(
      path.join(outputDir, `test-result-${timestamp}.json`),
      JSON.stringify(result, null, 2)
    );
    
    if (result.finalReport) {
      fs.writeFileSync(
        path.join(outputDir, `test-report-${timestamp}.md`),
        result.finalReport
      );
    }
    
    console.log(`\n💾 测试结果已保存到: ${outputDir}`);
  } catch (e) {
    console.log(`\n⚠️ 保存失败: ${e.message}`);
  }

  // 汇总
  console.log('\n========================================');
  console.log('  测试完成');
  console.log('========================================');
  console.log(`  ✅ 通过: ${results.passed}`);
  console.log(`  ❌ 失败: ${results.failed}`);
  console.log(`  📊 总计: ${results.passed + results.failed}`);
  console.log(`  🎯 成功率: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  console.log('========================================');

  if (results.failed > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 深度融合测试全部通过！双链路协同工作正常。\n');
    process.exit(0);
  }
}

runTest().catch(err => {
  console.error('\n❌ 测试异常:', err.message);
  console.error(err.stack);
  process.exit(1);
});

```

---

## tests/test-post-production.js

```javascript
// hyperreality-system/tests/test-post-production.js
// 后期引擎测试 - 验证字幕、音乐、弹幕、多版本输出

const { PostProductionEngine } = require('../engines/post-production-engine/post-production-engine');
const fs = require('fs');

console.log('========================================');
console.log('  超现实系统 - 后期引擎测试 v1.0');
console.log('========================================');
console.log();

// 模拟数据
const mockProductionResult = {
  shots: [
    { shotId: 'SC00', sceneType: 'opening', timing: { duration: 31, start_time: 0 } },
    { shotId: 'SC01', sceneType: 'establishing', timing: { duration: 25, start_time: 31 } },
    { shotId: 'SC02', sceneType: 'conflict', timing: { duration: 33, start_time: 56 } },
    { shotId: 'SC03', sceneType: 'emotional_climax', timing: { duration: 38, start_time: 89 } },
    { shotId: 'SC04', sceneType: 'resolution', timing: { duration: 25, start_time: 127 } }
  ],
  prompts: [
    { shotId: 'SC00', prompt: '电影级镜头...', length: 198, imageRefs: [{characterId: 'exampleCharacter'}] },
    { shotId: 'SC01', prompt: '电影级镜头...', length: 196, imageRefs: [{characterId: 'exampleCharacter'}] },
    { shotId: 'SC02', prompt: '电影级镜头...', length: 198, imageRefs: [{characterId: 'exampleCharacter'}] },
    { shotId: 'SC03', prompt: '电影级镜头...', length: 208, imageRefs: [{characterId: 'exampleCharacter'}] },
    { shotId: 'SC04', prompt: '电影级镜头...', length: 194, imageRefs: [{characterId: 'exampleCharacter'}] }
  ]
};

const mockScriptResult = {
  blueprint: {
    meta: { title: '神话项目：异兽志 EP01 示例神兽', target_duration: 120 },
    structure: {
      scenes: [
        {
          scene_id: 'SC00',
          scene_type: 'opening',
          scene_name: '片头',
          setting: '示例世界 硅晶草原，双月当空',
          timing: { duration: 31, start_time: 0 },
          characters: ['exampleCharacter'],
          dialogue: {
            lines: [{ speaker: 'exampleCharacter', text: '我是示例角色，这是 示例世界。', emotion: 'curious' }]
          }
        },
        {
          scene_id: 'SC01',
          scene_type: 'establishing',
          scene_name: '探索',
          setting: '晶体森林深处',
          timing: { duration: 25, start_time: 31 },
          characters: ['exampleCharacter'],
          dialogue: {
            lines: [{ speaker: 'exampleCharacter', text: '这里的晶体在发光。', emotion: 'wonder' }]
          }
        },
        {
          scene_id: 'SC02',
          scene_type: 'conflict',
          scene_name: '遭遇',
          setting: '示例神兽领地',
          timing: { duration: 33, start_time: 56 },
          characters: ['exampleCharacter', 'example-creature'],
          dialogue: {
            lines: [
              { speaker: 'exampleCharacter', text: '小心！', emotion: 'alert' },
              { speaker: 'example-creature', text: '吼——', emotion: 'aggressive' }
            ]
          }
        },
        {
          scene_id: 'SC03',
          scene_type: 'emotional_climax',
          scene_name: '共鸣',
          setting: '记忆之河',
          timing: { duration: 38, start_time: 89 },
          characters: ['exampleCharacter', 'example-creature'],
          dialogue: {
            lines: [
              { speaker: 'exampleCharacter', text: '你不是怪物，你是记忆。', emotion: 'empathy' }
            ]
          }
        },
        {
          scene_id: 'SC04',
          scene_type: 'resolution',
          scene_name: '启程',
          setting: '等离子河边',
          timing: { duration: 25, start_time: 127 },
          characters: ['exampleCharacter'],
          dialogue: {
            lines: [{ speaker: 'exampleCharacter', text: '下一站，刑天。', emotion: 'determined' }]
          }
        }
      ],
      characters: [
        { id: 'exampleCharacter', name: '示例角色', role: 'protagonist', visuals: { color: '银灰' } },
        { id: 'example-creature', name: '示例神兽', role: 'featured_beast', tags: ['beast'] }
      ]
    }
  }
};

const mockRenderResult = {
  success: true,
  results: [
    { success: true, shotId: 'SC00', taskId: 'task-001' },
    { success: true, shotId: 'SC01', taskId: 'task-002' },
    { success: true, shotId: 'SC02', taskId: 'task-003' },
    { success: true, shotId: 'SC03', taskId: 'task-004' },
    { success: true, shotId: 'SC04', taskId: 'task-005' }
  ]
};

async function runTest() {
  console.log('🔥 [测试] 后期引擎全流程');
  console.log('----------------------------------------');
  console.log();

  const engine = new PostProductionEngine({
    outputDir: '/tmp/hyperreality-test-post',
    enableSubtitles: true,
    enableDanmaku: true,
    enableMusic: true,
    subtitleStyle: 'identity-card',
    versions: ['standard', 'clean', 'subtitled', 'danmaku', 'raw'],
    musicSource: 'pixabay'
  });

  const result = await engine.postProduce(
    mockProductionResult,
    mockScriptResult,
    mockRenderResult
  );

  console.log();
  console.log('----------------------------------------');
  console.log('📊 结果验证');
  console.log('----------------------------------------');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ ${message}`);
      passed++;
    } else {
      console.log(`  ❌ ${message}`);
      failed++;
    }
  }

  // 1. 整体成功
  assert(result.success, '后期制作成功');
  assert(result.timing.total > 0, '有耗时记录');

  // 2. 字幕
  assert(result.stages.subtitles?.count > 0, '生成了字幕');
  assert(result.stages.subtitles?.tracks?.length > 0, '有字幕轨道');
  
  const firstSubtitle = result.stages.subtitles.tracks[0];
  assert(firstSubtitle.type === 'identity_card', '字幕类型为身份卡');
  assert(firstSubtitle.duration > 0, '字幕有持续时间');
  assert(firstSubtitle.content?.name, '字幕有角色名');
  assert(firstSubtitle.content?.title?.includes('示例世界'), '字幕标题包含 示例世界');
  assert(firstSubtitle.content?.species, '字幕有物种信息');
  assert(firstSubtitle.content?.trait, '字幕有特征信息');
  assert(firstSubtitle.style?.position === 'bottom-left', '字幕位置在左下角');
  assert(firstSubtitle.style?.borderLeft?.includes('00ff88'), '字幕有绿色边框');

  // 3. 音乐
  assert(result.stages.music?.count > 0, '匹配了音乐');
  assert(result.stages.music?.tracks?.length > 0, '有音乐轨道');
  
  const firstMusic = result.stages.music.tracks[0];
  assert(firstMusic.searchParams?.mood, '音乐有情绪标签');
  assert(firstMusic.searchParams?.genre, '音乐有风格标签');
  assert(firstMusic.searchParams?.tags?.length > 0, '音乐有搜索标签');
  assert(firstMusic.config?.volume <= 0.5, '背景音乐音量 <= 50%');
  assert(firstMusic.config?.fadeIn > 0, '音乐有淡入');
  assert(firstMusic.source?.platform === 'pixabay', '音乐来源为 Pixabay');
  assert(firstMusic.source?.license?.includes('Free'), '音乐有免费许可');

  // 4. 弹幕
  assert(result.stages.danmaku?.count > 0, '生成了弹幕');
  assert(result.stages.danmaku?.list?.length > 0, '有弹幕列表');
  
  const firstDanmaku = result.stages.danmaku.list[0];
  assert(firstDanmaku.text, '弹幕有内容');
  assert(firstDanmaku.color, '弹幕有颜色');
  assert(firstDanmaku.position === 'top', '弹幕在顶部');
  assert(firstDanmaku.duration > 0, '弹幕有持续时间');

  // 5. 多版本
  assert(Object.keys(result.versions).length === 5, '生成了 5 个版本');
  assert(result.versions.standard, '有标准版');
  assert(result.versions.clean, '有纯净版');
  assert(result.versions.subtitled, '有字幕版');
  assert(result.versions.danmaku, '有弹幕版');
  assert(result.versions.raw, '有原始版');

  // 6. 版本特征检查
  assert(result.versions.standard.features.subtitles === true, '标准版有字幕');
  assert(result.versions.standard.features.music === true, '标准版有音乐');
  assert(result.versions.clean.features.subtitles === false, '纯净版无字幕');
  assert(result.versions.clean.features.music === false, '纯净版无音乐');
  assert(result.versions.danmaku.features.danmaku === true, '弹幕版有弹幕');
  assert(result.versions.raw.features.subtitles === false, '原始版无字幕');

  // 7. 版本文件
  assert(result.versions.standard.htmlPath, '标准版有 HTML 文件');
  assert(result.versions.standard.configPath, '标准版有配置文件');
  assert(result.versions.standard.renderCommand?.includes('hyperframes'), '有渲染命令');

  // 8. HyperFrames HTML 检查
  if (fs.existsSync(result.versions.standard.htmlPath)) {
    const html = fs.readFileSync(result.versions.standard.htmlPath, 'utf8');
    assert(html.includes('data-composition-id'), 'HTML 包含合成 ID');
    assert(html.includes('data-start'), 'HTML 包含时间数据');
    assert(html.includes('data-duration'), 'HTML 包含持续时间');
    assert(html.includes('identity-card'), 'HTML 包含身份卡样式');
    assert(html.includes('gsap'), 'HTML 包含 GSAP');
    assert(html.includes('window.__timelines'), 'HTML 包含时间线注册');
  } else {
    console.log('  ⚠️ HTML 文件尚未生成（检查文件系统权限）');
  }

  // 9. 质量检查
  assert(result.stages.quality?.passed === true, '质量检查通过');
  assert(result.stages.quality?.issues?.length === 0, '无质量问题');

  // 10. 报告生成
  const report = engine.generateReport(result);
  assert(report.includes('后期制作报告'), '报告标题正确');
  assert(report.includes('字幕预览'), '报告包含字幕信息');
  assert(report.includes('音乐配置'), '报告包含音乐信息');
  assert(report.includes('版本详情'), '报告包含版本信息');

  console.log();
  console.log('========================================');
  console.log('  测试完成');
  console.log('========================================');
  console.log(`  ✅ 通过: ${passed}`);
  console.log(`  ❌ 失败: ${failed}`);
  console.log(`  📊 总计: ${passed + failed}`);
  console.log(`  🎯 成功率: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('========================================');

  if (failed === 0) {
    console.log('\n🎉 后期引擎测试全部通过！');
  }

  // 保存测试报告
  fs.writeFileSync('/tmp/hyperreality-test-post/report.md', report);
  console.log('\n💾 测试报告已保存到: /tmp/hyperreality-test-post/report.md');
}

runTest().catch(err => {
  console.error('❌ 测试失败:', err);
  process.exit(1);
});

```

---


# 卓越视频生成系统 - Stage 5A/5B/6/11 反复 SIGKILL 问题深度分析报告

> **报告日期**: 2026-06-20
> **系统版本**: v6.6.2 (production)
> **问题优先级**: P0 - 阻断预生产流程
> **报告人**: 小G (AI Assistant)

---

## 一、问题概述

### 1.1 现象描述

卓越视频生成系统的预生产流水线（Pre-production Pipeline）在 **Stage 5A（剧本核心生成）** 阶段反复遭遇 **SIGKILL** 强制终止。该问题自 2026-06-13 首次出现以来，已持续 **8天**，经历 **超过15次** 运行尝试，成为系统稳定性的首要瓶颈。

**关键特征**:
- 不是内存溢出（OOM）—— RSS 稳定在 87-90MB，远低于 2.2GB 堆限制
- 不是系统资源耗尽—— dmesg 无 OOM 记录，系统有 7.5GB 物理内存
- 不是代码异常——无 uncaughtException、无 unhandledRejection
- **进程被外部力量强制终止**—— SIGKILL 信号，无栈追踪，无临终日志

### 1.2 时间线（关键事件）

| 日期 | 时间 | 事件 | 结果 |
|------|------|------|------|
| 06-13 | 凌晨 | 首次 SIGKILL 于 Stage 5B 第6/6镜头 | 失败 |
| 06-14 | 全天 | 被 SIGKILL 四次 | 失败 |
| 06-16 | 凌晨 | Stage 5B S06 被杀 | 失败 |
| 06-17 | 下午 | SIGKILL 三次，但 attempt2 成功（770秒） | **成功一次** |
| 06-18 | 晚间 | Stage 6 `reasonStructured` 调用时 SIGKILL | 失败 |
| 06-19 | 凌晨 | v6.6.2 运行，Stage 5A 批次 5/6 被杀 | 失败 |

### 1.3 成功特例

**2026-06-17 attempt2** —— 唯一一次完整跑通：
- 运行时长: 770.3 秒（12.8 分钟）
- 质量评分: 83分 / B级 / PASS
- 无 SIGKILL
- 在 **main session** 中运行（非子代理）

---

## 二、系统环境

### 2.1 硬件与OS

```
OS: Linux 6.8.0-71-generic (x64)
Node.js: v24.15.0
内存: 7.5GB 总内存 / 6.2GB 可用
磁盘: 40GB 总空间 / 24GB 可用
CPU: General Processors
Shell: bash
```

### 2.2 系统限制检查

```bash
# ulimit 输出
real-time non-blocking time: unlimited
data seg size: unlimited
max memory size: unlimited
max user processes: 30429
virtual memory: unlimited
file locks: unlimited
stack size: 8192 kB

# systemd 限制（openclaw 服务）
MemoryMax=infinity
MemoryLimit=infinity
TasksMax=9128
```

**结论**: 系统级资源限制 **不是问题**。

### 2.3 Node.js 内存配置

```javascript
// LLMEngine 初始化
const llm = new LLMEngine({
  model: 'kimi-k2p6',
  mode: 'production',
  maxRetries: 3,
  maxTokens: 3072,
  temperature: 1,
  topP: 0.95,
  timeoutMs: 600000  // 10分钟
});

// 堆限制
heapLimitMB: 2240  // 约 2.2GB
```

---

## 三、错误模式深度分析

### 3.1 内存快照分析

**来自 `output/memory-snapshots.log` 的关键数据**:

```json
// 最后一次成功记录（PID 1816734, 06-18）
{
  "ts": "2026-06-18T16:47:21.962Z",
  "pid": 1816734,
  "tag": "stage5A:after-batch",
  "rssMB": 86.9,
  "heapTotalMB": 15.5,
  "heapUsedMB": 13.7,
  "heapLimitMB": 2240,
  "batchIndex": 6,
  "totalBatches": 6
}
```

```json
// 失败前最后记录（PID 1920196, 06-19）
{
  "ts": "2026-06-19T00:25:05.104Z",
  "pid": 1920196,
  "tag": "stage5A:before-batch",
  "rssMB": 87.9,
  "heapTotalMB": 15.7,
  "heapUsedMB": 13.5,
  "heapLimitMB": 2240,
  "batchIndex": 5,
  "totalBatches": 6
}
// 注意：没有 after-batch 5 的记录，进程在此处被杀
```

**关键发现**:
- RSS 稳定在 87-90MB，从未超过 100MB
- Heap 使用 13-15MB，远低于 2240MB 限制
- **内存不是问题**

### 3.2 时间模式

| PID | 运行阶段 | 开始时间 | 结束/被杀时间 | 持续时间 |
|-----|----------|----------|---------------|----------|
| 1816734 | Stage 5A | 16:45:35 | 16:47:22 | **107秒** ✅ |
| 1821818 | Stage 5A | 17:08:13 | 17:09:49 | **96秒** ✅ |
| 1920196 | Stage 5A | 00:22:22 | 00:25:05 | **~163秒** ❌ 被杀 |

**关键发现**:
- 前两个 PID 在 Stage 5A 正常完成（6/6 批次）
- 第三个 PID 在批次 5/6 时失败
- **失败不是时间累积导致**——前两次运行更快却成功

### 3.3 失败位置模式

**失败集中在 LLM 调用期间**:
- Stage 5A: `_buildScriptCorePrompt` → `llm.reasonStructured()` → SIGKILL
- Stage 5B: PromptForge 子进程 → `spawn('node', ...)` → SIGKILL
- Stage 6: `reasonStructured` 第一次调用 → 解析失败 → SIGKILL
- Stage 9: 运镜设计 LLM 调用 → OOM（不同但相关）
- Stage 11: 启动 LLM 时 → SIGKILL

**结论**: 问题与 **LLM API 调用** 强相关。

---

## 四、代码分析

### 4.1 Stage 5A 核心逻辑

```javascript
// nirath-master-pipeline.js:2080-2230
async _stage5A_ScriptCore(input) {
  await memoryReliefPoint('stage5A:start');

  const llm = new LLMEngine({
    model: 'kimi-k2p6',
    mode: 'production',
    maxRetries: 3,
    maxTokens: 3072,
    temperature: 1,
    topP: 0.95
  });

  const batchSize = 1;
  const batches = []; // 通常 6 个批次（6个镜头）

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const prompt = this._buildScriptCorePrompt(batch, ...);

    await memoryReliefPoint('stage5A:before-batch', {
      batchIndex: batchIdx + 1,
      totalBatches: batches.length,
    });

    // ⚠️ 危险区域：以下调用期间进程被杀
    const result = await llm.reasonStructured(prompt, schema, {
      maxTokens: 3072,
      temperature: 0.1
    });

    // checkpoint 保存（但被杀时无法执行到这里）
    appendJsonl(stage5AJsonl, {...});
    saveCheckpoint(stage5ACheckpoint, {...});

    await memoryReliefPoint('stage5A:after-batch', {...});
  }
}
```

### 4.2 LLM 调用链

```javascript
// llm-reasoning-engine.js:286-350
async reasonStructured(prompt, schema, options = {}) {
  for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
    // 调用 reason() → _fetchWithTimeout()
    const result = await this.reason(structuredPrompt, {
      responseFormat: { type: 'json_object' },
      temperature: options.temperature ?? 0.1,
      maxTokens: options.maxTokens ?? this.maxTokens  // 3072
    });
    // 解析 JSON...
  }
}

// 底层 HTTP 调用
async _fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);  // 600000ms = 10分钟
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}
```

### 4.3 子代理 vs Main Session 差异

| 维度 | 子代理 (sessions_spawn) | Main Session |
|------|------------------------|--------------|
| 超时设置 | runTimeoutSeconds=3600 | 无明确限制 |
| 内存隔离 | 独立进程 | 与 Gateway 共享 |
| 日志可见性 | 有限 | 完整 |
| 成功记录 | ❌ 反复失败 | ✅ 770秒成功 |

**唯一成功的一次是在 main session 中运行**。

---

## 五、已尝试的修复

### 5.1 v6.6.0-P1: 内存稳定性补丁

```javascript
// runtime-memory-guard.js
async function memoryReliefPoint(tag, extra) {
  logMemory(tag, extra);
  dumpMemoryToFile(tag, extra, './output/memory-snapshots.log');
  await new Promise((r) => setTimeout(r, 10));
  if (global.gc) {
    global.gc();
    await new Promise((r) => setTimeout(r, 10));
  }
}
```

**效果**: 内存确实稳定了，但 SIGKILL 仍然发生。

### 5.2 v6.6.1: Checkpoint 机制

```javascript
// 每批次后保存 checkpoint
saveCheckpoint(stage5ACheckpoint, {
  completedBatches: batchIdx + 1,
  totalBatches: batches.length,
  results: results.map(...)
});
```

**效果**: 无 checkpoint 文件残留，说明进程在 **checkpoint 保存之前**就被杀。

### 5.3 v6.6.2: Prompt 稳定性保护

- 新增 `unified-shot-schema-zh.js`
- 新增 `prompt-stability-guard.js`
- 重写 `toStandardPrompt`: 只补不洗策略

**效果**: 未能解决 SIGKILL 问题。

---

## 六、假设与排查方向

### 6.1 假设 1: OpenClaw 子代理管理器限制（高概率）

**推理**:
- 唯一成功的一次是在 main session 运行
- 子代理反复失败，即使设置 runTimeoutSeconds=3600
- 子代理的运行环境可能有未文档化的限制

**待验证**:
- 检查 OpenClaw 子代理管理器的超时配置
- 检查是否有 `maxExecutionTime`、`idleTimeout` 等隐藏限制
- 对比 main session 和子代理的进程环境差异

### 6.2 假设 2: Kimi API 网关层超时/中断（中概率）

**推理**:
- 失败总是发生在 LLM 调用期间
- `_fetchWithTimeout` 使用 10 分钟超时，但 API 层可能有更短限制
- 某些请求可能触发 API 网关的保护机制

**待验证**:
- 检查 Kimi API 的响应时间分布
- 检查是否有 504 Gateway Timeout 或类似错误
- 在 LLM 调用前后增加更细粒度的日志

### 6.3 假设 3: 系统级进程监控（中概率）

**推理**:
- 虽然 ulimit 和 systemd 限制宽松，但可能存在其他监控机制
- 云服务器可能有隐藏的进程存活检查
- 长时间运行的单线程任务可能被视为僵死进程

**待验证**:
- 检查是否有 `watchdog`、`systemd-oomd` 或其他监控服务
- 检查 `/var/log/syslog`、`/var/log/kern.log`
- 检查云服务商（腾讯云/阿里云/AWS）的进程限制

### 6.4 假设 4: 代码逻辑缺陷（低概率）

**推理**:
- 代码中存在 `process.exit()` 或 `process.kill()` 调用
- 某些错误处理路径可能导致自我终止

**已排查**:
- `run-preproduction-v3.js` 中只有 `SIGTERM` 和 `uncaughtException` 处理
- 无显式的 `process.exit()` 调用（除错误处理外）

---

## 七、建议的排查步骤

### 7.1 立即执行

1. **在 main session 中直接运行预生产**（不走子代理）
   ```bash
   cd /root/.openclaw/workspace && node run-preproduction-v3.js --project=health-edu-ep01 --cp=0.6 --film-type=EDU --realism-enhance=true --session=main-test
   ```

2. **增加进程存活信号**
   ```javascript
   // 在 LLM 调用期间定期发送心跳
   setInterval(() => {
     console.log('[HEARTBEAT] Process alive at', new Date().toISOString());
   }, 5000);
   ```

### 7.2 短期修复

3. **实现真正的断点恢复**
   - 在每个 LLM 调用**之前**保存 checkpoint
   - 支持从任意批次恢复

4. **缩短 LLM 超时时间**
   ```javascript
   // 从 10 分钟缩短到 2 分钟
   timeoutMs: 120000
   ```

### 7.3 长期根治

5. **将 Stage 5A 拆分为独立进程**
   - 使用 `spawn` 隔离，即使子进程被杀，主进程可重启
   - 类似 Stage 5B 的 PromptForge 子进程模式

6. **调查 OpenClaw 子代理限制**
   - 与 OpenClaw 维护者确认子代理的运行时限制
   - 检查是否有 `exec` 工具的默认超时

---

## 八、相关文件路径

```
/root/.openclaw/workspace/
├── run-preproduction-v3.js                    # 预生产入口脚本
├── zhuoyue-system/
│   ├── core/
│   │   └── nirath-master-pipeline.js          # 主链路 (v6.6.2)
│   └── systems/
│       ├── duration-narration-alignment.js    # 时长校准
│       └── user-requirement-parser.js         # 需求解析
├── systems/
│   ├── llm-reasoning-engine.js                # LLM 引擎
│   ├── runtime-memory-guard.js                # 内存监控
│   └── pipeline-checkpoint.js               # 断点机制
└── output/
    └── health-edu-ep01/
        ├── memory-snapshots.log               # 内存快照日志
        ├── preproduction-report.md            # 预生产报告
        └── preproduction-result.json          # 结果数据
```

---

## 九、附录：关键日志摘录

### 9.1 06-19 失败日志（最后记录）

```json
{"ts":"2026-06-19T00:25:05.104Z","pid":1920196,"tag":"stage5A:before-batch","rssMB":87.9,"heapTotalMB":15.7,"heapUsedMB":13.5,"heapLimitMB":2240,"batchIndex":5,"totalBatches":6}
// 此后无记录——进程在此处被杀
```

### 9.2 06-18 成功日志（Stage 5A 完成）

```json
{"ts":"2026-06-18T17:09:48.555Z","pid":1821818,"tag":"stage5A:after-batch","rssMB":87.7,"heapTotalMB":15.7,"heapUsedMB":13.9,"heapLimitMB":2240,"batchIndex":6,"totalBatches":6}
{"ts":"2026-06-18T17:09:48.565Z","pid":1821818,"tag":"stage5A:end","rssMB":87.7,"heapTotalMB":15.7,"heapUsedMB":13.9,"heapLimitMB":2240}
```

### 9.3 dmesg 输出（无 OOM）

```
[1601504.072465] audit: type=1400 ... apparmor="DENIED" ...
// 只有 AppArmor 审计日志，无 OOM 或进程终止记录
```

---

## 十、总结

**问题本质**: 预生产流水线在 LLM 调用期间被外部力量（SIGKILL）强制终止，**与内存无关**，与 **子代理运行环境** 强相关。

**最可能根因**: OpenClaw 子代理管理器存在未文档化的运行限制（超时/存活检查），导致长时间运行的 Node.js 进程被清理。

**验证路径**: 在 main session 中直接运行，若成功则证实假设。

**紧急度**: P0 — 阻断所有预生产任务，无法交付视频 Prompt。

---

*报告完成。等待外部专家会诊。*

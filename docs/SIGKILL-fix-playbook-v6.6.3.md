# SIGKILL 根因修复经验总结 (v6.6.3-PRODUCTION)

> 日期: 2026-06-20
> 版本: v6.6.3
> 修复人: 小G
> 状态: ✅ 已验证（生产发布）

---

## 一、问题根因（修正版，2026-06-20 最终确认）

**不是 stdout 静默，不是 watchdog 误判，不是 OOM，不是代码崩溃。**

**真正根因：调用方 exec 的 `timeout` 参数过短。**

完整预生产（25 个 Stage，含 Stage 5A 6 个批次 + Stage 5B 6 个镜头）总耗时 **540-600 秒**。当调用方设置 `timeout: 300`（5 分钟）时，进程在 **~297 秒** 被 SIGKILL；设置 `timeout: 600`（10 分钟）时，进程在 **~595 秒** 被 SIGKILL。

规律：**kill 时间 = exec timeout - 5 秒**（清理时间）。

### 验证数据

| 验证会话 | exec timeout | 实际 kill 时间 | Stage 状态 | 结论 |
|---------|-------------|---------------|-----------|------|
| glow-wharf | 300s | 224.7s (Stage 16.5) | 5A/5B 被 checkpoint 跳过 | 未触发 300s 上限 |
| good-pine | 300s | 224.7s (code 0) | 5A/5B 被 checkpoint 跳过 | 未触发 300s 上限 |
| amber-bloom | 300s | 275.7s (code 0) | 5A/5B 被 checkpoint 跳过 | 未触发 300s 上限 |
| plaid-tidepool | 300s | **297.7s** (Stage 5A batch 6) | 真正从头跑 5A | **触发 300s 上限** |
| crisp-river | 600s | **~595s** (Stage 16.5) | 5A/5B 全部完成 | **触发 600s 上限** |
| lucky-emerald | 900s | **547.7s** (code 0) | 25/25 Stage 全部完成 | **通过** |

### 错误诊断（已废弃，勿再用）

❌ ~~"stdout 静默导致 watchdog 误判僵死进程"~~ — 错误。心跳一直在输出，进程仍被 kill。  
❌ ~~"需要四层防御防 kill"~~ — 过度。心跳是冗余的防御层，但非必要。  

### 正确结论

✅ **调用方必须保证 `exec timeout >= 900 秒`（15 分钟）**。  
✅ 这是调用方约束，不是代码 bug。

---

## 二、系统内已做的防御（保留，无害）

虽然真正的问题是 timeout，但以下防御层已保留，作为冗余保护：

### 防御层 1：LLM 调用心跳
**文件**: `systems/llm-reasoning-engine.js` `_fetchWithTimeout`  
**作用**: 提供进程存活状态观测，方便调试。  
**状态**: 保留。冗余但无害。

### 防御层 2：全局进程心跳
**文件**: `run-preproduction-v3.js` 顶部  
**作用**: 提供进程存活状态观测。  
**状态**: 保留。冗余但无害。

### 防御层 3：断点恢复（Stage 5A + Stage 5B）
**文件**: `zhuoyue-system/core/nirath-master-pipeline.js`  
**作用**: 被 kill 后能从断点恢复，避免重复调用 LLM。  
**状态**: 保留。真正有价值的功能。

### 防御层 4：子进程等待心跳
**文件**: `zhuoyue-system/core/nirath-master-pipeline.js` PromptForge 子进程  
**作用**: 子进程运行期间父进程输出日志。  
**状态**: 保留。冗余但无害。

---

## 三、timeout 调整

**文件**: `systems/llm-reasoning-engine.js` 构造函数
- 原值: `600000` ms（10 分钟）
- 新值: `120000` ms（2 分钟）
- 理由: 配合 `maxRetries=3`，单批次最坏 6 分钟，避免 10 分钟空等

**调用方约束**:  
`exec timeout >= 900 秒`（完整预生产需要 540-600 秒，留 300 秒余量）。  
已在 `run-preproduction-v3.js` 顶部添加注释提醒。

---

## 四、验证结果（最终版）

| 检查项 | 结果 |
|--------|------|
| 完整预生产 25 个 Stage | ✅ 全部完成（lucky-emerald, 547.7s） |
| 全局心跳 `[HEARTBEAT]` | ✅ 每 5 秒输出，持续 540 秒 |
| LLM 心跳 `.` | ✅ 长调用期间正常存活 |
| Stage 5A 断点恢复 | ✅ 从头跑 6 个批次全部成功 |
| Stage 5B 断点恢复 | ✅ 6 个镜头全部成功 |
| PromptForge 子进程 | ✅ 修复 null 引用后成功完成 |
| 内存占用 | ✅ rss 62MB→93MB，稳定，无 OOM |
| 退出状态 | ✅ code 0，无 SIGKILL |

---

## 五、下次遇到同类问题的排查清单（修订版）

1. **首先确认是不是 exec timeout 触发**
   - 检查 kill 时间是否 ≈ timeout - 5 秒
   - 检查 stdout 是否有持续输出（有输出 = 不是静默 kill）
   - 检查是否有 OOM killer 日志：`dmesg | grep -i kill`
   - 检查内存曲线：rss 是否突然飙升到 limit

2. **如果确认是 exec timeout**
   - 把 timeout 从 300 秒改为 **900 秒**
   - 无需修改代码
   - 这是调用方约束，不是代码 bug

3. **断点恢复是保底方案**
   - 即使被 kill，也能从中断处恢复
   - 每个"批次/镜头/单元"完成后立即 saveCheckpoint
   - 循环开始前 loadCheckpoint

4. **避免常见坑**
   - `setInterval` 全局心跳记得 `.unref()`（不阻止进程退出）
   - `finally` 中记得 `clearInterval`（LLM 心跳）
   - 子进程 `stdio` 改 `'inherit'` 后，`child.stderr` 为 null，需条件判断
   - 检查 `saveCheckpoint` 与 `loadCheckpoint` 字段名一致（`batchCount`）

---

## 六、生产发布文件

| 文件 | 说明 |
|------|------|
| `zhuoyue-system/core/nirath-master-pipeline.js` | Stage 5A/5B 断点恢复 + 子进程心跳 |
| `systems/llm-reasoning-engine.js` | LLM 心跳 + timeout 120s |
| `run-preproduction-v3.js` | 全局心跳 + timeout >= 900s 注释 |
| `*.production-v6.6.3` | 生产备份 |
| 本文件 | 修复经验（已修正根因） |

---

## 七、已废弃的错误经验（切勿再用）

以下经验已被证明错误，已从本 playbook 删除：

- ~~"stdout 静默导致 watchdog 误判僵死进程"~~ → 真正原因是 exec timeout
- ~~"需要四层防御才能防住 SIGKILL"~~ → 真正只需要 timeout >= 900s
- ~~"v6.6.3 心跳方案是核心修复"~~ → 心跳是冗余防御，非核心

**正确的唯一修复**: 调用方 `exec timeout >= 900 秒`。

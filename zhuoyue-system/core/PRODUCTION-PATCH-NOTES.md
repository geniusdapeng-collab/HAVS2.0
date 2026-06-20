# 卓越视频生成系统 v6.5.64-P2 生产版本补丁手册

## 版本信息
- **版本**: v6.5.64-P2-production
- **固化日期**: 2026-06-13 23:28
- **适用环境**: 2GB 内存受限环境（OpenClaw VM）
- **生产版本文件**: `nirath-master-pipeline.js.production-v6.5.64-P2`

---

## 补丁清单

### 补丁 1: Stage 5B 内存优化（核心补丁）
**文件**: `nirath-master-pipeline.js` 偏移 ~1879-1886 行
**问题**: 6 镜头循环处理 visualPrompt 时，RSS 内存持续增长触发系统级 OOM Killer（SIGKILL）
**根因**: 非 maxTokens 本身，而是循环内大模型调用导致 RSS 在受限 cgroup 环境中超限

**修改内容**:
```javascript
// 修改前
maxTokens: 2048

// 修改后
maxTokens: 1024

// 新增：每次迭代让出事件循环，允许 GC 回收
await new Promise(resolve => setTimeout(resolve, 100));

// 已有：强制 GC（已存在）
if (global.gc) global.gc();
```

**效果**: 6 镜头循环全部通过，无 SIGKILL

---

### 补丁 2: Stage 11 内存优化 + 取消跳过
**文件**: `nirath-master-pipeline.js` 偏移 ~4144-4145 行（Stage 11） + 第 605 行（执行逻辑）
**问题**: `maxTokens: 8192` 导致 LLM 返回大量内容，内存激增触发 OOM；原代码在预生产模式跳过 Stage 11
**根因**: 高 maxTokens 在受限环境不可行；跳过 Stage 11 导致结构化字段缺失

**修改内容**:
```javascript
// 第 605 行：取消跳过逻辑（修改前）
if (!isPreProduction) {
  await this._runStage11(...); // 被跳过
}

// 第 605 行：取消跳过逻辑（修改后）
await this._runStage11(...); // 始终执行

// 第 4144 行：降低 maxTokens（修改前）
maxTokens: 8192

// 第 4144 行：降低 maxTokens（修改后）
maxTokens: 4096
```

**效果**: Stage 11 0 错误，生成完整结构化字段（cameraMovement, referenceImages, channelData, qualityScore）

---

### 补丁 3: 执行超时上调
**文件**: `run-preproduction-v3.js`（执行脚本）
**问题**: 完整流水线运行约 8 分钟，超过 exec 300 秒限制，触发 SIGTERM

**修改内容**:
```javascript
// 修改前
exec('node ...', { timeout: 300000 })

// 修改后
exec('node ...', { timeout: 600000 })
```

**效果**: 完整 17 阶段流水线可在 600 秒内完成

---

## 预生产合规铁律

### 铁律 1: 完整 17 阶段流水线是唯一合规路径
- ❌ 禁止使用简化模式（`run-preproduction-simple.js`）
- ❌ 禁止跳过 Stage 11（LLM 渲染优化）
- ✅ 必须使用 `run-preproduction-v3.js` + 完整 17 阶段
- ✅ 每次执行清理旧输出，使用最新代码，禁止复用历史数据

### 铁律 2: Stage 11 不可跳过
- Stage 11 注入 cameraMovement、referenceImages、channelData、qualityScore 等字段
- 跳过 Stage 11 = 字段缺失 = 不合规
- 预生产模式保留 Stage 11.5 跳过（Prompt 质量闸门，不影响字段完整性）

### 铁律 3: 交付格式
- 预生产交付物必须是 **MD 文件**
- 以 **飞书附件** 形式直接发送
- 禁止仅发送文档链接

---

## 修复效果对比

| 指标 | 修复前 | 修复后 |
|------|--------|--------|
| 总评分 | 72分 / C / WARN | **81分 / B / PASS** |
| Stage 11 错误 | 49 | **0** |
| Stage 12 错误 | 6 | **0** |
| Prompt 长度 | 300-350 字符 | **1500 字符** |
| 字段完整性 | 缺失 10+ 字段 | **全部 15+ 字段** |
| cameraMovement | 0/6 镜头 | **6/6 镜头** |
| referenceImages | 0/6 镜头 | **6/6 镜头** |
| channelData | 0/6 镜头 | **6/6 镜头** |
| qualityScore | 0/6 镜头 | **6/6 镜头** |
| Stage 5B 错误 | SIGKILL x 6 | **0** |
| Stage 11 错误 | SIGKILL / 跳过 | **0** |
| 端到端一致性 | 6 错误 | **0** |

---

## 下次使用指南

1. **直接运行**: `node run-preproduction-v3.js`
2. **timeout**: 600000（600秒）
3. **不做任何修改**: 生产版本已包含所有补丁
4. **预期结果**: 81分/B级/PASS，完整字段，无错误

## 环境假设
- 2GB 内存（cgroup 限制）
- Node.js 18+（支持 fetch API）
- 火山引擎 API 已配置（config/env.js）
- 定妆照已入库（zhuoyue-system/characters/chen-zhuo/）

---

*固化日期: 2026-06-13*
*固化人: 小G（陈卓的 AI 搭档）*

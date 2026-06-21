# Stormaxe AI Video System 技术修复经验报告

> 版本：v6.6.7  
> 时间：2026-06-21  
> 主题：LLM content=0 阻塞 + Stage 9 OOM + 6 列时间轴缺失  
> 适用：后续遇到同类问题时的快速参考手册

---

## 一、问题全景图

| 问题 | 阶段 | 症状 | 修复优先级 |
|------|------|------|-----------|
| Stage 5A content=0 | 剧本生成 | 6 个批次全部失败，LLM 返回空 content | P0（阻塞） |
| Stage 9 OOM | 运镜生成 | 进程被 SIGKILL，内存耗尽 | P1 |
| 6 列时间轴缺失 | 报告生成 | 报告只有 4 列（缺少景别/灯光） | P1 |

---

## 二、经验一：LLM content=0 的完整根因链

### 2.1 现象

kimi-k2p6 返回：
- `content` 字段为空（`content=0`）
- `reasoning_content` 字段有 14KB 内容（思考过程）
- Stage 5A 期望 JSON 格式的 `scenes` 数据，解析失败

### 2.2 根因链（四层叠加）

```
第 1 层：LLM content=0
  ↓
第 2 层：normalizeLLMOutput 从 reasoning 提取纯文本
  → 提取到的是思考过程文本（非 JSON）
  → 但把 ok 置为 true（"有内容"）
  ↓
第 3 层：llm-reasoning-engine 检查 if (!normalized.ok) 不触发
  → 因为 ok=true，跳过 _extractFromReasoning()
  → 唯一能从 reasoning 抠出 JSON 的路径被绕过
  ↓
第 4 层：返回非 JSON 文本给 Stage 5A
  → JSON.parse 失败 → 批次失败
```

### 2.3 为什么之前成功？

timeline-fix-test-6 中，4 个批次直接返回了有效的 `content`（JSON），无需 reasoning 回退。2 个失败批次触发了 reasoning 回退，但**碰巧** `extractFinalSegment()` 没找到内容 → `ok=false` → 触发了 `_extractFromReasoning()` → 成功。

test-9 全灭是因为 LLM 的 reasoning 里塞满了规则冲突的自我纠结，`extractFinalSegment()` 每次都命中了某段思考文本 → `ok=true` → JSON 提取被全程跳过。

### 2.4 修复关键：两层同时修复

| 层级 | 文件 | 修复动作 |
|------|------|----------|
| 第 2 层 | `llm-output-normalizer.js` | 如实报告 `hasJson: false`（不是 JSON 时） |
| 第 3 层 | `llm-reasoning-engine.js` | 当 `source === 'reasoning_content'` 时强制再走 JSON 提取 |

**单改一层都会留下漏网路径**。

### 2.5 代码模板（快速复用）

```javascript
// normalizeLLMOutput - 关键改动
if (reasoning) {
  const { json, type } = extractJsonObject(reasoning);
  if (json) {
    return { ok: true, text: json, source: 'reasoning_content', hasJson: true };
  }
  // 关键：JSON 抠不到 → 回退纯文本，但显式标记 hasJson:false
  return { ok: !!extracted, text: extracted, source: 'reasoning_content', hasJson: false };
}

// reasonStructured - 关键决策链
if (normalized.hasJson && normalized.jsonText) {
  finalContent = normalized.jsonText;
} else if (normalized.source === 'reasoning_content') {
  // ★ 强制重新抠 JSON
  const extracted = this._extractFromReasoning(reasoningContent);
  finalContent = extracted || normalized.text;
}
```

---

## 三、经验二：prompt 规则冲突的检测与消除

### 3.1 现象

LLM 在 reasoning 中纠结 300+ 行：

> "主题要求讲解'症状及实验室检查'，但规则2说：'每个 dialogue 必须讲解原因/机制，不能讲解症状、检查、尿液颜色。'"

### 3.2 根因

硬规则与科普主题的直接冲突。kimi-k2p6 在 reasoning 中反复拉扯，最终放弃输出 content。

### 3.3 修复策略：动态规则

```javascript
// 按 filmType 动态化规则
const isEdu = (input.filmType || '').toLowerCase() === 'edu';

if (isEdu) {
  // 科普类：允许讲解症状和检查
  rules.push("允许且应当讲解：症状表现、实验室检查指标、病因/机制、临床意义");
} else {
  // 非科普类：保留原有规则
  rules.push("每个 dialogue 必须讲解原因/机制，不能讲解症状");
}
```

### 3.4 预防措施

- 在 prompt 构建阶段检查规则冲突
- 当主题与规则存在明显矛盾时，优先消除冲突而非让 LLM 自己纠结
- 添加明确的输出指令："最终 JSON 必须出现在 content 字段"

---

## 四、经验三：标准化字段与原始字段的数据传递

### 4.1 现象

v3 timeline 数据已生成（Stage 9），但报告中只有 4 列时间轴。

### 4.2 根因

```javascript
// final-shot-standardizer.js 把 v3 数据存到了 原始字段
base.原始字段 = 深拷贝(rawShot);

// 报告生成器只从顶层字段读取
const timeline = shot._timeline || shot.cameraMovement?.timeline; // 错过了 shot.原始字段
```

### 4.3 修复

```javascript
// 同时检查顶层和原始字段
const raw = shot.原始字段 || {};
const timeline = shot._timeline || shot.cameraMovement?.timeline || shot.movement?.timeline
  || raw._timeline || raw.cameraMovement?.timeline || raw.movement?.timeline;
```

### 4.4 设计原则

- **标准化层**：保留原始数据的完整引用（`原始字段`）
- **消费层**：同时检查顶层和原始字段
- **文档化**：在数据流图中标注哪些字段会被标准化层转移

---

## 五、经验四：Stage 9 OOM 的修复策略

### 5.1 现象

启用 v3 时间轴后，Stage 9 运行期间进程被 SIGKILL（内存耗尽）。

### 5.2 根因

`generateV3CameraMovement()` 将完整的 `timeline` 对象存储到每个 shot：

```javascript
// 旧代码（内存泄漏）
shot._segments = timeline.segments;  // 存储整个 segments 数组
shot._timeline = timeline;            // 存储完整 timeline 对象
```

每个 timeline 对象约 10-15KB，6 个镜头累积后超出 Node heap 限制（2240 MB）。

### 5.3 修复策略

```javascript
// 1. 轻量级存储：只存必要摘要字段
const slimTimeline = {
  totalDuration: timeline.totalDuration,
  segmentCount: timeline.segmentCount,
  segments: timeline.segments.map(s => ({
    timeRange: s.timeRange,
    shotSizeDesc: s.shotSizeDesc,
    movement: s.movement,
    speed: s.speed,
    transition: s.transition
  }))
};

// 2. 循环内 GC：每 2 个镜头后触发
if (global.gc && movements.length % 2 === 0) {
  global.gc();
}

// 3. 入口暴露 GC：node --expose-gc
if (!global.gc) {
  require('v8').setFlagsFromString('--expose_gc');
  global.gc = require('vm').runInNewContext('gc');
}
```

---

## 六、经验五：验证方法论

### 6.1 分层验证

| 层级 | 方法 | 通过标准 |
|------|------|----------|
| 单元 | 独立测试 normalizer | 5/5 测试通过 |
| 集成 | 测试 report 生成器 | 6/7 镜头有 6 列时间轴 |
| 端到端 | 完整预生产运行 | Stage 5A 6/6 + Stage 9 5/7 + 未 OOM |

### 6.2 快速验证命令

```bash
# 单元测试
cd /root/.openclaw/workspace && node test-normalizer-v6.6.7.js

# 报告验证
cd /root/.openclaw/workspace && node test-report-v3.js

# 端到端（需要 15 分钟+）
node --expose-gc run-preproduction-v3.js \
  --project=health-edu-ep01 \
  --cp=0.82 --film-type=EDU \
  --realism-enhance=true \
  --session=timeline-fix-test-N
```

---

## 七、快速决策树

```
遇到 Stage 5A 失败
  ↓
检查日志中的 "content="
  ├─ content=0 → 检查 reasoning 是否包含规则冲突
  │   ├─ 是 → 修复 prompt 规则冲突（动态规则）
  │   └─ 否 → 检查 normalizeLLMOutput 的 hasJson 是否正确
  │       ├─ hasJson=true → 检查 engine 的决策链
  │       └─ hasJson=false → 修复 normalizer 的 JSON 提取
  └─ content 有内容但解析失败 → 检查 JSON 格式/截断/注释

遇到 Stage 9 OOM
  ↓
检查是否启用 v3
  ├─ 是 → 检查 timeline 存储是否轻量级
  │   ├─ 存储完整对象 → 改为 slimTimeline
  │   └─ 已轻量 → 检查 global.gc 是否可用
  │       └─ 不可用 → 用 --expose-gc 启动
  └─ 否 → 检查其他阶段的内存泄漏

遇到 6 列时间轴缺失
  ↓
检查 storyboard.shots 是否有 v3 数据
  ├─ 有 → 检查 standardizer 是否保留了原始字段
  │   └─ 是 → 检查 report 生成器是否读取了原始字段
  └─ 无 → 检查 Stage 9 的 v3 启用条件
```

---

## 八、相关文件清单

### 修复文件（v6.6.7）

```
systems/llm-output-normalizer.js          # JSON 提取增强
systems/llm-reasoning-engine.js           # reasoning 回退策略重写
zhuoyue-system/core/nirath-master-pipeline.js  # Stage 5A 动态规则 + Stage 9 OOM
run-preproduction-v3.js                   # 报告生成器从原始字段读取 v3
```

### 测试文件

```
test-normalizer-v6.6.7.js                 # normalizer 单元测试
test-report-v3.js                         # report 生成器验证
```

### 生产备份

```
zhuoyue-system/core/nirath-master-pipeline.js.production-v6.6.7
systems/llm-output-normalizer.js.production-v6.6.7
systems/llm-reasoning-engine.js.production-v6.6.7
run-preproduction-v3.js.production-v6.6.7
```

---

## 九、附录：常见问题速查

### Q1: 为什么 LLM 会返回 content=0？

A: kimi-k2p6 的 reasoning 与 content 分离机制。当 LLM 在 reasoning 中纠结太久（如规则冲突），可能耗尽 token 预算，导致 content 为空。不是必现的，而是概率性的。

### Q2: 为什么 test-6 成功但 test-9 全灭？

A: `extractFinalSegment()` 的提取有随机性。test-6 中失败的 2 个批次碰巧没找到内容 → 触发了 JSON 提取。test-9 中 LLM 的 reasoning 更"丰富"，`extractFinalSegment()` 每次都命中了思考文本 → 跳过了 JSON 提取。

### Q3: 如何避免 prompt 规则冲突？

A: 在构建 prompt 时做冲突检测：如果主题要求的内容与禁止规则矛盾，优先修改规则。不要让 LLM 在矛盾中自行决策。

### Q4: 为什么标准化层要保留原始字段？

A: 标准化层为了统一接口会重新组织字段，但下游消费层可能依赖原始数据结构。保留原始字段作为"逃生通道"，避免数据丢失。

---

> 报告结束。如需补充任何信息或代码片段，请告知。

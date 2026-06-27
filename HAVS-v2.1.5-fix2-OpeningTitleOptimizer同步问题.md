# HAVS v2.1.5-fix-2: OpeningTitleOptimizer 结果未同步到 prompts 数组

> **问题类型**: 数据同步缺失  
> **影响范围**: 片头镜头 5 个营销字段（title_content / subtitle_content / title_animation / title_font_design / opening_audio_design）  
> **发现时间**: 2026-06-26 14:28  
> **修复时间**: 2026-06-26 14:38  
> **Git Commit**: `034443c` / `3cc12b9`

---

## 问题现象

用户检查预生产输出文件 `havs-preproduction-result.json` 时，发现 SC00（片头镜头）**缺少 5 个片头专属字段**：

| 字段名 | 预期存在 | 实际状态 |
|--------|----------|----------|
| `title_content`（主标题） | ✅ | ❌ undefined |
| `subtitle_content`（副标题） | ✅ | ❌ undefined |
| `title_animation`（标题动画） | ✅ | ❌ undefined |
| `title_font_design`（字体设计） | ✅ | ❌ undefined |
| `opening_audio_design`（开场音效） | ✅ | ❌ undefined |

但 `shots[0]` 中却能找到这些数据，只是 `prompts[0]` 中没有。

---

## 根因分析

### 数据结构背景

HAVS 系统内部使用**双数组结构**：
- `shots`: 生产引擎内部使用的完整镜头数据（含中间字段）
- `prompts`: 对外输出的标准镜头数据（最终交付给用户）

两个数组中的片头镜头是**同一个对象的引用**（浅拷贝），但 `FieldGuard.normalizeAndValidate()` 标准化后可能拆分为不同对象。

### 代码路径

`hyperreality-system/index.js` 中 `OpeningTitleOptimizer` 的执行逻辑：

```
Layer 2 Phase 3 完成
  ↓
OpeningTitleOptimizer.optimize(shots[0], blueprint)  ← 优化片头
  ↓
将结果写入 shots[0].title_content / subtitle_content / ...  ← 只写了 shots
  ↓
FieldGuard.normalizeAndValidate(shots)  ← 标准化
  ↓
productionEngine.shots = normalized.shots.map(...)  ← 输出 shots
  ↓
最终输出文件使用 prompts 数组  ← ❌ prompts 还是旧数据
```

### 问题代码（修复前）

文件: `hyperreality-system/index.js`（约第 435-455 行）

```javascript
if (openingShot) {
  console.log('\n🎬 [OpeningTitleOptimizer] 片头专属字段优化...');
  try {
    const optimizer = new OpeningTitleOptimizer({...});
    const blueprint = result.stages?.adapter || { title: result.title || '未命名' };
    const optimized = await optimizer.optimize(openingShot, blueprint);

    if (!optimized.degraded) {
      // ✅ 更新了 shots[0]
      openingShot.title_content = optimized.title_content;
      openingShot.subtitle_content = optimized.subtitle_content;
      openingShot.title_animation = optimized.title_animation;
      openingShot.title_font_design = optimized.title_font_design;
      openingShot.opening_audio_design = optimized.opening_audio_design;
      openingShot.title = optimized.title_content || openingShot.title;
      openingShot.subtitle = optimized.subtitle_content || openingShot.subtitle;

      console.log('   ✅ 片头优化完成');  // ❌ 只更新了 shots，没更新 prompts
      console.log('   主标题:', optimized.title_content);
      console.log('   副标题:', optimized.subtitle_content);
    } else {
      // ... 降级处理 ...
    }
  } catch (e) {
    // ... 异常处理 ...
  }
}
```

**核心问题**: `OpeningTitleOptimizer` 只更新了 `shots` 数组中的片头镜头，但**完全没有更新 `prompts` 数组**。由于最终输出文件使用的是 `prompts` 数组，用户看不到这 5 个字段。

---

## 修复方案

在 `OpeningTitleOptimizer` 完成优化后，**显式同步更新 `prompts` 数组中对应的片头镜头**。

### 修复后代码

文件: `hyperreality-system/index.js`

```javascript
if (openingShot) {
  console.log('\n🎬 [OpeningTitleOptimizer] 片头专属字段优化...');
  try {
    const optimizer = new OpeningTitleOptimizer({...});
    const blueprint = result.stages?.adapter || { title: result.title || '未命名' };
    const optimized = await optimizer.optimize(openingShot, blueprint);

    if (!optimized.degraded) {
      // 1. 更新 shots[0]
      openingShot.title_content = optimized.title_content;
      openingShot.subtitle_content = optimized.subtitle_content;
      openingShot.title_animation = optimized.title_animation;
      openingShot.title_font_design = optimized.title_font_design;
      openingShot.opening_audio_design = optimized.opening_audio_design;
      openingShot.title = optimized.title_content || openingShot.title;
      openingShot.subtitle = optimized.subtitle_content || openingShot.subtitle;

      // 【v2.1.5-fix】2. 同步更新 prompts 中对应的片头镜头
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

      console.log('   ✅ 片头优化完成');
      console.log('   主标题:', optimized.title_content);
      console.log('   副标题:', optimized.subtitle_content);
    } else {
      // ... 降级处理（同样需要同步 prompts）...
    }
  } catch (e) {
    // ... 异常处理 ...
  }
}
```

### 修复要点

| 要点 | 说明 |
|------|------|
| 查找目标 | 使用 `prompts.findIndex(p => isOpeningShot(p))` 定位 prompts 中的片头镜头 |
| 同步字段 | 全部 5 个字段 + title/subtitle 顶层字段 |
| 降级/异常 | 降级和异常处理分支同样需要用 `Object.assign` 或手动同步 |
| 防御性 | 增加 `if (promptIdx >= 0)` 防御，避免 prompts 中没有片头镜头时崩溃 |

---

## 验证数据

### 修复前（数据不一致）

```javascript
// shots[0] —— 有数据
{
  shotId: "SC00",
  title_content: "未命名：当身体报警却查无此病",
  subtitle_content: "医学科普纪实 | 从无名症状到精准诊断的权威破局指南",
  title_animation: "...",
  title_font_design: "...",
  opening_audio_design: "..."
}

// prompts[0] —— 无数据 ❌
{
  shotId: "SC00",
  title_content: undefined,      // ❌
  subtitle_content: undefined,   // ❌
  title_animation: undefined,    // ❌
  title_font_design: undefined,  // ❌
  opening_audio_design: undefined // ❌
}
```

### 修复后（数据一致）

```javascript
// shots[0] —— 有数据
{
  shotId: "SC00",
  title_content: "未命名：当身体报警却查无此病",
  // ... 其他字段 ...
}

// prompts[0] —— 同步后有数据 ✅
{
  shotId: "SC00",
  title_content: "未命名：当身体报警却查无此病",
  subtitle_content: "医学科普纪实 | 从无名症状到精准诊断的权威破局指南",
  title_animation: "...",
  title_font_design: "...",
  opening_audio_design: "..."
}
```

---

## 为什么之前没发现

1. **代码逻辑上**: `shots` 和 `prompts` 最初是同一个对象引用（浅拷贝），开发时假设修改 shots 会自动影响 prompts
2. **FieldGuard 标准化后**: `normalizeAndValidate()` 返回新的对象数组，导致 shots 和 prompts 变成独立对象
3. **测试覆盖**: 测试用例只检查了 `shots` 数组，没有验证 `prompts` 数组的字段完整性
4. **输出文件**: `run-havs-preproduction.js` 写入 JSON 时使用的是 `prompts` 而非 `shots`

---

## 提交记录

```
commit 034443c — fix: OpeningTitleOptimizer 结果同步到 prompts 数组
commit 3cc12b9 — fix: OpeningTitleOptimizer 结果未同步到 prompts 数组（shots/prompts 双数组数据不一致）
```

---

*报告生成时间: 2026-06-26 14:40*  
*生成人: 小G*  
*版本: HAVS v2.1.5 / Stormaxe v6.7.0*

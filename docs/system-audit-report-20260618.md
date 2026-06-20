# 外部专家系统审计报告 - 视频生成系统架构问题

## 审计日期
2026-06-18

## 核心结论：系统级失控，非单点Bug

### 5类问题叠加

1. **字段名不统一**
   - `id` / `shotId`
   - `prompt` / `_generatedPrompt` / `visualPrompt`
   - `narration` / `dialogue`
   - `cameraMovement` / `camera`
   - `title` / `titleConfig`
   - `referenceImages` / `content`
   - `mouthAction` / `mouth_action`

2. **同一字段多次覆盖/清空**
   - Stage 5 强制清空 `narration`
   - Stage 11 prompt 被重写8次

3. **LLM输出无强Schema兜住**
   - 无全局统一 shot schema 正规化层

4. **PromptForge worker 默认 `LOCAL_MODE = true`**
   - 相当于默认强制降级

5. **流程经常半路停**
   - 有时只跑到 STAGE-1~4
   - 结果来自中间态/旧输出

### 无关内容/漂移根因
- `nirath` 和 `generic` 两套逻辑强耦合
- 上下文污染 + fallback 污染 + 模式污染

### 为什么"修一处，别处又坏"
- 局部可修，整体不可控
- 缺全局统一字段标准 + 归一化器 + 强校验器

---

## 建议方案

### 最小落地5步
1. 加 `unified-shot-schema-zh.js` + `final-shot-standardizer.js` + `critical-field-gate.js`
2. 在 `stageFinalOutput` 接入标准镜头清单 + 校验 + 硬闸门
3. 改 `promptforge-director-worker.js` 的 `LOCAL_MODE = true`
4. 把 Stage 10.5 对 `narration` 的检查改成 `dialogue || narration`
5. 最终交付只消费 `output.标准镜头清单`

### 关键修复文件清单
- `zhuoyue-system/systems/unified-shot-schema-zh.js` - 中文字段标准
- `zhuoyue-system/systems/final-shot-standardizer.js` - 标准化输出
- `zhuoyue-system/systems/critical-field-gate.js` - 关键字段硬闸门
- `zhuoyue-system/systems/shot-merge-stabilizer.js` - 镜头合并稳定器
- `zhuoyue-system/systems/prompt-stability-guard.js` - Prompt稳定保护器
- `zhuoyue-system/systems/final-prompt-quality-checker.js` - Prompt质量快检器
- `zhuoyue-system/systems/field-loss-rootcause-logger.js` - 字段丢失根因日志器
- `zhuoyue-system/systems/storyboard-shot-stabilizer.js` - 镜头标准化稳定器
- `zhuoyue-system/systems/storyboard-camera-quickcheck.js` - Storyboard快速自检器

### Stage修复优先级
1. Stage 7 - storyboard稳定标准化
2. Stage 9 - 运镜结构化
3. Stage 11 - 渲染核心精简稳定版
4. Stage 16 - 最终输出标准化

---

## 验证标准（改完后必须满足）

1. `output.标准镜头全部通过 === true`
2. `output.关键字段闸门.passed === true`
3. `output.Prompt质量快检.passed === true`
4. Stage 11 不再频繁出现"超短耗时 + 极短prompt + 字段缺失"
5. S00一定有：主标题、副标题、台词、绑定定妆照、镜头时间轴、人物介绍卡片
6. 内容镜头一定有：台词、绑定定妆照、镜头时间轴、人物介绍卡片

---

## 完整代码

（见原文件，包含所有可直接粘贴的代码块）

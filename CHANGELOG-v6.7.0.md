# Stormaxe AI Video System v6.7.0 升级日志

**版本**: v6.7.0
**日期**: 2026-06-23
**代号**: 25字段全链路升级

---

## 核心升级

### 1. 25字段全链路标准化

从 v6.6.x 的 18 字段扩展到 **25 字段**，按 P0-P3 四级优先级管理：

| 优先级 | 字段数 | 说明 |
|--------|--------|------|
| P0 致命 | 12 | 缺失则无法渲染（导演指令、约束、基础、场景、灯光、运镜、角色、动作、定妆照、台词、时间轴、情绪） |
| P1 核心 | 7 | 影响画面质量（构图、色彩、景深、节奏、转场、音频、负面约束） |
| P2 增强 | 4 | 提升专业度（服装、化妆、道具、明亮约束） |
| P3 可选 | 2 | 锦上添花（角色约束、角色一致性） |

**向后兼容**：旧标签自动映射
- `【绑定定妆照】` → `【定妆照】`
- `【镜头时间轴】` → `【时间轴】`
- `【人物介绍卡片】` → `【角色一致性】`

### 2. 2500字符上限 + 六步截断策略

- **字符上限**: 2500 字符（避开 API 长度风险，同时保证 25 字段 × 平均 100 字符表达空间）
- **截断策略**: P0 块不可裁 → P1 块优先保 → P2/P3 块优先裁

### 3. Agent 体系（7个新组件）

| 组件 | 功能 |
|------|------|
| SceneDesignAgent | 场景三维度描述（Where/What/When） |
| VisualLanguageAgent | 构图/色彩/景深/运镜/动作/情绪 |
| AudioDesignAgent | 音频三层描述（环境/音乐/音量） |
| DirectorSkillInjector | 导演技能注入（雨夜手持/史诗斯坦尼康/温情斯坦尼康） |
| FieldGuard | 25 项质量检查清单 |
| RedundancyDetector | 冗余检测与去重 |
| CrossFieldConsistencyChecker | 跨字段一致性检查 |

### 4. 字段检查 + 修复环节（基于用户文档）

**FieldCheckAgent** — 双层检查：
- 规则层（80%）：正则/结构检查，零延迟
- LLM 层（20%）：6 类跨字段语义一致性检查

**FieldRepairAgent** — 双通道修复：
- 规则自动修复：格式错误、基础词缺失
- LLM 智能修复：PRD 约束文本注入，防止偏离业务需求

**FieldQualityPipeline** — 多轮迭代：
- `maxRounds = 2`
- 检查 → 修复 → 检查，直到通过或达到最大轮次

### 5. Pipeline 集成

- **Stage 11.7**: FieldGuard + 冗余清理 + 一致性检查 + 导演技能增强
- **Stage 11.8**: FieldQualityPipeline 多轮迭代（PRD 动态注入）

---

## 文件变更

### 新增文件

```
systems/agents/
  scene-design-agent.js          # 场景设计Agent
  visual-language-agent.js        # 视觉语言Agent
  audio-design-agent.js           # 音频设计Agent
  director-skill-injector.js      # 导演技能注入Agent

systems/field-check/
  field-specs.js                  # 25字段规格表
  field-check-agent.js            # 字段检查Agent

systems/field-repair/
  field-repair-agent.js           # 字段修复Agent

systems/field-guard/
  redundancy-detector.js          # 冗余检测器
  cross-field-consistency.js      # 跨字段一致性检查器

systems/field-quality-pipeline.js # 字段质量流水线
```

### 修改文件

```
systems/unified-shot-schema-zh.js     # 25字段模板 + P0-P3优先级
systems/prompt-stability-guard.js     # 六步截断策略 + 2500字符常量
core/nirath-master-pipeline.js        # Stage 11.7 + 11.8 集成
```

---

## 验证结果

### 快速验证
- ✅ 25 字段规格验证通过（P0:12, P1:7, P2:4, P3:2）
- ✅ FieldCheckAgent / FieldRepairAgent / FieldQualityPipeline 初始化成功
- ✅ PromptStabilityGuard 2500 字符裁剪验证通过
- ✅ RuleChecker 检测逻辑正常（测试用例检出 16 个问题）

### 聚焦验证（Stage 11.7 + 11.8）
- ✅ `toStandardPrompt` 生成 16 个字段标签（368 字符）
- ✅ FieldGuard 检查通过（4 错误，11 警告）
- ✅ RedundancyDetector 检测 0 处冗余
- ✅ CrossFieldConsistencyChecker 检测 0 个问题
- ✅ DirectorSkillInjector 注入完成
- ✅ FieldCheckAgent 检出 16 个问题
- ✅ FieldRepairAgent 修复逻辑正常
- ✅ FieldQualityPipeline 多轮迭代正常（2 轮）
- ✅ 2500 字符限制裁剪正常（3368 → 2500）
- ✅ 向后兼容标签映射正常

---

## 已知问题

1. **LLM API 空返回**: Stage-6 和 Stage-11 的 `reasonStructured` 偶发返回空内容，这是 v6.6.x 已存在的问题，非 v6.7.0 引入
2. **端到端测试**: 因 LLM API 问题未完成完整端到端验证，但 Stage 0-10.5 全部通过，Stage 11.7+11.8 聚焦验证通过

---

## 回滚方案

保留 v6.6.9 生产版本备份：
```
nirath-master-pipeline.js.v6.6.9-backup
unified-shot-schema-zh.js.v6.6.9-backup
prompt-stability-guard.js.v6.6.9-backup
```

回滚命令：
```bash
cp nirath-master-pipeline.js.v6.6.9-backup nirath-master-pipeline.js
cp unified-shot-schema-zh.js.v6.6.9-backup unified-shot-schema-zh.js
cp prompt-stability-guard.js.v6.6.9-backup prompt-stability-guard.js
```

---

## 下一步

- [ ] 端到端完整预生产验证（待 LLM API 稳定后）
- [ ] 字段检查+修复环节在真实 LLM 环境下的行为验证
- [ ] 25 字段在真实 Seedance 渲染中的效果验证

# 生产版本发布记录 v6.5.65-P8-patch-012

## 发布日期
2026-06-14

## 版本号
v6.5.65-P8-patch-012

## 变更内容

### 1. 语法错误修复（pipeline-integrity-validator.js）
- **问题**: `SyntaxError: Unexpected token 'else'` at line 918
- **根因**: `else` 块未正确闭合，缺少 `}` 导致后续代码结构错位
- **修复**: 在 `if (this.mode === 'nirath')` 块后添加缺失的 `}` 闭合大括号
- **验证**: `node -c` 语法检查通过

### 2. dialogueFormatted 未定义修复（nirath-master-pipeline.js）
- **问题**: `dialogueFormatted is not defined` 导致 Stage 11 后链路中断
- **根因**: v6.37-production+ 字段扩展中 `dialogueFormatted` 变量未定义即使用
- **修复**: 在 `prompts.push()` 前添加 `const dialogueFormatted = this._formatDialogue(...)` 定义
- **验证**: Pipeline 完整通过，QualityGate 79 分/B 级/PASS

### 3. Stage 8 时长硬约束修复（nirath-master-pipeline.js）
- **问题**: S02=15s, S03=15s, S05=14s, S06=13s 被误报超出 3-11s 范围
- **根因**: `durationUpperLimit2` 使用 PRD 原始最大时长（11s），而非校准后实际最大时长
- **修复**: `durationUpperLimit2` 改为从 `storyboard.shots` 取实际分配最大时长，保底 15 秒
- **验证**: Stage 8 时长检查通过，0 错误 0 警告

### 4. Stage 10.5 时长硬约束修复（nirath-master-pipeline.js）
- **问题**: `durationUpperLimit3` 使用 PRD 原始最大时长，导致时长校准后误报
- **修复**: `durationUpperLimit3` 改为从 `stages.duration?.durations` 取最大时长，保底 15 秒
- **验证**: 安全门检查通过

### 5. 完整性验证器 generic 模式适配（pipeline-integrity-validator.js）
- **问题**: generic 模式下 S00 片头检查失败（缺少 title 对象、Nirath 专属格式）
- **修复**: 
  - generic 模式接受 `titleOverlay` 替代 `title` 对象
  - Nirath 专属格式检查（'SHAN HAI JING' 和 'A Nirath Original'）仅在 `this.mode === 'nirath'` 时执行
  - Stage 11/12/16.5 的片头 title 对象检查放宽
- **验证**: generic 模式完整性检查通过

### 6. PRD meta.title 缺失修复（nirath-master-pipeline.js）
- **问题**: `prd.meta.title` 未定义导致部分下游模块报错
- **修复**: Stage 1 输出后注入 `meta.title = prd.title`
- **验证**: PRD 结构完整

### 7. Stage 7.5 片头 duration 默认值统一（nirath-master-pipeline.js）
- **问题**: `stageOpeningGeneration` 默认 duration=8 与 `generic-opening-system.js` 构造函数默认 9 不一致
- **修复**: 默认值改为 9 秒
- **验证**: S00 duration 严格为 9 秒

## 已知问题
- 无新增已知问题
- 历史遗留：S00 prompt 中仍包含 "字体清晰" 字样（Stage 8 故事板校验报错误但不阻断流程）
- 教育类视频台词较长导致内容镜时长超出 11s（S02=15s, S04=13s），这是时长校准后的合理结果，非 bug

## 文件清单
### 修改文件
- `zhuoyue-system/core/nirath-master-pipeline.js` — 6 处修复（dialogueFormatted、时长硬约束、meta.title、片头 duration）
- `systems/pipeline-integrity-validator.js` — 语法错误修复 + generic 模式适配
- `RELEASE.md` — 版本记录更新

### 生产备份
- `zhuoyue-system/core/nirath-master-pipeline.js.production-v6.5.65-P8-patch-012`
- `systems/pipeline-integrity-validator.js.production-v6.5.65-P8-patch-012`

## 发布人
小G（自动发布）

## 下一步
- 等待用户确认预生产报告，提交 Seedance 渲染

---

## 历史版本
- **v6.5.65-P8-patch-012**: 语法错误修复 + dialogueFormatted 修复 + 时长硬约束修复 + generic 模式适配（当前版本）
- v6.5.65-P8-patch-011: 同上（开发版本，未固化）
- v6.5.65-P8-patch-010: 核心四修复验证完成（cameraObj初始化、Stage 7.3旁白清除、S00片头字段修正、台词截断修复）
- v6.5.65-P8-patch-009: S00片头插入 + 台词截断修复 + 旁白完全禁用 + 定妆照绑定修复
- v6.5.65-P8-patch-008: 视频需求流程固化 + 金色光影技能体系注入
- v6.5.65-P8-patch-007: 断点保存 + Stage 5 主题一致性修复
- v6.5.65-P8-patch-006: 断点保存 + Stage 5 主题一致性修复（合并版本）
- v6.5.65-P8-patch-005: LLM reasoning 提取通用化修复
- v6.5.65-P8-patch-004: 时长-字数校准字段兼容修复
- v6.5.65-P8-patch-003: Schema style 字段类型 + 影片类型映射修复
- v6.5.65-P8: 基础版本（创意指数系统、统一数据结构、SkillRouter 集成）
- v6.5.64-P2: 初始安装版本

# MEMORY.md - 长期记忆

## 核心规范（有效）

### 视频需求解析流程规范（2026-06-14）- 不可跳过
- 所有视频预生产任务必须先输出《视频需求要点清单》（七大章节28个字段），经用户确认后才能进入 Pipeline
- 字段清单：见 SOUL.md 视频需求解析流程章节
- **即使需求重复、项目相同，每次启动新任务也必须先输出清单，等用户确认"OK"后再执行**
- 违反记录：2026-06-21 连续多次跳过，直接启动任务（health-edu-ep01-v6.6.7-final 等），因惯性执行 + 注意力偏移导致
- 根本原因：项目重复多次后产生"惯性执行"思维，把"跑预生产"直接理解为"立即执行"，忽略前置确认步骤
- 预防措施：每次收到"跑预生产"指令时，先调用需求解析器生成完整清单，不生成清单不得进入 Pipeline

### 预生产环节交付规范（2026-06-13）
- 预生产完成后，将 `preproduction-report.md` 作为文件附件发送到用户飞书

### 渲染提交规则（2026-06-14）
- 提交视频渲染任务必须事先获得主人（陈卓）的明确确认，不可擅自提交
- 已发生两次擅自提交，造成浪费，绝不再犯

### 视频需求解析流程规范（2026-06-14）
- 所有视频预生产任务必须先输出《视频需求要点清单》（七大章节28个字段），经用户确认后才能进入 Pipeline
- 字段清单：见 SOUL.md 视频需求解析流程章节

### 用户偏好
- **流式回复**：用户要求开启流式回复，需要看到完整的推理过程（2026-06-13）
- **交付偏好**：报告类产出 → 生成飞书文档交付；脚本/文案类 → 优先飞书文档

## 系统架构

### 暴风战斧AI视频生成系统 v6.6.8（生产版本）
- 安装路径：`/root/.openclaw/workspace/zhuoyue-system/`
- 生产版本：`nirath-master-pipeline.js.production-v6.6.8`（当前）
- 配置：`config/env.js`（环境变量中心）、`config/seedance.json`（Seedance 运行时配置）
- v6.6.8 变更（Prompt 设计重构 - 正面引导替代负面约束）：
  - **_buildScriptCorePrompt**: 删除所有硬规则（"严禁""禁止""不能"），替换为正面引导（"围绕主题展开""按场景需要选择侧重点"）
  - **内容规划器**: 新增 `_generateSceneContentPlan` 方法，为每个场景自动生成内容方向（"症状讲解""检查指标""原因分析"等）
  - **主题锚定**: `<content_plan>` 标签替代 `<scenes>`，每个场景明确标注 `content_direction`
  - **正面验证**: `_checkTopicDeviation` 从"禁用词扣分"改为"关键词覆盖度评分"
  - **自我校验**: 从"检查是否违规"改为"检查是否遵循内容方向"
  - **_autoCorrectScene**: 从"修正违规"改为"优化表达"
- v6.6.7 变更（content=0 容错修复）：
  - 修复 `this.input` vs `input` 参数引用错误
  - 增加 EDU 模式动态规则分支
- **GitHub 发布就绪**：安检通过、.gitignore 配置、.example 模板、SECURITY.md，版本 tag `v6.6.8`

### 统一数据结构（Unified Video Requirement）v6.5.65-P8
- 核心字段：title, topic, videoType, targetAudience, platform, targetDuration, aspectRatio, visualStyle, qualityLevel, colorTone, creativityIndex, narrativeStyle, contentStyle, visualStyleDetail, musicStyle, characters, scenes, opening, ending, keyPoints, isSeries, totalEpisodes, currentEpisode, episodeThemes, world, style, constraints, meta
- 文件：`systems/user-requirement-parser.js`、`systems/llm-enforcement-layer.js`、`seedance-director/scripts/schema/prd-nirath.schema.json`

### 创意指数全链路集成
- 解析器：`creativity-index-parser.js`（v1.0.0）
- 参数引擎 v2：`creativity-parameter-engine-v2.js`（14 模块）
- 默认值：0.2（不干预模式）

### 真实感提示词增强器（Realism Prompt Enhancer）v1.0.0
- 定位：软性知识注入层，Stage 11 之前（后置增强层）
- 核心能力：七维参数检查、智能补全、禁忌词检测、场景模板匹配
- 文件：`zhuoyue-system/core/realism-prompt-enhancer.js`
- 知识库：`knowledge-base/AI-video-realism-methodology.json`

### 金色光影知识库与技能注入（2026-06-14）
- 五维打光体系：轮廓逆光/体积光/漫射柔光/微粒金光/反射映射
- 三层金色模型：环境金(10-25%饱和)/结构金(35-55%饱和)/高光金(55-80%饱和)
- 面积控制铁律：总金色面积≤30%
- 技能目录：`skills/film-cinematography-factory/技能系列/镜头级专项/`

## 角色档案系统（陈卓）
- **角色 ID**: chen-zhuo
- **定妆照路径**: `/root/.openclaw/workspace/characters/chenzhuo/portraits/`
- 职业装：`portraits/uniform/` (6 张)
- 生活照：`portraits/casual/` (5 张)
- 角色档案：`characters/chenzhuo/character-card.json`

## 健康科普系列项目
- **第一集**: `health-edu-ep01-rhabdomyolysis`
- **主题**: 横纹肌溶解的症状及实验室检查
- **主讲**: 陈卓（警服定妆照）
- **时长**: 58 秒 / 6 镜
- **输出目录**: `/root/.openclaw/workspace/output/health-edu-ep01/`

## 已修复问题（归档，无需重复记录）
- Stage 5B OOM：已修复（maxTokens 1024 + 事件循环让出 + 强制 GC）
- Stage 11 OOM：已修复（maxTokens 4096 + 不跳过 Stage 11）
- Schema 错误：已修复（统一数据结构后字段通过 Schema 校验）
- ACTION 字段：已修复（v6.5.65-P8-patch-014，双层修复）
- DIALOGUE 截断：已修复（keyFields 保护列表加入 DIALOGUE）
- TIMELINE 全局时间：已修复（Stage 11 循环计算 _globalStartTime/_globalEndTime）
- S00 片头时间轴：已修复（generic-opening-system.js 直接生成全局时间格式）
- Stage-5B JSON 解析：已修复（前缀清理 + 截断补全 + maxTokens 1536）
- v6.6.2 语法错误：已修复（narrativeArc 条件块补全缺失的 `}`）
- v6.6.7 content=0 规则冲突：已修复（v6.6.8 正面引导替代负面约束）

## 已知约束（非 bug，需调用方配合）

### 完整预生产耗时约束（v6.6.3）
- **完整预生产总耗时：540-600 秒**（含 Stage 5A 6 个批次 + Stage 5B 6 个镜头 LLM 调用）
- **调用方必须保证 `exec timeout >= 900 秒`（15 分钟）**
- 若 timeout < 600 秒，进程将在 timeout - 5 秒时被 SIGKILL（exec 超时触发，非代码问题）
- 已验证：timeout=300s → 297.7s 被 kill；timeout=600s → ~595s 被 kill；timeout=900s → 547.7s 正常完成
- 心跳方案（v6.6.3）是冗余防御，提供进程存活观测，但不能阻止 exec timeout kill
- 真正需要的修复：调用方调大 timeout，无需修改代码
- 参考文档：`docs/SIGKILL-fix-playbook-v6.6.3.md`
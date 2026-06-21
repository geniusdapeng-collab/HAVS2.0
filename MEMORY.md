# MEMORY.md - 长期记忆

## 核心规范（有效）

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

### 暴风战斧AI视频生成系统 v6.6.6（生产版本）
- 安装路径：`/root/.openclaw/workspace/zhuoyue-system/`
- 生产版本：`nirath-master-pipeline.js.production-v6.6.6`（当前）
- 配置：`config/env.js`（环境变量中心）、`config/seedance.json`（Seedance 运行时配置）
- v6.6.6 变更（角色一致性根因修复 + 检查环节升级）：
  - **Stage 4 portraits 构建**：新增 `type` 键（如 `closeup`），支持景别-specific 选择（`front_closeup` 组合键）
  - **Stage 11 angle 命名规范修复**：`anglePriority` 从驼峰（`threeQuarter`）改为连字符（`three-quarter`），与 `character-card.json` 一致
  - **Stage 11 charCoreDesc 动态构建**：从 `character-card.json` 读取 `visualAnchors` 和 `baseIdentity`，不再硬编码 `xiaoG`/`tao-tie`
  - **Stage 11 prompts 数据传递**：`prompts.push` 补充 `scene: shot.scene` 字段，确保场景信息传递到下游检查环节
  - **RenderPipelineGuard v1.1**：
    - `SCENE_DIVERSITY`：跨镜头场景重复率超过50%即报错拦截
    - `SCENE_TEMPLATE_CHECK`：拦截已知问题模板（`golden hour...`）和英文模板化场景
    - `REFERENCE_FORMAT` 修复：支持 `@imageN`（Seedance官方规范），禁止 `图片N` 和 `@ImageN`
  - **RenderQAChecker v1.1**：
    - `SCENE_SPECIFICITY`：检测场景是否通用模板化、跨镜头重复
    - `SCENE_LANGUAGE`：中文项目场景应为中文，不应纯英文
  - **STAGE_11_RENDER Prompt 升级**：LLM prompt 明确要求每个镜头场景描述必须独特、使用中文、避免英文模板
- **GitHub 发布就绪**：安检通过、.gitignore 配置、.example 模板、SECURITY.md，版本 tag `v6.6.6`

## 角色一致性修复记录（2026-06-22）

### 问题现象
S03 渲染视频中角色完全错误，不是陈卓。

### 根因分析（三层）
1. **检查环节缺失**：`RenderPipelineGuard` 和 `RenderQAChecker` 均未检查场景多样性和引用格式，未发现 `@image` 引用缺失
2. **数据链路断裂**：`stageCharacters` 构建的 `portraits` 键为 `three-quarter`（连字符），但 Stage 11 查找 `threeQuarter`（驼峰），`closeup` 类型未作为独立键，导致 `selectedAngles` 为空，`@image` 引用未注入
3. **charCoreDesc 硬编码**：只支持 `xiaoG` 和 `tao-tie`，陈卓角色没有核心描述，LLM 无法匹配参考图

### 修复方法（已固化到 v6.6.6）
- 修改 `stageCharacters` 构建 `portraits` 时添加 `type` 键（如 `closeup`）和 `angle_type` 组合键
- 修改 Stage 11 `anglePriority` 为 `['closeup', 'front', 'three-quarter', 'side', 'profile']`，匹配 `character-card.json`
- 修改 `charCoreDesc` 从 `stages.characters` 动态构建，读取 `visualAnchors` 和 `baseIdentity`
- 修改 `prompts.push` 补充 `scene` 字段
- 升级 `RenderPipelineGuard` 和 `RenderQAChecker` 增加场景相关检查
- 升级 `STAGE_11_RENDER` LLM prompt 要求场景差异化

### 验证结果
修复后 S03 渲染视频角色正确（卡通警服陈卓）。

## 角色档案系统（陈卓）
- **角色 ID**: chen-zhuo
- **定妆照路径**: `/root/.openclaw/workspace/characters/chenzhuo/portraits/`
- 职业装：`portraits/uniform/` (6 张)
- 生活照：`portraits/casual/` (5 张)
- 角色档案：`characters/chenzhuo/character-card.json`
- 卡通风格：`portraits/cartoon-uniform/` (5 张)，默认使用

## 健康科普系列项目
- **第一集**: `health-edu-ep01-rhabdomyolysis`
- **主题**: 横纹肌溶解的症状及实验室检查
- **主讲**: 陈卓（卡通警服定妆照，默认风格）
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
- v6.6.3 SIGKILL 根因：已修复（调用方 timeout 需 ≥ 900s，详见 docs/SIGKILL-fix-playbook-v6.6.3.md）
- v6.6.5 角色一致性：已修复（详见上方"角色一致性修复记录"）

## 已知约束（非 bug，需调用方配合）
- 完整预生产总耗时 540-600 秒，调用方必须设置 `exec timeout >= 900 秒`
- 参考图提交方式：base64 编码 + `@imageN` prompt 引用（已禁止上传火山引擎对象存储方案）
- 卡通风格定妆照为默认风格（绕过 Seedance 真实人像检测）
- 检查环节默认严格模式，不通过则阻止提交

## 项目更名（2026-06-21）
- 中文名：暴风战斧AI视频生成系统
- 英文名：Stormaxe AI Video System
- GitHub 仓库：https://github.com/geniusdapeng-collab/StormaxeAIVideoSystem
- 属性：私有仓库（不对外开源）
- 发布安检：`.env` 不上传、`.example` 模板、密钥用 `[REDACTED]` 替换

## 交付规范（视频生产）
- 检查环节升级后保持默认严格模式
- 修复不应破坏已有检查（服装锁定、敏感词、定妆照等）
- 视频只有第一集有片头，结尾不预告下一集
- 每集时长 59-65 秒
- 全写实风格，角色和背景均真实质感
- 场景描述必须差异化、中文、避免英文模板

<!-- OPENCLAW_CACHE_BOUNDARY -->
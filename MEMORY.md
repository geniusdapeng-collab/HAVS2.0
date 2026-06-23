# MEMORY.md - 长期记忆

## 暴风战斧 v6.7.0 第二轮修复（2026-06-24）
按外部专家《全系统致命问题深度审计（第二轮）》实施全部13项修复：

**P0 系统级连锁失效（4项）**：
- 问题1：StoryCraft 32k token + 120s超时 → LLM必然超时回退模板却报llmEnabled:true
  - 修复：story-craft-integration.js 添加 timeoutMs: 300000，generateStory追踪actualLlmSuccessCount
- 问题2：stageRender/stageCameraMovement裸用未声明input变量
  - 修复：全部替换为this.input
- 问题3：Stage 11.7/11.8 catch后passed:true
  - 修复：改为passed:false + fatal:true
- 问题4：ScreenwriterOptimizer LLM失败给60分兜底+success:true
  - 修复：失败时score+0，失败率>50%标记success:false

**P1 质量劣化（3项）**：
- 问题5：smartTruncate保护列表不含P0 25字段 → 截断时P0字段被砍
  - 修复：orient-primordial-core-v24.js 保护列表加入全部25字段P0/P1
- 问题9：Stage 9/11直接mutate storyboard引用 → 跨Stage数据污染
  - 修复：stageCameraMovement深拷贝shots数组

**P2 质量检查/审片（3项）**：
- 问题6：Stage 10连续性检查异常→默认通过
  - 修复：异常时consistent=null，检出critical issues时blocked=true
- 问题7：stageStoryboardValidation catch伪造valid:true
  - 修复：异常时valid:false + validatorCrashed:true
- 问题8：director-review-agent规则伪装LLM+阈值极低
  - 修复：添加LLM辅助深度审片(_llmAssistReview)，提高通过线

两轮审计总计修复23项，待跑预生产验证。

**P2 稳定性修复（4项）**：
- 问题10-13：全局稳定性加固
  - _createLLMEngine 添加默认 timeoutMs: 120000，防止无限等待
  - Stage 5B LLM返回null时添加fallback保护（continue而非崩溃）
  - Stage 9 创意参数配置添加可选链 `?.` 防止空指针
  - 修复Stage 8 valid状态计算逻辑，不再盲目信任validator原始状态

---

## 核心规范（有效）

### 暴风战斧 v6.7.0 全面修复（2026-06-23）
按外部专家完整方案，实施了全部10项修复（非最小可用集，全面升级）：

**修复1（源头）：Stage 7 LLM Prompt 25字段**
- 文件：`systems/llm-enforcement-layer.js`
- LLM 现在被要求一次性产出完整25字段JSON，含字符区间要求和内容规范

**修复2（映射）：stageStoryboard 25字段完整映射**
- 文件：`zhuoyue-system/core/nirath-master-pipeline.js`
- shot对象同时兼容camelCase（toStandardPrompt用）和snake_case（FieldCheckAgent用）双命名

**修复3（兜底）：toStandardPrompt 默认模板注入**
- 文件：`zhuoyue-system/core/nirath-master-pipeline.js`
- 25字段全部有默认模板，缺失时注入而非跳过
- 标签统一：【灯光/照明】→【灯光】，【色彩/色调】→【色彩】

**风险A（致命）：FieldQualityPipeline 修复结果写回prompt**
- 原代码注释写"更新prompt"但从未执行，现修复后finalShot重建prompt并写回

**风险B（致命）：FieldRepairAgent prd注入**
- 原prd永远为null导致LLM修复通道永不执行
- 改动1：nirath-master-pipeline.js 构造时注入repairer.prd
- 改动2：field-quality-pipeline.js run方法每轮运行前透传prd

**风险C（致命）：标签名不一致**
- toStandardPrompt统一标签，Stage 11.8反向提取正则兼容后缀

**风险D（高）：教育片守卫拆分**
- 负面约束、角色约束、灯光兜底从Nirath+非教育守卫拆出，所有片型强制注入

**风险E（高）：buildPromptV3 截断上限**
- 980→1500，避免字段内容被smartTruncate截断

**风险F（中）：FieldGuard长度检查**
- 新增`_checkFieldLength`方法，检查17个字段长度下限，P0不足视为error

**风险G（中）：FieldGuard阻断**
- P0未通过镜头强制走toStandardPrompt二次补洞，重新校验，标记blockedShots

**待验证项**：
- 重新运行预生产后核对10项验证清单（见专家方案第三部分）

---

### 暴风战斧 v6.7.0 全面修复（2026-06-23）
按外部专家完整方案，实施了全部10项修复（非最小可用集，全面升级）：

**修复1（源头）：Stage 7 LLM Prompt 25字段**
- 文件：`systems/llm-enforcement-layer.js`
- LLM 现在被要求一次性产出完整25字段JSON，含字符区间要求和内容规范

**修复2（映射）：stageStoryboard 25字段完整映射**
- 文件：`zhuoyue-system/core/nirath-master-pipeline.js`
- shot对象同时兼容camelCase（toStandardPrompt用）和snake_case（FieldCheckAgent用）双命名

**修复3（兜底）：toStandardPrompt 默认模板注入**
- 文件：`zhuoyue-system/core/nirath-master-pipeline.js`
- 25字段全部有默认模板，缺失时注入而非跳过
- 标签统一：【灯光/照明】→【灯光】，【色彩/色调】→【色彩】

**风险A（致命）：FieldQualityPipeline 修复结果写回prompt**
- 原代码注释写"更新prompt"但从未执行，现修复后finalShot重建prompt并写回

**风险B（致命）：FieldRepairAgent prd注入**
- 原prd永远为null导致LLM修复通道永不执行
- 改动1：nirath-master-pipeline.js 构造时注入repairer.prd
- 改动2：field-quality-pipeline.js run方法每轮运行前透传prd

**风险C（致命）：标签名不一致**
- toStandardPrompt统一标签，Stage 11.8反向提取正则兼容后缀

**风险D（高）：教育片守卫拆分**
- 负面约束、角色约束、灯光兜底从Nirath+非教育守卫拆出，所有片型强制注入

**风险E（高）：buildPromptV3截断上限**
- 980→1500，避免字段内容被smartTruncate截断

**风险F（中）：FieldGuard长度检查**
- 新增`_checkFieldLength`方法，检查17个字段长度下限，P0不足视为error

**风险G（中）：FieldGuard阻断**
- P0未通过镜头强制走toStandardPrompt二次补洞，重新校验，标记blockedShots

### 字符上限全局提升 2500→3000（2026-06-24）
卓姐要求：全局所有涉及字符上限的字段全部拉到3000。

**改动范围**：
- `nirath-master-pipeline.js`: 8处（toStandardPrompt 2500→3000、FieldGuard maxChars 2500→3000、smartTrim 2500→3000）
- `field-guard.js`: maxChars 2500→3000
- `zhuoyue-system/systems/field-guard.js`: maxChars 2500→3000（重复副本）
- `unified-shot-schema-zh.js`: PROMPT_MAX_CHARS 2500→3000（根+zhuoyue-system副本）
- `field-check/field-specs.js`: MAX_TOTAL_CHARS 2500→3000（根+zhuoyue-system副本）
- `prompt-stability-guard.js`: 稳定裁剪/恢复关键块默认参数 2500→3000（根+zhuoyue-system副本）
- `screenwriter-optimizer.js`: 注释 2500→3000
- `creative-llm-router-v1.js`: maxTokens 2500→3000
- `test-v6.7.0-quick.js/focused.js/e2e.js`: 测试用例 2500→3000
- 色温值 2500K（colorTemp）不动，非字符上限

---

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
- **视频画幅：默认横屏（16:9），除非用户明确说"竖屏"才用竖屏（9:16）**（2026-06-22 强化）

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

### 暴风战斧AI视频生成系统 v6.6.9（生产版本）
- 安装路径：`/root/.openclaw/workspace/zhuoyue-system/`
- 生产版本：`nirath-master-pipeline.js.production-v6.6.9`（当前）
- GitHub 提交：`70ceb85` → `master`
- v6.6.9 变更（场景五维空间差异化 + 运镜差异化 + 角色服装锁定）：
  - **Stage 11 场景统一增强**：`_extractSceneDescription` 生成完整五维空间描述（空间/纵深/方位/氛围/时间），替换原有短场景描述
  - **Stage 7.5 场景去重**：相邻镜头场景描述重复时自动追加镜头ID后缀
  - **Stage 5 场景名保护修复**：LLM生成的差异化场景描述优先于配置表映射，避免强制映射导致内容同质化
  - **Stage 9/11 运镜差异化**：基于镜头序号和场景内容选择 transitionType/lightingType/speedCurve，避免所有镜头使用相同运镜
  - **Stage 11 删除 movement.description 直接追加**：避免运镜内容重复出现（裸文本 + 标记文本各一次）
  - **Stage 11 【绑定定妆照】标记强化**：`@image` 引用包装为 `【绑定定妆照】@imageN...` 标记，防止稳定裁剪删除
  - **Stage 11 appearanceAnchor 服装锁定注入**：从 `character-card.json` 动态读取 `appearanceAnchor.uniform`，覆盖LLM生成的角色服装描述
  - **Stage 11 `_loadCharacterCard` 方法**：动态加载角色档案，支持任意角色（不限于 xiaoG/tao-tie）

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

## 运镜重复修复（2026-06-22）

### 问题现象
S01-S04、S06 的 prompt 中同时存在两套运镜描述：
1. `_buildDynamicLayer` 注入的英文镜头动作（如 `orbit`/`push_in`）
2. `toStandardPrompt` 补充的 `【运镜】` 完整中文描述

### 根因
`prompt-tier-architecture.js` 的 `_buildDynamicLayer` 与 `toStandardPrompt` 对 cameraMovement 双重注入。

### 修复方法
注释掉 `_buildDynamicLayer` 中的 cameraMovement 注入，由 `toStandardPrompt` 统一处理 `【运镜】` 标记。
- 文件：`systems/prompt-tier-architecture.js`
- 行：约第 250 行 `_buildDynamicLayer` 内 `if (params.cameraMovement)` 块

### 待验证
重新运行预生产后检查 S01-S06 的 prompt 是否仅剩一套运镜描述。

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
- **默认横屏 16:9，除非用户明确说"竖屏"才用 9:16**
- **S00 片头默认 8-9 秒（标题显示 + 主角出场），不是 3 秒**
- 全写实风格，角色和背景均真实质感
- 场景描述必须差异化、中文、避免英文模板

<!-- OPENCLAW_CACHE_BOUNDARY -->
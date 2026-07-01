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

## 暴风战斧 v6.7.1 硬编码全面修复（2026-06-28）
按用户要求全面消除系统硬编码，实现项目通用化。

**已修复硬编码清单（12项）：**

1. **输出路径硬编码（3处）**
   - 文件：`nirath-master-pipeline.js` (2683, 2891, 5730行)
   - 原：`./output/health-edu-ep01` → 改：`./output/${this.input?.projectName || 'project'}`

2. **五维空间描述硬编码（5种场景类型）**
   - 文件：`nirath-master-pipeline.js` (intro/explanation/demonstration/ending/generic)
   - 原：全部包含"医疗环境""肾脏结构""肌肉解剖"等硬编码描述
   - 改：基于 `worldSetting` 动态生成，通用化描述

3. **导演风格注入硬编码**
   - 文件：`nirath-master-pipeline.js` (_getDirectorStyleInjection)
   - 原：`isMedical = 包含健康/医疗/医院/科普` → 硬编码"医疗纪录片"风格
   - 改：仅保留纪录片/通用风格推断，移除医疗关键词判断

4. **角色推断硬编码**
   - 文件：`nirath-master-pipeline.js` (inferCharactersFromScene)
   - 原：仅支持 chen-nurse/coach-li/xiaoG
   - 改：添加 wukong/erlang-shen 等角色关键词

5. **默认角色硬编码**
   - 文件：`nirath-master-pipeline.js` (stageScriptGenerator)
   - 原：`defaultChars = 'chen-nurse,xiaoG,coach-li'`
   - 改：`inferDefaultCharactersFromInput()` 从输入动态推断

6. **Stage 7 LLM调用参数错误**
   - 文件：`nirath-master-pipeline.js` (4055行)
   - 原：传递 `(mappedScenes, durations, this.mode)` → 签名不匹配
   - 改：传递 `(mappedScenes, world, characters)` 匹配正确签名

7. **fallback台词硬编码**
   - 文件：`nirath-master-pipeline.js` (_buildFallbackDialogue)
   - 原：开场/结尾台词硬编码"横纹肌溶解""肌肉酸痛""肾脏"等医学术语
   - 改：从 `scene.topic || scene.title || desc` 动态提取主题

8. **fallback视觉描述硬编码**
   - 文件：`nirath-master-pipeline.js` (_buildFallbackVisualPrompt)
   - 原：硬编码"医疗科普环境""医学科普质感""健康主题元素"
   - 改：通用化描述，基于 `world.setting` 和 `sceneName`

9. **fallback narration硬编码**
   - 文件：`nirath-master-pipeline.js` (_buildFallbackNarration)
   - 原：结尾硬编码"核心要点...及时就医"
   - 改：从场景信息动态生成收束台词

10. **promptforge导演风格硬编码**
    - 文件：`promptforge-director-worker.js`
    - 原："医疗科普风格""医疗科普传播""4500K色温"
    - 改："专业风格""专业传播""自然色温"

11. **promptforge测试用例硬编码**
    - 文件：`stage84-hollywood-skill-injection.js`, `stage84-film-cinematography-injection.js`
    - 原："专业医疗科普纪录片""医院讲堂"
    - 改："专业纪录片""讲堂场景"

12. **默认角色配置硬编码**
    - 文件：`nirath-master-pipeline.js` (stageScriptGenerator)
    - 原：脚本示例默认角色 `chen-nurse`
    - 改：从输入推断或默认 `protagonist`

**验证状态：** ✅ 全部修复完成，grep 确认无硬编码路径残留。

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

## HAVS v2.1.7 迁移进度（2026-06-28）

**P0 级迁移（已完成）**:
- [x] O(n) JSON 提取算法替换（`systems/llm-output-normalizer.js`）— SIGKILL 根因修复
- [x] StabilityShield 引入（`shields/` 目录，4 个文件）
- [x] HealthMonitor 引入
- [x] LLMGateway 引入
- [x] BaselineRegistry 引入
- [x] graceful-shutdown.js 引入
- [x] 所有新增文件语法检查通过

**P1 级迁移（已完成）**:
- [x] Phase 架构引入（phases/ 目录，5 个文件）
- [x] Utils 工具层引入（engines/production-engine/utils/ 目录，9 个文件）
- [x] LLM 推理引擎引入（`systems/llm-reasoning-engine.js`）
- [x] 超时配置中心（`config/timeout-config.js` 和 `engines/production-engine/config/timeout-config.js` 双路径兼容）
- [x] 所有新增文件语法检查通过

**P2 级迁移（已完成）**:
- [x] 创意指数引擎（`engines/script-engine/core/creative-intensity-engine.js`）— L0-L5 等级 + 叙事模式桥接 + 世界设定桥接
- [x] 全局进程防护升级（`engines/process-guard.js`）— 吸收 LLM 超时悬空 rejection，不杀进程
- [x] 所有新增文件语法检查通过

**迁移完成统计**：
- P0（稳定性基础设施）：5 个文件（shields 4 + utils 1 + systems 1）
- P1（架构升级）：15 个文件（phases 5 + utils 9 + systems 1 + config 1）
- P2（功能增强）：10 个文件（script-engine 9 + engines 1）
- **总计新增：29 个文件**，全部语法验证通过

**下一步**：进入第三步（甄别验证），用 health-edu-ep01 跑通完整预生产流程验证所有新组件工作正常。

---

## HAVS v2.1.7 迁移完成（2026-06-28）

### 迁移策略
**站在巨人的肩膀上，成为新的巨人**：将 HAVS_FIXED v2.1.7-audit 的 57 个文件全部对比分析，将优势整合到本地 HAVS 系统（hyperreality-system/）。

### 迁移结果

| 类别 | 数量 | 状态 |
|------|------|------|
| HAVS_FIXED 总文件数 | 57 | 已完成 |
| 新增文件（HAVS_FIXED 独有） | 23 | 已复制到当前系统 |
| 差异文件（内容不同） | 34 | 已用 HAVS_FIXED 版本覆盖 |
| 遗留文件（当前 HAVS 独有） | 175 | 已保留不删除 |
| 语法验证 | 56/56 通过 | ✅ |

### 新增文件清单（23个）
- `package.json`, `run-promo.js`
- `config/timeout-config.js`
- `engines/production-engine/phases/` (5个阶段文件)
- `engines/production-engine/utils/` (9个工具文件)
- `shields/` (4个稳定性文件)
- `systems/llm-reasoning-engine.js`
- `utils/graceful-shutdown.js`

### 关键差异覆盖（34个）
- `production-engine.js` 重构：引入 Phase 架构
- `continuity-review-agent.js` 增强 (+136行)
- `scene-design-agent.js` 改进 (-166行，更精炼)
- `prompt-fusion-agent.js` 大幅优化 (-47行)
- `field-guard.js` / `field-standardizer.js` / `field-quality/` 全面增强
- `script-generator.js` (+33行) / `script-validator.js` (+13行)
- `global-negative-prompts.js` (+68行)
- `post-production-engine.js` (+48行)
- `rendering-engine.js` (+51行)
- `index.js` (+120行，入口升级)

### 提交信息
- Commit: `dc38b14` — `feat(havs): HAVS 系统升级至 v2.1.7-audit`
- 变更：58 文件，+5633 / -2608 行
- 仓库: StormaxeAIVideoSystem (闭源)

### 飞书报告
- `doc_id`: `KLRMdy2YKopOO5xJea0cE6uTnpg`
- URL: https://www.feishu.cn/docx/KLRMdy2YKopOO5xJea0cE6uTnpg

### 保留的本地特色
- 技能文件：skills/好莱坞工业电影技能工厂/ 下约 150 个镜头级专项
- 特殊运行入口：run-myth-wukong-erlang.js, run-preproduction-health-edu.js 等
- 文档、测试、示例、资源文件全部保留
- 生产版本备份 (`.production-v1.0.*`)

## 仓库迁移：HAVS2.0（2026-06-30）

### 背景
用户要求新建独立云端仓库，专用于 HAVS 系统代码托管，与旧仓库 StormaxeAIVideoSystem 解耦。

### 操作记录
1. **新建私有仓库**: `github.com/geniusdapeng-collab/HAVS2.0`
   - 类型: 私有仓库
   - 描述: Hyperreality AI Video System v2.0 - 好莱坞工业级AI视频自动生产系统
   - 分支: main (默认)
   - 仓库 ID: 1284209056

2. **推送代码 (第一轮)**: 本地 `master` → 远程 `main`
   - 推送内容: `hyperreality-system/` 核心代码 (267 文件, ~4.4 万行)
   - 推送方式: force-with-lease
   - 代码基线: HAVS v2.1.7-audit 完整迁移

3. **推送代码 (第二轮)**: 补充 `workspace/systems/` 模块
   - 推送内容: 215 个文件, 70,519 行代码
   - 包含模块: field-check, field-guard, field-repair, stages, story-craft-engine, beast-archive, camera-movement-systems, character compliance, render adapters 等
   - 仓库路径: `hyperreality-system/external-systems/`
   - 提交: `45e195d`

4. **远程仓库替换**:
   - 移除旧远程: `origin` → `StormaxeAIVideoSystem` (已取消关联)
   - 新远程: `origin` → `https://github.com/geniusdapeng-collab/HAVS2.0.git`
   - 本地当前分支仍为 `master`，远程为 `origin/main`

### 当前状态
- 本地仓库: `hyperreality-system/` (master 分支)
- 远程仓库: `geniusdapeng-collab/HAVS2.0` (main 分支)
- 旧仓库: `StormaxeAIVideoSystem` (已解除关联，仓库本身仍存在)
- 总代码量: ~482 文件, ~11.5 万行

### 云端仓库地址
- **HTTPS**: `https://github.com/geniusdapeng-collab/HAVS2.0`
- **SSH**: `git@github.com:geniusdapeng-collab/HAVS2.0.git`
- **Clone**: `git clone https://github.com/geniusdapeng-collab/HAVS2.0.git`

### 注意事项
- 本地 `master` 与远程 `main` 分支名不一致，后续 `git pull` 可能需要显式指定分支或使用 `--set-upstream`
- 建议操作: `git branch --set-upstream-to=origin/main master` 或本地重命名 `master` → `main`
- `external-systems/` 目录对应原 `workspace/systems/`，为保持原有引用路径不变，后续可能需要调整目录结构

---




### 已完成

#### P0 基础设施
- ✅ Hyperreality-System: 20 Topics, About优化, MCP/Plugin/Skill manifest, ROADMAP, CHANGELOG, 治理文件
- ✅ PandaCineForge: 20 Topics, MCP/Plugin/Skill manifest, ROADMAP, CHANGELOG
- ✅ Hyperreality-System v1.0.0 Release 已发布
- ⚠️ CI/CD workflow: 两个项目均因token缺少`workflow` scope未推送，已提供手动粘贴方案

#### P1 推广素材
- ✅ 社交媒体全套文案（X/Twitter、微博、即刻、V2EX、Reddit、Hacker News、掘金/知乎）
- ✅ 深度技术文章 2 篇（PandaCineForge 4053字 + Hyperreality-System 6278字）
- ✅ CI/CD 手动配置指南（含 workflow 文件内容）

### 待执行（需用户配合）
- [ ] CI/CD workflow 手动粘贴或更新token
- [ ] 社交媒体发布（需用户登录各平台账号）
- [ ] Awesome list提交（awesome-ai-agents, awesome-llm, awesome-aigc等）
- [ ] 技术文章发布到掘金/知乎/Medium/dev.to
- [ ] 60秒Demo GIF制作
- [ ] 社区建设（Discord/微信群）

### 文件清单
- `/root/.openclaw/workspace/output/social-media-kit.md` — 社交媒体文案
- `/root/.openclaw/workspace/output/panda-cineforge-deep-article.md` — PandaCineForge深度文章
- `/root/.openclaw/workspace/output/hyperreality-deep-article.md` — Hyperreality深度文章
- `/root/.openclaw/workspace/output/cicd-manual-guide.md` — CI/CD手动配置指南
- `/root/.openclaw/workspace/output/github-marketing-strategy.md` — 完整营销策略

---

按用户要求执行系统性GitHub运营优化，核心策略：**AI-First + Human-Second**（让AI Agent先发现、理解、推荐，再触达人类开发者）。

### 调研核心发现

1. **AI Agent可发现性是新赛道**：Claude Code、OpenClaw等平台正在构建技能市场，标准化 SKILL.md + MCP manifest 让AI直接"看懂"项目
2. **GitHub SEO排名因素**：Topics（20个全满）、About描述（关键词开头）、Stars（社交证明）、Release频率（动态信号）
3. **成功项目共性**：一句话定位 + 架构图 + 30秒Quick Start + 持续内容输出

### 已完成优化

#### Hyperreality-System
- ✅ 20 Topics设置（agent-framework, ai-video, ai-cinema, film-production, hollywood等）
- ✅ About描述优化："Hollywood-grade AI video production system: Multi-Agent orchestration..."
- ✅ .claude-plugin/plugin.json（Claude Code标准）
- ✅ .openclaw/skill.json（OpenClaw标准）
- ✅ mcp-server/index.js（MCP协议适配）
- ✅ ROADMAP.md（Q3 2026 - Q2 2027+ 四阶段规划）
- ✅ CHANGELOG.md（v1.0.0发布说明）
- ✅ CONTRIBUTING.md + SECURITY.md + CODE_OF_CONDUCT.md
- ✅ v1.0.0 Release已发布（StormaxeAIVideoSystem）
- ⚠️ CI/CD workflow未推送（token缺少workflow scope）

#### PandaCineForge
- ✅ 20 Topics已设置（ai-agent, skill-engine, ai-cinema等）
- ✅ .claude-plugin/plugin.json（Claude Code标准）
- ✅ .openclaw/skill.json（OpenClaw标准）
- ✅ mcp-server/index.py（Python版MCP适配）
- ✅ ROADMAP.md（3年规划）
- ✅ CHANGELOG.md（v1.0.0发布说明）
- ⚠️ CI/CD workflow未推送（token缺少workflow scope）

#### 推广素材准备
- ✅ 社交媒体发布素材包（X/Twitter、微博、即刻、V2EX、Reddit、Hacker News、掘金/知乎）
- 文件：`/root/.openclaw/workspace/output/social-media-kit.md`

### 预期KPI

- 短期1个月：PandaCineForge 50-100 stars，Hyperreality 30-50 stars
- 中期3个月：PandaCineForge 300-500 stars，Hyperreality 200-300 stars
- 核心定位：PandaCineForge = **全球首个面向AI Agent的影视技能生成引擎**；Hyperreality = **面向好莱坞工业级标准的AI视频自动生产系统**

### 待办事项

- [ ] CI/CD workflow推送（需workflow scope token）
- [ ] 社交媒体发布执行（需用户确认或授权发布）
- [ ] Awesome list提交（awesome-ai-agents, awesome-llm等）
- [ ] AI Agent目录提交（smithery.ai, skills.mp, OpenClaw marketplace）
- [ ] 深度技术文章发布（掘金/知乎/Medium/dev.to）
- [ ] 60秒Demo GIF制作
- [ ] 社区建设（Discord/微信群）

---
# 卓越视频生成系统 - Stage 5 LLM 剧本生成问题技术文档

**文档版本**: v1.0  
**生成日期**: 2026-06-20  
**问题分类**: LLM 内容生成偏离（主题漂移）  
**涉及系统**: 卓越视频生成系统 v6.6.3-fix-2 / v6.6.5  
**文档状态**: ✅ 已验证（代码和日志均来自实际系统）

---

## 1. 系统架构与业务背景

### 1.1 系统定位

卓越视频生成系统（NirathMasterPipeline）是一个端到端的 AI 视频预生产系统，输入为视频需求（主题、时长、场景等），输出为可直接提交给视频渲染引擎（Seedance）的完整提示词（Prompt）和分镜脚本。

### 1.2 核心 Pipeline 阶段

系统包含 17+ 个阶段（Stage），其中 **Stage 5（剧本生成）** 是内容生成的核心环节：

```
STAGE-1: PRD 生成（需求文档）
STAGE-2: 需求对齐验证
STAGE-3: Schema 校验
STAGE-4: 角色系统
STAGE-5: 剧本生成（本问题涉及环节）← 问题发生点
STAGE-5A: 剧本骨架生成（Phase A）
STAGE-5B: 视觉提示词生成（Phase B）
STAGE-6: 时长分配
STAGE-7: 故事板生成
STAGE-9: 运镜系统
STAGE-11: 渲染 Prompt 生成
STAGE-16: 最终输出
```

### 1.3 业务场景

我们正在制作一个健康科普系列视频，主讲人为陈卓（穿警服的护士）。

- **第一集**: 横纹肌溶解的症状及实验室检查（已完成）
- **第二集**: 横纹肌溶解的原因分析（本问题涉及项目）

项目名称: `health-edu-ep02-rhabdomyolysis-causes`

---

## 2. 问题描述

### 2.1 核心问题

在运行第二集（原因分析主题）时，**Stage 5 的 LLM 剧本生成环节始终生成第一集的内容（症状描述）**，而非第二集要求的原因分析内容。

### 2.2 具体表现

LLM 生成的剧本内容包含以下症状描述关键词（来自实际日志）：
- "横纹肌溶解最典型的症状就是肌肉疼痛、无力，尿液颜色加深，像酱油色或者浓茶色"
- "横纹肌溶解最典型的三个症状：肌肉剧烈疼痛、浑身明显无力，以及尿液颜色变深，像浓茶或者酱油色"
- "到了医院，医生主要看两个指标：血里的肌酸激酶高不高，还有尿液是不是变成了浓茶色"
- "我是陈卓。横纹肌溶解最典型的症状就是肌肉剧烈疼痛、明显无力，尿液会变成酱油色。实验室检查关键看肌酸激..."

而期望的内容应该是：
- 运动过度导致肌肉损伤的机制
- 药物因素（他汀类/抗生素）如何诱发
- 饮食因素（饮酒/极端节食/生酮）的影响
- 高温脱水的机制
- 外伤、感染、代谢性疾病的诱因

### 2.3 场景名称被篡改

LLM 不仅生成错误内容，还**修改了场景名称**：

| PRD 定义名称（正确） | LLM 生成名称（错误） |
|---------------------|---------------------|
| 运动过度-最常见原因 | 核心症状讲解 |
| 药物和饮食因素 | 症状与实验室检查 |
| 高温和脱水 | 症状与实验室检查 |
| 其他原因和易感人群 | 实验室检查与尿液变化 |

### 2.4 历史运行记录

多次运行均出现相同问题：

| 会话 ID | 时间 | 结果 |
|---------|------|------|
| salty-cr | 21:29 | 内容偏离（症状描述） |
| calm-pin | 21:44 | 内容偏离 |
| brisk-re | 21:56 | 内容偏离 |
| briny-se | 22:15 | 内容偏离 |
| quiet-co | 22:27 | 内容偏离 |
| brisk-ri | 22:36 | 内容偏离 |
| delta-tr | 22:49 | 内容偏离 |
| cool-com | 22:57 | 内容偏离 |
| cool-harbor | 23:12 | 内容偏离 |
| kind-cove | 23:19 | **最终通过**（原因见第4节） |

---

## 3. 相关代码与业务逻辑

### 3.1 核心文件

- **主文件**: `/root/.openclaw/workspace/zhuoyue-system/core/nirath-master-pipeline.js`
- **运行脚本**: `/root/.openclaw/workspace/run-health-edu-ep02.js`
- **输出目录**: `/root/.openclaw/workspace/output/health-edu-ep02/`

### 3.2 Stage 5 代码流程

```javascript
// Stage 5 入口函数（约第1954行）
async stageScriptGeneration(input, prd) {
  // 1. 检查自定义 scriptAgent（如果存在）
  if (input.scriptAgent && typeof input.scriptAgent.generate === 'function') {
    script = await input.scriptAgent.generate({...});
  }
  // 2. 检查 StoryCraft（遗留系统）
  else if (input?.storyCraftVersion || input?.enableStoryCraft) {
    // 使用 StoryCraft 生成
  }
  // 3. 默认路径：LLM 同步生成
  else if (this.useLLM) {
    script = await this._llmGenerateScript(input, prd);
  }
}

// _llmGenerateScript 内部实现（约第2154行）
async _llmGenerateScript(input, prd) {
  // Phase A: 生成剧本骨架（dialogue, action, scene 等）
  const phaseAScenes = await this._generateScriptCorePhase(input);
  
  // Phase B: 生成视觉提示词（visualPrompt）
  const phaseBScenes = await this._generateVisualPromptPhase({...});
  
  return { scenes: phaseBScenes, ... };
}
```

### 3.3 Phase A: _generateScriptCorePhase

这是问题发生的核心环节。该函数：

1. 使用 `LLMEngine` 调用 `kimi-k2p6` 模型
2. 通过 `_buildScriptCorePrompt` 构建 prompt
3. 调用 `llm.reasonStructured(prompt, schema)` 生成结构化 JSON
4. 返回 scenes 数组（包含 dialogue, action, scene 等字段）

**关键参数**（来自实际代码）：
```javascript
const llm = new LLMEngine({
  model: 'kimi-k2p6',
  mode: 'production',
  maxRetries: 3,
  maxTokens: 3072,
  temperature: 1,   // 固定 temperature=1
  topP: 0.95,       // 固定 top_p=0.95
  timeoutMs: 120000
});
```

### 3.4 Prompt 构建: _buildScriptCorePrompt

这是与 LLM 交互的核心 prompt。我已多次修改此函数，但效果有限。

**当前版本的关键约束**（v6.6.4-fix-3，来自实际代码）：

```javascript
// 核心指令（置顶强化）
parts.push(`【核心指令 - 不可违反】`);
parts.push(`- 视频主题是:"${topic || '未指定'}"`);
parts.push(`- 这是系列第二集，第一集已完整讲解症状表现，本集必须聚焦原因分析`);
parts.push(`- 所有台词(dialogue)必须严格围绕上述主题展开，讲解导致该问题的原因和机制`);
parts.push(`- 严禁讲解症状描述（如肌肉疼痛、肿胀、无力、尿液颜色变化等），第一集已覆盖`);
parts.push(`- 严禁讲解实验室检查结果（如肌酸激酶升高、肌红蛋白阳性等），第一集已覆盖`);
parts.push(`- 必须讲解的原因包括：运动过度、药物因素、他汀类/抗生素、饮食因素、饮酒/节食/生酮、高温脱水、外伤挤压、感染、代谢疾病`);
parts.push(`- 【绝对禁止】如果你生成症状描述，输出将被视为错误并丢弃，你需要重新生成`);

// 场景内容强制要求
parts.push(`【场景内容强制要求】`);
parts.push(`- 以下每个场景的描述中包含了本场景必须讲解的具体内容`);
parts.push(`- 你的dialogue必须严格基于这些描述生成，不得自行发挥`);
parts.push(`- 如果场景描述要求讲解"运动过度"，你必须讲解运动过度，不能讲症状`);

// 正误示例
parts.push(`【正确示例】`);
parts.push(`场景名称: 运动过度-最常见原因`);
parts.push(`dialogue: 运动过度是横纹肌溶解最常见的原因。突然进行大量剧烈运动，比如举重、长跑，肌肉会严重受损。`);
parts.push(`action: 双手做出举重姿势，随后模拟跑步动作`);
parts.push(`\n【错误示例】`);
parts.push(`场景名称: 核心症状讲解`);
parts.push(`dialogue: 横纹肌溶解最典型的症状，就是肌肉剧烈疼痛...`);
parts.push(`action: 左手平举至胸前模拟肌肉位置`);
parts.push(`\n注意：上面的错误示例是上一集的内容，本集必须讲解原因，不是症状。`);

// 生成要求
parts.push(`1. scene:必须使用上面【场景列表】中提供的名称，禁止修改、禁止优化、禁止重写。直接复制使用。`);
parts.push(`2. dialogue:必须严格基于【场景内容强制要求】中列出的具体内容生成，讲解原因和机制。禁止自行发挥。`);
```

### 3.5 LLM 输出处理

```javascript
// 从 LLM 返回提取场景数据（约第2254行）
const normalized = batch.map((srcScene) => {
  const generated = result.data.scenes.find((x) => x.id === srcScene.id) || {};
  return {
    ...srcScene,
    scene: generated.scene || srcScene.name || '',
    dialogue: generated.dialogue || this._buildFallbackDialogue(srcScene, input.characters),
    narration: '', // 旁白已禁用
    action: generated.action || '',
    characters: finalChars,
    mouthAction: generated.mouthAction || 'speaking_normal',
    emotionPhase: generated.emotionPhase || this._inferEmotionPhase(srcScene),
  };
});
```

---

## 4. 已尝试的修复方案

### 4.1 方案一：强化 Prompt 约束（未完全生效）

**修改内容**：
1. 将核心指令置顶并加粗
2. 添加【绝对禁止】条款，威胁丢弃错误输出
3. 添加场景内容强制要求，绑定场景描述
4. 添加正确/错误示例对比
5. 修改生成要求，明确禁止修改场景名称

**效果**：LLM 仍然生成症状描述，但场景名称有时会被修改（如"核心症状讲解"）。

**根因分析**：LLM 的 reasoning 与 content 分离机制。当 content=0 时，系统从 reasoning 中提取内容，而 reasoning 中 LLM 并未遵循约束。

### 4.2 方案二：自定义 scriptAgent（最终解决方案）

在 `run-health-edu-ep02.js` 中直接提供剧本内容，跳过 LLM 生成：

```javascript
const input = {
  // ... 其他配置
  scriptAgent: {
    generate: async ({ prd, core, world, mode }) => {
      return {
        scenes: [
          {
            id: 'S01',
            scene: '开场-引入主题',
            dialogue: '大家好，我是陈卓。上一集我们讲了横纹肌溶解的症状，今天我们来聊聊更重要的——为什么会发生横纹肌溶解。',
            action: '身穿警服，挺胸站立，双手自然贴于裤缝，面向镜头点头致意，随后双手展开做引入手势',
            // ... 其他字段
          },
          // ... 其他 5 个场景
        ]
      };
    }
  }
};
```

**效果**：✅ 成功。Stage 5 直接采用自定义内容，跳过 LLM 生成。

---

## 5. 期望效果与需求

### 5.1 期望效果

我们希望系统能够**自动**根据视频主题生成正确的剧本内容，而不是：
- 手动编写每个场景的剧本（当前 workaround）
- 依赖 LLM 的随机性

### 5.2 具体需求

1. **主题一致性**：当主题明确为"原因分析"时，LLM 应生成原因分析内容，而非默认的症状描述模板
2. **场景名称保护**：LLM 不应修改 PRD 定义的场景名称
3. **系列内容感知**：系统应能识别系列中的不同集数，避免内容重复
4. **可扩展性**：未来制作第三集（治疗方案）、第四集（预防措施）时，应能自动适配主题

---

## 6. 需要外部专家协助的问题

### 6.1 核心问题

**为什么 LLM 在拥有明确约束的情况下，仍然生成与主题不符的内容？**

具体表现为：
1. Prompt 中明确禁止生成症状描述，但 LLM 仍然生成
2. Prompt 中明确要求讲解原因机制，但 LLM 忽略
3. 即使添加正误示例和威胁性语言（"生成将被丢弃"），LLM 仍然不遵循

### 6.2 可能的根因方向（供专家参考）

1. **模型层面**：kimi-k2p6 的 reasoning 机制是否导致指令遵循率下降？
   - 观察到 content=0 时，系统从 reasoning 中提取内容
   - reasoning 中的思考过程似乎不受 prompt 约束影响

2. **Prompt 设计层面**：当前的约束方式是否适合 LLM 的理解模式？
   - 否定性约束（"不要生成X"）是否比肯定性约束（"必须生成Y"）效果差？
   - 是否需要更结构化的 prompt（如 XML 标签、JSON 示例）？

3. **系统架构层面**：
   - 是否需要在校验层（Stage 5 之后）添加主题一致性检查？
   - 是否需要后处理（检测到偏离时自动重试）？
   - 是否需要更换 LLM 模型（如使用更强的推理模型）？

4. **训练数据层面**：
   - LLM 是否因为训练数据中"横纹肌溶解"与"症状描述"强关联，导致无法切换？
   - 是否需要 few-shot 示例来"覆盖"默认关联？

### 6.3 建议的解决方向

请外部专家评估以下方案的可行性：

**A. 架构级修复**
- 在 Stage 5 之后添加自动校验层（主题关键词检测）
- 如果检测到偏离，自动重试（带反馈提示）
- 实现"后处理自我修正"机制

**B. Prompt 工程优化**
- 重构 prompt 结构，使用更明确的指令格式
- 添加 few-shot 示例（提供完整的正确 JSON 示例）
- 将否定性约束改为肯定性约束

**C. 模型调整**
- 评估是否更换 LLM 模型（如使用更强的推理模型）
- 调整 temperature/top_p 参数（当前固定为 1/0.95）
- 测试不同模型的指令遵循率

**D. 数据流修复**
- 在 Stage 1（PRD 生成）时，强化"原因分析"关键词
- 确保后续阶段（Stage 5）能接收到正确主题信息
- 添加主题传播链路的完整性检查

---

## 7. 附件与参考

### 7.1 相关文件路径

- 核心代码: `/root/.openclaw/workspace/zhuoyue-system/core/nirath-master-pipeline.js`
- 运行脚本: `/root/.openclaw/workspace/run-health-edu-ep02.js`
- 输出结果: `/root/.openclaw/workspace/output/health-edu-ep02/preproduction-result.json`
- 预生产报告: `/root/.openclaw/workspace/output/health-edu-ep02/preproduction-report.md`
- 调试日志: `/root/.openclaw/workspace/debug_llm/`

### 7.2 关键函数位置

| 函数名 | 文件 | 行号 | 说明 |
|--------|------|------|------|
| `stageScriptGeneration` | nirath-master-pipeline.js | ~1954 | Stage 5 入口 |
| `_llmGenerateScript` | nirath-master-pipeline.js | ~2154 | LLM 生成主函数 |
| `_generateScriptCorePhase` | nirath-master-pipeline.js | ~2154 | Phase A 骨架生成 |
| `_buildScriptCorePrompt` | nirath-master-pipeline.js | ~2554 | Prompt 构建 |
| `_generateVisualPromptPhase` | nirath-master-pipeline.js | ~2354 | Phase B 视觉生成 |
| `_buildVisualPrompt` | nirath-master-pipeline.js | ~2754 | 视觉 Prompt 构建 |

> **注**: 行号为近似值，因版本迭代可能略有偏差。请以函数名搜索为准。

### 7.3 系统版本信息

- 当前运行版本: `v6.6.3-fix-2`
- 生产版本: `v6.6.5`（已修复 Nirath 元素隔离和 TIMELINE 全局化）
- LLM 模型: `kimi-k2p6`
- 固定参数: `temperature=1, topP=0.95`

---

## 附录 A: 真实调试日志摘录

以下日志来自实际系统运行，证明 LLM 生成症状描述而非原因分析。

### A.1 日志文件: `1781625906651_json_extract_fail_content.txt`

```
2. S02: content | 台词字数:63 | 重要性:6 | 视觉复杂度:5 | 内容:"横纹肌溶解最典型的症状就是肌肉疼痛、无力，尿液颜色加深，像酱油色或者浓茶色。如果你运动后出现这种情况..."
3. S03: content | 台词字数:46 | 重要性:6 | 视觉复杂度:5 | 内容:"横纹肌溶解最典型的三个症状：肌肉剧烈疼痛、浑身明显无力，以及尿液颜色变深，像浓茶或者酱油色。..."
4. S04: content | 台词字数:40 | 重要性:6 | 视觉复杂度:5 | 内容:"到了医院，医生主要看两个指标：血里的肌酸激酶高不高，还有尿液是不是变成了浓茶色。..."
5. S05: content | 台词字数:71 | 重要性:6 | 视觉复杂度:5 | 内容:"我是陈卓。横纹肌溶解最典型的症状就是肌肉剧烈疼痛、明显无力，尿液会变成酱油色。实验室检查关键看肌酸激..."
- S02和S03和S05都讲了"三个典型症状"（肌肉疼痛、无力、尿液颜色变深）
```

### A.2 日志文件: `1781961607415_empty_content_reasoning.txt`

此日志显示 LLM 的 reasoning 过程（思考过程）长达数千字，但最终 content=0，系统被迫从 reasoning 中提取内容。这证实了 **reasoning 与 content 分离机制** 是问题根因之一。

---

## 附录 B: 不确定内容标注

| 内容 | 确定性 | 说明 |
|------|--------|------|
| 代码片段 | ✅ 确定 | 直接复制自实际代码文件 |
| 症状关键词 | ✅ 确定 | 来自实际调试日志 |
| 场景名称对比 | ✅ 确定 | 来自实际输出结果 |
| 历史运行记录 | ✅ 确定 | 来自系统会话日志 |
| 行号 | ⚠️ 近似 | 因版本迭代可能略有偏差 |
| 根因分析 | ⚠️ 推断 | 基于观察的合理推断，未经严格验证 |
| 模型参数 | ✅ 确定 | 来自实际代码配置 |

---

**问题提交者**: 小G（AI 助手）  
**项目所有者**: 陈卓（卓姐）  
**系统用途**: 健康科普视频系列制作  
**期望交付**: 可自动根据主题生成正确剧本的 Stage 5 系统

---

*本文档供外部专家诊断参考。如需更多代码片段或日志信息，请随时联系。*

# 暴风战斧AI视频生成系统 v6.6.6 修复总结

## 修复日期
2026-06-22

## 问题现象
S03 渲染视频中角色完全错误，不是陈卓。

## 根因分析（三层）

### 第一层：检查环节缺失
`RenderPipelineGuard` 和 `RenderQAChecker` 均未检查：
- 场景多样性（各镜头场景是否重复）
- 场景模板化（是否使用英文通用模板）
- 引用格式正确性（是否使用 `@imageN`）

导致 `@image` 引用缺失、场景模板化、英文场景描述等问题未被拦截。

### 第二层：数据链路断裂
`stageCharacters` 构建的 `portraits` 对象：
- 键名使用连字符（`three-quarter`），与 `character-card.json` 一致
- 但 Stage 11 查找时使用驼峰（`threeQuarter`），完全不匹配
- `closeup` 类型未作为独立键，特写景别无法找到对应肖像

结果：`selectedAngles` 为空，`@image` 引用未注入 prompt。

### 第三层：charCoreDesc 硬编码
```js
const charCoreDesc = {
  'xiaoG': ['银灰装甲', '东亚面孔短发', '年轻男性'],
  'tao-tie': ['碳化硅质甲壳', '腋下双眼', '巨口能量涡流']
};
```
只支持两个硬编码角色，陈卓（`chen-zhuo`）没有核心描述，LLM 无法匹配参考图。

## 修复方法（已固化到 v6.6.6）

### 1. Stage 4 portraits 构建（`nirath-master-pipeline.js`）
新增 `type` 键和 `angle_type` 组合键：
```js
// 按 type 添加键（如 closeup, full-body），支持景别-specific选择
if (p.type && !portraits[p.type]) {
  portraits[p.type] = p.file;
}
// 同时添加 angle_type 组合键，如 front_closeup
if (p.type) {
  const comboKey = `${p.angle}_${p.type}`;
  if (!portraits[comboKey]) {
    portraits[comboKey] = p.file;
  }
}
```

### 2. Stage 11 angle 命名规范（`nirath-master-pipeline.js`）
`anglePriority` 从驼峰改为连字符：
```js
// v6.6.5-fix: anglePriority 使用 character-card.json 中的 angle 命名规范（连字符而非驼峰）
const anglePriority = ['closeup', 'front', 'three-quarter', 'side', 'profile'];
```

`bestAngle` 选择逻辑：
```js
let bestAngle = isCloseup ? 'closeup' : (isWide ? 'front' : 'three-quarter');
```

### 3. Stage 11 charCoreDesc 动态构建（`nirath-master-pipeline.js`）
从 `stages.characters` 读取角色档案：
```js
let charCoreDesc = {};
for (const [cid, cdata] of Object.entries(stages.characters || {})) {
  const profile = cdata?.profile || {};
  const visualAnchors = profile?.visualAnchors?.required || [];
  const baseId = profile?.baseIdentity || {};
  const visId = profile?.visualIdentity || {};
  const coreFeatures = [];
  if (baseId.gender) coreFeatures.push(`${baseId.gender === 'female' ? '女性' : '男性'}面孔`);
  if (visId.hair) coreFeatures.push(`${visId.hair}色发型`);
  if (visualAnchors.length > 0) coreFeatures.push(visualAnchors[0]);
  while (coreFeatures.length < 3) coreFeatures.push('核心特征');
  charCoreDesc[cid] = coreFeatures.slice(0, 3);
}
```

### 4. Stage 11 数据传递（`nirath-master-pipeline.js`）
`prompts.push` 补充 `scene` 字段：
```js
prompts.push({
  id: shot.id,
  shotId: shot.id,
  type: mappedType,
  scene: shot.scene || '未指定', // v1.1-fix: 保留场景字段供检查环节使用
  prompt,
  content,
  // ...
});
```

### 5. RenderPipelineGuard v1.1（`scripts/render-pipeline-guard.js`）
新增检查：
- `SCENE_DIVERSITY`（错误级）：跨镜头场景重复率超过 50% 即报错拦截
- `SCENE_TEMPLATE_CHECK`（错误级）：拦截已知问题模板（`golden hour...`）和英文模板化场景
- `REFERENCE_FORMAT` 修复：支持 `@imageN`（Seedance 官方规范），禁止 `图片N` 和 `@ImageN`

### 6. RenderQAChecker v1.1（`scripts/render-qa-checker.js`）
新增检查：
- `SCENE_SPECIFICITY`（错误级）：检测场景是否通用模板化、跨镜头重复
- `SCENE_LANGUAGE`（警告级）：中文项目场景应为中文，不应纯英文

### 7. STAGE_11_RENDER LLM Prompt（`systems/llm-enforcement-layer.js`）
明确要求：
- 每个镜头的场景描述必须独特，不能与其他镜头重复
- 场景描述必须具体、丰富，包含环境、光线、氛围等细节
- 教育片场景应使用中文描述，避免英文通用模板（如 `golden hour` 等）
- 角色动作必须动态丰富
- 必须注入 `@image` 引用（如果角色有定妆照）

## 验证结果
修复后 S03 渲染视频角色正确（卡通警服陈卓）。

## 关联文件
- `zhuoyue-system/core/nirath-master-pipeline.js`（Stage 4, Stage 11）
- `scripts/render-pipeline-guard.js`（v1.1）
- `scripts/render-qa-checker.js`（v1.1）
- `systems/llm-enforcement-layer.js`（STAGE_11_RENDER）
- `MEMORY.md`（长期记忆）

## 版本信息
- 版本号：v6.6.6
- 提交：076f3f7
- 仓库：https://github.com/geniusdapeng-collab/StormaxeAIVideoSystem
- 状态：已推送 master 分支

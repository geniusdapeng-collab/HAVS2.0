# 视频生成系统 SIGKILL 问题分析报告

> 生成时间：2026-06-16  
> 系统版本：v6.5.65-P8-patch-014  
> 分析对象：横纹肌溶解科普视频预生产 Pipeline

---

## 一、问题概述

### 1.1 现象

视频预生产 Pipeline 在执行过程中被系统 **SIGKILL** 强制终止，导致无法完成端到端的预生产流程。

**具体表现：**
- 主进程直接被杀：`- Exit code: null, signal: SIGKILL`
- 子代理（subagent）超时：`status: timed out`
- 无错误日志、无异常堆栈，进程突然消失

### 1.2 影响范围

| 场景 | 结果 |
|------|------|
| 主进程直接执行 Pipeline | ❌ Stage 5A batch 4/6 或 Stage 11 被杀 |
| 子代理执行 Pipeline | ❌ Stage 5A batch 4/6 被杀，超时 |
| 单元测试（单函数） | ✅ 通过 |
| Patch-013 之前完整 Pipeline | ✅ 曾成功（83分/B级/PASS） |

### 1.3 关键时间线

| 时间 | 事件 |
|------|------|
| 2026-06-14 17:57 | Patch-012 完整 Pipeline 成功（最后一次成功） |
| 2026-06-16 12:59 | Patch-013 子代理成功（83分/B级/PASS） |
| 2026-06-16 13:06 | Patch-013 主进程 Stage 11 被杀 |
| 2026-06-16 14:41 | Patch-014 主进程 Stage 11 被杀 |
| 2026-06-16 15:02 | Patch-014 子代理 Stage 5A 被杀 |

---

## 二、系统环境信息

### 2.1 硬件/容器资源

```
总内存：7.5 GB
可用内存：5.6 GB
Swap：4.0 GB（未使用）
Node.js Heap Limit：2.2 GB（v8.getHeapStatistics().heap_size_limit）

max locked memory：983720 kB
max memory size：unlimited
stack size：8192 kB
max user processes：30429
virtual memory：unlimited
```

**关键发现：**
- 系统总内存充足（5.6GB 可用），但 Node.js 默认堆限制仅 2.2GB
- 没有看到 OOM Killer 的 dmesg 日志（说明不是 Linux OOM）
- 怀疑是容器层面的资源限制或 Node.js 堆内存不足

### 2.2 运行时环境

```
OS: Linux 6.8.0-71-generic (x64)
Node.js: v24.15.0
OpenClaw: agent=main | host=VM-91-189-ubuntu
Model: kimi/k2p6
```

---

## 三、Pipeline 架构与失败阶段

### 3.1 Pipeline 阶段概览

我们的预生产 Pipeline 包含 25+ 个 Stage：

```
Stage 0: 用户需求解析
Stage 1: PRD 生成（LLM驱动）
Stage 2: 需求对齐（LLM驱动）
Stage 3: Schema 校验
Stage 4: 角色系统
Stage 5: 剧本生成（LLM驱动）
  ├── 5A: 剧本核心（6批次，每批次1镜）
  └── 5B: VisualPrompt 生成（6批次）
Stage 6: 时长分配（LLM驱动）
Stage 7: 故事板生成（LLM驱动）
  ├── 7.2: 主角主动性注入
  ├── 7.3: narration 清除
  ├── 7.4: 时长-字数校准
  └── 7.5: 片头生成
Stage 8: 故事板校验
Stage 8.4: 电影摄影技能注入
Stage 9: 运镜系统（LLM驱动）
Stage 10: 连续性检查
Stage 10.5: 渲染前置检查
Stage 11: 渲染核心（LLM驱动）⚠️ 常在此被杀
Stage 12: Prompt 空间利用率优化
Stage 13: 最终校验
```

### 3.2 失败阶段分析

**失败位置 1：Stage 5A（剧本生成）**
- 批次 4/6 时进程被杀
- 此时已执行约 6-10 分钟
- 已消耗大量 LLM API 调用和内存

**失败位置 2：Stage 11（渲染核心）**
- 进入 Stage 11 后不久被杀
- 此时 Pipeline 已运行约 8-15 分钟
- 是所有阶段中内存消耗最大的环节

**Stage 11 的内存密集操作：**
```javascript
// 对 7 个镜头逐一执行：
1. LLM 渲染优化（每个镜头 1 次 API 调用）
2. buildPromptV3() - 构建视觉 Prompt
3. toStandardPrompt() - 转换为 L1-L9 标准格式
4. ensureFinalPromptStructure() - 补齐缺失字段
5. 注入定妆照引用（@image）
6. 写实增强器（Realism Enhancer）
7. 金色光影技能注入
8. 叙事弧线注入
9. 风格锁/负面约束注入
10. 角色约束注入
```

---

## 四、代码层面的内存消耗点

### 4.1 LLM Engine 内存占用

```javascript
// llm-reasoning-engine.js
class LLMEngine {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 4096;  // 最大输出
    this.contextWindow = options.contextWindow || 8192;  // 上下文窗口
    this.conversationHistory = [];  // 对话历史累积
    this.stats = { totalCalls: 0, totalTokens: 0, ... };
  }
}
```

**问题：**
- `conversationHistory` 未清理，每次 API 调用后累积
- `reasoning_content` 可能非常长（有时 4000+ tokens）
- Stage 5A 循环 6 次，Stage 11 循环 7 次，历史不断累积

### 4.2 Pipeline 主循环中的数据累积

```javascript
// nirath-master-pipeline.js Stage 11 循环
for (let i = 0; i < storyboard.shots.length; i++) {
  const shot = storyboard.shots[i];
  
  // 1. 每次循环都操作完整的 storyboard 对象
  // 2. shot.prompt 被多次修改和重新赋值
  // 3. referenceImages 数组可能累积大量图像数据
  
  // 渲染核心调用
  const renderResult = this.modules.renderCore.buildPromptV3({...});
  
  // 大量的字符串拼接操作
  prompt = this.toStandardPrompt(shot, prompt);
  prompt = this.ensureFinalPromptStructure(shot, prompt);
  
  // 各种增强器注入
  prompt = this.injectRealismEnhancement(prompt);
  prompt = this.injectGoldenLighting(prompt);
  // ... 更多注入
  
  shot.prompt = prompt;  // 保存回 shot 对象
}
```

### 4.3 Prompt 字符串膨胀

**原始视觉描述** → **buildPromptV3** → **toStandardPrompt (L1-L9)** → **各种增强器注入** → **最终 Prompt**

每个镜头的 Prompt 从几百字符膨胀到 1000-1500 字符，且过程中存在多次字符串复制。

### 4.4 已尝试的缓解措施（未生效）

| 措施 | 文件 | 状态 |
|------|------|------|
| Stage 5B maxTokens 1024→1536 | nirath-master-pipeline.js | ✅ 已应用 |
| Stage 5 单镜头循环 + GC | nirath-master-pipeline.js | ✅ 已应用 |
| 不跳过 Stage 11 | nirath-master-pipeline.js | ✅ 已应用 |
| 增大 yieldMs/timeout | run-preproduction-v3.js | ❌ 未生效 |
| 使用子代理隔离执行 | sessions_spawn | ❌ 仍被杀 |

---

## 五、成功与失败的对比

### 5.1 最后一次成功运行（Patch-012，2026-06-14 17:57）

- 质量评分：**83分 / B级 / PASS**
- 完整执行时间：约 566 秒（~9.5 分钟）
- 无 SIGKILL
- 环境：相同服务器、相同代码版本

### 5.2 后续失败运行（Patch-013/014）

- 相同服务器、相同（或更少）的代码量
- 却在 Stage 5A 或 Stage 11 被杀

**关键差异推测：**
1. **并发负载**：服务器上可能有其他进程占用了内存
2. **Node.js 堆碎片化**：长时间运行后堆内存碎片化
3. **API 响应体积变化**：某些 LLM 返回的内容比之前更大
4. **OpenClaw 主进程与子进程的资源竞争**：主进程和子代理共享资源

---

## 六、已应用的代码修改（Patch-013/014）

### 6.1 Patch-013 修改

| 修改 | 文件 | 说明 |
|------|------|------|
| S00 全局时间轴 | generic-opening-system.js | 源头生成 `00:00-00:09` 格式 |
| Stage-5B maxTokens | nirath-master-pipeline.js | 1024→1536，避免 JSON 截断 |
| JSON 提取增强 | llm-reasoning-engine.js | 前缀清理 + 截断补全 |
| reasonStructured 约束 | llm-reasoning-engine.js | 禁止字数检查/纯文本 |

### 6.2 Patch-014 修改

| 修改 | 文件 | 说明 |
|------|------|------|
| buildPromptV3 action 参数 | orient-primordial-core-v24.js | 接收并注入 `【动作】` 标记 |
| Pipeline action 传参 | nirath-master-pipeline.js | 调用时传入 `shot.action` |
| 修复重复注入 | orient-primordial-core-v24.js | 删除重复的 action 注入代码 |

**注意**：Patch-014 的修改是轻量级的字符串操作，不应显著增加内存消耗。

---

## 七、错误日志与诊断信息

### 7.1 主进程被杀日志

```
[STAGE-11] INFO: 渲染核心(v6.5.64-P0: LLM驱动)
[[LLM-ENFORCE] STAGE-11 开始 | 关键链路: 是] INFO: undefined
Process exited with signal SIGKILL.
```

### 7.2 子代理被杀日志

```
[LLMEngine] ✅ API完成 | Tokens: 3904 | content=349 | reasoning=5355
[STAGE-5A] INFO: ✅ 批次 3 成功
[STAGE-5A] INFO: 🧩 批次 4/6 | 镜数: 1 | Prompt: 1816字符
...
status: timed out
result: The pipeline was killed during Stage 5A (script generation, batch 4/6)
```

### 7.3 系统级诊断

```bash
# dmesg 无 OOM 日志
$ dmesg | grep -i "killed\|oom\|sigkill"
(no output)

# 内存状态（运行时）
Mem: 7.5Gi total, 1.9Gi used, 3.5Gi free, 2.5Gi buff/cache
Swap: 4.0Gi total, 0B used

# Node.js 堆限制
Heap limit: 2240 MB
```

---

## 八、期望结果

### 8.1 短期目标

1. **完整 Pipeline 能稳定执行完毕**，不再被 SIGKILL
2. **质量评分保持 83分/B级/PASS 或更高**
3. **S01-S06 的 Prompt 中包含 ACTION 字段**

### 8.2 长期目标

1. 建立可复现的、稳定的预生产环境
2. 添加内存监控和自动降级机制
3. 优化 Pipeline 内存使用模式

---

## 九、需要外部专家协助的问题

### 9.1 核心问题

**为什么进程会被 SIGKILL？**

- 不是 Linux OOM Killer（无 dmesg 日志）
- 不是 Node.js 堆溢出（没有 `FATAL ERROR: CALL_AND_RETRY_LAST`）
- 系统内存充足（5.6GB 可用）
- Node.js 堆限制 2.2GB 看似足够

**可能的方向：**
1. **容器/云服务商限制**：是否存在容器级别的内存限制（如 Docker `--memory`、Kubernetes limit）？
2. **OpenClaw 运行时限制**：OpenClaw 是否对子进程有内存或执行时间限制？
3. **cgroup 限制**：Linux cgroup 是否设置了内存上限？
4. **V8 堆碎片化**：Node.js v24 的堆管理是否有变化？
5. **并发 API 调用**：多个并发的 LLM API 调用是否累积了过多的响应数据在内存中？

### 9.2 辅助问题

1. 如何监控 Node.js 进程的实时内存使用？
2. 是否有方法在 SIGKILL 前捕获内存状态？
3. 是否应该使用 `--max-old-space-size` 增大 Node.js 堆？
4. 是否应该将 Pipeline 拆分为多个独立进程执行？

---

## 十、相关代码文件清单

| 文件 | 作用 | 版本 |
|------|------|------|
| `zhuoyue-system/core/nirath-master-pipeline.js` | Pipeline 主文件 | v6.5.65-P8-patch-014 |
| `shanhaijing-render-engine/orient-primordial-core-v24.js` | Prompt 构建核心 | v24.3 |
| `systems/llm-reasoning-engine.js` | LLM 引擎 | v6.5.27-expert-fix |
| `systems/generic-opening-system.js` | 片头生成 | v6.5.63-P4 |
| `run-preproduction-v3.js` | 执行入口 | - |
| `output/health-edu-ep01/preproduction-result.json` | 最后一次成功输出 | Patch-013 |
| `output/health-edu-ep01/preproduction-report.md` | 最后一次成功报告 | Patch-013 |

---

## 十一、附录：成功的输出样例

Patch-013 成功时的镜头信息（S01）：

```json
{
  "id": "S01",
  "duration": 9,
  "action": "右手轻抬致意，随后双手自然交叠于腹前，身体端正面向镜头",
  "dialogue": "大家好，我是陈卓。今天我们来聊聊横纹肌溶解——一个听起来陌生，但可能发生在每个人身上的健康问题。",
  "prompt": "NEGATIVE: no text... | CHARACTER: 陈卓 | SCENE: 现实世界... | ACTION: ... | DIALOGUE: 陈卓|独白|平静|大家好... | CAMERA: ... | TIMELINE: 00:09-00:18...",
  "mouthAction": "微笑开口说话"
}
```

---

## 十二、总结

我们的视频预生产 Pipeline 是一个复杂的 LLM 驱动系统，包含 25+ 个 Stage，涉及多次 API 调用和大量字符串操作。系统在 Patch-012 之前可以稳定运行，但近期频繁遭遇 SIGKILL。

**最可能的根因**：
1. 容器/运行时层面的内存限制（而非系统 OOM）
2. Node.js 堆内存不足或碎片化
3. OpenClaw 子进程管理机制的限制

**急需外部专家协助诊断**：
- 确定 SIGKILL 的来源（容器？cgroup？OpenClaw？）
- 提供内存优化建议
- 评估是否需要架构级调整（如进程拆分、流式处理）

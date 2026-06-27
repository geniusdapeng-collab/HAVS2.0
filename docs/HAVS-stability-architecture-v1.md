# HAVS 系统稳定性架构重构方案 v1.0

> 目标：根治"有时行有时不行"，实现生产级稳定交付

---

## 一、当前系统核心痛点诊断

| 层级 | 问题现象 | 根因 |
|------|---------|------|
| **执行层** | 进程28.5分钟后被SIGTERM终止 | 单进程串行执行所有Agent，总时长不可控 |
| **LLM层** | k2p6推理+content生成耗时60-300s | LLM响应时间不稳定，单次调用可能超时 |
| **质量层** | FieldQualityPipeline LLMChecker报错 `this.llm.chat is not a function` | Agent初始化与LLM引擎解耦不当 |
| **架构层** | checkpoint落盘但无resume逻辑 | 伪断点续跑，实际只能从头重来 |
| **容错层** | 一个Agent崩溃全Pipeline失败 | 无进程隔离，无降级机制 |

**结论**：当前架构是"单进程同步串行流水线"，LLM不确定性被放大到系统级故障。

---

## 二、创新架构设计：三层稳定性模型

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Pipeline 编排层 (确定性、可观测、可恢复)              │
│  - 状态机驱动的Stage调度                                       │
│  - 每个Stage完成即落盘 + 原子提交                              │
│  - 支持从任意Stage恢复                                         │
└─────────────────────────────────────────────────────────────┘
                              ↕ 消息队列 (Redis/RabbitMQ)
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Agent 服务层 (微服务化、隔离、可降级)                │
│  - 每个Agent独立进程/容器                                       │
│  - 自带熔断降级 + 规则兜底                                      │
│  - LLM调用统一封装，带缓存                                      │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/gRPC
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: LLM 网关层 (熔断、限流、缓存)                        │
│  - 统一LLM调用入口                                             │
│  - 超时自动熔断 → 模板降级                                     │
│  - 相同输入缓存命中直接返回                                     │
│  - 多模型负载均衡 (k2p6主 + k2p5备)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、核心创新点详解

### 创新点1：Agent 微服务化 + 消息队列（进程级隔离）

**现状**：所有Agent在一个Node.js进程内串行运行
**问题**：一个Agent的内存泄漏/OOM/死循环拖垮整个Pipeline

**方案**：
```javascript
// 每个Agent作为独立进程，通过消息队列通信
const agents = {
  'scene-design':     { timeout: 120, retries: 2 },
  'visual-language':  { timeout: 300, retries: 2 },
  'prompt-fusion':    { timeout: 180, retries: 2, concurrency: 2 },
  'audio-design':     { timeout: 90,  retries: 2 },
  'opening-design':   { timeout: 90,  retries: 2 },
  'continuity-review':{ timeout: 180, retries: 1 }
};

// Agent进程崩溃 → 消息队列自动重投 → 新进程接管
// Agent结果超时 → 熔断 → 返回规则模板降级结果
```

**收益**：
- 单个Agent崩溃不影响其他Agent
- 可独立重启/升级单个Agent
- 可水平扩展（多个PromptFusionAgent并行处理镜头）

---

### 创新点2：LLM 统一网关（熔断降级 + 确定性缓存）

**现状**：每个Agent内嵌LLM调用，各自处理超时/重试
**问题**：重复造轮子，超时策略不一致，无缓存

**方案**：
```javascript
class LLMGateway {
  // 1. 统一调用入口
  async call(prompt, options) {
    const cacheKey = this._hash(prompt + JSON.stringify(options));
    
    // 2. 缓存命中直接返回（相同题材/场景无需重复LLM推理）
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 3. 主模型调用（k2p6）
    try {
      const result = await this._callWithTimeout('kimi-k2p6', prompt, options.timeout);
      this.cache.set(cacheKey, result, { ttl: 3600 }); // 缓存1小时
      return result;
    } catch (err) {
      // 4. 熔断降级链
      if (err.type === 'TIMEOUT') {
        // 4a. 超时 → 降级到轻量模型（k2p5，更快）
        return this._callWithTimeout('kimi-k2p5', prompt, options.timeout * 0.7);
      }
      if (err.type === 'RATE_LIMIT') {
        // 4b. 限流 → 指数退避重试
        await this._exponentialBackoff(retryCount);
        return this.call(prompt, options);
      }
      // 4c. 最终兜底 → 规则模板（无需LLM）
      return this._ruleTemplateFallback(options.agentType, prompt);
    }
  }
}
```

**收益**：
- LLM超时自动降级，不阻塞Pipeline
- 相同题材缓存复用，减少50%+ LLM调用
- 多模型负载均衡，提升整体可用性

---

### 创新点3：真·断点续跑（原子提交 + 状态机）

**现状**：checkpoint落盘但代码无resume逻辑
**问题**：进程被杀后只能从头重来

**方案**：
```javascript
class PipelineStateMachine {
  constructor() {
    this.states = [
      'INIT',
      'SCRIPT_COMPLETE',      // Layer 1 完成
      'SCENE_DESIGN_COMPLETE', // Phase 1 完成
      'VISUAL_LANGUAGE_COMPLETE', // Phase 2 完成
      'PROMPT_FUSION_COMPLETE',   // Phase 3 完成
      'QUALITY_CHECK_COMPLETE',   // 质量门完成
      'RENDER_READY'              // 可渲染
    ];
    this.currentState = 'INIT';
    this.checkpoints = new Map(); // 每个State对应一个checkpoint
  }
  
  async run(resumeFrom = null) {
    const startIdx = resumeFrom 
      ? this.states.indexOf(resumeFrom) 
      : this.states.indexOf(this.currentState);
    
    for (let i = startIdx; i < this.states.length; i++) {
      const state = this.states[i];
      try {
        await this._executeState(state);
        this.currentState = state;
        // 原子提交：先写临时文件，再rename
        await this._atomicCheckpoint(state);
      } catch (err) {
        // 失败记录详细日志，下次从当前State恢复
        await this._logFailure(state, err);
        throw new RecoverableError(state, err);
      }
    }
  }
  
  // 恢复入口
  async resume() {
    const lastCheckpoint = await this._loadLatestCheckpoint();
    if (lastCheckpoint) {
      console.log(`[Pipeline] 从状态 ${lastCheckpoint.state} 恢复`);
      return this.run(lastCheckpoint.state);
    }
    return this.run();
  }
}
```

**收益**：
- 进程被杀后可从最后完成Stage恢复，无需重来
- 每个Stage原子提交，不丢数据
- 失败日志详细记录，便于排查

---

### 创新点4：预生成模板库（减少LLM依赖）

**现状**：每个镜头都走完整LLM推理链
**问题**：相同题材重复推理，浪费时间和token

**方案**：
```javascript
// 预生成模板库（按题材分类）
const TEMPLATE_LIBRARY = {
  'EDU_health': {
    // 健康教育片通用模板
    directorInstruction: '好莱坞纪录片质感，写实风格...',
    lighting: '自然光+环境光，明亮清晰...',
    composition: '中景为主，黄金分割...',
    // ... 其他字段模板
    _llmFields: ['scene', 'action', 'dialogue'] // 只有这些字段需要LLM
  },
  'EDU_medical': {
    // 医疗科普片通用模板
    // ...
  }
};

// 运行时：模板填充 + LLM只生成可变字段
async function generateShot(template, variables) {
  // 80%字段来自模板（确定性，零延迟）
  const base = { ...template };
  
  // 20%字段走LLM（场景描述、动作、台词等）
  const llmResult = await llmGateway.call(
    buildPrompt(template, variables),
    { agentType: 'scene-design', timeout: 60 }
  );
  
  return { ...base, ...llmResult };
}
```

**收益**：
- 常见题材80%字段走模板，无需LLM
- 首次运行后自动入库，后续复用
- 模板可人工审核后锁定，确保质量稳定

---

### 创新点5：并行Stage识别 + 动态调度

**现状**：所有Agent串行执行
**问题**：总时长 = 所有Agent耗时之和

**方案**：
```javascript
// Stage依赖图
const dependencyGraph = {
  'script': [],           // Layer 1: 无依赖
  'scene-design': ['script'],
  'visual-language': ['scene-design'],
  'audio-design': ['scene-design'], // 与visual-language无依赖，可并行
  'prompt-fusion': ['visual-language', 'audio-design'],
  'quality-check': ['prompt-fusion'],
  'opening-design': ['script'] // 与scene-design并行
};

// 动态调度器
class StageScheduler {
  async execute(graph, inputs) {
    const completed = new Set();
    const inProgress = new Map();
    
    while (completed.size < Object.keys(graph).length) {
      // 找可执行的Stage（所有依赖已完成）
      const ready = Object.entries(graph)
        .filter(([stage, deps]) => 
          !completed.has(stage) && 
          !inProgress.has(stage) &&
          deps.every(d => completed.has(d))
        );
      
      // 并行启动所有就绪Stage
      for (const [stage] of ready) {
        inProgress.set(stage, this._runStage(stage, inputs));
      }
      
      // 等待任意一个完成
      const [finishedStage] = await Promise.race(
        Array.from(inProgress.entries()).map(
          ([name, promise]) => promise.then(() => name)
        )
      );
      
      completed.add(finishedStage);
      inProgress.delete(finishedStage);
    }
  }
}
```

**收益**：
- audio-design与visual-language并行，节省~80秒
- opening-design与scene-design并行，节省~67秒
- 总时长从28.5分钟降至约20分钟

---

## 四、迁移路径（渐进式，不推翻重来）

| 阶段 | 时间 | 动作 | 风险 |
|------|------|------|------|
| **Phase 1** | 1周 | LLMGateway统一封装 + 缓存 | 低，代码层改动 |
| **Phase 2** | 1周 | 真·断点续跑（原子checkpoint） | 中，需测试恢复逻辑 |
| **Phase 3** | 2周 | Agent进程隔离（PM2/容器） | 中，需进程间通信 |
| **Phase 4** | 1周 | 模板库 + 并行调度 | 低，增量优化 |
| **Phase 5** | 持续 | 监控告警 + 自动降级 | 低，运维层面 |

---

## 五、关键指标（治理"有时行有时不行"）

| 指标 | 当前 | 目标 |
|------|------|------|
| 预生产成功率 | ~60%（有时超时/崩溃） | >95% |
| 平均耗时 | 28.5分钟 | <20分钟 |
| LLM调用次数 | 6+次/项目 | 2-3次/项目（缓存+模板） |
| 失败恢复时间 | 需从头重来（28.5分钟） | 从断点恢复（<5分钟） |
| 单Agent故障影响 | 全Pipeline失败 | 仅当前Stage重试 |

---

## 六、立即可以做的3件事（本周）

1. **LLMGateway封装**（2天）：统一所有Agent的LLM调用，加缓存和熔断
2. **真·断点续跑**（2天）：每个Stage完成原子落盘，支持resume入口
3. **模板库起步**（1天）：提取EDU_health/EDU_medical通用模板，减少LLM调用

这3件事做完，稳定性就能上一个台阶。需要我开干吗？

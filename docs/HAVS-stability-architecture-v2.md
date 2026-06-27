# HAVS 系统稳定性架构重构方案 v2.0 — 确定性基线 + 不确定性吸收

> 从"Pipeline"到"反应式事件驱动"，从"全LLM生成"到"确定性基线 + LLM增量"

---

## 一、v1.0 方案的隐藏缺陷

| 缺陷 | 说明 | 后果 |
|------|------|------|
| **伪隔离** | Agent微服务化但共享数据存储 | 存储层故障仍导致全局失败 |
| **重试风暴** | LLM超时后重试，可能加剧限流 | 雪崩效应 |
| **状态耦合** | Stage N依赖Stage N-1的完整输出 | 前序微小错误导致后续全部作废 |
| **无质量基线** | 每次生成都是"全新的" | 用户无法预期输出质量 |
| **人机断层** | 全自动化，无人工审核节点 | 问题只能在最后发现，返工成本高 |

**根本问题**：LLM创作的不确定性是**本质性的**，不是工程优化能消除的。必须改变架构假设——从"LLM生成一切"变成"LLM只生成变化的部分"。

---

## 二、v2.0 核心架构升级

### 升级1：确定性基线（Deterministic Baseline）—— 最大创新

**洞察**：同类型视频（如健康科普）的80%字段是**不变的**——导演指令、约束、基础、构图规范、色彩基调、负面约束、角色约束等。变化的只有场景、动作、台词、运镜。

**方案**：

```
首次运行（冷启动）
  → 完整LLM生成
  → 人工审核 → 标记"审定通过"
  → 锁定为【标准基线模板 v1.0】

后续运行（热启动）
  → 加载【标准基线模板 v1.0】
  → LLM只生成：场景描述 + 动作 + 台词 + 运镜（20%字段）
  → 自动合并基线 + LLM增量
  → 质量检查 → 通过即出片
  → 异常才触发人工审核
```

**基线模板版本管理**：
```javascript
const baselineRegistry = {
  'EDU_health_v1.0': {
    // 人工审核通过的稳定字段
    directorInstruction: '好莱坞纪录片质感，写实风格...',
    constraint: 'Aspect ratio: 16:9, no text...',
    baseline: '8K resolution, cinematic...',
    // ... 共20个稳定字段
    _locked: true,  // 锁定，不可LLM覆盖
    _approvedBy: 'chenzhuo',
    _approvedAt: '2026-06-26'
  },
  'EDU_health_v1.1': {
    // 如果基线需要调整，走版本升级
    // 旧项目仍用v1.0，新项目用v1.1
  }
};
```

**收益**：
- 后续项目LLM调用减少 **80%**
- 生成质量**可预期**（因为80%字段是人工审定的）
- 生成速度提升 **5倍+**
-  token 成本降低 **80%**

---

### 升级2：反应式事件驱动（Event-Driven）—— 从阻塞到异步

**v1.0**：主线程等待每个Agent完成，串行阻塞
**v2.0**：事件流，各组件松耦合

```javascript
// 事件总线（Event Bus）
class HVASEventBus {
  emit(event, payload) {
    // 1. 持久化事件（Event Sourcing）
    this.eventStore.append(event, payload);
    // 2. 广播给订阅者
    this.subscribers[event]?.forEach(handler => handler(payload));
  }
}

// 项目启动时，不是"调用Pipeline"，而是"发布事件"
async function startProject(requirement) {
  eventBus.emit('Project:Started', { requirement, timestamp: Date.now() });
  // 立即返回，不阻塞
  return { projectId, status: 'processing' };
}

// Agent订阅事件，独立执行
sceneDesignAgent.on('Script:Completed', async (payload) => {
  const result = await sceneDesignAgent.process(payload.script);
  eventBus.emit('SceneDesign:Completed', result);
});

// 进度查询接口（非阻塞）
app.get('/project/:id/status', (req, res) => {
  const events = eventStore.getEvents(req.params.id);
  res.json({ 
    status: computeStatus(events),
    completedStages: events.filter(e => e.type.endsWith(':Completed')).map(e => e.type),
    currentStage: findCurrentStage(events)
  });
});
```

**关键优势**：
- **查询不阻塞生成**：用户可随时查进度，不影响Pipeline运行
- **故障不丢上下文**：所有事件持久化，恢复时重放即可
- **Stage解耦**：SceneDesign完成后，VisualLanguage和AudioDesign**并行**启动
- **可观测性**：每个事件都是审计日志，排查问题有完整轨迹

---

### 升级3：人在回路（Human-in-the-Loop）—— 关键节点人工把关

**问题**：全自动化导致问题只能在最后发现，返工成本高。

**方案**：在关键节点插入"人工审核门"

```javascript
const humanReviewGates = {
  'Script:Completed': {
    autoPass: false,  // 必须人工审核
    timeout: 86400000, // 24小时超时
    fallback: 'auto_approve_with_warning' // 超时自动通过但标记
  },
  'PromptFusion:Completed': {
    autoPass: true,   // 自动通过
    sampleReview: 0.1 // 10%抽样人工审核（质量监控）
  }
};

// 审核界面飞书推送
eventBus.on('Script:Completed', async (payload) => {
  await feishuBot.sendCard({
    user: payload.reviewer,
    title: '剧本生成完成，请审核',
    content: payload.script.summary,
    actions: [
      { label: '通过', action: 'approve', projectId: payload.projectId },
      { label: '修改', action: 'revise', projectId: payload.projectId },
      { label: '驳回', action: 'reject', projectId: payload.projectId }
    ]
  });
});
```

**收益**：
- 剧本方向错误在**早期**发现，避免后续全部作废
- 人工审核记录反哺基线模板优化
- 符合医疗/教育等严肃领域的合规要求

---

### 升级4：补偿事务（Compensating Transaction）—— 容错终极方案

**问题**：Stage N失败后，Stage 1到N-1的成果如何处理？

**方案**：每个可逆操作都有"补偿操作"

```javascript
class CompensatingPipeline {
  async execute(stage, input) {
    const compensation = [];
    
    try {
      // 执行Stage
      const result = await stage.execute(input);
      compensation.push(stage.compensate); // 记录补偿方法
      return result;
    } catch (err) {
      // 倒序执行补偿
      for (const compensate of compensation.reverse()) {
        await compensate();
      }
      throw err;
    }
  }
}

// 示例：PromptFusion Stage的补偿
const promptFusionStage = {
  async execute(input) {
    // 生成prompt并写入文件
    await fs.writeFile(outputPath, prompt);
    return { outputPath };
  },
  async compensate() {
    // 回滚：删除生成的文件
    await fs.unlink(outputPath);
    console.log(`[Compensate] 已删除 ${outputPath}`);
  }
};
```

**收益**：
- 任何Stage失败，系统可**干净回滚**
- 不产生脏数据
- 支持"重跑单个Stage"而非"重来整个Pipeline"

---

### 升级5：健康检查 + 自愈（Health Check & Self-Healing）

```javascript
class AgentHealthMonitor {
  constructor() {
    this.agents = new Map();
    setInterval(() => this._checkHealth(), 30000); // 每30秒检查
  }
  
  async _checkHealth() {
    for (const [agentId, agent] of this.agents) {
      try {
        // 1. 心跳检查
        await agent.ping();
        
        // 2. LLM响应时间检查
        const avgLatency = await agent.getAvgLatency(300); // 最近5分钟
        if (avgLatency > 120000) { // 平均>2分钟
          await this._alert(`Agent ${agentId} LLM响应过慢: ${avgLatency}ms`);
        }
        
        // 3. 成功率检查
        const successRate = await agent.getSuccessRate(300);
        if (successRate < 0.8) { // 成功率<80%
          await this._restartAgent(agentId); // 自动重启
          await this._alert(`Agent ${agentId} 成功率过低(${successRate})，已自动重启`);
        }
      } catch (err) {
        // 4. 无响应 → 重启 + 恢复任务
        await this._restartAgent(agentId);
        await this._recoverTasks(agentId);
      }
    }
  }
}
```

**收益**：
- 异常提前发现，不等用户反馈
- 自动重启恢复，减少人工介入
- 监控数据指导容量规划

---

## 三、v2.0 完整架构图

```
┌─────────────────────────────────────────────────────────────┐
│  用户层                                                       │
│  - 飞书机器人（提交需求、审核、查进度）                          │
│  - Web Dashboard（项目看板、基线管理、监控）                     │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│  API Gateway（Kong/Nginx）                                    │
│  - 限流、认证、路由                                            │
└─────────────────────────────────────────────────────────────┘
                              ↕ 异步消息队列（Redis Stream）
┌─────────────────────────────────────────────────────────────┐
│  事件总线 + 状态机（Event Sourcing）                           │
│  - ProjectStarted → ScriptCompleted → SceneDesignCompleted     │
│  - 所有事件持久化，可重放、可审计                               │
│  - 补偿事务管理                                                │
└─────────────────────────────────────────────────────────────┘
                              ↕ 发布-订阅
┌──────────┬──────────┬──────────┬──────────┬─────────────────┐
│ Script   │ Scene    │ Visual   │ Audio    │ PromptFusion    │
│ Agent    │ Design   │ Language │ Design   │ Agent           │
│ (独立进程)│ Agent    │ Agent    │ Agent    │ (独立进程)       │
│          │ (独立进程)│ (独立进程)│ (独立进程)│                 │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
                              ↕ 统一调用
┌─────────────────────────────────────────────────────────────┐
│  LLM Gateway（熔断、限流、缓存、多模型负载均衡）                 │
│  - k2p6（主）/ k2p5（备）/ 规则模板（兜底）                    │
│  - 响应缓存（Redis，TTL=1h）                                   │
│  - 相同输入命中缓存 → 零延迟返回                                │
└─────────────────────────────────────────────────────────────┘
                              ↕ 读（热启动）/ 写（冷启动审核后）
┌─────────────────────────────────────────────────────────────┐
│  基线模板库（Baseline Registry）                               │
│  - EDU_health_v1.0（已审核锁定）                               │
│  - EDU_medical_v1.0（已审核锁定）                              │
│  - 版本管理 + 灰度发布                                         │
└─────────────────────────────────────────────────────────────┘
                              ↕ 原子写入
┌─────────────────────────────────────────────────────────────┐
│  持久化存储                                                   │
│  - Event Store（事件日志，MongoDB/PostgreSQL）                 │
│  - Checkpoint Store（Stage状态，S3/本地）                      │
│  - Output Store（生成产物，S3）                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 四、v1.0 vs v2.0 对比

| 维度 | v1.0 | v2.0 |
|------|------|------|
| **架构模式** | Pipeline（阻塞串行） | Event-Driven（异步反应式） |
| **LLM策略** | 全量生成 | 基线模板 + LLM增量 |
| **容错机制** | 重试 | 补偿事务 + 自愈 |
| **人机协作** | 无 | 关键节点人工审核 |
| **可观测性** | 日志 | 事件溯源（完整审计） |
| **同题材耗时** | 28.5分钟 | ~5分钟（基线复用） |
| **成功率** | ~60% | >95% |
| **成本** | 高（每次全LLM） | 低（80%缓存/模板命中） |

---

## 五、实施路线图

### Phase 1：基线模板（1周，立即见效）
- 提取当前健康科普项目的稳定字段
- 人工审核后锁定为 `EDU_health_v1.0`
- 修改PromptFusionAgent：先加载基线，再LLM生成增量

### Phase 2：事件驱动（1周）
- 引入Redis Stream作为消息队列
- 改造Agent为事件订阅者
- 实现进度查询接口

### Phase 3：LLM Gateway（3天）
- 统一封装LLM调用
- 加Redis缓存层
- 实现熔断降级

### Phase 4：补偿事务 + 自愈（1周）
- 每个Stage实现compensate方法
- 健康监控+自动重启

### Phase 5：人在回路（1周）
- 飞书审核卡片
- 关键节点人工门

**总工期**：约1个月，可分阶段上线，每阶段都有独立价值。

---

## 六、关键决策点

**Q：基线模板会不会让视频"千篇一律"？**
A：不会。基线锁定的是"技术规格"（分辨率、画幅、负面约束等），创意字段（场景、动作、运镜）仍由LLM生成。相当于"同样的相机设置，拍不同的内容"。

**Q：人工审核会不会拖慢速度？**
A：只在**首次**和**异常时**触发。正常流程全自动。审核通过后基线锁定，后续同题材项目无需再审。

**Q：事件驱动架构复杂度是否过高？**
A：初期可用Redis Stream（轻量），后期可升级到Kafka。Agent进程用PM2管理，无需容器/K8s。

---

v2.0 的核心思想：**用确定性对抗不确定性**。基线模板提供确定性基座，LLM只负责不确定性创意，事件驱动提供容错骨架，人在回路提供质量兜底。

这才是能扛住生产环境的架构。

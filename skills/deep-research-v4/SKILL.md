---
name: deep-research
skill_id: skill_deep_research_v4
version: 5.5.1
last_updated: '2026-04-30'
domain: research_analysis
sub_domain: deep_research
type: workflow_orchestrator
priority: P0
description: "深度调研工作流 V5.5.1 精炼执行版。核心设计：做减法，保留精华。质量检查精简至核心5项，可信度公式4项，追问任务3种，同义词库10组。保留全部洞察模块（概念界定、反共识、批判思考、设计哲学、独立评测、定量精度、核心技术深度解析）。字数标准：≥26,000字（最佳50,000-60,000字；深度报告80,000-100,000字）。Agent 能记住，能执行。"
tags: [深度调研, 工作流, 多Agent, 报告生成, V5.5.1, 精炼执行]
category: skill_pack
author: 小G（大鹏的 AI 搭档）
metadata:
  quality_score: 99
  priority: high
  published_date: 2026-04-19
  last_updated: 2026-04-30
  sub_skills_count: 9
capabilities:
  tools:
    - deep_research_v4
    - coze_web_search
    - web_search
    - web_crawl
    - scrapling_crawler
    - feishu_create_doc
    - feishu_update_doc
    - miaoda-ppt-maker
  data_sources:
    - coze_web_search
    - web_search
    - scrapling_crawler
    - domain_plugins
  output_formats:
    - markdown
    - feishu_doc
    - ppt
retrieval_profile:
  logical_topics:
    - deep_research
    - research_workflow
    - multi_agent_research
    - industry_analysis
  aliases:
    - 深度调研
    - 深度研究
    - 行业调研
    - 研究报告
    - 课题调研
    - 全面调研
    - 多Agent调研
    - 研究报告生成
  sample_queries:
    - 帮我深度调研 AI Agent 行业趋势
    - 做一份行业研究报告
    - 帮我全面分析这个课题
    - 深度研究 2026 年 AI 行业发展
    - 帮我调研这个赛道并出报告
    - 我想了解某个行业的全面情况
    - 调研这个领域并生成PPT
    - 帮我分析这个行业的竞争格局
dependencies:
  skills: []
  modules: []
  external_apis:
    - coze_web_search
    - web_search
    - web_crawl
status: production
license: internal
---

# 深度调研工作流 V5.5.1 — 精炼执行版

> **版本：V5.5.1 | 字数标准：≥26,000字（最佳50,000–60,000字；深度报告80,000–100,000字）**
>
> **核心设计：做减法，保留精华。Agent 能记住，能执行。**
>
> **精简成果：**
> - 质量检查：13项 → **核心5项**
> - 可信度公式：6项 → **4项**
> - 追问任务：7种 → **3种**
> - 同义词库：13+组 → **10组**
>
> **保留全部洞察模块：** 概念界定、反共识叙事、批判思考、设计哲学、独立评测、定量精度、核心技术深度解析。
| Python 代码 | 大量伪代码 | **0行** | `from deep_research import...` 不存在，删 |
| 展示表格 | 版本对比表、特性速览表 | **0个** | 写给"看报告的人"看的，不是给 Agent 执行的 |
| 执行自检 | 无 | **每 Phase 末尾加自检** | Agent 自检"我做到了吗？" |

---

## 搜索增强（保持，核心能力不精简）

### kimi_search 调用规范

**所有搜索必须带 `include_content=true`：**

```
kimi_search(query="关键词", include_content=true, limit=5~10)
```

**最新动态搜索：**
```
kimi_search(query="关键词", include_content=true, freshness="week", limit=5)
```

**英文双语搜索：**
```
kimi_search(query="english keyword", include_content=true, language="en", limit=5)
```

### 3 轮搜索策略

| 轮次 | 关键词数 | 目的 | 特殊标记 |
|------|---------|------|---------|
| Round 1 | 8 | 核心覆盖 | + 独立评测维度 + 定量数据维度 |
| Round 2 | 12 | 深度挖掘 | + 架构演进信息 |
| Round 3 | 5-8 | 填补空白 | + 反方视角 + 定量追问 |

### 动态追问机制（精简为 3 种）

**追问触发条件：**
- 维度覆盖率 < 40%
- 出现百分比/市场规模数据（需交叉验证）
- 缺乏反方视角

**追问任务类型（3种）：**

| 类型 | 触发条件 | 示例 |
|------|---------|------|
| **缺口追问** | 维度覆盖率 < 40% | 补充"机会与挑战"维度 |
| **反方追问** | 缺乏质疑观点 | 搜索"[主题] 风险 挑战 质疑" |
| **定量追问** | 发现百分比/市场规模 | 交叉验证"94%幻觉率"多源定义 |

**饱和度检测**（满足任一即停）：
- 追问轮次 >= 3
- 总素材数 >= 60
- 所有维度覆盖率 >= 60%

**追问执行流程：**
```
第1轮：初始搜索（Round 1-3）
  → Agent 执行搜索
  → 回灌结果

第2轮：追问搜索（缺口/反方/定量）
  → 引擎分析缺口
  → 返回追问任务（≤5个）
  → Agent 执行追问
  → 回灌结果

第3轮：二次追问（如未饱和）
  → 重复上述流程

最终：生成报告
```

### 关键数据交叉验证

**所有百分比、市场规模、排名必须交叉验证：**
1. 发现数据点 X（如"V4 幻觉率 94%"）
2. 追问搜索："V4 幻觉率 94% 来源"、"V4 hallucination rate benchmark"
3. 对比多个来源的定义和数值
4. 矛盾时标记「争议」，一致时可信度 +20%

### 定量精度追问

对技术指标必须追问四要素：
- **具体数值**："Token 消耗降低 75%" → 追问具体降低了多少 Token
- **测试条件**：模型类型、任务类型、数据规模
- **触发机制**："每15轮触发" → 为什么是15轮？可调节吗？
- **渐进机制**："Level 0/1/2" → 每层对应什么 token 范围？

---

## 核心架构（9阶段 + 8洞察模块）

```
Phase 1    Phase 2    Phase 3    Phase 4    Phase 5    Phase 6    Phase 7    Phase 8    Phase 9
课题拆解 → 核心搜索 → 深度抓取 → 扩展搜索 → 补充搜索 → 三层去重 → 深度分析 → 报告撰写 → PPT转换
   │          │          │          │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼          ▼          ▼          ▼
概念界定   独立评测   定量精度   定量精度   反方追问   批判视角   哲学提炼   叙事张力
发现预提取  搜索维度   数据挖掘   数据挖掘   定量追问   反方标记   演进路线   批判小节
                                                          核心技术
```

### 6 Agent 协同

```
Orchestrator（总指挥）
 ├── Planner Agent → 生成框架 + 关键词矩阵 + 概念界定 + 核心发现预提取
 ├── Searcher Agent → 3 轮搜索 + 深度抓取 + 独立评测 + 定量数据
 ├── Filter Agent → 三层去重 + 加权评分 + 缺口检测 + 批判视角标记
 ├── Analyst Agent → 交叉分析 + 哲学提炼 + 演进路线 + 反共识论证
 ├── Writer Agent → 标准结构 + 洞察增强章节 + 飞书交付
 └── PPT + Chart Agent → PPT 生成 + 数据可视化
```

---
# 深度调研工作流 V5.5.1 — Kimi Search 极致增强版

> V5.5.1 生产版 | 字数标准：≥26,000字（最佳50,000-60,000字）

## 概述

深度调研工作流 V5.5.1 核心能力：
- **全文摘要**：所有搜索获取页面完整内容，不只是标题
- **最新动态**：自动捕捉 7 天内最新信息
- **双语覆盖**：中英文并行搜索，覆盖一手信源
- **动态追问**：自动识别信息缺口，追问补全直到饱和
- **字数标准**：≥26,000字（最佳 50,000-60,000 字；深度报告 80,000-100,000 字）

## 快速开始

```bash
# 基础使用（引擎输出搜索任务，Agent 执行 kimi_search）
python deep_research.py "AI Agent 行业趋势"

# 深度模式
python deep_research.py "AI Agent 行业趋势" --depth deep --output report.md
```

## 文件结构

```
deep-research-v4/
├── deep_research_v4_1.py    # 核心引擎（~170KB）
├── deep_research.py         # 统一入口（V5.0）
├── SKILL.md                 # 技能定义（含 Agent 调用规范）
├── README.md                # 本文件
├── VERSION.md               # 版本记录
├── VERSION_LOCK.md          # 版本锁定
├── plugins/                 # YAML 领域插件
│   ├── default.yaml
│   ├── tech_trends.yaml
│   ├── competitive_analysis.yaml
│   ├── investment_research.yaml
│   └── market_analysis.yaml
└── templates/               # Markdown 模板
    ├── competitor-analysis.md
    ├── industry-research.md
    ├── tech-research.md
    ├── market-entry.md
    └── user-research.md
```

## 前置依赖

- ✅ Python 3.8+
- ✅ PyYAML（`pip install pyyaml`）
- ✅ OpenClaw 工具：**kimi_search**（首选）、web_search（备选）

## 核心增强

### 方案 A：搜索参数增强

| 增强项 | 实现方式 | 效果 |
|--------|---------|------|
| 全文摘要 | `include_content=true` | 信息量 5-10x |
| 最新动态 | `freshness=week` | 时效性 +60% |
| 双语覆盖 | 英文关键词 | 信源多样性 +40% |

### 方案 B：动态追问机制

```
Round 1: 核心搜索（29 任务）
Round 2: 最新动态（7 任务）
Round 3: 双语覆盖（2 任务）
  → 回灌引擎 → 缺口分析
Round 4+: 追问补全（0-15 任务）
  → 直到饱和（3 轮 / 60 素材 / 覆盖率 ≥60%）
```

## 使用方式

### Python API

```python
from deep_research import deep_research_workflow_v2

# 标准调用（引擎生成任务 → Agent 执行搜索 → 回灌 → 追问 → 报告）
result = deep_research_workflow_v2(
    topic="中国咖啡行业深度调研",
    domain="auto",
    depth="standard",
    output_ppt=True
)

# 追问分析（手动调用）
from deep_research import analyze_search_results_for_gaps

gap_result = analyze_search_results_for_gaps(
    search_results=search_results,
    plan=plan,
    followup_round=1
)
print(f"饱和度: {gap_result['is_saturated']}")
print(f"追问任务: {len(gap_result['followup_tasks'])}")
```

### 命令行

```bash
# 标准调研
python deep_research_v4_1.py "AI Agent 行业趋势"

# 深度模式 + 保存报告
python deep_research_v4_1.py "AI Agent 行业趋势" --depth deep --output report.md

# 快速概览
python deep_research_v4_1.py "咖啡行业" --depth quick --no-ppt
```

## 产出物

| 产出 | 规格 |
|------|------|
| 📄 深度报告 | ≥26,000字（最佳 50,000-60,000 字；深度报告 80,000-100,000 字） |
| 📊 PPT 演示文稿 | 20-30 页 |
| 📈 数据图表建议 | 8-12 个 |
| 🔗 信源追溯 | 15+ 个信源，每个数据点标注来源 |

## 维护者

小 G（大鹏的 AI 搭档）
版本：V5.5.1
日期：2026-04-30

```

---
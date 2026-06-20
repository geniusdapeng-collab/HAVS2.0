#!/usr/bin/env python3
"""
深度调研工作流 — 默认入口（V5.5.1 精炼执行版）

本文件为 V5.5.1 精炼执行版本的统一入口，后续所有调研任务请通过本文件调用。
实际引擎实现位于 deep_research_v4_1.py

V5.5.1 核心能力：
- 搜索增强：include_content=true 获取全文摘要
- 最新动态：freshness=week 捕捉7天内信息
- 双语覆盖：英文关键词覆盖一手信源
- 动态追问：缺口分析→追问搜索→饱和度检测
- 叙事主线：九阶段工作流 + 批判思考 + 反共识叙事
- 字数标准：≥26,000字（最佳50,000-60,000字；深度报告80,000-100,000字）

作者：小 G（大鹏的 AI 搭档）
版本：V5.5.1
日期：2026-04-30
"""

# 统一入口：自动导入核心引擎
from deep_research_v4_1 import (
    # 核心数据模型
    ResearchPlan, KnowledgeEntry, Insight, RawMaterial, SourceInfo,
    ResearchNote, Milestone, SourceType, InsightType, ImpactLevel,
    
    # 课题类型检测
    detect_topic_type, TOPIC_TYPE_CONFIG,
    
    # 核心工作流
    generate_research_plan,
    smart_match_materials_to_dimensions,
    semantic_deduplicate,
    expand_dimension_content,
    expand_dimension_content_v443,
    generate_report_v4,
    deep_research_workflow_v2,
    
    # 辅助工具
    count_chinese_chars,
    format_number,
    quality_check_v2,
    smart_generate_charts_and_ppt,
    PhaseTracker,
    
    # 叙事主线机制
    generate_narrative_arc,
    extract_key_quotes,
    
    # 同义词库
    SYNONYM_LIBRARY,
    expand_keyword_with_synonyms,
    
    # 追问机制
    analyze_search_results_for_gaps,
    extract_entities_from_materials,
    generate_followup_search_plan,
)

__version__ = "5.5.1"
__engine_file__ = "deep_research_v4_1.py"
__release_date__ = "2026-04-30"

# 提供便捷的版本信息获取函数
def get_version_info():
    return {
        "version": __version__,
        "engine_file": __engine_file__,
        "release_date": __release_date__,
        "status": "production"
    }

print(f"✅ 深度调研工作流 V{__version__} 已加载（引擎文件: {__engine_file__} | 字数标准: ≥26,000字 最佳: 50,000-60,000字）")
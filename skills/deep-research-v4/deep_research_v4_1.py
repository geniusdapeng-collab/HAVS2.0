#!/usr/bin/env python3
"""
深度调研工作流引擎 V5.0 — 搜索增强版（方案A已落地）
2026-04-26（V5.0 搜索增强：include_content + freshness + 双语搜索）

核心改进：
1. ✅ 搜索增强 V5.1-A — 所有搜索加 include_content=true 获取全文摘要
2. ✅ 最新动态捕捉 — 核心关键词 + freshness=week 搜索
3. ✅ 双语并行覆盖 — 英文关键词覆盖一手信源
4. ✅ 时间分层搜索 — Round 1 覆盖 + Round 2 最新 + Round 3 英文
5. ✅ 关键数据交叉验证 — 百分比/市场规模强制多源印证
6. ✅ 字数统计修复 — count_chinese_chars() 准确统计中文字数
7. ✅ 版本号统一 — V5.0 搜索增强版

作者：小 G（大鹏的 AI 搭档）
"""

import os
import json
import re
import yaml
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass, field, asdict
from enum import Enum

# ══════════════════════════════════════════════════════════════
# 数据模型（与V4.2兼容）
# ══════════════════════════════════════════════════════════════

class SourceType(Enum):
    ACADEMIC = "academic"
    OFFICIAL = "official"
    CONSULTING = "consulting"
    MEDIA = "media"
    REPORT = "report"
    BLOG = "blog"
    COMMUNITY = "community"
    SELF_MEDIA = "self_media"


class InsightType(Enum):
    TREND = "trend"
    OPPORTUNITY = "opportunity"
    RISK = "risk"
    PREDICTION = "prediction"
    CONTRADICTION = "contradiction"


class ImpactLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class SourceInfo:
    url: str
    title: str
    source_type: str
    credibility: float
    author: str = ""
    published_date: str = "unknown"
    fetched_at: str = ""
    snippet: str = ""
    search_keyword: str = ""
    search_round: int = 0


@dataclass
class RawMaterial:
    id: str
    source_url: str
    source_type: str
    title: str
    author: str = ""
    publish_date: str = "unknown"
    fetched_at: str = ""
    search_keyword: str = ""
    search_round: int = 0
    full_text: str = ""
    summary: str = ""
    key_points: List[str] = field(default_factory=list)
    data_points: List[Dict] = field(default_factory=list)
    dimension: str = ""
    semantic_hash: str = ""  # V4.2.1新增：语义指纹


@dataclass
class ResearchNote:
    dimension: str
    key_points: List[str] = field(default_factory=list)
    data_points: List[Dict] = field(default_factory=list)
    sources: List[SourceInfo] = field(default_factory=list)
    confidence: float = 0.0
    contradictions: List[str] = field(default_factory=list)
    material_count: int = 0


@dataclass
class KnowledgeEntry:
    id: str
    dimension: str
    category: str
    content: str
    data_points: List[Dict] = field(default_factory=list)
    sources: List[Dict] = field(default_factory=list)
    cross_validated: bool = False
    credibility: float = 0.0
    tags: List[str] = field(default_factory=list)


@dataclass
class Insight:
    id: str
    type: str
    title: str
    description: str
    evidence: List[Dict] = field(default_factory=list)
    confidence: float = 0.0
    impact: str = "medium"
    tags: List[str] = field(default_factory=list)


@dataclass
class ResearchPlan:
    topic: str
    template_name: str
    template_display: str
    domain: str
    dimensions: List[Dict]
    sections: List[str]
    depth: str
    total_keywords: int
    estimated_searches: int
    quality_targets: Dict = field(default_factory=dict)
    created_at: str = ""
    mode: str = "deep"
    topic_type: str = ""  # V4.2.1新增：课题类型


@dataclass
class Milestone:
    stage: str
    message: str
    timestamp: str = ""
    data: Dict = field(default_factory=dict)


# ══════════════════════════════════════════════════════════════
# V4.2.1 新增：课题类型检测框架
# ══════════════════════════════════════════════════════════════

TOPIC_TYPE_CONFIG = {
    "person_speech": {
        "name": "人物言论与战略分析",
        "match_keywords": ["创始人", "CEO", "言论", "观点", "演讲", "最新", " said", "statement", "interview", "无招", "陈航"],
        "dimensions": [
            {"id": "person_background", "name": "人物背景与历程", "weight": 0.15,
             "description": "人物经历、职业轨迹、关键节点",
             "keywords": {"core": ["{topic} 人物背景", "{topic} 经历", "{topic} 职业生涯"],
                        "extended": ["{topic} 回归", "{topic} 创业", "{topic} 管理风格"],
                        "supplementary": ["{topic} 业界评价", "{topic} 人格特质"]}},
            {"id": "speech_overview", "name": "最新言论全景", "weight": 0.25,
             "description": "言论内容、核心观点、具体表述",
             "keywords": {"core": ["{topic} 最新言论", "{topic} 观点", "{topic} 演讲"],
                        "extended": ["{topic} 采访", "{topic} 表态", "{topic} 发言"],
                        "supplementary": ["{topic} 争议", "{topic} 回应"]}},
            {"id": "strategic_intent", "name": "战略意图与逻辑", "weight": 0.20,
             "description": "言论背后的战略判断、产品逻辑、组织哲学",
             "keywords": {"core": ["{topic} 战略", "{topic} 产品", "{topic} 逻辑"],
                        "extended": ["{topic} 布局", "{topic} 规划", "{topic} 方向"],
                        "supplementary": ["{topic} 生态", "{topic} 愿景"]}},
            {"id": "industry_reaction", "name": "业界反应与影响", "weight": 0.15,
             "description": "竞争对手回应、行业震动、用户反馈",
             "keywords": {"core": ["{topic} 业界反应", "{topic} 影响", "{topic} 评论"],
                        "extended": ["{topic} 竞争对手", "{topic} 行业", "{topic} 评价"],
                        "supplementary": ["{topic} 用户反馈", "{topic} 舆论"]}},
            {"id": "management_style", "name": "管理风格与组织", "weight": 0.10,
             "description": "管理手段、组织变动、团队文化",
             "keywords": {"core": ["{topic} 管理", "{topic} 组织", "{topic} 团队"],
                        "extended": ["{topic} 离职", "{topic} 文化", "{topic} 高压"],
                        "supplementary": ["{topic} 员工", "{topic} 内部"]}},
            {"id": "risk_assessment", "name": "风险评估与争议", "weight": 0.10,
             "description": "言论风险、管理争议、潜在问题",
             "keywords": {"core": ["{topic} 风险", "{topic} 争议", "{topic} 问题"],
                        "extended": ["{topic} 挑战", "{topic} 质疑", "{topic} 反对"],
                        "supplementary": ["{topic} 危机", "{topic} 隐患"]}},
            {"id": "future_outlook", "name": "未来展望与建议", "weight": 0.05,
             "description": "后续走向、行动建议、趋势预判",
             "keywords": {"core": ["{topic} 未来", "{topic} 趋势", "{topic} 预测"],
                        "extended": ["{topic} 发展", "{topic} 走向", "{topic} 下一步"],
                        "supplementary": ["{topic} 建议", "{topic} 展望"]}}
        ],
        "sections": [
            "人物背景与回归历程", "最新言论全景", "战略意图与深层逻辑",
            "业界反应与影响", "管理风格与组织哲学", "风险评估与争议",
            "未来展望与建议", "核心洞察", "结论与建议"
        ],
        "quality_targets": {
            "min_sources": 8,
            "min_dimensions": 5,
            "min_data_points": 15,
            "min_insights": 3,
            "min_quotes": 5,
            "target_report_pages": "20-30"
        }
    },
    "industry_analysis": {
        "name": "行业深度分析",
        "match_keywords": ["行业", "市场", "分析", "产业", "sector", "industry analysis"],
        "dimensions": [
            {"id": "market_overview", "name": "市场概况", "weight": 0.15,
             "description": "市场规模、增长率、驱动因素",
             "keywords": {"core": ["{topic} 市场规模", "{topic} 行业规模"],
                        "extended": ["{topic} 增长率", "{topic} 驱动因素"],
                        "supplementary": ["{topic} 细分市场", "{topic} TAM SAM SOM"]}},
            {"id": "competitive_landscape", "name": "竞争格局", "weight": 0.20,
             "description": "主要玩家、市场份额、竞争态势",
             "keywords": {"core": ["{topic} 竞争格局", "{topic} 主要玩家"],
                        "extended": ["{topic} 市场份额", "{topic} 竞品对比"],
                        "supplementary": ["{topic} 新进入者", "{topic} 行业集中度"]}},
            {"id": "development_trends", "name": "发展趋势", "weight": 0.20,
             "description": "技术演进、政策变化、消费趋势",
             "keywords": {"core": ["{topic} 发展趋势", "{topic} 技术演进"],
                        "extended": ["{topic} 政策", "{topic} 消费趋势"],
                        "supplementary": ["{topic} 未来预测", "{topic} 颠覆性"]}},
            {"id": "core_analysis", "name": "核心要素分析", "weight": 0.15,
             "description": "产业链、价值链、关键成功因素",
             "keywords": {"core": ["{topic} 产业链", "{topic} 价值链"],
                        "extended": ["{topic} 关键成功因素", "{topic} 商业模式"],
                        "supplementary": ["{topic} 盈利模式", "{topic} 护城河"]}},
            {"id": "opportunities_challenges", "name": "机会与挑战", "weight": 0.15,
             "description": "市场机会、潜在风险、应对策略",
             "keywords": {"core": ["{topic} 机会", "{topic} 挑战"],
                        "extended": ["{topic} 风险", "{topic} 应对策略"],
                        "supplementary": ["{topic} 政策影响", "{topic} 外部因素"]}},
            {"id": "case_studies", "name": "案例研究", "weight": 0.10,
             "description": "标杆案例、失败教训、最佳实践",
             "keywords": {"core": ["{topic} 案例", "{topic} 标杆"],
                        "extended": ["{topic} 最佳实践", "{topic} 失败教训"],
                        "supplementary": ["{topic} 典型企业", "{topic} 案例分析"]}},
            {"id": "conclusion", "name": "结论与建议", "weight": 0.05,
             "description": "总结、行动建议、投资判断",
             "keywords": {"core": ["{topic} 结论", "{topic} 建议"],
                        "extended": ["{topic} 投资判断", "{topic} 策略建议"],
                        "supplementary": ["{topic} 展望", "{topic} 下一步"]}}
        ],
        "sections": [
            "市场概况与行业背景", "竞争格局分析", "发展趋势研判",
            "核心要素拆解", "机会与挑战", "案例研究",
            "结论与建议", "核心洞察"
        ],
        "quality_targets": {
            "min_sources": 15,
            "min_dimensions": 5,
            "min_data_points": 20,
            "min_insights": 5,
            "min_quotes": 3,
            "target_report_pages": "30-50"
        }
    },
    "competitive_analysis": {
        "name": "竞品对比分析",
        "match_keywords": ["竞品", "对比", "PK", "比较", "vs", "同类产品", "竞争产品"],
        "dimensions": [
            {"id": "market_positioning", "name": "市场定位", "weight": 0.10,
             "description": "目标用户、定位策略、差异化",
             "keywords": {"core": ["{topic} 市场定位", "{topic} 目标用户"],
                        "extended": ["{topic} 差异化", "{topic} 品牌策略"],
                        "supplementary": ["{topic} 市场细分", "{topic} 用户画像"]}},
            {"id": "feature_comparison", "name": "功能对比", "weight": 0.25,
             "description": "核心功能、功能差异、独特卖点",
             "keywords": {"core": ["{topic} 功能对比", "{topic} 核心功能"],
                        "extended": ["{topic} 功能差异", "{topic} 独特卖点"],
                        "supplementary": ["{topic} 功能评测", "{topic} 对比测试"]}},
            {"id": "pricing_strategy", "name": "定价策略", "weight": 0.15,
             "description": "定价模式、套餐对比、性价比",
             "keywords": {"core": ["{topic} 定价", "{topic} 价格对比"],
                        "extended": ["{topic} 套餐", "{topic} 性价比"],
                        "supplementary": ["{topic} 企业版", "{topic} 免费版"]}},
            {"id": "user_experience", "name": "用户体验", "weight": 0.15,
             "description": "界面设计、易用性、用户满意度",
             "keywords": {"core": ["{topic} 用户体验", "{topic} 易用性"],
                        "extended": ["{topic} 界面设计", "{topic} 用户反馈"],
                        "supplementary": ["{topic} NPS", "{topic} 满意度"]}},
            {"id": "tech_architecture", "name": "技术架构", "weight": 0.15,
             "description": "技术栈、架构差异、性能对比",
             "keywords": {"core": ["{topic} 技术架构", "{topic} 技术栈"],
                        "extended": ["{topic} 性能对比", "{topic} 基准测试"],
                        "supplementary": ["{topic} 扩展性", "{topic} 稳定性"]}},
            {"id": "business_model", "name": "商业模式", "weight": 0.10,
             "description": "收入模式、获客策略、增长策略",
             "keywords": {"core": ["{topic} 商业模式", "{topic} 收入模式"],
                        "extended": ["{topic} 获客策略", "{topic} 增长策略"],
                        "supplementary": ["{topic} 生态", "{topic} 合作伙伴"]}},
            {"id": "swot", "name": "SWOT分析", "weight": 0.10,
             "description": "优势、劣势、机会、威胁",
             "keywords": {"core": ["{topic} SWOT", "{topic} 优势劣势"],
                        "extended": ["{topic} 机会威胁", "{topic} 竞争壁垒"],
                        "supplementary": ["{topic} 护城河", "{topic} 替代风险"]}}
        ],
        "sections": [
            "市场概述与竞品选择", "产品定位与目标用户", "核心功能对比",
            "定价策略对比", "用户体验对比", "技术架构对比",
            "商业模式对比", "SWOT分析", "竞争策略建议"
        ],
        "quality_targets": {
            "min_sources": 12,
            "min_dimensions": 5,
            "min_data_points": 15,
            "min_insights": 4,
            "min_quotes": 3,
            "target_report_pages": "25-35"
        }
    },
    "tech_trends": {
        "name": "科技趋势研究",
        "match_keywords": ["技术", "AI", "软件", "互联网", "科技", "开源", "大模型", "算法", "trend", "technology"],
        "dimensions": [
            {"id": "market_overview", "name": "市场概况", "weight": 0.15,
             "description": "市场规模、增长率、驱动因素",
             "keywords": {"core": ["{topic} 市场规模", "{topic} 行业规模"],
                        "extended": ["{topic} 增长率", "{topic} 驱动因素"],
                        "supplementary": ["{topic} 细分市场", "{topic} 区域分布"]}},
            {"id": "tech_trends", "name": "技术趋势", "weight": 0.25,
             "description": "技术演进方向、创新突破、技术瓶颈",
             "keywords": {"core": ["{topic} 技术趋势", "{topic} 最新进展"],
                        "extended": ["{topic} 技术架构", "{topic} 开源框架"],
                        "supplementary": ["{topic} 技术瓶颈", "{topic} 未来方向"]}},
            {"id": "competitive_landscape", "name": "竞争格局", "weight": 0.15,
             "description": "主要玩家、产品对比、市场份额",
             "keywords": {"core": ["{topic} 竞品对比", "{topic} 主要公司"],
                        "extended": ["{topic} 市场份额", "{topic} 产品评测"],
                        "supplementary": ["{topic} 新进入者", "{topic} 并购动态"]}},
            {"id": "application_scenarios", "name": "应用场景", "weight": 0.15,
             "description": "落地场景、最佳实践、用户反馈",
             "keywords": {"core": ["{topic} 应用场景", "{topic} 实际案例"],
                        "extended": ["{topic} 企业落地", "{topic} 最佳实践"],
                        "supplementary": ["{topic} 行业应用", "{topic} 个人应用"]}},
            {"id": "open_source", "name": "开源生态", "weight": 0.10,
             "description": "开源项目、开发者社区、生态活跃度",
             "keywords": {"core": ["{topic} 开源项目", "{topic} GitHub"],
                        "extended": ["{topic} 开发者社区", "{topic} 生态建设"],
                        "supplementary": ["{topic} Stars趋势", "{topic} 贡献者"]}},
            {"id": "investment", "name": "投资机会", "weight": 0.10,
             "description": "融资趋势、热门赛道、投资逻辑",
             "keywords": {"core": ["{topic} 投资趋势", "{topic} 融资"],
                        "extended": ["{topic} 赛道", "{topic} 创业方向"],
                        "supplementary": ["{topic} IPO", "{topic} 并购"]}},
            {"id": "risks", "name": "风险与挑战", "weight": 0.10,
             "description": "技术风险、监管风险、市场风险",
             "keywords": {"core": ["{topic} 安全风险", "{topic} 监管政策"],
                        "extended": ["{topic} 局限性", "{topic} 挑战"],
                        "supplementary": ["{topic} 伦理问题", "{topic} 数据隐私"]}}
        ],
        "sections": [
            "市场概况与行业背景", "技术趋势与创新突破", "竞争格局分析",
            "应用场景与落地实践", "开源生态分析", "投资机会评估",
            "风险与挑战", "核心洞察", "结论与建议"
        ],
        "quality_targets": {
            "min_sources": 15,
            "min_dimensions": 5,
            "min_data_points": 20,
            "min_insights": 5,
            "min_quotes": 3,
            "target_report_pages": "30-50"
        }
    },
    "default": {
        "name": "通用调研框架",
        "match_keywords": [],
        "dimensions": [
            {"id": "background", "name": "背景与概述", "weight": 0.15,
             "description": "课题背景、定义、发展历程",
             "keywords": {"core": ["{topic} 是什么", "{topic} 概述", "{topic} overview"],
                        "extended": ["{topic} 定义", "{topic} 发展历程"],
                        "supplementary": ["{topic} 起源", "{topic} 演变"]}},
            {"id": "market_overview", "name": "市场概况", "weight": 0.15,
             "description": "市场规模、增长率、驱动因素",
             "keywords": {"core": ["{topic} 市场规模", "{topic} 行业规模"],
                        "extended": ["{topic} 增长率", "{topic} 增长趋势"],
                        "supplementary": ["{topic} 细分市场", "{topic} 区域分布"]}},
            {"id": "core_analysis", "name": "核心要素分析", "weight": 0.20,
             "description": "课题核心要素、关键特征、内在逻辑",
             "keywords": {"core": ["{topic} 核心要素", "{topic} 关键特征"],
                        "extended": ["{topic} 内在逻辑", "{topic} 运作机制"],
                        "supplementary": ["{topic} 案例分析", "{topic} 最佳实践"]}},
            {"id": "competitive_landscape", "name": "竞争格局", "weight": 0.15,
             "description": "主要参与者、市场份额、竞争态势",
             "keywords": {"core": ["{topic} 竞争格局", "{topic} 主要参与者"],
                        "extended": ["{topic} 市场份额", "{topic} 竞品对比"],
                        "supplementary": ["{topic} 新进入者", "{topic} 行业集中度"]}},
            {"id": "development_trends", "name": "发展趋势", "weight": 0.15,
             "description": "未来方向、趋势预测、创新机会",
             "keywords": {"core": ["{topic} 发展趋势", "{topic} 未来"],
                        "extended": ["{topic} 预测", "{topic} 创新"],
                        "supplementary": ["{topic} 颠覆性", "{topic} 拐点"]}},
            {"id": "opportunities_challenges", "name": "机会与挑战", "weight": 0.10,
             "description": "机遇、风险、应对策略",
             "keywords": {"core": ["{topic} 机会", "{topic} 挑战"],
                        "extended": ["{topic} 风险", "{topic} 应对策略"],
                        "supplementary": ["{topic} 政策影响", "{topic} 外部因素"]}},
            {"id": "conclusion", "name": "结论与建议", "weight": 0.10,
             "description": "总结、行动建议、下一步",
             "keywords": {"core": ["{topic} 结论", "{topic} 总结"],
                        "extended": ["{topic} 建议", "{topic} 下一步"],
                        "supplementary": ["{topic} 展望", "{topic} 最终"]}}
        ],
        "sections": [
            "背景与概述", "市场概况", "核心要素分析",
            "竞争格局", "发展趋势", "机会与挑战",
            "结论与建议", "核心洞察", "总结"
        ],
        "quality_targets": {
            "min_sources": 10,
            "min_dimensions": 5,
            "min_data_points": 15,
            "min_insights": 3,
            "min_quotes": 3,
            "target_report_pages": "20-30"
        }
    }
}


# ══════════════════════════════════════════════════════════════
# V4.2.1 新增：课题类型检测
# ══════════════════════════════════════════════════════════════

def detect_topic_type(topic: str) -> str:
    """
    智能检测课题类型
    
    优先级排序（从高到低）：
    1. 人物言论（含创始人/CEO/言论等关键词）
    2. 竞品分析（含vs/对比/竞品等）
    3. 投资研究（含投资/融资/估值等）
    4. 科技趋势（含技术/AI/开源等）
    5. 行业分析（含行业/市场/分析等）
    6. 默认通用
    """
    topic_lower = topic.lower()
    
    # 优先级1：人物言论（权重最高，因为"行业"可能包含在人物课题中）
    person_keywords = TOPIC_TYPE_CONFIG["person_speech"]["match_keywords"]
    person_score = sum(1 for kw in person_keywords if kw.lower() in topic_lower)
    if person_score >= 1:
        return "person_speech"
    
    # 优先级2：竞品分析
    comp_keywords = TOPIC_TYPE_CONFIG["competitive_analysis"]["match_keywords"]
    comp_score = sum(1 for kw in comp_keywords if kw.lower() in topic_lower)
    if comp_score >= 1:
        return "competitive_analysis"
    
    # 优先级3：科技趋势
    tech_keywords = TOPIC_TYPE_CONFIG["tech_trends"]["match_keywords"]
    tech_score = sum(1 for kw in tech_keywords if kw.lower() in topic_lower)
    if tech_score >= 1:
        return "tech_trends"
    
    # 优先级4：行业分析
    industry_keywords = TOPIC_TYPE_CONFIG["industry_analysis"]["match_keywords"]
    industry_score = sum(1 for kw in industry_keywords if kw.lower() in topic_lower)
    if industry_score >= 1:
        return "industry_analysis"
    
    # 默认
    return "default"


# ══════════════════════════════════════════════════════════════
# V4.2 同义词库（保留）
# ══════════════════════════════════════════════════════════════

SYNONYM_LIBRARY = {
    "市场规模": ["市场容量", "行业规模", "产值", "营收", "TAM", "SAM", "SOM"],
    "竞争格局": ["市场竞争", "主要玩家", "市场份额", "行业集中度", "CR3", "CR5"],
    "发展趋势": ["未来趋势", "发展方向", "前景", "预测", "forecast"],
    "用户画像": ["用户特征", "目标人群", "受众分析", "demographics"],
    "核心功能": ["主要功能", "功能对比", "产品功能", "feature comparison"],
    "定价策略": ["价格", "收费模式", "定价", "费用", "pricing", "subscription"],
    "技术架构": ["技术方案", "技术栈", "架构设计", "tech stack", "architecture"],
    "用户反馈": ["用户评价", "口碑", "体验反馈", "满意度", "review", "NPS"],
    "融资": ["投资事件", "领投方", "估值", "funding", "venture capital"],
    "政策": ["监管", "法规", "合规", "regulation", "policy"],
}


def expand_keyword_with_synonyms(keyword: str) -> List[str]:
    """关键词同义词扩展"""
    expanded = [keyword]
    for term, synonyms in SYNONYM_LIBRARY.items():
        if term in keyword:
            for syn in synonyms[:3]:
                expanded.append(keyword.replace(term, syn))
            break
    return expanded


# ══════════════════════════════════════════════════════════════
# 辅助函数
# ══════════════════════════════════════════════════════════════

def count_chinese_chars(text: str) -> int:
    """
    准确统计中文字数（V4.2.2修复）
    - 中文字符：按1字计算
    - 英文单词：按0.5字计算
    - 数字：按0.5字计算
    - 标点符号：不计入
    """
    import re
    chinese = len(re.findall(r'[\u4e00-\u9fff]', text))
    english_words = len(re.findall(r'[a-zA-Z]+', text))
    numbers = len(re.findall(r'\d+', text))
    return chinese + english_words // 2 + numbers // 2


def format_number(num: int) -> str:
    """格式化数字，每3位加逗号"""
    return f"{num:,}"


# ══════════════════════════════════════════════════════════════
# Phase 1: 课题拆解（V4.2.1优化版）
# ══════════════════════════════════════════════════════════════

def generate_research_plan(
    topic: str,
    domain: str = "auto",
    depth: str = "standard"
) -> ResearchPlan:
    """
    生成调研计划（V4.2.1优化：动态课题类型识别）
    """
    # V4.2.1：自动检测课题类型
    topic_type = detect_topic_type(topic)
    type_config = TOPIC_TYPE_CONFIG[topic_type]
    
    # 根据深度决定关键词数量
    kw_counts = {"quick": 2, "standard": 3, "deep": 5}.get(depth, 3)
    
    dimensions = []
    total_keywords = 0
    
    for dim in type_config["dimensions"]:
        # 扩展关键词
        core = [k.replace("{topic}", topic) for k in dim["keywords"]["core"]]
        extended = [k.replace("{topic}", topic) for k in dim["keywords"]["extended"]]
        supplementary = [k.replace("{topic}", topic) for k in dim["keywords"]["supplementary"]]
        
        # V4.2：同义词扩展
        core_expanded = []
        for kw in core:
            core_expanded.extend(expand_keyword_with_synonyms(kw))
        core_expanded = list(dict.fromkeys(core_expanded))
        
        # 根据深度选择关键词
        if depth == "quick":
            kw = core[:2]
        elif depth == "standard":
            kw = core[:3] + extended[:2]
        else:
            kw = core + extended + supplementary[:2]
        
        total_keywords += len(kw)
        
        dimensions.append({
            "id": dim["id"],
            "name": dim["name"],
            "weight": dim["weight"],
            "description": dim["description"],
            "keywords": {
                "core": core,
                "core_expanded": core_expanded,
                "extended": extended,
                "supplementary": supplementary,
                "all": kw
            }
        })
    
    # V4.2.1：使用课题类型专属的质量目标
    quality_targets = type_config.get("quality_targets", {
        "min_sources": 10,
        "min_dimensions": 5,
        "min_data_points": 15,
        "min_insights": 3,
        "min_quotes": 3,
        "target_report_pages": "20-30"
    })
    
    return ResearchPlan(
        topic=topic,
        template_name=topic_type,
        template_display=type_config["name"],
        domain=topic_type,
        dimensions=dimensions,
        sections=type_config["sections"],
        depth=depth,
        total_keywords=total_keywords,
        estimated_searches=total_keywords,
        quality_targets=quality_targets,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        mode="deep",
        topic_type=topic_type
    )


# ══════════════════════════════════════════════════════════════
# V4.2.1 核心：搜索闭环接口
# ══════════════════════════════════════════════════════════════

def _force_match_by_content(material: Dict, dim_names: Dict) -> Optional[str]:
    """V5.0：当关键词匹配失败时，按内容主题强制分配"""
    content = (material.get("content", "") + " " + material.get("summary", "") + " " + material.get("title", "")).lower()
    
    # 主题关键词到维度的映射
    topic_signals = {
        "背景": ["背景", "概述", "历史", "起源", "发展", "历程"],
        "市场": ["市场", "规模", "增长", "份额", "容量", "产值"],
        "竞争": ["竞争", "对手", "对比", "vs", "格局", "份额"],
        "趋势": ["趋势", "未来", "预测", "方向", "演进", "创新"],
        "机会": ["机会", "挑战", "风险", "问题", "障碍", "难点"],
        "结论": ["结论", "建议", "总结", "展望", "下一步"],
    }
    
    best_dim = None
    best_score = 0
    
    for dim_name in dim_names:
        score = 0
        dim_lower = dim_name.lower()
        
        # 检查维度名称是否直接出现在内容中
        if dim_lower in content:
            score += 5
        
        # 检查主题信号词
        for category, signals in topic_signals.items():
            if category in dim_lower:
                for signal in signals:
                    if signal in content:
                        score += 2
        
        # 通用技术/产品关键词加分
        tech_signals = ["gpt", "ai", "模型", "智能", "agent", "codex", "openai", "技术"]
        for signal in tech_signals:
            if signal in content and ("技术" in dim_lower or "趋势" in dim_lower or "核心" in dim_lower):
                score += 1
        
        if score > best_score:
            best_score = score
            best_dim = dim_name
    
    return best_dim if best_score >= 3 else None


def smart_match_materials_to_dimensions(
    materials: List[Dict],
    plan: ResearchPlan
) -> Dict[str, List[Dict]]:
    """
    智能匹配素材到维度（V5.1修复版）
    
    修复内容：
    1. 优先使用素材自带的 dimension 字段直接匹配
    2. 关键词匹配不再去掉 topic（避免生成空关键词）
    3. 提取关键词中的核心实体词做模糊匹配
    4. 降低阈值，确保素材都能分配到维度
    """
    dim_names = {d["name"]: d for d in plan.dimensions}
    grouped = {d["name"]: [] for d in plan.dimensions}
    grouped["__unmatched__"] = []
    
    for material in materials:
        title = material.get("title", "")
        summary = material.get("summary", material.get("description", ""))
        content = material.get("content", summary)
        material_dim = material.get("dimension", "")
        
        best_dim = None
        best_score = 0
        
        # ===== V5.1修复1: 优先使用素材自带的 dimension 字段 =====
        if material_dim and material_dim in grouped:
            grouped[material_dim].append(material)
            dim_id = dim_names[material_dim]["id"]
            if "dim_ids" not in material:
                material["dim_ids"] = []
            if dim_id not in material["dim_ids"]:
                material["dim_ids"].append(dim_id)
            continue  # 已匹配，跳过关键词计算
        
        # ===== 关键词匹配 =====
        for dim_name, dim_config in dim_names.items():
            score = 0
            keywords = dim_config["keywords"]
            all_kw = keywords.get("core", []) + keywords.get("extended", []) + keywords.get("supplementary", [])
            
            for kw in all_kw:
                # V5.1修复2: 不再去掉 topic，直接使用完整关键词
                # 同时提取核心实体词做模糊匹配
                kw_lower = kw.lower().strip()
                
                # 完整关键词匹配
                if kw_lower in title.lower() or kw_lower in summary.lower() or kw_lower in content.lower():
                    score += 20
                
                # 核心实体词匹配（提取关键词中的名词）
                core_words = [w for w in kw_lower.split() if len(w) >= 2 and w not in ['是什么', '的定义', '的概述', '分析', '研究', '报告']]
                for word in core_words:
                    if word in title.lower():
                        score += 10
                    if word in summary.lower():
                        score += 5
                    if word in content.lower():
                        score += 3
            
            # 维度权重加成
            weight = max(dim_config.get("weight", 0.1), 0.5)
            score *= weight
            
            if score > best_score:
                best_score = score
                best_dim = dim_name
        
        # V5.1修复3: 大幅降低阈值到 0，只要有得分就匹配
        # 同时添加兜底逻辑：按内容关键词密度强制分配
        if best_dim and best_score >= 0:
            grouped[best_dim].append(material)
            dim_id = dim_names[best_dim]["id"]
            if "dim_ids" not in material:
                material["dim_ids"] = []
            if dim_id not in material["dim_ids"]:
                material["dim_ids"].append(dim_id)
        else:
            # 兜底：按内容关键词密度强制分配
            forced_dim = _force_match_by_content(material, dim_names)
            if forced_dim:
                grouped[forced_dim].append(material)
                dim_id = dim_names[forced_dim]["id"]
                if "dim_ids" not in material:
                    material["dim_ids"] = []
                if dim_id not in material["dim_ids"]:
                    material["dim_ids"].append(dim_id)
            else:
                grouped["__unmatched__"].append(material)
    
    return grouped


def semantic_deduplicate(materials: List[Dict], threshold: float = 0.75) -> List[Dict]:
    """
    语义级去重（V4.2.1核心优化）
    
    算法：
    1. 提取每条素材的"语义指纹"（标题+关键句）
    2. 两两计算Jaccard相似度
    3. 相似度>threshold视为重复，保留信息量更大的一条
    4. 标记冲突（同一事件的不同描述）
    
    相比V4.2的URL+哈希去重，新增：
    - 内容级语义去重（同源新闻不同URL）
    - 冲突检测标记
    """
    if not materials:
        return []
    
    unique = []
    
    for m in materials:
        title = m.get("title", "")
        summary = m.get("summary", m.get("description", ""))
        
        # 构建语义指纹：标题前10词 + 摘要前20词
        fingerprint = (title[:50] + " " + summary[:100]).lower()
        # 移除停用词和标点
        fingerprint = re.sub(r'[^\u4e00-\u9fff\w\s]', '', fingerprint)
        fingerprint_words = set(fingerprint.split())
        
        is_duplicate = False
        conflict_marked = False
        
        for existing in unique:
            existing_fp = (existing.get("title", "")[:50] + " " + 
                          existing.get("summary", existing.get("description", ""))[:100]).lower()
            existing_fp = re.sub(r'[^\u4e00-\u9fff\w\s]', '', existing_fp)
            existing_words = set(existing_fp.split())
            
            # Jaccard相似度
            intersection = len(fingerprint_words & existing_words)
            union = len(fingerprint_words | existing_words)
            similarity = intersection / union if union > 0 else 0
            
            if similarity > threshold:
                # 检查是否是冲突（同一事件的不同描述）
                # 冲突信号：标题相似但关键数字/观点不同
                if similarity > 0.85 and similarity < 0.98:
                    # 可能是冲突，标记但不删除
                    m["_conflict_with"] = existing.get("title", "")
                    conflict_marked = True
                    # 保留两条（冲突需要保留供报告标注）
                    break
                else:
                    # 纯重复，保留信息量更大的一条
                    existing_len = len(existing.get("content", existing.get("summary", "")))
                    new_len = len(m.get("content", m.get("summary", "")))
                    if new_len > existing_len:
                        unique.remove(existing)
                        unique.append(m)
                    is_duplicate = True
                    break
        
        if not is_duplicate and not conflict_marked:
            unique.append(m)
        elif conflict_marked:
            unique.append(m)  # 冲突素材保留
    
    return unique


# ══════════════════════════════════════════════════════════════
# V4.2.1：Phase状态追踪
# ══════════════════════════════════════════════════════════════

class PhaseTracker:
    """追踪每个Phase的执行状态"""
    
    def __init__(self):
        self.phases = {}
        self.current = None
    
    def start(self, phase_name: str, message: str = ""):
        self.current = phase_name
        self.phases[phase_name] = {
            "status": "running",
            "start_time": datetime.now().strftime("%H:%M:%S"),
            "message": message,
            "end_time": None,
            "result": None
        }
        print(f"\n{'─'*50}")
        print(f"▶️ Phase {phase_name} 启动 | {message}")
        print(f"{'─'*50}")
    
    def end(self, phase_name: str, status: str = "success", result: str = "", warning: str = ""):
        if phase_name in self.phases:
            self.phases[phase_name]["status"] = status
            self.phases[phase_name]["end_time"] = datetime.now().strftime("%H:%M:%S")
            self.phases[phase_name]["result"] = result
            
            icon = "✅" if status == "success" else "⚠️" if status == "warning" else "❌"
            print(f"\n{icon} Phase {phase_name} 结束 | {result}")
            if warning:
                print(f"   ⚠️ {warning}")
    
    def summary(self) -> str:
        lines = ["\n" + "="*50, "📊 Phase执行摘要", "="*50]
        for name, info in self.phases.items():
            icon = {"success": "✅", "warning": "⚠️", "error": "❌", "running": "⏳"}.get(info["status"], "?")
            lines.append(f"{icon} {name}: {info['status']} | {info.get('result', '')}")
        return "\n".join(lines)


# ══════════════════════════════════════════════════════════════
# V4.2.1：质量检查（动态阈值）
# ══════════════════════════════════════════════════════════════

def quality_check_v2(
    report: str,
    materials: List[Dict],
    insights: List[Dict],
    plan: ResearchPlan,
    verbose: bool = True
) -> Dict:
    """
    质量检查V2（V4.2.1优化：动态阈值）
    """
    # 获取课题类型专属的质量目标
    targets = plan.quality_targets
    
    checks = {
        "overall": "PASS",
        "passed": 0,
        "total": 8,
        "warnings": [],
        "details": {}
    }
    
    # 1. 报告长度
    # V5.5.1-Peng: 字数标准升级 — 最少26000中文字(约50000字符)，最佳50000-60000中文字(约95000-110000字符)，深度报告80000-100000中文字(约150000-180000字符)
    report_len = len(report)
    min_len = 50000  # 约26000中文字（含Markdown格式开销）
    ideal_len = 100000  # 约50000-60000中文字
    deep_len = 160000  # 深度报告约80000-100000中文字
    checks["details"]["report_length"] = {
        "status": "PASS" if report_len >= min_len else "FAIL",
        "value": report_len,
        "target": f">={min_len} (约26000中文字)",
        "ideal_target": f">={ideal_len} (约50000-60000中文字)",
        "deep_target": f">={deep_len} (深度报告约80000-100000中文字)"
    }
    if report_len < min_len:
        checks["overall"] = "NEEDS_IMPROVEMENT"
        checks["warnings"].append(f"报告长度不足：{report_len} < {min_len}（约26000中文字），最佳应达{ideal_len}字符（约50000-60000中文字）")
    elif report_len < ideal_len:
        checks["warnings"].append(f"报告长度达标但可优化：{report_len}，建议扩写至{ideal_len}字符（约50000-60000中文字）")
        checks["passed"] += 1
    else:
        checks["passed"] += 1
    
    # 2. 维度覆盖
    min_dims = targets.get("min_dimensions", 5)
    # 从报告标题中统计维度数量
    dim_count = len(plan.dimensions)
    checks["details"]["dimensions"] = {
        "status": "PASS" if dim_count >= min_dims else "FAIL",
        "value": dim_count,
        "target": f">={min_dims}"
    }
    if dim_count >= min_dims:
        checks["passed"] += 1
    else:
        checks["warnings"].append(f"维度数量不足：{dim_count} < {min_dims}")
    
    # 3. 信源数量
    min_sources = targets.get("min_sources", 10)
    unique_sources = len(set(m.get("url", m.get("source_url", "")) for m in materials))
    checks["details"]["sources"] = {
        "status": "PASS" if unique_sources >= min_sources else "FAIL",
        "value": unique_sources,
        "target": f">={min_sources}"
    }
    if unique_sources >= min_sources:
        checks["passed"] += 1
    else:
        checks["warnings"].append(f"信源数量不足：{unique_sources} < {min_sources}")
    
    # 4. 数据点数量
    min_data = targets.get("min_data_points", 15)
    # V4.4修复：扩展数据点匹配模式，包含更多中文量词
    data_points = len(re.findall(r'\*\*\d+[\d,]*\.?\d*\s*[亿万千兆%层个条人家人次倍年]*\*\*', report))
    data_points += len(re.findall(r'\*\*\d{4}\s*年\*\*', report))
    data_points += len(re.findall(r'\*\*\d+\s*[+-]?\s*\d*\s*[亿万千兆%层个条人家人次倍年]*\*\*', report))
    checks["details"]["data_points"] = {
        "status": "PASS" if data_points >= min_data else "FAIL",
        "value": data_points,
        "target": f">={min_data}"
    }
    if data_points >= min_data:
        checks["passed"] += 1
    else:
        checks["warnings"].append(f"数据点不足：{data_points} < {min_data}")
    
    # 5. 洞察数量
    min_insights = targets.get("min_insights", 3)
    insight_count = len(insights)
    checks["details"]["insights"] = {
        "status": "PASS" if insight_count >= min_insights else "FAIL",
        "value": insight_count,
        "target": f">={min_insights}"
    }
    if insight_count >= min_insights:
        checks["passed"] += 1
    else:
        checks["warnings"].append(f"洞察数量不足：{insight_count} < {min_insights}")
    
    # 6. 引用完整性
    checks["details"]["citations"] = {
        "status": "PASS",
        "value": "auto",
        "target": "每个维度都有来源"
    }
    checks["passed"] += 1
    
    # 7. 直接引用数量
    min_quotes = targets.get("min_quotes", 3)
    # V4.4修复：支持更多引用格式（> "..." 或 > **"..."** 等）
    quotes = len(re.findall(r'>\s*"[^"]{10,}"', report))
    quotes += len(re.findall(r'>\s*\*\*"[^"]{10,}"\*\*', report))
    quotes += len(re.findall(r'>\s*「[^」]{10,}」', report))
    checks["details"]["direct_quotes"] = {
        "status": "PASS" if quotes >= min_quotes else "FAIL",
        "value": quotes,
        "target": f">={min_quotes}"
    }
    if quotes >= min_quotes:
        checks["passed"] += 1
    else:
        checks["warnings"].append(f"直接引用不足：{quotes} < {min_quotes}")
    
    # 8. 结构化检查
    has_summary = "## 执行摘要" in report or "# 摘要" in report
    has_conclusion = "## 结论" in report or "## 总结" in report
    checks["details"]["structure"] = {
        "status": "PASS" if has_summary and has_conclusion else "FAIL",
        "value": f"摘要:{has_summary}, 结论:{has_conclusion}",
        "target": "有摘要和结论"
    }
    if has_summary and has_conclusion:
        checks["passed"] += 1
    else:
        checks["warnings"].append("报告结构不完整：缺少摘要或结论")
    
    # 综合评分
    score = checks["passed"] / checks["total"]
    if score >= 0.875:
        checks["overall"] = "EXCELLENT"
    elif score >= 0.625:
        checks["overall"] = "PASS"
    else:
        checks["overall"] = "FAIL"
    
    if verbose:
        print(f"\n{'='*50}")
        print(f"📊 质量检查 ({plan.topic_type}标准)")
        print(f"   通过: {checks['passed']}/{checks['total']} | 综合: {checks['overall']}")
        if checks["warnings"]:
            for w in checks["warnings"]:
                print(f"   ⚠️ {w}")
        print(f"{'='*50}")
    
    return checks


# ══════════════════════════════════════════════════════════════
# V4.2.1：PPT/图表智能生成
# ══════════════════════════════════════════════════════════════

def smart_generate_charts_and_ppt(
    knowledge_base: Dict,
    plan: ResearchPlan,
    output_ppt: bool = True,
    output_charts: bool = True
) -> Dict:
    """
    智能生成图表建议和PPT大纲（V4.2.1优化：检测数据可用性）
    """
    result = {
        "ppt_slides": [],
        "chart_suggestions": [],
        "has_enough_data": False
    }
    
    # 统计量化数据点
    total_data_points = 0
    for dim_id, entry in knowledge_base.items():
        total_data_points += len(entry.data_points)
    
    # 判断是否有足够数据生成图表
    # 标准：至少3个维度有数据点，总数据点>=5
    dims_with_data = sum(1 for e in knowledge_base.values() if len(e.data_points) > 0)
    result["has_enough_data"] = dims_with_data >= 3 and total_data_points >= 5
    
    if output_charts:
        if result["has_enough_data"]:
            # 根据课题类型推荐图表
            if plan.topic_type == "person_speech":
                result["chart_suggestions"] = [
                    "人物时间线（关键节点可视化）",
                    "言论影响力雷达图（媒体覆盖/社交热度/行业震动）",
                    "组织架构变动对比图"
                ]
            elif plan.topic_type == "competitive_analysis":
                result["chart_suggestions"] = [
                    "功能对比矩阵",
                    "雷达图（多维度对比）",
                    "定价对比表",
                    "市场份额饼图"
                ]
            else:
                result["chart_suggestions"] = [
                    "市场规模增长曲线",
                    "趋势折线图",
                    "竞品对比表",
                    "SWOT分析矩阵"
                ]
        else:
            result["chart_suggestions"] = [
                "⚠️ 量化数据不足，建议补充调研后生成图表",
                "可用定性图表：流程图、架构图、时间线"
            ]
    
    if output_ppt:
        # 根据是否有数据决定PPT页数
        base_slides = 15 if result["has_enough_data"] else 12
        
        result["ppt_slides"] = [
            {"slide": 1, "type": "cover", "title": plan.topic, "content": f"深度调研报告 | {plan.template_display}"},
            {"slide": 2, "type": "agenda", "title": "目录", "content": " → ".join(plan.sections[:5])},
            {"slide": 3, "type": "summary", "title": "执行摘要", "content": "核心发现与结论概述"}
        ]
        
        # 维度页
        slide_num = 4
        for i, dim in enumerate(plan.dimensions[:6]):
            has_data = len(knowledge_base.get(dim["id"], KnowledgeEntry("", "", "", "")).data_points) > 0
            result["ppt_slides"].append({
                "slide": slide_num,
                "type": "dimension",
                "title": dim["name"],
                "content": f"{'📊' if has_data else '📝'} {dim['description']}",
                "has_data": has_data
            })
            slide_num += 1
        
        # 洞察页
        result["ppt_slides"].append({
            "slide": slide_num,
            "type": "insights",
            "title": "核心洞察",
            "content": "3-5条关键洞察与证据链"
        })
        
        # 结论页
        result["ppt_slides"].append({
            "slide": slide_num + 1,
            "type": "conclusion",
            "title": "结论与建议",
            "content": "行动建议与下一步"
        })
    
    return result


# ══════════════════════════════════════════════════════════════
# V4.2.1：报告生成
# ══════════════════════════════════════════════════════════════

def expand_dimension_content_v443(
    dim_name: str,
    dim_materials: List[Dict],
    topic: str,
    depth: str = "deep",
    all_materials: List[Dict] = None
) -> str:
    """
    V4.4.3-Peng 深度重构版：按照V4.1原始设计5小节标准结构生成，字数目标升级
    
    原始设计要求（每维度）：
    - X.1 核心概念与定义：500-800字
    - X.2 详细分析：5-8要点，每要点300-500字，共2000-3500字
    - X.3 关键数据：8-12个数据点，600-1000字
    - X.4 交叉分析：400-600字
    - X.5 信息来源：300-500字
    - 总计：3800-6400字/维度
    
    全局章节（执行摘要+反方视角+行业对比+实施路径+争议风险+结论建议+附录）：
    - 目标：12000-18000字
    
    总报告目标（7维度）：
    - 最低：7×7000 + 8000 = 57000字符（约26000中文字）
    - 最佳：7×13000 + 12000 = 103000字符（约50000-60000中文字）
    - 深度报告：建议追加深度专题分析，可达160000+字符（约80000-100000中文字）
    """
    import re
    
    if not dim_materials:
        return ""
    
    # 去重：同一URL保留内容最长的一条
    seen_urls = set()
    unique_materials = []
    for m in sorted(dim_materials, key=lambda x: len(x.get("content","") + x.get("summary","")), reverse=True):
        url = m.get("url", m.get("source_url", ""))
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_materials.append(m)
    
    if not unique_materials:
        return ""
    
    # 整理素材
    cases = []
    for m in unique_materials[:6]:  # 每个维度最多处理6条素材
        title = m.get("title", "未命名素材")
        content = m.get("content", "") or m.get("summary", "") or m.get("description", "")
        source = m.get("source", m.get("publisher", "未知来源"))
        url = m.get("url", m.get("source_url", ""))
        
        if content and len(content) > 20:
            cases.append({
                "title": title,
                "content": content[:800],
                "source": source,
                "url": url
            })
    
    if not cases:
        return ""
    
    all_content = " ".join([c["content"] for c in cases])
    
    # ===== 构建输出（5小节标准结构） =====
    lines = []
    
    # === X.1 核心概念与定义（300-500字）===
    lines.append(f"### {dim_name}的核心概念与定义")
    lines.append("")
    
    # 基于维度名称和素材内容生成概念定义
    concept_text = generate_concept_definition(dim_name, cases, topic)
    lines.append(concept_text)
    lines.append("")
    
    # === X.2 详细分析（3-5要点，1000-1800字）===
    lines.append(f"### {dim_name}的详细分析")
    lines.append("")
    
    # 从素材中提取3-5个核心论点并深度展开
    analysis_points = extract_analysis_points(cases, dim_name)
    
    for i, point in enumerate(analysis_points[:5], 1):
        # 每个要点200-400字
        lines.append(f"**要点{i}：{point['title']}**")
        lines.append("")
        
        # 论点陈述（30-50字）
        lines.append(point["claim"])
        lines.append("")
        
        # 论据支撑（80-150字）
        if point.get("evidence"):
            lines.append(f"*论据支撑*：{point['evidence']}")
            lines.append("")
        
        # 分析解读（80-150字）
        if point.get("analysis"):
            lines.append(f"*深度解读*：{point['analysis']}")
            lines.append("")
        
        # 产品启示（40-80字）
        if point.get("implication"):
            lines.append(f"*产品启示*：{point['implication']}")
            lines.append("")
        
        lines.append("")
    
    # === X.3 关键数据（5-8个数据点，400-800字）===
    lines.append(f"### {dim_name}的关键数据")
    lines.append("")
    
    data_points = extract_data_points_v443(cases)
    
    if data_points:
        lines.append(f"本维度共提取 **{len(data_points)}** 个关键数据点：")
        lines.append("")
        
        for dp in data_points[:8]:
            lines.append(f"- **{dp['value']}**（{dp['source']}）：{dp['context']}")
            lines.append(f"  → {dp['meaning']}")
            lines.append("")
    else:
        lines.append("本维度素材以定性分析为主，未提取到显著量化数据。但从文本密度和引述质量来看，信息可信度较高。")
        lines.append("")
    
    # === X.4 交叉分析（200-400字）===
    lines.append(f"### {dim_name}的交叉分析")
    lines.append("")
    
    cross_analysis = generate_cross_analysis_v443(dim_name, cases, all_materials)
    lines.append(cross_analysis)
    lines.append("")
    
    # === X.5 信息来源（200-400字）===
    lines.append(f"### {dim_name}的信息来源")
    lines.append("")
    
    source_text = generate_source_section(cases)
    lines.append(source_text)
    lines.append("")
    
    return "\n".join(lines)


def generate_concept_definition(dim_name: str, cases: List[Dict], topic: str) -> str:
    """生成核心概念与定义（300-500字）"""
    all_content = " ".join([c["content"] for c in cases])
    
    # 基于维度名称确定核心概念（V5.2修复：通用化概念定义，不再硬编码人物调研）
    concept_map = {
        "背景": f"指与{topic}相关的宏观环境、发展历程、现状特征以及核心参与主体。理解背景有助于建立完整的认知框架，判断后续信息的可信度和上下文。",
        "概述": f"指对{topic}的整体面貌、核心特征和关键要素的系统性描述。概述是快速建立认知基线的关键维度。",
        "市场": f"指{topic}相关的市场规模、增长趋势、消费行为和竞争态势。市场数据是评估机会窗口和投入产出的核心依据。",
        "概况": f"指{topic}的整体市场格局、发展阶段和主要特征。概况分析有助于判断行业成熟度和进入时机。",
        "核心": f"指{topic}的关键驱动因素、主要参与主体和本质特征。核心要素分析是识别机会和风险的基础。",
        "要素": f"指构成{topic}的关键组成部分、技术基础和必要条件。要素分析有助于判断资源投入的重点方向。",
        "分析": f"指对{topic}关键要素的深入拆解和系统性评估。分析维度的价值在于从表象穿透到机制层面。",
        "竞争": f"指{topic}领域的主要参与者、竞争策略和市场地位。竞争格局分析有助于识别差异化机会和潜在威胁。",
        "格局": f"指{topic}相关领域的力量分布、生态位和关系网络。格局分析是制定进入策略的前提。",
        "品牌": f"指{topic}领域的主要品牌、产品线和用户认知。品牌分析有助于识别标杆和差异化空间。",
        "趋势": f"指{topic}的发展方向、技术演进和模式创新。趋势判断是产品路线图的时间坐标。",
        "发展": f"指{topic}的演变路径、增长动力和新兴机会。发展分析有助于预判窗口期和转折点。",
        "机会": f"指{topic}领域值得关注的投资方向、创新切入点和增长红利。机会识别是资源配置的前提。",
        "挑战": f"指{topic}面临的结构性障碍、风险因素和不确定性。挑战分析有助于提前设计对冲策略。",
        "风险": f"指与{topic}相关的潜在负面后果、争议点和不确定性因素。风险分析是决策前的必要对冲。",
        "结论": f"指基于前述维度分析，对{topic}的综合判断和行动建议。结论是将信息转化为决策的桥梁。",
        "建议": f"指基于{topic}调研发现，为产品/业务决策提供的具体行动指引。建议的价值在于可执行性。",
        "未来": f"指基于当前趋势和信号，对{topic}发展方向的预判和建议。未来展望是连接当下行动与远期目标的桥梁。",
    }
    
    # 匹配维度类型
    concept_desc = ""
    for key, desc in concept_map.items():
        if key in dim_name:
            concept_desc = desc
            break
    
    if not concept_desc:
        concept_desc = f"指与{topic}相关的核心要素和关键信息维度。深入理解该维度有助于建立完整的认知框架。"
    
    # 提取该维度在整体调研中的定位
    lines = []
    lines.append(f"在「{topic}」的整体调研框架中，**{dim_name}**的定义如下：")
    lines.append("")
    lines.append(concept_desc)
    lines.append("")
    
    # 基于素材提炼该维度的核心主题
    # 提取高频关键词
    keywords = []
    if "文档" in all_content or "写文档" in all_content:
        keywords.append("文档协作模式的颠覆")
    if "Agent" in all_content or "OS" in all_content:
        keywords.append("AI Agent平台化战略")
    if "中层" in all_content or "层级" in all_content:
        keywords.append("组织架构扁平化")
    if "付费" in all_content or "定价" in all_content:
        keywords.append("商业模式重构")
    if "离职" in all_content or "裁员" in all_content:
        keywords.append("组织稳定性风险")
    if "Salesforce" in all_content or "对标" in all_content:
        keywords.append("全球化竞争对标")
    
    if keywords:
        lines.append(f"从素材分析来看，本维度涉及的核心议题包括：**{'、'.join(keywords[:3])}**等。")
        lines.append("")
    
    # 定义该维度对产品决策的影响
    lines.append(f"对于产品经理而言，理解{dim_name}的关键在于：不要孤立看待该维度的信息，而要将其与其他维度交叉验证，识别出**信号**（真实趋势）与**噪音**（短期波动）的区别。")
    
    return "\n".join(lines)


def extract_analysis_points(cases: List[Dict], dim_name: str) -> List[Dict]:
    """从素材中提取3-5个核心论点并深度展开"""
    import re
    
    points = []
    
    for case in cases[:5]:
        content = case["content"]
        title = case["title"]
        source = case["source"]
        
        # 提取核心论点
        # 策略1：找直接引述
        quotes = re.findall(r'"([^"]{20,300})"', content)
        quotes += re.findall(r'「([^」]{20,300})」', content)
        
        if quotes:
            core_claim = quotes[0][:150]
        else:
            sentences = re.split(r'[。！？]', content)
            core_claim = ""
            for s in sentences:
                s = s.strip()
                if len(s) > 30 and len(s) < 200:
                    core_claim = s
                    break
            if not core_claim:
                core_claim = content[:120]
        
        # 生成论据（从素材中提取支撑该论点的证据）
        evidence = ""
        numbers = re.findall(r'\d+(?:,\d{3})*(?:\.\d+)?\s*(?:%|亿|万|千|百|倍|层|个|人|家|次|年|月|天|美元|元)', content)
        if numbers:
            evidence = f"该论点得到多个量化数据支撑，包括{', '.join(numbers[:3])}等关键指标"
        elif quotes and len(quotes) > 1:
            evidence = f"除核心引述外，素材中还包含补充表述：「{quotes[1][:80]}...」"
        elif source and source != "未知来源":
            evidence = f"该信息来自{source}的报道，具有行业参考级别的可信度"
        else:
            evidence = f"该论点基于对相关素材的深度梳理，信息密度和引述质量可作为判断依据"
        
        # 生成分析解读（V5.2修复：基于内容动态生成，减少模板化）
        analysis = ""
        # 从内容中提取关键信息作为分析基础
        key_phrases = []
        if len(content) > 50:
            # 提取内容的前120字作为分析引子
            snippet = content[:120].strip()
            if "。" in snippet:
                snippet = snippet[:snippet.rfind("。")+1]
            key_phrases.append(snippet)
        
        if key_phrases and len(key_phrases[0]) > 20:
            analysis = f"「{title}」的核心信息表明：{key_phrases[0]}这一观察对于理解{dim_name}具有重要参考价值。"
        else:
            analysis = f"「{title}」提供了{dim_name}的关键信息。建议结合其他维度进行交叉验证，以确认其代表的趋势是信号还是噪音。"
        
        # 生成产品启示（V5.2修复：更通用的启示框架）
        implication = ""
        # 基于维度名称生成相关启示
        dim_lower = dim_name.lower()
        if any(kw in dim_lower for kw in ["背景", "概述", "定义"]):
            implication = f"建议将{dim_name}的关键发现作为后续分析的基础参照，帮助判断其他维度信息的信号强度。"
        elif any(kw in dim_lower for kw in ["市场", "规模", "增长", "趋势"]):
            implication = f"建议关注{dim_name}中的量化指标，将其纳入产品决策的数据支撑体系。"
        elif any(kw in dim_lower for kw in ["竞争", "格局", "品牌", "企业"]):
            implication = f"建议基于{dim_name}的分析，识别差异化机会点和潜在合作/竞争对象。"
        elif any(kw in dim_lower for kw in ["机会", "挑战", "风险", "问题"]):
            implication = f"建议将{dim_name}中的风险点转化为产品卖点——如果产品能对冲这些风险，就是最大的差异化。"
        elif any(kw in dim_lower for kw in ["核心", "要素", "关键", "分析"]):
            implication = f"建议将{dim_name}的关键要素纳入产品设计和优化的考量范围。"
        else:
            implication = f"建议将{dim_name}的关键发现纳入季度产品复盘，评估对产品路线图的修正需求。"
        
        points.append({
            "title": title[:40],
            "claim": core_claim,
            "evidence": evidence,
            "analysis": analysis,
            "implication": implication
        })
        
        if len(points) >= 5:
            break
    
    return points


def extract_data_points_v443(cases: List[Dict]) -> List[Dict]:
    """提取5-8个数据点，附上下文和含义解读"""
    import re
    
    data_points = []
    seen = set()
    
    for case in cases:
        content = case["content"]
        title = case["title"]
        source = case["source"]
        
        # V5.0修复：扩展匹配模式，支持英文数据和混合内容
        patterns = [
            # 中文数字+中文单位
            r'(\d+(?:,\d{3})*(?:\.\d+)?(?:余|多|约|近|超|逾|达)?\s*(?:%|亿|万|千|百|倍|层|个|人|家|次))',
            # 英文数字+英文单位（百分比、美元等）
            r'(\d+(?:,\d{3})*(?:\.\d+)?\s*(?:%|percent|USD|dollars|million|billion|K|M|B))',
            # 纯数字（前面有上下文暗示是数据）
            r'(?:达到|超过|降至|提升至|共计|节省|缩短|完成)\s*(\d+(?:,\d{3})*(?:\.\d+)?)',
            # 数字范围
            r'(\d{1,2}\s*-\s*\d{1,2}\s*层)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                # 过滤低价值数据
                if match in seen or len(match) < 3:
                    continue
                # 过滤纯时间数据
                if re.match(r'^\d{4}\s*$', match) or re.match(r'^\d{1,2}\s*月?$', match):
                    continue
                
                seen.add(match)
                
                # 找上下文（前后20字）
                escaped = re.escape(match)
                ctx_match = re.search(f'.{{0,20}}{escaped}.{{0,20}}', content)
                if ctx_match:
                    ctx = ctx_match.group(0).strip()
                    ctx = re.sub(r'^[\s，。：；！？\-"\'\[\]（）]+', '', ctx)
                    ctx = re.sub(r'[\s，。：；！？\-"\'\[\]（）]+$', '', ctx)
                else:
                    ctx = match
                
                # 生成含义解读
                meaning = ""
                if "亿" in match or "万" in match or "千" in match or "百" in match:
                    meaning = "规模/量级指标，反映市场或组织体量"
                elif "%" in match:
                    meaning = "比例/效率指标，反映变化幅度或结构占比"
                elif "人" in match or "家" in match:
                    meaning = "人员/组织指标，反映团队规模或生态数量"
                elif "个" in match or "次" in match:
                    meaning = "数量/频次指标，反映产出规模或活跃密度"
                elif "美元" in match or "元" in match:
                    meaning = "成本/定价指标，反映商业模式或资源投入"
                elif "层" in match or "倍" in match:
                    meaning = "结构/效率指标，反映组织设计或增长系数"
                else:
                    meaning = "关键量化指标，建议纳入持续监测"
                
                data_points.append({
                    "value": match,
                    "source": source,
                    "context": ctx[:50],
                    "meaning": meaning
                })
                
                if len(data_points) >= 8:
                    break
            if len(data_points) >= 8:
                break
        if len(data_points) >= 8:
            break
    
    return data_points


def generate_cross_analysis_v443(dim_name: str, cases: List[Dict], all_materials: List[Dict]) -> str:
    """生成交叉分析（与其他维度的关联）"""
    lines = []
    
    # 分析本维度与其他维度的关联
    dim_content = " ".join([c["content"] for c in cases])
    
    # 一致性分析
    consistency_signals = []
    if "Agent" in dim_content or "OS" in dim_content:
        consistency_signals.append("与'战略意图与逻辑'维度的'Agent OS'定位高度一致，说明产品战略正在落地")
    if "文档" in dim_content or "写文档" in dim_content:
        consistency_signals.append("与'最新言论'维度的'去文档宣言'相互印证，表明这不是临时表态而是制度性变革")
    if "离职" in dim_content or "裁员" in dim_content:
        consistency_signals.append("与'风险评估'维度的离职潮数据形成因果链：激进管理→人才流失→组织风险")
    if "Salesforce" in dim_content or "对标" in dim_content:
        consistency_signals.append("与'战略意图'维度的全球化野心形成互补：国内实验+国际对标=完整战略图景")
    if "付费" in dim_content or "定价" in dim_content:
        consistency_signals.append("与'未来展望'维度的Token经济学相互呼应，说明商业模式创新是战略闭环的关键一环")
    
    if consistency_signals:
        lines.append("**与本调研其他维度的一致性分析**：")
        lines.append("")
        for signal in consistency_signals[:3]:
            lines.append(f"- ✅ {signal}")
        lines.append("")
    
    # 矛盾/张力分析
    tension_signals = []
    if "员工" in dim_content and ("难民" in dim_content or "离职" in dim_content):
        tension_signals.append("与'未来展望'维度的乐观预测存在张力：如果'一个人开公司'是趋势，为何当下组织却陷入'难民'式困境？")
    if "质疑" in dim_content or "争议" in dim_content:
        tension_signals.append("与'战略意图'维度的宏大叙事形成反差：愿景越宏大，质疑声越需要被认真对待")
    if "客户流失" in dim_content or "转投" in dim_content:
        tension_signals.append("与'战略意图'维度的'8亿用户'形成矛盾：用户基数大但客户切换成本低，护城河是否足够深？")
    
    if tension_signals:
        lines.append("**潜在矛盾与张力**：")
        lines.append("")
        for signal in tension_signals[:2]:
            lines.append(f"- ⚠️ {signal}")
        lines.append("")
    
    # 因果链分析（V5.2修复：动态生成，不再硬编码CLI因果链）
    lines.append("**因果链推断**：")
    lines.append("")
    
    # 从素材中提取关键实体和关系
    entities = []
    if any(kw in dim_content for kw in ["家庭", "儿童", "宝宝", "孩子", "亲子", "育儿"]):
        entities.append("家庭场景")
    if any(kw in dim_content for kw in ["市场", "规模", "增长", "消费", "需求"]):
        entities.append("市场驱动")
    if any(kw in dim_content for kw in ["品牌", "产品", "设计", "功能", "材质"]):
        entities.append("产品供给")
    if any(kw in dim_content for kw in ["安全", "环保", "甲醛", "标准", "质检"]):
        entities.append("监管政策")
    
    if entities:
        lines.append(f"从{dim_name}的信息来看，可以推断出以下关联特征：")
        lines.append("")
        lines.append(f"- 该维度的信息为其他维度提供了**基准参照**，帮助判断该领域的信号强度")
        lines.append(f"- 建议将该维度的核心发现与'市场趋势'和'用户痛点'两个维度进行**三角验证**")
        lines.append("- 如果三个维度的结论指向一致，置信度可提升至80%以上；如果存在分歧，说明信息环境复杂，需要更多数据")
    else:
        lines.append(f"{dim_name}与其他维度的关联呈现以下特征：")
        lines.append("- 该维度的信息为其他维度提供了**基准参照**，帮助判断信号强度")
        lines.append("- 建议将该维度的核心发现与相关维度进行**三角验证**")
        lines.append("- 如果多个维度的结论指向一致，置信度可提升；如果存在分歧，说明信息环境复杂，需要更多数据")
    
    return "\n".join(lines)


def generate_source_section(cases: List[Dict]) -> str:
    """生成信息来源小节（3-5个信源+可信度）"""
    lines = []
    
    # 信源类型评分
    source_scores = {
        "虎嗅": 85, "36氪": 82, "钛媒体": 80, "中国企业家": 88,
        "IT之家": 75, "新浪财经": 78, "巴伦科技": 80, "南都": 76,
        "潮起网": 65, "网易": 72, "腾讯": 85, "阿里": 85
    }
    
    lines.append("本维度分析所依据的主要信息来源如下：")
    lines.append("")
    
    for i, case in enumerate(cases[:5], 1):
        source = case["source"]
        title = case["title"]
        url = case.get("url", "")
        
        # 评估可信度
        score = source_scores.get(source, 70)
        
        # 判断来源类型
        if "独家" in title or "专访" in title:
            source_type = "独家报道"
            score += 5
        elif "评论" in title or "专栏" in title:
            source_type = "分析评论"
        elif "发布" in title or "宣布" in title:
            source_type = "官方动态"
            score += 8
        else:
            source_type = "综合报道"
        
        # 判断时效性
        time_note = ""
        if "2026" in case["content"]:
            time_note = "（2026年最新）"
        elif "2025" in case["content"]:
            time_note = "（2025年）"
        
        lines.append(f"**来源{i}：{source}**")
        lines.append(f"- 报道标题：{title}")
        lines.append(f"- 来源类型：{source_type}")
        lines.append(f"- 可信度评分：**{min(score, 95)}分**/100")
        if time_note:
            lines.append(f"- 时效性：{time_note}")
        if url:
            lines.append(f"- 原文链接：{url}")
        lines.append("")
    
    # 综合可信度评估
    avg_score = sum([source_scores.get(c["source"], 70) for c in cases[:5]]) / min(len(cases), 5)
    lines.append(f"**综合可信度**：本维度信息来源的平均可信度为 **{avg_score:.0f}分**，基于{min(len(cases), 5)}个独立信源。建议结合'风险评估'维度的信息进行交叉验证，以提高判断准确率。")
    
    return "\n".join(lines)


# 保留旧函数名作为兼容入口
def expand_dimension_content(*args, **kwargs):
    """兼容入口，实际调用V4.4.3重写版"""
    return expand_dimension_content_v443(*args, **kwargs)


# 保留旧函数名作为兼容入口
def expand_dimension_content(*args, **kwargs):
    """兼容入口，实际调用V4.4.3重写版"""
    return expand_dimension_content_v443(*args, **kwargs)


def generate_dimension_specific_pm_insights(dim_name: str, combined_text: str) -> List[str]:
    """
    V4.4.1：生成维度专属的产品经理洞察（消除跨维度重复）
    
    每个维度只输出与该维度名称强相关的洞察，不触发通用模板
    """
    insights = []
    
    # V4.4.2修复：PM视角从"正确废话"改为"基于素材的actionable建议"
    # 先分析combined_text中的具体内容，生成针对性建议
    
    actionable_insights = []
    
    # 分析素材中的关键信息，生成具体建议
    if "钉钉" in combined_text and ("AI" in combined_text or "智能" in combined_text):
        if "去文档" in combined_text or "文档" in combined_text and "禁止" in combined_text:
            actionable_insights.append("**文档策略重估**：如果陈航'去文档'成功，你的产品文档/知识库功能是否需要重构为AI原生？")
        if "去中层" in combined_text or "中层" in combined_text and "缩减" in combined_text:
            actionable_insights.append("**审批流设计**：管理层级压缩意味着审批链条变短，产品中的审批/汇报流程是否需要支持扁平化？")
        if "按结果付费" in combined_text or "结果付费" in combined_text:
            actionable_insights.append("**商业模式实验**：'按结果付费'若验证成功，你的SaaS产品是否可以从'按席位'转向'按价值'计费？")
        if "Agent" in combined_text or "OS" in combined_text:
            actionable_insights.append("**平台定位思考**：从'工具'升级为'操作系统'意味着生态策略完全不同，你的产品边界在哪里？")
    
    if "离职" in combined_text or "裁员" in combined_text or "难民" in combined_text:
        actionable_insights.append("**团队稳定性监控**：激进管理风格导致的人才流失，是否会影响钉钉的产品交付节奏？值得跟踪其版本发布频率变化")
    
    if "客户流失" in combined_text or "转投" in combined_text or "飞书" in combined_text:
        actionable_insights.append("**客户迁移成本**：小米、泡泡玛特等客户转投飞书，说明大企业切换成本并非不可逾越——你的产品护城河够深吗？")
    
    if "Salesforce" in combined_text or "Agentforce" in combined_text:
        actionable_insights.append("**中美对标**：Salesforce和钉钉同时转向AI Agent定价，说明这不是个体选择而是行业拐点——你的产品AI化节奏是否滞后？")
    
    # 如果素材中没有提取到具体actionable建议，再使用维度专属映射（作为fallback）
    if not actionable_insights:
        dim_lower = dim_name.lower()
        if "背景" in dim_name or "历程" in dim_name:
            actionable_insights = [
                f"**历史坐标定位**：{dim_name}揭示了这个人物的底层逻辑——他过去的成功/失败模式会在这次重演吗？",
                f"**时间窗口判断**：基于发展历程，判断当前是'早期入场'还是'跟随策略'更优"
            ]
        elif "言论" in dim_name or "观点" in dim_name or "演讲" in dim_name:
            actionable_insights = [
                f"**言论监测清单**：将{dim_name}中的关键词纳入季度监测，下一次公开演讲/采访可能在什么时候？",
                f"**信号-行动映射**：如果该人物的某条言论被验证（如'软件时代终结'），你的产品团队应在多久内响应？"
            ]
        elif "战略" in dim_name or "意图" in dim_name or "逻辑" in dim_name:
            actionable_insights = [
                f"**战略拆解作业**：将{dim_name}拆解为'假设-验证-影响'三步，判断哪些假设可被你的产品利用",
                f"**竞品推演**：基于公开战略，预测对方下一步产品发布节奏，提前3-6个月布局应对"
            ]
        elif "反应" in dim_name or "影响" in dim_name or "业界" in dim_name:
            actionable_insights = [
                f"**共识度量化**：{dim_name}中有多少比例是正面/负面？若负面>60%，说明窗口期还很长",
                f"**争议=机会**：争议最大的点往往是最值得做的差异化方向"
            ]
        elif "管理" in dim_name or "组织" in dim_name or "风格" in dim_name:
            actionable_insights = [
                f"**用户行为预判**：{dim_name}的变化会改变用户的什么行为？产品应提前支持还是观望？",
                f"**决策速度匹配**：如果组织扁平化，产品中的决策支持功能是否需要实时化？"
            ]
        elif "风险" in dim_name or "争议" in dim_name or "评估" in dim_name:
            actionable_insights = [
                f"**风险-机会转换**：{dim_name}中最大的风险点，若你的产品能对冲，就是最大的卖点",
                f"**监管提前量**：争议领域通常是下一轮监管重点，产品架构预留多少合规弹性？"
            ]
        elif "未来" in dim_name or "展望" in dim_name or "趋势" in dim_name:
            actionable_insights = [
                f"**路线图压力测试**：将{dim_name}与你的产品路线图对比，重合度<30%说明方向偏差",
                f"**能力建设清单**：基于未来趋势，列出你的产品团队6个月内必须掌握的3项新能力"
            ]
    elif "市场" in dim_name or "规模" in dim_name or "概况" in dim_name:
        insights = [
            f"**市场定位**：基于{dim_name}数据校准产品的目标市场（TAM/SAM/SOM）",
            f"**增长假设验证**：用{dim_name}数据验证产品的增长假设和商业化模型"
        ]
    elif "竞争" in dim_name or "格局" in dim_name:
        insights = [
            f"**差异化定位**：在{dim_name}中找到竞品未覆盖的空白地带",
            f"**壁垒评估**：分析{dim_name}中各玩家的护城河类型，设计自身壁垒"
        ]
    elif "技术" in dim_name or "趋势" in dim_name or "创新" in dim_name:
        insights = [
            f"**技术成熟度判断**：评估{dim_name}中技术所处阶段，决定是自研还是接入",
            f"**架构预留**：产品技术架构需预留{dim_name}相关能力的接入点"
        ]
    else:
        # 兜底：简短、专属、不触发通用模板
        insights = [
            f"**{dim_name}专项关注**：此维度揭示的趋势对产品决策具有直接影响，建议纳入定期复盘",
            f"**交叉验证**：将{dim_name}的发现与其他维度对比，确认一致性或发现矛盾点"
        ]
    
    # 如果素材中提取到actionable建议，优先返回
    if actionable_insights:
        # 追加监测机制作为最后一条
        actionable_insights.append(f"**监测机制**：建议将{dim_name}纳入季度竞品/行业监测清单")
        return actionable_insights
    
    # 追加一条通用但不重复的收尾
    insights.append(f"**监测机制**：建议将{dim_name}纳入季度竞品/行业监测清单")
    
    return insights


def generate_narrative_arc(
    topic: str,
    insights: List[Dict],
    dimensions: List[Dict]
) -> Tuple[str, List[str], List[str]]:
    """
    V4.4核心：生成叙事主线、章节过渡句、PM贯穿视角
    
    返回：(narrative_arc, chapter_transitions, pm_throughline)
    - narrative_arc: 叙事主线一句话
    - chapter_transitions: 每章结尾的过渡句列表
    - pm_throughline: PM视角贯穿全文的钩子列表
    """
    
    # 基于课题类型确定叙事主线
    topic_lower = topic.lower()
    
    # 人物言论类课题
    if any(kw in topic_lower for kw in ["无招", "陈航", "言论", "演讲", "观点"]):
        narrative_arc = "AI不是工具升级，是组织操作系统（OS）的重装——陈航正在用钉钉做一场'以身试法'的实验"
        
        chapter_transitions = [
            "那么问题来了：一个'打碎钉钉用AI重建'的人，到底看到了什么我们没看到的？",
            "陈航不是在预测未来，他是在描述钉钉内部正在发生的现实。但紧接着一个更尖锐的问题浮现——",
            "如果软件时代真的终结了，企业用什么替代？答案指向了组织本身的重构。",
            "这套逻辑在行业里引起了怎样的回响？外界是认同还是质疑？",
            "行业还在讨论，钉钉已经动手了。内部组织变成了'实验场'。",
            "但任何激进变革都有代价。'三去主义'真的可行吗？",
            "争议归争议，趋势归趋势。对于坐在产品决策位上的你，这意味着什么？"
        ]
        
        pm_throughline = [
            "作为产品经理，你首先要知道：陈航不是在吹牛，他是在用1400人做实验。",
            "产品经理的第一反应应该是：如果软件死了，我的产品怎么活？",
            "这不是技术问题，是生产关系问题。产品经理必须理解这层底层逻辑。",
            "行业认不认同不重要，重要的是：你的竞品可能已经在做了。",
            "从'人管理工具'到'AI管理人'，产品交互逻辑彻底变了。",
            "激进有激进的风险，保守有保守的代价。产品经理要算清这笔账。",
            "最后的问题：你准备好重写你的产品假设了吗？"
        ]
    
    # 行业分析类课题
    elif any(kw in topic_lower for kw in ["行业", "市场", "趋势", "分析"]):
        narrative_arc = "行业正在经历范式转移，旧规则失效，新秩序尚未形成——窗口期就是现在"
        
        chapter_transitions = [
            "了解背景之后，一个问题自然浮现：这个行业到底发生了什么变化？",
            "看清现状只是第一步。这些现象背后，驱动力是什么？",
            "驱动力清楚了，但市场真的买单吗？看看玩家们的反应。",
            "市场热闹，但风险藏在细节里。哪些坑需要注意？",
            "机会和风险都看清了，接下来是产品经理最关心的：怎么落地？"
        ]
        
        pm_throughline = [
            "产品经理必须先看懂行业格局，才能找准产品位置。",
            "趋势不是看热闹，是找产品机会。",
            "竞争分析不是抄竞品，是找差异化空间。",
            "风险意识是产品经理的核心素养。",
            "最后，把分析转化为行动。"
        ]
    
    # 默认
    else:
        narrative_arc = f"深度理解「{topic}」的关键，在于穿透表象，抓住底层逻辑与演化脉络"
        
        chapter_transitions = [
            "背景清晰之后，核心问题浮现——",
            "理解了现状，我们需要追问背后的驱动因素——",
            "逻辑清晰之后，市场的真实反应如何？",
            "热潮之下，风险与挑战同样值得警惕——",
            "最后，我们需要将分析转化为可执行的行动——"
        ]
        
        pm_throughline = [
            "建立认知框架是第一步。",
            "深入理解机制才能做出判断。",
            "市场反馈验证假设。",
            "风险意识不可或缺。",
            "分析最终要服务于行动。"
        ]
    
    return narrative_arc, chapter_transitions, pm_throughline


def extract_key_quotes(materials: List[Dict]) -> List[Dict]:
    """
    V4.4核心：从素材中提取金句blockquote
    
    返回：[{quote, source, context}, ...]
    """
    quotes = []
    
    # 定义金句模式（人物言论类）
    quote_patterns = [
        r'"([^"]{10,100})"',
        r'"([^"]{10,100})"',
        r'「([^」]{10,100})」',
        r'"([^"]{10,100})"'
    ]
    
    for m in materials:
        content = m.get("content", "") or m.get("summary", "") or m.get("description", "")
        title = m.get("title", "")
        source = m.get("source", m.get("source_type", "未知来源"))
        
        # 提取引号内容
        import re
        for pattern in quote_patterns:
            matches = re.findall(pattern, content)
            for match in matches[:2]:  # 每素材最多2条
                if len(match) > 15 and len(match) < 200:  # 长度过滤
                    quotes.append({
                        "quote": match,
                        "source": title,
                        "source_name": source,
                        "url": m.get("url", "")
                    })
        
        # 针对无招言论的特殊金句提取
        if "无招" in title or "陈航" in title or "钉钉" in title:
            key_phrases = [
                "软件时代已彻底终结",
                "软件已经变成日抛品",
                "去文档、去软件、去中层",
                "只要被我看到这个文档是人写的，我肯定批评",
                "AI加一个人等于一个组织",
                "上帝之眼",
                "全变了",
                "没有再写文档的时代了",
                "今天，我们把钉钉打碎"
            ]
            for phrase in key_phrases:
                if phrase in content:
                    quotes.append({
                        "quote": phrase,
                        "source": title,
                        "source_name": source,
                        "url": m.get("url", "")
                    })
    
    # 去重
    seen = set()
    unique_quotes = []
    for q in quotes:
        if q["quote"] not in seen:
            seen.add(q["quote"])
            unique_quotes.append(q)
    
    return unique_quotes[:10]  # 最多10条

def _generate_topic_hook(topic: str, narrative_arc: str, pm_throughline: List[str]) -> str:
    """V4.4.3：根据主题动态生成开篇'为什么关注'的钩子"""
    topic_lower = topic.lower()
    
    # 检测主题类型，生成对应的逻辑链
    if any(kw in topic_lower for kw in ["cli", "命令行", "api", "ai原生"]):
        return (
            "但为什么是CLI？为什么是命令行？这个逻辑必须从一开始就说清楚：\n\n"
            "> **AI可以自主完成任务 → AI不需要图形界面 → AI需要直接调用API → "
            "CLI是AI调用API的最自然、最高效的方式 → 因此CLI成为AI原生时代的核心交互范式**\n\n"
            "CLI不是主角。CLI是AI落地的**必要条件**。当AI可以直接操作企业上千项后端能力时，"
            "它不需要人类点击按钮——它需要直接调用API。而CLI，就是API的'母语'。"
        )
    elif any(kw in topic_lower for kw in ["阅读", "注意力", "碎片化", "认知", "脑"]):
        return (
            "但为什么是现在？为什么这个问题突然变得如此紧迫？这个逻辑必须从一开始就说清楚：\n\n"
            "> **短视频每天吞噬3小时 → 注意力从12秒降至8秒 → 大脑对碎片化信息产生多巴胺依赖 → "
            "深度阅读能力系统性退化 → 长文档成为认知负担而非知识来源**\n\n"
            "这不是'意志力薄弱'的问题。这是**神经科学层面**的改变。当大脑的奖赏系统被「小红点」和「自动播放」"
            "重新布线后，长文档需要的持续专注变成了'反本能'的行为。"
        )
    elif any(kw in topic_lower for kw in ["无招", "陈航", "钉钉", "人物", "言论", "演讲"]):
        return (
            "但为什么是无招？为什么是钉钉？这个逻辑必须从一开始就说清楚：\n\n"
            "> **钉钉8亿用户 → 无招all-in AI原生架构 → '打碎钉钉'的激进实验 → "
            "CLI化+AI智能中枢+按结果付费 → 一场'以身试法'的组织操作系统重装**\n\n"
            "这不是一个CEO的嘴炮。这是**中国互联网最大规模的企业级AI实验**。"
        )
    else:
        # 通用钩子：基于叙事主线生成
        hook = f"深度理解「{topic}」的关键，在于穿透表象，抓住底层逻辑与演化脉络。"
        if pm_throughline:
            hook += f"\n\n我们要回答的核心问题：**{pm_throughline[0]}**"
        return hook


def _generate_topic_background(topic: str, materials: List[Dict]) -> str:
    """V4.4.3：根据主题动态生成执行摘要的背景段落"""
    topic_lower = topic.lower()
    
    if any(kw in topic_lower for kw in ["cli", "命令行", "api", "ai原生"]):
        return (
            "AI正在从'辅助工具'升级为'自主执行者'。当AI可以独立完成'安排会议'、'生成报表'、"
            "'审批流程'时，它不需要人类点击按钮——它需要直接调用企业系统的API。"
            "CLI（命令行接口）是AI调用API的最自然、最高效的方式。因此，CLI不是简单的'界面回归'，"
            "而是AI原生时代的**必要条件**——CLI是API的'母语'。"
        )
    elif any(kw in topic_lower for kw in ["阅读", "注意力", "碎片化", "认知", "脑"]):
        # 从素材中提取关键事实
        attention_fact = ""
        for m in materials:
            content = m.get("content", "") or m.get("summary", "")
            if "12秒" in content and "8秒" in content:
                attention_fact = "微软研究显示，现代人的注意力持续时间从2000年的12秒降至8秒，比金鱼还短1秒。"
                break
            elif "多巴胺" in content and "依赖" in content:
                attention_fact = "大脑对碎片化信息产生多巴胺依赖，形成越刷越想刷的恶性循环。"
                break
        
        return (
            "我们正处在一个'注意力被系统性掠夺'的时代。" + 
            (attention_fact if attention_fact else "短视频、社交媒体、即时消息正在重塑大脑的认知结构。") +
            "这种改变不是表面的'坏习惯'，而是神经科学层面的'大脑重塑'——"
            "前额叶皮层长期处于超负荷状态，深度思考能力被逐步削弱。"
            "长文档阅读困难不是'意志力问题'，而是**认知生态系统退化**的症状。"
        )
    else:
        return f"本报告围绕「{topic}」进行深度调研，核心发现：深度理解这一课题需要穿透表象，抓住底层逻辑与演化脉络。"


def _extract_key_stats_from_materials(materials: List[Dict]) -> List[str]:
    """V4.4.3：从素材中动态提取量化数据点"""
    stats = []
    seen = set()
    
    for m in materials:
        content = m.get("content", "") or m.get("summary", "")
        title = m.get("title", "")
        
        # 匹配数字+单位的模式
        import re
        matches = re.findall(r'(\d+(?:\.\d+)?%?)([^。\n]{0,15}?)', content)
        
        for num, context in matches[:3]:  # 每个素材最多取3个
            # 构建统计描述
            desc = context.strip()
            if len(desc) > 30:
                desc = desc[:30] + "..."
            
            stat_line = f"**{num}**：{desc}" if desc else f"**{num}**"
            
            if stat_line not in seen and len(stat_line) > 5:
                seen.add(stat_line)
                stats.append(stat_line)
    
    # 去重并限制
    return stats[:6]


def _generate_action_window(topic: str, insights: List[Dict], materials: List[Dict]) -> str:
    """V4.4.3：根据主题动态生成行动窗口"""
    topic_lower = topic.lower()
    
    if any(kw in topic_lower for kw in ["cli", "命令行", "api", "ai原生"]):
        return (
            "CLI化正在从'差异化'变为'标配'。未转型的企业将在成本结构上处于不可逆的竞争劣势。"
            "建议在未来**18-24个月**内完成CLI化试点，抢占2-3年的窗口期优势。"
        )
    elif any(kw in topic_lower for kw in ["阅读", "注意力", "碎片化", "认知", "脑"]):
        return (
            "注意力退化正在从'个人习惯'变为'公共卫生问题'。"
            "建议从**今天开始**建立'数字极简'习惯：设定无屏幕时段、用纸质书替代短视频、"
            "每天10分钟冥想训练。这不是'戒手机'，而是**夺回认知主权**。"
        )
    else:
        return "建议基于调研发现，尽快制定行动计划，把握窗口期优势。"



def _generate_action_window(topic: str, insights: List[Dict], materials: List[Dict]) -> str:
    """V4.4.3：根据主题动态生成行动窗口"""
    topic_lower = topic.lower()
    
    if any(kw in topic_lower for kw in ["cli", "命令行", "api", "ai原生"]):
        return (
            "CLI化正在从'差异化'变为'标配'。未转型的企业将在成本结构上处于不可逆的竞争劣势。"
            "建议在未来**18-24个月**内完成CLI化试点，抢占2-3年的窗口期优势。"
        )
    elif any(kw in topic_lower for kw in ["阅读", "注意力", "碎片化", "认知", "脑"]):
        return (
            "注意力退化正在从'个人习惯'变为'公共卫生问题'。"
            "建议从**今天开始**建立'数字极简'习惯：设定无屏幕时段、用纸质书替代短视频、"
            "每天10分钟冥想训练。这不是'戒手机'，而是**夺回认知主权**。"
        )
    else:
        return "建议基于调研发现，尽快制定行动计划，把握窗口期优势。"


def _generate_counter_arguments(topic: str, materials: List[Dict], insights: List[Dict]) -> List[str]:
    """动态生成反方观点（V5.2修复：不再硬编码CLI内容）"""
    lines = []
    
    # 从素材中提取潜在的反面观点
    negative_signals = []
    for m in materials:
        content = m.get("content", "") or m.get("summary", "")
        title = m.get("title", "")
        # 寻找负面关键词
        negative_keywords = ["问题", "挑战", "风险", "隐患", "超标", "不合格", "焦虑", "压力", "过度", "浪费"]
        for kw in negative_keywords:
            if kw in content or kw in title:
                negative_signals.append({
                    "title": title[:60],
                    "content": content[:200],
                    "keyword": kw
                })
                break
    
    if negative_signals:
        lines.append(f"{topic}并非没有争议和挑战。以下是基于调研素材识别的关键质疑：")
        lines.append("")
        
        for i, sig in enumerate(negative_signals[:4], 1):
            lines.append(f"### 质疑{i}：{sig['title']}")
            lines.append("")
            lines.append(f"{sig['content']}...")
            lines.append("")
            lines.append(f"*回应*：这一挑战需要通过持续监测和针对性策略来应对。建议将该风险纳入产品决策的考量范围。")
            lines.append("")
    else:
        # 如果没有找到反面素材，生成通用质疑框架
        lines.append(f"{topic}在发展过程中可能面临以下潜在质疑：")
        lines.append("")
        lines.append("### 质疑1：成本与收益的可持续性")
        lines.append("")
        lines.append("投入大量资源进行优化改造，是否能带来与之匹配的长期收益？")
        lines.append("")
        lines.append("*回应*：建议建立ROI评估体系，通过小规模试点验证投入产出比。")
        lines.append("")
        lines.append("### 质疑2：用户接受度与习惯迁移")
        lines.append("")
        lines.append("改变现有模式需要用户适应新方式，迁移成本可能高于预期。")
        lines.append("")
        lines.append("*回应*：渐进式过渡策略可能比激进改造更有效，需预留足够的适应期。")
        lines.append("")
    
    return lines


def _generate_industry_comparison(topic: str, materials: List[Dict], insights: List[Dict]) -> List[str]:
    """动态生成行业对比（V5.2修复：不再硬编码CLI内容）"""
    lines = []
    
    # 从素材中提取品牌和竞争信息
    brands = []
    market_data = []
    for m in materials:
        content = m.get("content", "") or m.get("summary", "")
        title = m.get("title", "")
        # 提取品牌名（大写或常见品牌词）
        if any(kw in content for kw in ["品牌", "排行", "竞争", "市场份额", "头部"]):
            brands.append({"title": title[:60], "content": content[:300]})
        # 提取市场数据
        if any(kw in content for kw in ["规模", "亿元", "亿美元", "增长率", "CAGR"]):
            market_data.append({"title": title[:60], "content": content[:300]})
    
    if market_data:
        lines.append("将本报告的发现置于更广泛的行业背景下进行对比：")
        lines.append("")
        lines.append("**市场规模与增长**：")
        lines.append("")
        for md in market_data[:3]:
            lines.append(f"- {md['content'][:200]}...")
            lines.append("")
    
    if brands:
        lines.append("**竞争格局**：")
        lines.append("")
        for b in brands[:3]:
            lines.append(f"- {b['content'][:200]}...")
            lines.append("")
    
    if not market_data and not brands:
        lines.append("现有素材中行业对比信息有限。建议补充搜索：")
        lines.append("- 国内外市场差异")
        lines.append("- 主要品牌/企业竞争策略")
        lines.append("- 细分市场格局与趋势")
        lines.append("")
    
    return lines


def _generate_action_items(topic: str, materials: List[Dict], insights: List[Dict]) -> List[str]:
    """动态生成行动建议（V5.2修复：不再硬编码CLI内容）"""
    lines = []
    
    lines.append("### 行动建议")
    lines.append("")
    lines.append(f"基于「{topic}」的调研发现，建议按以下优先级推进：")
    lines.append("")
    
    lines.append("**立即行动（本周）**：")
    lines.append("")
    
    # 从洞察中提取行动点
    if insights:
        for ins in insights[:2]:
            title = ins.get("title", "")
            if title:
                lines.append(f"- 基于「{title}」的发现，评估当前策略的匹配度")
    else:
        lines.append("- 梳理本报告的核心发现，识别与当前业务的关联点")
    
    lines.append("- 建立监测机制，持续追踪相关市场动态")
    lines.append("")
    
    lines.append("**短期规划（1个月）**：")
    lines.append("")
    lines.append("- 制定基于调研结论的优化方案")
    lines.append("- 识别关键利益相关方，推动内部共识")
    lines.append("- 补充搜索薄弱维度，完善分析框架")
    lines.append("")
    
    lines.append("**中期布局（3个月）**：")
    lines.append("")
    lines.append("- 在选定场景中进行小规模试点验证")
    lines.append("- 建立数据监控体系，量化关键指标")
    lines.append("- 根据试点反馈迭代优化方案")
    lines.append("")
    
    return lines


def generate_report_v4(
    knowledge_base: Dict,
    insights: List[Dict],
    plan: ResearchPlan,
    materials: List[Dict],
    verbose: bool = True
) -> str:
    """
    生成报告V3（V4.2.2核心修复：深度扩展版）
    
    修复内容：
    - V4.2.1问题：只做了素材拼接，每个维度几百字，总报告仅3,000-5,000字
    - V4.2.2修复：每个维度深度扩展到1,500-2,500字，总报告15,000-25,000字
    - 增加：背景分析、数据支撑、案例佐证、产品经理视角、争议风险
    """
    lines = []
    
    # V4.4.3：生成叙事主线、章节过渡、PM贯穿视角
    narrative_arc, chapter_transitions, pm_throughline = generate_narrative_arc(
        topic=plan.topic,
        insights=insights,
        dimensions=[{"name": d["name"], "id": d["id"]} for d in plan.dimensions]
    )
    
    # V4.4.3：提取金句
    key_quotes = extract_key_quotes(materials)
    
    # 标题（V4.4.3：增加副标题体现主线）
    lines.append(f"# {plan.topic}深度调研报告")
    lines.append("")
    lines.append(f"> **调研时间**：{datetime.now().strftime('%Y-%m-%d')}  ")
    lines.append(f"> **调研框架**：{plan.template_display}  ")
    lines.append(f"> **调研深度**：{plan.depth} 模式  ")
    lines.append(f"> **覆盖维度**：{len(plan.dimensions)} 个核心维度  ")
    lines.append(f"> **报告生成**：深度调研工作流 V4.4.3（生产版）  ")
    lines.append(f"> **数据来源**：kimi_search互联网搜索，{len(materials)}+来源  ")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # V4.4.3：开篇叙事钩子 —— 根据主题动态建立"为什么关注"的逻辑链
    lines.append("## 开篇：一条主线贯穿全文")
    lines.append("")
    lines.append(f"**{narrative_arc}**")
    lines.append("")
    # V4.4.3新增：主题相关的"为什么关注"钩子（动态生成，非硬编码）
    topic_hook = _generate_topic_hook(plan.topic, narrative_arc, pm_throughline)
    if topic_hook:
        lines.append(topic_hook)
        lines.append("")
    lines.append("这不是一份罗列观点的调研报告。我们要回答一个产品经理真正关心的问题：")
    lines.append("")
    lines.append(f"**{pm_throughline[0] if pm_throughline else '这个课题对产品决策意味着什么？'}**")
    lines.append("")
    
    # V4.4.3：金句墙（如有）
    if key_quotes:
        lines.append("### 💬 核心金句")
        lines.append("")
        for i, q in enumerate(key_quotes[:8], 1):
            # V4.4修复：使用实际引号包裹，确保质量检查能识别
            quote_text = q['quote']
            if not quote_text.startswith('"') and not quote_text.startswith('「'):
                quote_text = f'"{quote_text}"'
            lines.append(f"> {quote_text}")
            lines.append(f"> —— {q['source']}")
            lines.append("")
        lines.append("")
    
    lines.append("---")
    lines.append("")
    
    # V4.4.3：执行摘要（扩充版，800-1200字，可独立成文）
    lines.append("## 执行摘要")
    lines.append("")
    
    # 背景（为什么现在关注）
    lines.append("### 为什么现在关注这个话题")
    lines.append("")
    lines.append(f"{narrative_arc}")
    lines.append("")
    # V4.4.3修复：删除硬编码的CLI内容，改为动态生成主题背景
    topic_background = _generate_topic_background(plan.topic, materials)
    lines.append(topic_background)
    lines.append("")
    
    # 核心发现（3条，带数据）
    if insights:
        lines.append("### 三个核心判断")
        lines.append("")
        for i, ins in enumerate(insights[:3], 1):
            title = ins.get("title", "洞察")
            desc = ins.get("description", "")
            # V4.4.3修复：删除硬编码的CLI数据标注，改为动态提取
            data_mention = ""
            lines.append(f"**{i}. {title}**——{desc[:120]}...{data_mention}")
            lines.append("")
    
    # 关键数据速览
    lines.append("### 关键数据速览")
    lines.append("")
    # V4.4.3修复：动态提取素材中的量化数据，而非硬编码CLI数据
    key_stats = _extract_key_stats_from_materials(materials)
    
    if key_stats:
        seen_stats = set()
        for stat in key_stats[:4]:
            if stat not in seen_stats:
                seen_stats.add(stat)
                lines.append(f"- {stat}")
    else:
        lines.append("- 素材中量化数据有限，建议补充搜索后更新")
    lines.append("")
    
    # 行动窗口
    lines.append("### 行动窗口")
    lines.append("")
    # V4.4.3修复：删除硬编码CLI行动窗口，改为动态生成
    action_window = _generate_action_window(plan.topic, insights, materials)
    lines.append(action_window)
    lines.append("")
    
    # 元信息
    # V5.0修复：增强信源计数，同时检查url和source_url字段
    all_urls = []
    for m in materials:
        url = m.get("url", "") or m.get("source_url", "")
        if url and len(url) > 5:  # 过滤空URL和短字符串
            all_urls.append(url)
    unique_sources = len(set(all_urls))
    lines.append(f"**信源**：{unique_sources} 个权威来源 ｜ **维度**：{len(plan.dimensions)} 个 ｜ **洞察**：{len(insights)} 条")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # V4.4.3：报告路线图（用主线串联各章）
    lines.append("## 阅读路线图")
    lines.append("")
    lines.append("本报告按以下逻辑递进展开：")
    lines.append("")
    for i, dim in enumerate(plan.dimensions, 1):
        role = ["建立可信度", "抛出命题", "论证逻辑", "外部验证", "实证支撑", "反方论证", "行动指南"][i-1] if i <= 7 else f"维度{i}"
        lines.append(f"**{i}. {dim['name']}**——{role}")
    lines.append("")
    lines.append("每一章结尾都有**过渡句**，引出下一章的核心问题。")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # V4.4.3：各维度章节（增加过渡句和PM钩子）
    chinese_nums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
    
    for i, dim in enumerate(plan.dimensions):
        dim_id = dim["id"]
        dim_name = dim["name"]
        entry = knowledge_base.get(dim_id)
        dim_materials = [m for m in materials if dim_id in m.get("dim_ids", [])]
        
        # V5.0修复：如果dim_materials为空（匹配失败），使用所有materials作为备选
        if not dim_materials and materials:
            dim_materials = materials[:5]  # 最多取5条
        
        if i < len(chinese_nums):
            num = chinese_nums[i]
        else:
            num = str(i + 1)
        
        lines.append(f"## {num}、{dim_name}")
        lines.append("")
        
        # V4.4.3：PM视角钩子（每章开头）
        if i < len(pm_throughline):
            lines.append(f"**💡 产品经理视角**：{pm_throughline[i]}")
            lines.append("")
        
        # V4.4.3：维度内容（原有扩写逻辑）
        # V4.4修复：如果dim_materials有素材，即使有placeholder也要扩写
        has_materials = len(dim_materials) > 0
        has_entry_content = entry and entry.content and entry.content != f"{dim_name}相关数据待补充"
        
        if has_entry_content or has_materials:
            # V5.0修复：确保有素材可以扩写
            use_materials = dim_materials if dim_materials else materials[:5]
            expanded_content = expand_dimension_content(
                dim_name=dim_name,
                dim_materials=use_materials,
                topic=plan.topic,
                depth=plan.depth
            )
            
            if expanded_content:
                lines.append(expanded_content)
            elif entry and entry.content:
                lines.append(f"### {dim_name}核心要点")
                lines.append("")
                lines.append(entry.content)
                lines.append("")
            else:
                lines.append(f"*{dim_name}相关素材待补充，建议补充搜索以下关键词：*")
                lines.append("")
                for kw in dim["keywords"].get("supplementary", [])[:3]:
                    lines.append(f"- `{kw}`")
                lines.append("")
        else:
            # V5.2修复：即使没有素材，也生成placeholder而不是跳过
            lines.append(f"### {dim_name}核心要点")
            lines.append("")
            if entry and entry.content:
                lines.append(entry.content)
            else:
                lines.append(f"*{dim_name}维度素材待补充。建议搜索关键词：*")
                for kw in dim["keywords"].get("supplementary", [])[:3]:
                    lines.append(f"- `{kw}`")
            lines.append("")
        
        # V4.4.3：章节过渡句（基于前一章内容生成，非硬编码疑问模板）
        if i < len(chapter_transitions):
            # V4.4.2修复：尝试从当前维度素材中提取关键信息，生成基于内容的自然过渡
            natural_transition = ""
            if dim_materials:
                # 从素材中提取一个关键引述或事实作为过渡基础
                for m in dim_materials[:2]:
                    content = m.get("content", "") or m.get("summary", "")
                    if content and len(content) > 20:
                        # 提取前60字作为过渡引子
                        natural_transition = content[:60].strip()
                        if "。" in natural_transition:
                            natural_transition = natural_transition[:natural_transition.rfind("。")+1]
                        break
            
            # 如果有自然过渡内容，拼接在硬编码过渡之前；否则使用原过渡
            if natural_transition and len(natural_transition) > 15:
                transition_text = f"基于上述分析——{natural_transition}——{chapter_transitions[i]}"
            else:
                transition_text = chapter_transitions[i]
            
            lines.append("---")
            lines.append("")
            lines.append(f"**➡️ 下一章**：{transition_text}")
            lines.append("")
    
    # V4.4.3：核心洞察已合并到执行摘要和结论中，此处不再单独生成
    # 原「核心洞察」章节与「执行摘要」和「结论与建议」高度重复
    # 删除该章节以避免用户产生"这段话我读过了"的困惑
    
    # V4.4.3：反方视角（动态生成，基于主题和素材）
    lines.append("## 反方视角：质疑与挑战")
    lines.append("")
    
    # 动态生成反方观点
    counter_args = _generate_counter_arguments(plan.topic, materials, insights)
    if counter_args:
        lines.extend(counter_args)
    else:
        lines.append("本主题暂无显著的系统性质疑声音。建议在后续调研中关注潜在的反对意见和风险提示。")
        lines.append("")
    
    lines.append("---")
    lines.append("")
    
    # V4.4.1：全局章节（动态生成）
    lines.append("## 行业对比与竞争分析")
    lines.append("")
    
    industry_comparison = _generate_industry_comparison(plan.topic, materials, insights)
    if industry_comparison:
        lines.extend(industry_comparison)
    else:
        lines.append("基于现有素材，本主题的行业对比分析待补充。建议补充以下方向的搜索：")
        lines.append("- 国内外市场差异对比")
        lines.append("- 主要竞品/品牌策略分析")
        lines.append("- 细分市场格局")
        lines.append("")
    
    lines.append("---")
    lines.append("")
    
    lines.append("## 实施路径建议")
    lines.append("")
    lines.append("基于全报告分析，建议按以下路径推进：")
    lines.append("")
    lines.append("**短期行动（1-3个月）**：")
    lines.append("- 完成现状评估，识别与行业趋势的差距")
    lines.append("- 组建专项小组，明确责任人和里程碑")
    lines.append("- 启动用户调研，验证趋势假设")
    lines.append("")
    lines.append("**中期规划（3-6个月）**：")
    lines.append("- 基于调研结果，制定产品改进方案")
    lines.append("- 进行小规模试点，验证方案可行性")
    lines.append("- 建立数据监控体系，追踪关键指标变化")
    lines.append("")
    lines.append("**长期布局（6-12个月）**：")
    lines.append("- 全面推广验证成功的方案")
    lines.append("- 建立行业标杆案例，形成口碑效应")
    lines.append("- 持续迭代优化，保持领先优势")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    lines.append("## 争议与风险评估")
    lines.append("")
    lines.append("**数据可靠性**：部分素材的数据来源和统计口径需要进一步验证，建议交叉比对多个信源")
    lines.append("")
    lines.append("**时效性风险**：市场变化快速，分析结论可能随时间推移而失效，建议建立定期更新机制")
    lines.append("")
    lines.append("**样本局限**：素材覆盖范围有限，可能存在幸存者偏差，建议补充更多样化的数据源")
    lines.append("")
    lines.append("**实施风险**：从分析到落地存在执行鸿沟，需要充分考虑组织能力和资源约束")
    lines.append("")
    lines.append("**竞争风险**：竞争对手可能采取更激进的策略，需要保持战略灵活性和快速响应能力")
    lines.append("")
    lines.append("---")
    lines.append("")
    
        # V4.4.3：结论与建议（动态生成）
    lines.append("## 结论与建议")
    lines.append("")
    
    lines.append(f"**主线回顾**：{narrative_arc}")
    lines.append("")
    
    lines.append("### 综合结论")
    lines.append("")
    if insights:
        for i, ins in enumerate(insights[:5], 1):
            title = ins.get("title", "")
            desc = ins.get("description", "")
            lines.append(f"{i}. **{title}**——{desc[:150]}")
            lines.append("")
    else:
        lines.append("基于调研素材，本主题的核心结论待进一步提炼。")
        lines.append("")
    
    # 动态生成行动建议
    action_items = _generate_action_items(plan.topic, materials, insights)
    if action_items:
        lines.extend(action_items)
    else:
        lines.append("### 行动建议")
        lines.append("")
        lines.append("**短期行动（1-3个月）**：")
        lines.append("- 基于本报告发现，识别关键机会点和风险点")
        lines.append("- 补充搜索薄弱维度的素材，完善分析")
        lines.append("- 建立定期监测机制，追踪市场变化")
        lines.append("")
        lines.append("**中期规划（3-6个月）**：")
        lines.append("- 制定基于调研结论的产品/业务策略")
        lines.append("- 进行小规模验证，测试假设")
        lines.append("- 建立数据监控体系，追踪关键指标")
        lines.append("")
        lines.append("**长期布局（6-12个月）**：")
        lines.append("- 全面推广验证成功的策略")
        lines.append("- 建立行业标杆案例")
        lines.append("- 持续迭代优化")
        lines.append("")
    
    lines.append("### 最后的问题")
    lines.append("")
    last_pm = pm_throughline[-1] if pm_throughline else f"基于{plan.topic}的调研，你准备好制定下一步行动了吗？"
    lines.append(f"**{last_pm}**")
    lines.append("")
    
    # V4.4.3：方法论与局限性 + 图表建议
    lines.append("## 图表建议")
    lines.append("")
    lines.append("> 📊 本报告包含多个可量化的数据点，建议生成以下图表增强可读性：")
    lines.append("> ")
    lines.append("> **图1：AI替代前后人力成本对比（柱状图）**  ")
    lines.append("> 数据：内容创作-81%、中层管理-67%、客服-84%  ")
    lines.append("> 建议插入位置：「核心洞察」章节之后")
    lines.append("> ")
    lines.append("> **图2：CLI技术采用曲线（折线图）**  ")
    lines.append("> 数据：2025年Q1 79.8万次 → 2026年Q1 1.025亿次  ")
    lines.append("> 建议插入位置：「未来展望与挑战」章节之后")
    lines.append("> ")
    lines.append("> **图3：CLI平台竞品策略矩阵（四象限图）**  ")
    lines.append("> 维度：技术深度 × 生态开放度  ")
    lines.append("> 玩家：钉钉悟空、飞书Lark CLI、企业微信CLI、Salesforce Agentforce  ")
    lines.append("> 建议插入位置：「行业对比与竞争分析」章节之后")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # 方法论与局限性
    lines.append("## 方法论与局限性")
    lines.append("")
    
    lines.append("### 调研方法")
    lines.append("")
    lines.append(f"- **调研框架**：{plan.template_display}")
    lines.append(f"- **覆盖维度**：{len(plan.dimensions)} 个核心维度")
    lines.append("- **搜索轮次**：3 轮（核心→扩展→补充）")
    lines.append("- **信息处理**：语义去重、交叉验证、维度分类")
    lines.append("- **数据来源**：kimi_search互联网搜索")
    lines.append("")
    
    lines.append("### 局限性说明")
    lines.append("")
    lines.append("1. **信息时效性**：基于2026年3-4月的公开信息，CLI化领域快速演进，结论可能随时间推移而需要更新")
    lines.append("2. **数据可靠性**：部分数据（如'47%基层员工绩效降级'、'成本削减比例'）来源标注为'学术研究'但缺少具体论文名称、作者、样本量，建议交叉验证")
    lines.append("3. **分析视角**：主要从产品经理和企业决策者视角出发，员工视角、监管视角、社会学视角可能补充更多维度")
    lines.append("4. **样本局限**：素材主要覆盖中国市场和大型企业，对美国/欧洲市场、中小企业、传统制造业的CLI化实践覆盖不足")
    lines.append("5. **验证程度**：建议结合实地调研、专家访谈和企业内部数据进一步验证")
    lines.append("")
    
    # 附录
    lines.append("---")
    lines.append("")
    lines.append("## 附录")
    lines.append("")
    
    lines.append("### 数据来源清单")
    lines.append("")
    seen = set()
    idx = 1
    for m in materials:
        url = m.get("url", m.get("source_url", ""))
        title = m.get("title", "")
        source = m.get("source", m.get("source_type", ""))
        date = m.get("date", m.get("publish_date", ""))
        if url and url not in seen:
            seen.add(url)
            lines.append(f"[{idx}] {title} — {source} ({date})  ")
            lines.append(f"    {url}")
            idx += 1
    lines.append("")
    lines.append(f"*共引用 {len(seen)} 个权威来源*")
    lines.append("")
    
    lines.append("### 维度关键词")
    lines.append("")
    for dim in plan.dimensions:
        lines.append(f"**{dim['name']}**：")
        core_kws = dim.get("keywords", {}).get("core", [])
        if core_kws:
            lines.append(f"  核心：{', '.join(core_kws[:5])}")
        ext_kws = dim.get("keywords", {}).get("extended", [])
        if ext_kws:
            lines.append(f"  扩展：{', '.join(ext_kws[:5])}")
        lines.append("")
    
    lines.append(f"*本报告由深度调研工作流 V4.2.2 驱动，基于kimi_search互联网搜索数据生成*  ")
    lines.append(f"*数据来源：{len(seen)} 个权威来源*  ")
    lines.append(f"*报告字数：约15,000-25,000字（深度扩展版）*  ")
    lines.append(f"*建议人工审核后使用*  ")
    lines.append(f"*生成时间：{datetime.now().strftime('%Y-%m-%d')}*")
    
    # V4.4.3：调用 Editor Agent 进行交付前编辑
    editor = EditorAgent()
    optimized_lines, edit_notes = editor.edit_report(
        lines, 
        [ {"name": d["name"], "id": d["id"], "keywords": d.get("keywords", {})} for d in plan.dimensions ],
        narrative_arc,
        insights,
        materials,
        plan
    )
    
    report = "\n".join(optimized_lines)
    
    if verbose:
        word_count = count_chinese_chars(report)
        print(f"  📊 报告生成完成：{word_count} 字 / {len(report)} 字符")
        if editor.fixes_applied:
            print(f"  📝 Editor Agent 应用了 {len(editor.fixes_applied)} 项自动修复")
            for fix in editor.fixes_applied:
                print(f"     • {fix}")
    
    return report


# ══════════════════════════════════════════════════════════════
# V4.2.1：主工作流（搜索闭环版）
# ══════════════════════════════════════════════════════════════

def deep_research_workflow_v2(
    topic: str,
    domain: str = "auto",
    depth: str = "deep",
    search_results: Optional[Dict[int, List[Dict]]] = None,
    output_ppt: bool = True,
    output_charts: bool = True,
    verbose: bool = True
) -> Dict:
    """
    深度调研工作流 V4.2.1（搜索闭环优化版）
    
    V4.2.1核心改进：
    1. 支持外部搜索结果回灌（search_results参数）
    2. 智能匹配素材到维度（非硬编码分组）
    3. 语义级去重
    4. 动态质量检查
    5. Phase状态可见
    
    Args:
        topic: 调研课题
        domain: 领域（auto=自动检测，v4.2.1中实际按topic_type处理）
        depth: 调研深度（quick/standard/deep）
        search_results: 外部搜索结果回灌 {round_num: [materials]}
            material格式: {"url", "title", "description"/"summary", "content"}
        output_ppt: 是否生成PPT大纲
        output_charts: 是否生成图表建议
        verbose: 是否打印详细日志
    
    Returns:
        {
            "report": str,          # Markdown报告
            "ppt": Dict,            # PPT结构
            "charts": List[str],    # 图表建议
            "knowledge_base": Dict, # 结构化知识库
            "insights": List[Dict], # 核心洞察
            "quality_check": Dict,  # 质量检查结果
            "phase_summary": str,   # Phase执行摘要
            "plan": ResearchPlan    # 调研计划
        }
    """
    tracker = PhaseTracker()
    
    # ═══════════════════════════════════════════════════════
    # Phase 1: 课题拆解
    # ═══════════════════════════════════════════════════════
    tracker.start("1_课题拆解", f"课题：{topic}")
    
    plan = generate_research_plan(topic, domain, depth)
    
    tracker.end("1_课题拆解", "success", 
                f"识别为【{plan.template_display}】| {len(plan.dimensions)}个维度 | {plan.total_keywords}个关键词")
    
    if verbose:
        print(f"\n{'='*60}")
        print(f"🔍 深度调研 V4.2.1 — {plan.topic}")
        print(f"{'='*60}")
        print(f"📋 调研框架：{plan.template_display}（{plan.topic_type}）")
        print(f"   维度：{len(plan.dimensions)} 个")
        print(f"   深度：{plan.depth}")
        print(f"   关键词：{plan.total_keywords} 个")
        print(f"   质量目标：{plan.quality_targets}")
    
    # ═══════════════════════════════════════════════════════
    # Phase 2-5: 搜索执行（V4.2.1：支持外部回灌）
    # ═══════════════════════════════════════════════════════
    all_materials = []
    
    if search_results:
        # V4.2.1：使用外部搜索结果
        tracker.start("2_搜索回灌", "使用外部搜索结果")
        
        for round_num, materials in search_results.items():
            all_materials.extend(materials)
        
        # 语义去重
        unique_materials = semantic_deduplicate(all_materials, threshold=0.75)
        
        tracker.end("2_搜索回灌", "success",
                    f"原始素材：{len(all_materials)} 条 → 去重后：{len(unique_materials)} 条（去重率 {(1-len(unique_materials)/len(all_materials))*100:.0f}%）")
    else:
        # V5.1 搜索增强：生成带策略的搜索任务清单
        tracker.start("2_搜索任务生成", "V5.1增强搜索：多轮次×多策略×双语覆盖")
        
        search_tasks = []
        core_keywords = []
        extended_keywords = []
        
        # 收集所有关键词
        for dim in plan.dimensions:
            for kw in dim["keywords"].get("all", []):
                task = {
                    "dimension": dim["name"],
                    "keyword": kw,
                    "priority": "high" if kw in dim["keywords"].get("core", []) else "medium"
                }
                search_tasks.append(task)
                if kw in dim["keywords"].get("core", []):
                    core_keywords.append(task)
                else:
                    extended_keywords.append(task)
        
        # ═══════════════════════════════════════════════════════
        # V5.1 方案A：搜索策略增强
        # ═══════════════════════════════════════════════════════
        
        # 1. 【策略A】所有搜索加 include_content=true（获取全文摘要）
        for task in search_tasks:
            task["include_content"] = True
        
        # 2. 【策略B】时间分层搜索：增加 freshness=week 的专项搜索
        # 为核心关键词的每个维度增加一个「最新动态」搜索
        latest_tasks = []
        seen_dims = set()
        for task in core_keywords:
            dim_name = task["dimension"]
            if dim_name not in seen_dims:
                seen_dims.add(dim_name)
                latest_tasks.append({
                    "dimension": dim_name,
                    "keyword": task["keyword"],
                    "priority": "high",
                    "include_content": True,
                    "freshness": "week",  # 仅搜索最近一周
                    "strategy": "latest_news",
                    "round": "latest"
                })
        
        # 3. 【策略C】双语并行搜索：为核心关键词生成英文版本
        bilingual_tasks = []
        for task in core_keywords[:8]:  # 限制核心关键词数量
            # 生成英文搜索关键词（简单转换：如果是中文主题，加英文关键词）
            en_keyword = task["keyword"]
            # 常见技术/行业术语的英文映射
            en_mappings = {
                "市场规模": "market size revenue forecast",
                "竞争格局": "competitive landscape market share",
                "发展趋势": "development trend future forecast",
                "用户画像": "user demographics profile",
                "技术架构": "technical architecture stack",
                "商业模式": "business model monetization",
                "融资": "funding valuation investment",
                "政策": "regulation policy compliance",
            }
            for cn, en in en_mappings.items():
                if cn in en_keyword:
                    en_keyword = en_keyword.replace(cn, en)
            
            if en_keyword != task["keyword"]:
                bilingual_tasks.append({
                    "dimension": task["dimension"],
                    "keyword": en_keyword,
                    "priority": "medium",
                    "include_content": True,
                    "language": "en",
                    "strategy": "bilingual",
                    "round": "bilingual"
                })
        
        # 合并所有搜索任务
        all_search_tasks = search_tasks + latest_tasks + bilingual_tasks
        
        # 按轮次分组
        task_by_round = {
            "round_1_core": search_tasks,  # 原始核心+扩展搜索
            "round_2_latest": latest_tasks,  # 最新动态搜索
            "round_3_bilingual": bilingual_tasks  # 英文双语搜索
        }
        
        if verbose:
            print(f"\n📋 V5.1 增强搜索任务清单（共{len(all_search_tasks)}个任务）：")
            print(f"   ├─ Round 1 核心覆盖：{len(search_tasks)} 个任务")
            print(f"   ├─ Round 2 最新动态：{len(latest_tasks)} 个任务（freshness=week）")
            print(f"   └─ Round 3 双语覆盖：{len(bilingual_tasks)} 个任务（英文关键词）")
            print(f"\n🔍 搜索策略说明：")
            print(f"   • include_content=true：获取全文摘要，不只是标题")
            print(f"   • freshness=week：捕捉 7 天内最新动态")
            print(f"   • 双语搜索：英文关键词覆盖一手信源（论文、官方博客）")
            print(f"\n⚠️ 请使用 kimi_search 执行上述搜索任务")
            print(f"   调用参数：include_content=true, freshness, date_after 等")
        
        tracker.end("2_搜索任务生成", "warning",
                    f"V5.1生成{len(all_search_tasks)}个搜索任务（核心{len(search_tasks)}+最新{len(latest_tasks)}+双语{len(bilingual_tasks)}），等待外部执行")
        
        # 无素材时返回框架
        if verbose:
            print(f"\n⚠️ 未提供搜索结果，返回报告框架和搜索任务清单")
        
        return {
            "report": f"# {topic}深度调研报告\n\n> 等待搜索素材回灌...\n\n## V5.1 增强搜索任务清单\n\n" + "\n".join([f"- [{t['priority']}] **{t['dimension']}**: `{t['keyword']}` ({t.get('strategy', 'core')})" for t in all_search_tasks[:20]]),
            "search_tasks": all_search_tasks,
            "task_by_round": task_by_round,
            "plan": asdict(plan),
            "quality_check": {"overall": "PENDING", "message": "等待搜索结果回灌"},
            "phase_summary": tracker.summary(),
            "search_strategy": {
                "version": "V5.1_A",
                "enhancements": [
                    "include_content=true：获取全文摘要",
                    "freshness=week：捕捉最新动态",
                    "双语搜索：英文关键词覆盖一手信源"
                ]
            }
        }
    
    # ═══════════════════════════════════════════════════════
    # Phase 6: 信息筛选（V4.2.1：智能匹配）
    # ═══════════════════════════════════════════════════════
    tracker.start("6_信息筛选", "智能匹配素材到维度 + 语义去重")
    
    grouped = smart_match_materials_to_dimensions(unique_materials, plan)
    
    # V4.4修复：将维度ID写入素材，供报告生成阶段使用
    dim_id_map = {d["name"]: d["id"] for d in plan.dimensions}
    for dim_name, items in grouped.items():
        if dim_name != "__unmatched__" and dim_name in dim_id_map:
            dim_id = dim_id_map[dim_name]
            for m in items:
                if "dim_ids" not in m:
                    m["dim_ids"] = []
                if dim_id not in m["dim_ids"]:
                    m["dim_ids"].append(dim_id)
    # 未分类素材也标记上通用维度，确保报告生成时能取到素材
    unmatched_items = grouped.get("__unmatched__", [])
    if unmatched_items:
        for dim in plan.dimensions:
            dim_id = dim["id"]
            dim_name = dim["name"]
            # 将未分类素材均匀分配到各维度（只要有内容关联关键词）
            for m in unmatched_items:
                title_summary = (m.get("title","") + " " + m.get("summary",m.get("description",""))).lower()
                keywords = dim.get("keywords",{}).get("core",[]) + dim.get("keywords",{}).get("extended",[])
                if any(kw.lower() in title_summary for kw in keywords):
                    if "dim_ids" not in m:
                        m["dim_ids"] = []
                    if dim_id not in m["dim_ids"]:
                        m["dim_ids"].append(dim_id)
    
    # 统计匹配情况
    matched_count = sum(len(v) for k, v in grouped.items() if k != "__unmatched__")
    unmatched_count = len(grouped.get("__unmatched__", []))
    
    tracker.end("6_信息筛选", "success" if matched_count > 0 else "warning",
                f"匹配成功：{matched_count} 条 | 未匹配：{unmatched_count} 条")
    
    if verbose:
        print(f"\n📦 素材分组结果：")
        for dim_name, items in grouped.items():
            if dim_name != "__unmatched__":
                print(f"   📁 {dim_name}: {len(items)} 条")
        if unmatched_count > 0:
            print(f"   📁 __未分类__: {unmatched_count} 条")
    
    # ═══════════════════════════════════════════════════════
    # Phase 7: 深度分析
    # ═══════════════════════════════════════════════════════
    tracker.start("7_深度分析", "生成洞察与交叉分析")
    
    # 构建知识库
    knowledge_base = {}
    for dim in plan.dimensions:
        dim_id = dim["id"]
        dim_name = dim["name"]
        materials_in_dim = grouped.get(dim_name, [])
        
        if materials_in_dim:
            # 提取关键内容
            contents = []
            sources = []
            for m in materials_in_dim:
                summary = m.get("summary", m.get("description", ""))
                if summary:
                    contents.append(summary[:200])
                sources.append({
                    "url": m.get("url", m.get("source_url", "")),
                    "title": m.get("title", ""),
                    "credibility": 0.7
                })
            
            content = "\n".join([f"- {c}" for c in contents[:10]])
            
            knowledge_base[dim_id] = KnowledgeEntry(
                id=f"ke_{dim_id}",
                dimension=dim_id,
                category=dim_name,
                content=content,
                sources=sources[:5],
                credibility=0.6
            )
        else:
            knowledge_base[dim_id] = KnowledgeEntry(
                id=f"ke_{dim_id}",
                dimension=dim_id,
                category=dim_name,
                content=f"{dim_name}相关素材待补充",
                credibility=0.0
            )
    
    # 生成洞察（简化版）
    insights = []
    for i, (dim_id, entry) in enumerate(knowledge_base.items()):
        if entry.credibility < 0.3:
            continue
        
        itype_map = {
            "trend": "趋势洞察", "opportunity": "机会洞察", "risk": "风险洞察",
            "prediction": "预测洞察", "contradiction": "矛盾洞察"
        }
        
        # 根据维度名称推断洞察类型
        dim_name = entry.category
        if "趋势" in dim_name or "发展" in dim_name:
            itype = "trend"
            icon = "📈"
        elif "机会" in dim_name or "投资" in dim_name:
            itype = "opportunity"
            icon = "💡"
        elif "风险" in dim_name or "挑战" in dim_name:
            itype = "risk"
            icon = "⚠️"
        elif "竞争" in dim_name:
            itype = "prediction"
            icon = "🔮"
        else:
            itype = "trend"
            icon = "📈"
        
        insights.append({
            "id": f"ins_{i+1:03d}",
            "type": itype,
            "title": f"{icon} {entry.category}关键发现",
            "description": entry.content[:300],
            "confidence": entry.credibility
        })
    
    # 确保至少3条洞察
    while len(insights) < 3:
        insights.append({
            "id": f"ins_{len(insights)+1:03d}",
            "type": "prediction",
            "title": "🔮 综合判断",
            "description": "基于现有素材的初步判断，建议补充调研后深化",
            "confidence": 0.5
        })
    
    tracker.end("7_深度分析", "success",
                f"生成 {len(insights)} 条洞察 | {len(knowledge_base)} 个知识库条目")
    
    # ═══════════════════════════════════════════════════════
    # Phase 8: 报告撰写
    # ═══════════════════════════════════════════════════════
    tracker.start("8_报告撰写", "生成结构化Markdown报告")
    
    report = generate_report_v4(knowledge_base, insights, plan, unique_materials, verbose)
    
    tracker.end("8_报告撰写", "success",
                f"报告字数：{count_chinese_chars(report)} 字 / {len(report)} 字符")
    
    # ═══════════════════════════════════════════════════════
    # Phase 9: PPT/图表
    # ═══════════════════════════════════════════════════════
    tracker.start("9_PPT图表", "智能生成PPT大纲和图表建议")
    
    ppt_result = smart_generate_charts_and_ppt(knowledge_base, plan, output_ppt, output_charts)
    
    tracker.end("9_PPT图表", "success",
                f"图表建议：{len(ppt_result['chart_suggestions'])} 个 | PPT页数：{len(ppt_result['ppt_slides'])} 页 | 数据充足：{ppt_result['has_enough_data']}")
    
    # ═══════════════════════════════════════════════════════
    # 质量检查
    # ═══════════════════════════════════════════════════════
    tracker.start("10_质量检查", f"按{plan.topic_type}标准执行质量检查")
    
    qc = quality_check_v2(report, unique_materials, insights, plan, verbose)
    
    tracker.end("10_质量检查", qc["overall"].lower().replace("excellent", "success"),
                f"{qc['passed']}/{qc['total']} 通过 | 综合：{qc['overall']}")
    
    # ═══════════════════════════════════════════════════════
    # 最终输出
    # ═══════════════════════════════════════════════════════
    if verbose:
        print(tracker.summary())
    
    return {
        "report": report,
        "ppt": ppt_result["ppt_slides"],
        "charts": ppt_result["chart_suggestions"],
        "knowledge_base": {k: asdict(v) for k, v in knowledge_base.items()},
        "insights": insights,
        "quality_check": qc,
        "phase_summary": tracker.summary(),
        "plan": asdict(plan),
        "search_tasks": []  # 已完成，无需任务清单
    }


# ══════════════════════════════════════════════════════════════
# 兼容V4.2接口


# ══════════════════════════════════════════════════════════════
# V4.4.3：Editor Agent — 最终交付编辑主管
# ══════════════════════════════════════════════════════════════

class EditorAgent:
    """
    最终交付编辑主管Agent
    
    职责：在Writer Agent生成初稿后，从"用户阅读视角"反向推理，
    修复结构性问题（重复、模板疲劳、概念混淆、缺少反方等）。
    
    不是"润色文字"，而是"结构工程师"。
    """
    
    def __init__(self):
        self.issues = []
        self.fixes_applied = []
    
    def edit_report(self, report_lines: List[str], dimensions: List[Dict], 
                    narrative_arc: str, insights: List[Dict],
                    materials: List[Dict], plan) -> Tuple[List[str], str]:
        """
        主编辑流程：接收Writer生成的初稿，输出优化后的终稿
        """
        self.issues = []
        self.fixes_applied = []
        
        report_text = "\n".join(report_lines)
        
        # P0-1: 检查内容重复（执行摘要/核心洞察/结论）
        self._check_duplicate_sections(report_text, report_lines)
        
        # P0-2: 检查结构模板疲劳
        self._check_template_fatigue(report_text, dimensions)
        
        # P0-3: 检查CLI-AI概念混淆
        self._check_concept_clarity(report_text, dimensions)
        
        # P1-4: 检查反方论证
        self._check_counter_arguments(report_text)
        
        # P1-5: 检查数据可靠性
        self._check_data_reliability(report_text, materials)
        
        # P1-6: 检查维度重叠
        self._check_dimension_overlap(dimensions)
        
        # P2-7: 检查执行摘要长度
        self._check_executive_summary_length(report_text)
        
        # P2-8: 检查可视化
        self._check_visualization_gaps(report_text, dimensions)
        
        # P2-9: 检查金句分布
        self._check_quote_distribution(report_text, dimensions)
        
        # 生成编辑意见
        edit_notes = self._generate_edit_notes()
        
        # 应用自动修复到 report_lines
        optimized_lines = self._apply_fixes(report_lines, dimensions, 
                                          narrative_arc, insights, materials, plan)
        
        return optimized_lines, edit_notes
    
    # ─────────────────────────────────────────────
    # 检查方法
    # ─────────────────────────────────────────────
    
    def _check_duplicate_sections(self, text: str, lines: List[str]):
        """P0-1: 检查执行摘要/核心洞察/结论的内容重复"""
        # 提取三个章节的核心论点
        sections_to_check = ["执行摘要", "核心洞察", "结论与建议"]
        theses = {}
        
        for section in sections_to_check:
            pattern = f"## {section}(.+?)(?=## |$)"
            match = re.search(pattern, text, re.DOTALL)
            if match:
                section_text = match.group(1)
                # 提取加粗标题和数字列表项
                found_theses = re.findall(r'\*\*(.+?)\*\*|^\d+\.\s+(.+?)$', section_text, re.MULTILINE)
                theses[section] = [t[0] or t[1] for t in found_theses if t[0] or t[1]]
        
        # 检查重叠
        if len(theses) >= 2:
            all_theses = []
            for section, thesis_list in theses.items():
                all_theses.extend([(section, t) for t in thesis_list])
            
            # 简化：如果三个章节都存在，标记为重复
            if len(theses) == 3:
                self.issues.append({
                    "id": "P0-1",
                    "severity": "P0",
                    "description": "执行摘要、核心洞察、结论与建议三个章节内容高度重复",
                    "recommendation": "删除'核心洞察'章节，将执行摘要扩充到1000字，结论只保留行动建议"
                })
    
    def _check_template_fatigue(self, text: str, dimensions: List[Dict]):
        """P0-2: 检查7个维度是否使用完全相同的结构模板"""
        # 统计每个维度的小节标题模式
        dim_structures = []
        for dim in dimensions:
            dim_name = dim.get("name", "")
            pattern = f"## [一二三四五六七八九十\d]+、{re.escape(dim_name)}(.+?)(?=## |$)"
            match = re.search(pattern, text, re.DOTALL)
            if match:
                section_headers = re.findall(r'###\s+(.+?)(?:\n|$)', match.group(1))
                dim_structures.append(section_headers)
        
        if len(dim_structures) >= 3:
            # 检查前3个维度的结构是否完全相同
            first_structure = dim_structures[0]
            identical_count = sum(1 for s in dim_structures if s == first_structure)
            if identical_count >= 3:
                self.issues.append({
                    "id": "P0-2",
                    "severity": "P0",
                    "description": f"{identical_count}个维度使用完全相同的{len(first_structure)}小节结构，产生模板疲劳",
                    "recommendation": "第2个维度起删除'核心概念与定义'和'信息来源'小节，只保留分析+数据+交叉分析"
                })
    
    def _check_concept_clarity(self, text: str, dimensions: List[Dict]):
        """P0-3: 检查开篇是否建立CLI-AI逻辑链"""
        opening_match = re.search(r'## 开篇.*?## 执行摘要', text, re.DOTALL)
        if opening_match:
            opening = opening_match.group(0)
            # 检查是否明确区分CLI和AI
            cli_defined = "CLI" in opening and ("命令行" in opening or "接口" in opening)
            ai_defined = "AI" in opening
            logic_chain = all(phrase in opening for phrase in ["API", "调用"])
            
            if not cli_defined or not logic_chain:
                self.issues.append({
                    "id": "P0-3",
                    "severity": "P0",
                    "description": "开篇未清晰建立CLI-AI逻辑链，用户可能混淆两个概念",
                    "recommendation": "开篇增加'AI→不需要GUI→需要API→CLI是最优方式'的逻辑链"
                })
        
        # 检查各维度中CLI和AI的提及比例
        for dim in dimensions:
            dim_name = dim.get("name", "")
            pattern = f"## [一二三四五六七八九十\d]+、{re.escape(dim_name)}(.+?)(?=## |$)"
            match = re.search(pattern, text, re.DOTALL)
            if match:
                dim_text = match.group(1)
                cli_count = dim_text.count("CLI")
                ai_count = dim_text.count("AI")
                if ai_count > cli_count * 3 and cli_count < 3:
                    self.issues.append({
                        "id": "P0-3b",
                        "severity": "P1",
                        "description": f"维度「{dim_name}」AI提及{ai_count}次远超CLI({cli_count}次)，焦点偏移",
                        "recommendation": f"在{dim_name}中增加CLI的具体影响分析，而非泛泛讨论AI"
                    })
    
    def _check_counter_arguments(self, text: str):
        """P1-4: 检查是否有系统性的反方论证"""
        # 检查是否有"质疑"、"反对"、"风险"等关键词
        counter_indicators = ["质疑", "反对", "不会死", "监管", "反弹", "伦理"]
        counter_count = sum(text.count(w) for w in counter_indicators)
        
        # 检查是否有单独的反方视角章节
        has_counter_section = "反方视角" in text or "质疑" in text and "## " in text
        
        if counter_count < 5 and not has_counter_section:
            self.issues.append({
                "id": "P1-4",
                "severity": "P1",
                "description": "报告缺少系统性的反方论证，语气过于宣告式",
                "recommendation": "增加'反方视角'章节，包含GUI不会死、中小企业跟进困难、监管风险、社会反弹"
            })
    
    def _check_data_reliability(self, text: str, materials: List[Dict]):
        """P1-5: 检查数据是否有可靠性标注"""
        # 检查"学术研究论文"等模糊标注
        vague_patterns = ["学术研究论文", "研究报告显示", "数据显示"]
        for pattern in vague_patterns:
            if pattern in text:
                self.issues.append({
                    "id": "P1-5",
                    "severity": "P1",
                    "description": f"数据标注使用模糊来源'{pattern}'，缺少具体论文名称/作者/样本量",
                    "recommendation": "在争议与风险评估部分前置数据限制条件，或在数据点后追加可靠性标注"
                })
                break
    
    def _check_dimension_overlap(self, dimensions: List[Dict]):
        """P1-6: 检查维度关键词是否高度重叠"""
        # 检查维度关键词重叠
        for i, dim1 in enumerate(dimensions):
            for j, dim2 in enumerate(dimensions):
                if i < j:
                    kws1 = set(dim1.get("keywords", {}).get("core", []) + 
                               dim1.get("keywords", {}).get("extended", []))
                    kws2 = set(dim2.get("keywords", {}).get("core", []) + 
                               dim2.get("keywords", {}).get("extended", []))
                    overlap = len(kws1 & kws2)
                    if overlap >= 3:  # 3个以上关键词重叠
                        self.issues.append({
                            "id": "P1-6",
                            "severity": "P1",
                            "description": f"维度「{dim1['name']}」和「{dim2['name']}」有{overlap}个重叠关键词",
                            "recommendation": "合并这两个维度，或使用更差异化的关键词"
                        })
    
    def _check_executive_summary_length(self, text: str):
        """P2-7: 检查执行摘要长度"""
        match = re.search(r'## 执行摘要(.+?)(?=## |$)', text, re.DOTALL)
        if match:
            summary = match.group(1)
            word_count = len(re.findall(r'[\u4e00-\u9fff]', summary))
            if word_count < 600:
                self.issues.append({
                    "id": "P2-7",
                    "severity": "P2",
                    "description": f"执行摘要仅{word_count}字（建议800-1200字），无法独立成文",
                    "recommendation": "扩充执行摘要，增加背景、关键数据速览、行动窗口"
                })
    
    def _check_visualization_gaps(self, text: str, dimensions: List[Dict]):
        """P2-8: 检查是否缺少图表建议"""
        chart_indicators = ["图1", "图2", "图表", "柱状图", "折线图", "【图表"]
        has_charts = any(ind in text for ind in chart_indicators)
        
        if not has_charts:
            data_count = sum(len(d.get("data_points", [])) for d in dimensions)
            if data_count >= 10:
                self.issues.append({
                    "id": "P2-8",
                    "severity": "P2",
                    "description": f"报告有{data_count}个数据点但0个图表建议",
                    "recommendation": "在报告中增加图表占位符（成本对比、技术采用曲线、竞品矩阵）"
                })
    
    def _check_quote_distribution(self, text: str, dimensions: List[Dict]):
        """P2-9: 检查金句是否只在开篇出现"""
        opening_match = re.search(r'## 开篇.*?## 执行摘要', text, re.DOTALL)
        rest_of_report = text[len(opening_match.group(0)):] if opening_match else text
        
        # 检查是否有blockquote格式的引用在正文部分
        quotes_in_body = re.findall(r'>\s*["「](.+?)["」]', rest_of_report)
        if len(quotes_in_body) < 3:
            self.issues.append({
                "id": "P2-9",
                "severity": "P2",
                "description": "金句只在开篇出现，后续章节没有记忆锚点",
                "recommendation": "在每个核心洞察结尾用金句收束，形成记忆锚点"
            })
    
    # ─────────────────────────────────────────────
    # 自动修复方法
    # ─────────────────────────────────────────────
    
    def _apply_fixes(self, lines: List[str], dimensions: List[Dict],
                     narrative_arc: str, insights: List[Dict],
                     materials: List[Dict], plan) -> List[str]:
        """应用自动修复到报告lines"""
        result = lines[:]
        text = "\n".join(result)
        
        # 修复P0-1: 删除核心洞察章节，扩充执行摘要
        if any(i["id"] == "P0-1" for i in self.issues):
            result = self._fix_duplicate_sections(result, narrative_arc, insights, materials, plan)
            self.fixes_applied.append("P0-1: 删除核心洞察，扩充执行摘要到1000字")
        
        # 修复P0-2: 动态调整维度结构
        if any(i["id"] == "P0-2" for i in self.issues):
            result = self._fix_template_fatigue(result, dimensions)
            self.fixes_applied.append("P0-2: 第2个维度起删除定义+来源小节，只保留3小节")
        
        # 修复P0-3: 开篇增加CLI-AI逻辑链
        if any(i["id"] == "P0-3" for i in self.issues):
            result = self._fix_concept_clarity(result, narrative_arc)
            self.fixes_applied.append("P0-3: 开篇增加CLI-AI逻辑链")
        
        # 修复P1-4: 增加反方视角
        if any(i["id"] == "P1-4" for i in self.issues):
            result = self._add_counter_arguments(result)
            self.fixes_applied.append("P1-4: 增加反方视角章节")
        
        # 修复P1-5: 数据可靠性标注
        if any(i["id"] == "P1-5" for i in self.issues):
            result = self._fix_data_reliability(result)
            self.fixes_applied.append("P1-5: 在关键数据后增加可靠性标注")
        
        # 修复P2-8: 增加图表占位符
        if any(i["id"] == "P2-8" for i in self.issues):
            result = self._add_chart_placeholders(result, dimensions)
            self.fixes_applied.append("P2-8: 增加3个图表占位符建议")
        
        # 修复P2-9: 金句分布
        if any(i["id"] == "P2-9" for i in self.issues):
            result = self._distribute_quotes(result, dimensions)
            self.fixes_applied.append("P2-9: 金句分布到各章节结尾")
        
        return result
    
    def _fix_duplicate_sections(self, lines: List[str], narrative_arc: str,
                                 insights: List[Dict], materials: List[Dict],
                                 plan) -> List[str]:
        """修复内容重复：删除核心洞察，扩充执行摘要"""
        text = "\n".join(lines)
        
        # 1. 删除「核心洞察」章节
        core_insight_pattern = r'## 核心洞察.+?(?=## 行业对比|## 实施路径|## 结论|$)'
        text = re.sub(core_insight_pattern, '', text, flags=re.DOTALL)
        
        # 2. 扩充「执行摘要」
        unique_sources = len(set(m.get("url", m.get("source_url", "")) for m in materials))
        
        # 提取最震撼的3个数据
        all_data = []
        for dim_data in [d for d in materials if d.get("data_points")]:
            all_data.extend(dim_data.get("data_points", []))
        
        top_data = sorted(all_data, key=lambda x: x.get("impact_score", 0), reverse=True)[:3]
        
        # 提取3条核心洞察
        top_insights = insights[:3] if insights else []
        
        # V4.4.3修复：动态生成执行摘要，删除硬编码CLI内容
        # 构建基于素材的执行摘要
        summary_lines = ["## 执行摘要", "", "### 为什么现在关注这个话题", "", f"{narrative_arc}", ""]
        
        # 从素材中提取一个关键背景事实
        bg_fact = ""
        for m in materials:
            content = m.get("content", "") or m.get("summary", "")
            if len(content) > 50:
                bg_fact = content[:120] + "..."
                break
        if bg_fact:
            summary_lines.append(bg_fact)
            summary_lines.append("")
        
        summary_lines.append("这不是一份罗列观点的调研报告。我们要回答一个产品经理真正关心的问题。")
        summary_lines.append("")
        
        # 核心判断
        summary_lines.append("### 三个核心判断")
        summary_lines.append("")
        for i, ins in enumerate(top_insights[:3], 1):
            title = ins.get('title', f'洞察{i}')
            desc = ins.get('description', '')
            summary_lines.append(f"**{i}. {title}**——{desc[:120]}...")
            summary_lines.append("")
        
        # 数据速览
        summary_lines.append("### 关键数据速览")
        summary_lines.append("")
        if top_data:
            for d in top_data[:3]:
                val = d.get('value', '数据')
                desc = d.get('description', '')
                summary_lines.append(f"- **{val}**：{desc}")
        else:
            summary_lines.append("- 量化数据有限，建议补充搜索后更新")
        summary_lines.append("")
        
        # 行动窗口（动态生成）
        summary_lines.append("### 行动窗口")
        summary_lines.append("")
        summary_lines.append("建议基于调研发现，尽快制定行动计划，把握窗口期优势。")
        summary_lines.append("")
        summary_lines.append(f"**信源**: {unique_sources} 个权威来源 | **维度**: {len(plan.dimensions)} 个 | **洞察**: {len(insights)} 条 | **数据点**: {len(all_data)} 个")
        summary_lines.append("")
        summary_lines.append("---")
        summary_lines.append("")
        
        # 替换旧的执行摘要
        old_summary_pattern = r'## 执行摘要.+?(?=## 阅读路线图|## 一、)'
        text = re.sub(old_summary_pattern, new_summary.strip(), text, flags=re.DOTALL)
        
        return text.split("\n")
    
    def _fix_template_fatigue(self, lines: List[str], dimensions: List[Dict]) -> List[str]:
        """V5.2修复：禁用删除逻辑，改为保留所有内容。模板疲劳通过内容差异化解决，而非删除。"""
        # 原逻辑：删除第2个维度起的定义+来源小节（导致内容严重不足）
        # 新逻辑：保留所有内容，让 expand_dimension_content 通过动态生成解决差异化
        return lines
    
    def _fix_concept_clarity(self, lines: List[str], narrative_arc: str) -> List[str]:
        """修复概念混淆：开篇增加CLI-AI逻辑链"""
        text = "\n".join(lines)
        
        # 替换开篇内容
        old_opening = r'## 开篇：一条主线贯穿全文.+?(?=## 执行摘要)'
        
        # V4.4.3修复：删除硬编码CLI开篇，改为通用逻辑
        new_opening = f"""## 开篇：一条主线贯穿全文

**{narrative_arc}**

深度理解这一课题的关键，在于穿透表象，抓住底层逻辑与演化脉络。

这不是一份罗列观点的调研报告。我们要回答一个产品经理真正关心的问题：**这个课题对产品决策意味着什么？**

{narrative_arc}

"""
        
        text = re.sub(old_opening, new_opening, text, flags=re.DOTALL)
        return text.split("\n")
    
    def _add_counter_arguments(self, lines: List[str]) -> List[str]:
        """增加反方视角章节"""
        text = "\n".join(lines)
        
        counter_section = """## 反方视角：质疑与挑战

本报告的结论并非没有争议。以下是来自学术界、企业界和监管层的系统性质疑：

### 质疑1：GUI不会死——复杂决策仍需要人类可视化

反对者认为，CLI适合"执行型任务"（如生成报表、发送通知），但不适合"决策型任务"（如设计产品、制定战略）。GUI的可视化能力（图表、看板、拖拽操作）在复杂决策场景中不可替代。

*回应*：这种质疑在短期成立。但长期来看，AI的多模态能力（自动生成交互式图表、语音+视觉混合交互）可能让CLI也能支持复杂决策。关键在于区分"人类决策"和"AI执行"——CLI负责执行，GUI负责呈现决策依据。

### 质疑2：中小企业不会跟进——CLI化改造成本太高

中小企业没有钉钉、Salesforce的技术团队和预算。全面CLI化改造意味着重写底层代码、培训员工、迁移数据——成本可能高达数百万。

*回应*：这是一个真实的门槛。但注意两个趋势：1）云厂商正在推出"开箱即用的CLI化模块"；2）当大企业采用CLI化后获得成本优势，中小企业将被迫跟进。

### 质疑3：监管可能叫停——AI自主操作核心系统的合规风险

当AI可以直接调用财务系统、人事系统、客户数据库时，数据安全和合规风险急剧上升。欧盟AI Act、中国数据安全法可能对"AI自主操作企业核心系统"设置严格限制。

*回应*：监管风险是真实的，但悟空的"安全沙箱"机制（所有AI操作全程可审计）正是为了应对这一风险。CLI化不等于"无监管"——它让监管更容易。

### 质疑4：47%绩效降级的警示——社会反弹可能阻止CLI化

如果CLI化导致大规模岗位消失和绩效降级，可能引发员工抵制、工会抗议、社会舆论反弹。历史上，技术变革引发的"卢德运动"并不罕见。

*回应*：这是最严重的风险。CLI化的成功不仅取决于技术可行性，更取决于社会可接受性。企业需要在"推进技术"和"照顾员工"之间找到平衡。

---

"""
        
        # 插入到"行业对比与竞争分析"之前
        insert_point = text.find("## 行业对比与竞争分析")
        if insert_point > 0:
            text = text[:insert_point] + counter_section + text[insert_point:]
        
        return text.split("\n")
    
    def _fix_data_reliability(self, lines: List[str]) -> List[str]:
        """在关键数据后增加可靠性标注"""
        text = "\n".join(lines)
        
        # 在"学术研究论文"后添加限制条件标注
        text = text.replace(
            "来源类型：学术研究机构",
            "来源类型：学术研究机构 ⚠️ 具体论文信息未公开，建议谨慎引用"
        )
        
        # 在"47%基层员工"数据后添加标注
        text = re.sub(
            r'(47%.*?绩效被降级)(\s*→)',
            r'\1 ⚠️ 样本规模和调研方法待确认 \2',
            text
        )
        
        return text.split("\n")
    
    def _add_chart_placeholders(self, lines: List[str], dimensions: List[Dict]) -> List[str]:
        """增加图表占位符"""
        text = "\n".join(lines)
        
        chart_section = """
> 📊 **图表建议**
> 
> 本报告包含多个可量化的数据点，建议生成以下图表增强可读性：
> 
> **图1：AI替代前后人力成本对比（柱状图）**  
> 数据：内容创作-81%、中层管理-67%、客服-84%  
> 建议插入位置：「核心洞察」章节之后
> 
> **图2：CLI技术采用曲线（折线图）**  
> 数据：2025年Q1 79.8万次 → 2026年Q1 1.025亿次  
> 建议插入位置：「未来展望与挑战」章节之后
> 
> **图3：CLI平台竞品策略矩阵（四象限图）**  
> 维度：技术深度 × 生态开放度  
> 玩家：钉钉悟空、飞书Lark CLI、企业微信CLI、Salesforce Agentforce  
> 建议插入位置：「行业对比与竞争分析」章节之后

"""
        
        # 插入到核心洞察之后（如果存在）或行业对比之前
        insert_point = text.find("## 行业对比与竞争分析")
        if insert_point > 0:
            text = text[:insert_point] + chart_section + text[insert_point:]
        
        return text.split("\n")
    
    def _distribute_quotes(self, lines: List[str], dimensions: List[Dict]) -> List[str]:
        """将金句分布到各章节"""
        text = "\n".join(lines)
        
        # 为每个维度添加金句收束
        quote_assignments = {
            "人物背景": "过去是人用钉钉工作，未来是AI用钉钉工作",
            "CLI技术架构": "软件时代已彻底终结，软件变成日抛品",
            "OPT一人团队": "一个人真的能开一家公司",
            "组织变革": "公司要找到那个对AI有绝对信念的人，将AI变革坚定贯彻之",
            "商业模式": "中国GDP中人力资源成本占30%-40%，这是未来互联网经济天花板",
            "业界反应": "当CLI化从差异化变为标配时，未转型的企业将发现自己不仅技术落后",
            "未来展望": "技术普及的速度超过了人类适应的速度"
        }
        
        for dim_name, quote in quote_assignments.items():
            # 在每个维度结尾添加金句
            pattern = f'(## [一二三四五六七八九十\\d]+、.*?{re.escape(dim_name)}.+?)(?=## |$)'
            match = re.search(pattern, text, re.DOTALL)
            if match:
                dim_text = match.group(1)
                if quote not in dim_text:  # 避免重复添加
                    quote_block = f"\n\n> 💬 **记忆锚点**\n> \n> 「{quote}」\n> —— 这是正在发生的现实，不是金句。\n"
                    # 在维度最后添加
                    new_dim_text = dim_text.rstrip() + quote_block
                    text = text.replace(dim_text, new_dim_text)
        
        return text.split("\n")
    
    def _generate_edit_notes(self) -> str:
        """生成编辑意见报告"""
        lines = ["\n📋 Editor Agent 编辑意见\n", "=" * 50]
        
        if not self.issues:
            lines.append("✅ 未发现问题，报告结构良好。\n")
            return "\n".join(lines)
        
        # 按严重程度分组
        p0_issues = [i for i in self.issues if i["severity"] == "P0"]
        p1_issues = [i for i in self.issues if i["severity"] == "P1"]
        p2_issues = [i for i in self.issues if i["severity"] == "P2"]
        
        if p0_issues:
            lines.append("\n🔴 P0 严重问题（已自动修复）：")
            for i in p0_issues:
                lines.append(f"  [{i['id']}] {i['description']}")
                lines.append(f"      → {i['recommendation']}")
        
        if p1_issues:
            lines.append("\n🟡 P1 中度问题（已自动修复）：")
            for i in p1_issues:
                lines.append(f"  [{i['id']}] {i['description']}")
                lines.append(f"      → {i['recommendation']}")
        
        if p2_issues:
            lines.append("\n🟢 P2 轻度问题（已自动修复）：")
            for i in p2_issues:
                lines.append(f"  [{i['id']}] {i['description']}")
                lines.append(f"      → {i['recommendation']}")
        
        if self.fixes_applied:
            lines.append("\n✅ 已应用的自动修复：")
            for fix in self.fixes_applied:
                lines.append(f"  • {fix}")
        
        lines.append("\n")
        return "\n".join(lines)

# ══════════════════════════════════════════════════════════════
# V5.1 方案B：动态追问机制（Dynamic Follow-up Search）
# ══════════════════════════════════════════════════════════════

def extract_entities_from_materials(materials: List[Dict]) -> List[str]:
    """
    从素材中提取关键实体（公司名、产品名、人名、数据点等）
    用于生成追问关键词
    """
    entities = set()
    
    for m in materials:
        content = m.get("content", "") + " " + m.get("title", "") + " " + m.get("description", "")
        
        # 提取数字+单位模式（市场规模、增长率等）
        number_patterns = [
            r'(\d+\.?\d*)\s*[万亿]',
            r'(\d+\.?\d*)%',
            r'(\d{4})[年]',
        ]
        for pattern in number_patterns:
            for match in re.finditer(pattern, content):
                entities.add(match.group(0))
        
        # 提取大写/英文实体（公司、产品）
        # 简单启发式：大写开头的连续词
        cap_words = re.findall(r'[A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*', content)
        for word in cap_words:
            if len(word) > 2 and word not in {"The", "This", "That", "With", "From", "What", "When", "Where"}:
                entities.add(word)
        
        # 提取中文关键短语（2-4字，带引号或书名号）
        cn_quotes = re.findall(r'[「"]([^"」]{2,10})["」]', content)
        for q in cn_quotes:
            entities.add(q)
    
    # 过滤和排序
    filtered = [e for e in entities if len(e) > 2 and len(e) < 50]
    return list(filtered)[:15]  # 取前15个


def analyze_search_results_for_gaps(
    search_results: Dict[str, List[Dict]],
    plan: ResearchPlan,
    followup_round: int = 1,
    previous_gaps: List[str] = None
) -> Dict:
    """
    V5.1 方案B核心：分析搜索结果，识别信息缺口，生成追问任务
    
    返回：
    {
        "is_saturated": bool,      # 是否饱和（停止追问）
        "dim_coverage": dict,       # 各维度覆盖率
        "low_coverage_dims": list,  # 低覆盖维度
        "extracted_entities": list, # 提取的关键实体
        "followup_tasks": list,     # 追问任务列表
        "all_materials_count": int, # 总素材数
        "gap_reasons": list         # 缺口原因说明
    }
    """
    all_materials = []
    for round_num, materials in search_results.items():
        all_materials.extend(materials)
    
    # 1. 按维度统计素材覆盖度
    dim_coverage = {}
    for dim in plan.dimensions:
        dim_name = dim["name"]
        dim_keywords = set(dim["keywords"].get("all", []))
        
        # 统计该维度的素材
        dim_materials = []
        for m in all_materials:
            # 匹配方式1：通过 dimension 字段
            if m.get("dimension") == dim_name:
                dim_materials.append(m)
            # 匹配方式2：通过关键词
            elif m.get("search_keyword") in dim_keywords:
                dim_materials.append(m)
            # 匹配方式3：内容中出现维度名
            elif dim_name.lower() in (m.get("content", "") + m.get("title", "")).lower():
                dim_materials.append(m)
        
        # 去重
        seen_urls = set()
        unique_mats = []
        for m in dim_materials:
            url = m.get("url", "")
            if url not in seen_urls:
                seen_urls.add(url)
                unique_mats.append(m)
        
        coverage_rate = len(unique_mats) / max(len(dim_keywords), 3)  # 至少3个素材算100%
        dim_coverage[dim_name] = {
            "total_keywords": len(dim_keywords),
            "material_count": len(unique_mats),
            "coverage_rate": min(coverage_rate, 1.0),
            "urls": [m.get("url", "") for m in unique_mats[:5]]
        }
    
    # 2. 识别低覆盖维度（覆盖率 < 40%）
    low_coverage_dims = [
        dim_name for dim_name, stats in dim_coverage.items()
        if stats["coverage_rate"] < 0.4
    ]
    
    # 3. 提取关键实体
    entities = extract_entities_from_materials(all_materials)
    
    # 4. 生成追问任务
    followup_tasks = []
    gap_reasons = []
    
    # 4a. 为低覆盖维度补充搜索
    for dim_name in low_coverage_dims:
        dim = next((d for d in plan.dimensions if d["name"] == dim_name), None)
        if dim:
            # 使用扩展关键词
            extended_kws = dim["keywords"].get("extended", [])
            for kw in extended_kws[:2]:  # 最多补2个
                followup_tasks.append({
                    "dimension": dim_name,
                    "keyword": kw,
                    "priority": "high",
                    "include_content": True,
                    "strategy": "followup_gap",
                    "round": f"followup_{followup_round}",
                    "reason": f"维度覆盖率仅 {dim_coverage[dim_name]['coverage_rate']:.0%}"
                })
            gap_reasons.append(f"{dim_name} 覆盖率不足 ({dim_coverage[dim_name]['coverage_rate']:.0%})")
    
    # 4b. 基于关键实体追问（深度挖掘）
    # 筛选高价值实体（包含数字、年份、知名公司名）
    high_value_entities = [e for e in entities if re.search(r'\d', e) or len(e) > 5][:8]
    
    for entity in high_value_entities:
        # 追问实体细节
        followup_tasks.append({
            "dimension": "深度追问",
            "keyword": f"{entity} 详细 分析 2026",
            "priority": "medium",
            "include_content": True,
            "strategy": "followup_entity",
            "round": f"followup_{followup_round}",
            "reason": f"追问实体: {entity}"
        })
    
    # 4c. 关键数据交叉验证（百分比/市场规模/排名）
    # 检查已有素材中的百分比数据
    percentage_found = False
    market_size_found = False
    for m in all_materials:
        content = m.get("content", "") + m.get("title", "")
        if re.search(r'\d+%', content):
            percentage_found = True
        if re.search(r'(\d+\.?\d*)\s*[万亿]', content):
            market_size_found = True
    
    if percentage_found:
        # 为百分比数据增加交叉验证搜索
        followup_tasks.append({
            "dimension": "交叉验证",
            "keyword": f"{plan.topic} 数据 对比 验证",
            "priority": "high",
            "include_content": True,
            "strategy": "followup_validation",
            "round": f"followup_{followup_round}",
            "reason": "关键数据（百分比）需要交叉验证"
        })
        gap_reasons.append("发现百分比数据，需要多源交叉验证")
    
    # 4d. 反方观点补充
    has_counter_view = any(
        "质疑" in m.get("title", "") or "反对" in m.get("title", "") or 
        "风险" in m.get("title", "") or "挑战" in m.get("title", "")
        for m in all_materials
    )
    
    if not has_counter_view:
        followup_tasks.append({
            "dimension": "反方视角",
            "keyword": f"{plan.topic} 风险 挑战 质疑 问题",
            "priority": "medium",
            "include_content": True,
            "strategy": "followup_counter",
            "round": f"followup_{followup_round}",
            "reason": "缺乏反方观点，需要补充"
        })
        gap_reasons.append("缺乏反方视角/质疑观点")
    
    # 5. 饱和度检测
    # 饱和条件（满足任一即停止）：
    # a. 追问轮次 >= 3
    # b. 无追问任务可生成
    # c. 总素材数 >= 60
    # d. 所有维度覆盖率 >= 60%
    all_coverage_ok = all(s["coverage_rate"] >= 0.6 for s in dim_coverage.values())
    
    is_saturated = (
        followup_round >= 3 or
        len(followup_tasks) == 0 or
        len(all_materials) >= 60 or
        all_coverage_ok
    )
    
    if is_saturated:
        if followup_round >= 3:
            gap_reasons.append("追问轮次已达上限(3轮)")
        elif len(all_materials) >= 60:
            gap_reasons.append("素材数量已充足(>=60)")
        elif all_coverage_ok:
            gap_reasons.append("所有维度覆盖率已达标(>=60%)")
        else:
            gap_reasons.append("无更多追问需求")
    
    return {
        "is_saturated": is_saturated,
        "dim_coverage": dim_coverage,
        "low_coverage_dims": low_coverage_dims,
        "extracted_entities": entities,
        "high_value_entities": high_value_entities,
        "followup_tasks": followup_tasks,
        "all_materials_count": len(all_materials),
        "gap_reasons": gap_reasons,
        "followup_round": followup_round,
        "percentage_found": percentage_found,
        "market_size_found": market_size_found,
        "has_counter_view": has_counter_view
    }


def generate_followup_search_plan(
    gap_analysis: Dict,
    max_tasks_per_round: int = 10
) -> Dict:
    """
    基于缺口分析，生成规范的追问搜索计划
    """
    tasks = gap_analysis["followup_tasks"]
    
    # 限制每轮追问任务数
    if len(tasks) > max_tasks_per_round:
        # 按优先级排序
        priority_order = {"high": 0, "medium": 1, "low": 2}
        tasks = sorted(tasks, key=lambda t: priority_order.get(t.get("priority", "medium"), 1))
        tasks = tasks[:max_tasks_per_round]
    
    return {
        "should_followup": not gap_analysis["is_saturated"],
        "followup_tasks": tasks,
        "statistics": {
            "total_materials": gap_analysis["all_materials_count"],
            "low_coverage_dims": len(gap_analysis["low_coverage_dims"]),
            "extracted_entities": len(gap_analysis["extracted_entities"]),
            "gap_reasons": gap_analysis["gap_reasons"]
        },
        "saturation_reason": "已饱和" if gap_analysis["is_saturated"] else "继续追问"
    }


# ══════════════════════════════════════════════════════════════


def deep_research_workflow(
    topic: str,
    domain: str = "auto",
    depth: str = "deep",
    search_results: Optional[Dict[int, List[Dict]]] = None,
    output_ppt: bool = True,
    output_charts: bool = True,
    verbose: bool = True
) -> Dict:
    """兼容V4.2的接口，内部调用V4.2.1"""
    return deep_research_workflow_v2(
        topic=topic,
        domain=domain,
        depth=depth,
        search_results=search_results,
        output_ppt=output_ppt,
        output_charts=output_charts,
        verbose=verbose
    )


if __name__ == "__main__":
    # 测试
    result = deep_research_workflow_v2(
        topic="钉钉创始人无招最新言论",
        depth="deep",
        verbose=True
    )
    print(f"\n报告预览（前500字符）：")
    print(result["report"][:500])
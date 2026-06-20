# Stormaxe AI Video System / 暴风战斧AI视频生成系统

> 基于 Seedance 2.0 API 的专业级 AI 视频生成系统，支持角色一致性、多镜头叙事、自动剧本生成与渲染管线。

## 系统架构

```
暴风战斧AI视频生成系统 (Stormaxe AI Video System)
├── zhuoyue-system/          # 核心预生产管线
│   ├── core/               # 主流程引擎 (nirath-master-pipeline.js)
│   ├── systems/            # 各阶段处理模块
│   └── data/               # 主题配置与技能注入数据
├── systems/                 # 渲染与提交系统
│   ├── render-submitter.js       # 渲染提交核心
│   ├── render-request-builder.js # Payload 构建
│   ├── llm-reasoning-engine.js   # LLM 推理引擎
│   └── prompt-resolver.js        # Prompt 解析
├── scripts/                 # 安全与质量保障
│   ├── prompt-guardian.js        # Prompt 自动修复
│   ├── render-pipeline-guard.js  # 渲染前强制检查
│   └── render-qa-checker.js      # QA 质量检查
├── config/                  # 配置文件（需手动配置）
│   ├── env.js.example      # 环境变量模板
│   └── seedance.json.example # Seedance API 配置模板
├── characters/              # 角色定妆照（用户自行准备）
│   └── chenzhuo/           # 示例角色
│       └── character-card.json # 角色档案
├── docs/                    # 文档
├── knowledge-base/          # 提示词知识库
└── skills/                  # 技能扩展
```

## 核心能力

- **角色一致性保障**: PromptGuardian + RenderPipelineGuard + 外观锚定注入，确保角色服装/配饰 100% 一致
- **自动剧本生成**: LLM 驱动的分镜剧本生成，支持主题漂移检测与自动修正
- **多镜头叙事**: 预生产管线自动生成多镜头时间轴与转场
- **渲染安全**: 10 项强制检查，防止 API Key 泄露与敏感词提交
- **异步轮询**: 指数退避轮询，支持长时间渲染任务跟踪

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/geniusdapeng-collab/StormaxeAIVideoSystem.git
cd StormaxeAIVideoSystem
npm install
```

### 2. 配置环境变量

```bash
cp config/env.js.example config/env.js
cp config/seedance.json.example config/seedance.json
# 编辑上述文件，填入你的 API Key 和接入点
```

### 3. 准备角色定妆照

```bash
mkdir -p characters/your-character/portraits/uniform
# 放置 3-5 张多角度定妆照
# 编辑 characters/your-character/character-card.json
```

### 4. 运行预生产

```bash
node run-preproduction-v3.js --project=your-project --cp=0.6
```

### 5. 提交渲染

```bash
node systems/production-render-cli.js --input output/your-project/
```

## 版本历史

| 版本 | 日期 | 关键变更 |
|------|------|----------|
| v6.6.5 | 2026-06-21 | 融合 Seedance 2.0 API 三份技术报告，PromptGuardian + PipelineGuard + QA |
| v6.6.3 | 2026-06-17 | 全链路中文字段标准化，角色 ID 匹配修复，Validator 假阳性修复 |
| v6.6.2 | 2026-06-14 | ACTION 字段修复，TIMELINE 全局时间，S00 片头修复 |
| v6.5.65 | 2026-06-13 | 初始稳定版本，完整预生产管线 |

## 开源协议

MIT License

## 致谢

感谢外部技术专家对主题漂移修复和 Seedance 2.0 API 最佳实践的贡献。

# Stormaxe AI Video System / 暴风战斧AI视频生成系统

## ⚠️ 开源发布安全指南

### 敏感信息保护（必须遵守）

以下文件/目录**绝对不能**提交到 GitHub：

| 类型 | 路径 | 原因 |
|------|------|------|
| API密钥 | `config/seedance.json` | 包含火山引擎 API Key |
| 环境变量 | `config/env.js` | 包含硬编码的 API Key |
| 定妆照 | `characters/` | 包含人物肖像照片 |
| 生成视频 | `output/` | 生产结果 |
| 患者数据 | `data/patients/` | 医疗隐私数据 |
| 日记/记忆 | `memory/`, `memorized_diary/`, `memorized_media/` | 私人内容 |
| 节点模块 | `node_modules/` | 依赖包 |
| 日志 | `audit-logs/` | 运行日志 |

### 预提交检查清单

```bash
# 1. 检查是否有 API Key 残留
grep -rn "ark-[a-z0-9-]\+" --include="*.js" --include="*.json" . 2>/dev/null

# 2. 检查是否有密钥模式
grep -rn "apiKey\|api_key\|password\|secret" --include="*.js" --include="*.json" . 2>/dev/null

# 3. 确认 .gitignore 生效
git check-ignore -v config/seedance.json
```

### 环境变量替代方案

本地开发时，将 API Key 放入 `.env` 文件（已加入 .gitignore）：

```bash
# .env
ARK_API_KEY=your-api-key-here
SEEDANCE_ENDPOINT=your-endpoint-here
```

代码中通过 `process.env.ARK_API_KEY` 读取，不再硬编码。

## 项目信息

- **中文名**: 暴风战斧AI视频生成系统
- **英文名**: Stormaxe AI Video System
- **版本**: v6.6.5
- **技术栈**: Node.js, Seedance 2.0 API, LLM Reasoning Engine

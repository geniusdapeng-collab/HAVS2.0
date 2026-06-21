# 暴风战斧AI视频生成系统 v6.6.6 - 安全打包清单

## 修改摘要

本次更新将原作者联系方式嵌入源码，并清理所有敏感配置，便于安全分享给外部使用者。

---

## 1. 新增文件

### `author-info.js` — 作者联系信息模块
- 作者：GeniusDapeng
- 邮箱：63904380@qq.com
- 电话：15958153477
- 微信：Wechat
- 支持范围：安装配置、使用咨询、Bug反馈、版本更新、定制需求

提供三个核心功能：
- `printWelcomeMessage()` — 首次安装成功后显示欢迎信息 + 使用介绍
- `formatErrorWithContact()` — 错误提示时附加联系方式
- `formatContactInfo()` — 格式化输出联系方式

---

## 2. 修改文件

### `run-preproduction-v3.js`（主入口）
- 顶部引入 `author-info.js` 模块
- 首次运行检测：若不存在 `.install-welcome-shown` 标志文件，显示欢迎消息 + 联系方式 + 使用介绍
- 欢迎信息包含：整体流程（5步）、需提供的Key清单（ARK_API_KEY、SEEDANCE_ENDPOINT、SEEDREAM_ENDPOINT等）、快速开始命令
- 错误 catch 块：pipeline 失败时自动弹出作者联系方式，提示"联系原作者获取支持"

### `zhuoyue-system/core/nirath-master-pipeline.js`（当前工作版）
- 第1299行：pipeline catch 错误处理中插入 `formatErrorWithContact()`，链路中断时提示联系原作者

### `zhuoyue-system/core/nirath-master-pipeline.js.production-v6.6.6`（生产版）
- 同步上述修改，备份为新版本

### `systems/config-center-v2.js`
- 硬编码 endpoint ID 替换为安全占位符：
  - `endpoint: process.env.SEEDANCE_ENDPOINT || 'YOUR_SEEDANCE_ENDPOINT_ID'`
  - `fastEndpoint: process.env.SEEDANCE_FAST_ENDPOINT || 'YOUR_SEEDANCE_FAST_ENDPOINT_ID'`
  - `imageEndpoint: process.env.SEEDREAM_ENDPOINT || 'YOUR_SEEDREAM_ENDPOINT_ID'`

### `systems/render-engines/render-pipeline-universal.js`
- 硬编码 endpoint 替换为：`process.env.SEEDANCE_ENDPOINT || 'YOUR_SEEDANCE_ENDPOINT_ID'`

### `systems/render-submitter.js`
- 硬编码 endpoint 替换为：`process.env.SEEDANCE_ENDPOINT || 'YOUR_SEEDANCE_ENDPOINT_ID'`

### `engines/script-engine/core/script-generator.js`
- 硬编码 endpoint 替换为：`process.env.LLM_MODEL || 'YOUR_LLM_MODEL_ENDPOINT_ID'`

### `README.md`
- 快速开始部分增加使用介绍：整体流程（5步）、需提供的Key说明
- 新增"技术支持与联系"章节，表格展示作者联系方式

### `package.json`
- 版本号：6.6.5 → 6.6.6
- 作者：Stormaxe Team → GeniusDapeng <63904380@qq.com>

### `.gitignore`（安全发布配置）
- 新增排除：含硬编码端点的私人脚本（`generate-portraits*.js`）
- 新增排除：历史源码文档导出（`video-system-full-code.md`、`zhuoyue-system-full-code.md`、`StormaxeAIVideoSystem-*.md`）

### `zhuoyue-system/VERSION` 和 `.current-version`
- 版本号：v6.6.6

---

## 3. .gitignore 已排除的敏感文件清单

| 文件 | 说明 |
|------|------|
| `config/env.js` | 含 ARK_API_KEY、火山引擎端点等实际配置 |
| `config/seedance.json` | 含 Seedance 2.0 实际接入点配置 |
| `config/*.local.json` | 本地配置文件 |
| `.env` / `.env.local` | 环境变量文件 |
| `*.pem` / `*.key` | 密钥证书 |
| `characters/` | 角色定妆照（保留 `chenzhuo` 目录结构但排除 portraits） |
| `memorized_media/` | 记忆媒体文件 |
| `output/` / `productions/` | 生产输出 |
| `data/` | 数据文件（含患者数据） |
| `memory/` / `memorized_diary/` | 记忆与日记 |
| `node_modules/` | 依赖包 |
| `generate-portraits*.js` | 含硬编码端点的辅助脚本 |
| `video-system-full-code.md` | 历史源码导出文档 |
| `zhuoyue-system-full-code.md` | 历史源码导出文档 |
| `StormaxeAIVideoSystem-*.md` | 历史源码导出文档 |

---

## 4. 联系方式弹出时机

| 场景 | 触发方式 | 显示内容 |
|------|---------|---------|
| **首次安装成功** | 运行 `run-preproduction-v3.js` 时检测 `.install-welcome-shown` 文件 | 欢迎横幅 + 整体流程（5步）+ 需提供的Key + 联系方式 |
| **Pipeline 链路中断** | `nirath-master-pipeline.js` catch 错误 | 错误信息 + "联系原作者"提示 + 邮箱/电话/微信 |
| **入口脚本错误** | `run-preproduction-v3.js` catch 块 | 错误信息 + 联系方式横幅 |
| **README 文档** | 手动阅读 | 技术支持章节表格 |

---

## 5. 外部使用者首次安装后的体验

```
运行 npm install 后执行 node run-preproduction-v3.js
    ↓
弹出欢迎横幅 🪓 暴风战斧AI视频生成系统
    ↓
显示：
  1. 整体流程（5步：定妆照 → 配置Key → 预生产 → 审阅 → 渲染）
  2. 需提供的Key（ARK_API_KEY、SEEDANCE_ENDPOINT、SEEDREAM_ENDPOINT等）
  3. 快速开始命令
  4. 作者联系方式（邮箱、电话、微信）
    ↓
生成 .install-welcome-shown 标志文件（下次不再显示）
    ↓
正常使用...
    ↓
若遇到错误 → 自动在错误信息底部附加联系方式
```

---

## 6. 打包命令建议

```bash
# 使用 git archive 生成干净的源码包（自动遵循 .gitignore）
git archive --format=zip --output=StormaxeAIVideoSystem-v6.6.6.zip HEAD

# 或 tar.gz
git archive --format=tar.gz --output=StormaxeAIVideoSystem-v6.6.6.tar.gz HEAD

# 验证包内不含敏感文件
unzip -l StormaxeAIVideoSystem-v6.6.6.zip | grep -E "env\.js|seedance\.json|generate-portraits|\.md$"
# 预期：无输出（空结果 = 安全）
```

---

版本：v6.6.6 | 日期：2026-06-21

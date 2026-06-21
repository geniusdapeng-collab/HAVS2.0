# 暴风战斧AI视频生成系统 - 主链路入口文档

> 本文档记录预生产任务的唯一合法入口，严禁调用快捷脚本路径。

## 主链路入口（唯一合法入口）

### 入口文件
```
/root/.openclaw/workspace/run-preproduction-v3.js
```

### 核心组件
| 组件 | 文件路径 | 类名 |
|------|----------|------|
| 主 Pipeline | `zhuoyue-system/core/nirath-master-pipeline.js` | `NirathMasterPipeline` |
| 需求解析器 | `zhuoyue-system/systems/user-requirement-parser.js` | `UserRequirementParser` |
| 真实感增强器 | `zhuoyue-system/core/realism-prompt-enhancer.js` | `RealismPromptEnhancer` |
| 片头系统 | `systems/generic-opening-system.js` | `GenericOpeningSystem` |

### 执行命令模板
```bash
cd /root/.openclaw/workspace && node run-preproduction-v3.js --project=<项目名> --cp=<创意指数> --film-type=<类型>
```

### 参数说明
- `--project`: 项目标识名（如 `health-edu-ep01`）
- `--cp`: 创意指数（0.0-1.0，默认 0.6）
- `--film-type`: 影片类型（如 `EDU`, `DRAMA`, `DOC` 等）
- `--realism-enhance`: 启用真实感增强（可选）
- `--session`: 会话标识（可选）

## 预生产标准链路（5步）

### 步骤1：清理旧数据与输出
- 删除 `output/<项目名>/` 目录下所有旧文件
- 清理 `.checkpoint.json` 断点文件
- 确保环境干净

### 步骤2：生成需求要点确认清单
- 调用 `UserRequirementParser` 解析用户输入
- 输出《视频需求要点清单》（七大章节28个字段）
- **必须经主人确认**（说"OK"或"没问题"）才能进入下一步
- 违反记录：2026-06-21 曾多次跳过此步骤直接执行

### 步骤3：定妆照检查与确认（子流程）
- 检查所有必需角色的定妆照是否存在（4角度：front/threeQuarter/closeup/side）
- 如果缺失，调用定妆照生成链路生成
- **发送给主人确认，主人说 OK 才能继续，不 OK 则重新生成**
- 定妆照确认前，严禁执行主链路

### 步骤4：执行主链路（全部环节）
- 调用最新版 `run-preproduction-v3.js`
- **严禁调用任何快捷脚本路径**（如 `run-v6.6.8.sh` 等）
- **严禁跳过任何环节**，即使是"小环节"
- 需要 LLM 推理的环节，必须进行 LLM 推理
- 发现问题立即修复，不能绕过

### 步骤5：Prompt 交付与确认
- 预生产完成后，将 `preproduction-report.md` 生成
- **第一时间以附件方式发送到飞书**
- 主人确认 OK 后才能提交 Seedance 渲染

## 主链路入口（唯一合法入口）

```
入口文件: /root/.openclaw/workspace/run-preproduction-v3.js
核心 Pipeline: /root/.openclaw/workspace/zhuoyue-system/core/nirath-master-pipeline.js (NirathMasterPipeline)
需求解析器: /root/.openclaw/workspace/zhuoyue-system/systems/user-requirement-parser.js (UserRequirementParser)
```

### 执行命令模板
```bash
cd /root/.openclaw/workspace && node run-preproduction-v3.js --project=<项目名> --cp=<创意指数> --film-type=<类型>
```

### 参数说明
- `--project`: 项目标识名（如 `health-edu-ep01`）
- `--cp`: 创意指数（0.0-1.0，默认 0.6）
- `--film-type`: 影片类型（如 `EDU`, `DRAMA`, `DOC` 等）
- `--realism-enhance`: 启用真实感增强（可选）
- `--session`: 会话标识（可选）

## 严禁行为

- ❌ **严禁调用快捷脚本路径**（如 `run-v6.6.8.sh`、`run-preproduction.sh` 等）
- ❌ 严禁直接调用旧版本 Pipeline 文件
- ❌ 严禁跳过 Stage 或环节
- ❌ 严禁复用上一次的任务数据
- ❌ 严禁在定妆照未确认前跑主链路
- ❌ 严禁跳过需求清单确认步骤

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v6.6.8-patch3 | 2026-06-21 | 全局时间定位字段修复（报告 + Prompt） |
| v6.6.8-patch2 | 2026-06-21 | Seedance reference_image 绑定规范修复 |
| v6.6.8 | 2026-06-20 | Prompt 设计重构（正面引导替代负面约束） |
| v6.6.7 | 2026-06-19 | content=0 容错修复 |
| v6.6.5 | 2026-06-14 | 生产版本发布 |

## 相关文档

- `SOUL.md` - 灵魂内核与行为准则
- `AGENTS.md` - 工作空间规范
- `MEMORY.md` - 长期记忆与规范
- `docs/SIGKILL-fix-playbook-v6.6.3.md` - 超时问题排查

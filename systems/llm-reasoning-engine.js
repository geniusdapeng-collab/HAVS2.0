// llm-reasoning-engine.js v6.5.27-expert-fix
// 专家重构：两阶段生成 + 禁止reasoning_content顶替content
const fs = require('fs');
const path = require('path');
const { normalizeLLMOutput } = require('./llm-output-normalizer');

class LLMEngine {
  constructor(options = {}) {
    this.model = options.model || process.env.STORMAXE_MODEL || 'kimi-k2p6';
    this.maxTokens = options.maxTokens || parseInt(process.env.STORMAXE_MAX_TOKENS, 10) || 4096;
    this.timeoutMs = options.timeoutMs || parseInt(process.env.STORMAXE_TIMEOUT_MS, 10) || 180000;
    this.temperature = options.temperature ?? (process.env.STORMAXE_TEMPERATURE ? parseFloat(process.env.STORMAXE_TEMPERATURE) : 1);
    this.topP = options.topP ?? 0.95;
    this.maxRetries = options.maxRetries || parseInt(process.env.STORMAXE_MAX_RETRIES, 10) || 3;
    this.contextWindow = options.contextWindow || 8192;
    this.conversationHistory = [];
    this.stats = { totalCalls: 0, totalTokens: 0, totalDuration: 0, errors: 0 };
    this.mode = options.mode || 'production';
    this.baseUrl = options.baseUrl || process.env.STORMAXE_BASE_URL || 'https://agent-gw.kimi.com/coding/v1/chat/completions';
    this.apiKey = options.apiKey || process.env.STORMAXE_API_KEY || process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || process.env.KIMI_PLUGIN_API_KEY;

    if (!this.apiKey) {
      console.warn('[LLMEngine] ⚠️ 未检测到 API Key，请确认环境变量 KIMI_API_KEY 或 MOONSHOT_API_KEY');
    }
  }

  _buildHeaders() {
    // 使用Kimi Plugin认证（兼容agent-gw.kimi.com/coding端点）
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': 'Kimi Claw Plugin',
      'X-Msh-Device-Name': 'openclaw-kimi-embedding'
    };
  }

  async _fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // v6.6.3-fix: LLM 调用心跳保活
    // 问题: kimi-k2p6 推理模型单次响应需 30-120 秒，期间 await fetch 等待网络
    // 响应时进程无 stdout 输出，子代理活跃度监控判定为"僵死"并 SIGKILL。
    // 原理: Node.js 的 await fetch 是异步 I/O，等待期间事件循环不阻塞，
    // setInterval 心跳可以正常触发，持续向 stdout 输出保活信号。
    let heartbeatTicks = 0;
    const heartbeat = setInterval(() => {
      heartbeatTicks++;
      process.stdout.write('.');
      // 每 12 次心跳（约 60 秒）输出一次带内存信息的完整心跳行
      if (heartbeatTicks % 12 === 0) {
        const m = process.memoryUsage();
        process.stdout.write(` [llm-heartbeat ${heartbeatTicks * 5}s | rss=${(m.rss / 1048576).toFixed(0)}MB | heap=${(m.heapUsed / 1048576).toFixed(0)}MB]\n`);
      }
    }, 5000);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ABORT_ERR') {
        const error = new Error(`Request timeout after ${timeoutMs}ms`);
        error.code = 'TIMEOUT';
        error.original = err;
        throw error;
      }
      throw err;
    } finally {
      clearTimeout(timer);
      clearInterval(heartbeat);
      // 心跳结束后补一个换行，避免后续日志粘连在点号后
      if (heartbeatTicks > 0) process.stdout.write('\n');
    }
  }

  _dumpDebugFile(prefix, content) {
    try {
      const dir = path.resolve(process.cwd(), 'debug_llm');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `${Date.now()}_${prefix}.txt`);
      fs.writeFileSync(file, content || '', 'utf8');
      return file;
    } catch (e) {
      return null;
    }
  }

  _extractJsonObject(text) {
    if (!text || typeof text !== 'string') return '';
    const { json } = require('./llm-output-normalizer').extractJsonObject(text);
    return json || '';
  }

  _extractFromReasoning(reasoning) {
    if (!reasoning || reasoning.length === 0) return '';

    // 策略 1：提取 JSON（优先）
    const json = this._extractJsonObject(reasoning);
    if (json) {
      console.log(`[LLMEngine] ✅ 从reasoning提取到JSON | 长度: ${json.length}`);
      return json;
    }

    // 策略 2：提取最后一段含 { / [ 的段落（可能不是合法 JSON，交给上层校验）
    const segments = reasoning.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      if (seg.includes('{') || seg.includes('[')) {
        console.log(`[LLMEngine] ⚠️ 从reasoning提取到含结构标记段落(待JSON校验) | 长度: ${seg.length}`);
        return seg;
      }
    }
    return '';
  }

  async reason(prompt, options = {}) {
    const startedAt = Date.now();
    this.stats.totalCalls++;

    const body = {
      model: options.model || this.model,
      messages: [
        {
          role: 'system',
          content: options.systemPrompt || '你是一个严格输出 JSON 的助手。除合法 JSON 外不要输出任何额外文字。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature ?? this.temperature,  // v6.6.5-fix: 优先使用传入值，回退实例值
      top_p: options.topP ?? this.topP,
      max_tokens: options.maxTokens ?? this.maxTokens
    };

    if (options.responseFormat) {
      body.response_format = options.responseFormat;
    }

    try {
      const response = await this._fetchWithTimeout(
        this.baseUrl,
        {
          method: 'POST',
          headers: this._buildHeaders(),
          body: JSON.stringify(body)
        },
        options.timeoutMs || this.timeoutMs
      );

      const text = await response.text();
      if (!response.ok) {
        this.stats.errors++;
        const file = this._dumpDebugFile('http_error', text);
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 1000)}${file ? ` | dump=${file}` : ''}`);
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        this.stats.errors++;
        const file = this._dumpDebugFile('invalid_response_json', text);
        throw new Error(`API响应不是合法JSON: ${e.message}${file ? ` | dump=${file}` : ''}`);
      }

      const message = result.choices?.[0]?.message || {};
      const content = message.content || '';
      const reasoningContent = message.reasoning_content || '';
      const usage = result.usage || {};
      const tokenCount = usage.total_tokens || 0;

      this.stats.totalTokens += tokenCount;
      this.stats.totalDuration += Date.now() - startedAt;

      console.log(`[LLMEngine] ✅ API完成 | Tokens: ${tokenCount} | content=${content.length} | reasoning=${reasoningContent.length}`);

      // 统一使用 normalizeLLMOutput 处理输出
      const normalized = normalizeLLMOutput({
        content,
        reasoning_content: reasoningContent
      });

      let finalContent = normalized.text;

      if (!normalized.ok || !finalContent || finalContent.trim().length < 50) {
        if (reasoningContent && reasoningContent.length > 50) {  // v6.5.65-P8-patch-005: 降低阈值，适配通用内容
          const extracted = this._extractFromReasoning(reasoningContent);
          if (extracted && extracted.length > 50) {  // v6.5.65-P8-patch-005: 降低阈值
            finalContent = extracted;
            console.log(`[LLMEngine] ✅ 从reasoning提取内容 | 长度: ${extracted.length}`);
          } else {
            const reasonFile = this._dumpDebugFile('empty_content_reasoning', reasoningContent);
            throw new Error(
              `LLM返回content为空，且无法从reasoning提取有效内容` +
              `${reasonFile ? ` | reasoning_dump=${reasonFile}` : ''}`
            );
          }
        } else {
          const reasonFile = this._dumpDebugFile('empty_content_reasoning', reasoningContent);
          throw new Error(
            `LLM返回content为空，疑似tokens被reasoning耗尽` +
            `${reasonFile ? ` | reasoning_dump=${reasonFile}` : ''}`
          );
        }
      }

      // v6.7.0-fix: 如果 content 有效，将 reasoning_content 截断为摘要，避免外部内存膨胀
      let trimmedReasoning = reasoningContent;
      if (finalContent && finalContent.length > 50 && reasoningContent && reasoningContent.length > 200) {
        trimmedReasoning = reasoningContent.substring(0, 200) + '... (truncated, ' + reasoningContent.length + ' chars)';
      }

      return {
        success: true,
        content: finalContent,
        reasoning_content: trimmedReasoning,
        source: normalized.source,
        tokenCount
        // raw: result  // v6.6-fix: 不返回完整raw响应,减少内存占用
      };
    } catch (error) {
      this.stats.errors++;
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }

  async generate(prompt, options = {}) {
    const result = await this.reason(prompt, options);
    return result;
  }

  async reasonStructured(prompt, schema, options = {}) {
    const startTime = Date.now();
    const maxRetries = options.maxRetries || this.maxRetries || 3;
    const timeoutMs = options.timeoutMs || this.timeoutMs || 120000;
    const temperature = options.temperature ?? 1;
    const topP = options.topP ?? 0.95;
    const maxTokens = options.maxTokens ?? this.maxTokens ?? 4096;

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[LLMEngine] reasonStructured 第 ${attempt}/${maxRetries} 次尝试`);

        const result = await this.reason(prompt, {
          ...options,
          responseFormat: { type: 'json_object' },
          temperature,
          topP,
          maxTokens,
          timeoutMs
        });

        if (!result.success) {
          lastError = result.error;
          console.warn(`[LLMEngine] ⚠️ reasonStructured attempt ${attempt}/${maxRetries} API失败: ${lastError}`);
          if (attempt < maxRetries) {
            const wait = 1000 * Math.pow(2, attempt - 1) + Math.random() * 500;
            console.log(`[LLMEngine] ${Math.round(wait)}ms 后重试...`);
            await new Promise(r => setTimeout(r, wait));
          }
          continue;
        }

        const reasoningContent = result.reasoning_content || '';
        const normalized = require('./llm-output-normalizer').normalizeLLMOutput({
          content: result.content,
          reasoning_content: reasoningContent
        });

        console.log(
          `[LLMEngine] 归一化 | source=${normalized.source} ok=${normalized.ok} ` +
          `hasJson=${normalized.hasJson} jsonType=${normalized.jsonType} textLen=${normalized.text?.length || 0}`
        );

        // ============ 决策链：按优先级确定 finalContent ============
        let finalContent = '';

        // 1) 归一化已提取到 JSON → 直接用
        if (normalized.hasJson && normalized.jsonText) {
          finalContent = normalized.jsonText;
          console.log(`[LLMEngine] ✅ 使用归一化JSON | source=${normalized.source} len=${finalContent.length}`);
        }
        // 2) content 来源且本身是合法 JSON 文本
        else if (normalized.source === 'content' && normalized.text) {
          const j = this._extractJsonObject(normalized.text);
          finalContent = j || normalized.text;
          console.log(`[LLMEngine] ${j ? '✅' : '⚠️'} content来源 ${j ? '提取JSON' : '使用原文'} | len=${finalContent.length}`);
        }
        // 3) ★关键修复：reasoning 来源但 hasJson=false → 强制重新抠 JSON
        else if (normalized.source === 'reasoning_content') {
          console.log(`[LLMEngine] ⚠️ reasoning来源但归一化未提取到JSON，强制重新提取`);
          const extracted = this._extractFromReasoning(reasoningContent);
          finalContent = (extracted && extracted.length > 20) ? extracted : normalized.text;
        }
        // 4) 兜底
        else if (normalized.ok && normalized.text) {
          finalContent = normalized.text;
        }

        // ============ 最终 JSON 合法性校验 ============
        const validated = this._extractJsonObject(finalContent);
        if (validated) {
          finalContent = validated;
        } else {
          console.log(`[LLMEngine] ❌ 最终内容非合法JSON，从原始reasoning做最后兜底`);
          if (reasoningContent && reasoningContent.length > 50) {
            const lastJson = this._extractJsonObject(reasoningContent);
            if (lastJson) {
              finalContent = lastJson;
              console.log(`[LLMEngine] ✅ 最后兜底从reasoning提取JSON成功 | len=${finalContent.length}`);
            } else {
              throw new Error(
                `LLM返回内容无法解析为JSON | source=${normalized.source} ` +
                `textLen=${finalContent.length} reasoningLen=${reasoningContent.length}`
              );
            }
          } else {
            throw new Error(`LLM返回内容无法解析为JSON且无reasoning可用 | textLen=${finalContent.length}`);
          }
        }

        // ============ 长度校验 ============
        if (!finalContent || finalContent.trim().length < 20) {
          throw new Error(`LLM返回内容过短 | len=${finalContent?.length || 0} source=${normalized.source}`);
        }

        // ============ 解析 ============
        const parsed = JSON.parse(finalContent);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[LLMEngine] ✅ reasonStructured成功 | 耗时:${elapsed}s 尝试:${attempt} source=${normalized.source}`);

        // v6.7.0-fix: 截断 reasoning_content，避免外部内存膨胀
        let trimmedReasoning = reasoningContent;
        if (reasoningContent && reasoningContent.length > 200) {
          trimmedReasoning = reasoningContent.substring(0, 200) + '... (truncated, ' + reasoningContent.length + ' chars)';
        }

        return {
          success: true,
          data: parsed,
          rawContent: finalContent,
          reasoning_content: trimmedReasoning,
          source: normalized.source,
          attempts: attempt,
          elapsed: parseFloat(elapsed)
        };

      } catch (err) {
        lastError = err;
        console.log(`[LLMEngine] ❌ 第 ${attempt}/${maxRetries} 次失败: ${err.message}`);
        if (attempt < maxRetries) {
          const wait = 1000 * Math.pow(2, attempt - 1) + Math.random() * 500;
          console.log(`[LLMEngine] ${Math.round(wait)}ms 后重试...`);
          await new Promise(r => setTimeout(r, wait));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || '未知错误',
      attempts: maxRetries
    };
  }
}

module.exports = { LLMEngine };

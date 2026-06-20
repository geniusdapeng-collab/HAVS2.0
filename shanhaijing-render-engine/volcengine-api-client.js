/**
 * Volcengine Ark API Client
 * 封装火山引擎 Seedance 视频生成 & Seedream 图片生成 API
 */

const fs = require('fs').promises;
const fss = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// 加载配置
const ENV = require('../config/env.js');

class VolcengineArkClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || ENV.ARK_API_KEY;
    this.baseUrl = options.baseUrl || ENV.ARK_BASE_URL;
    this.endpoints = {
      seedance: options.seedanceEndpoint || ENV.SEEDANCE_ENDPOINT,
      seedanceFast: options.seedanceFastEndpoint || ENV.SEEDANCE_FAST_ENDPOINT,
      seedream: options.seedreamEndpoint || ENV.SEEDREAM_ENDPOINT
    };
    this.maxConcurrent = options.maxConcurrent || 1;
    this.activeTasks = 0;
    this.taskQueue = [];
    
    if (!this.apiKey) {
      throw new Error('[VolcengineArkClient] ARK_API_KEY 未配置');
    }
  }

  _buildHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  async _fetchWithTimeout(url, options, timeoutMs = 300000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * 生成视频（Seedance 2.0）
   */
  async generateVideo({
    prompt,
    model = 'seedance-2-0',
    ratio = '16:9',
    duration = 8,
    generateAudio = true,
    watermark = false,
    referenceImages = [],
    referenceVideos = [],
    referenceAudios = []
  }) {
    const endpoint = model.includes('fast') 
      ? this.endpoints.seedanceFast 
      : this.endpoints.seedance;
    
    const content = [{ type: 'text', text: prompt }];
    
    // 添加参考图片
    for (const img of referenceImages) {
      content.push({
        type: 'image_url',
        image_url: { url: img },
        role: 'reference_image'
      });
    }
    
    // 添加参考视频
    for (const vid of referenceVideos) {
      content.push({
        type: 'video_url',
        video_url: { url: vid },
        role: 'reference_video'
      });
    }
    
    // 添加参考音频
    for (const aud of referenceAudios) {
      content.push({
        type: 'audio_url',
        audio_url: { url: aud },
        role: 'reference_audio'
      });
    }

    const payload = {
      model: endpoint,
      content,
      generate_audio: generateAudio,
      ratio,
      duration,
      watermark
    };

    console.log(`[VolcengineArkClient] 提交视频生成任务: model=${model}, endpoint=${endpoint}`);
    
    const res = await this._fetchWithTimeout(
      `${this.baseUrl}/contents/generations/tasks`,
      {
        method: 'POST',
        headers: this._buildHeaders(),
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`视频生成任务提交失败: ${res.status} ${err}`);
    }

    const data = await res.json();
    console.log(`[VolcengineArkClient] 任务提交成功: taskId=${data.id}`);
    
    return {
      taskId: data.id,
      status: data.status || 'submitted',
      prompt,
      submittedAt: new Date().toISOString()
    };
  }

  /**
   * 生成图片（Seedream 5.0 lite）
   */
  async generateImage({
    prompt,
    size = '2K',
    watermark = false,
    responseFormat = 'url',
    sequentialImageGeneration = 'disabled'
  }) {
    const payload = {
      model: this.endpoints.seedream,
      prompt,
      sequential_image_generation: sequentialImageGeneration,
      response_format: responseFormat,
      size,
      stream: false,
      watermark
    };

    console.log(`[VolcengineArkClient] 提交图片生成任务: endpoint=${this.endpoints.seedream}`);
    
    const res = await this._fetchWithTimeout(
      `${this.baseUrl}/images/generations`,
      {
        method: 'POST',
        headers: this._buildHeaders(),
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`图片生成任务提交失败: ${res.status} ${err}`);
    }

    const data = await res.json();
    console.log(`[VolcengineArkClient] 图片生成成功`);
    
    return {
      imageUrl: data.data?.[0]?.url || data.url,
      prompt,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 查询任务状态
   */
  async getTaskStatus(taskId) {
    const res = await this._fetchWithTimeout(
      `${this.baseUrl}/contents/generations/tasks/${taskId}`,
      {
        method: 'GET',
        headers: this._buildHeaders()
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`查询任务状态失败: ${res.status} ${err}`);
    }

    const data = await res.json();
    return {
      taskId: data.id,
      status: data.status, // pending, processing, completed, failed
      result: data.content?.generations?.[0] || null,
      error: data.error || null
    };
  }

  /**
   * 等待任务完成并获取结果
   */
  async pollTaskUntilComplete(taskId, { pollInterval = 10000, maxWait = 600000 } = {}) {
    const start = Date.now();
    
    while (Date.now() - start < maxWait) {
      const status = await this.getTaskStatus(taskId);
      
      console.log(`[VolcengineArkClient] 任务 ${taskId} 状态: ${status.status}`);
      
      if (status.status === 'completed') {
        return status;
      }
      
      if (status.status === 'failed') {
        throw new Error(`任务失败: ${status.error?.message || '未知错误'}`);
      }
      
      await new Promise(r => setTimeout(r, pollInterval));
    }
    
    throw new Error(`任务轮询超时: ${taskId}`);
  }

  /**
   * 下载结果到本地
   */
  async downloadResult(url, outputPath) {
    console.log(`[VolcengineArkClient] 下载结果: ${url} -> ${outputPath}`);
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`下载失败: ${res.status}`);
    }
    
    const buffer = await res.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(buffer));
    
    console.log(`[VolcengineArkClient] 下载完成: ${outputPath} (${buffer.byteLength} bytes)`);
    return outputPath;
  }
}

// ============ 便捷函数 ============

async function generateShanhaiVideo(options) {
  const client = new VolcengineArkClient();
  return client.generateVideo(options);
}

async function generateShanhaiImage(options) {
  const client = new VolcengineArkClient();
  return client.generateImage(options);
}

module.exports = {
  VolcengineArkClient,
  generateShanhaiVideo,
  generateShanhaiImage
};

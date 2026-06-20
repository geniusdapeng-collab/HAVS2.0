#!/usr/bin/env node
/**
 * Seedance Wrapper — CLI 封装器
 * 将火山引擎 Seedance API 封装为 CLI 工具，供 seedance-render-engine.js 调用
 * 
 * 用法: node seedance-wrapper.js create --prompt "..." --model "doubao-seedance-2.0" [--seed N] [--ratio 16:9] [--duration 8] [--image-file PATH] [--return-last-frame] [--service-tier flex]
 */

const fs = require('fs').promises;
const fss = require('fs');
const path = require('path');

// 加载 API 客户端
const { VolcengineArkClient } = require('../../../shanhaijing-render-engine/volcengine-api-client.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const options = {};
  
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];
    if (key && value !== undefined) {
      if (key === 'image-file') {
        options.imageFiles = options.imageFiles || [];
        options.imageFiles.push(value);
      } else if (key === 'duration' || key === 'seed') {
        options[key] = parseInt(value, 10);
      } else {
        options[key] = value;
      }
    }
  }
  
  return { cmd, options };
}

async function createTask(options) {
  const client = new VolcengineArkClient();
  
  const refImages = [];
  if (options.imageFiles) {
    for (const file of options.imageFiles) {
      if (fss.existsSync(file)) {
        // 转换为 file:// URL 或上传后获取 URL
        // 简化：假设文件已经是本地可访问路径，需要转换为公共 URL 或 base64
        // 这里使用 base64 编码
        const buffer = fss.readFileSync(file);
        const base64 = buffer.toString('base64');
        const ext = path.extname(file).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
        refImages.push(`data:${mimeType};base64,${base64}`);
      }
    }
  }
  
  const result = await client.generateVideo({
    prompt: options.prompt || '',
    model: options.model || 'seedance-2-0',
    ratio: options.ratio || '16:9',
    duration: options.duration || 8,
    generateAudio: true,
    watermark: false,
    referenceImages: refImages
  });
  
  // 输出 JSON 结果到 stdout
  console.log(JSON.stringify({
    success: true,
    taskId: result.taskId,
    status: result.status,
    prompt: result.prompt,
    submittedAt: result.submittedAt
  }));
  
  return result;
}

async function checkTask(taskId) {
  const client = new VolcengineArkClient();
  const status = await client.getTaskStatus(taskId);
  
  console.log(JSON.stringify({
    success: true,
    taskId: status.taskId,
    status: status.status,
    result: status.result,
    error: status.error
  }));
  
  return status;
}

async function downloadTask(taskId, outputPath) {
  const client = new VolcengineArkClient();
  
  // 先轮询等待完成
  const status = await client.pollTaskUntilComplete(taskId);
  
  if (status.result?.url) {
    await client.downloadResult(status.result.url, outputPath);
    
    console.log(JSON.stringify({
      success: true,
      taskId,
      outputPath,
      downloaded: true
    }));
  } else {
    console.log(JSON.stringify({
      success: false,
      taskId,
      error: 'No result URL'
    }));
  }
}

async function main() {
  const { cmd, options } = parseArgs();
  
  try {
    switch (cmd) {
      case 'create':
        await createTask(options);
        break;
      case 'check':
        await checkTask(options.taskId || options['task-id']);
        break;
      case 'download':
        await downloadTask(
          options.taskId || options['task-id'],
          options.output || options.out || './output.mp4'
        );
        break;
      default:
        console.error(`未知命令: ${cmd}`);
        console.error('用法: node seedance-wrapper.js {create|check|download} [options]');
        process.exit(1);
    }
  } catch (err) {
    console.error(JSON.stringify({
      success: false,
      error: err.message,
      stack: err.stack
    }));
    process.exit(1);
  }
}

main();

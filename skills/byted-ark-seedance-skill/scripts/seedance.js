#!/usr/bin/env node
/**
 * Seedance.js — CLI 工具
 * 提供 get 命令查询任务状态，供 seedance-render-engine.js 轮询使用
 * 
 * 用法: node seedance.js get --task-id TASK_ID
 */

const { VolcengineArkClient } = require('../../../shanhaijing-render-engine/volcengine-api-client.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const options = {};
  
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];
    if (key && value !== undefined) {
      options[key] = value;
    }
  }
  
  return { cmd, options };
}

async function getTask(taskId) {
  const client = new VolcengineArkClient();
  const status = await client.getTaskStatus(taskId);
  
  // 转换状态格式，保持与 seedance-render-engine.js 兼容
  const normalizedStatus = status.status === 'completed' ? 'succeeded' : status.status;
  
  const result = {
    id: status.taskId,
    status: normalizedStatus,
    content: {
      video_url: status.result?.url || status.result?.video_url || null,
      last_frame_url: status.result?.last_frame_url || null
    },
    error: status.error
  };
  
  console.log(JSON.stringify(result));
  return result;
}

async function main() {
  const { cmd, options } = parseArgs();
  
  try {
    switch (cmd) {
      case 'get':
        await getTask(options['task-id'] || options.taskId);
        break;
      default:
        console.error(`未知命令: ${cmd}`);
        console.error('用法: node seedance.js get --task-id TASK_ID');
        process.exit(1);
    }
  } catch (err) {
    console.error(JSON.stringify({
      error: err.message,
      stack: err.stack
    }));
    process.exit(1);
  }
}

main();

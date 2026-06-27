// generate-myth-characters.js
// 使用 Seedream 5.0 lite 生成孙悟空和二郎神定妆照

const fs = require('fs');
const path = require('path');
const https = require('https');

const ENV = require('./config/env.js');

const API_KEY = ENV.ARK_API_KEY;
const ENDPOINT = ENV.ARK_BASE_URL + '/images/generations';
const MODEL = ENV.MODEL_IDS.SEEDREAM_5_0_LITE;

// 注意：Seedream 通过接入点(endpoint)调用，不是直接通过模型ID
// 方舟平台的格式：endpoint ID 作为路径的一部分
const SEEDREAM_URL = `${ENV.ARK_BASE_URL}/images/generations`;

const CHARACTERS = [
  {
    id: 'wukong',
    name: '孙悟空',
    outputDir: '/root/.openclaw/workspace/characters/wukong/portraits',
    prompt: `Sun Wukong the Monkey King, front-facing portrait, upper body, realistic mythological warrior style, wearing golden battle armor with intricate dragon patterns, golden circlet headband, fiery golden-red eyes with intense gaze, monkey-like facial features but handsome and noble, short golden-brown fur on face, confident fierce expression, holding Ruyi Jingu Bang (golden staff) across shoulder, dramatic cinematic lighting, dark stormy cloud background with lightning, photorealistic, highly detailed, 8k, movie poster quality, Chinese mythology character`
  },
  {
    id: 'erlang-shen',
    name: '二郎神',
    outputDir: '/root/.openclaw/workspace/characters/erlang-shen/portraits',
    prompt: `Erlang Shen (Yang Jian), front-facing portrait, upper body, realistic mythological god of war, wearing silver-white divine general armor with celestial patterns, third eye (tianyan) glowing on forehead between eyebrows, cold sharp gaze, handsome stern face, dark hair tied in warrior topknot with celestial ribbon, holding three-pronged double-edged spear (Sanjian Liangren Dao), divine aura, heavenly palace background with golden clouds, photorealistic, highly detailed, 8k, movie poster quality, Chinese mythology character`
  }
];

async function generateImage(character) {
  console.log(`[Seedream] 生成 ${character.name}...`);
  console.log(`[Seedream] Prompt: ${character.prompt.slice(0, 100)}...`);

  const postData = JSON.stringify({
    model: MODEL,
    prompt: character.prompt,
    size: '1920x1920',
    n: 1
  });

  const url = new URL(SEEDREAM_URL);

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 120000
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data && json.data[0] && json.data[0].url) {
            resolve(json.data[0].url);
          } else if (json.data && json.data[0] && json.data[0].b64_json) {
            // base64 格式
            const buffer = Buffer.from(json.data[0].b64_json, 'base64');
            const outputPath = path.join(character.outputDir, 'portrait-front.jpg');
            fs.writeFileSync(outputPath, buffer);
            resolve(`file://${outputPath}`);
          } else {
            console.error('[Seedream] 响应:', JSON.stringify(json, null, 2));
            reject(new Error('No image URL or base64 in response'));
          }
        } catch (e) {
          console.error('[Seedream] 原始响应:', data);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function downloadImage(url, outputPath) {
  if (url.startsWith('file://')) return url.replace('file://', '');

  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // 跟随重定向
        https.get(res.headers.location, { timeout: 30000 }, (res2) => {
          const chunks = [];
          res2.on('data', c => chunks.push(c));
          res2.on('end', () => {
            fs.writeFileSync(outputPath, Buffer.concat(chunks));
            resolve(outputPath);
          });
        }).on('error', reject);
      } else {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          fs.writeFileSync(outputPath, Buffer.concat(chunks));
          resolve(outputPath);
        });
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log('[Seedream] 开始生成神话角色定妆照...');
  console.log('[Seedream] 模型:', MODEL);
  console.log('[Seedream] 接入点:', ENV.SEEDREAM_ENDPOINT);

  const results = [];

  for (const char of CHARACTERS) {
    try {
      const imageUrl = await generateImage(char);
      const outputPath = path.join(char.outputDir, 'portrait-front.jpg');
      await downloadImage(imageUrl, outputPath);
      console.log(`[Seedream] ✅ ${char.name} 生成完成: ${outputPath}`);
      results.push({ name: char.name, path: outputPath, ok: true });
    } catch (err) {
      console.error(`[Seedream] ❌ ${char.name} 生成失败:`, err.message);
      results.push({ name: char.name, error: err.message, ok: false });
    }
  }

  console.log('\n[Seedream] 生成结果:');
  for (const r of results) {
    if (r.ok) {
      console.log(`  ✅ ${r.name}: ${r.path}`);
    } else {
      console.log(`  ❌ ${r.name}: ${r.error}`);
    }
  }
}

main();

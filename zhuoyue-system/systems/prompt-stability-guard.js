/**
 * Prompt Stability Guard
 * 文件: zhuoyue-system/systems/prompt-stability-guard.js
 * 作用：
 * 1. 保护关键字段不丢失
 * 2. 裁剪时优先保关键块
 * 3. 避免 prompt 被重复重组洗坏
 */

function 是非空字符串(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function 提取区块(prompt, 标签) {
  if (!是非空字符串(prompt)) return '';
  const reg = new RegExp(`(${标签}[^【]*)(?=【|$)`, 'g');
  const m = prompt.match(reg);
  return m ? m[0].trim() : '';
}

function 提取英文区块(prompt, prefix) {
  if (!是非空字符串(prompt)) return '';
  const reg = new RegExp(`(${prefix}\\s*:[^|]*)(?=\\||$)`, 'i');
  const m = prompt.match(reg);
  return m ? m[0].trim() : '';
}

function 去重片段(parts = []) {
  const out = [];
  const seen = new Set();
  for (const p of parts) {
    const k = String(p || '').trim();
    if (!k) continue;
    const kk = k.toLowerCase();
    if (!seen.has(kk)) {
      seen.add(kk);
      out.push(k);
    }
  }
  return out;
}

function 提取关键块(prompt) {
  return 去重片段([
    提取区块(prompt, '【角色】'),
    提取区块(prompt, '【场景】'),
    提取区块(prompt, '【动作】'),
    提取区块(prompt, '【台词】'),
    提取区块(prompt, '【旁白/台词】'),
    提取区块(prompt, '【镜头时间轴】'),
    提取区块(prompt, '【照明方案】'),
    提取区块(prompt, '【环境音效】'),
    提取区块(prompt, '【负面约束】'),
    提取区块(prompt, '【角色约束】'),
    提取区块(prompt, '【风格锁】'),
    提取区块(prompt, '【明亮约束】'),
    提取区块(prompt, '【绑定定妆照】'),
    提取区块(prompt, '【人物介绍卡片】'),

    提取英文区块(prompt, 'CHARACTER'),
    提取英文区块(prompt, 'SCENE'),
    提取英文区块(prompt, 'ACTION'),
    提取英文区块(prompt, 'DIALOGUE'),
    提取英文区块(prompt, 'CAMERA'),
    提取英文区块(prompt, 'TIMELINE'),
    提取英文区块(prompt, 'LIGHTING'),
    提取英文区块(prompt, 'AUDIO'),
    提取英文区块(prompt, 'NEGATIVE')
  ]).filter(Boolean);
}

function 关键字段存在(prompt) {
  return {
    角色: prompt.includes('【角色】') || /CHARACTER\s*:/i.test(prompt),
    场景: prompt.includes('【场景】') || /SCENE\s*:/i.test(prompt),
    动作: prompt.includes('【动作】') || /ACTION\s*:/i.test(prompt),
    台词: prompt.includes('【台词】') || prompt.includes('【旁白/台词】') || /DIALOGUE\s*:/i.test(prompt),
    时间轴: prompt.includes('【镜头时间轴】') || /TIMELINE\s*:/i.test(prompt),
    定妆照: prompt.includes('【绑定定妆照】') || /@image\d+/i.test(prompt),
    人物卡: prompt.includes('【人物介绍卡片】')
  };
}

function 稳定裁剪(prompt, maxLength = 1500) {
  if (!是非空字符串(prompt)) return '';
  if (prompt.length <= maxLength) return prompt;

  const 关键块 = 提取关键块(prompt);
  let 保底串 = 关键块.join(' | ');

  // 如果仅关键块已经超长，则优先裁关键块中的长块
  if (保底串.length > maxLength) {
    let out = '';
    for (const block of 关键块) {
      if ((out + ' | ' + block).length <= maxLength) {
        out = out ? `${out} | ${block}` : block;
      }
    }
    return out.slice(0, maxLength);
  }

  // 剩余空间留给原始主体描述
  const remain = maxLength - 保底串.length - 3;
  let 主体 = prompt;

  // 移除已提取关键块的重复内容
  for (const block of 关键块) {
    if (block) {
      主体 = 主体.replace(block, '');
    }
  }
  主体 = 主体.replace(/\s{2,}/g, ' ').replace(/\|\s*\|/g, '|').trim();

  if (remain > 50) {
    主体 = 主体.slice(0, remain);
    return `${保底串} | ${主体}`.slice(0, maxLength);
  }

  return 保底串.slice(0, maxLength);
}

function 恢复关键块(当前prompt, 原始prompt, maxLength = 1500) {
  let out = 当前prompt || '';
  const 当前状态 = 关键字段存在(out);
  const 原始关键块 = 提取关键块(原始prompt || '');

  for (const block of 原始关键块) {
    if (!block) continue;

    const isTimeline = block.includes('【镜头时间轴】') || /^TIMELINE\s*:/i.test(block);
    const isDialogue = block.includes('【台词】') || block.includes('【旁白/台词】') || /^DIALOGUE\s*:/i.test(block);
    const isRef = block.includes('【绑定定妆照】') || /@image\d+/i.test(block);
    const isCard = block.includes('【人物介绍卡片】');

    if (isTimeline && !当前状态.时间轴 && (out.length + block.length + 3 <= maxLength)) {
      out += ` | ${block}`;
      当前状态.时间轴 = true;
      continue;
    }
    if (isDialogue && !当前状态.台词 && (out.length + block.length + 3 <= maxLength)) {
      out += ` | ${block}`;
      当前状态.台词 = true;
      continue;
    }
    if (isRef && !当前状态.定妆照 && (out.length + block.length + 3 <= maxLength)) {
      out += ` | ${block}`;
      当前状态.定妆照 = true;
      continue;
    }
    if (isCard && !当前状态.人物卡 && (out.length + block.length + 3 <= maxLength)) {
      out += ` | ${block}`;
      当前状态.人物卡 = true;
      continue;
    }
  }

  return out.slice(0, maxLength);
}

function 最小补洞(prompt, shot = {}) {
  let out = prompt || '';

  const has动作 = out.includes('【动作】') || /ACTION\s*:/i.test(out);
  const has台词 = out.includes('【台词】') || out.includes('【旁白/台词】') || /DIALOGUE\s*:/i.test(out);
  const has时间轴 = out.includes('【镜头时间轴】') || /TIMELINE\s*:/i.test(out);

  if (!has动作 && shot.action) {
    out += ` | 【动作】${shot.action}`;
  }

  const dialogue = shot.dialogue || shot.narration || '';
  if (!has台词 && dialogue) {
    out += ` | 【台词】${dialogue}`;
  }

  if (!has时间轴 && shot.duration) {
    out += ` | 【镜头时间轴】00:00-00:${String(Math.floor(shot.duration)).padStart(2, '0')} / 时长:${shot.duration}s`;
  }

  return out;
}

module.exports = {
  提取关键块,
  关键字段存在,
  稳定裁剪,
  恢复关键块,
  最小补洞
};

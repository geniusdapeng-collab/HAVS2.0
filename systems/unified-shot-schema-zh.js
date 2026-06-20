/**
 * 全局中文字段标准规范机制
 * 文件: zhuoyue-system/systems/unified-shot-schema-zh.js
 *
 * 目标：
 * 1. 统一片头/内容镜头字段为中文
 * 2. 吸收现有英文字段/旧字段
 * 3. 强制补齐关键字段
 * 4. 提供归一化 / 校验 / 修复能力
 */

function 深拷贝(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

function 是非空字符串(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function 转数组(v) {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  return [v];
}

function 安全取(obj, keys = [], fallback = '') {
  for (const key of keys) {
    const val = obj?.[key];
    if (val !== undefined && val !== null && val !== '') return val;
  }
  return fallback;
}

function 格式化时间轴(startSec, durationSec) {
  const s = Number(startSec || 0);
  const d = Number(durationSec || 0);
  const e = s + d;
  const fmt = (n) => {
    const mm = String(Math.floor(n / 60)).padStart(2, '0');
    const ss = String(Math.floor(n % 60)).padStart(2, '0');
    return `${mm}:${ss}`;
  };
  return `${fmt(s)}-${fmt(e)} / 时长:${d}s`;
}

const 片头字段模板 = {
  镜头编号: '',
  镜头类型: '片头',
  场景名称: '片头-开场',
  主标题: '',
  副标题: '',
  台词: '',
  旁白: '',
  绑定定妆照: [],
  镜头时间轴: '',
  人物介绍卡片: [],
  时长: 0,
  人物列表: [],
  运镜: {
    描述: '',
    景别: '',
    运动: '',
    镜头参数: ''
  },
  灯光: {
    主光: '',
    补光: '',
    氛围光: '',
    描述: ''
  },
  画面提示词: '',
  音频: {
    环境音效: '',
    音乐: '',
    人声处理: ''
  },
  负面约束: '',
  原始字段: {}
};

const 内容字段模板 = {
  镜头编号: '',
  镜头类型: '内容',
  场景名称: '',
  主标题: '',
  副标题: '',
  台词: '',
  旁白: '',
  绑定定妆照: [],
  镜头时间轴: '',
  人物介绍卡片: [],
  时长: 0,
  人物列表: [],
  运镜: {
    描述: '',
    景别: '',
    运动: '',
    镜头参数: ''
  },
  灯光: {
    主光: '',
    补光: '',
    氛围光: '',
    描述: ''
  },
  动作: '',
  情绪阶段: '',
  嘴部动作: '',
  画面提示词: '',
  音频: {
    环境音效: '',
    音乐: '',
    人声处理: ''
  },
  负面约束: '',
  原始字段: {}
};

function 构建人物介绍卡片(rawShot = {}, charactersMap = {}) {
  const 人物列表 = 转数组(rawShot.characters || rawShot.人物列表 || []);
  return 人物列表.map((id) => {
    const c = charactersMap?.[id] || charactersMap?.[String(id).toLowerCase()] || {};
    const profile = c.profile || c;
    return {
      角色ID: id,
      角色名: 安全取(profile, ['name', '名称'], id),
      角色定位: 安全取(profile?.baseIdentity || profile, ['role', '角色'], ''),
      年龄: 安全取(profile?.baseIdentity || profile, ['age', '年龄'], ''),
      性别: 安全取(profile?.baseIdentity || profile, ['gender', '性别'], ''),
      外观特征: 安全取(profile?.visualIdentity || profile, ['distinguishingMarks', 'appearance', '外观特征'], '')
    };
  });
}

function 构建绑定定妆照(rawShot = {}, charactersMap = {}) {
  const out = [];
  const 人物列表 = 转数组(rawShot.characters || rawShot.人物列表 || []);
  const 已有 = Array.isArray(rawShot.referenceImages) ? rawShot.referenceImages : [];
  for (const ref of 已有) {
    out.push({
      角色ID: ref.character || ref.characterId || '',
      角度: ref.angle || '',
      路径: ref.image_url?.url || ref.url || ''
    });
  }

  for (const id of 人物列表) {
    const c = charactersMap?.[id] || {};
    // v6.6.3-fix: 优先从 portraitSets 读取实际路径
    if (c.portraitSets && typeof c.portraitSets === 'object') {
      for (const [style, setData] of Object.entries(c.portraitSets)) {
        const portraits = setData?.portraits || [];
        for (const p of portraits) {
          const 路径 = p?.file || p?.url || p?.path || '';
          if (路径 && !out.find(x => x.角色ID === id && x.路径 === 路径)) {
            out.push({
              角色ID: id,
              角度: p?.angle || p?.name || style,
              路径: 路径
            });
          }
        }
      }
    }
    // fallback: 旧格式 c.portraits 对象
    const portraits = c.portraits || {};
    for (const [角度, 路径] of Object.entries(portraits)) {
      if (!out.find(x => x.角色ID === id && x.路径 === 路径)) {
        out.push({ 角色ID: id, 角度, 路径 });
      }
    }
  }

  return out;
}

function 归一化镜头(rawShot = {}, options = {}) {
  const { charactersMap = {}, globalStartSec = 0, isOpening = false } = options;
  const base = 深拷贝(isOpening ? 片头字段模板 : 内容字段模板);

  const 时长 = Number(安全取(rawShot, ['duration', '时长'], 0)) || 0;
  const 镜头编号 = 安全取(rawShot, ['shotId', 'id', '镜头编号'], isOpening ? 'S00' : '');
  const 场景名称 = 安全取(rawShot, ['scene', '场景名称', 'name'], isOpening ? '片头-开场' : '');
  const 台词 = 安全取(rawShot, ['dialogue', '台词'], '');
  const 旁白 = 安全取(rawShot, ['narration', '旁白'], '');
  const 主标题 = 安全取(rawShot.title || {}, ['main', '主标题'], 安全取(rawShot, ['主标题'], ''));
  const 副标题 = 安全取(rawShot.title || {}, ['sub', '副标题'], 安全取(rawShot, ['副标题'], ''));

  base.镜头编号 = 镜头编号;
  base.镜头类型 = isOpening ? '片头' : '内容';
  base.场景名称 = 场景名称;
  base.主标题 = 主标题;
  base.副标题 = 副标题;
  base.台词 = 台词;
  base.旁白 = 旁白;
  base.时长 = 时长;
  base.人物列表 = 转数组(rawShot.characters || rawShot.人物列表 || []);
  base.镜头时间轴 = 安全取(
    rawShot,
    ['timelineString', '镜头时间轴'],
    格式化时间轴(globalStartSec, 时长)
  );

  base.人物介绍卡片 = 构建人物介绍卡片(rawShot, charactersMap);
  base.绑定定妆照 = 构建绑定定妆照(rawShot, charactersMap);

  base.运镜 = {
    描述: 安全取(rawShot.cameraMovement || rawShot.camera || {}, ['description', 'string', '描述'], 安全取(rawShot, ['cameraString'], '')),
    景别: 安全取(rawShot.camera || {}, ['shotSize', '景别'], ''),
    运动: 安全取(rawShot.camera || rawShot.cameraMovement || {}, ['movement', 'primaryMovement', '运动'], ''),
    镜头参数: 安全取(rawShot.camera || {}, ['lens', '镜头参数'], '')
  };

  base.灯光 = {
    主光: 安全取(rawShot.lighting?.keyLight || {}, ['effect', '主光'], ''),
    补光: 安全取(rawShot.lighting?.fillLight || {}, ['effect', '补光'], ''),
    氛围光: 安全取(rawShot.lighting || {}, ['special', '氛围光'], ''),
    描述: 安全取(rawShot, ['lightingString'], '')
  };

  base.画面提示词 = 安全取(rawShot, ['prompt', 'visualPrompt', '画面提示词'], '');
  base.音频 = {
    环境音效: 安全取(rawShot.backgroundSound || {}, ['ambient', '环境音效'], ''),
    音乐: 安全取(rawShot.audioLayer || {}, ['string', '音乐'], ''),
    人声处理: 安全取(rawShot, ['mouthAction', '嘴部动作'], '')
  };
  base.负面约束 = 安全取(rawShot, ['negativePrompt', '负面约束'], '');

  if (!isOpening) {
    base.动作 = 安全取(rawShot, ['action', '动作'], '');
    base.情绪阶段 = 安全取(rawShot, ['emotionPhase', '情绪阶段'], '');
    base.嘴部动作 = 安全取(rawShot, ['mouthAction', 'mouth_action', '嘴部动作'], '');
  }

  base.原始字段 = 深拷贝(rawShot);
  return base;
}

function 校验镜头字段(shotZh) {
  const errors = [];
  const warnings = [];

  if (!是非空字符串(shotZh.镜头编号)) errors.push('缺少【镜头编号】');
  if (!是非空字符串(shotZh.场景名称)) errors.push('缺少【场景名称】');
  if (typeof shotZh.时长 !== 'number' || shotZh.时长 <= 0) errors.push('缺少或非法【时长】');
  if (!是非空字符串(shotZh.镜头时间轴)) errors.push('缺少【镜头时间轴】');
  if (!Array.isArray(shotZh.绑定定妆照)) errors.push('缺少【绑定定妆照】');
  if (!Array.isArray(shotZh.人物介绍卡片)) errors.push('缺少【人物介绍卡片】');

  if (shotZh.镜头类型 === '片头') {
    if (!是非空字符串(shotZh.主标题)) errors.push('片头缺少【主标题】');
    if (!('副标题' in shotZh)) errors.push('片头缺少【副标题】字段');
    if (!('台词' in shotZh)) errors.push('片头缺少【台词】字段');
  } else {
    if (!('台词' in shotZh)) errors.push('内容镜头缺少【台词】字段');
    if (!('动作' in shotZh)) errors.push('内容镜头缺少【动作】字段');
    if (!('嘴部动作' in shotZh)) warnings.push('内容镜头缺少【嘴部动作】');
  }

  if (!是非空字符串(shotZh.画面提示词)) warnings.push('缺少【画面提示词】');
  if ((shotZh.人物列表 || []).length > 0 && (shotZh.绑定定妆照 || []).length === 0) {
    warnings.push('存在人物但【绑定定妆照】为空');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function 修复镜头字段(shotZh, options = {}) {
  const fixed = 深拷贝(shotZh);
  const {
    默认主标题 = '',
    默认副标题 = '',
    默认台词 = '',
    默认场景名称 = '未命名场景'
  } = options;

  if (!是非空字符串(fixed.场景名称)) fixed.场景名称 = 默认场景名称;
  if (!是非空字符串(fixed.镜头时间轴)) fixed.镜头时间轴 = 格式化时间轴(0, fixed.时长 || 0);
  if (!Array.isArray(fixed.绑定定妆照)) fixed.绑定定妆照 = [];
  if (!Array.isArray(fixed.人物介绍卡片)) fixed.人物介绍卡片 = [];
  if (!Array.isArray(fixed.人物列表)) fixed.人物列表 = [];

  if (fixed.镜头类型 === '片头') {
    if (!是非空字符串(fixed.主标题)) fixed.主标题 = 默认主标题;
    if (!('副标题' in fixed) || fixed.副标题 == null) fixed.副标题 = 默认副标题;
    if (!('台词' in fixed) || fixed.台词 == null) fixed.台词 = 默认台词;
  } else {
    if (!('台词' in fixed) || fixed.台词 == null) fixed.台词 = 默认台词;
    if (!('动作' in fixed) || fixed.动作 == null) fixed.动作 = '';
    if (!('嘴部动作' in fixed) || fixed.嘴部动作 == null) fixed.嘴部动作 = '';
  }

  return fixed;
}

function 归一化全片镜头({ openingShot, contentShots = [], charactersMap = {}, defaultTitle = '', defaultSubtitle = '' }) {
  const normalized = [];
  let current = 0;

  if (openingShot) {
    let s00 = 归一化镜头(openingShot, {
      charactersMap,
      globalStartSec: current,
      isOpening: true
    });
    s00 = 修复镜头字段(s00, {
      默认主标题: defaultTitle,
      默认副标题: defaultSubtitle,
      默认台词: ''
    });
    normalized.push(s00);
    current += Number(s00.时长 || 0);
  }

  for (const shot of contentShots) {
    let s = 归一化镜头(shot, {
      charactersMap,
      globalStartSec: current,
      isOpening: false
    });
    s = 修复镜头字段(s, {
      默认台词: '',
      默认场景名称: '内容镜头'
    });
    normalized.push(s);
    current += Number(s.时长 || 0);
  }

  return normalized;
}

module.exports = {
  片头字段模板,
  内容字段模板,
  归一化镜头,
  校验镜头字段,
  修复镜头字段,
  归一化全片镜头
};

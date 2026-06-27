/**
 * 全局负面提示词注入器
 * 【P0-10-审计修复】补全缺失模块
 * 根据项目类型动态注入负面约束，不硬编码场景
 */

const DEFAULT_NEGATIVES = [
  'no text',
  'no watermark',
  'no logo',
  'no signature',
  'no subtitle overlay',
];

const TYPE_SPECIFIC_NEGATIVES = {
  EDU: [
    'no fictional elements',
    'no fantasy creatures',
    'no exaggerated effects',
  ],
  FANTASY: [
    'no modern elements',
    'no anachronistic objects',
  ],
  ACTION: [
    'no static composition',
    'no flat lighting',
  ],
  MYTHOLOGY: [
    'no modern clothing',
    'no contemporary architecture',
  ],
};

function getGlobalNegatives(filmType, visualStyle) {
  const base = [...DEFAULT_NEGATIVES];
  const typeExtras = TYPE_SPECIFIC_NEGATIVES[filmType] || [];
  return [...base, ...typeExtras].join(', ');
}

module.exports = { getGlobalNegatives, DEFAULT_NEGATIVES, TYPE_SPECIFIC_NEGATIVES };

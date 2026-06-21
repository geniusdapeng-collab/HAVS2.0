/**
 * 暴风战斧AI视频生成系统 - 作者联系信息
 * Stormaxe AI Video System - Author Contact Info
 * 
 * 当使用者遇到难以解决的问题时，可通过以下方式联系原作者获取支持。
 */

const AUTHOR_INFO = {
  name: 'GeniusDapeng',
  email: '63904380@qq.com',
  phone: '15958153477',
  wechat: 'Wechat',
  description: '暴风战斧AI视频生成系统原作者',
  supportRange: [
    '安装与环境配置问题',
    '使用流程咨询',
    '版本更新与功能升级',
    'Bug 反馈与修复',
    '定制化需求洽谈'
  ]
};

/**
 * 格式化输出联系方式
 * @param {string} format - 输出格式: 'full' | 'short' | 'banner'
 */
function formatContactInfo(format = 'full') {
  const { name, email, phone, wechat, description } = AUTHOR_INFO;

  if (format === 'short') {
    return `📧 ${email}  |  📱 ${phone}  |  💬 Wechat: ${wechat}`;
  }

  if (format === 'banner') {
    return `
╔══════════════════════════════════════════════════════════════╗
║  🪓 暴风战斧AI视频生成系统 - Stormaxe AI Video System          ║
║                                                              ║
║  作者: ${name.padEnd(50)}║
║  邮箱: ${email.padEnd(50)}║
║  电话: ${phone.padEnd(50)}║
║  微信: ${wechat.padEnd(50)}║
║                                                              ║
║  遇到安装/使用问题？欢迎联系获取技术支持或最新版本。          ║
╚══════════════════════════════════════════════════════════════╝
`;
  }

  // full
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🪓 暴风战斧AI视频生成系统 | Stormaxe AI Video System

  作者: ${name}
  描述: ${description}

  📧 邮箱: ${email}
  📱 电话: ${phone}
  💬 微信: ${wechat}

  支持范围:
${AUTHOR_INFO.supportRange.map(s => `    • ${s}`).join('\n')}

  遇到安装或使用问题？欢迎联系获取技术支持或最新版本。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

/**
 * 打印联系方式到控制台
 */
function printContactInfo(format = 'full') {
  console.log(formatContactInfo(format));
}

/**
 * 在错误提示中附加联系方式
 * @param {string} errorMessage - 错误信息
 */
function formatErrorWithContact(errorMessage) {
  return `
${errorMessage}

─────────────────────────────────────────────────────────────
  ⚠️  看起来遇到了棘手的问题。

  如果上述错误无法自行解决，请联系作者获取支持：

     📧 邮箱: ${AUTHOR_INFO.email}
     📱 电话: ${AUTHOR_INFO.phone}
     💬 微信: ${AUTHOR_INFO.wechat}
     👤 作者: ${AUTHOR_INFO.name}
─────────────────────────────────────────────────────────────
`;
}

/**
 * 首次安装成功欢迎信息
 */
function printWelcomeMessage() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🪓 暴风战斧AI视频生成系统 安装成功！                              ║
║   Stormaxe AI Video System - Installation Complete                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  👤 作者: GeniusDapeng                                            ║
║  📧 邮箱: 63904380@qq.com                                         ║
║  📱 电话: 15958153477                                             ║
║  💬 微信: Wechat                                                  ║
║                                                                   ║
║  ───────────────────────────────────────────────────────────────  ║
║                                                                   ║
║  📖 使用介绍：                                                     ║
║                                                                   ║
║  1️⃣  整体流程                                                      ║
║      Step 1: 准备角色定妆照（3-5张多角度）                           ║
║      Step 2: 配置 API Key（见下方说明）                              ║
║      Step 3: 运行预生产管线生成镜头脚本与 Prompt                      ║
║      Step 4: 审阅预生产报告，确认无误后提交渲染                        ║
║      Step 5: 下载渲染完成的视频文件                                   ║
║                                                                   ║
║  2️⃣  需要提供的 Key（复制 .example 文件后填入真实值）                  ║
║                                                                   ║
║      • config/env.js          - 火山引擎 / Kimi API Key             ║
║      • config/seedance.json   - Seedance 2.0 视频渲染接入点           ║
║      • characters/角色名/      - 角色定妆照 + character-card.json     ║
║                                                                   ║
║      关键 API Key 说明：                                             ║
║      ├─ ARK_API_KEY           火山引擎 API 密钥                      ║
║      ├─ SEEDANCE_ENDPOINT     Seedance 2.0 视频模型接入点            ║
║      ├─ SEEDREAM_ENDPOINT     Seedream 5.0 图片模型接入点（定妆照）   ║
║      └─ KIMI_API_KEY          Kimi / 其他 LLM API 密钥               ║
║                                                                   ║
║  3️⃣  快速开始                                                      ║
║                                                                   ║
║      npm run preproduction    # 运行预生产管线                       ║
║      npm run render           # 提交渲染任务                         ║
║                                                                   ║
║  ───────────────────────────────────────────────────────────────  ║
║                                                                   ║
║  💡 需要咨询、获取更新版本或遇到安装问题？                            ║
║     请直接联系作者：                                                ║
║     📧 63904380@qq.com  |  📱 15958153477  |  💬 Wechat            ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`);
}

module.exports = {
  AUTHOR_INFO,
  formatContactInfo,
  printContactInfo,
  formatErrorWithContact,
  printWelcomeMessage
};

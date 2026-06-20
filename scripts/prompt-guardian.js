// prompt-guardian.js v2.1.1
// Seedance 2.0 API - Prompt 自动修复层
// 职责：在构建 Payload 前自动修复 Prompt 内容，确保定妆照生效

class PromptGuardian {
  constructor(options = {}) {
    this.rules = options.rules || this._buildDefaultRules();
    this.logFixes = options.logFixes !== false; // 默认记录修复
    this.fixes = [];
  }

  _buildDefaultRules() {
    return [
      {
        id: 'costume_lock',
        name: '服装锁定检查',
        priority: 100,
        check: (prompt, chars) => {
          for (const char of chars) {
            if (char.role === '警察' || char.role === 'police' || char.tags?.includes('police')) {
              if (!prompt.includes('穿警服的') && !prompt.includes('身穿警服') && !prompt.includes('身着警服')) {
                return {
                  hit: true,
                  message: `角色"${char.name}"是警察，但Prompt未锁定服装`,
                  fix: `在角色描述前添加"穿警服的${char.name}"或"${char.name}身穿警用制服"`
                };
              }
            }
          }
          return { hit: false };
        },
        apply: (prompt, chars) => {
          let fixed = prompt;
          for (const char of chars) {
            if (char.role === '警察' || char.role === 'police' || char.tags?.includes('police')) {
              const name = char.name;
              // 在角色名首次出现的位置前插入服装锁定
              const regex = new RegExp(`(?<!穿警服的|身穿警服的|身着警服的)${name}`, 'g');
              fixed = fixed.replace(regex, `穿警服的${name}`);
            }
          }
          return fixed;
        }
      },
      {
        id: 'appearance_anchor',
        name: '外观锚定检查',
        priority: 90,
        check: (prompt, chars) => {
          for (const char of chars) {
            if (char.role === '警察' || char.role === 'police' || char.tags?.includes('police')) {
              const hasCostume = prompt.includes('警服') || prompt.includes('制服');
              const hasAnchor = prompt.includes('警帽') || prompt.includes('警徽') || prompt.includes('肩章');
              if (hasCostume && !hasAnchor) {
                return {
                  hit: true,
                  message: `Prompt有警服但缺少标志性配饰描述（警帽、警徽、肩章）`,
                  fix: `添加"佩戴警帽、警徽、肩章"等外观锚定描述`
                };
              }
            }
          }
          return { hit: false };
        },
        apply: (prompt, chars) => {
          let fixed = prompt;
          for (const char of chars) {
            if (char.role === '警察' || char.role === 'police' || char.tags?.includes('police')) {
              // 在警服描述附近添加配饰锚定
              const anchorText = '，佩戴警帽、警徽、肩章，左胸佩戴警号';
              fixed = fixed.replace(/(警服|制服)([^，。；！]|$)/g, `$1${anchorText}$2`);
            }
          }
          return fixed;
        }
      },
      {
        id: 'reference_format',
        name: '引用格式修正',
        priority: 80,
        check: (prompt) => {
          if (/@image\d|@Image\d/.test(prompt)) {
            return {
              hit: true,
              message: `Prompt使用@imageN格式，应为"图片N"`,
              fix: `将@image1替换为"图片1"`
            };
          }
          return { hit: false };
        },
        apply: (prompt) => {
          return prompt.replace(/@image(\d)/gi, '图片$1').replace(/@Image(\d)/gi, '图片$1');
        }
      },
      {
        id: 'dialogue_cleanse',
        name: '台词净化',
        priority: 70,
        check: (prompt) => {
          if (/\|/.test(prompt)) {
            return {
              hit: true,
              message: `Prompt包含竖杠|，会干扰音频生成`,
              fix: `将|替换为逗号或句号`
            };
          }
          return { hit: false };
        },
        apply: (prompt) => {
          return prompt.replace(/\|/g, '，');
        }
      },
      {
        id: 'sensitive_words',
        name: '敏感词过滤',
        priority: 60,
        check: (prompt) => {
          const sensitiveMap = {
            '痛苦': '不适',
            '受伤': '受影响',
            '血汗': '体液',
            '死亡': '严重',
            '流血': '渗出',
            '残废': '功能障碍',
            '折磨': '困扰',
            '剧痛': '明显不适'
          };
          const found = [];
          for (const [bad, good] of Object.entries(sensitiveMap)) {
            if (prompt.includes(bad)) {
              found.push({ bad, good });
            }
          }
          if (found.length > 0) {
            return {
              hit: true,
              message: `Prompt包含敏感词：${found.map(f => f.bad).join('、')}`,
              fix: `替换为：${found.map(f => `${f.bad}→${f.good}`).join('，')}`
            };
          }
          return { hit: false };
        },
        apply: (prompt) => {
          const sensitiveMap = {
            '痛苦': '不适',
            '受伤': '受影响',
            '血汗': '体液',
            '死亡': '严重',
            '流血': '渗出',
            '残废': '功能障碍',
            '折磨': '困扰',
            '剧痛': '明显不适'
          };
          let fixed = prompt;
          for (const [bad, good] of Object.entries(sensitiveMap)) {
            fixed = fixed.replace(new RegExp(bad, 'g'), good);
          }
          return fixed;
        }
      },
      {
        id: 'prompt_length',
        name: 'Prompt长度检查',
        priority: 50,
        check: (prompt) => {
          if (prompt.length > 1500) {
            return {
              hit: true,
              message: `Prompt长度${prompt.length}超过1500字符限制`,
              fix: `精简Prompt至1500字符以内`
            };
          }
          return { hit: false };
        },
        apply: (prompt) => {
          // 超过1500字符时，截断并添加警告
          if (prompt.length > 1500) {
            return prompt.substring(0, 1500) + '...[已截断]';
          }
          return prompt;
        }
      }
    ];
  }

  // 自动修复入口
  autoFix(prompt, characters = []) {
    this.fixes = [];
    let fixed = prompt;
    let safe = true;

    // 按优先级排序
    const sortedRules = [...this.rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      try {
        const check = rule.check(fixed, characters);
        if (check.hit) {
          const before = fixed;
          fixed = rule.apply(fixed, characters);
          const after = fixed;
          
          const fixRecord = {
            ruleId: rule.id,
            ruleName: rule.name,
            message: check.message,
            fix: check.fix,
            changed: before !== after,
            before: before.substring(0, 100) + (before.length > 100 ? '...' : ''),
            after: after.substring(0, 100) + (after.length > 100 ? '...' : '')
          };
          
          this.fixes.push(fixRecord);
          
          if (this.logFixes) {
            console.log(`[PromptGuardian] 🔧 ${rule.name}: ${check.message}`);
          }

          // 长度检查失败视为不安全
          if (rule.id === 'prompt_length' && check.hit) {
            safe = false;
          }
        }
      } catch (err) {
        console.error(`[PromptGuardian] ⚠️ 规则"${rule.name}"执行失败: ${err.message}`);
      }
    }

    return {
      prompt: fixed,
      fixes: this.fixes,
      safe,
      changed: this.fixes.some(f => f.changed)
    };
  }

  // 生成外观锚定文本（从角色卡片）
  generateAppearanceAnchor(characters) {
    const anchors = [];
    for (const char of characters) {
      if (char.visual?.outfit) {
        anchors.push(`${char.name}身穿${char.visual.outfit}`);
      }
      if (char.visual?.accessories) {
        anchors.push(`佩戴${char.visual.accessories.join('、')}`);
      }
      if (char.tags?.includes('police')) {
        anchors.push('佩戴警帽、警徽、肩章，左胸佩戴警号');
      }
    }
    return anchors.join('，');
  }
}

module.exports = { PromptGuardian };

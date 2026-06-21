// render-qa-checker.js v1.0
// Seedance 2.0 API - 渲染结果QA检查（简化版）
// 职责：基于文本和元数据对渲染提交做质量检查

class RenderQAChecker {
  constructor(options = {}) {
    this.strict = options.strict !== false;
    this.checks = options.checks || this._buildDefaultChecks();
  }

  _buildDefaultChecks() {
    return [
      {
        id: 'SCENE_SPECIFICITY',
        name: '场景特异性检查',
        type: 'error',
        check: (payload, context) => {
          const text = this._extractPromptText(payload);
          const sceneMatch = text.match(/【场景】([^【\n]+)/);
          
          if (!sceneMatch) {
            return { pass: true, warning: 'Prompt中未找到【场景】字段' };
          }
          
          const sceneValue = sceneMatch[1].trim();
          
          // 检查场景是否过于通用（模板化）
          const genericPatterns = [
            /golden\s+hour.*clear\s+sky.*atmospheric/i,
            /clear\s+sky.*atmospheric\s+haze.*depth/i,
            /golden\s+hour.*warm\s+sunlight.*long\s+shadows/i,
            /^[a-z\s,\-]+$/i // 纯英文场景（教育片应为中文）
          ];
          
          for (const pattern of genericPatterns) {
            if (pattern.test(sceneValue)) {
              return {
                pass: false,
                message: `【场景】字段疑似通用模板："${sceneValue.substring(0,40)}..."，应为镜头特异性描述`
              };
            }
          }
          
          // 检查场景长度
          if (sceneValue.length < 10) {
            return {
              pass: false,
              message: `【场景】字段过短（${sceneValue.length}字符），描述不足`
            };
          }
          
          // 检查跨镜头重复（如果上下文提供其他镜头）
          const otherScenes = context?.otherScenes || [];
          if (otherScenes.length > 0) {
            const duplicateCount = otherScenes.filter(s => 
              s.toLowerCase().replace(/\s+/g, '') === sceneValue.toLowerCase().replace(/\s+/g, '')
            ).length;
            if (duplicateCount > 0) {
              return {
                pass: false,
                message: `【场景】与${duplicateCount}个其他镜头完全相同，缺乏差异化`
              };
            }
          }
          
          return { pass: true, message: '场景描述具有特异性' };
        }
      },
      {
        id: 'SCENE_LANGUAGE',
        name: '场景语言检查',
        type: 'warning',
        check: (payload) => {
          const text = this._extractPromptText(payload);
          const sceneMatch = text.match(/【场景】([^【\n]+)/);
          
          if (!sceneMatch) return { pass: true, message: '无场景字段' };
          
          const sceneValue = sceneMatch[1].trim();
          // 检查是否全英文（中文项目应为中文场景）
          const isEnglish = /^[a-zA-Z\s,\-]+$/.test(sceneValue);
          if (isEnglish) {
            return {
              pass: true,
              warning: `【场景】字段为纯英文描述："${sceneValue.substring(0,30)}..."，中文项目建议使用中中文场景描述`
            };
          }
          
          return { pass: true, message: '场景语言正确' };
        }
      },
      {
        id: 'CHARACTER_NAME',
        name: '角色名出现检查',
        type: 'error',
        check: (payload, context) => {
          const text = this._extractPromptText(payload);
          const characters = context.characters || [];
          
          for (const char of characters) {
            const name = char.name || char;
            if (!text.includes(name)) {
              return {
                pass: false,
                message: `Prompt中未出现角色名"${name}"，可能导致角色错位`
              };
            }
          }
          return { pass: true, message: '角色名已确认' };
        }
      },
      {
        id: 'COSTUME_LOCKED',
        name: '服装锁定检查',
        type: 'error',
        check: (payload, context) => {
          const text = this._extractPromptText(payload);
          const characters = context.characters || [];
          
          for (const char of characters) {
            const role = char.role || '';
            if (role.includes('警察') || role.includes('警服')) {
              if (!text.includes('警服') && !text.includes('制服')) {
                return {
                  pass: false,
                  message: `警察角色"${char.name}"的Prompt未锁定警服/制服`
                };
              }
            }
          }
          return { pass: true, message: '服装已锁定' };
        }
      },
      {
        id: 'SENSITIVE_WORDS',
        name: '敏感词残留检查',
        type: 'error',
        check: (payload) => {
          const text = this._extractPromptText(payload);
          const sensitive = ['痛苦', '受伤', '血汗', '死亡', '流血', '残废', '折磨', '剧痛'];
          const found = sensitive.filter(w => text.includes(w));
          
          if (found.length > 0) {
            return {
              pass: false,
              message: `Prompt仍包含敏感词：${found.join('、')}`
            };
          }
          return { pass: true, message: '无敏感词' };
        }
      },
      {
        id: 'DURATION_REASONABLE',
        name: '时长合理性检查',
        type: 'warning',
        check: (payload) => {
          const duration = payload.duration;
          if (!duration) return { pass: true, message: '无时長参数' };
          
          if (duration < 3) {
            return { pass: true, warning: `时长仅${duration}秒，可能过短` };
          }
          if (duration > 15) {
            return { pass: true, warning: `时长${duration}秒超过Seedance单段限制15秒，需Extend分段` };
          }
          return { pass: true, message: `时长${duration}秒合理` };
        }
      },
      {
        id: 'PROMPT_TOO_SHORT',
        name: 'Prompt长度检查',
        type: 'warning',
        check: (payload) => {
          const text = this._extractPromptText(payload);
          if (text.length < 100) {
            return { pass: true, warning: `Prompt仅${text.length}字符，描述可能过于简略` };
          }
          if (text.length > 1200) {
            return { pass: true, warning: `Prompt${text.length}字符，接近1500上限` };
          }
          return { pass: true, message: `Prompt长度${text.length}适中` };
        }
      },
      {
        id: 'REFERENCE_IMAGE_COUNT',
        name: '定妆照数量检查',
        type: 'warning',
        check: (payload) => {
          const images = (payload.content || []).filter(c => c.type === 'image_url' && c.role === 'reference_image');
          if (images.length === 0) {
            return { pass: true, warning: '无定妆照，角色一致性风险高' };
          }
          if (images.length < 3) {
            return { pass: true, warning: `仅${images.length}张定妆照，建议3-5张多角度` };
          }
          return { pass: true, message: `已绑定${images.length}张定妆照` };
        }
      },
      {
        id: 'GENERATE_AUDIO_SET',
        name: '台词音频检查',
        type: 'warning',
        check: (payload) => {
          const text = this._extractPromptText(payload);
          const hasDialogue = /[\u201c\u201d\"\"].*[\u201c\u201d\"\"]/.test(text) || /说[：:]/.test(text);
          const hasAudio = payload.generate_audio === true;
          
          if (hasDialogue && !hasAudio) {
            return { pass: true, warning: 'Prompt含台词但未设置generate_audio' };
          }
          if (!hasDialogue && hasAudio) {
            return { pass: true, warning: '设置了generate_audio但Prompt无明显台词' };
          }
          return { pass: true, message: hasDialogue ? '台词音频配置正确' : '无台词' };
        }
      }
    ];
  }

  _extractPromptText(payload) {
    return (payload.content || [])
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('');
  }

  // 执行QA检查
  check(payload, context = {}) {
    const errors = [];
    const warnings = [];
    let pass = true;

    for (const check of this.checks) {
      try {
        const result = check.check(payload, context);
        
        if (!result.pass) {
          errors.push({
            id: check.id,
            name: check.name,
            type: check.type,
            message: result.message
          });
          pass = false;
        } else if (result.warning) {
          warnings.push({
            id: check.id,
            name: check.name,
            type: 'warning',
            message: result.warning
          });
        }
      } catch (err) {
        console.error(`[RenderQAChecker] ⚠️ 检查"${check.name}"异常: ${err.message}`);
      }
    }

    return { pass, errors, warnings };
  }

  // 生成QA报告
  generateReport(payload, context = {}) {
    const result = this.check(payload, context);
    
    let report = '## 渲染QA检查报告\n\n';
    
    if (result.errors.length > 0) {
      report += '### ❌ 错误（必须修复）\n';
      for (const e of result.errors) {
        report += `- **${e.name}**: ${e.message}\n`;
      }
      report += '\n';
    }
    
    if (result.warnings.length > 0) {
      report += '### ⚠️ 警告（建议优化）\n';
      for (const w of result.warnings) {
        report += `- **${w.name}**: ${w.message}\n`;
      }
      report += '\n';
    }
    
    if (result.errors.length === 0 && result.warnings.length === 0) {
      report += '✅ **所有检查通过**\n';
    }
    
    return { report, ...result };
  }
}

module.exports = { RenderQAChecker };

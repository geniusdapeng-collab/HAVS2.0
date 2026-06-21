// render-pipeline-guard.js v1.1
// Seedance 2.0 API - 渲染提交强制检查层
// 职责：在提交API前进行强制检查，不通过则阻止提交
// v1.1升级: 新增场景多样性检查、场景模板化检查，修复引用格式检查（支持@imageN）

class RenderPipelineGuard {
  constructor(options = {}) {
    this.strict = options.strict !== false; // 默认严格模式
    this.logChecks = options.logChecks !== false;
    this.customChecks = options.customChecks || [];
    this.context = options.context || {}; // 跨镜头上下文
  }

  // 完整检查清单
  getCheckList() {
    return [
      // ===== 场景检查（新增）=====
      {
        id: 'SCENE_DIVERSITY',
        type: 'error',
        name: '场景多样性检查（跨镜头）',
        check: (payload) => {
          // 从上下文中获取所有镜头的场景
          const allScenes = this.context?.allScenes || [];
          if (allScenes.length < 2) return { pass: true, message: '单镜头项目，无需检查' };
          
          // 提取当前payload的场景
          const textContent = (payload.content || [])
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');
          const currentSceneMatch = textContent.match(/【场景】([^【\n]+)/);
          const currentScene = currentSceneMatch ? currentSceneMatch[1].trim() : '';
          
          if (!currentScene) return { pass: true, message: '当前镜头无场景字段' };
          
          // 统计各场景出现次数
          const sceneCounts = {};
          for (const scene of allScenes) {
            const normalized = scene?.toLowerCase()?.replace(/\s+/g, '')?.trim() || '';
            if (normalized.length > 5) { // 忽略过短场景
              sceneCounts[normalized] = (sceneCounts[normalized] || 0) + 1;
            }
          }
          
          const currentNormalized = currentScene.toLowerCase().replace(/\s+/g, '').trim();
          const currentCount = sceneCounts[currentNormalized] || 0;
          const totalScenes = allScenes.length;
          
          // 如果当前场景出现超过50%的镜头，报错
          if (currentCount > totalScenes * 0.5) {
            return { 
              pass: false, 
              message: `场景重复率过高：当前场景"${currentScene.substring(0,40)}..."出现在${currentCount}/${totalScenes}个镜头中，超过50%。各镜头应有差异化场景描述。` 
            };
          }
          
          return { pass: true, message: '场景多样性正常' };
        }
      },
      {
        id: 'SCENE_TEMPLATE_CHECK',
        type: 'error',
        name: '场景模板化检查',
        check: (payload) => {
          const textContent = (payload.content || [])
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');
          
          // 检查已知的问题场景模板（硬编码的通用英文场景）
          const bannedTemplates = [
            'golden hour,clear sky,atmospheric haze,depth layers,foreground to background',
            'golden hour, clear sky, atmospheric haze, depth layers, foreground to background',
            'golden hour, warm sunlight, long shadows',
            'blue hour, cool twilight, soft gradients',
            'golden hour,clear sky,atmospheric haze',
            'clear sky,atmospheric haze,depth layers'
          ];
          
          const textLower = textContent.toLowerCase().replace(/\s+/g, ' ').trim();
          for (const template of bannedTemplates) {
            if (textLower.includes(template.toLowerCase())) {
              return { 
                pass: false, 
                message: `Prompt包含已知的问题场景模板："${template.substring(0,50)}..."` 
              };
            }
          }
          
          // 检查【场景】字段是否包含英文通用模板（教育片应为中文场景描述）
          const sceneMatch = textContent.match(/【场景】([^【\n]+)/);
          if (sceneMatch) {
            const sceneValue = sceneMatch[1].trim();
            // 如果场景值全英文且包含常见模板词，视为模板化
            const isEnglish = /^[a-zA-Z\s,\-]+$/.test(sceneValue);
            const hasTemplateWords = /\b(golden|hour|blue|atmospheric|haze|depth|layers|foreground|background|warm|cool|twilight|gradients)\b/i.test(sceneValue);
            if (isEnglish && hasTemplateWords) {
              return { 
                pass: false, 
                message: `【场景】字段疑似模板化英文描述："${sceneValue.substring(0,50)}..."（教育片场景应为中文）` 
              };
            }
            // 检查场景是否过于简短（小于10字符）
            if (sceneValue.length < 10) {
              return { 
                pass: false, 
                message: `【场景】字段过短（${sceneValue.length}字符），场景描述应具体丰富` 
              };
            }
          }
          
          return { pass: true, message: '场景描述无模板化问题' };
        }
      },
      // ===== 原有检查 =====
      {
        id: 'REF_IMAGE_ROLE',
        type: 'error',
        name: '定妆照角色绑定',
        check: (payload) => {
          const images = (payload.content || []).filter(c => c.type === 'image_url');
          if (images.length === 0) return { pass: true, message: '无图片引用' };
          
          const hasRole = images.every(img => img.role === 'reference_image');
          if (!hasRole) {
            return { 
              pass: false, 
              message: `image_url未指定role:"reference_image"，当前role=${images[0].role || 'undefined'}` 
            };
          }
          return { pass: true, message: '所有图片已绑定reference_image' };
        }
      },
      {
        id: 'GENERATE_AUDIO',
        type: 'error',
        name: '台词音频生成',
        check: (payload) => {
          const hasDialogue = (payload.content || []).some(c => {
            if (c.type !== 'text') return false;
            // 检查是否有台词引号或对话标记
            return /[\u201c\u201d\"\"].*[\u201c\u201d\"\"]/.test(c.text) || /说[：:]/.test(c.text);
          });
          
          if (hasDialogue && payload.generate_audio !== true) {
            return { 
              pass: false, 
              message: `Prompt包含台词但未设置generate_audio:true` 
            };
          }
          return { pass: true, message: hasDialogue ? '已设置generate_audio' : '无台词' };
        }
      },
      {
        id: 'COSTUME_LOCK',
        type: 'error',
        name: '服装锁定检查',
        check: (payload) => {
          const textContent = (payload.content || [])
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');
          
          // 检查是否有角色但未锁定服装
          const hasPolice = /警察|警官|警服|警帽|警徽/.test(textContent);
          const hasCostumeLock = /穿警服的|身穿警服|身着警服|穿着.*制服/.test(textContent);
          
          if (hasPolice && !hasCostumeLock) {
            return { 
              pass: false, 
              message: `Prompt涉及警察角色但未明确锁定服装（缺少"穿警服的"等描述）` 
            };
          }
          return { pass: true, message: hasPolice ? '已锁定服装' : '无警察角色' };
        }
      },
      {
        id: 'DIALOGUE_FORMAT',
        type: 'error',
        name: '台词格式检查',
        check: (payload) => {
          const textContent = (payload.content || [])
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');
          
          if (/\|/.test(textContent)) {
            return { 
              pass: false, 
              message: `Prompt包含竖杠|，会干扰音频生成` 
            };
          }
          return { pass: true, message: '无竖杠' };
        }
      },
      {
        id: 'SENSITIVE_WORDS',
        type: 'error',
        name: '敏感词检查',
        check: (payload) => {
          const textContent = (payload.content || [])
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');
          
          const sensitiveWords = ['痛苦', '受伤', '血汗', '死亡', '流血', '残废', '折磨', '剧痛'];
          const found = sensitiveWords.filter(w => textContent.includes(w));
          
          if (found.length > 0) {
            return { 
              pass: false, 
              message: `Prompt包含敏感词：${found.join('、')}` 
            };
          }
          return { pass: true, message: '无敏感词' };
        }
      },
      {
        id: 'REFERENCE_FORMAT',
        type: 'error',
        name: '引用格式检查',
        check: (payload) => {
          const textContent = (payload.content || [])
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');
          
          // v1.1-fix: Seedance 官方规范要求 @imageN 格式（纯小写，纯数字）
          // 错误：使用 图片N 或 @ImageN（大写I）
          // 正确：@image1, @image2 等
          if (/\b图片\d+\b/.test(textContent)) {
            return { 
              pass: false, 
              message: `使用"图片N"格式，应为"@imageN"（Seedance官方规范：小写@image+纯数字）` 
            };
          }
          if (/\b@Image\d+\b/.test(textContent)) {
            return { 
              pass: false, 
              message: `使用"@ImageN"格式（大写I），应为"@imageN"（Seedance官方规范：小写）` 
            };
          }
          return { pass: true, message: '引用格式符合Seedance规范' };
        }
      },
      {
        id: 'PROMPT_LENGTH',
        type: 'error',
        name: 'Prompt长度检查',
        check: (payload) => {
          const textContent = (payload.content || [])
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');
          
          if (textContent.length > 1500) {
            return { 
              pass: false, 
              message: `Prompt长度${textContent.length}超过1500字符限制` 
            };
          }
          return { pass: true, message: `长度${textContent.length}符合要求` };
        }
      },
      {
        id: 'IMAGE_FILE_VALID',
        type: 'error',
        name: '图片文件有效性',
        check: (payload) => {
          const images = (payload.content || []).filter(c => c.type === 'image_url');
          
          for (const img of images) {
            const url = img.image_url?.url || '';
            if (!url) {
              return { pass: false, message: 'image_url.url为空' };
            }
            // 检查base64数据完整性
            if (url.startsWith('data:image')) {
              const base64Data = url.split(',')[1];
              if (!base64Data || base64Data.length < 100) {
                return { pass: false, message: 'base64图片数据不完整或过小' };
              }
              // 检查base64字符合法性
              if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
                return { pass: false, message: 'base64数据包含非法字符' };
              }
            }
          }
          return { pass: true, message: `图片文件有效` };
        }
      },
      {
        id: 'REF_IMAGE_COUNT',
        type: 'warning',
        name: '定妆照数量建议',
        check: (payload) => {
          const images = (payload.content || []).filter(c => c.type === 'image_url' && c.role === 'reference_image');
          
          if (images.length > 0 && images.length < 3) {
            return { 
              pass: true, 
              warning: `只上传了${images.length}张定妆照，建议至少3-5张多角度（正面、45°、侧面、特写）` 
            };
          }
          if (images.length >= 3) {
            return { pass: true, message: `已上传${images.length}张定妆照` };
          }
          return { pass: true, message: '无定妆照' };
        }
      },
      {
        id: 'APPEARANCE_ANCHOR',
        type: 'warning',
        name: '外观锚定建议',
        check: (payload) => {
          const textContent = (payload.content || [])
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');
          
          const hasCostume = /警服|制服/.test(textContent);
          const hasAnchor = /警帽|警徽|肩章|配饰|标志/.test(textContent);
          
          if (hasCostume && !hasAnchor) {
            return { 
              pass: true, 
              warning: `Prompt有服装描述但缺少标志性配饰（警帽、警徽、肩章等），建议添加外观锚定描述` 
            };
          }
          return { pass: true, message: '外观锚定描述充足' };
        }
      }
    ];
  }

  // 执行检查（支持上下文）
  check(payload) {
    const checks = this.getCheckList();
    const errors = [];
    const warnings = [];
    let pass = true;

    for (const check of checks) {
      try {
        const result = check.check(payload);
        
        if (!result.pass) {
          errors.push({
            id: check.id,
            name: check.name,
            type: check.type,
            message: result.message
          });
          pass = false;
          
          if (this.logChecks) {
            console.log(`[RenderPipelineGuard] ❌ ${check.name}: ${result.message}`);
          }
        } else if (result.warning) {
          warnings.push({
            id: check.id,
            name: check.name,
            type: 'warning',
            message: result.warning
          });
          
          if (this.logChecks) {
            console.log(`[RenderPipelineGuard] ⚠️ ${check.name}: ${result.warning}`);
          }
        } else {
          if (this.logChecks) {
            console.log(`[RenderPipelineGuard] ✅ ${check.name}: ${result.message}`);
          }
        }
      } catch (err) {
        errors.push({
          id: check.id,
          name: check.name,
          type: 'error',
          message: `检查执行异常: ${err.message}`
        });
        pass = false;
      }
    }

    // 执行自定义检查
    for (const custom of this.customChecks) {
      try {
        const result = custom.check(payload);
        if (!result.pass) {
          errors.push({
            id: custom.id || 'custom',
            name: custom.name || '自定义检查',
            type: 'error',
            message: result.message
          });
          pass = false;
        }
      } catch (err) {
        console.error(`[RenderPipelineGuard] ⚠️ 自定义检查失败: ${err.message}`);
      }
    }

    return { pass, errors, warnings };
  }

  // 严格模式：不通过抛异常
  checkStrict(payload) {
    const result = this.check(payload);
    if (!result.pass) {
      const errorMessages = result.errors.map(e => `[${e.id}] ${e.name}: ${e.message}`).join('\n');
      throw new Error(`PIPELINE_GUARD_FAILED:\n${errorMessages}`);
    }
    return result;
  }

  // 生成验证清单（Markdown格式）
  generateChecklist(payload) {
    const result = this.check(payload);
    let md = '## 渲染提交验证清单\n\n';
    
    for (const error of result.errors) {
      md += `- [ ] ❌ **${error.name}**: ${error.message}\n`;
    }
    for (const warning of result.warnings) {
      md += `- [ ] ⚠️ **${warning.name}**: ${warning.message}\n`;
    }
    if (result.errors.length === 0 && result.warnings.length === 0) {
      md += '- [x] ✅ 所有检查通过\n';
    }
    
    return md;
  }
  
  // 设置跨镜头上下文（用于场景多样性检查）
  setContext(context) {
    this.context = context || {};
  }
}

module.exports = { RenderPipelineGuard };

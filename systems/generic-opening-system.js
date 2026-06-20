/**
 * 通用片头系统 v1.1 (v6.6.1)
 *
 * v6.6.1-fix: 标题营销化设计
 * - 主标题:智能压缩 + 营销化增强,拒绝直接塞入长字段
 * - 副标题:长度限制15字,过长时智能生成,像广告语一样精炼
 * - 新增 _enhanceTitleForMarketing: 标题吸引力优化
 * - 新增 _generateSmartSubTitle: 智能副标题推断
 *
 * 系统级设计:提取通用三幕结构,支持任意类型视频片头
 * - 非Nirath专属,支持健康科普、纪录片、广告等所有generic模式
 *
 * 三幕结构:
 * 1. 钩子(0-25%): 吸引注意力的开场画面/动作
 * 2. 展开(25-75%): 主题信息展示(标题/角色/场景)
 * 3. 定格(75-100%): 片头收尾,过渡到正片
 *
 * 可配置元素:
 * - 主标题、副标题、出品人/机构
 * - 角色展示(可选)
 * - 场景氛围(根据world配置)
 * - 时长:3-15秒(可配置)
 */

const path = require('path');

class GenericOpeningSystem {
  constructor(options = {}) {
    this.duration = options.duration || 9; // 默认9秒(匹配验证器要求)
    this.mode = options.mode || 'generic';
  }

  /**
   * 生成通用片头
   * @param {Object} input - 项目输入
   * @param {Object} storyboard - 故事板数据
   * @param {Object} characters - 角色数据
   * @returns {Object} 片头结果
   */
  generateOpening(input, storyboard, characters) {
    // v6.6.4-fix: 尊重 hasOpening 配置，false 时不生成片头
    if (input.hasOpening === false || input.opening?.enabled === false || input.noOpening === true) {
      return null;
    }

    const world = input.world || {};
    const meta = input.projectName || '未命名项目';
    const mainTitle = this._extractMainTitle(input);
    const subTitle = this._extractSubTitle(input);
    const creator = input.creator || input.world?.creator || '';

    // 三幕结构构建
    const hook = this._buildHook(world, characters);
    const reveal = this._buildReveal(mainTitle, subTitle, creator, world);
    const freeze = this._buildFreeze(world);

    // 合并为完整prompt(按1500字符预算优化)
    const prompt = this._assemblePrompt(hook, reveal, freeze, world, characters);

    return {
      id: 'S00',
      shotId: 'S00',
      type: 'opening',
      isOpening: true,
      duration: this.duration,
      prompt: prompt,
      length: prompt.length,
      utilization: Math.min(100, Math.round(prompt.length / 1500 * 100)),
      utilizationStatus: prompt.length >= 1400 ? 'ideal' : (prompt.length >= 1000 ? 'good' : 'insufficient'),
      title: {
        main: mainTitle,
        sub: subTitle,
        creator: creator,
        displayTiming: 'T02:00-T06:00',
        position: 'center-bottom',
        style: 'clean-modern-sans-serif'
      },
      scene: '片头-开场',
      shotType: 'opening',
      mouthAction: '', // 片头无口播
      emotionPhase: 'curiosity',
      ratio: '16:9',
      referenceImages: this._extractReferenceImages(characters),
      characters: Object.keys(characters || {}),
      cameraMovement: this._buildCameraMovement(),
      qualityScore: 75
    };
  }

  /**
   * 第一幕:钩子 - 吸引注意力的开场
   */
  _buildHook(world, characters) {
    const setting = world.setting || '专业环境';
    const atmosphere = world.atmosphere || '专业、可信';
    const charList = Object.values(characters || {}).map(c => c.name).filter(Boolean);

    let hook = '';

    if (charList.length > 0) {
      // 有角色:角色出场动作
      hook = `${charList[0]}面向镜头,自然微笑,专业姿态,背景${setting},${atmosphere}氛围`;
    } else {
      // 无角色:场景氛围
      hook = `专业${setting}全景,${atmosphere},自然光线,画面稳定`;
    }

    return {
      phase: 'hook',
      duration: Math.floor(this.duration * 0.25), // 25%
      content: hook,
      timing: `T00:00-T00:${Math.floor(this.duration * 0.25)}`
    };
  }

  /**
   * 第二幕:展开 - 标题信息展示
   */
  _buildReveal(mainTitle, subTitle, creator, world) {
    const setting = world.setting || '专业环境';
    const lighting = world.lighting || '自然光';

    let titleBlock = `主标题"${mainTitle}"大字居中展示`;
    if (subTitle) titleBlock += `,副标题"${subTitle}"`;
    if (creator) titleBlock += `,出品人/机构"${creator}"`;

    return {
      phase: 'reveal',
      duration: Math.floor(this.duration * 0.50), // 50%
      content: `${titleBlock},背景${setting},${lighting},标题文字示意性展示,层次分明`,
      timing: `T00:${Math.floor(this.duration * 0.25)}-T00:${Math.floor(this.duration * 0.75)}`
    };
  }

  /**
   * 第三幕:定格 - 片头收尾
   */
  _buildFreeze(world) {
    const atmosphere = world.atmosphere || '专业';

    return {
      phase: 'freeze',
      duration: this.duration - Math.floor(this.duration * 0.75), // 剩余25%
      content: `画面稳定定格,${atmosphere},淡入正片过渡,无突兀切换`,
      timing: `T00:${Math.floor(this.duration * 0.75)}-T00:${this.duration}`
    };
  }

  /**
   * 组装完整Prompt(1500字符预算)
   */
  _assemblePrompt(hook, reveal, freeze, world, characters) {
    const parts = [];

    // v6.6.3-fix: 统一使用中文标签，消除中英混杂
    // L1: 约束层
    parts.push(`【负面约束】禁止文字、禁止动漫、禁止卡通、禁止变形手、禁止多余手指、禁止水印、16:9画幅、禁止字幕、24fps、超写实、超细节、HDR、胶片颗粒、35mm质感、电影级真实感`);

    // L2: 基础层
    const charNames = Object.entries(characters || {}).map(([id, c]) => c.profile?.baseIdentity?.name || c.profile?.name || c.name || id).filter(Boolean).join('、');
    parts.push(`【角色】${charNames || '无角色'}`);

    // L3: 场景层
    parts.push(`【场景】${world.name || '片头'} | ${world.setting || '专业环境'} | ${world.lighting || '自然光'} | ${world.atmosphere || '专业氛围'}`);

    // L4: 主体层（三幕）
    parts.push(`【动作】${hook.content} | ${reveal.content} | ${freeze.content}`);

    // L5: 动态层
    parts.push(`【运镜】稳定开场，缓慢推进，标题区域聚焦，适度景深，专业纪录片运镜`);
    parts.push(`【镜头时间轴】00:00-00:${String(this.duration).padStart(2, '0')} / 时长:${this.duration}s / 类型:片头 / 情绪:好奇`);

    // L6: 风格层
    parts.push(`【情绪】专业开场 | 清晰 | 可信 | 现代`);
    parts.push(`【灯光】${world.lighting || '自然光，柔和明亮，均匀照明'}`);

    // L7: 音频层
    parts.push(`【音频】L1:舒缓背景音，-20LUFS | L2:自然环境音 | L3:温暖氛围，72BPM | 避让:标题出现时背景音乐降低3dB`);

    // L8: 内部层
    parts.push(`【渲染参数】超写实电影级画质，35mm胶片颗粒，HDR，照片级真实，16:9画幅，纪录片写实风格`);
    parts.push(`【导演指令】通用纪录片风格，开场稳重，信息清晰，现代感`);

    // 定妆照引用（如果有角色）
    const charKeys = Object.keys(characters || {});
    if (charKeys.length > 0) {
      const charId = charKeys[0];
      const char = characters[charId];
      const portraitPath = char?.portraits?.front || char?.portraits?.closeup || '';
      if (portraitPath) {
        parts.push(`【绑定定妆照】${portraitPath}`);
      }
    }

    return parts.join(' | ');
  }

  _extractMainTitle(input) {
    // v6.6.1-fix: 智能标题提炼 + 营销化设计
    // 无论上游传入多长的字段,都要提炼成简洁有力的营销标题

    let rawTitle = '';

    // 优先级:input.opening.title > input.title.main > input.title > input.projectName
    if (input.opening?.title && typeof input.opening.title === 'string') {
      rawTitle = input.opening.title.trim();
    } else if (typeof input.title === 'object' && input.title?.main) {
      rawTitle = input.title.main;
    } else if (typeof input.title === 'string' && input.title.trim()) {
      rawTitle = input.title.trim();
    } else if (input.projectName) {
      rawTitle = input.projectName;
    }

    if (!rawTitle) return '未命名项目';

    // 第一步:压缩到核心主题
    let condensed = this._condenseTitle(rawTitle);

    // 第二步:营销化增强(科普视频风格)
    condensed = this._enhanceTitleForMarketing(condensed, input);

    return condensed;
  }

  /**
   * 智能标题压缩:从长描述中提取核心主题
   * 例如:"科普视频穿警服的陈卓女士讲解横纹肌溶解的症状及实验室检查"
   *       → "横纹肌溶解:症状与实验室检查"
   */
  _condenseTitle(longTitle) {
    if (!longTitle || typeof longTitle !== 'string') return '未命名项目';

    // 阶段1:移除常见前缀噪音(更彻底的清理)
    let title = longTitle
      .replace(/^[^,,]*科普视频[,,、\s]*/i, '')
      .replace(/^[^,,]*健康科普[,,、\s]*/i, '')
      .replace(/^[^,,]*医学科普[,,、\s]*/i, '')
      .replace(/^[^,,]*穿警服的[\u4e00-\u9fa5]+[女士先生][,,、\s]*/i, '')
      .replace(/^[^,,]*穿[\u4e00-\u9fa5]+[的,,、\s]*/i, '')
      .replace(/^关于[,,、\s]*/i, '')
      .replace(/^讲解[,,、\s]*/i, '');

    // 阶段2:如果标题仍很长(>12字),提取核心主题
    if (title.length > 12) {
      // 模式A:匹配 "XXX的症状[及与]YYY" 结构
      const symptomMatch = title.match(/(.+?)(的症状[及与].+)/);
      if (symptomMatch) {
        const subject = symptomMatch[1];
        // 进一步清理 subject 中的前缀
        const cleanSubject = subject
          .replace(/.*[讲解关于]/, '')
          .replace(/^[^的]*的/, '')
          .trim();
        const suffix = symptomMatch[2]
          .replace('的症状及', ':症状与')
          .replace('的症状与', ':症状与');
        return (cleanSubject || subject) + suffix;
      }

      // 模式B:匹配 "XXX的危害[及与]YYY" 结构
      const harmMatch = title.match(/(.+?)(的危害[及与].+)/);
      if (harmMatch) {
        const subject = harmMatch[1].replace(/.*[讲解关于]/, '').trim();
        const suffix = harmMatch[2]
          .replace('的危害及', ':')
          .replace('的危害与', ':');
        return subject + suffix;
      }

      // 模式C:匹配 "XXX的预防[及与]YYY" 结构
      const preventMatch = title.match(/(.+?)(的预防[及与].+)/);
      if (preventMatch) {
        const subject = preventMatch[1].replace(/.*[讲解关于]/, '').trim();
        const suffix = preventMatch[2]
          .replace('的预防及', ':')
          .replace('的预防与', ':');
        return subject + suffix;
      }

      // 模式D:匹配 "XXX的YYY" 结构(通用)
      const generalMatch = title.match(/(?:.*?)([\w]+(?:[\w]+)?)(的[\w]+)/);
      if (generalMatch) {
        const subject = generalMatch[1];
        const suffix = generalMatch[2];
        return subject + ':' + suffix.replace('的', '');
      }
    }

    // 如果已经比较短,直接返回
    return title || '未命名项目';
  }

  /**
   * 营销化标题增强:让标题像广告一样有吸引力
   * 科普视频标题设计原则:简洁有力,突出核心知识点
   */
  _enhanceTitleForMarketing(condensedTitle, input) {
    if (!condensedTitle || condensedTitle === '未命名项目') return '未命名项目';

    // 已经够简洁(<=10字),直接返回
    if (condensedTitle.length <= 10) return condensedTitle;

    // 如果标题已经包含冒号(有主副结构),保持原样
    if (condensedTitle.includes(':') || condensedTitle.includes(':')) return condensedTitle;

    // 提取核心主题词(通常是前几个词)
    const coreWords = condensedTitle.substring(0, 10).trim();

    // 根据视频类型添加营销后缀
    const videoType = input.videoType || '';
    if (videoType === 'EDU' || videoType === 'education' || videoType === '科普') {
      // 科普视频:简洁直接
      return coreWords;
    }

    return condensedTitle;
  }

  /**
   * 智能副标题生成:从input中推断最合适的副标题
   * 副标题像广告语一样精炼,补充主标题未覆盖的信息
   */
  _generateSmartSubTitle(input, mainTitle) {
    const parts = [];

    // 1. 系列信息(最优先)
    if (input.isSeries && input.currentEpisode) {
      if (input.totalEpisodes) {
        parts.push(`第${input.currentEpisode}集/共${input.totalEpisodes}集`);
      } else {
        parts.push(`第${input.currentEpisode}集`);
      }
    }

    // 2. 系列标题
    if (input.opening?.seriesTitle &&
        input.opening.seriesTitle !== mainTitle &&
        input.opening.seriesTitle.length <= 10) {
      parts.push(input.opening.seriesTitle);
    }

    // 3. 主讲人/创作者
    const creator = input.creator || input.world?.creator || '';
    if (creator && creator.length <= 6 && !mainTitle.includes(creator)) {
      parts.push(creator);
    }

    // 4. 视频类型标签
    const videoType = input.videoType || '';
    if ((videoType === 'EDU' || videoType === 'education') && parts.length === 0) {
      parts.push('健康科普');
    }

    // 合并并截断(副标题总长度控制在20字以内)
    const subtitle = parts.filter(Boolean).join(' | ');
    return subtitle.length > 20 ? subtitle.substring(0, 20) : subtitle;
  }

  _extractSubTitle(input) {
    // v6.6.1-fix: 副标题智能生成,拒绝长字符串直接塞入
    // 副标题长度控制在15字以内,像广告语一样精炼

    let rawSub = '';

    // 获取原始副标题(如果有)
    if (input.opening?.subtitle && typeof input.opening.subtitle === 'string') {
      rawSub = input.opening.subtitle.trim();
    }

    // 获取主标题用于比对
    const mainTitle = this._extractMainTitle(input);

    // 过滤无效副标题:太长、与主标题重复、包含主标题
    if (rawSub && (rawSub.length > 15 || rawSub === mainTitle || rawSub.includes(mainTitle))) {
      rawSub = '';
    }

    // 如果原始副标题有效且简短,直接使用
    if (rawSub && rawSub.length <= 15) {
      return rawSub;
    }

    // 智能推断生成副标题
    return this._generateSmartSubTitle(input, mainTitle);
  }

  _extractReferenceImages(characters) {
    const refs = [];
    for (const [id, char] of Object.entries(characters || {})) {
      if (char.portraits?.front) {
        refs.push({ id: `${id}-front`, path: char.portraits.front });
      }
    }
    return refs;
  }

  _buildCameraMovement() {
    return {
      scene: '片头',
      primaryMovement: '稳定开场-缓慢推进-定格',
      speed: 'slow',
      shotSize: 'wide-to-medium',
      timeline: `T00:00-T00:${this.duration}`
    };
  }
}

module.exports = GenericOpeningSystem;

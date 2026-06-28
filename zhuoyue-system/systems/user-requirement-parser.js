#!/usr/bin/env node
/**
 * 用户需求解析确认技能 (User Requirement Parsing & Confirmation Skill)
 * 
 * 定位：视频生成系统最前置模块
 * 职责：将用户原始意图（一句话/模糊描述）转化为结构化的统一视频需求
 * 工作模式：主动提案、轻量确认
 * 
 * 输出：符合 UnifiedVideoRequirement 统一数据结构的完整需求清单
 */

const { CreativityIndexParser } = require('./creativity-index-parser');

class UserRequirementParser {
  constructor(options = {}) {
    this.debug = options.debug || false;
    this.parser = new CreativityIndexParser();
    
    // 风格推断规则库
    this.styleRules = this._buildStyleRules();
    
    // 类型推断规则库
    this.typeRules = this._buildTypeRules();
  }

  /**
   * 主入口：解析用户输入，生成完整的需求清单
   * @param {string} userInput - 用户的原始输入（一句话或简单描述）
   * @param {Object} context - 上下文信息（可选）
   * @returns {Object} UnifiedVideoRequirement 结构
   */
  async parse(userInput, context = {}) {
    if (!userInput || typeof userInput !== 'string') {
      throw new Error('用户输入不能为空');
    }

    this.log('解析用户输入:', userInput.substring(0, 100) + '...');

    // 1. 提取明确信息
    const extracted = this._extractExplicitInfo(userInput);
    
    // 2. 推断缺失信息
    const inferred = this._inferMissingInfo(userInput, extracted);
    
    // 3. 解析创意指数
    // v6.6.8-fix: 优先使用命令行传入的 CP 值，不从用户输入字符串中解析
    const cp = context.creativityIndex 
      ? { value: context.creativityIndex, source: 'cli' }
      : this.parser.parse(userInput);
    
    // 4. 构建统一结构
    const unifiedRequirement = this._buildUnifiedRequirement({
      ...extracted,
      ...inferred,
      creativityIndex: cp.value,
      rawInput: userInput
    });

    this.log('解析完成:', `标题="${unifiedRequirement.title}", 类型=${unifiedRequirement.videoType}, 时长=${unifiedRequirement.targetDuration}s, CP=${unifiedRequirement.creativityIndex}`);
    
    return unifiedRequirement;
  }

  /**
   * 提取用户输入中的明确信息
   */
  _extractExplicitInfo(input) {
    const info = {};
    
    // 提取视频类型关键词
    const typeKeywords = {
      'EDU': ['科普', '讲解', '知识', '教学', '课程', '教育'],
      'DRAMA': ['短剧', '剧情', '故事', '角色', '微电影'],
      'ADV': ['广告', '宣传', '推广', '品牌', '产品'],
      'DOC': ['纪录片', '记录', '纪实', '真实'],
      'SOC': ['抖音', '快手', '小红书', 'viral', '短视频'],
      'COR': ['企业', '公司', '工厂', '宣传片'],
      'EVT': ['活动', '现场', '会议', '庆典'],
      'VLOG': ['vlog', '日常', '记录生活'],
      'MV': ['mv', '音乐', '歌曲']
    };
    
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(k => input.includes(k))) {
        info.videoType = type;
        break;
      }
    }
    
    // 提取时长信息
    const durationMatch = input.match(/(\d+)\s*(秒|分钟|min|s)/i);
    if (durationMatch) {
      const num = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      info.targetDuration = (unit.includes('分') || unit === 'min') ? num * 60 : num;
    }
    
    // 提取画幅比例
    if (input.includes('竖屏') || input.includes('9:16')) {
      info.aspectRatio = '9:16';
    } else if (input.includes('横屏') || input.includes('16:9')) {
      info.aspectRatio = '16:9';
    }
    
    // 提取平台
    const platformKeywords = {
      '抖音': ['抖音', 'douyin', 'tiktok'],
      '快手': ['快手', 'kuaishou'],
      '小红书': ['小红书', 'xiaohongshu'],
      'B站': ['b站', 'bilibili', '哔哩哔哩'],
      '视频号': ['视频号', '微信视频号']
    };
    
    for (const [platform, keywords] of Object.entries(platformKeywords)) {
      if (keywords.some(k => input.includes(k))) {
        info.platform = platform;
        break;
      }
    }
    
    // 提取主题/标题（简单启发式：取前20字或引号内容）
    const titleMatch = input.match(/[""](.+?)[""]/);
    if (titleMatch) {
      info.title = titleMatch[1];
    } else {
      // 取前20字作为标题候选
      info.title = input.substring(0, 30).replace(/[。，,.]/g, '');
    }
    
    // 提取系列信息
    const seriesMatch = input.match(/(\d+)\s*集/);
    if (seriesMatch) {
      info.isSeries = true;
      info.totalEpisodes = parseInt(seriesMatch[1]);
    }
    
    const episodeMatch = input.match(/第(\d+)集/);
    if (episodeMatch) {
      info.currentEpisode = parseInt(episodeMatch[1]);
      info.isSeries = true;
    }
    
    // 提取角色信息
    const charMatch = input.match(/(.+?)(?:女士|先生|小姐|老师|医生|护士|教授)/);
    if (charMatch) {
      info.characters = [{
        id: 'main-character',
        name: charMatch[1].trim(),
        role: '主讲人/主角',
        appearance: '待定',
        personality: '专业、亲和'
      }];
    }
    
    return info;
  }

  /**
   * 推断缺失信息
   */
  _inferMissingInfo(input, extracted) {
    const inferred = {};
    
    // 推断视频类型（如果未提取到）
    if (!extracted.videoType) {
      inferred.videoType = 'EDU'; // 默认教育科普
    }
    
    // 推断风格（基于类型 + 关键词）
    const videoType = extracted.videoType || inferred.videoType;
    inferred.visualStyle = this._inferStyle(videoType, input);
    
    // 推断时长（如果未提取到）
    if (!extracted.targetDuration) {
      inferred.targetDuration = this._inferDuration(videoType);
    }
    
    // 推断画幅（如果未提取到）
    if (!extracted.aspectRatio) {
      inferred.aspectRatio = this._inferAspectRatio(extracted.platform || inferred.platform, videoType);
    }
    
    // 推断目标受众
    if (!extracted.targetAudience) {
      inferred.targetAudience = this._inferAudience(videoType, input);
    }
    
    // 推断平台（如果未提取到）
    if (!extracted.platform) {
      inferred.platform = this._inferPlatform(videoType);
    }
    
    // 推断画质等级
    inferred.qualityLevel = this._inferQualityLevel(input);
    
    // 推断色彩基调
    inferred.colorTone = this._inferColorTone(extracted.visualStyle || inferred.visualStyle);
    
    // 推断叙事方式
    inferred.narrativeStyle = this._inferNarrativeStyle(videoType);
    
    // 推断内容风格
    inferred.contentStyle = this._inferContentStyle(videoType);
    
    // 推断音乐风格
    inferred.musicStyle = this._inferMusicStyle(videoType, input);
    
    // 推断主题
    if (!extracted.title) {
      inferred.title = '未命名视频项目';
    }
    inferred.topic = extracted.title || inferred.title;
    
    // 推断关键要点
    inferred.keyPoints = [inferred.topic || '核心内容'];
    
    return inferred;
  }

  /**
   * 构建统一数据结构
   */
  _buildUnifiedRequirement(data) {
    const title = data.title || data.topic || '未命名项目';
    const topic = data.topic || title;
    const videoType = data.videoType || 'EDU';
    const targetDuration = data.targetDuration || 60;
    
    return {
      // 一、视频任务基本信息
      title: title,
      topic: topic,
      videoType: videoType,
      targetAudience: data.targetAudience || '普通大众',
      platform: data.platform || '视频号/抖音',
      
      // 二、制作规格
      targetDuration: targetDuration,
      aspectRatio: data.aspectRatio || '9:16',
      visualStyle: data.visualStyle || 'REAL+WARM',
      qualityLevel: data.qualityLevel || '电影级',
      colorTone: data.colorTone || '自然暖色调',
      
      // 三、内容创意要求
      creativityIndex: data.creativityIndex || 0.2,
      narrativeStyle: data.narrativeStyle || '单人讲解',
      contentStyle: data.contentStyle || '专业严谨+通俗易懂',
      visualStyleDetail: data.visualStyleDetail || this._getVisualStyleDetail(data.visualStyle),
      musicStyle: data.musicStyle || '轻柔背景音乐+清晰人声',
      
      // 四、角色信息
      characters: this._buildCharacters(data.characters),
      
      // 五、场景定义（基础框架，后续Stage填充）
      scenes: data.scenes || this._buildDefaultScenes(targetDuration, videoType, topic),
      
      // 六、结构与分镜
      opening: {
        hasOpening: true,
        title: title,
        subtitle: data.subtitle || '',
        duration: Math.min(5, Math.floor(targetDuration * 0.1))
      },
      ending: {
        hasEnding: true,
        previewNext: false,
        content: '总结收尾'
      },
      keyPoints: data.keyPoints || [topic],
      
      // 七、系列规划
      isSeries: data.isSeries || false,
      totalEpisodes: data.totalEpisodes || 1,
      currentEpisode: data.currentEpisode || 1,
      episodeThemes: data.episodeThemes || [],
      contentIsolation: data.contentIsolation || '',
      
      // 八、世界观
      // v6.7.1-fix: 从用户输入动态推断世界观，消灭硬编码
      world: this._inferWorld(data.rawInput || '', data.videoType || 'EDU'),
      
      // 九、风格与约束
      style: {
        visualStyle: data.visualStyle || '写实',
        colorPalette: data.colorTone || '自然暖色',
        pacing: '适中',
        mood: '专业亲和',
        reference: ''
      },
      constraints: {
        technical: ['单镜头≤15秒', '总时长≤180秒'],
        content: ['内容需准确'],
        legal: []
      },
      
      // 十、元数据
      meta: {
        version: 'v1.0',
        mode: 'generic',
        createdAt: new Date().toISOString(),
        aiReasoning: this._buildReasoning(data),
        rawInput: data.rawInput || ''
      },
      
      // 原始输入保留
      rawInput: data.rawInput || ''
    };
  }

  // === 辅助方法 ===
  
  _buildStyleRules() {
    return {
      'EDU': { primary: 'REAL', secondary: ['WARM', 'NAT'], keywords: ['科普', '知识'] },
      'DRAMA': { primary: 'CINE', secondary: ['EMO'], keywords: ['剧情', '故事'] },
      'ADV': { primary: 'POL', secondary: ['LUX'], keywords: ['广告', '宣传'] },
      'DOC': { primary: 'REAL', secondary: ['GRI'], keywords: ['记录', '纪实'] },
      'SOC': { primary: 'STREET', secondary: ['VIV'], keywords: ['短', '快'] },
      'COR': { primary: 'POL', secondary: ['LUX'], keywords: ['企业', '品牌'] },
      'VLOG': { primary: 'REAL', secondary: ['NAT'], keywords: ['日常', '记录'] },
      'MV': { primary: 'ART', secondary: ['VIV'], keywords: ['音乐', '艺术'] }
    };
  }
  
  _buildTypeRules() {
    return {
      '科普': 'EDU', '讲解': 'EDU', '知识': 'EDU', '教学': 'EDU',
      '短剧': 'DRAMA', '剧情': 'DRAMA', '故事': 'DRAMA', '微电影': 'DRAMA',
      '广告': 'ADV', '宣传': 'ADV', '推广': 'ADV', '品牌': 'ADV',
      '纪录片': 'DOC', '记录': 'DOC', '纪实': 'DOC',
      '抖音': 'SOC', '快手': 'SOC', '小红书': 'SOC',
      '企业': 'COR', '公司': 'COR', '宣传片': 'COR',
      'vlog': 'VLOG', '日常': 'VLOG',
      'mv': 'MV', '音乐': 'MV'
    };
  }
  
  _inferStyle(videoType, input) {
    const rules = this.styleRules[videoType] || { primary: 'REAL', secondary: [] };
    let style = rules.primary;
    
    // 检查关键词升级风格
    if (input.includes('质感') || input.includes('高级感') || input.includes('电影')) {
      style = 'CINE';
    }
    if (input.includes('潮') || input.includes('酷')) {
      style = 'STREET';
    }
    if (input.includes('温暖') || input.includes('治愈')) {
      style = 'WARM';
    }
    
    // 添加辅助风格
    if (input.includes('高级') || input.includes('luxury')) {
      style += '+LUX';
    } else if (input.includes('活力') || input.includes('动感')) {
      style += '+VIV';
    } else if (rules.secondary.length > 0) {
      style += '+' + rules.secondary[0];
    }
    
    return style;
  }
  
  _inferDuration(videoType) {
    const defaults = {
      'EDU': 60, 'SOC': 30, 'ADV': 30, 'DOC': 120,
      'DRAMA': 120, 'COR': 60, 'EVT': 60, 'VLOG': 60, 'MV': 120
    };
    return defaults[videoType] || 60;
  }
  
  _inferAspectRatio(platform, videoType) {
    if (platform === 'B站') return '16:9';
    if (videoType === 'DRAMA' || videoType === 'DOC' || videoType === 'EDU') return '16:9';
    return '16:9'; // 默认横屏（AGENTS.md 规定）
  }
  
  _inferAudience(videoType, input) {
    if (input.includes('居民') || input.includes('全民')) return '普通大众';
    if (input.includes('年轻人') || input.includes('Z世代')) return '18-25岁年轻群体';
    if (input.includes('宝妈') || input.includes('亲子')) return '25-35岁父母群体';
    if (input.includes('职场') || input.includes('白领')) return '25-40岁职场人群';
    return '普通大众';
  }
  
  _inferPlatform(videoType) {
    const platforms = {
      'EDU': '视频号/抖音/B站', 'SOC': '抖音/快手/小红书',
      'ADV': '全平台', 'DOC': 'B站/视频号',
      'DRAMA': '抖音/快手/视频号', 'COR': '官网/展会',
      'EVT': '社交媒体', 'VLOG': 'B站/视频号', 'MV': '全平台'
    };
    return platforms[videoType] || '视频号/抖音';
  }
  
  _inferQualityLevel(input) {
    if (input.includes('极致') || input.includes('顶级') || input.includes('好莱坞')) return '极致级';
    if (input.includes('高品质') || input.includes('电影级') || input.includes('艺术')) return '艺术级';
    if (input.includes('质感') || input.includes('精致')) return '电影级';
    return '电影级';
  }
  
  _inferColorTone(style) {
    if (style.includes('WARM')) return '自然暖色调';
    if (style.includes('CINE')) return '电影级调色';
    if (style.includes('FUT')) return '冷色调';
    if (style.includes('RET')) return '暖色复古调';
    return '自然暖色调';
  }
  
  _inferNarrativeStyle(videoType) {
    const styles = {
      'EDU': '单人讲解', 'SOC': '快节奏剪辑',
      'ADV': '产品展示', 'DOC': '纪实叙事',
      'DRAMA': '剧情演绎', 'COR': '品牌叙事',
      'EVT': '现场记录', 'VLOG': '第一人称记录', 'MV': '视听叙事'
    };
    return styles[videoType] || '单人讲解';
  }
  
  _inferContentStyle(videoType) {
    const styles = {
      'EDU': '专业严谨+通俗易懂', 'SOC': '娱乐化+传播性',
      'ADV': '品牌调性+产品卖点', 'DOC': '真实记录+深度叙事',
      'DRAMA': '故事化+情绪驱动', 'COR': '实力展示+品牌信任',
      'EVT': '现场感+氛围还原', 'VLOG': '真实感+个人风格', 'MV': '艺术化+视听冲击'
    };
    return styles[videoType] || '专业严谨';
  }
  
  _inferMusicStyle(videoType, input) {
    if (input.includes('无音乐') || input.includes('纯人声')) return '无人声，纯环境音';
    const styles = {
      'EDU': '轻柔背景音乐+清晰人声', 'SOC': '动感音乐+节奏音效',
      'ADV': '品牌调性音乐+情绪音效', 'DOC': '叙事性音乐+环境音',
      'DRAMA': '情绪化配乐+音效设计', 'COR': '大气音乐+环境音',
      'EVT': '现场音乐+氛围音效', 'VLOG': '轻快音乐+环境音', 'MV': '音乐主导+视觉配合'
    };
    return styles[videoType] || '轻柔背景音乐';
  }
  
  _getVisualStyleDetail(style) {
    const details = {
      'REAL+WARM': '写实风格，自然光影，温暖色调，人物真实可信',
      'CINE+EMO': '电影质感，戏剧性光影，情绪化叙事，宽画幅景深',
      'POL+LUX': '精致商业，高饱和产品特写，精致布光，慢镜头质感',
      'STREET+VIV': '街头潮流，快速剪辑，涂鸦元素，动感运镜'
    };
    return details[style] || '写实风格，人物与背景均要求真实质感';
  }
  
  _buildCharacters(characters) {
    if (!characters) return {};
    if (Array.isArray(characters)) {
      const charObj = {};
      characters.forEach(c => {
        if (c.id) charObj[c.id] = c;
      });
      return charObj;
    }
    return characters;
  }
  
  _buildDefaultScenes(targetDuration, videoType, topic) {
    // 根据时长计算默认场景数（每个场景8-12秒）
    const sceneCount = Math.max(3, Math.min(6, Math.ceil(targetDuration / 10)));
    const scenes = [];
    
    // v6.7.1-fix: 通用场景构建——从 topic 动态推断，消灭硬编码医学主题
    const topicStr = topic || '内容';
    let contentDescriptions = [];
    
    // 简单的关键词推断逻辑（可扩展）
    if (topicStr.includes('症状') || topicStr.includes('检查') || topicStr.includes('疾病')) {
      contentDescriptions = [
        '核心概念讲解',
        '关键特征分析',
        '实际案例说明',
        '注意事项总结'
      ];
    } else if (topicStr.includes('战斗') || topicStr.includes('对决') || topicStr.includes('动作')) {
      contentDescriptions = [
        '开场对峙与气场建立',
        '初次交锋与试探',
        '高潮对抗与冲突升级',
        '决胜一击与结局收束'
      ];
    } else if (topicStr.includes('故事') || topicStr.includes('剧情') || topicStr.includes('叙事')) {
      contentDescriptions = [
        '背景铺垫与人物引入',
        '冲突发生与情节推进',
        '高潮转折与情感爆发',
        '结局收束与主题升华'
      ];
    } else {
      // 通用结构
      contentDescriptions = [
        '核心概念讲解',
        '关键特征分析',
        '实际案例说明',
        '注意事项总结'
      ];
    }
    
    for (let i = 0; i < sceneCount; i++) {
      const isLast = i === sceneCount - 1;
      const isFirst = i === 0;
      const type = isFirst ? 'intro' : (isLast ? 'ending' : 'content');
      const duration = isFirst || isLast ? Math.floor(targetDuration * 0.15) : Math.floor(targetDuration * 0.7 / (sceneCount - 2));
      
      let description = '待填充';
      if (type === 'intro') {
        description = '开场：引入主题，建立氛围，吸引注意力';
      } else if (type === 'ending') {
        description = '结尾：总结要点，强调核心信息，留下印象';
      } else {
        const contentIdx = i - 1;
        description = contentIdx < contentDescriptions.length ? contentDescriptions[contentIdx] : `内容${contentIdx + 1}`;
      }
      
      scenes.push({
        id: `S0${i+1}`,
        name: isFirst ? '开场' : (isLast ? '结尾' : `内容${i}`),
        type: type,
        description: description,
        characters: [],
        duration: Math.min(duration, 15),
        visualComplexity: 5,
        importance: isFirst || isLast ? 8 : 6,
        narration: '',
        dialogue: ''
      });
    }
    
    return scenes;
  }
  
  _inferWorld(input, videoType) {
    // v6.7.1-fix: 根据用户输入动态推断世界观
    if (input.includes('Nirath') || input.includes('异世界') || input.includes('外星') || input.includes('星球')) {
      return {
        name: 'Nirath',
        setting: '外星生态星球',
        location: '异世界地表',
        lighting: '双恒星光照',
        atmosphere: '神秘/史诗',
        style: '超写实科幻'
      };
    }
    if (input.includes('神话') || input.includes('天庭') || input.includes('仙侠') || input.includes('云端') || input.includes('雷电')) {
      return {
        name: '神话世界',
        setting: '东方神话',
        location: '天庭/云端/战场',
        lighting: '史诗光影',
        atmosphere: '史诗/震撼',
        style: '全写实神话'
      };
    }
    if (input.includes('古代') || input.includes('历史') || input.includes('古装')) {
      return {
        name: '古代世界',
        setting: '历史时期',
        location: '古代场景',
        lighting: '自然光/烛光',
        atmosphere: '古典/庄重',
        style: '历史写实'
      };
    }
    if (videoType === 'EDU' || videoType === 'DOC') {
      return {
        name: '现实世界',
        setting: '现代',
        location: '室内/室外',
        lighting: '自然光',
        atmosphere: '专业/亲和',
        style: '写实'
      };
    }
    return {
      name: '虚构世界',
      setting: '现代',
      location: '待定',
      lighting: '自然光',
      atmosphere: '待定',
      style: '写实'
    };
  }

  _buildReasoning(data) {
    const reasons = [];
    if (data.videoType) reasons.push(`视频类型：${data.videoType}`);
    if (data.visualStyle) reasons.push(`风格：${data.visualStyle}`);
    if (data.targetDuration) reasons.push(`时长：${data.targetDuration}秒`);
    if (data.creativityIndex) reasons.push(`创意指数：${data.creativityIndex}`);
    return reasons.join(' | ');
  }
  
  log(...args) {
    if (this.debug) {
      console.log('[UserRequirementParser]', ...args);
    }
  }
}

// 导出
module.exports = { UserRequirementParser };

// 如果直接运行，测试解析
if (require.main === module) {
  const parser = new UserRequirementParser({ debug: true });
  
  // 测试案例1：教育科普
  const testInput1 = '一个穿警服的护士小姐姐陈卓女士，讲解居民健康护理知识，进行全民健康科普，现在是第一集【什么是横纹肌溶解——横纹肌溶解的症状以及实验室检查】。创意指数0.6，内容要有专业度也要通俗易懂，陈卓一个人讲解，要生动形象有肢体语言，视频时长59-65秒，全写实风格，第一集要有片头主副标题。';
  
  parser.parse(testInput1).then(result => {
    console.log('\n=== 测试案例1：教育科普 ===');
    console.log('标题:', result.title);
    console.log('类型:', result.videoType);
    console.log('时长:', result.targetDuration);
    console.log('风格:', result.visualStyle);
    console.log('CP:', result.creativityIndex);
    console.log('场景数:', result.scenes.length);
    console.log('关键要点:', result.keyPoints);
  });
}

/**
 * Cinematography Skill Router - 通用电影摄影技能路由器 v2.1.0
 * 
 * 卓越视频系统 v6.5.65-P4+ 集成版
 * 支持全部 155 个技能文件，覆盖 11 种影片类型
 * 
 * 安全边界：
 * - 只影响外在表现：影视风格、运镜、灯光、美术布景
 * - 不修改内容：剧本、事实、角色、对白、品牌信息
 */

const fs = require('fs');
const path = require('path');

// 技能库路径
const SKILL_LIBRARY_PATH = path.join(__dirname, '技能系列', '镜头级专项');

// 影片类型映射（中文 → 英文）
const TYPE_MAP = {
  '剧情': 'drama',
  '动作': 'action', 
  '喜剧': 'comedy',
  '恐怖': 'horror',
  '悬疑': 'suspense',
  '惊悚': 'thriller',
  '战争': 'war',
  '科幻': 'sci-fi',
  '孤独': 'loneliness',
  '微表情': 'micro-expression',
  '纪录片': 'documentary',
  '广告片': 'commercial',
  '品牌片': 'brand',
  '科普片': 'educational',
  '通用': 'universal'
};

// 导演映射（中文 → 英文）
const DIRECTOR_MAP = {
  '维伦纽瓦': 'villeneuve', '诺兰': 'nolan', '卡梅隆': 'cameron',
  '卢卡斯': 'lucas', '库布里克': 'kubrick', '斯皮尔伯格': 'spielberg',
  '斯科塞斯': 'scorsese', '昆汀': 'tarantino', '达米恩': 'chazelle',
  '韦斯安德森': 'anderson', '索金': 'sorkin', '博伊尔': 'boyle',
  '大卫林奇': 'lynch', '芬奇': 'fincher', '希区柯克': 'hitchcock',
  '卡萨维茨': 'cassavetes', '德尼罗': 'deniro', '曼': 'mann',
  '斯派克琼斯': 'spike-jonze', '黑泽明': 'kurosawa', '奥卡萨姆': 'aucon'
};

// 镜头类型映射
const SHOT_MAP = {
  '斯坦尼康': 'steadicam', '手持': 'handheld', '航拍': 'aerial', '定场': 'establishing'
};

// 情绪映射
const EMOTION_MAP = {
  '史诗': 'epic', '孤独': 'lonely', '情感': 'emotional',
  '紧张': 'tense', '浪漫': 'romantic', '告别': 'farewell',
  '救赎': 'redemption', '温情': 'tender', '雨夜': 'rainy-night',
  '舞蹈': 'dance', '神秘': 'mysterious', '悬疑': 'suspenseful',
  '荒诞': 'absurd', '压迫': 'oppressive', '恐怖': 'horror',
  '粗粝真实': 'raw-real', '压抑喜悦': 'suppressed-joy',
  '压抑悲伤': 'suppressed-sadness', '厌恶': 'disgust', '嫌弃': 'scorn',
  '复杂情绪': 'complex', '复古优雅': 'vintage-elegant',
  '无人回应': 'no-response', '灵魂独行': 'soul-alone',
  '喜悦': 'joy', '方法演技': 'method-acting', '恍惚': 'trance',
  '恐惧': 'fear', '惊恐': 'panic', '恐惧颤抖': 'fear-shake',
  '哀伤': 'grief', '惊讶凝固': 'frozen-shock', '震惊': 'shocked',
  '愤怒克制': 'anger-suppressed', '暴烈': 'violent',
  '战栗': 'shiver', '神经质幽默': 'neurotic-humor',
  '热情外放': 'outgoing', '紧张内敛': 'tense-reserved',
  '破碎': 'broken', '心碎时刻': 'heartbreak', '空洞': 'hollow',
  '灵魂出窍': 'out-of-body', '窒息': 'suffocating',
  '话唠爆发': 'talking-burst', '冷峻逼近': 'cold-approach',
  '蔑视': 'contempt', '冷嘲': 'sarcasm', '迷醉': 'intoxicated',
  '超然状态': 'trance-state', '瞬间启示': 'flash-enlightenment',
  '无尽雨幕': 'endless-rain', '东方克制': 'oriental-restraint',
  '热闹中的寂静': 'quiet-in-chaos', '镜子里的陌生人': 'stranger-in-mirror',
  '午夜独醒': 'midnight-awake', '沉默对峙': 'silent-confrontation',
  '眼眶泛红': 'red-eyes', '无声落泪': 'silent-tears',
  '鼻翼翕动': 'nostril-flare', '不舍与决绝': 'reluctance-resolve',
  '无声离别': 'silent-departure', '喜怒交加': 'joy-sorrow',
  '记忆闪回': 'memory-flash', '牙齿打颤': 'teeth-chatter',
  '时间停止': 'time-freeze', '咬紧牙关': 'clenched-teeth',
  '不祥预感': 'ominous-premonition', '冥想': 'meditative',
  '专业': 'professional', '柔和': 'soft', '患者': 'patient',
  '冷静': 'calm', '正反打': 'shot-reverse-shot', '对话': 'dialogue',
  '产品英雄': 'product-hero', '特写': 'close-up',
  '环境氛围': 'atmospheric', '全景': 'establishing',
  '戏剧性': 'dramatic', '明暗对比': 'chiaroscuro',
  '动态': 'dynamic', '运动': 'movement'
};

class CinematographySkillRouter {
  constructor() {
    this.skillCache = new Map();
    this.skillIndex = null;
    this._buildSkillIndex();
  }

  log(...args) {
    console.log('[FilmCinematography-SkillRouter]', ...args);
  }

  /**
   * 从文件名解析技能元数据
   * 格式：类型_导演_情绪[_[镜头类型]].md
   * 或：微表情_导演_情绪.md / 微表情_情绪_细节.md
   */
  _parseSkillFilename(filename) {
    const name = filename.replace('.md', '');
    const parts = name.split('_');
    
    const type = parts[0] || '';
    const director = parts[1] || '';
    const rest = parts.slice(2);
    
    let tech = '';
    let shotType = '';
    let emotion = '';
    
    const TECH_TAGS_SET = new Set(['IMAX', 'VR', '3D']);
    const SHOT_TYPES_SET = new Set(['航拍', '斯坦尼康', '手持', '定场']);
    
    // 复合情绪词拆分
    for (const r of rest) {
      if (TECH_TAGS_SET.has(r)) { tech = r; continue; }
      let matched = false;
      for (const st of ['航拍', '斯坦尼康', '手持', '定场']) {
        if (r.includes(st) || st.includes(r)) {
          shotType = st;
          const remaining = r.replace(st, '');
          if (remaining) emotion = emotion ? emotion + '_' + remaining : remaining;
          matched = true;
          break;
        }
      }
      if (!matched) {
        emotion = emotion ? emotion + '_' + r : r;
      }
    }
    
    return {
      filename,
      type: TYPE_MAP[type] || type,
      type_zh: type,
      director: DIRECTOR_MAP[director] || director,
      director_zh: director,
      emotion: EMOTION_MAP[emotion] || emotion,
      emotion_zh: emotion,
      shotType: shotType,
      tech: tech
    };
  }

  /**
   * 构建技能索引（动态扫描目录）
   */
  _buildSkillIndex() {
    if (this.skillIndex) return this.skillIndex;
    
    const index = {};
    
    try {
      const files = fs.readdirSync(SKILL_LIBRARY_PATH).filter(f => f.endsWith('.md'));
      
      for (const file of files) {
        const meta = this._parseSkillFilename(file);
        
        // 多维索引
        const keys = [
          `${meta.type}_${meta.director}`,
          `${meta.type}_${meta.emotion}`,
          `${meta.type}_${meta.shotType}`,
          `${meta.director}_${meta.emotion}`,
          `${meta.type}_${meta.director}_${meta.shotType}`,
          `${meta.type}_${meta.director}_${meta.emotion}`,
          `${meta.type}`
        ];
        
        keys.forEach(k => {
          if (!k.includes('undefined')) {
            if (!index[k]) index[k] = [];
            index[k].push({ file, meta });
          }
        });
      }
      
      this.skillIndex = index;
      this.log('技能索引构建完成:', Object.keys(index).length, '个索引键');
      return index;
    } catch (err) {
      this.log('构建技能索引失败:', err.message);
      this.skillIndex = {};
      return {};
    }
  }

  /**
   * 读取技能文件内容
   */
  readSkillFile(skillIdOrFilename) {
    const filename = skillIdOrFilename.endsWith('.md') ? skillIdOrFilename : `${skillIdOrFilename}.md`;
    const filePath = path.join(SKILL_LIBRARY_PATH, filename);
    
    if (this.skillCache.has(filename)) {
      return this.skillCache.get(filename);
    }
    
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      this.skillCache.set(filename, content);
      return content;
    } catch (err) {
      return null;
    }
  }

  /**
   * 提取技能关键词（从技能文件内容）
   */
  extractSkillKeywords(skillIdOrFilename) {
    const skillContent = this.readSkillFile(skillIdOrFilename);
    
    if (!skillContent) {
      return { promptTerms: [], forbiddenTerms: [], mood: 'neutral' };
    }

    const promptTerms = [];
    const forbiddenTerms = [];
    let mood = 'neutral';

    // 提取情绪标签
    const moodMatch = skillContent.match(/情绪氛围[＝=]([^|\n]+)/);
    if (moodMatch) {
      mood = moodMatch[1].trim();
    }
    
    // 从AI提示词构建部分提取
    const lines = skillContent.split('\n');
    let inPromptSection = false;
    let inForbiddenSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('AI视频生成') || 
          trimmed.includes('AI提示词构建') || 
          trimmed.includes('基础提示词框架') ||
          trimmed.includes('提示词模板') ||
          trimmed.includes('Seedance 提示词')) {
        inPromptSection = true;
        inForbiddenSection = false;
      }
      
      if (trimmed.includes('禁止词') || trimmed.includes('禁止')) {
        inPromptSection = false;
        inForbiddenSection = true;
      }
      
      if (inPromptSection && (trimmed.match(/^[-•✅]\s+/) || trimmed.match(/^\s*[-•✅]\s+/))) {
        const term = trimmed.replace(/^[-•✅]\s*/, '').trim().split(',')[0];
        if (term && term.length > 10 && !term.includes('禁止') && !term.includes('**')) {
          promptTerms.push(term);
        }
      }
      
      if (inForbiddenSection && (trimmed.match(/^[-•❌]\s+/) || trimmed.match(/^\s*[-•❌]\s+/))) {
        const term = trimmed.replace(/^[-•❌]\s*/, '').trim();
        if (term && term.length > 2 && !term.includes('：')) {
          forbiddenTerms.push(term);
        }
      }
      
      if ((trimmed.startsWith('```') || trimmed.match(/^##\s/)) && 
          (inPromptSection || inForbiddenSection)) {
        if (trimmed.match(/^##\s/) && !trimmed.includes('AI') && !trimmed.includes('禁止')) {
          inPromptSection = false;
          inForbiddenSection = false;
        }
      }
    }
    
    // 备选提取
    if (promptTerms.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^-\s+[A-Za-z]/) && trimmed.length > 20) {
          const term = trimmed.replace(/^-\s*/, '').split(',')[0].trim();
          if (term && !term.includes('禁止') && !term.includes('**')) {
            promptTerms.push(term);
          }
        }
      }
    }
    
    return { 
      promptTerms: [...new Set(promptTerms)].slice(0, 10), 
      forbiddenTerms: [...new Set(forbiddenTerms)].slice(0, 20), 
      mood 
    };
  }

  /**
   * 从 shot 元数据提取匹配信息
   */
  _extractShotMetadata(shot) {
    const meta = {
      type: '',
      director: '',
      emotion: '',
      shotType: '',
      lighting: '',
      hasAerial: false,
      hasRain: false,
      hasNight: false,
      isEpic: false
    };
    
    const desc = (shot.description || '').toLowerCase();
    const camera = (shot.camera || '').toLowerCase();
    const mood = (shot.mood || '').toLowerCase();
    const lighting = (shot.lighting || '').toLowerCase();
    
    // 检测影片类型
    if (/科幻|alien|space|planet|starship|robot|未来/i.test(desc)) meta.type = 'sci-fi';
    else if (/战争|battle|army|soldier|war/i.test(desc)) meta.type = 'war';
    else if (/恐怖|horror|fear|monster|鬼|僵尸/i.test(desc)) meta.type = 'horror';
    else if (/喜剧|comedy|funny|laugh|搞笑/i.test(desc)) meta.type = 'comedy';
    else if (/悬疑|suspense|mystery|推理|侦探/i.test(desc)) meta.type = 'suspense';
    else if (/惊悚|thriller|追杀|逃|躲/i.test(desc)) meta.type = 'thriller';
    else if (/动作|action|打|格斗|枪|爆炸|追/i.test(desc)) meta.type = 'action';
    else if (/纪录片|documentary|记录|纪实|访谈|采访|科普|教育|edu|medical|hospital|doctor|nurse|patient|health/i.test(desc)) meta.type = 'documentary';
    else if (/微表情|表情|特写|face|close-up|眼神|凝视|facial/i.test(desc)) meta.type = 'micro-expression';
    else if (/广告|commercial|product|brand|品牌|企业|宣传片|广告片/i.test(desc)) meta.type = 'commercial';
    else meta.type = 'drama';
    
    // 检测镜头类型
    if (/航拍|aerial|helicopter|drone|空中|俯|鸟瞰/i.test(camera + desc)) meta.shotType = 'aerial';
    else if (/斯坦尼康|steadicam|稳定器|滑轨|轨道|平滑|流畅/i.test(camera)) meta.shotType = 'steadicam';
    else if (/手持|handheld|跟拍|肩扛|纪录片|纪实|晃动|晃/i.test(camera)) meta.shotType = 'handheld';
    else if (/定场|establishing|全景|大景| wide|远景|开场|环境/i.test(camera + desc)) meta.shotType = 'establishing';
    
    // 检测情绪
    if (/史诗|epic|grand|宏大|壮丽|历史|大片|大场面/i.test(mood + desc)) { meta.emotion = 'epic'; meta.isEpic = true; }
    else if (/舞蹈|dance|跳舞|旋转|舞台|华尔兹|芭蕾/i.test(desc + camera)) { meta.emotion = 'dance'; }
    else if (/孤独|lonely|solitude|alone|寂寞|独自|一个人|无人|空/i.test(mood + desc)) { meta.emotion = 'lonely'; }
    else if (/紧张|tense|nervous|焦虑|紧迫|危急|危险|生死/i.test(mood + desc)) meta.emotion = 'tense';
    else if (/浪漫|romantic|love|爱情|恋人|甜蜜|温柔|吻/i.test(mood + desc)) meta.emotion = 'romantic';
    else if (/告别|farewell|depart|离别|分手|离开|送行| goodbye/i.test(mood + desc)) meta.emotion = 'farewell';
    else if (/救赎|redemption|拯救|希望|重生|改过|赎罪|原谅/i.test(mood + desc)) meta.emotion = 'redemption';
    else if (/温情|tender|warm|温暖|治愈|家庭|亲情|母爱|父爱|孩子/i.test(mood + desc)) meta.emotion = 'tender';
    else if (/神秘|mysterious|mystery|谜|秘密|未知|悬念|隐藏/i.test(mood + desc)) meta.emotion = 'mysterious';
    else if (/恐怖|horror|恐惧|惊吓|惊悚|噩梦|可怕|吓人/i.test(mood + desc)) meta.emotion = 'horror';
    else if (/悬疑|suspense|悬疑|推理|侦探|破案|追凶/i.test(mood + desc)) meta.emotion = 'suspenseful';
    else if (/情感|emotional|情绪|感动|泪|哭|伤心|难过|悲痛/i.test(mood + desc)) meta.emotion = 'emotional';
    else if (/喜剧|comedy|funny|搞笑|欢乐|幽默|笑|开心|快乐|轻松|愉快/i.test(mood + desc)) meta.emotion = 'comedy';
    
    // 检测导演风格
    if (/维伦纽瓦|villeneuve|dune|arrival|降临|沙丘|沙丘/i.test(desc)) meta.director = 'villeneuve';
    else if (/诺兰|nolan|inception|interstellar|dark|骑士|记忆|信条|奥本海默|敦刻尔克/i.test(desc)) meta.director = 'nolan';
    else if (/卡梅隆|cameron|avatar|terminator|titanic|阿凡达|泰坦尼克|终结者|异形/i.test(desc)) meta.director = 'cameron';
    else if (/库布里克|kubrick|2001|shining|闪灵|太空漫游|发条橙/i.test(desc)) meta.director = 'kubrick';
    else if (/斯皮尔伯格|spielberg|schindler|jaws|et|侏罗纪|拯救大兵|辛德勒|夺宝奇兵/i.test(desc)) meta.director = 'spielberg';
    else if (/斯科塞斯|scorsese|departed|goodfellas|taxi|出租车司机|爱尔兰人|赌城风云|华尔街之狼/i.test(desc)) meta.director = 'scorsese';
    
    // 检测特殊元素
    if (/雨|rain|雨夜|下雨| wet|潮湿|水滴/i.test(desc + mood)) meta.hasRain = true;
    if (/夜|night|黑暗|dark|black|夜色|深夜|半夜|凌晨/i.test(desc + mood)) meta.hasNight = true;
    if (/航拍|aerial|helicopter|drone|空中|俯|鸟瞰/i.test(camera + desc)) meta.hasAerial = true;
    
    return meta;
  }

  /**
   * 匹配技能（多维索引匹配）
   */
  _matchSkills(shotMeta, limit = 3) {
    const index = this._buildSkillIndex();
    const candidates = new Map();
    
    // 优先级1：类型+导演+情绪（最精确）
    if (shotMeta.type && shotMeta.director && shotMeta.emotion) {
      const key1 = `${shotMeta.type}_${shotMeta.director}`;
      const key2 = `${shotMeta.type}_${shotMeta.director}_${shotMeta.emotion}`;
      (index[key2] || index[key1] || []).forEach(item => {
        candidates.set(item.file, (candidates.get(item.file) || 0) + 30);
      });
    }
    
    // 优先级2：类型+导演
    if (shotMeta.type && shotMeta.director) {
      const key = `${shotMeta.type}_${shotMeta.director}`;
      (index[key] || []).forEach(item => {
        candidates.set(item.file, (candidates.get(item.file) || 0) + 20);
      });
    }
    
    // 优先级3：类型+情绪
    if (shotMeta.type && shotMeta.emotion) {
      const key = `${shotMeta.type}_${shotMeta.emotion}`;
      (index[key] || []).forEach(item => {
        candidates.set(item.file, (candidates.get(item.file) || 0) + 15);
      });
    }
    
    // 优先级4：类型匹配
    if (shotMeta.type) {
      const key = `${shotMeta.type}_`;
      Object.keys(index).forEach(k => {
        if (k.startsWith(shotMeta.type + '_')) {
          index[k].forEach(item => {
            candidates.set(item.file, (candidates.get(item.file) || 0) + 5);
          });
        }
      });
    }
    
    // 优先级4.5：通用技能匹配（所有类型均可匹配通用技能）
    const universalKeys = Object.keys(index).filter(k => k.startsWith('universal_'));
    universalKeys.forEach(k => {
      index[k].forEach(item => {
        candidates.set(item.file, (candidates.get(item.file) || 0) + 3);
      });
    });
    
    // 优先级5：航拍特殊处理
    if (shotMeta.shotType === 'aerial' || shotMeta.hasAerial) {
      if (shotMeta.type && shotMeta.director) {
        const key5 = `${shotMeta.type}_${shotMeta.director}_${shotMeta.shotType}`;
        const key5b = `${shotMeta.type}_${shotMeta.director}_航拍`;
        (index[key5] || index[key5b] || []).forEach(item => {
          candidates.set(item.file, (candidates.get(item.file) || 0) + 35);
        });
      }
      const key3 = `${shotMeta.type}_航拍`;
      (index[key3] || []).forEach(item => {
        candidates.set(item.file, (candidates.get(item.file) || 0) + 20);
      });
    }
    
    // 优先级6：雨夜特殊处理
    if (shotMeta.hasRain && shotMeta.emotion) {
      const rainKey = `${shotMeta.type || 'drama'}_${shotMeta.director || ''}`;
      (index[rainKey] || []).forEach(item => {
        if (item.meta.filename.includes('雨夜')) {
          candidates.set(item.file, (candidates.get(item.file) || 0) + 20);
        }
      });
    }
    
    // 排序并返回top N
    const sorted = [...candidates.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    
    return sorted.map(([file, score]) => {
      const meta = this._parseSkillFilename(file);
      const keywords = this.extractSkillKeywords(file);
      return { file, meta, score, keywords };
    });
  }

  /**
   * 增强 shot prompt（安全注入）
   */
  _enhanceShot(shot, matchedSkills) {
    if (!matchedSkills || matchedSkills.length === 0) return { shot, applied: false };
    
    const enhanced = JSON.parse(JSON.stringify(shot));
    const allTerms = [];
    const usedSkills = [];
    
    for (const skill of matchedSkills) {
      const terms = skill.keywords?.promptTerms || [];
      const selectedTerms = terms.slice(0, 3);
      allTerms.push(...selectedTerms);
      usedSkills.push({
        id: skill.meta.filename.replace('.md', ''),
        name: skill.meta.filename.replace('.md', ''),
        score: skill.score,
        terms: selectedTerms
      });
    }
    
    const uniqueTerms = [...new Set(allTerms)].slice(0, 6);
    
    if (uniqueTerms.length > 0) {
      const injection = `\n\n[Cinematography Enhancement] ${uniqueTerms.join(', ')}`;
      enhanced.prompt = (enhanced.prompt || '') + injection;
      if (enhanced._generatedPrompt) {
        enhanced._generatedPrompt = enhanced._generatedPrompt.trimEnd() + injection;
      }
    }
    
    enhanced._filmicSkills = usedSkills;
    enhanced._injectedTerms = uniqueTerms;
    
    return { shot: enhanced, applied: true, usedSkills, injectedTerms: uniqueTerms };
  }

  /**
   * 增强整个故事板（批量处理）
   */
  enhanceStoryboard(storyboard, filmType = 'universal') {
    if (!storyboard || !storyboard.shots) return storyboard;
    
    const enhanced = JSON.parse(JSON.stringify(storyboard));
    let enhancedCount = 0;
    let totalTerms = 0;
    const allUsedSkills = [];
    
    for (let i = 0; i < enhanced.shots.length; i++) {
      const shot = enhanced.shots[i];
      const meta = this._extractShotMetadata(shot);
      
      // 如果指定了 filmType，覆盖检测到的类型
      if (filmType && filmType !== 'universal') {
        meta.type = filmType;
      }
      
      const matched = this._matchSkills(meta, 2).filter(s => s.score >= 5);
      
      if (matched.length > 0) {
        const result = this._enhanceShot(shot, matched);
        if (result.applied) {
          enhanced.shots[i] = result.shot;
          enhancedCount++;
          totalTerms += result.injectedTerms.length;
          allUsedSkills.push(...result.usedSkills);
        }
      }
    }
    
    enhanced._stage84Applied = true;
    enhanced._filmicSkillsUsed = allUsedSkills;
    enhanced._enhancementStats = {
      totalShots: enhanced.shots.length,
      enhancedShots: enhancedCount,
      totalTerms,
      uniqueSkills: [...new Set(allUsedSkills.map(s => s.id))].length
    };
    
    return enhanced;
  }

  /**
   * 增强单个 prompt（简化 API）
   * v6.5.65-P8-fix: 当指定类型匹配不到技能时，fallback 到 documentary/drama/universal
   */
  enhancePrompt(basePrompt, cinematographyMeta = {}, filmType = 'universal') {
    const meta = {
      type: filmType || 'universal',
      director: cinematographyMeta.director || '',
      emotion: cinematographyMeta.mood || cinematographyMeta.emotion || '',
      shotType: cinematographyMeta.shotType || cinematographyMeta.camera || '',
      lighting: cinematographyMeta.lighting || ''
    };
    
    let matched = this._matchSkills(meta, 2).filter(s => s.score >= 5);
    
    // v6.5.65-P8-fix: fallback 链
    if (matched.length === 0) {
      const fallbackChain = ['documentary', 'drama', 'universal'];
      for (const fallbackType of fallbackChain) {
        if (meta.type === fallbackType) continue; // 避免重复匹配
        meta.type = fallbackType;
        matched = this._matchSkills(meta, 2).filter(s => s.score >= 5);
        if (matched.length > 0) break;
      }
    }
    
    if (matched.length === 0) {
      return { enhancedPrompt: basePrompt, usedSkills: [], injectedTerms: [] };
    }
    
    const allTerms = [];
    const usedSkills = [];
    
    for (const skill of matched) {
      const terms = skill.keywords?.promptTerms || [];
      const selectedTerms = terms.slice(0, 3);
      allTerms.push(...selectedTerms);
      usedSkills.push({
        id: skill.meta.filename.replace('.md', ''),
        name: skill.meta.filename.replace('.md', ''),
        score: skill.score,
        terms: selectedTerms
      });
    }
    
    const uniqueTerms = [...new Set(allTerms)].slice(0, 6);
    const enhancedPrompt = basePrompt + '\n\n[Cinematography Enhancement] ' + uniqueTerms.join(', ');
    
    return { enhancedPrompt, usedSkills, injectedTerms: uniqueTerms };
  }

  /**
   * 获取技能库统计
   */
  getStats() {
    const index = this._buildSkillIndex();
    const files = fs.readdirSync(SKILL_LIBRARY_PATH).filter(f => f.endsWith('.md'));
    
    const types = {};
    const directors = {};
    
    for (const file of files) {
      const meta = this._parseSkillFilename(file);
      types[meta.type] = (types[meta.type] || 0) + 1;
      directors[meta.director] = (directors[meta.director] || 0) + 1;
    }
    
    return {
      totalSkills: files.length,
      totalIndexKeys: Object.keys(index).length,
      types,
      directors,
      libraryPath: SKILL_LIBRARY_PATH
    };
  }
}

// 导出兼容API
const router = new CinematographySkillRouter();

module.exports = {
  CinematographySkillRouter,
  
  // 安全常量
  CONTENT_SAFE_DIMENSIONS: [
    'script', 'story', 'narrative', 'dialogue', 'character', 
    'content', 'fact', 'data', 'information', 'medical', 
    'brand_info', 'product_info'
  ],
  EXTERIOR_DIMENSIONS: [
    'style', 'camera', 'lighting', 'art_direction', 'composition', 
    'color', 'tone', 'mood', 'atmosphere', 'render'
  ],
  FILM_TYPES: {
    'drama': '剧情片',
    'action': '动作片',
    'comedy': '喜剧片',
    'horror': '恐怖片',
    'suspense': '悬疑片',
    'thriller': '惊悚片',
    'war': '战争片',
    'sci-fi': '科幻片',
    'loneliness': '孤独',
    'micro-expression': '微表情',
    'documentary': '纪录片',
    'commercial': '广告片',
    'brand': '品牌片',
    'educational': '科普片',
    'universal': '通用'
  },
  
  // 原API兼容
  enhancePromptWithFilmicSkills: (basePrompt, cinematographyMeta, filmType) => 
    router.enhancePrompt(basePrompt, cinematographyMeta, filmType),
  
  enhanceStoryboard: (storyboard, filmType) => 
    router.enhanceStoryboard(storyboard, filmType),
  
  isSkillLibraryAvailable: () => {
    try {
      return fs.existsSync(SKILL_LIBRARY_PATH) && 
             fs.readdirSync(SKILL_LIBRARY_PATH).filter(f => f.endsWith('.md')).length > 0;
    } catch (e) { return false; }
  },
  
  getSkillLibraryStats: () => router.getStats(),
  
  getSupportedFilmTypes: () => Object.keys(TYPE_MAP),
  
  // 新API
  router
};

// CLI测试
if (require.main === module) {
  console.log('=== 通用电影摄影技能库统计 ===');
  console.log(JSON.stringify(router.getStats(), null, 2));
  
  console.log('\n=== 测试增强 - 纪录片 ===');
  const test1 = router.enhancePrompt(
    'DIRECTOR: 专业医疗科普纪录片。SCENE: 医院讲堂。CAMERA: 中景稳定。LIGHTING: 自然柔和。AUDIO: 清晰人声。RENDER: 4K高品质。',
    { camera: 'medium_shot', mood: 'professional', lighting: 'soft' },
    'documentary'
  );
  console.log('使用技能:', test1.usedSkills.map(s => s.name).join(', '));
  console.log('注入术语:', test1.injectedTerms);
  
  console.log('\n=== 测试增强 - 剧情片 ===');
  const test2 = router.enhancePrompt(
    'DIRECTOR: 剧情片。SCENE: 咖啡馆对话。CAMERA: 正反打。LIGHTING: 柔和暖光。RENDER: 4K。',
    { camera: 'medium_shot', mood: 'dialogue', lighting: 'soft' },
    'drama'
  );
  console.log('使用技能:', test2.usedSkills.map(s => s.name).join(', '));
  console.log('注入术语:', test2.injectedTerms);
  
  console.log('\n=== 测试增强 - 科幻片 ===');
  const test3 = router.enhancePrompt(
    'DIRECTOR: 科幻史诗。SCENE: 外星沙漠星球航拍。CAMERA: IMAX航拍。LIGHTING: 黄金时刻体积光。',
    { camera: 'aerial', mood: 'epic', lighting: 'volumetric' },
    'sci-fi'
  );
  console.log('使用技能:', test3.usedSkills.map(s => s.name).join(', '));
  console.log('注入术语:', test3.injectedTerms);
}

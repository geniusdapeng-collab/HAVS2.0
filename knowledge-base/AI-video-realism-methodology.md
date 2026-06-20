# AI视频画面真实感方法论

> **定位说明**：本方法论为软性知识注入层，不改变现有系统技术架构、主链路模块及字段定义，仅作为提示词策略的知识底座与参数选择参考体系，通过调整提示词构建方式提升输出画面的真实感指数。

---

## 一、核心设计理念

### 1.1 真实感的本质："有瑕疵的完美"

AI生成内容的典型特征是"过度平滑"——皮肤无瑕、光线过于均匀、材质缺乏微观细节。真实感的核心悖论在于：**适度的不完美比完美本身更真实**。方法论的所有参数选择均围绕"引入受控瑕疵"这一底层逻辑展开。

### 1.2 器材即语法

指定真实摄影器材不仅是装饰性描述，而是向AI传递一整套光学特性的隐式约束——镜头畸变、焦外散景、色散、暗角、宽容度等。器材关键词是最具性价比的真实感锚点。

### 1.3 自然法则优先于美学法则

真实世界中不存在完美打光。阴天漫射光、软阴影、风吹动态等"不可控自然元素"是区分AI感与真实感的快速判定指标。优先模拟自然光的随机性与不完美性。

---

## 二、质感参数体系（七维模型）

系统可参照以下七维度构建提示词，无需新增字段，可作为现有提示词字段的内容填充指南。

### 2.1 摄影机维度（Camera Body）

| 优先级 | 推荐关键词 | 作用说明 |
|:---:|---|---|
| **首选** | `Arri Alexa 65` / `Arri Alexa Mini LF` | 65mm大画幅传感器，浅景深基础，电影级宽容度 |
| 备选 | `RED V-RAPTOR`, `Sony Venice 2` | 同为电影级摄影机，可作为变体丰富随机性 |
| 辅助 | `65mm sensor`, `large format`, `IMAX 70mm` | 强化画幅感知，增加画面厚重感 |

**注入建议**：在现有"摄影机/设备"相关字段中，优先填充Arri Alexa系列而非通用"camera"。

### 2.2 镜头维度（Lens System）

| 优先级 | 推荐关键词 | 作用说明 |
|:---:|---|---|
| **首选** | `Cooke S7/i` | Cook镜头独特的"Cooke Look"——温暖、柔和、具有复古真实感 |
| 首选 | `Arri Master Prime` | 锐度与散景平衡，现代电影标准镜头 |
| 备选 | `Leica Summilux`, `Zeiss Otus`, `Panavision Primo` | 不同光学个性，丰富镜头语言库 |
| 关键修饰 | `anamorphic 2.39:1` | 变形宽银幕比例，水平拉丝焦外， instantly 提升电影感 |
| 关键修饰 | `widescreen cinematic` | 宽幅构图引导，强化画幅感知 |

**注入建议**：在"镜头/光学"相关字段中，采用"品牌+型号+画幅比例"的三段式结构，避免单独使用"cinematic lens"等泛化描述。

### 2.3 光圈与景深维度（Aperture & DOF）

| 优先级 | 推荐关键词 | 作用说明 |
|:---:|---|---|
| **首选** | `f/1.8` - `f/2.8` | 浅景深范围，真实电影镜头常用区间 |
| 关键修饰 | `shallow DOF` | 明确浅景深指令 |
| 关键修饰 | `soft bokeh` | 柔和焦外散景，避免AI生成生硬边缘 |
| 关键修饰 | `background falls off smoothly` | 焦外过渡自然性 |
| 进阶 | `tack sharp focus on subject eyes` | 主体眼部精准对焦，其余自然虚化 |

**注入建议**：光圈数值是真实感的关键杠杆。避免使用`f/8` - `f/16`等深景深参数（易显AI合成感），保持在`f/1.4` - `f/2.8`的浅景深区间。

### 2.4 光线维度（Lighting）

| 优先级 | 推荐关键词 | 作用说明 |
|:---:|---|---|
| **首选** | `natural diffused overcast` | 阴天漫射光，无硬阴影，最自然的日常光感 |
| 首选 | `soft shadows` | 柔和阴影边缘，避免生硬明暗交界 |
| 禁忌 | ~~no hard light~~ | 明确排除硬光，消除"影棚感" |
| 备选 | `golden hour soft sunlight` | 黄金时段柔光，暖调氛围 |
| 备选 | `overcast skylight` | 天光漫射，色温中性 |
| 备选 | `practical lights visible in frame` | 画面内可见实际光源（台灯、窗户等），增强场景可信度 |
| 进阶 | `subtle rim light separating subject from background` | 轮廓光分离主体与背景，增加空间层次 |

**注入建议**：光线字段遵循"漫射光优先，硬光为禁忌"的优先级。阴天光是最安全的真实感默认选项。

### 2.5 色彩维度（Color Science）

| 优先级 | 推荐关键词 | 作用说明 |
|:---:|---|---|
| **首选** | `muted desaturated earth tones` | 低饱和度大地色系， instantly 降低"AI鲜艳感" |
| 首选 | `teal shadows, warm highlights` | 青橙分离调色，电影级色彩对比 |
| 辅助 | `cinematic LUT` | 电影级查找表色彩映射 |
| 辅助 | `Kodak Vision3 500T color science` | 胶片色彩科学参考 |
| 辅助 | `subtle color separation` | 色彩层次分离，避免色块平涂 |
| 禁忌 | ~~highly saturated~~ / ~~vivid colors~~ | 高饱和是AI感的典型特征，需明确规避 |

**注入建议**：色彩字段的核心理念是"减法"——降低饱和度、压缩色域、追求色彩的灰度与厚重感，而非鲜艳与纯净。

### 2.6 材质与微观细节维度（Material & Micro-Detail）

| 优先级 | 推荐关键词 | 作用说明 |
|:---:|---|---|
| **首选** | `subsurface scattering` | 次表面散射，皮肤透光感，真实感关键指标 |
| 首选 | `individual fur strands` / `individual hair strands` | 独立发丝/毛丝，打破AI的块状毛发模式 |
| 首选 | `skin pores visible` | 可见皮肤毛孔，引入微观不完美 |
| 首选 | `fabric weave texture` | 织物编织纹理，材质可触感 |
| 辅助 | `subtle imperfections` | 轻微不完美（雀斑、细纹、微小瑕疵） |
| 辅助 | `microscopic surface detail` | 微观表面细节 |
| 进阶 | `dust particles in sunlight` | 光尘粒子，空气透视与体积感 |
| 进阶 | `tiny water droplets on skin` | 皮肤微小水珠，增强材质真实度 |

**注入建议**：材质字段是"受控瑕疵"的核心载体。微观细节的密度与真实感正相关——毛孔、发丝、织纹是三个最高ROI的关键词。

### 2.7 动态与氛围维度（Motion & Atmosphere）

| 优先级 | 推荐关键词 | 作用说明 |
|:---:|---|---|
| **首选** | `motion blur on fast elements` | 快速元素动态模糊，符合真实摄影曝光原理 |
| **首选** | `wind blowing hair and fabric` | 风吹发丝与衣角——"最廉价的真实感工具" |
| 首选 | `dust particles floating in air` | 浮尘颗粒，空间体积感与空气透视 |
| 辅助 | `shallow depth breathing motion` | 细微呼吸感动态 |
| 辅助 | `natural micro-movements` | 自然微动作，打破AI的"冻结感" |
| 进阶 | `lens flare from practical light` | 镜头光晕，光学瑕疵增加真实度 |
| 进阶 | `handheld camera subtle shake` | 手持摄影机轻微晃动，纪录片质感 |

**注入建议**：动态字段是区分"照片感"与"视频感"的关键。风、动态模糊、浮尘是三个必须优先填充的关键词。

### 2.8 噪点与颗粒维度（Grain & Texture）

| 优先级 | 推荐关键词 | 作用说明 |
|:---:|---|---|
| **首选** | `subtle film grain` | 轻微胶片颗粒，掩盖AI过度平滑 |
| 辅助 | `organic texture` | 有机纹理，自然随机感 |
| 辅助 | `RAW quality` | RAW格式质感，高宽容度细节保留 |
| 辅助 | `fine noise structure` | 精细噪点结构 |
| 禁忌 | ~~overly clean digital look~~ | 明确排除过度干净的数字感 |
| 进阶 | `Kodak 5219 grain structure` | 特定胶片型号颗粒特征 |

**注入建议**：颗粒字段是"最后的真实感补丁"——在画面其他维度已达标的情况下，适度的颗粒可以将真实感提升一个台阶，同时掩盖AI生成的平滑痕迹。

---

## 三、提示词组合策略

### 3.1 核心组合公式（Base Formula）

```
[摄影机] + [镜头+画幅] + [光圈/景深] + [光线] + [色彩] + [材质细节] + [动态氛围] + [颗粒]
```

**示例组合**：

```
Arri Alexa 65, Cooke S7/i lens, anamorphic 2.39:1 widescreen cinematic, 
f/2.0 shallow DOF with soft bokeh, natural diffused overcast lighting with soft shadows, 
no hard light, muted desaturated earth tones with teal shadows and warm highlights, 
cinematic LUT, subsurface scattering on skin, individual hair strands visible, 
skin pores and subtle imperfections, wind blowing hair and fabric, 
motion blur on fast elements, dust particles floating in air, subtle film grain, organic texture
```

### 3.2 优先级注入策略

系统可根据不同场景采用分层注入策略，无需新增字段，仅在现有字段内调整关键词选择：

| 场景类型 | 核心锚点 | 可省略维度 | 必须保留维度 |
|---|---|---|---|
| **通用默认** | 器材+光学 | 无 | 全部七维 |
| **快速生成** | 摄影机+光圈+光线 | 颗粒、动态氛围 | 摄影机、镜头、光圈、光线 |
| **人物特写** | 材质微观细节+景深 | 动态氛围可弱化 | 光圈、光线、色彩、材质 |
| **自然/动物** | 动态氛围+材质 | 色彩可简化 | 摄影机、光圈、材质、动态 |
| **室内场景** | 光线+色彩 | 动态氛围可弱化 | 摄影机、镜头、光线、色彩、颗粒 |
| **纪录片风格** | 手持感+颗粒+光线 | 浅景深可适度放开 | 光线、颗粒、动态氛围 |

### 3.3 关键词权重分配建议

在现有系统的提示词字段中，可按以下权重分配关键词密度（不需要新增字段，仅作为填充密度的参考）：

| 权重 | 维度 | 关键词数量占比 |
|:---:|---|:---:|
| **高** | 摄影机+镜头+画幅 | 20% |
| **高** | 材质微观细节 | 20% |
| **中** | 光圈+景深 | 15% |
| **中** | 光线 | 15% |
| **中** | 色彩 | 15% |
| **低** | 动态氛围 | 10% |
| **低** | 颗粒噪点 | 5% |

---

## 四、禁忌清单（Anti-Patterns）

以下关键词或描述模式应主动规避，它们是"AI感"的主要来源：

| 禁忌类型 | 具体示例 | 替代方案 |
|---|---|---|
| 过度美化 | ~~perfect skin~~ / ~~flawless complexion~~ | `skin pores`, `subtle imperfections` |
| 高饱和度 | ~~vivid colors~~ / ~~highly saturated~~ / ~~colorful~~ | `muted`, `desaturated`, `earth tones` |
| 完美打光 | ~~studio lighting~~ / ~~perfect lighting~~ / ~~professional lighting setup~~ | `natural diffused overcast` |
| 硬阴影 | ~~dramatic hard shadows~~ | `soft shadows`, `no hard light` |
| 深景深 | ~~everything in sharp focus~~ / ~~deep depth of field~~ | `shallow DOF`, `f/1.8` |
| 数字干净感 | ~~clean digital look~~ / ~~crisp sharp~~ | `subtle film grain`, `organic texture` |
| 泛化描述 | ~~cinematic~~ / ~~photorealistic~~（单独使用） | 配合具体器材参数使用 |
| 冻结画面 | ~~static pose~~ / ~~frozen moment~~ | `natural micro-movements`, `wind effects` |

---

## 五、场景化提示词模板

以下模板可直接作为现有字段的填充参考，根据实际场景选择适配版本：

### 5.1 人物写实模板（Portrait Realism）

```
Shot on Arri Alexa 65 with Cooke S7/i lens, anamorphic 2.39:1, 
f/1.8 shallow DOF soft bokeh background falls off smoothly, 
natural diffused overcast lighting soft shadows no hard light, 
muted desaturated earth tones teal shadows warm highlights cinematic LUT, 
subsurface scattering skin pores visible individual hair strands 
subtle imperfections, wind blowing hair motion blur on fast movements, 
subtle film grain organic texture
```

### 5.2 野生动物/自然纪录片模板（Wildlife Documentary）

```
Arri Alexa Mini LF, Master Prime lens, widescreen cinematic, 
f/2.8 shallow DOF, natural diffused overcast soft shadows, 
muted earth tones, individual fur strands visible subsurface scattering 
on ears and nose, wind blowing fur and grass, dust particles in air, 
motion blur on fast movements, documentary wildlife photography style 
National Geographic, subtle film grain RAW quality
```

### 5.3 室内场景模板（Interior Scene）

```
Arri Alexa 65, Cooke S7/i, 2.39:1 anamorphic, f/2.0 shallow DOF, 
natural light through window diffused overcast soft shadows, 
practical lights visible in frame, muted desaturated warm earth tones 
teal shadows cinematic LUT, fabric weave texture visible on furniture, 
skin pores on people, subtle film grain organic texture, 
subtle rim light separating subjects from background
```

### 5.4 快速通用模板（Minimal Base）

当字段长度受限时，使用最小有效组合：

```
Arri Alexa 65, Cooke S7/i, f/2.0 shallow DOF, natural diffused overcast, 
muted earth tones, skin pores subsurface scattering, wind motion, 
subtle film grain
```

---

## 六、质量检验指标（真实感自检清单）

生成结果可通过以下指标快速评估真实感水平，无需新增技术模块，可作为人工审核或自动评分的参考维度：

| 检验项 | 通过标准 | 常见问题 |
|:---:|---|---|
| **光学可信度** | 焦外散景形状自然，符合镜头特征 | 焦外边缘生硬、散景形状不一致 |
| **皮肤质感** | 可见毛孔/细纹，有次表面散射透光感 | 皮肤像蜡像/塑料，过度光滑 |
| **毛发细节** | 发丝/毛丝独立可见，有风吹动态 | 毛发呈块状或片状，无单丝感 |
| **光影自然度** | 阴影边缘柔和，光源方向一致 | 阴影过硬、多光源冲突 |
| **色彩真实度** | 低饱和、有灰度、无荧光感 | 色彩过于鲜艳或纯净 |
| **动态合理性** | 运动模糊符合速度，风吹自然 | 运动无模糊或模糊过度 |
| **颗粒一致性** | 颗粒分布均匀，大小自然 | 颗粒过大、分布不均或完全无颗粒 |
| **材质区分度** | 不同材质（皮肤/布料/金属）质感差异明显 | 所有材质质感雷同 |

---

## 七、软性注入实施建议

### 7.1 注入层级选择

根据现有系统架构，可选择以下注入层级（均不改变字段和模块结构）：

| 层级 | 实施方式 | 侵入性 | 效果 |
|---|---|:---:|---|
| **提示词前缀层** | 将核心组合公式作为前缀自动拼接至用户提示词 | 无 | 全局生效，简单直接 |
| **字段默认值层** | 将推荐关键词设为各字段的默认填充值 | 无 | 用户未指定时自动生效 |
| **同义词映射层** | 将禁忌词汇映射到推荐替代词 | 无 | 自动修正常见AI感描述 |
| **后置增强层** | 在提示词提交前进行关键词补全检查 | 无 | 智能补全缺失维度 |

### 7.2 推荐注入路径

1. **首选路径**：字段默认值层 + 同义词映射层——在不改变任何字段的前提下，将本方法论的推荐关键词设为各字段的默认候选词，同时建立禁忌词到推荐词的自动映射表。

2. **辅助路径**：后置增强层——在提示词最终提交前，检查七维参数覆盖度，对缺失维度进行智能补全（如未指定光线则自动追加`natural diffused overcast`）。

### 7.3 维护与迭代

- **版本化**：将本方法论作为独立知识库版本管理，与系统版本解耦
- **A/B测试**：可选取不同场景对比"方法论注入组"与"对照组"的真实感评分
- **持续扩展**：根据新场景的测试反馈，向各维度关键词库中补充新的有效词汇

---

## 八、快速参考卡片

### 真实感七字诀

> **器镜虚光阴材动粒**
>
> 器（摄影机）→ 镜（镜头）→ 虚（浅景深）→ 光（漫射光）→ 阴（柔和阴影）→ 材（微观材质）→ 动（风与动态）→ 粒（胶片颗粒）

### 最高ROI关键词 TOP 10

1. `Arri Alexa 65` — 器材锚定
2. `Cooke S7/i` — 光学个性
3. `f/2.0 shallow DOF` — 浅景深
4. `natural diffused overcast` — 自然漫射光
5. `muted desaturated earth tones` — 低饱和色彩
6. `subsurface scattering` — 次表面散射
7. `skin pores visible` — 皮肤毛孔
8. `wind blowing hair` — 风动效果
9. `motion blur` — 动态模糊
10. `subtle film grain` — 胶片颗粒

---

*本方法论为软性知识资产，可随时独立迭代更新，与系统技术架构保持解耦。*

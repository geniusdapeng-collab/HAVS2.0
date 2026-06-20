# RunPod Serverless Stable Diffusion WebUI 模板

## 概述

这是一个为 **RunPod Serverless** 定制的 Stable Diffusion WebUI 模板，基于 AUTOMATIC1111 的 WebUI，预装 `majicMIX realistic` 模型（麦橘写实），支持文生图、图生图和 ControlNet。

## 特性

- ✅ 基于 AUTOMATIC1111 Stable Diffusion WebUI
- ✅ 预装 `majicMIX_realistic_v6` 模型（麦橘写实）
- ✅ 支持 Serverless API 模式
- ✅ 文生图 (txt2img)
- ✅ 图生图 (img2img)
- ✅ ControlNet 支持
- ✅ XFormers 加速
- ✅ 自动模型下载

---

## 快速部署指南

### 方式一：一键部署（推荐）

```bash
cd runpod-sd-template
chmod +x deploy.sh
./deploy.sh
```

脚本会引导你完成：
1. 构建 Docker 镜像
2. 推送到 Registry
3. 创建 RunPod Serverless Endpoint

### 方式二：手动部署

#### 步骤 1: 构建 Docker 镜像

```bash
cd runpod-sd-template
chmod +x build.sh
./build.sh
```

#### 步骤 2: 推送到 Registry

```bash
docker push your-registry/runpod-sd-webui:latest
```

#### 步骤 3: 在 RunPod 创建 Serverless Endpoint

1. 登录 [RunPod 控制台](https://www.runpod.io/console)
2. 点击 **Serverless** → **Create Endpoint**
3. 配置：

| 配置项 | 推荐值 |
|--------|--------|
| **Name** | `sd-webui-majicmix` |
| **Template** | Custom Template |
| **Image** | `your-registry/runpod-sd-webui:latest` |
| **GPU** | RTX 3090 或 4090 |
| **Memory** | 16GB |
| **Workers** | 1-3 |
| **FlashBoot** | 启用（加速启动） |

#### 步骤 4: 获取 API 密钥

在 RunPod 控制台获取你的 **API Key**。

#### 步骤 5: 测试 API

```bash
# 安装依赖
pip install requests pillow

# 修改 test.py 中的 API key 和 endpoint ID
python test.py
```

---

## API 使用指南

### 文生图 (txt2img)

```python
import requests

API_KEY = "your-api-key"
ENDPOINT_ID = "your-endpoint-id"

payload = {
    "input": {
        "operation": "txt2img",
        "prompt": "1girl, realistic, portrait, high quality, detailed face, soft lighting, 8k uhd",
        "negative_prompt": "blurry, low quality, distorted, ugly, bad anatomy, watermark, signature",
        "width": 512,
        "height": 512,
        "steps": 20,
        "cfg_scale": 7.0,
        "sampler_name": "DPM++ 2M Karras",
        "seed": -1,
        "model": "majicMIX_realistic_v6.safetensors"
    }
}

response = requests.post(
    f"https://api.runpod.ai/v2/{ENDPOINT_ID}/run",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json=payload
)

# 获取任务 ID
job_id = response.json()["id"]

# 查询结果（轮询）
while True:
    status = requests.get(
        f"https://api.runpod.ai/v2/{ENDPOINT_ID}/status/{job_id}",
        headers={"Authorization": f"Bearer {API_KEY}"}
    ).json()
    
    if status["status"] == "COMPLETED":
        images = status["output"]["images"]
        # 保存图片...
        break
    elif status["status"] == "FAILED":
        print("任务失败")
        break
    
    time.sleep(2)
```

### 图生图 (img2img)

```python
import base64

# 读取图片并编码为 base64
with open("input.png", "rb") as f:
    img_base64 = base64.b64encode(f.read()).decode()

payload = {
    "input": {
        "operation": "img2img",
        "init_image": f"data:image/png;base64,{img_base64}",
        "prompt": "1girl, realistic, portrait, high quality",
        "denoising_strength": 0.75,  # 重绘幅度
        "width": 512,
        "height": 512,
        "model": "majicMIX_realistic_v6.safetensors"
    }
}
```

### ControlNet

```python
payload = {
    "input": {
        "operation": "controlnet",
        "init_image": f"data:image/png;base64,{img_base64}",
        "prompt": "1girl, realistic, portrait",
        "preprocessor": "canny",           # 预处理器：canny/openpose/depth
        "controlnet_model": "control_v11p_sd15_canny",
        "weight": 1.0,                    # ControlNet 权重
        "threshold_a": 100,
        "threshold_b": 200,
        "model": "majicMIX_realistic_v6.safetensors"
    }
}
```

---

## 自定义配置

### 修改模型

编辑 `Dockerfile`，修改模型下载链接：

```dockerfile
# 下载其他模型（替换链接）
RUN wget -O models/Stable-diffusion/your-model.safetensors \
    "https://civitai.com/api/download/models/..."
```

### 添加 LoRA

```dockerfile
RUN mkdir -p models/Lora && \
    wget -O models/Lora/your-lora.safetensors \
    "https://civitai.com/api/download/models/..."
```

### 添加 ControlNet 模型

```dockerfile
RUN mkdir -p models/ControlNet && \
    wget -O models/ControlNet/control_v11p_sd15_openpose.pth \
    "https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11p_sd15_openpose.pth"
```

### 修改环境变量

编辑 `Dockerfile` 或 `runpod-template.json`：

```json
{
  "key": "SD_WEBUI_API_MODE",
  "value": "true"
}
```

---

## 文件结构

```
runpod-sd-template/
├── Dockerfile                    # Docker 镜像定义
├── handler.py                    # RunPod Serverless Handler（主逻辑）
├── start.sh                      # 启动脚本
├── build.sh                      # 构建脚本
├── deploy.sh                     # 一键部署脚本
├── test.py                       # 测试脚本
├── runpod-template.json          # RunPod 模板配置
└── README.md                     # 本文件
```

---

## 常见问题排查

### 问题 1: 模型未找到

```
⚠️ 模型未找到，尝试下载...
```

**解决方案：**
- 检查网络连接
- 手动下载模型并放入 `models/Stable-diffusion/` 目录
- 或使用 HuggingFace 镜像链接

### 问题 2: 服务启动超时

```
❌ WebUI 服务启动超时
```

**解决方案：**
- 检查 GPU 是否可用：`nvidia-smi`
- 检查内存是否足够（建议 16GB+）
- 检查 Docker 日志：`docker logs <container_id>`

### 问题 3: API 返回 500 错误

```
❌ 错误: 500
```

**解决方案：**
- 检查 WebUI 日志：`docker logs <container_id>`
- 检查模型是否正确加载
- 检查模型文件是否完整（未被截断）

### 问题 4: 图片生成速度慢

**解决方案：**
- 启用 FlashBoot（缩短启动时间）
- 使用 XFormers 加速（已默认启用）
- 减少 steps（建议 20-30）
- 使用较小的分辨率（512x512 或 768x768）

### 问题 5: 内存不足 (OOM)

**解决方案：**
- 使用更高内存的 GPU（如 24GB）
- 降低 batch_size（设为 1）
- 使用 --medvram 或 --lowvram 参数

---

## 参考链接

- [RunPod Serverless 文档](https://docs.runpod.io/serverless/overview)
- [Stable Diffusion WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
- [majicMIX realistic](https://civitai.com/models/43331/majicmix-realistic)
- [ControlNet](https://github.com/lllyasviel/ControlNet)

---

## 许可证

MIT License - 基于 Stable Diffusion WebUI 的 AGPL 许可证

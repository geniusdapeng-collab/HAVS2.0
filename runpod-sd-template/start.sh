#!/bin/bash

# RunPod Serverless Stable Diffusion WebUI 启动脚本

echo "🚀 启动 RunPod Serverless Stable Diffusion WebUI"
echo "================================================"

# 检查环境
if [ -z "$RUNPOD_POD_ID" ]; then
    echo "⚠️ 非 RunPod 环境，使用本地模式"
fi

# 检查模型是否存在
MODEL_PATH="/workspace/stable-diffusion-webui/models/Stable-diffusion/majicMIX_realistic_v6.safetensors"
if [ ! -f "$MODEL_PATH" ]; then
    echo "⚠️ 模型未找到，尝试下载..."
    mkdir -p /workspace/stable-diffusion-webui/models/Stable-diffusion
    
    # 使用 civitai 下载链接（可能需要 API key）
    # 或者使用 HuggingFace 镜像
    wget -O "$MODEL_PATH" \
        "https://civitai.com/api/download/models/94640?type=Model&format=SafeTensor&size=pruned&fp=fp16" \
        || echo "❌ 模型下载失败，请手动上传"
fi

# 启动 WebUI（API 模式）
echo "🎨 启动 Stable Diffusion WebUI API 服务..."
cd /workspace/stable-diffusion-webui

python launch.py \
    --api \
    --listen \
    --port 7860 \
    --enable-insecure-extension-access \
    --no-gradio-queue \
    --no-hashing \
    --xformers \
    --precision full \
    --opt-channelslast \
    --no-download-sd-model &

WEBUI_PID=$!

# 等待服务就绪
echo "⏳ 等待服务就绪..."
for i in {1..60}; do
    if curl -s http://localhost:7860/sdapi/v1/sd-models > /dev/null 2>&1; then
        echo "✅ WebUI 服务已就绪"
        break
    fi
    sleep 2
    echo "   等待中... ($i/60)"
done

# 启动 RunPod serverless handler
echo "🎯 启动 RunPod Serverless Handler..."
python /workspace/handler.py

# 清理
kill $WEBUI_PID 2>/dev/null

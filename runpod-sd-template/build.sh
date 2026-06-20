#!/bin/bash

# RunPod SD WebUI 构建脚本

set -e

# 配置
DOCKER_IMAGE_NAME="runpod-sd-webui"
DOCKER_TAG="latest"
RUNPOD_REGISTRY="your-runpod-registry"

echo "🔨 构建 RunPod Stable Diffusion WebUI 模板"
echo "============================================"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    exit 1
fi

# 构建镜像
echo "📦 构建 Docker 镜像..."
docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} .

# 标记镜像
echo "🏷️ 标记镜像..."
docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} ${RUNPOD_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}

# 推送镜像（如果需要）
echo "📤 推送到 RunPod Registry..."
echo "docker push ${RUNPOD_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"

echo "✅ 构建完成"
echo ""
echo "下一步："
echo "1. 推送镜像到 RunPod Registry:"
echo "   docker push ${RUNPOD_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
echo ""
echo "2. 在 RunPod 控制台创建 Serverless Endpoint："
echo "   - 选择 'Serverless' -> 'Create Endpoint'"
echo "   - 选择自定义镜像: ${RUNPOD_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
echo "   - 配置 GPU 类型 (推荐 RTX 3090/4090)"
echo "   - 设置内存: 16-32GB"
echo "   - 配置并发: 1-3 workers"
echo ""
echo "3. 测试 Endpoint："
echo "   使用提供的 test.py 脚本"

# 保存镜像 ID
IMAGE_ID=$(docker images -q ${DOCKER_IMAGE_NAME}:${DOCKER_TAG})
echo ""
echo "📋 镜像信息："
echo "   名称: ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
echo "   ID: ${IMAGE_ID}"

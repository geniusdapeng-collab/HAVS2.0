#!/bin/bash

# RunPod SD WebUI 快速部署脚本
# 一键构建、推送、创建 Endpoint

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量（需要用户修改）
RUNPOD_API_KEY="${RUNPOD_API_KEY:-your-api-key}"
RUNPOD_REGISTRY="${RUNPOD_REGISTRY:-your-registry}"
ENDPOINT_NAME="${ENDPOINT_NAME:-sd-webui-majicmix}"
IMAGE_NAME="runpod-sd-webui"
IMAGE_TAG="latest"

echo -e "${GREEN}🚀 RunPod Stable Diffusion WebUI 快速部署${NC}"
echo "=========================================="

# 检查依赖
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 未安装${NC}"
        exit 1
    fi
}

check_dependency docker
check_dependency curl

echo -e "${GREEN}✅ 依赖检查通过${NC}"

# 步骤 1: 构建镜像
echo ""
echo -e "${YELLOW}📦 步骤 1: 构建 Docker 镜像...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 镜像构建成功${NC}"
else
    echo -e "${RED}❌ 镜像构建失败${NC}"
    exit 1
fi

# 步骤 2: 标记镜像
echo ""
echo -e "${YELLOW}🏷️ 步骤 2: 标记镜像...${NC}"
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${RUNPOD_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
echo -e "${GREEN}✅ 镜像标记成功${NC}"

# 步骤 3: 推送到 Registry
echo ""
echo -e "${YELLOW}📤 步骤 3: 推送到 Registry...${NC}"
echo "docker push ${RUNPOD_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
read -p "是否立即推送? (y/n): " confirm
if [[ $confirm == [yY] ]]; then
    docker push ${RUNPOD_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
    echo -e "${GREEN}✅ 镜像推送成功${NC}"
else
    echo -e "${YELLOW}⚠️ 跳过推送，请手动执行:${NC}"
    echo "docker push ${RUNPOD_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
fi

# 步骤 4: 创建 RunPod Serverless Endpoint
echo ""
echo -e "${YELLOW}🎯 步骤 4: 创建 RunPod Serverless Endpoint...${NC}"

create_endpoint() {
    local payload=$(cat <<EOF
{
    "name": "${ENDPOINT_NAME}",
    "template": {
        "imageName": "${RUNPOD_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}",
        "containerDiskSizeGb": 50,
        "volumeDiskSizeGb": 100,
        "ports": "7860/http",
        "env": [
            {"key": "PYTHONUNBUFFERED", "value": "1"}
        ],
        "gpuType": "NVIDIA RTX 3090",
        "gpuCount": 1,
        "memory": 16,
        "cpuCount": 4,
        "flashBoot": true
    },
    "activeWorkers": 1,
    "maxWorkers": 3,
    "idleTimeout": 300,
    "executionTimeout": 600
}
EOF
)

    response=$(curl -s -X POST \
        -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "${payload}" \
        https://api.runpod.io/v2/${ENDPOINT_NAME} \
        2>&1 || echo "API_ERROR")

    if echo "$response" | grep -q "error"; then
        echo -e "${RED}❌ 创建失败: ${response}${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Endpoint 创建成功${NC}"
    echo "响应: ${response}"
    return 0
}

read -p "是否自动创建 Endpoint? (y/n): " create_confirm
if [[ $create_confirm == [yY] ]]; then
    if [ "$RUNPOD_API_KEY" == "your-api-key" ]; then
        echo -e "${RED}❌ 请设置 RUNPOD_API_KEY 环境变量${NC}"
        echo "export RUNPOD_API_KEY=your-actual-api-key"
    else
        create_endpoint
    fi
else
    echo -e "${YELLOW}⚠️ 跳过自动创建${NC}"
fi

# 完成
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 部署完成!${NC}"
echo ""
echo "镜像信息:"
echo "  名称: ${RUNPOD_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "下一步:"
echo "1. 在 RunPod 控制台查看 Endpoint: https://www.runpod.io/console/serverless"
echo "2. 获取 Endpoint ID 并修改 test.py 进行测试"
echo "3. 使用 API 进行文生图/图生图/ControlNet"
echo ""
echo "测试命令:"
echo "  cd runpod-sd-template"
echo "  python test.py"
echo -e "${GREEN}========================================${NC}"

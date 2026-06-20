FROM runpod/pytorch:2.2.0-py3.10-cuda12.1-devel-ubuntu22.04

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    git \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Clone Stable Diffusion WebUI
RUN git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git /workspace/stable-diffusion-webui

WORKDIR /workspace/stable-diffusion-webui

# Install requirements
RUN pip install --no-cache-dir -r requirements.txt

# Install additional extensions
RUN mkdir -p extensions && \
    git clone https://github.com/Mikubill/sd-webui-controlnet.git extensions/sd-webui-controlnet && \
    git clone https://github.com/civitai/sd_civitai_extension.git extensions/sd_civitai_extension

# Download majicMIX realistic model
RUN mkdir -p models/Stable-diffusion && \
    wget -O models/Stable-diffusion/majicMIX_realistic_v6.safetensors \
    "https://civitai.com/api/download/models/94640?type=Model&format=SafeTensor&size=pruned&fp=fp16" || \
    echo "Model download failed - will need manual download"

# Download VAE
RUN mkdir -p models/VAE && \
    wget -O models/VAE/vae-ft-mse-840000-ema-pruned.safetensors \
    "https://huggingface.co/stabilityai/sd-vae-ft-mse-original/resolve/main/vae-ft-mse-840000-ema-pruned.safetensors"

# Copy handler script
COPY handler.py /workspace/handler.py

# Copy startup script
COPY start.sh /workspace/start.sh
RUN chmod +x /workspace/start.sh

# Expose port
EXPOSE 7860

# Set entrypoint
CMD ["/workspace/start.sh"]

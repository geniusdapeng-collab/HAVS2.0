#!/usr/bin/env python3
"""
RunPod Serverless Handler for Stable Diffusion WebUI
支持文生图、图生图、ControlNet
"""

import os
import sys
import json
import base64
import io
import time
import subprocess
import threading
from typing import Dict, Any, List
import runpod
from PIL import Image
import requests

# WebUI API endpoint
WEBUI_URL = "http://localhost:7860"

class SDWebUIHandler:
    def __init__(self):
        self.webui_ready = False
        self.start_webui()
        
    def start_webui(self):
        """启动 Stable Diffusion WebUI 服务"""
        print("🚀 启动 Stable Diffusion WebUI...")
        
        # 启动 WebUI（API 模式）
        cmd = [
            "python", "launch.py",
            "--api",                    # 启用 API 模式
            "--listen",                 # 监听所有接口
            "--port", "7860",           # 端口
            "--enable-insecure-extension-access",  # 允许扩展访问
            "--no-gradio-queue",        # 禁用队列
            "--no-hashing",             # 禁用哈希检查（加速启动）
            "--xformers",               # 启用 xformers 加速
            "--precision", "full",      # 精度
            "--opt-channelslast",       # 优化通道
            "--no-download-sd-model"    # 不自动下载模型（已预装）
        ]
        
        # 在后台启动
        self.process = subprocess.Popen(
            cmd,
            cwd="/workspace/stable-diffusion-webui",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # 等待服务就绪
        self.wait_for_ready()
        
    def wait_for_ready(self, timeout=300):
        """等待 WebUI 服务就绪"""
        print("⏳ 等待 WebUI 服务就绪...")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(f"{WEBUI_URL}/sdapi/v1/sd-models", timeout=5)
                if response.status_code == 200:
                    self.webui_ready = True
                    print("✅ WebUI 服务已就绪")
                    return True
            except:
                pass
            time.sleep(2)
            
        raise TimeoutError("WebUI 服务启动超时")
        
    def txt2img(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """文生图"""
        payload = {
            "prompt": params.get("prompt", ""),
            "negative_prompt": params.get("negative_prompt", ""),
            "width": params.get("width", 512),
            "height": params.get("height", 512),
            "steps": params.get("steps", 20),
            "cfg_scale": params.get("cfg_scale", 7.0),
            "sampler_name": params.get("sampler_name", "DPM++ 2M Karras"),
            "batch_size": params.get("batch_size", 1),
            "seed": params.get("seed", -1),
            "override_settings": {
                "sd_model_checkpoint": params.get("model", "majicMIX_realistic_v6.safetensors")
            }
        }
        
        response = requests.post(f"{WEBUI_URL}/sdapi/v1/txt2img", json=payload)
        return self.process_response(response)
        
    def img2img(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """图生图"""
        # 解码 base64 图片
        init_image = params.get("init_image", "")
        if init_image.startswith("data:image"):
            init_image = init_image.split(",")[1]
            
        payload = {
            "init_images": [init_image] if init_image else [],
            "prompt": params.get("prompt", ""),
            "negative_prompt": params.get("negative_prompt", ""),
            "width": params.get("width", 512),
            "height": params.get("height", 512),
            "steps": params.get("steps", 20),
            "cfg_scale": params.get("cfg_scale", 7.0),
            "denoising_strength": params.get("denoising_strength", 0.75),
            "sampler_name": params.get("sampler_name", "DPM++ 2M Karras"),
            "seed": params.get("seed", -1),
            "override_settings": {
                "sd_model_checkpoint": params.get("model", "majicMIX_realistic_v6.safetensors")
            }
        }
        
        response = requests.post(f"{WEBUI_URL}/sdapi/v1/img2img", json=payload)
        return self.process_response(response)
        
    def controlnet(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """ControlNet"""
        init_image = params.get("init_image", "")
        if init_image.startswith("data:image"):
            init_image = init_image.split(",")[1]
            
        payload = {
            "prompt": params.get("prompt", ""),
            "negative_prompt": params.get("negative_prompt", ""),
            "width": params.get("width", 512),
            "height": params.get("height", 512),
            "steps": params.get("steps", 20),
            "cfg_scale": params.get("cfg_scale", 7.0),
            "sampler_name": params.get("sampler_name", "DPM++ 2M Karras"),
            "seed": params.get("seed", -1),
            "alwayson_scripts": {
                "ControlNet": {
                    "args": [
                        {
                            "input_image": init_image,
                            "module": params.get("preprocessor", "canny"),
                            "model": params.get("controlnet_model", "control_v11p_sd15_canny"),
                            "weight": params.get("weight", 1.0),
                            "resize_mode": "Crop and Resize",
                            "lowvram": False,
                            "processor_res": params.get("processor_res", 512),
                            "threshold_a": params.get("threshold_a", 100),
                            "threshold_b": params.get("threshold_b", 200),
                            "guidance": 1.0,
                            "guidance_start": 0.0,
                            "guidance_end": 1.0,
                            "control_mode": 0,
                            "pixel_perfect": False
                        }
                    ]
                }
            },
            "override_settings": {
                "sd_model_checkpoint": params.get("model", "majicMIX_realistic_v6.safetensors")
            }
        }
        
        response = requests.post(f"{WEBUI_URL}/sdapi/v1/txt2img", json=payload)
        return self.process_response(response)
        
    def process_response(self, response) -> Dict[str, Any]:
        """处理 API 响应"""
        if response.status_code != 200:
            return {
                "error": f"API 错误: {response.status_code}",
                "details": response.text
            }
            
        data = response.json()
        
        # 将 base64 图片转换为可返回格式
        images = data.get("images", [])
        processed_images = []
        
        for img in images:
            processed_images.append(f"data:image/png;base64,{img}")
            
        return {
            "images": processed_images,
            "parameters": data.get("parameters", {}),
            "info": data.get("info", {})
        }
        
    def cleanup(self):
        """清理资源"""
        if self.process:
            self.process.terminate()
            self.process.wait()

# 全局 handler 实例
handler = None

def init_handler():
    """初始化 handler"""
    global handler
    if handler is None:
        handler = SDWebUIHandler()
    return handler

# RunPod serverless handler
def handler(event):
    """
    RunPod serverless handler function
    
    输入格式:
    {
        "input": {
            "operation": "txt2img" | "img2img" | "controlnet",
            "prompt": "...",
            "negative_prompt": "...",
            "width": 512,
            "height": 512,
            "steps": 20,
            "cfg_scale": 7.0,
            "seed": -1,
            "model": "majicMIX_realistic_v6.safetensors",
            ...
        }
    }
    """
    try:
        # 初始化
        sd_handler = init_handler()
        
        # 获取输入参数
        input_data = event.get("input", {})
        operation = input_data.get("operation", "txt2img")
        
        print(f"🎨 执行操作: {operation}")
        print(f"📝 Prompt: {input_data.get('prompt', '')[:50]}...")
        
        # 执行对应操作
        if operation == "txt2img":
            result = sd_handler.txt2img(input_data)
        elif operation == "img2img":
            result = sd_handler.img2img(input_data)
        elif operation == "controlnet":
            result = sd_handler.controlnet(input_data)
        else:
            return {
                "error": f"不支持的操作: {operation}",
                "supported_operations": ["txt2img", "img2img", "controlnet"]
            }
            
        return {
            "status": "success",
            "operation": operation,
            **result
        }
        
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

# 启动 serverless 服务
if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})

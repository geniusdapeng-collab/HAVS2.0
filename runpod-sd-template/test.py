import requests
import json
import base64
import time
from PIL import Image
import io

# RunPod API 配置
RUNPOD_API_KEY = "your-runpod-api-key"
ENDPOINT_ID = "your-endpoint-id"

# RunPod API 基础 URL
BASE_URL = f"https://api.runpod.ai/v2/{ENDPOINT_ID}"

def test_txt2img():
    """测试文生图"""
    print("🎨 测试文生图 (txt2img)...")
    
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
            "model": "majicMIX_realistic_v6.safetensors",
            "batch_size": 1
        }
    }
    
    headers = {
        "Authorization": f"Bearer {RUNPOD_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # 发送请求
    response = requests.post(
        f"{BASE_URL}/run",
        headers=headers,
        json=payload
    )
    
    if response.status_code != 200:
        print(f"❌ 错误: {response.status_code}")
        print(response.text)
        return None
    
    data = response.json()
    job_id = data.get("id")
    
    print(f"⏳ 任务已提交，ID: {job_id}")
    
    # 等待结果
    while True:
        status_response = requests.get(
            f"{BASE_URL}/status/{job_id}",
            headers=headers
        )
        
        status_data = status_response.json()
        status = status_data.get("status")
        
        if status == "COMPLETED":
            print("✅ 任务完成")
            output = status_data.get("output", {})
            
            # 保存图片
            images = output.get("images", [])
            for i, img_data in enumerate(images):
                # 移除 data URI 前缀
                if img_data.startswith("data:image"):
                    img_data = img_data.split(",")[1]
                
                # 解码并保存
                img_bytes = base64.b64decode(img_data)
                img = Image.open(io.BytesIO(img_bytes))
                img.save(f"output_txt2img_{i}.png")
                print(f"💾 图片已保存: output_txt2img_{i}.png")
            
            return output
            
        elif status == "FAILED":
            print(f"❌ 任务失败: {status_data.get('error', 'Unknown error')}")
            return None
            
        print(f"   状态: {status}...")
        time.sleep(2)

def test_img2img():
    """测试图生图"""
    print("\n🎨 测试图生图 (img2img)...")
    
    # 读取测试图片并编码为 base64
    with open("test_image.png", "rb") as f:
        img_base64 = base64.b64encode(f.read()).decode()
    
    payload = {
        "input": {
            "operation": "img2img",
            "init_image": f"data:image/png;base64,{img_base64}",
            "prompt": "1girl, realistic, portrait, high quality, detailed face, soft lighting, 8k uhd",
            "negative_prompt": "blurry, low quality, distorted, ugly, bad anatomy",
            "width": 512,
            "height": 512,
            "steps": 20,
            "cfg_scale": 7.0,
            "denoising_strength": 0.75,
            "sampler_name": "DPM++ 2M Karras",
            "seed": -1,
            "model": "majicMIX_realistic_v6.safetensors"
        }
    }
    
    headers = {
        "Authorization": f"Bearer {RUNPOD_API_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        f"{BASE_URL}/run",
        headers=headers,
        json=payload
    )
    
    if response.status_code != 200:
        print(f"❌ 错误: {response.status_code}")
        return None
    
    data = response.json()
    job_id = data.get("id")
    
    print(f"⏳ 任务已提交，ID: {job_id}")
    
    # 等待结果
    while True:
        status_response = requests.get(
            f"{BASE_URL}/status/{job_id}",
            headers=headers
        )
        
        status_data = status_response.json()
        status = status_data.get("status")
        
        if status == "COMPLETED":
            print("✅ 任务完成")
            output = status_data.get("output", {})
            
            images = output.get("images", [])
            for i, img_data in enumerate(images):
                if img_data.startswith("data:image"):
                    img_data = img_data.split(",")[1]
                
                img_bytes = base64.b64decode(img_data)
                img = Image.open(io.BytesIO(img_bytes))
                img.save(f"output_img2img_{i}.png")
                print(f"💾 图片已保存: output_img2img_{i}.png")
            
            return output
            
        elif status == "FAILED":
            print(f"❌ 任务失败")
            return None
            
        time.sleep(2)

def test_controlnet():
    """测试 ControlNet"""
    print("\n🎨 测试 ControlNet...")
    
    # 读取测试图片
    with open("test_image.png", "rb") as f:
        img_base64 = base64.b64encode(f.read()).decode()
    
    payload = {
        "input": {
            "operation": "controlnet",
            "init_image": f"data:image/png;base64,{img_base64}",
            "prompt": "1girl, realistic, portrait, high quality",
            "negative_prompt": "blurry, low quality",
            "width": 512,
            "height": 512,
            "steps": 20,
            "cfg_scale": 7.0,
            "sampler_name": "DPM++ 2M Karras",
            "preprocessor": "canny",
            "controlnet_model": "control_v11p_sd15_canny",
            "weight": 1.0,
            "threshold_a": 100,
            "threshold_b": 200,
            "model": "majicMIX_realistic_v6.safetensors"
        }
    }
    
    headers = {
        "Authorization": f"Bearer {RUNPOD_API_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        f"{BASE_URL}/run",
        headers=headers,
        json=payload
    )
    
    if response.status_code != 200:
        print(f"❌ 错误: {response.status_code}")
        return None
    
    data = response.json()
    job_id = data.get("id")
    
    print(f"⏳ 任务已提交，ID: {job_id}")
    
    # 等待结果
    while True:
        status_response = requests.get(
            f"{BASE_URL}/status/{job_id}",
            headers=headers
        )
        
        status_data = status_response.json()
        status = status_data.get("status")
        
        if status == "COMPLETED":
            print("✅ 任务完成")
            output = status_data.get("output", {})
            
            images = output.get("images", [])
            for i, img_data in enumerate(images):
                if img_data.startswith("data:image"):
                    img_data = img_data.split(",")[1]
                
                img_bytes = base64.b64decode(img_data)
                img = Image.open(io.BytesIO(img_bytes))
                img.save(f"output_controlnet_{i}.png")
                print(f"💾 图片已保存: output_controlnet_{i}.png")
            
            return output
            
        elif status == "FAILED":
            print(f"❌ 任务失败")
            return None
            
        time.sleep(2)

if __name__ == "__main__":
    print("🧪 RunPod SD WebUI 测试脚本")
    print("=" * 50)
    
    # 测试文生图
    test_txt2img()
    
    # 测试图生图（需要 test_image.png）
    # test_img2img()
    
    # 测试 ControlNet（需要 test_image.png）
    # test_controlnet()
    
    print("\n✅ 所有测试完成")

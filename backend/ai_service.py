import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI

# 1. 加载环境变量 (这行代码让本地开发也能读取 .env 文件)
load_dotenv()

# 2. 获取 API Key
MY_API_KEY = os.getenv("MY_API_KEY")

# 简单检查 Key 是否存在，方便调试
if not MY_API_KEY:
    print("⚠️ 警告: 未检测到 MY_API_KEY 环境变量，AI 功能可能无法正常工作。请检查 .env 文件或 Railway 变量设置。")

# 3. 初始化 OpenAI 客户端 (连接 OpenRouter)
CLIENT = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=MY_API_KEY,
    default_headers={
        "HTTP-Referer": "http://localhost:3000",  # 你的网站地址
        "X-Title": "Love Test Web",               # 你的应用名称
    }
)

# 4. 选择模型
MODEL_NAME = "deepseek/deepseek-chat"

def clean_json_response(content):
    """
    清洗 AI 返回的内容，尝试提取纯 JSON 字符串。
    解决 AI 有时会返回 markdown 格式 (```json ... ```) 的问题。
    """
    try:
        # 1. 尝试匹配 ```json ... ``` 中间的内容
        match = re.search(r"```json\s*(.*?)\s*```", content, re.DOTALL)
        if match:
            return match.group(1)
        
        # 2. 尝试匹配不带 json 标记的 markdown 代码块
        match_simple = re.search(r"```\s*(.*?)\s*```", content, re.DOTALL)
        if match_simple:
            return match_simple.group(1)
            
        # 3. 如果没有代码块，尝试直接去除首尾空白
        return content.strip()
    except Exception as e:
        print(f"JSON 清洗预处理出错: {e}")
        return content

def get_analysis(data_input):
    # 如果是单人数据，保持简单逻辑
    if "Person_B" not in data_input:
        # ... (单人逻辑保持不变，或者简单返回文本) ...
        return {"analysis": "等待另一半...", "tags": []}

    # --- 双人合盘：强制 JSON 结构 ---
    system_prompt = """
    你是一位精通数据可视化的情感专家。请分析两人的回答，并**严格**按照以下 JSON 格式返回数据。
    
    必须返回纯 JSON，不要包含 markdown 格式（如 ```json ... ```）。
    
    JSON 结构要求：
    {
        "score": 0-100的整数 (匹配度分数),
        "title": "一个简短的四字关系定义 (如: 灵魂共鸣)",
        "radar": {
            "沟通": 0-100评分,
            "价值观": 0-100评分,
            "激情": 0-100评分,
            "安全感": 0-100评分,
            "成长性": 0-100评分
        },
        "card_text": "一段50字以内、唯美扎心的话，适合印在卡片上发朋友圈。",
        "analysis": "这里写详细的深度分析报告，可以使用emoji，分段要在300字左右。"
    }
    """

    try:
        completion = CLIENT.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"用户数据: {json.dumps(data_input, ensure_ascii=False)}"}
            ]
        )
        
        content = completion.choices[0].message.content
        
        # --- 清洗数据：防止 AI 加了 ```json 等修饰 ---
        # 使用正则提取第一个 { 和最后一个 } 之间的内容
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            json_str = match.group()
            result = json.loads(json_str)
            return result
        else:
            # 兜底：万一 AI 疯了没返回 JSON
            return {
                "score": 88,
                "title": "默契拍档",
                "radar": {"沟通":80, "价值观":80, "激情":80, "安全感":80, "成长性":80},
                "card_text": "你们是彼此最好的镜子，照见最真实的自己。",
                "analysis": content # 把原文塞进去
            }

    except Exception as e:
        print(f"AI Error: {e}")
        # 出错时的兜底数据
        return {
            "score": 90,
            "title": "天作之合",
            "radar": {"沟通":90, "价值观":90, "激情":90, "安全感":90, "成长性":90},
            "card_text": "有些相遇，是为了让彼此成为更好的人。",
            "analysis": "AI 正在重新校准，请刷新页面..."
        }

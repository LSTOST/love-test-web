import os
from openai import OpenAI

# ================= OpenRouter 配置区域 =================
# 1. 填入你的 Key (sk-or-v1-开头)
MY_API_KEY = os.getenv("MY_API_KEY")"

# 2. 初始化客户端
CLIENT = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=MY_API_KEY,
    # OpenRouter 建议添加以下来源信息，方便他们在排行榜展示你的应用
    default_headers={
        "HTTP-Referer": "http://localhost:3000", # 你的网站地址
        "X-Title": "Love Test Web",              # 你的应用名称
    }
)

# 3. 选择模型
# OpenRouter 的模型名格式通常是 "厂商/模型名"
# 推荐几个目前非常适合测试的（有的甚至免费）：
# - "google/gemini-2.0-flash-exp:free" (目前免费，且非常聪明，强烈推荐！)
# - "deepseek/deepseek-chat" (性价比极高)
# - "meta-llama/llama-3.1-70b-instruct:free" (也是免费)
MODEL_NAME = "google/gemini-2.0-flash-exp:free" 
# ======================================================

def generate_love_report(traits: list, scores: dict):
    """
    根据分数和标签，让 AI 写一份情书/诊断报告
    """
    
    # 拼凑提示词 (Prompt)
    prompt = f"""
    你是一位专业的婚恋心理咨询师，语气温暖、敏锐、不像机器人。
    
    请根据以下情侣的测评数据，为他们写一段 200 字左右的「关系诊断书」。
    
    【测评数据】
    - 核心关系标签：{", ".join(traits)}
    - 维度评分详情：{scores}
    
    【要求】
    1. 第一段：用充满画面感的语言描述他们的相处模式。
    2. 第二段：一针见血地指出他们可能存在的 1 个潜在风险点（基于分数差异）。
    3. 结尾：给出一句温柔的祝福。
    4. 不要使用 Markdown 格式，直接输出纯文本。
    """

    print(f"正在呼叫 OpenRouter ({MODEL_NAME})...")
    
    try:
        response = CLIENT.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "你是一位资深情感心理学家。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7, 
        )
        
        report_text = response.choices[0].message.content
        return report_text

    except Exception as e:
        print(f"AI 生成出错: {e}")
        return "（AI 正在打盹，暂时无法生成详细报告，但你们的匹配度依然很高！）"

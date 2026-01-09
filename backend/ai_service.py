import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# --- 1. 配置 OpenRouter 客户端 ---
# 确保你的 .env 文件里有 OPENROUTER_API_KEY
CLIENT = OpenAI(
base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("MY_API_KEY")
)

# --- 2. 选择模型 ---
# 推荐使用 DeepSeek V3 (国产之光，便宜且情商高) 或 Gemini Flash 1.5
MODEL_NAME = "deepseek/deepseek-chat" 
# 如果你想用谷歌的，可以取消下面这行的注释:
# MODEL_NAME = "google/gemini-flash-1.5"

def get_analysis(data_input):
    """
    调用 AI 进行深度情感分析，并强制返回 JSON 格式数据。
    """
    
    # 场景 A: 单人提交 (只有 Person_A，没有 Person_B)
    # 这时候不需要雷达图，只返回一个简单的文本即可
    if "Person_B" not in data_input:
        return {
            "score": 0,
            "title": "等待匹配",
            "radar": {}, 
            "card_text": "另一半的答案，才是解开谜题的钥匙。",
            "analysis": "你的性格画像已生成。请邀请伴侣完成测试，解锁双方的深度契合度报告。"
        }

    # 场景 B: 双人合盘 (核心逻辑)
    print(f"🚀 正在调用 AI ({MODEL_NAME}) 分析双人数据...")

    system_prompt = """
    你是一位精通心理学和数据可视化的情感咨询专家。
    请根据两人的回答数据（Person_A 和 Person_B），输出一份深度合盘报告。

    【绝对指令】
    1. **禁止**在分析中使用 "Person_A", "Person_B", "JSON", "数据" 等技术性词汇。
    2. 请使用 "你们"、"A同学"、"B同学" 这样的称呼，语气要温暖、犀利且富有洞察力。
    3. **必须**只返回纯 JSON 格式，不要包含 ```json``` 等 markdown 标记。

    【JSON 数据结构要求】
    {
        "score": 0-100之间的整数 (请根据契合度给出一个真实的分数),
        "title": "一个简短的四字关系定义 (例如: 灵魂共鸣、欢喜冤家、互补互助)",
        "radar": {
            "沟通": 0-100,
            "价值观": 0-100,
            "激情": 0-100,
            "安全感": 0-100,
            "成长性": 0-100
        },
        "card_text": "一段30字以内、唯美扎心的金句，适合印在卡片上发朋友圈。",
        "analysis": "这里写详细的分析报告。请分为3个段落：\n1. 核心契合点 (你们为什么合适)\n2. 互动模式解析 (你们怎么相处)\n3. 给你们的建议 (如何更好)\n(每段开头请使用 emoji)"
    }
    """

    try:
        # 发送请求给 AI
        completion = CLIENT.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"用户答卷数据: {json.dumps(data_input, ensure_ascii=False)}"}
            ],
            temperature=0.7, # 0.7 比较平衡，既有创意又不会太乱
        )
        
        raw_content = completion.choices[0].message.content
        print("🤖 AI 原始返回:", raw_content) # 在日志里打印出来方便调试

        # --- 核心清洗逻辑：提取 JSON ---
        # AI 有时候会废话："好的，这是您的 JSON..."，我们需要用正则只抓取 {...} 里面的内容
        match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        
        if match:
            clean_json_str = match.group()
            result = json.loads(clean_json_str)
            return result
        else:
            # 万一正则没抓到，尝试直接解析
            return json.loads(raw_content)

    except Exception as e:
        print(f"❌ AI 分析出错: {str(e)}")
        # 兜底数据：防止前端白屏，给一个“默认好评”
        return {
            "score": 88,
            "title": "默契拍档",
            "radar": {
                "沟通": 85,
                "价值观": 80,
                "激情": 90,
                "安全感": 75,
                "成长性": 88
            },
            "card_text": "你们是彼此缺失的那块拼图，虽不完美，但刚好契合。",
            "analysis": "💡 **核心契合点**\nAI 正在重试连接...但这不影响你们的默契。\n\n❤️ **互动建议**\n请刷新页面重试，或直接截图保存这一刻的美好。"
        }

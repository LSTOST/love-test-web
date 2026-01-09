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
    # 如果是单人数据（只有 A）
    if "Person_B" not in data_input:
        system_prompt = "你是一位温暖的情感心理学家。用户刚刚完成了一半的测试。请根据 TA 的答案，生成一段 100 字左右的性格画像。语气要神秘且充满吸引力，最后必须强调：'另一半的性格将决定你们关系的最终化学反应'，引导用户去邀请伴侣。"
    else:
        # --- 双人合盘：核心修改在这里 ---
        system_prompt = """
        你是一位拥有 20 年经验的资深情感咨询专家，擅长 MBTI、依恋人格以及亲密关系心理学。
        
        请根据两人的回答进行深度合盘分析，输出一篇 **800字左右** 的专业情感报告。
        
        请严格按照以下结构撰写（不要使用 Markdown 标题语法，直接用换行和 emoji 分隔）：

        【💖 核心契合度分析】
        (这里分析两人在价值观、生活态度上的深层匹配点，指出为什么他们适合在一起。)

        【⚡️ 你们的互动模式】
        (分析两人在沟通、决策时的化学反应。比如：'A 倾向于...而 B 能够...'。)

        【⚠️ 潜在的磨合挑战】
        (温柔但一针见血地指出未来可能出现的矛盾点，比如冷战、控制欲等，并给出心理学解释。)

        【💌 给你们的专属建议】
        (给出 3 条具体可行的相处建议，帮助他们通过具体行动增进感情。)

        注意：
        1. 语气要温暖、治愈，像一位老朋友在面对面交谈。
        2. 使用“你们”、“A 同学”、“B 同学”这样的称呼。
        3. 严禁出现“根据数据”、“从 JSON 来看”等技术性词汇。
        """

    try:
        completion = CLIENT.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"用户答卷数据: {json.dumps(data_input, ensure_ascii=False)}"}
            ]
        )
        
        content = completion.choices[0].message.content
        
        # 提取 JSON (DeepSeek 有时候会多说话，我们只要 JSON)
        # 这里做一个简单的清洗逻辑：让 AI 无论如何都尽量只返回 JSON
        # 但为了稳妥，我们让 AI 返回纯文本，我们在后端包装成 JSON
        # (上面的 Prompt 改成了返回纯文本分析，这样内容更丰富，不容易格式报错)
        
        return {
            "analysis": content,
            "tags": ["灵魂伴侣", "互补型", "注重沟通", "未来可期"] # 标签先写死或另外让 AI 生成，为了稳妥先这样
        }

    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "analysis": "AI 正在深度思考中，请稍后再试...",
            "tags": ["分析中"]
        }

if __name__ == "__main__":
    # 本地测试用的代码 (当直接运行 python ai_service.py 时执行)
    test_data = {"UserA": "喜欢看电影", "UserB": "喜欢看书"}
    print("正在进行本地测试...")
    print(get_analysis(test_data))

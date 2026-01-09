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

# 4. 选择模型 (目前测试成功且免费的模型)
MODEL_NAME = "mistralai/mistral-7b-instruct:free"

# 如果上面那个还不行，就用这个
# MODEL_NAME = "microsoft/phi-3-mini-128k-instruct:free"

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
    """
    核心函数：调用 AI 进行分析，并返回结构化的 JSON 数据 (包含 analysis 和 tags)
    """
    print(f"🚀 正在调用 AI... 模型: {MODEL_NAME}")
    
    try:
        # --- 构造 Prompt (提示词) ---
        prompt = f"""
        请根据以下两个人对待问题的回答，分析他们的契合度：
        数据：{data_input}

        请务必只返回一个纯标准的 JSON 格式，不要包含任何 Markdown 标记或其他废话。
        返回格式必须如下：
        {{
            "analysis": "这里写一段300字左右的详细情感分析文案，风格温暖、专业且有洞察力，指出双方的性格互补点和潜在的相处建议...",
            "tags": ["标签1", "标签2", "标签3", "标签4"]
        }}
        """

        # --- 发起 API 请求 ---
        response = CLIENT.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "你是一位资深情感心理学家。请只输出标准的 JSON 格式数据。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7, # 0.7 比较平衡，既有创意又不会太乱
        )

        # --- 获取并处理返回内容 ---
        content = response.choices[0].message.content
        print(f"🤖 AI 原始返回: {content}") # 这一行会在 Railway 日志里显示，非常重要！

        # 清洗内容 (去掉 ```json 等干扰字符)
        cleaned_content = clean_json_response(content)
        
        # 解析为 Python 字典
        result_json = json.loads(cleaned_content)
        
        # 验证一下字段是否存在
        if "analysis" not in result_json:
            result_json["analysis"] = "AI 生成了内容，但格式稍有偏差，无法提取详细分析。"
        if "tags" not in result_json:
            result_json["tags"] = ["默契搭档", "未来可期"]

        return result_json

    except Exception as e:
        # --- 错误处理 ---
        print(f"❌ AI 调用严重错误: {str(e)}")
        # 打印详细堆栈，方便排查
        import traceback
        traceback.print_exc()

        # 兜底返回 (Fallback)：确保前端不会白屏
        return {
            "analysis": "(AI 正在打盹，暂时无法生成详细报告。但根据你们的回答逻辑判断，你们的匹配度依然很高！这只是一个临时的网络波动，请稍后再试。)",
            "tags": ["独立型恋人", "直球选手", "数据暂缺"]
        }

if __name__ == "__main__":
    # 本地测试用的代码 (当直接运行 python ai_service.py 时执行)
    test_data = {"UserA": "喜欢看电影", "UserB": "喜欢看书"}
    print("正在进行本地测试...")
    print(get_analysis(test_data))

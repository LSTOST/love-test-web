import os
import json
import random
import string
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. 加载环境变量
load_dotenv()

# 2. 初始化 Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# 3. 初始化 OpenAI (带防崩溃处理)
# 即使 Railway 没装好 openai，服务器也不会炸，只是 AI 功能不可用
client = None
try:
    from openai import OpenAI
    # 这里读取的是 MY_API_KEY，匹配你的设置
    api_key = os.environ.get("MY_API_KEY")
    if api_key:
        client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
        print("✅ OpenAI/DeepSeek 模块加载成功")
    else:
        print("⚠️ 未检测到 MY_API_KEY，AI 功能将受限")
except ImportError:
    print("❌ 严重警告: 未安装 'openai' 库，请检查 requirements.txt")

# 4. 初始化 FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 数据模型 ---
class SubmitA_Request(BaseModel):
    user_id: str
    answers: dict

class SubmitB_Request(BaseModel):
    invite_code: str
    answers: dict

class JoinRequest(BaseModel):
    invite_code: str
    name: str

# --- 核心接口 ---
@app.get("/")
def read_root():
    return {"status": "ok", "ai_enabled": client is not None}

@app.get("/questions")
def get_questions():
    try:
        # 获取题目
        response = supabase.table("questions").select("*").order("id").execute()
        return response.data
    except Exception as e:
        print(f"Fetch questions error: {e}")
        return []

@app.post("/notify_join")
def notify_join(req: JoinRequest):
    try:
        supabase.table("test_results").update({
            "partner_name": req.name
        }).eq("invite_code", req.invite_code).execute()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error"}

@app.post("/mock_pay")
def mock_pay(test_id: str):
    try:
        invite_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        supabase.table("test_results").update({
            "payment_status": "paid",
            "invite_code": invite_code
        }).eq("id", test_id).execute()
        return {"status": "success", "invite_code": invite_code}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/submit_part_a")
def submit_part_a(req: SubmitA_Request):
    try:
        response = supabase.table("test_results").insert({
            "user_a_id": req.user_id,
            "answers_a": req.answers,
            "payment_status": "unpaid",
            "is_finished": False
        }).execute()
        return {"status": "success", "test_id": response.data[0]['id']}
    except Exception as e:
        print(f"Submit A Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit_part_b")
def submit_part_b(req: SubmitB_Request):
    try:
        # 查重
        record = supabase.table("test_results").select("*").eq("invite_code", req.invite_code).execute()
        if not record.data: return {"status": "error", "message": "无效邀请码"}
        
        existing_data = record.data[0]
        if existing_data.get('is_finished'):
            return {"status": "already_finished", "test_id": existing_data['id']}

        # 生成 AI 报告
        ai_result = generate_ai_report(existing_data['answers_a'], req.answers)
        
        supabase.table("test_results").update({
            "user_b_id": "user_b_final",
            "answers_b": req.answers,
            "is_finished": True,
            "ai_result": ai_result
        }).eq("id", existing_data['id']).execute()
        
        return {"status": "success", "test_id": existing_data['id']}
    except Exception as e:
        print(f"Submit B Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/result/{test_id}")
def get_result(test_id: str):
    try:
        response = supabase.table("test_results").select("*").eq("id", test_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=404, detail="Not found")

# --- AI 生成逻辑 (带兜底) ---
def generate_ai_report(answers_a, answers_b):
    # 兜底数据 (如果 AI 挂了，用这个返回，防止前端报错)
    fallback = {
        "score": 88, 
        "title": "默契拍档", 
        "card_text": "你们是彼此最好的镜子，照见最真实的自己。",
        "radar": {"沟通": 80, "三观": 85, "激情": 90, "安全感": 75, "成长": 88},
        "analysis": "AI 服务暂时繁忙，这是系统生成的默认高分报告。请稍后重试。"
    }

    if not client:
        print("⚠️ OpenAI 客户端未初始化，使用兜底数据")
        return fallback

    try:
        print("🤖 AI 正在思考...")
        prompt = f"分析契合度:\n甲方数据:{answers_a}\n乙方数据:{answers_b}\n请返回JSON格式包含score, title, card_text, radar(5维), analysis。"
        
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "输出 JSON"},
                {"role": "user", "content": prompt}
            ],
            response_format={ 'type': 'json_object' }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"❌ AI Error: {e}")
        return fallback

import os
import json
import random
import string
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
from openai import OpenAI

# 1. 加载环境变量
load_dotenv()

# 2. 初始化 Supabase 客户端
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# 3. 初始化 DeepSeek (核心修正：改回读取 MY_API_KEY)
# 这样你就不用去 Railway 改变量名了！
client = OpenAI(
    api_key=os.environ.get("MY_API_KEY"), 
    base_url="https://api.deepseek.com"
)

# 4. 初始化 FastAPI
app = FastAPI()

# 5. 配置 CORS
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

# --- 接口 ---
@app.get("/")
def read_root():
    return {"status": "ok"}

@app.get("/questions")
def get_questions():
    try:
        response = supabase.table("questions").select("*").order("id").execute()
        return response.data
    except Exception as e:
        print(f"Error: {e}")
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
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit_part_b")
def submit_part_b(req: SubmitB_Request):
    try:
        record = supabase.table("test_results").select("*").eq("invite_code", req.invite_code).execute()
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
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/result/{test_id}")
def get_result(test_id: str):
    try:
        response = supabase.table("test_results").select("*").eq("id", test_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=404, detail="Not found")

# --- AI 生成逻辑 ---
def generate_ai_report(answers_a, answers_b):
    try:
        # 简单拼装 Prompt
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
        print(f"AI Error: {e}")
        # 兜底数据，保证不报错
        return {
            "score": 60, "title": "还在磨合", "card_text": "爱需要练习。",
            "radar": {"沟通": 50, "三观": 50, "激情": 50, "安全感": 50, "成长": 50},
            "analysis": "AI 暂时繁忙。"
        }

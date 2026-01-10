import os
import uuid
import json
import random
import string
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from supabase import create_client, Client
from ai_service import get_analysis

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key) if url and key else None

# ---------------------------------------------------------
# 新增：获取题库接口
# ---------------------------------------------------------
@app.get("/questions")
def get_questions():
    """
    从数据库获取所有题目
    """
    try:
        # 查表，按 id 排序
        response = supabase.table("questions").select("*").order("id").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching questions: {e}")
        return []

# 定义数据模型
class SubmitA_Request(BaseModel):
    user_id: str
    answers: Dict[str, str]

class PayRequest(BaseModel):
    test_id: int

class SubmitB_Request(BaseModel):
    invite_code: str
    answers: Dict[str, str]

# 生成 6 位随机邀请码
def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@app.get("/")
def home():
    return {"message": "LoveTest Pro Backend Running"}

# --- 阶段 1: 用户 A 提交 (只存答案，不分析，未支付) ---
@app.post("/submit_part_a")
def submit_part_a(request: SubmitA_Request):
    if not supabase: raise HTTPException(500, "DB Error")
    
    try:
        # 1. 生成一份简单的“模糊画像” (不需要调大模型，省钱)
        # 这里先随便返回两句，前端会把它做模糊处理
        teaser_text = "根据你的回答，你是一个非常有主见的人... (付费解锁更多)"
        
        # 2. 存入数据库
        data = {
            "answers": request.answers,
            "payment_status": "unpaid",
            "is_finished": False,
            "ai_result": {"analysis": teaser_text, "tags": ["???", "???"]} # 占位
        }
        res = supabase.table("test_results").insert(data).execute()
        test_id = res.data[0]['id']
        
        return {
            "status": "success",
            "step": "wait_for_payment",
            "test_id": test_id
        }
    except Exception as e:
        print(e)
        raise HTTPException(500, str(e))

# --- 阶段 2: 模拟支付 (实际项目中这里接微信支付回调) ---
@app.post("/mock_pay")
def mock_pay(request: PayRequest):
    if not supabase: raise HTTPException(500, "DB Error")
    
    # 1. 生成邀请码
    code = generate_invite_code()
    
    # 2. 更新数据库：设为已支付，写入邀请码
    supabase.table("test_results").update({
        "payment_status": "paid",
        "invite_code": code
    }).eq("id", request.test_id).execute()
    
    return {"status": "paid", "invite_code": code}

# --- 阶段 3: 用户 B 提交 (核心！合并数据 + AI 分析) ---
@app.post("/submit_part_b")
def submit_part_b(request: SubmitB_Request):
    if not supabase: raise HTTPException(500, "DB Error")
    
    # 1. 根据邀请码找到 A 的记录
    res = supabase.table("test_results").select("*").eq("invite_code", request.invite_code).execute()
    if not res.data:
        raise HTTPException(404, "邀请码无效")
    
    record = res.data[0]
    if record.get("is_finished"):
        return {"status": "already_finished", "test_id": record['id']}

    try:
        # 2. 拿到 A 的答案 + B 的答案
        answers_a = record['answers']
        answers_b = request.answers
        
        # 3. 组合数据发给 AI
        combined_input = {
            "Person_A": answers_a,
            "Person_B": answers_b
        }
        
        # 4. 召唤 AI !
        print("正在进行双人深度分析...")
        ai_result = get_analysis(combined_input) # 这里会生成最终报告
        
        # 5. 更新数据库：存入 B 的答案、AI 结果、标记完成
        supabase.table("test_results").update({
            "partner_answers": answers_b,
            "ai_result": ai_result,
            "is_finished": True
        }).eq("id", record['id']).execute()
        
        return {
            "status": "success",
            "test_id": record['id'] # 返回 ID，前端跳转到结果页
        }
        
    except Exception as e:
        print(e)
        raise HTTPException(500, str(e))

# --- 查询结果接口 (逻辑微调) ---
@app.get("/result/{test_id}")
def get_result(test_id: int):
    if not supabase: raise HTTPException(500, "DB Error")
    
    res = supabase.table("test_results").select("*").eq("id", test_id).execute()
    if not res.data: raise HTTPException(404, "Not Found")
    
    data = res.data[0]
    
    # 这里控制权限
    return {
        "payment_status": data.get("payment_status"),
        "is_finished": data.get("is_finished"),
        "invite_code": data.get("invite_code"),
        "ai_result": data.get("ai_result"),
        # 如果未支付，前端展示模糊页
        # 如果已支付但 B 没做，前端展示邀请页
        # 如果都完成了，前端展示最终页
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

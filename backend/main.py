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

# 3. 初始化 DeepSeek (OpenAI 兼容模式)
client = OpenAI(
    api_key=os.environ.get("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)

# 4. 初始化 FastAPI
app = FastAPI()

# 5. 配置 CORS (允许前端访问)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
#  数据模型定义 (Pydantic Models)
# ==========================================

class SubmitA_Request(BaseModel):
    user_id: str
    answers: dict

class SubmitB_Request(BaseModel):
    invite_code: str
    answers: dict

class JoinRequest(BaseModel):
    invite_code: str
    name: str

# ==========================================
#  API 接口区域
# ==========================================

@app.get("/")
def read_root():
    return {"Hello": "World", "Service": "Love Test AI Backend"}

# ------------------------------------------
# 1. 获取题库接口 (动态从数据库拉取)
# ------------------------------------------
@app.get("/questions")
def get_questions():
    try:
        response = supabase.table("questions").select("*").order("id").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching questions: {e}")
        return []

# ------------------------------------------
# 2. User B 进场通知接口 (新功能)
# ------------------------------------------
@app.post("/notify_join")
def notify_join(req: JoinRequest):
    """
    当 User B 输入名字开始答题时，更新 partner_name 字段
    """
    print(f"收到进场通知: 邀请码={req.invite_code}, 名字={req.name}")
    try:
        supabase.table("test_results").update({
            "partner_name": req.name
        }).eq("invite_code", req.invite_code).execute()
        return {"status": "success"}
    except Exception as e:
        print(f"Notify join error: {e}")
        return {"status": "error"}

# ------------------------------------------
# 3. Mock 支付接口 (开发测试专用)
# ------------------------------------------
@app.post("/mock_pay")
def mock_pay(test_id: str):
    """
    接收 test_id，模拟支付成功，生成邀请码
    """
    print(f"收到模拟支付请求: {test_id}")
    try:
        # 生成 6 位随机邀请码
        invite_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        # 更新数据库
        supabase.table("test_results").update({
            "payment_status": "paid",
            "invite_code": invite_code
        }).eq("id", test_id).execute()
        
        print(f"✅ 支付成功，邀请码: {invite_code}")
        return {"status": "success", "invite_code": invite_code}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ------------------------------------------
# 4. User A 提交答案
# ------------------------------------------
@app.post("/submit_part_a")
def submit_part_a(req: SubmitA_Request):
    try:
        # 插入一条新数据
        response = supabase.table("test_results").insert({
            "user_a_id": req.user_id,
            "answers_a": req.answers,
            "payment_status": "unpaid", # 初始未支付
            "is_finished": False
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Database insert failed")
            
        test_id = response.data[0]['id']
        return {"status": "success", "test_id": test_id}
    except Exception as e:
        print(f"Error in submit_part_a: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------
# 5. User B 提交答案 + 触发 AI 分析
# ------------------------------------------
@app.post("/submit_part_b")
def submit_part_b(req: SubmitB_Request):
    try:
        # 1. 查找对应的 User A 数据
        record = supabase.table("test_results").select("*").eq("invite_code", req.invite_code).execute()
        
        if not record.data:
            return {"status": "error", "message": "Invalid invite code"}
        
        existing_data = record.data[0]
        test_id = existing_data['id']
        answers_a = existing_data['answers_a']
        answers_b = req.answers
        
        # 2. 如果已经完成了，直接返回
        if existing_data.get('is_finished'):
            return {"status": "already_finished", "test_id": test_id}

        # 3. 调用 AI 生成报告
        ai_result = generate_ai_report(answers_a, answers_b)
        
        # 4. 更新数据库
        supabase.table("test_results").update({
            "user_b_id": "user_b_final",
            "answers_b": answers_b,
            "is_finished": True,
            "ai_result": ai_result
        }).eq("id", test_id).execute()
        
        return {"status": "success", "test_id": test_id}
    except Exception as e:
        print(f"Error in submit_part_b: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------
# 6. 获取结果接口
# ------------------------------------------
@app.get("/result/{test_id}")
def get_result(test_id: str):
    try:
        response = supabase.table("test_results").select("*").eq("id", test_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Result not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
#  内部工具函数
# ==========================================

def generate_ai_report(answers_a, answers_b):
    """
    调用 DeepSeek 生成心理分析报告
    """
    print("🤖 AI 正在分析...")
    
    # 获取双方名字 (如果有)
    name_a = answers_a.get("user_name", "User A")
    name_b = answers_b.get("user_name", "User B")

    # 获取题目内容 (从数据库拉取最新题目，保证上下文准确)
    try:
        questions_res = supabase.table("questions").select("*").order("id").execute()
        questions = questions_res.data
    except:
        questions = [] # 降级处理

    # 构建 Prompt
    prompt = f"""
    请作为一位资深情感心理学家，分析这两位伴侣的契合度。
    
    【基本信息】
    甲方: {name_a}
    乙方: {name_b}

    【答题数据】
    (格式: 题目ID - 题目内容: 甲方选择 / 乙方选择)
    """
    
    # 拼装答题详情
    for q in questions:
        qid = str(q['id'])
        q_text = q['content']
        choice_a = answers_a.get(qid, "未知")
        choice_b = answers_b.get(qid, "未知")
        prompt += f"\n- {q_text}: {name_a}选[{choice_a}] / {name_b}选[{choice_b}]"

    prompt += """
    
    请输出一份JSON格式的报告，必须严格包含以下字段（不要使用Markdown代码块，直接返回JSON）：
    {
        "score": (0-100之间的整数),
        "title": (简短的四字评价，如"灵魂伴侣"),
        "card_text": (一句适合发朋友圈的唯美短句，30字以内),
        "radar": {
            "沟通": (0-100),
            "三观": (0-100),
            "激情": (0-100),
            "安全感": (0-100),
            "成长": (0-100)
        },
        "analysis": (500字左右的深度分析，包含双方优势、潜在冲突点和相处建议，语气要温暖专业)
    }
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "你是一个能够输出标准 JSON 格式的情感分析 AI。"},
                {"role": "user", "content": prompt},
            ],
            response_format={ 'type': 'json_object' },
            stream=False
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"AI Generation Error: {e}")
        # 兜底数据，防止报错
        return {
            "score": 60,
            "title": "还在磨合",
            "card_text": "爱是需要学习的能力。",
            "radar": {"沟通": 50, "三观": 50, "激情": 50, "安全感": 50, "成长": 50},
            "analysis": "AI 暂时繁忙，请稍后再试。"
        }

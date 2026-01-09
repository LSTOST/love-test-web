import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from dotenv import load_dotenv

# 1. 引入 Supabase 库
from supabase import create_client, Client
from ai_service import get_analysis 

# 加载环境变量
load_dotenv()

app = FastAPI()

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. 初始化 Supabase 客户端 (连接数据库)
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# 简单检查一下钥匙有没有带好
if not url or not key:
    print("⚠️ 警告: Supabase URL 或 Key 未配置，将无法保存数据！")
    supabase = None
else:
    supabase: Client = create_client(url, key)

class SubmitRequest(BaseModel):
    user_id: str
    answers: Dict[str, str]

@app.get("/")
def home():
    return {"message": "Backend is running!"}

@app.post("/submit")
def submit_test(request: SubmitRequest):
    try:
        print(f"收到新答卷: {request.answers}")
        
        # 1. 先让 AI 算命
        ai_result = get_analysis(request.answers)
        
        # 2. 计算原始分数 (这里先写死，你可以以后改逻辑)
        raw_score = 88 
        
        # 3. 【关键步骤】把数据存进 Supabase 账本！
        if supabase:
            try:
                data_to_save = {
                    "answers": request.answers,  # 用户选的 A/B
                    "ai_result": ai_result       # AI 说的那些话
                }
                # 往 test_results 表里插入一条数据
                supabase.table("test_results").insert(data_to_save).execute()
                print("✅ 数据已成功保存到 Supabase!")
            except Exception as db_error:
                print(f"❌ 保存数据库失败 (不影响前端展示): {db_error}")

        # 4. 最后把结果返回给前端
        return {
            "status": "success",
            "user_id": request.user_id,
            "raw_score": raw_score,
            "traits": ai_result 
        }

    except Exception as e:
        print(f"处理出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from dotenv import load_dotenv

# 引入 Supabase 库
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

class SubmitRequest(BaseModel):
    user_id: str
    answers: Dict[str, str]

@app.get("/")
def home():
    return {"message": "Backend is running!"}

# --- 1. 修改提交接口：返回数据库 ID ---
@app.post("/submit")
def submit_test(request: SubmitRequest):
    try:
        # AI 分析
        ai_result = get_analysis(request.answers)
        raw_score = 88 
        
        test_id = None # 用于存数据库生成的 ID

        if supabase:
            try:
                data_to_save = {
                    "answers": request.answers,
                    "ai_result": ai_result
                }
                # 关键修改：execute() 后获取返回的数据
                response = supabase.table("test_results").insert(data_to_save).execute()
                
                # 拿到刚刚生成的 ID (比如 1, 2, 3...)
                if response.data and len(response.data) > 0:
                    test_id = response.data[0]['id']
                    print(f"✅ 数据保存成功，ID: {test_id}")
                
            except Exception as db_error:
                print(f"❌ 存库失败: {db_error}")

        return {
            "status": "success",
            "test_id": test_id, # 把这个身份证号返回给前端
            "raw_score": raw_score,
            "traits": ai_result 
        }

    except Exception as e:
        print(f"处理出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. 新增查询接口：根据 ID 查结果 ---
# 以后访问 http://你的后端/result/1 就能看到数据
@app.get("/result/{test_id}")
def get_test_result(test_id: int):
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="数据库未连接")

        # 去 Supabase 查账：找 id 等于 test_id 的那一行
        response = supabase.table("test_results").select("*").eq("id", test_id).execute()

        # 如果没查到
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="找不到这个测试结果")

        # 查到了，返回第一条
        data = response.data[0]
        return {
            "id": data["id"],
            "created_at": data["created_at"],
            "ai_result": data["ai_result"], # 这里面有 analysis 和 tags
            "answers": data["answers"]
        }

    except Exception as e:
        print(f"查询出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

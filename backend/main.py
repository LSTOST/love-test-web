from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

# --- 关键修改：导入正确的函数名 get_analysis ---
from ai_service import get_analysis 

app = FastAPI()

# 配置 CORS，允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议改为你的具体前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 定义前端传来的数据格式
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
        
        # --- 关键修改：调用 get_analysis ---
        # 以前是 generate_love_report(request.answers)
        ai_result = get_analysis(request.answers)
        
        # 简单的原始分数计算 (示例逻辑)
        raw_score = 88  # 这里可以加你自己的计分逻辑
        
        return {
            "status": "success",
            "user_id": request.user_id,
            "raw_score": raw_score,
            # 将 AI 返回的结构直接透传给前端
            # AI 返回的是 { "analysis": "...", "tags": [...] }
            "traits": ai_result 
        }

    except Exception as e:
        print(f"处理出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

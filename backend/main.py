from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import UserAnswers, AnalysisResult
from scoring import calculate_scores, generate_traits
# 1. 新增：引入 AI 服务模块
from ai_service import generate_love_report 

app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Love Test Backend is Running!"}

@app.post("/submit", response_model=AnalysisResult)
def submit_quiz(submission: UserAnswers):
    print(f"收到新答卷: {submission.answers}")
    
    # 1. 计算维度分
    scores = calculate_scores(submission.answers)
    
    # 2. 生成人格标签
    traits = generate_traits(scores)
    
    # 3. 模拟总分
    total_score = 88 
    
    # ==========================================
    # 4. 新增：呼叫 AI 生成报告
    # ==========================================
    # 注意：这会花费几秒钟，所以前端会有个 loading 转圈圈
    ai_report_text = generate_love_report(traits, scores)
    
    # 我们把 AI 写的报告临时放在 traits 列表的第一个位置传回去
    # (或者我们应该修改 schemas.py 增加一个字段，但为了省事，
    # 我们先把它加进 traits 列表里，前端展示时会把它显示出来)
    traits.insert(0, ai_report_text) 

    return {
        "dimensions": scores,
        "traits": traits, # 这里现在包含了 AI 的长文报告
        "raw_score": total_score
    }

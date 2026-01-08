from pydantic import BaseModel
from typing import Dict, List

# 1. 前端发过来的“答卷”格式
class UserAnswers(BaseModel):
    user_id: str = "anonymous" 
    # 格式示例：{"1": "A", "2": "B"} (题目ID: 选项)
    answers: Dict[str, str] 

# 2. 我们返回给前端的“诊断结果”格式
class AnalysisResult(BaseModel):
    dimensions: Dict[str, int]  # 各个维度的得分
    traits: List[str]           # 获得的标签，比如["高独立性", "粘人"]
    raw_score: int              # 总匹配分 (0-100)

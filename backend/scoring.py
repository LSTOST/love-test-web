# 这里模拟简单的题库计分规则
# 每一题的每一个选项，对应不同的维度加分
QUESTION_WEIGHTS = {
    "1": { 
        "options": {
            "A": {"independence": 5, "intimacy": 2}, # 选 A：独立性+5，亲密度+2
            "B": {"independence": 1, "intimacy": 5}  # 选 B：独立性+1，亲密度+5
        }
    },
    "2": {
        "options": {
            "A": {"conflict_direct": 5}, # 选 A：冲突直接性+5
            "B": {"conflict_direct": 2}  # 选 B：冲突直接性+2
        }
    }
}

# 核心算法：计算分数
def calculate_scores(answers: dict) -> dict:
    # 1. 准备好 4 个维度的初始分数
    scores = {
        "independence": 0,    # 独立性
        "intimacy": 0,        # 亲密度
        "conflict_direct": 0, # 冲突直接性
        "frugality": 0        # 节俭度
    }
    
    # 2. 遍历用户的每一个答案
    for q_id, option in answers.items():
        # 找到这道题的配置
        question_config = QUESTION_WEIGHTS.get(q_id)
        if question_config:
            # 找到这个选项对应的加分
            weight = question_config["options"].get(option, {})
            # 把分数加到对应的维度上
            for dimension, score in weight.items():
                if dimension in scores:
                    scores[dimension] += score
                    
    return scores

# 简单的标签生成器
def generate_traits(scores: dict) -> list:
    traits = []
    if scores["independence"] > 3:
        traits.append("独立型恋人")
    if scores["intimacy"] > 3:
        traits.append("粘人小猫")
    if scores["conflict_direct"] > 3:
        traits.append("直球选手")
    if not traits:
        traits.append("平衡型")
    return traits

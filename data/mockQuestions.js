export const questions = [
  {
    id: 1,
    text: "周末难得休息，你们对于「完美的一天」的定义产生了分歧，你会倾向于：",
    dimension: "lifestyle", // 生活方式
    options: [
      { label: "A", text: "各自做喜欢的事，互不打扰但在这个空间里陪伴", score: { independence: 5, intimacy: 3 } },
      { label: "B", text: "必须一起做一件事（如看电影、做饭），否则不像情侣", score: { independence: 1, intimacy: 5 } }
    ]
  },
  {
    id: 2,
    text: "如果对方在这个月花了一笔让你觉得「没必要」的钱（约占月收入20%），你会：",
    dimension: "value_money", // 金钱观
    options: [
      { label: "A", text: "直接表达不满，要求下次大额消费必须商量", score: { conflict_direct: 5 } },
      { label: "B", text: "虽然心疼但尊重对方的支配权，并在侧面提醒存钱", score: { conflict_direct: 2 } }
    ]
  },
  // ... 更多题目后续补充，目前先用这两题跑通逻辑
];

import { useState } from 'react';
import { useRouter } from 'next/router';
import { questions } from '../data/mockQuestions';

export default function Quiz() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({}); // 存储结构: { questionId: selectedOption }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionSelect = (option) => {
    // 1. 记录答案
    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);

    // 2. 判断是否是最后一题
    if (currentStep < questions.length - 1) {
      // 还有下一题，延迟 300ms 跳转增加交互感
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    } else {
      // 3. 最后一题，完成测试
      console.log("用户完整答卷数据:", newAnswers);
      alert("测评完成！正在计算你们的「恋爱人格」... (Phase 1 演示结束)");
      // TODO Phase 2: 这里将通过 API 将 answers 发送给后端
      // router.push('/report'); 
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 顶部进度条 */}
      <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '40px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#FF6B6B', borderRadius: '3px', transition: 'width 0.3s' }}></div>
      </div>

      {/* 题目区域 */}
      <div style={{ marginBottom: '40px' }}>
        <span style={{ color: '#999', fontSize: '14px' }}>QUESTION {currentStep + 1} / {questions.length}</span>
        <h2 style={{ fontSize: '22px', lineHeight: '1.5', marginTop: '10px' }}>
          {currentQuestion.text}
        </h2>
      </div>

      {/* 选项区域 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(option)}
            style={{
              padding: '18px',
              border: '1px solid #ddd',
              borderRadius: '12px',
              background: '#fff',
              textAlign: 'left',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              ':hover': { borderColor: '#FF6B6B' } // 注意：内联样式不支持伪类，实际开发建议用 CSS Module 或 Tailwind
            }}
          >
            <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{option.label}.</span>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

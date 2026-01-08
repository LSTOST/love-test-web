import { useState } from 'react';
import { useRouter } from 'next/router';
import { questions } from '../data/mockQuestions';

export default function Quiz() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false); // 新增：加载状态
  const [result, setResult] = useState(null);    // 新增：存储后端返回的结果

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionSelect = async (optionLabel) => {
    // 1. 记录当前答案
    const newAnswers = { ...answers, [currentQuestion.id]: optionLabel.label }; // 注意这里取 label (A/B)
    setAnswers(newAnswers);

    // 2. 判断是否是最后一题
    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    } else {
      // 3. 最后一题：向后端提交数据！
      await submitToBackend(newAnswers);
    }
  };

  // 核心功能：调用后端 API
  const submitToBackend = async (finalAnswers) => {
    setLoading(true);
try {
      // 发送网络请求 (Fetch)
      const response = await fetch('https://love-test-web-production.up.railway.app/submit', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: "test_user_001",
          answers: finalAnswers
        }),
      });
      const data = await response.json();
      console.log("后端返回的数据:", data);
      setResult(data); // 把结果存起来展示

    } catch (error) {
      console.error("提交失败:", error);
      alert("提交失败，请检查后端是否启动");
    } finally {
      setLoading(false);
    }
  };

  // 如果拿到了结果，显示简单的结果页 (临时)
  if (result) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#FF6B6B' }}>测评完成！</h1>
        <h2>匹配度: {result.raw_score}%</h2>
        <div style={{ margin: '20px 0', padding: '20px', background: '#f9f9f9', borderRadius: '10px' }}>
          <h3>你们的关系标签：</h3>
          {result.traits.map(tag => (
            <span key={tag} style={{ display: 'inline-block', margin: '5px', padding: '5px 15px', background: '#FF6B6B', color: 'white', borderRadius: '20px' }}>
              {tag}
            </span>
          ))}
        </div>
        <p style={{ color: '#666' }}>
          (Phase 2 测试成功！后端数据已打通)
        </p>
      </div>
    );
  }

  // 正常答题页面
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 进度条 */}
      <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '40px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#FF6B6B', borderRadius: '3px', transition: 'width 0.3s' }}></div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>正在分析你们的恋爱模型...</h2>
          <p>AI 大脑正在飞速运转 🧠</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '40px' }}>
            <span style={{ color: '#999', fontSize: '14px' }}>QUESTION {currentStep + 1} / {questions.length}</span>
            <h2 style={{ fontSize: '22px', lineHeight: '1.5', marginTop: '10px' }}>{currentQuestion.text}</h2>
          </div>

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
                }}
              >
                <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{option.label}.</span>
                {option.text}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
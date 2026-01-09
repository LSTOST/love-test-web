import { useState } from 'react';
import { useRouter } from 'next/router';
import { questions } from '../data/mockQuestions';

export default function Quiz() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionSelect = async (optionLabel) => {
    // 1. 记录当前答案
    const newAnswers = { ...answers, [currentQuestion.id]: optionLabel.label };
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
      // 注意：确保你的 Railway 地址是正确的，不要有拼写错误
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
      alert("提交失败，请检查网络或后端服务");
    } finally {
      setLoading(false);
    }
  };

  // --- 结果页渲染逻辑 (修改重点在这里) ---
  if (result) {
    // 1. 安全地获取数据
    // 后端 ai_service 返回的数据结构现在应该是 { analysis: "...", tags: [...] }
    // 但为了防止旧版缓存或错误，我们做一个兼容判断
    const aiData = result.traits || {};
    
    // 如果是新版对象，取 analysis；如果是旧版数组，取第一个元素
    const analysisText = aiData.analysis || (Array.isArray(aiData) ? aiData[0] : "分析报告生成中...");
    
    // 如果是新版对象，取 tags；如果是旧版数组，取剩余元素
    const tagsList = aiData.tags || (Array.isArray(aiData) ? aiData.slice(1) : []);

    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#FF6B6B', fontSize: '32px', marginBottom: '10px' }}>测评完成！</h1>
        
        <h2 style={{ fontSize: '24px', color: '#333' }}>
          匹配度: <span style={{ color: '#FF6B6B', fontSize: '36px' }}>{result.raw_score}%</span>
        </h2>

        {/* --- 新增：分析文案展示区 --- */}
        <div style={{ 
            marginTop: '30px', 
            padding: '25px', 
            background: '#fff', 
            borderRadius: '16px', 
            textAlign: 'left',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid #f0f0f0'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333', fontSize: '18px' }}>💡 情感分析报告</h3>
          <p style={{ lineHeight: '1.8', color: '#555', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
            {analysisText}
          </p>
        </div>

        {/* --- 修改：标签展示区 --- */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '16px', color: '#999', marginBottom: '15px' }}>✨ 关系关键词</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {tagsList.length > 0 ? (
              tagsList.map((tag, index) => (
                <span key={index} style={{ 
                    padding: '8px 20px', 
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', 
                    color: 'white', 
                    borderRadius: '50px', 
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 5px rgba(255, 107, 107, 0.3)'
                }}>
                  {tag}
                </span>
              ))
            ) : (
              <span style={{ color: '#ccc' }}>暂无标签</span>
            )}
          </div>
        </div>

        <p style={{ marginTop: '40px', color: '#ccc', fontSize: '12px' }}>
          (Phase 2 测试成功！AI 深度分析已打通)
        </p>
      </div>
    );
  }

  // --- 正常答题页面 ---
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 进度条 */}
      <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '40px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#FF6B6B', borderRadius: '3px', transition: 'width 0.3s' }}></div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2 style={{ color: '#333' }}>正在分析你们的恋爱模型...</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>AI 大脑正在飞速运转 🧠</p>
          {/* 这里可以加个简单的转圈动画，如果不想加也没关系 */}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '40px' }}>
            <span style={{ color: '#999', fontSize: '14px', letterSpacing: '1px' }}>QUESTION {currentStep + 1} / {questions.length}</span>
            <h2 style={{ fontSize: '24px', lineHeight: '1.4', marginTop: '15px', color: '#222' }}>{currentQuestion.text}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                style={{
                  padding: '20px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '16px',
                  background: '#fff',
                  textAlign: 'left',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#444'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#FF6B6B'; e.currentTarget.style.background = '#FFF5F5'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = '#fff'; }}
              >
                <span style={{ fontWeight: 'bold', marginRight: '10px', color: '#FF6B6B' }}>{option.label}.</span>
                {option.text}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

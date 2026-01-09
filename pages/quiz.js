import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { questions } from '../data/mockQuestions';

export default function Quiz() {
  const router = useRouter();
  const { invite_code } = router.query; 

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [isUserB, setIsUserB] = useState(false);
  
  // --- 新增：控制加载文案的状态 ---
  const [loadingText, setLoadingText] = useState("正在建立加密连接...");
  const [loadingProgress, setLoadingProgress] = useState(0);

  // 模拟 AI 分析的步骤文案
  const loadingMessages = [
      "正在上传双方潜意识数据...",
      "AI 正在构建你们的心理画像...", 
      "正在比对 16 种人格维度的契合度...",
      "检测到深层价值观共鸣，正在深入分析...",
      "正在生成情感建议与相处之道...",
      "报告生成完毕，正在最后排版..."
  ];

  useEffect(() => {
    if (router.isReady) {
        if (invite_code) {
            setIsUserB(true);
        }
    }
  }, [router.isReady, invite_code]);

  // --- 新增：加载动画逻辑 ---
  useEffect(() => {
      if (loading) {
          let step = 0;
          // 1. 进度条跑起来
          const timer = setInterval(() => {
              setLoadingProgress(old => {
                  if (old >= 95) return 95; // 卡在 95% 等待真正跳转
                  return old + 1.5; // 每 100ms 走一点
              });
          }, 100);

          // 2. 文案变起来 (每 2.5 秒换一句话)
          const textTimer = setInterval(() => {
              step = (step + 1) % loadingMessages.length;
              setLoadingText(loadingMessages[step]);
          }, 2500);

          return () => {
              clearInterval(timer);
              clearInterval(textTimer);
          };
      }
  }, [loading]);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionSelect = async (optionLabel) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionLabel.label };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      await submitToBackend(newAnswers);
    }
  };

  const submitToBackend = async (finalAnswers) => {
    setLoading(true); // 开始播放动画
    setLoadingText(loadingMessages[0]); // 重置文案
    
    const BACKEND_URL = 'https://love-test-web-production.up.railway.app'; 

    try {
      let url, body;
      const codeToUse = isUserB ? invite_code : router.query.invite_code;

      if (codeToUse) {
          url = `${BACKEND_URL}/submit_part_b`;
          body = { invite_code: codeToUse, answers: finalAnswers };
      } else {
          url = `${BACKEND_URL}/submit_part_a`;
          body = { user_id: "user_a_" + Date.now(), answers: finalAnswers };
      }

      const response = await fetch(url, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();

      if (data.test_id) {
          setLoadingProgress(100); // 瞬间拉满
          setLoadingText("✅ 完成！正在跳转...");
          // 稍微停顿一下让用户看到 100%
          setTimeout(() => {
              router.push(`/result/${data.test_id}`);
          }, 500);
      } else if (data.status === 'already_finished') {
          router.push(`/result/${data.test_id}`);
      } else {
          alert("提交异常，请检查网络");
          setLoading(false);
      }

    } catch (error) {
      console.error("提交报错:", error);
      alert("网络请求失败");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* 顶部进度条 (答题时显示) */}
      {!loading && (
        <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '40px' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: isUserB ? '#25D366' : '#FF6B6B', borderRadius: '3px', transition: 'width 0.3s' }}></div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '80px', padding: '0 20px' }}>
          {/* 动态 Emoji */}
          <div style={{ fontSize: '60px', marginBottom: '30px', animation: 'bounce 1s infinite' }}>🧠</div>
          
          {/* 动态文案 */}
          <h2 style={{ color: '#333', fontSize: '20px', minHeight: '50px', transition: 'all 0.3s' }}>
            {loadingText}
          </h2>
          
          {/* 加载进度条 */}
          <div style={{ width: '100%', height: '10px', background: '#f0f0f0', borderRadius: '5px', marginTop: '20px', overflow: 'hidden' }}>
             <div style={{ 
                 width: `${loadingProgress}%`, 
                 height: '100%', 
                 background: 'linear-gradient(90deg, #FF6B6B, #FF8E53)', 
                 borderRadius: '5px',
                 transition: 'width 0.1s linear'
             }}></div>
          </div>
          
          <p style={{ color: '#999', fontSize: '12px', marginTop: '15px' }}>
            (深度分析约需 15-30 秒，请勿关闭页面)
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '10px' }}>
             {(isUserB || invite_code) && (
                 <span style={{background: '#25D366', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>
                    🤝 正在匹配 User A
                 </span>
             )}
          </div>
          <div style={{ marginBottom: '40px' }}>
            <span style={{ color: '#999', fontSize: '14px' }}>QUESTION {currentStep + 1} / {questions.length}</span>
            <h2 style={{ fontSize: '24px', lineHeight: '1.4', marginTop: '15px' }}>{currentQuestion.text}</h2>
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
              >
                <span style={{ fontWeight: 'bold', marginRight: '10px', color: (isUserB || invite_code) ? '#25D366' : '#FF6B6B' }}>{option.label}.</span>
                {option.text}
              </button>
            ))}
          </div>
        </>
      )}
      
      {/* 简单的 CSS 动画 */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

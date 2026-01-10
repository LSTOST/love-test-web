import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// --- 核心优化：在服务器构建时就把题目抓好 ---
export async function getStaticProps() {
  const BACKEND_URL = 'https://love-test-web-production.up.railway.app';
  
  try {
    const res = await fetch(`${BACKEND_URL}/questions`);
    const questions = await res.json();
    
    return {
      props: {
        initialQuestions: questions, // 把题目作为 props 传给页面
      },
      // ISR (增量静态再生): 每隔 60 秒尝试更新一次题目
      // 这样你改了数据库，不用重新部署，过一分钟用户也能看到新题
      revalidate: 60, 
    };
  } catch (error) {
    console.error("构建时拉取题目失败:", error);
    return {
      props: {
        initialQuestions: [],
      },
    };
  }
}

export default function Quiz({ initialQuestions }) { // 这里直接接收题目
  const router = useRouter();
  const { invite_code } = router.query; 

  // 直接使用预加载好的题目，不再需要 loading 状态
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [isUserB, setIsUserB] = useState(false);

  // --- 动画状态 ---
  const [loadingText, setLoadingText] = useState("正在建立加密连接...");
  const [loadingProgress, setLoadingProgress] = useState(0);

  // 这里的 useEffect 只处理 User B 的身份识别，不再负责拉题
  useEffect(() => {
    if (router.isReady && invite_code) {
        setIsUserB(true);
    }
  }, [router.isReady, invite_code]);

  // 加载动画逻辑 (保持不变)
  const loadingMessages = [
      "正在上传双方潜意识数据...", "AI 正在构建你们的心理画像...", 
      "正在比对 16 种人格维度的契合度...", "检测到深层价值观共鸣...",
      "正在生成情感建议与相处之道...", "报告生成完毕..."
  ];

  useEffect(() => {
      if (loading) {
          let step = 0;
          const timer = setInterval(() => {
              setLoadingProgress(old => (old >= 95 ? 95 : old + 1.5));
          }, 100);
          const textTimer = setInterval(() => {
              step = (step + 1) % loadingMessages.length;
              setLoadingText(loadingMessages[step]);
          }, 2500);
          return () => { clearInterval(timer); clearInterval(textTimer); };
      }
  }, [loading]);

  const handleOptionSelect = async (option) => {
    const currentQuestion = questions[currentStep];
    const newAnswers = { ...answers, [currentQuestion.id]: option.label };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      await submitToBackend(newAnswers);
    }
  };

  const submitToBackend = async (finalAnswers) => {
    setLoading(true);
    setLoadingText(loadingMessages[0]);
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
          setLoadingProgress(100);
          setLoadingText("✅ 完成！正在跳转...");
          setTimeout(() => router.push(`/result/${data.test_id}`), 500);
      } else if (data.status === 'already_finished') {
          router.push(`/result/${data.test_id}`);
      } else {
          alert("提交异常"); setLoading(false);
      }
    } catch (error) {
      console.error(error); alert("网络请求失败"); setLoading(false);
    }
  };

  // 如果题目还没加载出来 (极少情况)，给个兜底
  if (!questions || questions.length === 0) {
      return <div style={{padding:'50px', textAlign:'center', color:'#888'}}>⏳ 正在准备题目...</div>;
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {!loading && (
        <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '40px' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: isUserB ? '#25D366' : '#FF6B6B', borderRadius: '3px', transition: 'width 0.3s' }}></div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '80px', padding: '0 20px' }}>
          <div style={{ fontSize: '60px', marginBottom: '30px', animation: 'bounce 1s infinite' }}>🧠</div>
          <h2 style={{ color: '#333', fontSize: '20px', minHeight: '50px' }}>{loadingText}</h2>
          <div style={{ width: '100%', height: '10px', background: '#f0f0f0', borderRadius: '5px', marginTop: '20px', overflow: 'hidden' }}>
             <div style={{ width: `${loadingProgress}%`, height: '100%', background: 'linear-gradient(90deg, #FF6B6B, #FF8E53)', transition: 'width 0.1s linear' }}></div>
          </div>
          <p style={{ color: '#999', fontSize: '12px', marginTop: '15px' }}>(深度分析约需 15-30 秒)</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '10px' }}>
             {(isUserB || invite_code) && (
                 <span style={{background: '#25D366', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>🤝 正在匹配 User A</span>
             )}
          </div>
          <div style={{ marginBottom: '40px' }}>
            <span style={{ color: '#999', fontSize: '14px' }}>QUESTION {currentStep + 1} / {questions.length}</span>
            <h2 style={{ fontSize: '24px', lineHeight: '1.4', marginTop: '15px' }}>{currentQuestion.content}</h2>
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
      <style jsx>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
    </div>
  );
}

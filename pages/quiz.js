import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Quiz() {
  const router = useRouter();
  const { invite_code } = router.query; 

  // --- 状态管理 ---
  const [questions, setQuestions] = useState([]); // 题目变为空数组，等待加载
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  
  // 页面初始化加载状态
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);
  
  const [isUserB, setIsUserB] = useState(false);

  // --- 动画状态 ---
  const [loadingText, setLoadingText] = useState("正在建立加密连接...");
  const [loadingProgress, setLoadingProgress] = useState(0);

  const BACKEND_URL = 'https://love-test-web-production.up.railway.app'; 

  // --- 核心改动：从后端拉取题目 ---
  useEffect(() => {
    fetch(`${BACKEND_URL}/questions`)
      .then(res => res.json())
      .then(data => {
        // 简单处理：把数据库的 options (JSONB) 格式化一下确保能用
        // 数据库存的是：[{"label":"A", "text":"..."}, ...]
        setQuestions(data);
        setIsQuestionsLoading(false);
      })
      .catch(err => {
        console.error("题目加载失败:", err);
        alert("题目加载失败，请刷新页面");
      });
  }, []);

  // 身份识别逻辑
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

  // --- 逻辑处理 ---
  const handleOptionSelect = async (option) => {
    // option 现在是数据库里的结构: {label: "A", text: "...", score: ...}
    const currentQuestion = questions[currentStep];
    const newAnswers = { ...answers, [currentQuestion.id]: option.label }; // 用题目ID作为key更稳健
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

  // --- 渲染逻辑 ---
  if (isQuestionsLoading) {
      return <div style={{padding:'50px', textAlign:'center', color:'#888'}}>⏳ 正在从云端加载题库...</div>;
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
            {/* 注意：这里的 options 是从数据库读出来的 */}
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

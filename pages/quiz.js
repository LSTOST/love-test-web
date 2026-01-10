import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export async function getStaticProps() {
  const BACKEND_URL = 'https://love-test-web-production.up.railway.app';
  try {
    const res = await fetch(`${BACKEND_URL}/questions`);
    const questions = await res.json();
    return { props: { initialQuestions: questions }, revalidate: 60 };
  } catch (error) {
    return { props: { initialQuestions: [] } };
  }
}

export default function Quiz({ initialQuestions }) {
  const router = useRouter();
  const { invite_code } = router.query; 

  const [stage, setStage] = useState('name_input'); 
  const [userName, setUserName] = useState('');
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isUserB, setIsUserB] = useState(false);
  const [loadingText, setLoadingText] = useState("正在建立加密连接...");
  const [loadingProgress, setLoadingProgress] = useState(0);

  // 身份识别
  useEffect(() => {
    if (router.isReady && invite_code) {
        setIsUserB(true);
    }
  }, [router.isReady, invite_code]);

  // 提交名字，开始答题 (🔥 核心修复点)
  const handleNameSubmit = () => {
    if (!userName.trim()) return alert("请留下你的昵称哦~");
    
    // 📢 如果是 User B，必须通知后端“我进场了”
    if (isUserB && invite_code) {
        const BACKEND_URL = 'https://love-test-web-production.up.railway.app';
        
        // 发送通知 (Fire and Forget)
        fetch(`${BACKEND_URL}/notify_join`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                invite_code: invite_code, 
                name: userName 
            })
        }).then(() => {
            console.log("✅ 已发送进场通知:", userName);
        }).catch(err => {
            console.error("❌ 通知失败:", err);
        });
    }

    setStage('quiz');
  };

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
    setStage('loading');
    setLoadingText(loadingMessages[0]);
    
    const payloadAnswers = { ...finalAnswers, user_name: userName };
    const BACKEND_URL = 'https://love-test-web-production.up.railway.app';

    try {
      let url, body;
      const codeToUse = isUserB ? invite_code : router.query.invite_code;

      if (codeToUse) {
          url = `${BACKEND_URL}/submit_part_b`;
          body = { invite_code: codeToUse, answers: payloadAnswers };
      } else {
          url = `${BACKEND_URL}/submit_part_a`;
          body = { user_id: "user_a_" + Date.now(), answers: payloadAnswers };
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
          alert("提交异常"); setStage('quiz');
      }
    } catch (error) {
      console.error(error); alert("网络请求失败"); setStage('quiz');
    }
  };

  const loadingMessages = [
      `正在上传 ${userName} 的潜意识数据...`, 
      "AI 正在构建你们的心理画像...", "正在比对 16 种人格维度的契合度...", 
      "检测到深层价值观共鸣...", "正在生成情感建议与相处之道...", "报告生成完毕..."
  ];

  useEffect(() => {
      if (stage === 'loading') {
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
  }, [stage]);

  if (!questions || questions.length === 0) return <div style={{padding:'50px', textAlign:'center'}}>⏳ 准备中...</div>;

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="quiz-container">
      {/* 1. 名字输入阶段 */}
      {stage === 'name_input' && (
        <div className="card name-card slide-up">
           <div className="icon-wrapper">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
               <circle cx="12" cy="7" r="4"></circle>
             </svg>
           </div>
           
           <h2 className="card-title">
             {isUserB ? '受邀的伙伴' : '很高兴遇见你'}
           </h2>
           <p className="card-desc">
             {isUserB 
               ? '你的另一半已经完成了测试，现在轮到你了。' 
               : '在开启深度探索之前，我们该怎么称呼你？'}
           </p>

           <div className="input-group">
             <input 
               type="text" 
               placeholder="输入你的昵称" 
               value={userName}
               onChange={e => setUserName(e.target.value)}
               maxLength={10}
               className="modern-input"
               onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
             />
           </div>

           <button onClick={handleNameSubmit} className="gradient-btn">
             开始探索
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:8}}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
             </svg>
           </button>
        </div>
      )}

      {/* 2. 答题阶段 */}
      {stage === 'quiz' && (
        <div className="quiz-content slide-up">
          <div className="progress-bar">
             <div className="progress-fill" style={{ width: `${progress}%`, background: isUserB ? '#25D366' : '#FF6B6B' }}></div>
          </div>
          <div className="question-header">
            <span className="step-tag">Q{currentStep + 1}</span>
            <h2>{currentQuestion.content}</h2>
          </div>
          <div className="options-list">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                className="option-btn"
              >
                <span className="option-label" style={{ color: isUserB ? '#25D366' : '#FF6B6B' }}>{option.label}</span>
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. 加载/提交阶段 */}
      {stage === 'loading' && (
        <div className="loading-screen fade-in">
          <div className="brain-icon">🧠</div>
          <h2 className="loading-text">{loadingText}</h2>
          <div className="loading-bar-bg">
             <div className="loading-bar-fill" style={{ width: `${loadingProgress}%` }}></div>
          </div>
        </div>
      )}

      <style jsx>{`
        * { box-sizing: border-box; }
        .quiz-container { min-height: 100vh; background: #f8f9fa; padding: 20px; font-family: sans-serif; display: flex; align-items: center; justify-content: center; }
        .card, .quiz-content, .loading-screen { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); width: 100%; max-width: 440px; padding: 40px 32px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.06); border: 1px solid rgba(255,255,255,0.8); }
        .name-card { text-align: center; }
        .icon-wrapper { width: 60px; height: 60px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #111; }
        .card-title { font-size: 24px; font-weight: 800; color: #111; margin: 0 0 10px; }
        .card-desc { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
        .input-group { width: 100%; margin-bottom: 20px; }
        .modern-input { display: block; width: 100%; height: 56px; padding: 0 20px; background: #fff; border: 2px solid #eee; border-radius: 50px; font-size: 16px; text-align: center; outline: none; color: #111; font-weight: 500; transition: all 0.2s; }
        .modern-input:focus { border-color: #FF6B6B; box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1); }
        .gradient-btn { display: flex; width: 100%; height: 56px; padding: 0 20px; background: #111; color: white; border: none; border-radius: 50px; font-size: 16px; font-weight: 600; cursor: pointer; align-items: center; justify-content: center; transition: transform 0.2s; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .gradient-btn:hover { transform: translateY(-2px); background: #000; }
        .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .progress-bar { height: 6px; background: #eee; border-radius: 3px; margin-bottom: 30px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .step-tag { font-size: 12px; color: #999; font-weight: 600; letter-spacing: 1px; }
        .question-header h2 { font-size: 22px; margin: 10px 0 30px; line-height: 1.4; color: #222; }
        .options-list { display: flex; flexDirection: column; gap: 12px; }
        .option-btn { padding: 18px 20px; background: #fff; border: 1px solid #eee; border-radius: 16px; text-align: left; font-size: 16px; color: #444; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; }
        .option-btn:active { transform: scale(0.98); background: #f9f9f9; }
        .option-label { font-weight: 800; margin-right: 12px; font-size: 18px; }
        .loading-screen { text-align: center; padding: 50px 30px; }
        .brain-icon { font-size: 60px; margin-bottom: 30px; animation: bounce 1s infinite; }
        .loading-text { font-size: 18px; color: #333; min-height: 24px; margin-bottom: 30px; }
        .loading-bar-bg { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
        .loading-bar-fill { height: 100%; background: linear-gradient(90deg, #FF6B6B, #FF8E53); transition: width 0.3s; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}

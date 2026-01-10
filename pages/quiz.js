import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// SSG
export async function getStaticProps() {
  const BACKEND_URL = 'https://love-test-web-production.up.railway.app';
  try {
    const res = await fetch(`${BACKEND_URL}/questions`);
    const questions = await res.json();
    return { props: { initialQuestions: questions }, revalidate: 60 };
  } catch (error) {
    // 就算后端挂了，也返回空数组，防止构建失败
    return { props: { initialQuestions: [] }, revalidate: 60 };
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
  const [loadingText, setLoadingText] = useState("正在连接 AI...");
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (router.isReady && invite_code) setIsUserB(true);
  }, [router.isReady, invite_code]);

  const handleNameSubmit = () => {
    if (!userName.trim()) return alert("请留下你的昵称哦~");
    
    // 发送进场通知 (不阻塞)
    if (isUserB && invite_code) {
        const BACKEND_URL = 'https://love-test-web-production.up.railway.app';
        fetch(`${BACKEND_URL}/notify_join`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ invite_code: invite_code, name: userName })
        }).catch(err => console.error("通知异常:", err));
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
    setLoadingText("正在上传数据...");
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
          setTimeout(() => router.push(`/result/${data.test_id}`), 500);
      } else if (data.status === 'already_finished') {
          router.push(`/result/${data.test_id}`);
      } else {
          alert("提交失败，请重试"); setStage('quiz');
      }
    } catch (error) {
      console.error(error); alert("网络请求失败，请检查网络"); setStage('quiz');
    }
  };

  // 🛡️ 安全检查 1: 确保题目已加载
  if (!questions || questions.length === 0) {
      return <div style={{padding:'50px', textAlign:'center', color:'#888'}}>
          <h3>⏳ 正在连接题库...</h3>
          <p style={{fontSize:'12px'}}>如果长时间未加载，可能是后端服务正在重启，请刷新页面。</p>
      </div>;
  }

  // 🛡️ 安全检查 2: 确保当前题目数据有效 (防止 map undefined 报错)
  const currentQuestion = questions[currentStep];
  if (!currentQuestion || !Array.isArray(currentQuestion.options)) {
      return <div style={{padding:'50px', textAlign:'center', color:'red'}}>
          ❌ 题目数据格式异常 (Q{currentStep + 1})
      </div>;
  }

  return (
    <div className="quiz-container">
      {/* 1. 名字输入阶段 */}
      {stage === 'name_input' && (
        <div className="card name-card slide-up">
           <div className="icon-wrapper">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
           </div>
           <h2 className="card-title">{isUserB ? '受邀的伙伴' : '很高兴遇见你'}</h2>
           <p className="card-desc">{isUserB ? '你的另一半已完成测试，轮到你了' : '开启深度探索前，怎么称呼你？'}</p>
           <div className="input-group">
             <input type="text" placeholder="输入你的昵称" value={userName} onChange={e => setUserName(e.target.value)} maxLength={10} className="modern-input" />
           </div>
           <button onClick={handleNameSubmit} className="gradient-btn">开始探索</button>
        </div>
      )}

      {/* 2. 答题阶段 */}
      {stage === 'quiz' && (
        <div className="quiz-content slide-up">
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${((currentStep + 1) / questions.length) * 100}%`, background: isUserB ? '#25D366' : '#FF6B6B' }}></div></div>
          <div className="question-header"><span className="step-tag">Q{currentStep + 1}</span><h2>{currentQuestion.content}</h2></div>
          <div className="options-list">
            {currentQuestion.options.map((option, index) => (
              <button key={index} onClick={() => handleOptionSelect(option)} className="option-btn">
                <span className="option-label" style={{ color: isUserB ? '#25D366' : '#FF6B6B' }}>{option.label}</span>
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. 加载阶段 */}
      {stage === 'loading' && (
        <div className="loading-screen fade-in">
          <div className="brain-icon">🧠</div>
          <h2 className="loading-text">{loadingText}</h2>
          <div className="loading-bar-bg"><div className="loading-bar-fill" style={{ width: `${loadingProgress}%` }}></div></div>
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

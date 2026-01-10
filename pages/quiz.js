import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// SSG: 预取题目
export async function getStaticProps() {
  const BACKEND_URL = 'https://love-test-web-production.up.railway.app';
  try {
    const res = await fetch(`${BACKEND_URL}/questions`);
    const questions = await res.json();
    return { props: { initialQuestions: questions }, revalidate: 60 };
  } catch (error) {
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

  // 1. 提交名字
  const handleNameSubmit = () => {
    if (!userName.trim()) return alert("请留下你的昵称哦~");
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

  // 2. 选择选项
  const handleOptionSelect = async (option) => {
    const currentQuestion = questions[currentStep];
    const newAnswers = { ...answers, [currentQuestion.id]: option.label };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 250);
    } else {
      await submitToBackend(newAnswers);
    }
  };

  // 3. 提交后端
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
      console.error(error); alert("网络请求失败"); setStage('quiz');
    }
  };

  // 兜底检查
  if (!questions || questions.length === 0) return <div style={{padding:'50px', textAlign:'center', color:'#888'}}>⏳ 题库加载中...</div>;
  const currentQuestion = questions[currentStep];
  if (!currentQuestion) return null;

  const themeColor = isUserB ? '#10B981' : '#FF6B6B';

  return (
    <div className="quiz-container">
      
      {/* 阶段 1: 名字输入 */}
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

      {/* 阶段 2: 答题 */}
      {stage === 'quiz' && (
        <div className="quiz-content slide-up">
          <div className="progress-container">
             <div className="progress-text">
                Question <span style={{color: themeColor, fontWeight:'bold'}}>{currentStep + 1}</span>
                <span style={{opacity:0.4}}> / {questions.length}</span>
             </div>
             <div className="progress-bar-bg">
                <div className="progress-fill" style={{ width: `${((currentStep + 1) / questions.length) * 100}%`, background: themeColor }}></div>
             </div>
          </div>
          <div className="question-header">
            <h2 className="question-text">{currentQuestion.content}</h2>
          </div>
          <div className="options-list">
            {currentQuestion.options.map((option, index) => (
              <button key={index} onClick={() => handleOptionSelect(option)} className="option-btn">
                <div className="option-tag" style={{ color: themeColor, background: isUserB ? '#ecfdf5' : '#fff1f2' }}>
                    {option.label}
                </div>
                <div className="option-content">
                    {option.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 阶段 3: 加载 (这里就是你要替换的云端图标部分) */}
      {stage === 'loading' && (
        <div className="loading-screen fade-in">
          <div className="upload-icon-wrapper">
            {/* 云端上传 SVG 图标 */}
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#gradient-upload)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="gradient-upload" x1="0" y1="0" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B6B" />
                  <stop offset="100%" stopColor="#FF8E53" />
                </linearGradient>
              </defs>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h2 className="loading-text">{loadingText}</h2>
          <div className="loading-bar-bg"><div className="loading-bar-fill" style={{ width: `${loadingProgress}%` }}></div></div>
        </div>
      )}

      <style jsx>{`
        * { box-sizing: border-box; }
        .quiz-container { min-height: 100vh; background: #f8f9fa; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; }
        .card, .quiz-content, .loading-screen { background: white; width: 100%; max-width: 440px; padding: 30px 24px; border-radius: 24px; box-shadow: 0 15px 35px rgba(0,0,0,0.08); border: 1px solid rgba(255,255,255,0.8); }
        
        /* 名字卡片 */
        .name-card { text-align: center; }
        .icon-wrapper { width: 60px; height: 60px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #111; }
        .card-title { font-size: 24px; font-weight: 800; color: #111; margin: 0 0 10px; }
        .card-desc { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
        .modern-input { display: block; width: 100%; height: 56px; padding: 0 20px; background: #fff; border: 2px solid #eee; border-radius: 50px; font-size: 16px; text-align: center; outline: none; color: #111; font-weight: 500; transition: all 0.2s; margin-bottom: 20px; }
        .modern-input:focus { border-color: #333; }
        .gradient-btn { display: flex; width: 100%; height: 56px; padding: 0 20px; background: #111; color: white; border: none; border-radius: 50px; font-size: 16px; font-weight: 600; cursor: pointer; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }

        /* 答题页 */
        .progress-container { margin-bottom: 30px; }
        .progress-text { font-size: 12px; color: #888; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.5px; text-transform: uppercase; }
        .progress-bar-bg { height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s ease; border-radius: 3px; }
        .question-header { margin-bottom: 30px; min-height: 60px; }
        .question-text { font-size: 22px; line-height: 1.4; color: #1a1a1a; font-weight: 700; margin: 0; }
        .options-list { display: flex; flex-direction: column; gap: 16px; }
        .option-btn { position: relative; padding: 20px; background: #fff; border: 2px solid #f3f4f6; border-radius: 18px; text-align: left; cursor: pointer; transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); display: flex; align-items: flex-start; gap: 16px; width: 100%; }
        .option-btn:active { transform: scale(0.98); background: #fafafa; border-color: #e5e7eb; }
        .option-tag { font-weight: 800; font-size: 16px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 10px; flex-shrink: 0; margin-top: 2px; }
        .option-content { font-size: 16px; color: #333; line-height: 1.5; flex: 1; font-weight: 500; }

        /* 🔥 加载页 (新样式) */
        .loading-screen { text-align: center; padding: 50px 30px; }
        
        .upload-icon-wrapper { 
          margin-bottom: 25px; 
          animation: float 2s ease-in-out infinite; 
          display: inline-block;
        }
        
        .loading-text { font-size: 16px; color: #333; margin-bottom: 20px; font-weight: 500; }
        .loading-bar-bg { height: 6px; background: #eee; border-radius: 4px; overflow: hidden; }
        .loading-bar-fill { height: 100%; background: linear-gradient(90deg, #FF6B6B, #FF8E53); transition: width 0.3s; }
        
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .slide-up { animation: slideUp 0.5s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

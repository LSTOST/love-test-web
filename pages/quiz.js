import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// --- 核心优化：在服务器构建时就把题目抓好 (SSG) ---
export async function getStaticProps() {
  const BACKEND_URL = 'https://love-test-web-production.up.railway.app';
  
  try {
    const res = await fetch(`${BACKEND_URL}/questions`);
    const questions = await res.json();
    
    return {
      props: { initialQuestions: questions },
      revalidate: 60, 
    };
  } catch (error) {
    console.error("构建时拉取题目失败:", error);
    return { props: { initialQuestions: [] } };
  }
}

export default function Quiz({ initialQuestions }) {
  const router = useRouter();
  const { invite_code } = router.query; 

  // --- 状态管理 ---
  // 阶段：'name_input' (输名字) -> 'quiz' (答题) -> 'loading' (提交中)
  const [stage, setStage] = useState('name_input'); 
  const [userName, setUserName] = useState('');
  
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isUserB, setIsUserB] = useState(false);

  // --- 动画状态 ---
  const [loadingText, setLoadingText] = useState("正在建立加密连接...");
  const [loadingProgress, setLoadingProgress] = useState(0);

  // 身份识别
  useEffect(() => {
    if (router.isReady && invite_code) {
        setIsUserB(true);
    }
  }, [router.isReady, invite_code]);

  // 提交名字，开始答题
  const handleNameSubmit = () => {
    if (!userName.trim()) return alert("请留下你的大名/昵称哦~");
    setStage('quiz');
  };

  // 选项点击
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

  // 提交到后端
  const submitToBackend = async (finalAnswers) => {
    setStage('loading');
    setLoadingText(loadingMessages[0]);
    
    // 把名字也混入答案中发给后端
    // 这样 AI 看到 json 里有 "user_name": "xxx"，就会在报告里叫你的名字！
    const payloadAnswers = {
        ...finalAnswers,
        user_name: userName 
    };

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
          alert("提交异常"); 
          setStage('quiz'); // 回退
      }
    } catch (error) {
      console.error(error); 
      alert("网络请求失败"); 
      setStage('quiz');
    }
  };

  // 加载动画文案
  const loadingMessages = [
      `正在上传 ${userName} 的潜意识数据...`, // 这里的文案也个性化了！
      "AI 正在构建你们的心理画像...", 
      "正在比对 16 种人格维度的契合度...", 
      "检测到深层价值观共鸣...",
      "正在生成情感建议与相处之道...", 
      "报告生成完毕..."
  ];

  // 动画计时器
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
        <div className="card name-card">
           <div className="icon">👋</div>
           <h2>Hi，{isUserB ? '受邀的伙伴' : '很高兴遇见你'}</h2>
           <p className="desc">
             {isUserB 
               ? '你的另一半已经完成了测试，现在轮到你了。' 
               : '在开启深度探索之前，我们该怎么称呼你？'}
           </p>
           <input 
             type="text" 
             placeholder="请输入你的昵称" 
             value={userName}
             onChange={e => setUserName(e.target.value)}
             maxLength={10}
             className="name-input"
             onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
           />
           <button onClick={handleNameSubmit} className="start-btn">
             开始测试
           </button>
        </div>
      )}

      {/* 2. 答题阶段 */}
      {stage === 'quiz' && (
        <div className="quiz-content">
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
        <div className="loading-screen">
          <div className="brain-icon">🧠</div>
          <h2 className="loading-text">{loadingText}</h2>
          <div className="loading-bar-bg">
             <div className="loading-bar-fill" style={{ width: `${loadingProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* 样式表 */}
      <style jsx>{`
        .quiz-container {
          min-height: 100vh;
          background: #f8f9fa;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 卡片通用样式 */
        .card, .quiz-content, .loading-screen {
          background: white;
          width: 100%;
          max-width: 500px;
          padding: 30px;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        /* 名字输入卡片 */
        .name-card {
          text-align: center;
        }
        .icon { font-size: 40px; margin-bottom: 20px; }
        .name-card h2 { margin: 0 0 10px; color: #333; }
        .desc { color: #666; font-size: 14px; margin-bottom: 30px; line-height: 1.5; }
        .name-input {
          width: 100%;
          padding: 15px;
          border: 2px solid #eee;
          border-radius: 12px;
          font-size: 16px;
          text-align: center;
          margin-bottom: 20px;
          outline: none;
          transition: border-color 0.3s;
        }
        .name-input:focus { border-color: #FF6B6B; }
        .start-btn {
          width: 100%;
          padding: 16px;
          background: #333;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        }

        /* 答题样式 */
        .progress-bar {
          height: 6px;
          background: #eee;
          border-radius: 3px;
          margin-bottom: 30px;
          overflow: hidden;
        }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .step-tag {
          font-size: 12px;
          color: #999;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .question-header h2 {
          font-size: 22px;
          margin: 10px 0 30px;
          line-height: 1.4;
          color: #222;
        }
        .options-list { display: flex; flexDirection: column; gap: 12px; }
        .option-btn {
          padding: 18px 20px;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 16px;
          text-align: left;
          font-size: 16px;
          color: #444;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }
        .option-btn:active { transform: scale(0.98); background: #f9f9f9; }
        .option-label {
          font-weight: 800;
          margin-right: 12px;
          font-size: 18px;
        }

        /* 加载样式 */
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

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { questions } from '../data/mockQuestions';

export default function Quiz() {
  const router = useRouter();
  
  // --- 核心修复 1: 变量名必须和 URL 里的 ?invite_code 一模一样 ---
  const { invite_code } = router.query; 

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [isUserB, setIsUserB] = useState(false);

  // --- 核心修复 2: 确保 Router 准备好后再判断身份 ---
  useEffect(() => {
    if (router.isReady) {
        if (invite_code) {
            setIsUserB(true);
            console.log("✅ 识别到伴侣身份，邀请码:", invite_code);
        } else {
            console.log("👤 识别为新用户 (User A)");
        }
    }
  }, [router.isReady, invite_code]);

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
    setLoading(true);
    const BACKEND_URL = 'https://love-test-web-production.up.railway.app'; 

    try {
      let url, body;

      // 再次确认身份，防止 State 没更新
      // 优先使用 isUserB，如果没检测到，再看一眼 router 里有没有 invite_code
      const codeToUse = isUserB ? invite_code : router.query.invite_code;

      if (codeToUse) {
          // --- User B (伴侣) 提交逻辑 ---
          console.log("正在提交 Part B...");
          url = `${BACKEND_URL}/submit_part_b`;
          body = { invite_code: codeToUse, answers: finalAnswers };
      } else {
          // --- User A (发起人) 提交逻辑 ---
          console.log("正在提交 Part A...");
          url = `${BACKEND_URL}/submit_part_a`;
          body = { user_id: "user_a_" + Date.now(), answers: finalAnswers };
      }

      const response = await fetch(url, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      console.log("后端返回:", data);

      if (data.test_id) {
          // 成功！跳转结果页
          router.push(`/result/${data.test_id}`);
      } else if (data.status === 'already_finished') {
          alert("这个邀请码已经使用过了！直接带你去看结果。");
          router.push(`/result/${data.test_id}`);
      } else {
          alert("提交异常，请检查网络");
          setLoading(false);
      }

    } catch (error) {
      console.error("提交报错:", error);
      alert("网络请求失败，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '40px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: isUserB ? '#25D366' : '#FF6B6B', borderRadius: '3px', transition: 'width 0.3s' }}></div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          {/* 根据身份显示不同的加载文案 */}
          <h2>{isUserB || router.query.invite_code ? "正在合并数据召唤 AI..." : "正在生成基础画像..."}</h2>
          <p style={{color: '#999'}}>AI 大脑正在飞速运转 🧠</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '10px' }}>
             {/* 顶部标签：让你明确知道自己现在的身份 */}
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
    </div>
  );
}

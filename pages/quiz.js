import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { questions } from '../data/mockQuestions';

export default function Quiz() {
  const router = useRouter();
  // 从网址获取邀请码 (比如 /quiz?invite_code=ABCD)
  const { inviteCode } = router.query; 

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [isUserB, setIsUserB] = useState(false);

  // 检查是不是 User B
  useEffect(() => {
    if (inviteCode) {
        setIsUserB(true);
        console.log("当前身份: User B (伴侣), 邀请码:", inviteCode);
    }
  }, [inviteCode]);

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
    const BACKEND_URL = 'https://love-test-web-production.up.railway.app'; // 你的真实地址

    try {
      let url, body;

      if (isUserB) {
          // --- User B 提交逻辑 ---
          url = `${BACKEND_URL}/submit_part_b`;
          body = { invite_code: inviteCode, answers: finalAnswers };
      } else {
          // --- User A 提交逻辑 ---
          url = `${BACKEND_URL}/submit_part_a`;
          body = { user_id: "user_a_" + Date.now(), answers: finalAnswers };
      }

      const response = await fetch(url, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      console.log("提交成功:", data);

      if (data.test_id) {
          // 无论 A 还是 B，成功后都去结果页
          router.push(`/result/${data.test_id}`);
      } else if (data.status === 'already_finished') {
          alert("这个邀请码已经使用过了！");
          router.push(`/result/${data.test_id}`);
      } else {
          alert("提交异常，请重试");
          setLoading(false);
      }

    } catch (error) {
      console.error("Error:", error);
      alert("网络请求失败");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '40px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: isUserB ? '#333' : '#FF6B6B', borderRadius: '3px', transition: 'width 0.3s' }}></div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2>{isUserB ? "正在合并数据召唤 AI..." : "正在生成基础画像..."}</h2>
          <p>请稍候片刻...</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '10px' }}>
             {/* 顶部提示身份 */}
             {isUserB && <span style={{background: '#333', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px'}}>🤝 匹配模式</span>}
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
                <span style={{ fontWeight: 'bold', marginRight: '10px', color: isUserB ? '#333' : '#FF6B6B' }}>{option.label}.</span>
                {option.text}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

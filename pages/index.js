import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');

  const handleStart = () => {
    router.push('/quiz');
  };

  const handleJoin = () => {
    if (inviteCode.length === 6) {
      router.push(`/quiz?invite_code=${inviteCode}`);
    } else {
      alert("请输入正确的 6 位邀请码");
    }
  };

  return (
    <div className="container">
      {/* 动态背景层 */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <main className="main-content">
        {/* 顶部 Hero 区域 */}
        <div className="hero-section">
          <div className="badge">✨ 基于 DeepSeek V3 深度心理模型</div>
          <h1 className="title">
            AI 恋爱契合度<br />
            <span className="gradient-text">深度合盘测试</span>
          </h1>
          <p className="subtitle">
            不仅仅是简单的问答。我们利用 AI 智能分析你们的潜意识、价值观与沟通模式，生成 3000 字深度情感报告。
          </p>
        </div>

        {/* 核心功能卡片 (代替原来的 Emoji 列表) */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-box purple">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <h3>AI 深度分析</h3>
            <p>超越表面性格，透视灵魂共鸣</p>
          </div>
          <div className="feature-card">
            <div className="icon-box pink">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3>五维雷达图</h3>
            <p>量化沟通、三观、激情等多维指标</p>
          </div>
          <div className="feature-card">
            <div className="icon-box orange">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3>隐私加密</h3>
            <p>双方数据仅彼此可见，严格保密</p>
          </div>
        </div>

        {/* 底部行动区 */}
        <div className="action-area">
          <button onClick={handleStart} className="cta-button">
            立即发起测试
            <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
          
          <div className="divider">
             <span>或者</span>
          </div>

          <div className="invite-box">
             <input 
               type="text" 
               placeholder="输入对方发来的邀请码" 
               value={inviteCode}
               onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
               maxLength={6}
             />
             <button onClick={handleJoin} disabled={!inviteCode}>进入</button>
          </div>
          
          <p className="footer-info">累计已有 12,340 对情侣完成测试</p>
        </div>
      </main>

      {/* CSS 样式 */}
      <style jsx>{`
        .container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #333;
        }

        /* 动态背景 blob */
        .background-blobs {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
        }
        .blob-1 {
          top: -10%;
          left: -10%;
          width: 500px;
          height: 500px;
          background: #FFDEE9;
          animation: float 10s infinite alternate;
        }
        .blob-2 {
          bottom: -10%;
          right: -10%;
          width: 400px;
          height: 400px;
          background: #B5FFFC;
          animation: float 8s infinite alternate-reverse;
        }

        .main-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Hero */
        .hero-section {
          text-align: center;
          margin-bottom: 50px;
        }
        .badge {
          display: inline-block;
          background: rgba(255, 107, 107, 0.1);
          color: #FF6B6B;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .title {
          font-size: 42px;
          line-height: 1.2;
          font-weight: 800;
          margin: 0 0 15px;
          letter-spacing: -1px;
        }
        .gradient-text {
          background: linear-gradient(90deg, #FF6B6B, #FF8E53);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          font-size: 16px;
          color: #666;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Features */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          width: 100%;
          margin-bottom: 50px;
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          padding: 20px 15px;
          border-radius: 20px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: transform 0.2s;
        }
        .feature-card:hover {
          transform: translateY(-5px);
        }
        .icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-box svg {
          width: 24px;
          height: 24px;
        }
        .purple { background: #F3E8FF; color: #9333EA; }
        .pink { background: #FFE4E6; color: #E11D48; }
        .orange { background: #FFEDD5; color: #EA580C; }
        
        .feature-card h3 {
          font-size: 16px;
          margin: 0 0 5px;
          color: #333;
        }
        .feature-card p {
          font-size: 12px;
          color: #888;
          margin: 0;
          line-height: 1.4;
        }

        /* Action Area */
        .action-area {
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        .cta-button {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 50px;
          background: linear-gradient(135deg, #111, #333);
          color: white;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          transition: all 0.2s;
        }
        .cta-button:hover {
          transform: scale(1.02);
          box-shadow: 0 15px 40px rgba(0,0,0,0.25);
        }
        .btn-icon {
          width: 20px;
          height: 20px;
        }

        .divider {
          display: flex;
          align-items: center;
          color: #bbb;
          font-size: 12px;
          margin: 25px 0;
        }
        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #eee;
        }
        .divider span { padding: 0 10px; }

        .invite-box {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .invite-box input {
          flex: 1;
          padding: 14px;
          border: 1px solid #eee;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          text-align: center;
          background: white;
          letter-spacing: 2px;
        }
        .invite-box input:focus {
          border-color: #FF6B6B;
        }
        .invite-box button {
          padding: 0 20px;
          background: white;
          border: 1px solid #eee;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          color: #333;

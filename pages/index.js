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
          <div className="badge">🔮 DeepSeek V3 驱动 · 心理学与算法的结晶</div>
          <h1 className="title">
            亲密关系的<br />
            <span className="gradient-text">底层逻辑解码</span>
          </h1>
          <p className="subtitle">
            拒绝模棱两可的娱乐测试。我们利用生成式 AI 构建你们的“关系模型”，从潜意识交互、依恋风格到沟通模式，进行像素级的深度解析。
          </p>
        </div>

        {/* 核心功能卡片 */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-box purple">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <h3>认知同频分析</h3>
            <p>洞察灵魂深处的共鸣与差异</p>
          </div>
          <div className="feature-card">
            <div className="icon-box pink">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3>五维关系动态</h3>
            <p>量化激情、承诺与亲密度的平衡</p>
          </div>
          <div className="feature-card">
            <div className="icon-box orange">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3>私有化加密</h3>
            <p>双向端对端加密，报告仅双人可见</p>
          </div>
        </div>

        {/* 底部行动区 */}
        <div className="action-area">
          <button onClick={handleStart} className="cta-button">
            开启深度探索
            <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
          
          <div className="divider">
             <span>建立联结</span>
          </div>

          <div className="invite-box">
             <input 
               type="text" 
               placeholder="输入伴侣的专属邀请码" 
               value={inviteCode}
               onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
               maxLength={6}
             />
             <button onClick={handleJoin} disabled={!inviteCode}>进入合盘</button>
          </div>
          
          <p className="footer-info">已为 54,000+ 对伴侣提供情感咨询支持</p>
        </div>
      </main>

      {/* CSS 样式 */}
      <style jsx>{`
        .container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
          padding: 80px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Hero */
        .hero-section {
          text-align: center;
          margin-bottom: 60px;
        }
        .badge {
          display: inline-block;
          background: rgba(255, 107, 107, 0.08);
          color: #FF6B6B;
          padding: 8px 18px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 25px;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255, 107, 107, 0.1);
        }
        .title {
          font-size: 48px;
          line-height: 1.15;
          font-weight: 800;
          margin: 0 0 20px;
          letter-spacing: -1.5px;
          color: #1a1a1a;
        }
        .gradient-text {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          font-size: 17px;
          color: #555;
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.7;
          font-weight: 400;
        }

        /* Features */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
          margin-bottom: 60px;
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 25px 20px;
          border-radius: 24px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 15px 50px -10px rgba(0,0,0,0.08);
        }
        .icon-box {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        .feature-card:hover .icon-box {
          transform: scale(1.1) rotate(5deg);
        }
        .icon-box svg {
          width: 26px;
          height: 26px;
        }
        .purple { background: #F3E8FF; color: #9333EA; }
        .pink { background: #FFE4E6; color: #E11D48; }
        .orange { background: #FFEDD5; color: #EA580C; }
        
        .feature-card h3 {
          font-size: 16px;
          margin: 0 0 8px;
          color: #222;
          font-weight: 700;
        }
        .feature-card p {
          font-size: 13px;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }

        /* Action Area */
        .action-area {
          width: 100%;
          max-width: 420px;
          text-align: center;
        }
        .cta-button {
          width: 100%;
          padding: 20px;
          border: none;
          border-radius: 50px;
          background: #111;
          color: white;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cta-button:hover {
          transform: translateY(-2px) scale(1.01);
          background: #000;
          box-shadow: 0 25px 50px -10px rgba(0,0,0,0.4);
        }
        .cta-button:active {
          transform: scale(0.98);
        }
        .btn-icon {
          width: 20px;
          height: 20px;
        }

        .divider {
          display: flex;
          align-items: center;
          color: #aaa;
          font-size: 13px;
          margin: 30px 0;
          font-weight: 500;
        }
        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e5e5e5;
        }
        .divider span { padding: 0 15px; }

        .invite-box {
          display: flex;
          gap: 12px;
          margin-bottom: 25px;
          background: white;
          padding: 6px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.03);
        }
        .invite-box input {
          flex: 1;
          padding: 12px 16px;
          border: none;
          font-size: 15px;
          outline: none;
          text-align: center;
          background: transparent;
          letter-spacing: 1px;
          color: #333;
        }
        .invite-box input::placeholder {
          color: #bbb;
          letter-spacing: 0;
        }
        .invite-box button {
          padding: 12px 24px;
          background: #f5f5f5;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          color: #666;
          transition: all 0.2s;
          font-size: 14px;
        }
        .invite-box button:not(:disabled):hover {
          background: #eee;
          color: #333;
        }
        .invite-box button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .footer-info {
          font-size: 13px;
          color: #999;
          margin-top: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .footer-info::before {
          content: "";
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #10B981;
          border-radius: 50%;
        }

        /* 手机适配 */
        @media (max-width: 600px) {
          .main-content {
            padding: 60px 20px;
          }
          .title {
            font-size: 36px;
          }
          .features-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .feature-card {
            display: flex;
            align-items: center;
            text-align: left;
            padding: 20px;
          }
          .icon-box {
            margin: 0 20px 0 0;
            width: 48px;
            height: 48px;
          }
          .feature-card:hover .icon-box {
             transform: none;
          }
          .feature-card h3 {
             margin-bottom: 4px;
          }
        }
        
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(20px, 20px) rotate(10deg); }
        }
      `}</style>
    </div>
  );
}

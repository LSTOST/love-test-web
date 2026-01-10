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
      {/* 背景光斑 */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <main className="main-content">
        {/* 顶部 Hero 区域 (手机端更加紧凑) */}
        <div className="hero-section">
          <div className="badge">🔮 DeepSeek V3 驱动</div>
          <h1 className="title">
            亲密关系的<br />
            <span className="gradient-text">底层逻辑解码</span>
          </h1>
          <p className="subtitle">
            拒绝模棱两可。AI 构建你们的“关系模型”，深度解析潜意识、价值观与沟通模式。
          </p>
        </div>

        {/* 核心功能卡片 (手机端改为横向滑动，极大节省空间) */}
        <div className="features-scroll-container">
          <div className="features-track">
            <div className="feature-card">
                <div className="icon-box purple">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <h3>认知同频</h3>
                <p>洞察灵魂深处的共鸣与差异</p>
            </div>
            <div className="feature-card">
                <div className="icon-box pink">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3>五维动态</h3>
                <p>量化沟通与激情的平衡</p>
            </div>
            <div className="feature-card">
                <div className="icon-box orange">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3>隐私加密</h3>
                <p>报告仅双人可见</p>
            </div>
          </div>
        </div>

        {/* 底部行动区 */}
        <div className="action-area">
          <button onClick={handleStart} className="cta-button">
            开启深度探索
            <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
          
          <div className="divider">
             <span>或 使用邀请码</span>
          </div>

          <div className="invite-box">
             <input 
               type="text" 
               placeholder="输入对方邀请码" 
               value={inviteCode}
               onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
               maxLength={6}
             />
             <button onClick={handleJoin} disabled={!inviteCode}>进入</button>
          </div>
          
          <p className="footer-info">已为 54,000+ 对伴侣提供支持</p>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #333;
        }

        /* 背景 */
        .background-blobs { position: absolute; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5; }
        .blob-1 { top: -10%; left: -10%; width: 500px; height: 500px; background: #FF9A9E; animation: float 10s infinite alternate; }
        .blob-2 { bottom: -10%; right: -10%; width: 400px; height: 400px; background: #A18CD1; animation: float 12s infinite alternate-reverse; }
        .blob-3 { top: 40%; left: 30%; width: 300px; height: 300px; background: #FBC2EB; opacity: 0.3; animation: float 15s infinite alternate; }

        .main-content {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 20px; /* 默认 Desktop padding */
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Hero */
        .hero-section { text-align: center; margin-bottom: 40px; }
        .badge { display: inline-block; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(5px); color: #FF6B6B; padding: 6px 14px; border-radius: 30px; font-size: 12px; font-weight: 600; margin-bottom: 15px; border: 1px solid rgba(255, 107, 107, 0.2); }
        .title { font-size: 48px; line-height: 1.15; font-weight: 800; margin: 0 0 15px; letter-spacing: -1px; color: #1a1a1a; }
        .gradient-text { background: linear-gradient(135deg, #FF6B6B 0%, #874da2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { font-size: 16px; color: #555; max-width: 560px; margin: 0 auto; line-height: 1.6; }

        /* 功能卡片容器 (Desktop Grid) */
        .features-track {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
          padding: 10px;
        }

        .features-scroll-container {
            width: 100%;
            margin-bottom: 50px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          padding: 25px 20px;
          border-radius: 20px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .feature-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.85); }
        
        .icon-box { width: 50px; height: 50px; border-radius: 16px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; }
        .icon-box svg { width: 26px; height: 26px; }
        .purple { background: #F3E8FF; color: #9333EA; }
        .pink { background: #FFE4E6; color: #E11D48; }
        .orange { background: #FFEDD5; color: #EA580C; }
        
        .feature-card h3 { font-size: 16px; margin: 0 0 8px; color: #222; font-weight: 700; }
        .feature-card p { font-size: 13px; color: #666; margin: 0; line-height: 1.5; }

        /* 行动区 */
        .action-area { width: 100%; max-width: 400px; text-align: center; }
        .cta-button { width: 100%; padding: 18px; border: none; border-radius: 50px; background: #111; color: white; font-size: 18px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 15px 30px -5px rgba(0,0,0,0.25); transition: all 0.3s; }
        .cta-button:active { transform: scale(0.98); }
        .btn-icon { width: 20px; height: 20px; }
        .divider { display: flex; align-items: center; color: #aaa; font-size: 12px; margin: 20px 0; font-weight: 500; }
        .divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: #e5e5e5; }
        .divider span { padding: 0 10px; }
        .invite-box { display: flex; gap: 8px; margin-bottom: 20px; background: white; padding: 5px; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.05); }
        .invite-box input { flex: 1; padding: 12px 10px; border: none; font-size: 14px; outline: none; text-align: center; background: transparent; letter-spacing: 1px; color: #333; }
        .invite-box button { padding: 0 20px; background: #f5f5f5; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; color: #666; font-size: 13px; }
        .footer-info { font-size: 12px; color: #999; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .footer-info::before { content: ""; display: inline-block; width: 6px; height: 6px; background: #10B981; border-radius: 50%; }

        /* 📱 Mobile Specific Optimizations */
        @media (max-width: 600px) {
          .main-content {
            padding: 40px 20px; /* 减少上下间距 */
          }

          /* Hero 区域极速瘦身 */
          .hero-section { margin-bottom: 25px; }
          .badge { margin-bottom: 10px; padding: 4px 12px; font-size: 11px; }
          .title { font-size: 32px; margin-bottom: 10px; }
          .subtitle { font-size: 14px; line-height: 1.5; padding: 0 10px; }

          /* 🔥 核心改变：把 Grid 变成横向滑块 (Carousel) */
          .features-scroll-container {
            width: 100vw; /* 占满屏幕宽度 */
            margin-left: -20px; /* 抵消 main 的 padding */
            margin-bottom: 30px;
            overflow: hidden; /* 防止出现滚动条 */
          }

          .features-track {
            display: flex; /* 变 Flex 布局 */
            grid-template-columns: none;
            gap: 12px;
            overflow-x: auto; /* 允许横向滚动 */
            padding: 10px 20px 20px; /* 左右留出呼吸空间 */
            scroll-snap-type: x mandatory; /* 滚动吸附 */
            -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
          }

          /* 隐藏滚动条 */
          .features-track::-webkit-scrollbar { display: none; }

          .feature-card {
            min-width: 140px; /* 固定最小宽度 */
            width: 140px;
            scroll-snap-align: center; /* 滚动对齐 */
            padding: 15px 10px;
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.75);
          }

          .icon-box { width: 40px; height: 40px; margin-bottom: 10px; }
          .feature-card h3 { font-size: 13px; }
          .feature-card p { font-size: 11px; line-height: 1.3; }

          /* 按钮区域 */
          .action-area { max-width: 100%; }
          .cta-button { padding: 16px; font-size: 16px; width: 100%; }
        }

        @keyframes float { 0% { transform: translate(0, 0) rotate(0deg); } 100% { transform: translate(20px, 20px) rotate(10deg); } }
      `}</style>
    </div>
  );
}

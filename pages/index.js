import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false); // 控制输入框是否显示
  const [inviteCode, setInviteCode] = useState('');

  const startTest = () => {
    router.push('/quiz');
  };

  const joinTest = () => {
    if (!inviteCode.trim()) {
        alert("请输入邀请码");
        return;
    }
    router.push(`/quiz?invite_code=${inviteCode.toUpperCase()}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF5F5 0%, #FFE3E3 100%)', fontFamily: 'sans-serif', padding: '20px' }}>
      
      {/* 标题区 */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ color: '#FF6B6B', fontSize: '3.5rem', marginBottom: '15px', fontWeight: '800', textShadow: '2px 2px 0px rgba(255,255,255,0.5)' }}>Love Test AI ❤️</h1>
        <p style={{ color: '#888', fontSize: '1.2rem', maxWidth: '500px', lineHeight: '1.6' }}>
          基于深度心理学与大模型的亲密关系透视镜。<br/>
          测测你们的灵魂究竟有多契合。
        </p>
      </div>

      {/* 核心按钮区 */}
      <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* User A 入口：超大按钮 */}
        <button 
          onClick={startTest}
          style={{ 
            width: '100%', 
            padding: '20px', 
            background: '#FF6B6B', 
            color: 'white', 
            border: 'none', 
            borderRadius: '50px', 
            fontSize: '20px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
            transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          创建我们的关系档案 🚀
        </button>

        {/* User B 入口：折叠的小链接 */}
        {!showInput ? (
            <div 
                onClick={() => setShowInput(true)}
                style={{ textAlign: 'center', color: '#999', fontSize: '14px', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }}
            >
                我有邀请码，手动输入 &gt;
            </div>
        ) : (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="输入邀请码"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      style={{ flex: 1, padding: '12px', border: '2px solid #fff', borderRadius: '12px', fontSize: '16px', textAlign: 'center', textTransform: 'uppercase', outline: 'none', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)' }}
                    />
                    <button 
                      onClick={joinTest}
                      style={{ padding: '0 20px', background: '#333', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      匹配
                    </button>
                </div>
            </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

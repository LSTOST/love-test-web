import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');

  const startTest = () => {
    // User A: 直接开始，没有邀请码
    router.push('/quiz');
  };

  const joinTest = () => {
    // User B: 带着邀请码去答题
    if (!inviteCode.trim()) {
        alert("请输入邀请码");
        return;
    }
    router.push(`/quiz?invite_code=${inviteCode.toUpperCase()}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF5F5', fontFamily: 'sans-serif', padding: '20px' }}>
      <h1 style={{ color: '#FF6B6B', fontSize: '3rem', marginBottom: '10px' }}>Love Test AI ❤️</h1>
      <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '50px', maxWidth: '500px', textAlign: 'center' }}>
        基于心理学 + 大模型的深度关系分析。测测你们的灵魂契合度。
      </p>

      {/* 左边：创建测试 (User A) */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', marginBottom: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🆕 发起测试</h3>
        <button 
          onClick={startTest}
          style={{ width: '100%', padding: '15px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          创建我们的关系档案
        </button>
      </div>

      {/* 右边：加入测试 (User B) */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🤝 我有邀请码</h3>
        <input 
          type="text" 
          placeholder="输入 6 位邀请码"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '2px solid #eee', borderRadius: '10px', marginBottom: '15px', fontSize: '16px', boxSizing: 'border-box', textAlign: 'center', textTransform: 'uppercase' }}
        />
        <button 
          onClick={joinTest}
          style={{ width: '100%', padding: '15px', background: '#333', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          开始匹配
        </button>
      </div>
    </div>
  );
}

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function ResultPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = 'https://love-test-web-production.up.railway.app'; 

  // 轮询逻辑 (保持不变)
  useEffect(() => {
    if (!id) return;
    const fetchData = () => {
        fetch(`${BACKEND_URL}/result/${id}`)
        .then(res => res.json())
        .then(resultData => {
            setData(resultData);
            setLoading(false);
        })
        .catch(err => console.error(err));
    };

    fetchData(); 
    const interval = setInterval(fetchData, 3000); 
    return () => clearInterval(interval); 
  }, [id]);

  // 模拟支付逻辑 (保持不变)
  const handlePay = async () => {
      const res = await fetch(`${BACKEND_URL}/mock_pay`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ test_id: parseInt(id) })
      });
      const resData = await res.json();
      if (resData.status === 'paid') {
          alert("支付成功！邀请码已生成");
          window.location.reload(); 
      }
  };

  // --- 新增：复制邀请功能的逻辑 ---
  const handleCopyInvite = () => {
      // 1. 获取当前网站的域名 (比如 https://xxx.vercel.app)
      const origin = window.location.origin;
      // 2. 拼接出 User B 的专属入口链接
      const inviteLink = `${origin}/quiz?invite_code=${data.invite_code}`;
      
      // 3. 准备一段好听的邀请文案
      const shareText = `亲爱的，我刚刚做了一个超准的「AI 恋爱契合度测试」💑 \n测完了只有一半报告，快来填一下你的那部分，看看咱们的默契度有多少！\n\n👉 点击链接直接开始：\n${inviteLink}`;

      // 4. 写入剪贴板
      navigator.clipboard.writeText(shareText).then(() => {
          alert("邀请链接已复制！\n快去微信粘贴发给你的 TA 吧~");
      });
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>加载中...</div>;
  if (!data) return <div>404 Not Found</div>;

  // --- 状态 1: 未支付 (保持不变) ---
  if (data.payment_status === 'unpaid') {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ color: '#ccc' }}>你的性格画像已生成</h1>
            <div style={{ filter: 'blur(8px)', userSelect: 'none', margin: '30px 0', opacity: 0.6 }}>
                <div style={{background: '#eee', height: '20px', marginBottom: '10px', width: '80%', margin:'10px auto'}}></div>
                <div style={{background: '#eee', height: '20px', marginBottom: '10px', width: '90%', margin:'10px auto'}}></div>
                <div style={{background: '#eee', height: '20px', marginBottom: '10px', width: '60%', margin:'10px auto'}}></div>
                <p>这里包含关于你的深度心理分析...</p>
            </div>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <h3>解锁完整合盘报告</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                    包含：双方性格雷达图 + AI 深度匹配分析 + 邀请伴侣免费测试
                </p>
                <button onClick={handlePay} style={{ width: '100%', padding: '16px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)' }}>
                    立即解锁 (¥19.9)
                </button>
            </div>
        </div>
      );
  }

  // --- 状态 2: 等待中 (界面大升级！) ---
  if (data.payment_status === 'paid' && !data.is_finished) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginTop: '30px', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '28px', color: '#333' }}>🔓 解锁成功！</h1>
                <p style={{ color: '#666', fontSize: '16px' }}>只差最后一步啦</p>
            </div>

            {/* 邀请卡片区域 */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '10px' }}>邀请对方完成测试，即可查看合盘报告</p>
                
                {/* 醒目的邀请码 */}
                <div style={{ background: '#F5F7FA', padding: '15px', borderRadius: '12px', marginBottom: '25px', letterSpacing: '2px' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>专属邀请码：</span>
                    <strong style={{ fontSize: '24px', color: '#333', marginLeft: '10px' }}>{data.invite_code}</strong>
                </div>

                {/* 核心行动按钮 */}
                <button 
                    onClick={handleCopyInvite}
                    style={{ 
                        width: '100%', 
                        padding: '16px', 
                        background: '#25D366', // 微信绿，暗示发给微信好友
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
                    }}
                >
                    <span>🚀 复制链接发给 TA</span>
                </button>
                
                <p style={{ fontSize: '12px', color: '#ccc', marginTop: '15px' }}>
                    对方点击链接即可直接开始，无需手动输入邀请码
                </p>
            </div>

            {/* 等待状态动画 */}
            <div style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div className="loading-dots" style={{ fontSize: '24px' }}>⏳</div>
                <p style={{ color: '#FF6B6B', fontSize: '14px', fontWeight: '500' }}>
                    正在等待对方提交... 
                </p>
                <p style={{ color: '#999', fontSize: '12px' }}>
                    (完成后本页面会自动刷新，请勿关闭)
                </p>
            </div>
        </div>
      );
  }

  // --- 状态 3: 大结局 (保持不变) ---
  const aiData = data.ai_result || {};
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#FF6B6B', fontSize: '32px', marginBottom: '10px' }}>💖 最终合盘报告</h1>
      <div style={{ padding: '25px', background: '#fff', borderRadius: '16px', textAlign: 'left', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', marginTop: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333', fontSize: '18px' }}>💡 深度情感分析</h3>
        <p style={{ lineHeight: '1.8', color: '#555', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{aiData.analysis}</p>
      </div>
      <div style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {(aiData.tags || []).map((tag, index) => (
            <span key={index} style={{ padding: '8px 20px', background: '#FF6B6B', color: 'white', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold' }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

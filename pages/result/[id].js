import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function ResultPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = 'https://love-test-web-production.up.railway.app'; // 你的真实地址

  // 轮询：每 3 秒刷新一次数据 (为了让 User A 在等待 User B 时能自动看到结果更新)
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

    fetchData(); // 立即执行一次
    const interval = setInterval(fetchData, 3000); // 之后每3秒查一次
    return () => clearInterval(interval); // 退出页面时停止
  }, [id]);

  // 模拟支付功能
  const handlePay = async () => {
      const res = await fetch(`${BACKEND_URL}/mock_pay`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ test_id: parseInt(id) })
      });
      const resData = await res.json();
      if (resData.status === 'paid') {
          alert("支付成功！邀请码已生成");
          window.location.reload(); // 刷新页面状态
      }
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>加载中...</div>;
  if (!data) return <div>404 Not Found</div>;

  // --- 状态 1: 未支付 (User A 刚测完) ---
  if (data.payment_status === 'unpaid') {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ color: '#ccc' }}>你的性格画像已生成</h1>
            
            {/* 模糊处理的占位符 */}
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
                <button 
                    onClick={handlePay}
                    style={{ width: '100%', padding: '16px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)' }}
                >
                    立即解锁 (¥19.9)
                </button>
            </div>
        </div>
      );
  }

  // --- 状态 2: 已支付，但 B 还没测 (等待中) ---
  if (data.payment_status === 'paid' && !data.is_finished) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ margin: '50px 0' }}>
                <h1 style={{ fontSize: '60px', margin: '0' }}>🔓</h1>
                <h2>解锁成功！</h2>
                <p style={{ color: '#666' }}>请将下方的邀请码发给你的另一半</p>
            </div>

            <div style={{ background: '#F0F4F8', padding: '30px', borderRadius: '16px', border: '2px dashed #333' }}>
                <span style={{ display: 'block', fontSize: '14px', color: '#999', marginBottom: '10px' }}>专属邀请码</span>
                <strong style={{ fontSize: '40px', letterSpacing: '5px', color: '#333' }}>{data.invite_code}</strong>
            </div>
            
            <p style={{ marginTop: '30px', color: '#FF6B6B', fontSize: '14px' }}>
                ⏳ 正在等待对方完成测试... (完成后页面会自动刷新)
            </p>
        </div>
      );
  }

  // --- 状态 3: 大结局 (双方都测完了) ---
  const aiData = data.ai_result || {};
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#FF6B6B', fontSize: '32px', marginBottom: '10px' }}>💖 最终合盘报告</h1>
      
      {/* AI 分析文案 */}
      <div style={{ padding: '25px', background: '#fff', borderRadius: '16px', textAlign: 'left', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', marginTop: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333', fontSize: '18px' }}>💡 深度情感分析</h3>
        <p style={{ lineHeight: '1.8', color: '#555', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
          {aiData.analysis || "分析内容加载中..."}
        </p>
      </div>

      {/* 标签 */}
      <div style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {(aiData.tags || []).map((tag, index) => (
            <span key={index} style={{ padding: '8px 20px', background: '#FF6B6B', color: 'white', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <p style={{ marginTop: '40px', color: '#ccc', fontSize: '12px' }}>
        (测试完成！这就是你们的商业闭环 MVP)
      </p>
    </div>
  );
}

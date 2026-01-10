import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function ResultPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const BACKEND_URL = 'https://love-test-web-production.up.railway.app'; 

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

  const handlePay = async () => {
      try {
          const res = await fetch(`${BACKEND_URL}/mock_pay?test_id=${id}`, { method: 'POST' });
          const resData = await res.json();
          if (resData.status === 'success') {
              alert("测试模式：支付成功！");
              window.location.reload();
          }
      } catch (error) {
          alert("请求失败");
      }
  };

  const handleCopyInvite = () => {
      const origin = window.location.origin;
      const inviteLink = `${origin}/quiz?invite_code=${data.invite_code}`;
      const shareText = `亲爱的，我刚刚做了一个超准的「AI 恋爱契合度测试」💑 \n快来填一下你的那部分，看看咱们的默契度有多少！\n\n👉 点击链接直接开始：\n${inviteLink}`;
      navigator.clipboard.writeText(shareText).then(() => alert("✅ 链接已复制，快去发给 TA 吧！"));
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center', color:'#888'}}>🔍 正在同步数据...</div>;
  if (!data) return <div>404 Not Found</div>;

  // 场景 1: 未支付
  if (data.payment_status === 'unpaid') {
      return (
        <div style={{padding: '40px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto'}}>
            <h1 style={{color:'#333'}}>🎨 基础画像已生成</h1>
            <div style={{filter:'blur(5px)', userSelect:'none', margin:'30px 0', opacity:0.6}}>
                <div style={{background:'#eee', height:'20px', width:'80%', margin:'10px auto'}}></div>
                <div style={{background:'#eee', height:'20px', width:'60%', margin:'10px auto'}}></div>
                <div style={{background:'#eee', height:'20px', width:'90%', margin:'10px auto'}}></div>
                <p>核心契合度：??%</p>
            </div>
            <button onClick={handlePay} style={{width: '100%', padding: '16px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)', cursor: 'pointer'}}>立即解锁完整合盘 (¥9.9)</button>
        </div>
      );
  }

  // 场景 2: 等待对方 (包含瘦身后的状态条)
  if (data.payment_status === 'paid' && !data.is_finished) {
      return (
        <div style={{
            minHeight: '100vh',
            background: '#f8f9fa',
            padding: '40px 20px', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{ marginTop: '20px', marginBottom: '30px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔓</div>
                <h1 style={{ fontSize: '24px', color: '#333', margin: '0 0 5px' }}>已成功解锁</h1>
                <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>只差最后一步，召唤你的另一半！</p>
            </div>

            <div className="invite-card">
                <div className="code-box">
                    <span className="code-label">专属邀请码</span>
                    <strong className="code-text">{data.invite_code}</strong>
                </div>
                <button onClick={handleCopyInvite} className="copy-btn">🚀 复制链接发给 TA</button>
                <p className="hint-text">对方点击链接即可直接开始，无需手动输入邀请码</p>
            </div>

            {/* 🔥 状态监控区 (瘦身版) */}
            <div className={`status-bar ${data.partner_name ? 'active' : ''}`}>
                {data.partner_name ? (
                    <>
                        <div className="avatar">
                             {data.partner_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="status-content">
                            <h3>{data.partner_name} 正在答题...</h3>
                            <p>请保持页面开启，结果即将生成</p>
                        </div>
                        <div className="live-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="sand-glass">⏳</div>
                        <div className="status-content">
                            <h3 style={{color: '#666'}}>等待对方加入...</h3>
                            <p>请确保已将邀请链接发给 TA</p>
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                .invite-card {
                    background: white;
                    width: 100%;
                    max-width: 400px;
                    padding: 30px 25px;
                    borderRadius: 24px;
                    boxShadow: 0 10px 40px rgba(0,0,0,0.06);
                    text-align: center;
                    margin-bottom: 25px;
                }
                .code-box { background: #F3F4F6; padding: 15px; border-radius: 16px; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; gap: 5px; border: 1px dashed #ccc; }
                .code-label { font-size: 12px; color: #888; letter-spacing: 1px; }
                .code-text { font-size: 28px; color: #333; letter-spacing: 2px; }
                .copy-btn { width: 100%; padding: 16px; background: #10B981; color: white; border: none; border-radius: 50px; fontSize: 16px; fontWeight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: transform 0.2s; }
                .copy-btn:active { transform: scale(0.98); }
                .hint-text { font-size: 13px; color: #999; margin-top: 15px; line-height: 1.5; }

                /* 🔥 状态条核心优化：变窄、变精致 */
                .status-bar {
                    width: 100%;
                    max-width: 400px;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    border-radius: 50px; /* 改成全圆角，视觉上更细长 */
                    padding: 10px 20px; /* ⬇️ 减小 Padding，让高度变矮 */
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid rgba(0,0,0,0.05); /* 极细的默认边框 */
                    transition: all 0.3s;
                }
                
                .status-bar.active {
                    background: #fff;
                    border: 1px solid #10B981; /* 保持1px，颜色控制粗细感 */
                    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
                    transform: scale(1.0); /* 取消放大，保持精致 */
                }

                .avatar {
                    width: 36px; height: 36px; /* ⬇️ 头像缩小 */
                    background: #10B981; color: white;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: bold; font-size: 16px;
                    flex-shrink: 0;
                }
                .sand-glass { font-size: 20px; width: 36px; text-align: center; }

                .status-content { flex: 1; text-align: left; }
                .status-content h3 { margin: 0 0 2px; font-size: 14px; color: #333; } /* 字体微调 */
                .status-content p { margin: 0; font-size: 12px; color: #999; transform: scale(0.95); transform-origin: left; }
                .active .status-content p { color: #10B981; }

                .live-indicator { display: flex; gap: 3px; align-items: flex-end; height: 12px; }
                .live-indicator span { width: 3px; background: #10B981; border-radius: 2px; animation: wave 1s infinite ease-in-out; }
                .live-indicator span:nth-child(1) { height: 60%; animation-delay: 0s; }
                .live-indicator span:nth-child(2) { height: 100%; animation-delay: 0.1s; }
                .live-indicator span:nth-child(3) { height: 80%; animation-delay: 0.2s; }
                @keyframes wave { 0%, 100% { height: 40%; } 50% { height: 100%; } }
            `}</style>
        </div>
      );
  }

  // 场景 3: 结果页
  const ai = data.ai_result || {};
  const radarData = ai.radar ? Object.keys(ai.radar).map(key => ({ subject: key, A: ai.radar[key], fullMark: 100 })) : [];
  const cardTitle = ai.title || "默契拍档";
  const cardText = ai.card_text || "你们是彼此最好的镜子。";
  const score = ai.score || 88;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', padding: '40px 20px 80px', color: 'white', textAlign: 'center', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px', boxShadow: '0 10px 20px rgba(255, 107, 107, 0.2)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, letterSpacing: '2px', marginBottom: '5px' }}>AI 契合度检测</div>
          <h1 style={{ fontSize: '64px', margin: '0', fontWeight: '800', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>{score}%</h1>
          <div style={{ fontSize: '20px', fontWeight: '600', opacity: 0.95, marginTop: '-10px' }}>{cardTitle}</div>
      </div>
      <div style={{ maxWidth: '600px', margin: '-60px auto 0', padding: '0 20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
              <h3 style={{ textAlign: 'center', color: '#333', margin: '0 0 10px', fontSize: '16px' }}>📊 多维关系模型</h3>
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#eee" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Match" dataKey="A" stroke="#FF6B6B" strokeWidth={3} fill="#FF6B6B" fillOpacity={0.4} />
                    </RadarChart>
                </ResponsiveContainer>
              </div>
          </div>
          <div style={{ background: 'linear-gradient(145deg, #2b2b2b, #1a1a1a)', borderRadius: '24px', padding: '35px 25px', color: '#FFE5B4', textAlign: 'center', marginBottom: '20px', boxShadow: '0 15px 40px rgba(0,0,0,0.3)', position: 'relative', border: '1px solid #444' }}>
              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '20px', letterSpacing: '3px' }}>RELATIONSHIP PERSONA</div>
              <h2 style={{ fontSize: '36px', margin: '0 0 20px', fontFamily: 'serif', background: 'linear-gradient(to right, #FFE5B4, #E1C699)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>"{cardTitle}"</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8', opacity: 0.9, fontStyle: 'italic', fontFamily: 'serif', margin: '0 auto', maxWidth: '80%' }}>{cardText}</p>
          </div>
          <div style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ borderLeft: '4px solid #FF6B6B', paddingLeft: '12px', color: '#333', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>💡 深度解读</h3>
              <div style={{ lineHeight: '1.8', color: '#555', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{ai.analysis}</div>
          </div>
          <button onClick={() => alert("请截图保存上方的黑金卡片哦！")} style={{ width: '100%', marginTop: '30px', padding: '18px', background: '#333', color: 'white', borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '40px' }}>📸 保存结果卡片</button>
      </div>
    </div>
  );
}

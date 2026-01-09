import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
// 引入图表库
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
    // 轮询：每3秒查一次，这样 User B 做完 User A 马上能看到
    const interval = setInterval(fetchData, 3000); 
    return () => clearInterval(interval);
  }, [id]);

  const handlePay = async () => {
      const res = await fetch(`${BACKEND_URL}/mock_pay`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ test_id: parseInt(id) })
      });
      const resData = await res.json();
      if (resData.status === 'paid') window.location.reload();
  };

  // --- 找回丢失的功能：一键复制邀请链接 ---
  const handleCopyInvite = () => {
      const origin = window.location.origin;
      const inviteLink = `${origin}/quiz?invite_code=${data.invite_code}`;
      const shareText = `亲爱的，我刚刚做了一个超准的「AI 恋爱契合度测试」💑 \n快来填一下你的那部分，看看咱们的默契度有多少！\n\n👉 点击链接直接开始：\n${inviteLink}`;

      navigator.clipboard.writeText(shareText).then(() => {
          alert("✅ 邀请链接已复制！\n快去微信粘贴发给你的 TA 吧~");
      });
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center', color:'#888'}}>🔍 正在绘制关系图谱...</div>;
  if (!data) return <div>404 Not Found</div>;

  // ==========================================
  // 场景 1: 未支付 (模糊处理)
  // ==========================================
  if (data.payment_status === 'unpaid') {
      return (
        <div style={{padding:'40px 20px', textAlign:'center', fontFamily:'sans-serif', maxWidth:'600px', margin:'0 auto'}}>
            <h1 style={{color:'#333'}}>🎨 基础画像已生成</h1>
            <div style={{filter:'blur(5px)', userSelect:'none', margin:'30px 0', opacity:0.6}}>
                <div style={{background:'#eee', height:'20px', width:'80%', margin:'10px auto'}}></div>
                <div style={{background:'#eee', height:'20px', width:'60%', margin:'10px auto'}}></div>
                <div style={{background:'#eee', height:'20px', width:'90%', margin:'10px auto'}}></div>
                <p>核心契合度：??%</p>
            </div>
            <button onClick={handlePay} style={{width:'100%', padding:'16px', background:'#FF6B6B', color:'white', border:'none', borderRadius:'50px', fontSize:'18px', fontWeight:'bold', boxShadow:'0 4px 15px rgba(255, 107, 107, 0.4)', cursor:'pointer'}}>
                立即解锁完整合盘 (¥19.9)
            </button>
        </div>
      );
  }

  // ==========================================
  // 场景 2: 等待对方 (这里恢复了漂亮的一键复制页！)
  // ==========================================
  if (data.payment_status === 'paid' && !data.is_finished) {
      return (
        <div style={{padding:'40px 20px', textAlign:'center', fontFamily:'sans-serif', maxWidth:'600px', margin:'0 auto'}}>
            <div style={{ marginTop: '30px', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '28px', color: '#333' }}>🔓 解锁成功！</h1>
                <p style={{ color: '#666', fontSize: '16px' }}>只差最后一步啦</p>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '10px' }}>邀请对方完成测试，即可查看合盘报告</p>
                
                <div style={{ background: '#F5F7FA', padding: '15px', borderRadius: '12px', marginBottom: '25px', letterSpacing: '2px' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>专属邀请码：</span>
                    <strong style={{ fontSize: '24px', color: '#333', marginLeft: '10px' }}>{data.invite_code}</strong>
                </div>

                {/* 恢复了绿色大按钮 */}
                <button 
                    onClick={handleCopyInvite}
                    style={{ 
                        width: '100%', 
                        padding: '16px', 
                        background: '#25D366', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer', 
                        boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
                    }}
                >
                    🚀 复制链接发给 TA
                </button>
                
                <p style={{ fontSize: '12px', color: '#ccc', marginTop: '15px' }}>
                    对方点击链接即可直接开始，无需手动输入邀请码
                </p>
            </div>

            <div style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '24px' }}>⏳</div>
                <p style={{ color: '#FF6B6B', fontSize: '14px', fontWeight: '500' }}>
                    正在等待对方提交... 
                </p>
            </div>
        </div>
      );
  }

  // ==========================================
  // 场景 3: 最终大结局 (保留雷达图和黑金卡片)
  // ==========================================
  const ai = data.ai_result || {};
  
  // 处理雷达图数据
  const radarData = ai.radar ? Object.keys(ai.radar).map(key => ({
      subject: key,
      A: ai.radar[key],
      fullMark: 100
  })) : [
      { subject: '沟通', A: 80, fullMark: 100 },
      { subject: '三观', A: 85, fullMark: 100 },
      { subject: '激情', A: 90, fullMark: 100 },
      { subject: '安全感', A: 75, fullMark: 100 },
      { subject: '成长', A: 88, fullMark: 100 },
  ];

  const cardTitle = ai.title || "默契拍档";
  const cardText = ai.card_text || "你们是彼此最好的镜子，照见最真实的自己。";
  const score = ai.score || 88;

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', paddingBottom:'40px', fontFamily:'sans

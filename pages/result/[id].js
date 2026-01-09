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
  // 场景 1: 未支付
  // ==========================================
  if (data.payment_status === 'unpaid') {
      return (
        <div style={{
            padding: '40px 20px', 
            textAlign: 'center', 
            fontFamily: 'sans-serif', 
            maxWidth: '600px', 
            margin: '0 auto'
        }}>
            <h1 style={{color:'#333'}}>🎨 基础画像已生成</h1>
            <div style={{filter:'blur(5px)', userSelect:'none', margin:'30px 0', opacity:0.6}}>
                <div style={{background:'#eee', height:'20px', width:'80%', margin:'10px auto'}}></div>
                <div style={{background:'#eee', height:'20px', width:'60%', margin:'10px auto'}}></div>
                <div style={{background:'#eee', height:'20px', width:'90%', margin:'10px auto'}}></div>
                <p>核心契合度：??%</p>
            </div>
            <button onClick={handlePay} style={{
                width: '100%', 
                padding: '16px', 
                background: '#FF6B6B', 
                color: 'white', 
                border: 'none', 
                borderRadius: '50px', 
                fontSize: '18px', 
                fontWeight: 'bold', 
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)', 
                cursor: 'pointer'
            }}>
                立即解锁完整合盘 (¥19.9)
            </button>
        </div>
      );
  }

  // ==========================================
  // 场景 2: 等待对方
  // ==========================================
  if (data.payment_status === 'paid' && !data.is_finished) {
      return (
        <div style={{
            padding: '40px 20px', 
            textAlign: 'center', 
            fontFamily: 'sans-serif', 
            maxWidth: '600px', 
            margin: '0 auto'
        }}>
            <div style={{ marginTop: '30px', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '28px', color: '#333' }}>🔓 解锁成功！</h1>
                <p style={{ color: '#666', fontSize: '16px' }}>只差最后一步啦</p>
            </div>

            <div style={{ 
                background: 'white', 
                padding: '30px', 
                borderRadius: '20px', 
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)', 
                border: '1px solid #f0f0f0' 
            }}>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '10px' }}>邀请对方完成测试，即可查看合盘报告</p>
                
                <div style={{ 
                    background: '#F5F7FA', 
                    padding: '15px', 
                    borderRadius: '12px', 
                    marginBottom: '25px', 
                    letterSpacing: '2px' 
                }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>专属邀请码：</span>
                    <strong style={{ fontSize: '24px', color: '#333', marginLeft: '10px' }}>{data.invite_code}</strong>
                </div>

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
  // 场景 3: 最终大结局
  // ==========================================
  const ai = data.ai_result || {};
  
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
    <div style={{ 
        minHeight: '100vh', 
        background: '#f8f9fa', 
        paddingBottom: '40px', 
        fontFamily: 'sans-serif' 
    }}>
      
      {/* 顶部超大分数 */}
      <div style={{ 
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', 
          padding: '40px 20px 80px', 
          color: 'white', 
          textAlign: 'center', 
          borderBottomLeftRadius: '30px', 
          borderBottomRightRadius: '30px', 
          boxShadow: '0 10px 20px rgba(255, 107, 107, 0.2)' 
      }}>
          <div style={{ fontSize: '14px', opacity: 0.9, letterSpacing: '2px', marginBottom: '5px' }}>AI 契合度检测</div>
          <h1 style={{ fontSize: '64px', margin: '0', fontWeight: '800', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>{score}%</h1>
          <div style={{ fontSize: '20px', fontWeight: '600', opacity: 0.95, marginTop: '-10px' }}>{cardTitle}</div>
      </div>

      <div style={{ maxWidth: '600px', margin: '-60px auto 0', padding: '0 20px' }}>
          
          {/* 1. 雷达图 */}
          <div style={{ 
              background: 'white', 
              borderRadius: '24px', 
              padding: '20px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)', 
              marginBottom: '20px' 
          }}>
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

          {/* 2. 黑金卡片 */}
          <div style={{ 
              background: 'linear-gradient(145deg, #2b2b2b, #1a1a1a)', 
              borderRadius: '24px', 
              padding: '35px 25px', 
              color: '#FFE5B4', 
              textAlign: 'center', 
              marginBottom: '20px', 
              boxShadow: '0 15px 40px rgba(0,0,0,0.3)', 
              position: 'relative', 
              border: '1px solid #444' 
          }}>
              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '20px', letterSpacing: '3px' }}>RELATIONSHIP PERSONA</div>
              <h2 style={{ 
                  fontSize: '36px', 
                  margin: '0 0 20px', 
                  fontFamily: 'serif', 
                  background: 'linear-gradient(to right, #FFE5B4, #E1C699)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent' 
              }}>
                  "{cardTitle}"
              </h2>
              <p style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.8', 
                  opacity: 0.9, 
                  fontStyle: 'italic', 
                  fontFamily: 'serif', 
                  margin: '0 auto', 
                  maxWidth: '80%' 
              }}>
                  {cardText}
              </p>
              <div style={{ marginTop: '30px', width: '40px', height: '1px', background: '#FFE5B4', margin: '30px auto', opacity: 0.3 }}></div>
              <div style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '1px' }}>LOVE TEST AI GENERATED</div>
          </div>

          {/* 3. 深度分析 */}
          <div style={{ 
              background: 'white', 
              borderRadius: '24px', 
              padding: '25px', 
              boxShadow: '0 5px 20px rgba(0,0,0,0.03)' 
          }}>
              <h3 style={{ borderLeft: '4px solid #FF6B6B', paddingLeft: '12px', color: '#333', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>💡 深度解读</h3>
              <div style={{ lineHeight: '1.8', color: '#555', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                  {ai.analysis}
              </div>
          </div>

          <button 
             onClick={() => alert("请截图保存上方的黑金卡片哦！")}
             style={{ 
                 width: '100%', 
                 marginTop: '30px', 
                 padding: '18px', 
                 background: '#333', 
                 color: 'white', 
                 borderRadius: '16px', 
                 border: 'none', 
                 fontSize: '16px', 
                 fontWeight: 'bold', 
                 cursor: 'pointer', 
                 marginBottom: '40px' 
             }}>
              📸 保存结果卡片
          </button>
      </div>
    </div>
  );
}

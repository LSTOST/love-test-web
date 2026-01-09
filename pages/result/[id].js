import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function ResultPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = '[https://love-test-web-production.up.railway.app](https://love-test-web-production.up.railway.app)'; 

  useEffect(() => {
    if (!id) return;
    const fetchData = () => {
        fetch(`${BACKEND_URL}/result/${id}`)
        .then(res => res.json())
        .then(resultData => {
            // 如果 AI 还没生成完（还是 teaser），就不要停止 loading 或者显示等待状态
            // 这里简单处理：只要拿到数据就显示
            setData(resultData);
            setLoading(false);
        })
        .catch(err => console.error(err));
    };
    fetchData();
    // 简单的轮询，防止一开始数据没出来
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // 模拟支付
  const handlePay = async () => {
      const res = await fetch(`${BACKEND_URL}/mock_pay`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ test_id: parseInt(id) })
      });
      const resData = await res.json();
      if (resData.status === 'paid') window.location.reload();
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center', color:'#888'}}>🔍 正在绘制关系图谱...</div>;
  if (!data) return <div>404 Not Found</div>;

  // --- 场景 1 & 2: 未支付或等待中 (简单复用之前的逻辑) ---
  if (data.payment_status === 'unpaid') {
      return <div style={{padding:'40px', textAlign:'center'}}>
          <h1>画像生成中...</h1>
          <button onClick={handlePay} style={{padding:'15px 30px', background:'#FF6B6B', color:'white', border:'none', borderRadius:'30px', fontSize:'18px'}}>解锁报告 (¥19.9)</button>
      </div>;
  }
  if (data.payment_status === 'paid' && !data.is_finished) {
      return <div style={{padding:'40px', textAlign:'center'}}>
          <h1>🔓 已解锁</h1>
          <p>邀请码: <strong style={{fontSize:'24px'}}>{data.invite_code}</strong></p>
          <p>等待对方完成中...</p>
      </div>;
  }

  // --- 场景 3: 最终可视化报告 (核心修改) ---
  const ai = data.ai_result || {};
  // 构造雷达图数据
  const radarData = ai.radar ? Object.keys(ai.radar).map(key => ({
      subject: key,
      A: ai.radar[key],
      fullMark: 100
  })) : [];

  return (
    <div style={{ minHeight:'100vh', background:'#f5f7fa', paddingBottom:'40px', fontFamily:'sans-serif' }}>
      
      {/* 顶部卡片：关系定义 */}
      <div style={{ background:'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', padding:'40px 20px 80px', color:'white', textAlign:'center', borderBottomLeftRadius:'30px', borderBottomRightRadius:'30px' }}>
          <div style={{ fontSize:'14px', opacity:0.8, letterSpacing:'2px', marginBottom:'10px' }}>AI 契合度检测</div>
          <h1 style={{ fontSize:'48px', margin:'0', fontWeight:'800' }}>{ai.score || 88}%</h1>
          <div style={{ fontSize:'24px', marginTop:'10px', fontWeight:'bold' }}>{ai.title || "灵魂伴侣"}</div>
      </div>

      {/* 核心内容区：向上浮动，盖住背景 */}
      <div style={{ maxWidth:'600px', margin:'-60px auto 0', padding:'0 20px' }}>
          
          {/* 卡片 1: 雷达图 */}
          <div style={{ background:'white', borderRadius:'20px', padding:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.08)', marginBottom:'20px' }}>
              <h3 style={{ textAlign:'center', color:'#333', margin:'0 0 20px' }}>📊 多维关系模型</h3>
              <div style={{ width:'100%', height:'250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#eee" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Match" dataKey="A" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.4} />
                    </RadarChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* 卡片 2: 社交分享卡 (关系人格) */}
          <div style={{ background:'url([https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=600&auto=format&fit=crop](https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=600&auto=format&fit=crop))', backgroundSize:'cover', borderRadius:'20px', padding:'30px', color:'white', textAlign:'center', marginBottom:'20px', position:'relative', overflow:'hidden' }}>
              {/* 遮罩层，让文字更清晰 */}
              <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.4)', zIndex:0 }}></div>
              <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ fontSize:'12px', opacity:0.8, marginBottom:'10px' }}>RELATIONSHIP PERSONA</div>
                  <h2 style={{ fontSize:'28px', margin:'0 0 15px', fontFamily:'serif', fontStyle:'italic' }}>
                      "{ai.title}"
                  </h2>
                  <p style={{ fontSize:'16px', lineHeight:'1.6', opacity:0.95 }}>
                      {ai.card_text || "宇宙很大，能在同一个频率共振，本身就是一种奇迹。"}
                  </p>
                  <div style={{ marginTop:'20px', fontSize:'12px', opacity:0.7 }}>Love Test AI Generated</div>
              </div>
          </div>

          {/* 卡片 3: 深度分析 (文本) */}
          <div style={{ background:'white', borderRadius:'20px', padding:'25px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ borderLeft:'4px solid #FF6B6B', paddingLeft:'10px', color:'#333' }}>💡 深度解读</h3>
              <p style={{ lineHeight:'1.8', color:'#555', fontSize:'15px', whiteSpace:'pre-wrap' }}>
                  {ai.analysis}
              </p>
          </div>

          {/* 底部按钮 */}
          <button style={{ width:'100%', marginTop:'30px', padding:'15px', background:'#333', color:'white', borderRadius:'15px', border:'none', fontSize:'16px', fontWeight:'bold' }}>
              保存并分享结果 📸
          </button>
          <p style={{ textAlign:'center', color:'#ccc', fontSize:'12px', marginTop:'10px' }}>(请手动截图保存上方卡片)</p>

      </div>
    </div>
  );
}

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
// 引入图表库 (你已经在 package.json 里加了 recharts，这次肯定能跑通)
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function ResultPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 替换成你的真实后端地址
  const BACKEND_URL = 'https://love-test-web-production.up.railway.app'; 

  useEffect(() => {
    if (!id) return;
    const fetchData = () => {
        fetch(`${BACKEND_URL}/result/${id}`)
        .then(res => res.json())
        .then(resultData => {
            console.log("前端收到的数据:", resultData); // 调试用
            setData(resultData);
            setLoading(false);
        })
        .catch(err => console.error(err));
    };
    fetchData();
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

  if (loading) return <div style={{padding:'50px', textAlign:'center', color:'#888'}}>🔍 正在绘制关系图谱...</div>;
  if (!data) return <div>404 Not Found</div>;

  // --- 场景 1: 未支付 ---
  if (data.payment_status === 'unpaid') {
      return (
        <div style={{padding:'40px 20px', textAlign:'center', fontFamily:'sans-serif', maxWidth:'600px', margin:'0 auto'}}>
            <h1 style={{color:'#333'}}>🎨 基础画像已生成</h1>
            <div style={{filter:'blur(5px)', userSelect:'none', margin:'30px 0', opacity:0.6}}>
                <p>这里包含关于你们的深度心理分析...</p>
                <p>核心契合度：??%</p>
                <p>潜在风险预警...</p>
            </div>
            <button onClick={handlePay} style={{width:'100%', padding:'16px', background:'#FF6B6B', color:'white', border:'none', borderRadius:'50px', fontSize:'18px', fontWeight:'bold', boxShadow:'0 4px 15px rgba(255, 107, 107, 0.4)'}}>
                立即解锁完整合盘 (¥19.9)
            </button>
        </div>
      );
  }

  // --- 场景 2: 等待对方 ---
  if (data.payment_status === 'paid' && !data.is_finished) {
      return (
        <div style={{padding:'40px 20px', textAlign:'center', fontFamily:'sans-serif'}}>
            <h1>🔓 已解锁</h1>
            <div style={{background:'#F5F7FA', padding:'20px', borderRadius:'12px', margin:'20px 0'}}>
                <p style={{color:'#666', marginBottom:'5px'}}>专属邀请码</p>
                <strong style={{fontSize:'32px', letterSpacing:'2px'}}>{data.invite_code}</strong>
            </div>
            <p>⏳ 正在等待另一半完成测试...</p>
        </div>
      );
  }

  // --- 场景 3: 最终大结局 (数据可视化) ---
  const ai = data.ai_result || {};
  
  // 1. 处理雷达图数据 (防止后端没返回 radar 字段导致报错)
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

  // 2. 处理卡片文案
  const cardTitle = ai.title || "默契拍档";
  const cardText = ai.card_text || "你们是彼此最好的镜子，照见最真实的自己。";
  const score = ai.score || 88;

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', paddingBottom:'40px', fontFamily:'sans-serif' }}>
      
      {/* 顶部超大分数 */}
      <div style={{ background:'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', padding:'40px 20px 80px', color:'white', textAlign:'center', borderBottomLeftRadius:'30px', borderBottomRightRadius:'30px', boxShadow: '0 10px 20px rgba(255, 107, 107, 0.2)' }}>
          <div style={{ fontSize:'14px', opacity:0.9, letterSpacing:'2px', marginBottom:'5px' }}>AI 契合度检测</div>
          <h1 style={{ fontSize:'64px', margin:'0', fontWeight:'800', textShadow:'2px 2px 4px rgba(0,0,0,0.1)' }}>{score}%</h1>
          <div style={{ fontSize:'20px', fontWeight:'600', opacity: 0.95, marginTop:'-10px' }}>{cardTitle}</div>
      </div>

      {/* 内容卡片区 (向上浮动) */}
      <div style={{ maxWidth:'600px', margin:'-60px auto 0', padding:'0 20px' }}>
          
          {/* 1. 雷达图卡片 */}
          <div style={{ background:'white', borderRadius:'24px', padding:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.05)', marginBottom:'20px' }}>
              <h3 style={{ textAlign:'center', color:'#333', margin:'0 0 10px', fontSize:'16px' }}>📊 多维关系模型</h3>
              <div style={{ width:'100%', height:'280px' }}>
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

          {/* 2. 朋友圈分享卡 (黑金风格) */}
          <div style={{ background:'linear-gradient(145deg, #2b2b2b, #1a1a1a)', borderRadius:'24px', padding:'35px 25px', color:'#FFE5B4', textAlign:'center', marginBottom:'20px', boxShadow:'0 15px 40px rgba(0,0,0,0.3)', position:'relative', border:'1px solid #444' }}>
              <div style={{ fontSize:'12px', opacity:0.6, marginBottom:'20px', letterSpacing:'3px' }}>RELATIONSHIP PERSONA</div>
              <h2 style={{ fontSize:'36px', margin:'0 0 20px', fontFamily:'serif', background: 'linear-gradient(to right, #FFE5B4, #E1C699)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  "{cardTitle}"
              </h2>
              <p style={{ fontSize:'16px', lineHeight:'1.8', opacity:0.9, fontStyle:'italic', fontFamily:'serif', margin: '0 auto', maxWidth: '80%' }}>
                  {cardText}
              </p>
              <div style={{ marginTop:'30px', width: '40px', height: '1px', background: '#FFE5B4', margin: '30px auto', opacity: 0.3 }}></div>
              <div style={{ fontSize:'10px', opacity:0.4, letterSpacing:'1px' }}>LOVE TEST AI GENERATED</div>
          </div>

          {/* 3. 深度文字分析 */}
          <div style={{ background:'white', borderRadius:'24px', padding:'25px', boxShadow:'0 5px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ borderLeft:'4px solid #FF6B6B', paddingLeft:'12px', color:'#333', fontSize:'18px', marginBottom:'20px', fontWeight:'bold' }}>💡 深度解读</h3>
              {/* 这里用 dangerouslySetInnerHTML 或者简单的样式来保留换行 */}
              <div style={{ lineHeight:'1.8', color:'#555', fontSize:'15px', whiteSpace:'pre-wrap' }}>
                  {ai.analysis}
              </div>
          </div>

          {/* 底部按钮 */}
          <button 
             onClick={() => alert("请截图保存上方的黑金卡片哦！")}
             style={{ width:'100%', marginTop:'30px', padding:'18px', background:'#333', color:'white', borderRadius:'16px', border:'none', fontSize:'16px', fontWeight:'bold', cursor:'pointer', marginBottom: '40px' }}>
              📸 保存结果卡片
          </button>

      </div>
    </div>
  );
}

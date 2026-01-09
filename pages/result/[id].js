import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function ResultPage() {
  const router = useRouter();
  const { id } = router.query; // 从网址里拿到 id (比如 15)
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 一进来就去后端查数据
  useEffect(() => {
    if (!id) return;

    // 这里换成你的真实后端地址
    const BACKEND_URL = 'https://love-test-web-production.up.railway.app';

    fetch(`${BACKEND_URL}/result/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("找不到这个结果");
        return res.json();
      })
      .then(resultData => {
        setData(resultData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // 1. 加载中...
  if (loading) return (
    <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>
      正在读取你们的爱情档案...❤️
    </div>
  );

  // 2. 没找到数据 (比如 ID 输错了)
  if (!data) return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>404</h1>
      <p>哎呀，这份报告好像迷路了。</p>
      <button onClick={() => router.push('/')} style={{ marginTop: '20px', padding: '10px 20px' }}>
        重新测试
      </button>
    </div>
  );

  // 3. 数据解析 (兼容新旧格式)
  const aiData = data.ai_result || {};
  const analysisText = aiData.analysis || (Array.isArray(aiData) ? aiData[0] : "分析加载中...");
  const tagsList = aiData.tags || (Array.isArray(aiData) ? aiData.slice(1) : []);

  // 4. 显示漂亮的报告 (和之前一样的样式)
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#FF6B6B', fontSize: '32px', marginBottom: '10px' }}>测评报告</h1>
      
      {/* 这是一个分享按钮 */}
      <button 
        onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("链接已复制！快发给你的 TA 吧~");
        }}
        style={{ 
            marginBottom: '30px', 
            padding: '8px 16px', 
            background: '#eee', 
            border: 'none', 
            borderRadius: '20px', 
            cursor: 'pointer',
            fontSize: '14px'
        }}
      >
        🔗 点击复制分享链接
      </button>

      <div style={{ 
          padding: '25px', 
          background: '#fff', 
          borderRadius: '16px', 
          textAlign: 'left',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          border: '1px solid #f0f0f0'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333', fontSize: '18px' }}>💡 情感分析报告</h3>
        <p style={{ lineHeight: '1.8', color: '#555', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
          {analysisText}
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '16px', color: '#999', marginBottom: '15px' }}>✨ 关系关键词</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {tagsList.length > 0 ? (
            tagsList.map((tag, index) => (
              <span key={index} style={{ 
                  padding: '8px 20px', 
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', 
                  color: 'white', 
                  borderRadius: '50px', 
                  fontSize: '14px',
                  fontWeight: 'bold'
              }}>
                {tag}
              </span>
            ))
          ) : (
            <span style={{ color: '#ccc' }}>暂无标签</span>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '40px' }}>
         <button onClick={() => router.push('/')} style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
           我也要测
         </button>
      </div>
    </div>
  );
}

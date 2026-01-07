export default function Home() {
  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      padding: "40px",
      maxWidth: "600px",
      margin: "0 auto"
    }}>
      <h1>💗 情侣关系测评</h1>

      <p>
        用 15 分钟，了解你们真实的相处模式。
      </p>

      <p>
        基于心理学量表与 AI 分析，生成一份专业但不说教的关系诊断报告。
      </p>

      <button
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer"
        }}
        onClick={() => alert("测试功能即将上线")}
      >
        开始测评
      </button>
    </div>
  );
}

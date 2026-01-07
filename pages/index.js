// 1. 引入 Next.js 的 Link 组件（必须）
import Link from 'next/link'; 
// 引入 Head 组件是为了设置网页标题（推荐）
import Head from 'next/head';

export default function Home() {
  return (
    <div style={styles.container}>
      <Head>
        <title>AI 情侣关系测评</title>
        <meta name="description" content="基于心理学与AI的情侣关系深度分析" />
      </Head>

      <main style={styles.main}>
        {/* 标题 */}
        <h1 style={styles.title}>
          💗 情侣关系测评
        </h1>

        {/* 介绍文案 */}
        <p style={styles.description}>
          基于 OCEAN 大五人格与婚恋心理学量表。<br/>
          通过 15 分钟趣味问答，生成你们专属的 AI 深度诊断报告。
        </p>

        <div style={styles.card}>
          <p>
            ✨ 探索你们的<strong>价值观契合度</strong><br/>
            ✨ 识别潜在的<strong>沟通冲突点</strong><br/>
            ✨ 获取 AI 定制的<strong>相处建议</strong>
          </p>
        </div>

        {/* 2. 核心修改点：用 Link 包裹住按钮 */}
        {/* href="/quiz" 对应的是 pages/quiz.js 文件 */}
        <Link href="/quiz">
          <button style={styles.button}>
            开始测评 →
          </button>
        </Link>
      </main>
    </div>
  );
}

// 下面是简单的样式（你可以保留你原来的，或者用这个美化版）
const styles = {
  container: {
    minHeight: '100vh',
    padding: '0 2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  main: {
    padding: '4rem 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    lineHeight: 1.15,
    fontSize: '3.5rem',
    color: '#333',
    marginBottom: '20px',
  },
  description: {
    lineHeight: 1.5,
    fontSize: '1.2rem',
    color: '#666',
    maxWidth: '600px',
    marginBottom: '30px',
  },
  card: {
    padding: '1.5rem',
    textAlign: 'left',
    color: 'inherit',
    textDecoration: 'none',
    border: '1px solid #eaeaea',
    borderRadius: '10px',
    transition: 'color 0.15s ease, border-color 0.15s ease',
    maxWidth: '500px',
    marginBottom: '40px',
    backgroundColor: '#fff',
    lineHeight: '1.8',
  },
  button: {
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#FF6B6B', // 比较温馨的情侣色
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px 0 rgba(255, 107, 107, 0.39)',
    transition: 'background 0.2s',
  }
};

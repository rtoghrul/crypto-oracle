import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const SECTIONS = [
  { id: 'news',     label: '📡 Crypto News',     icon: '📡', desc: 'Real-time crypto news intelligence' },
  { id: 'whales',   label: '🐋 Whale Tracker',   icon: '🐋', desc: 'Large holder movement tracking' },
  { id: 'politics', label: '🏛️ Politics & Macro', icon: '🏛️', desc: 'Regulatory & macro environment' },
  { id: 'trending', label: '🔥 New Tokens',       icon: '🔥', desc: 'Emerging tokens with potential' },
  { id: 'signal',   label: '⚡ AI Signal',         icon: '⚡', desc: 'AI-synthesized investment signal' },
];

const PLACEHOLDERS = {
  news:     'e.g. Bitcoin ETF, Ethereum upgrade, Solana...',
  whales:   'e.g. BTC, ETH, SOL — or leave blank for all',
  politics: 'e.g. SEC regulation, China crypto ban...',
  trending: 'e.g. DeFi, AI tokens, Layer 2...',
  signal:   'e.g. BTC, ETH — or leave blank for market',
};

const QUICK_SCANS = [
  { label: '⚡ BTC Signal',   section: 'signal',   query: 'Bitcoin' },
  { label: '🐋 ETH Whales',   section: 'whales',   query: 'Ethereum' },
  { label: '🤖 AI Tokens',    section: 'trending', query: 'AI' },
  { label: '🏛️ SEC News',     section: 'politics', query: 'SEC crypto regulation 2025' },
  { label: '🔥 DeFi Buzz',    section: 'trending', query: 'DeFi' },
  { label: '📡 Market News',  section: 'news',     query: '' },
];

function TypingText({ text }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    idx.current = 0;
    if (!text) return;
    const timer = setInterval(() => {
      if (idx.current < text.length) {
        idx.current++;
        setDisplayed(text.slice(0, idx.current));
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, 8);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayed}{!done && <span className="cursor">▋</span>}</span>;
}

function renderLine(line, i) {
  if (line.startsWith('## '))
    return <h3 key={i} style={{ color: '#00ffc8', fontFamily: "'Space Mono', monospace", marginTop: 18, marginBottom: 6, fontSize: 14, letterSpacing: 1 }}>{line.slice(3)}</h3>;
  if (line.startsWith('# '))
    return <h2 key={i} style={{ color: '#fff', fontFamily: "'Orbitron', monospace", marginTop: 20, marginBottom: 8, fontSize: 16 }}>{line.slice(2)}</h2>;
  if (/\*\*(.+)\*\*/.test(line)) {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return <p key={i} style={{ margin: '5px 0', color: '#c8d8f0', lineHeight: 1.8 }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#ffe566' }}>{p}</strong> : p)}</p>;
  }
  if (line.startsWith('- ') || line.startsWith('• '))
    return <li key={i} style={{ marginLeft: 20, marginBottom: 5, color: '#a8c0e0', lineHeight: 1.7 }}>{line.slice(2)}</li>;
  if (line.includes('SIGNAL:') && line.includes('BULLISH'))
    return <div key={i} style={{ background: 'rgba(0,255,100,0.1)', border: '1px solid #00ff6480', borderRadius: 8, padding: '10px 16px', color: '#00ff80', fontWeight: 700, margin: '14px 0', fontFamily: "'Space Mono', monospace", fontSize: 13 }}>🟢 {line}</div>;
  if (line.includes('SIGNAL:') && line.includes('BEARISH'))
    return <div key={i} style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid #ff3c3c80', borderRadius: 8, padding: '10px 16px', color: '#ff6060', fontWeight: 700, margin: '14px 0', fontFamily: "'Space Mono', monospace", fontSize: 13 }}>🔴 {line}</div>;
  if (line.includes('SIGNAL:') && line.includes('NEUTRAL'))
    return <div key={i} style={{ background: 'rgba(255,200,0,0.09)', border: '1px solid #ffc80080', borderRadius: 8, padding: '10px 16px', color: '#ffe566', fontWeight: 700, margin: '14px 0', fontFamily: "'Space Mono', monospace", fontSize: 13 }}>🟡 {line}</div>;
  if (line.trim() === '') return <br key={i} />;
  return <p key={i} style={{ margin: '4px 0', color: '#b0c8e8', lineHeight: 1.8, fontSize: 13.5 }}>{line}</p>;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState('signal');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [particles, setParticles] = useState([]);
  const resultRef = useRef(null);

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 22 + 14,
      delay: Math.random() * 10,
      color: ['#00ffc8', '#0088ff', '#7040ff'][i % 3],
    })));
  }, []);

  const runAnalysis = async (sec, qry) => {
    const section = sec || activeSection;
    const q = qry !== undefined ? qry : query;
    setActiveSection(section);
    setQuery(q);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data.result);
      setHistory(h => [{ section, query: q, result: data.result, ts: new Date() }, ...h.slice(0, 8)]);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentSection = SECTIONS.find(s => s.id === activeSection);

  return (
    <>
      <Head>
        <title>Crypto Oracle — AI Intelligence Dashboard</title>
        <meta name="description" content="Real-time crypto intelligence: news, whale tracking, political analysis, trending tokens and AI investment signals." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#050d1a', position: 'relative', overflow: 'hidden' }}>

        {/* Particle field */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'fixed', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: p.color, opacity: 0.2, pointerEvents: 'none',
            animation: `float ${p.speed}s ease-in-out ${p.delay}s infinite`,
          }} />
        ))}

        {/* Scanline */}
        <div style={{
          position: 'fixed', left: 0, right: 0, height: 6, pointerEvents: 'none', zIndex: 1,
          background: 'linear-gradient(transparent, rgba(0,255,200,0.05), transparent)',
          animation: 'scanline 7s linear infinite',
        }} />

        {/* Grid */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(0,255,200,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.022) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 920, margin: '0 auto', padding: '0 20px 80px' }}>

          {/* ── HEADER ── */}
          <header className="header-anim" style={{ textAlign: 'center', padding: '52px 0 38px' }}>
            <div style={{ fontSize: 10, letterSpacing: 7, color: '#00ffc850', marginBottom: 16, textTransform: 'uppercase' }}>
              ◈ ALPHA INTELLIGENCE SYSTEM v2.0 ◈
            </div>
            <h1 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 'clamp(30px, 7vw, 56px)',
              fontWeight: 900, letterSpacing: 3, lineHeight: 1.1,
              background: 'linear-gradient(135deg, #00ffc8 0%, #0088ff 55%, #7040ff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px #00ffc830)',
            }}>
              CRYPTO ORACLE
            </h1>
            <p style={{ color: '#304555', fontSize: 11, marginTop: 12, letterSpacing: 3 }}>
              NEWS  ·  WHALES  ·  POLITICS  ·  SIGNALS
            </p>

            {/* Live indicator */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, background: 'rgba(0,255,200,0.06)', border: '1px solid #00ffc820', borderRadius: 20, padding: '5px 14px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00ffc8', animation: 'pulse 1.5s ease-in-out infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 10, color: '#00ffc880', letterSpacing: 2 }}>LIVE INTELLIGENCE FEED</span>
            </div>
          </header>

          {/* ── NAV TABS ── */}
          <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
            {SECTIONS.map(s => (
              <button key={s.id} className={`nav-btn${activeSection === s.id ? ' active' : ''}`}
                onClick={() => { setActiveSection(s.id); setResult(null); setError(null); }}>
                {s.label}
              </button>
            ))}
          </nav>

          {/* ── MAIN CARD ── */}
          <main style={{
            background: 'rgba(4,12,26,0.92)', border: '1px solid #0c1e35',
            borderRadius: 18, padding: '30px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 0 80px rgba(0,255,200,0.05), 0 30px 80px rgba(0,0,0,0.6)',
            animation: 'glow 5s ease-in-out infinite',
          }}>

            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #0d1e30' }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>{currentSection?.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, color: '#00ffc8', letterSpacing: 2.5 }}>
                  {activeSection.toUpperCase()} ANALYSIS MODULE
                </div>
                <div style={{ fontSize: 11, color: '#2a3f55', marginTop: 3 }}>{currentSection?.desc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#1e3248', letterSpacing: 1 }}>POWERED BY</div>
                <div style={{ fontSize: 11, color: '#00ffc860', fontFamily: "'Space Mono', monospace" }}>Claude AI + Web Search</div>
              </div>
            </div>

            {/* Input row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <input
                className="input-box"
                placeholder={PLACEHOLDERS[activeSection]}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && runAnalysis()}
              />
              <button className="analyze-btn" onClick={() => runAnalysis()} disabled={loading} style={{ minWidth: 140 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span style={{ width: 11, height: 11, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                    SCANNING
                  </span>
                ) : 'ANALYZE →'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid #ff3c3c40', borderRadius: 10, padding: '14px 18px', color: '#ff7070', fontSize: 13, marginBottom: 20 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 22 }}>
                  {[0,1,2,3,4,5].map(i => (
                    <div key={i} style={{
                      width: 4, height: 30, background: `hsl(${165 + i * 12}, 100%, 60%)`,
                      borderRadius: 2, animation: `pulse 0.9s ease-in-out ${i * 0.13}s infinite`,
                    }} />
                  ))}
                </div>
                <div style={{ color: '#00ffc870', fontSize: 12, letterSpacing: 4 }}>SCANNING INTELLIGENCE FEEDS</div>
                <div style={{ color: '#1e3248', fontSize: 11, marginTop: 8 }}>Searching web · Analyzing data · Generating signal</div>
              </div>
            )}

            {/* Result */}
            {result && !loading && (
              <div ref={resultRef} className="result-block" style={{
                background: 'rgba(0,8,22,0.85)', border: '1px solid #0c1e32',
                borderRadius: 12, padding: '22px 24px',
                maxHeight: 540, overflowY: 'auto',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #0c1e32' }}>
                  <span style={{ fontSize: 10, color: '#1e3248', letterSpacing: 3 }}>◈ ORACLE OUTPUT</span>
                  <span style={{ fontSize: 10, color: '#1e3248' }}>{new Date().toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.85 }}>
                  <TypingText text={result} />
                </div>
              </div>
            )}

            {/* Empty state */}
            {!result && !loading && !error && (
              <div style={{ textAlign: 'center', padding: '44px 0 20px' }}>
                <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 16 }}>{currentSection?.icon}</div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 4, color: '#162535' }}>
                  AWAITING ANALYSIS REQUEST
                </div>
                <div style={{ fontSize: 11, color: '#0f1e2d', marginTop: 10 }}>
                  Type a token name or click ANALYZE for a broad scan
                </div>
              </div>
            )}
          </main>

          {/* ── QUICK SCANS ── */}
          <section style={{ marginTop: 22 }}>
            <div style={{ fontSize: 10, color: '#1e3248', letterSpacing: 4, marginBottom: 12, textAlign: 'center' }}>
              ◈ QUICK SCANS
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {QUICK_SCANS.map(btn => (
                <button key={btn.label} className="quick-btn"
                  onClick={() => runAnalysis(btn.section, btn.query)}
                  disabled={loading}>
                  {btn.label}
                </button>
              ))}
            </div>
          </section>

          {/* ── HISTORY ── */}
          {history.length > 0 && (
            <section style={{ marginTop: 36 }}>
              <div style={{ fontSize: 10, color: '#1e3248', letterSpacing: 4, marginBottom: 12 }}>◈ ANALYSIS HISTORY</div>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className="hist-item"
                  onClick={() => { setActiveSection(h.section); setQuery(h.query); setResult(h.result); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#00ffc870' }}>
                      {SECTIONS.find(s => s.id === h.section)?.icon} {h.section.toUpperCase()}{h.query ? ` → ${h.query}` : ''}
                    </span>
                    <span style={{ fontSize: 10, color: '#1e3248' }}>{h.ts.toLocaleTimeString()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#1e3248', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.result.slice(0, 90)}...
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* ── HOW IT WORKS ── */}
          <section style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { icon: '🔍', title: 'Live Web Search', desc: 'Scans real-time news, forums, and on-chain data' },
              { icon: '🧠', title: 'AI Analysis', desc: 'Claude synthesizes signals into clear insights' },
              { icon: '🐋', title: 'Whale Intel', desc: 'Tracks large wallet movements and accumulation' },
              { icon: '⚡', title: 'Clear Signals', desc: 'BULLISH / BEARISH / NEUTRAL verdict every time' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'rgba(4,12,26,0.7)', border: '1px solid #0c1e30', borderRadius: 12, padding: '18px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#00ffc890', marginBottom: 6, letterSpacing: 1 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: '#2a3f55', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </section>

          {/* Footer */}
          <footer style={{ textAlign: 'center', marginTop: 52, color: '#152030', fontSize: 10, letterSpacing: 2, lineHeight: 1.8 }}>
            <div>⚠️ NOT FINANCIAL ADVICE · FOR INFORMATIONAL PURPOSES ONLY</div>
            <div style={{ marginTop: 4 }}>ALWAYS DO YOUR OWN RESEARCH · CRYPTO INVOLVES SIGNIFICANT RISK</div>
          </footer>
        </div>
      </div>
    </>
  );
}

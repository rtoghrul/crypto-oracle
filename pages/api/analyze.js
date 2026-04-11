export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { section, query } = req.body;

  if (!section) {
    return res.status(400).json({ error: 'Missing section' });
  }

  const SYSTEM_PROMPT = `You are CryptoOracle, an elite crypto intelligence analyst with deep knowledge of:
- Crypto market news, trends, and real-time developments
- Whale wallet movements and large holder behavior patterns
- Political/regulatory climate affecting crypto (SEC, Fed, global policy)
- New and emerging token projects with community buzz and on-chain data
- Technical and fundamental analysis

Structure your responses clearly with headers and bullet points. Use emojis sparingly.
Always conclude with a SIGNAL line: SIGNAL: BULLISH / BEARISH / NEUTRAL and a one-sentence reason.`;

  const PROMPTS = {
    news: `Search for and analyze the latest crypto news${query ? ` about ${query}` : ' across the market'}. Cover: major market moves, protocol updates, exchange developments, and overall sentiment. Give a structured news brief with 5-7 key takeaways.`,
    whales: `Analyze recent whale activity${query ? ` for ${query}` : ' across Bitcoin, Ethereum, and top altcoins'}. Cover: large wallet movements, exchange inflows/outflows, accumulation vs distribution patterns, and what current whale behavior signals for upcoming price action.`,
    politics: `Analyze the current political and macroeconomic landscape affecting crypto${query ? ` regarding ${query}` : ''}. Cover: latest regulatory news (SEC, CFTC, global govts), Fed policy and interest rate impact, government adoption or crackdowns, and geopolitical crypto factors. Assess investment implications.`,
    trending: `Identify the most discussed new and emerging crypto tokens right now${query ? ` in the ${query} niche` : ''}. Search for projects gaining social traction, GitHub commits, community growth. Rank top 5 emerging tokens with: what they do, why they're trending, risk level, and early investment thesis.`,
    signal: `Provide a comprehensive crypto investment signal${query ? ` for ${query}` : ' for the current market'}. Search for the latest data, then synthesize: current news, whale movements, political climate, and emerging opportunities. Give 3 specific actionable recommendations ranked by confidence. Be direct about risk levels.`,
  };

  const prompt = PROMPTS[section];
  if (!prompt) return res.status(400).json({ error: 'Invalid section' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'interleaved-thinking-2025-05-14'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    const text = data.content
      .map(block => block.type === 'text' ? block.text : '')
      .filter(Boolean)
      .join('\n');

    return res.status(200).json({ result: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

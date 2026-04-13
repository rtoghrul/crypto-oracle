const SYSTEM_PROMPT = `You are CryptoOracle, a crypto intelligence analyst.

You help users with:
- Crypto market news and narratives
- Whale wallet behavior and large-holder patterns
- Political and regulatory developments affecting crypto
- Emerging token categories and risk framing
- Actionable but cautious market summaries

Rules:
- Be clear, structured, and concise.
- Use markdown-style headers and bullets.
- Never claim you performed live web search.
- If the user asks for highly current facts, say the answer may be stale.
- Always conclude with: SIGNAL: BULLISH / BEARISH / NEUTRAL and one short reason.`;

const PROMPTS = {
  news: (query) => `Give a structured crypto market news brief${query ? ` focused on ${query}` : ''}. Cover the main themes, why they matter, upside risks, downside risks, and likely market impact.`,
  whales: (query) => `Analyze whale behavior${query ? ` for ${query}` : ' across major crypto assets'}. Explain what accumulation, distribution, exchange flows, and wallet behavior could imply.`,
  politics: (query) => `Analyze the political and macro backdrop affecting crypto${query ? ` with emphasis on ${query}` : ''}. Cover regulation, central-bank policy, enforcement posture, and likely investment implications.`,
  trending: (query) => `Identify promising emerging crypto narratives and tokens${query ? ` in the ${query} niche` : ''}. Rank 5 ideas, explain why they are interesting, and include key risks.`,
  signal: (query) => `Provide a crypto market signal${query ? ` for ${query}` : ''}. Synthesize sentiment, narratives, risk factors, and opportunity setup. End with 3 practical takeaways ranked by confidence.`,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { section, query } = req.body || {};

  if (!section) {
    return res.status(400).json({ error: 'Missing section' });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({
      error: 'OPENROUTER_API_KEY is missing in Vercel Environment Variables.',
    });
  }

  const promptBuilder = PROMPTS[section];
  if (!promptBuilder) {
    return res.status(400).json({ error: 'Invalid section' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://crypto-oracle-nu.vercel.app',
        'X-Title': 'Crypto Oracle',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-26b-a4b-it:free',
        temperature: 0.5,
        max_tokens: 1400,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: promptBuilder(query) },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenRouter API error',
      });
    }

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(502).json({ error: 'No response returned from OpenRouter.' });
    }

    return res.status(200).json({ result: text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
  if (!OPENROUTER_KEY) return res.status(500).json({ error: 'OpenRouter key not configured' });

  try {
    const { brand, brief, platform, duration } = req.body;
    if (!brief) return res.status(400).json({ error: 'Brief is required' });

    const sysPrompt = `You are a top UGC script writer. Write a ${duration || '30s'} ${platform || 'TikTok'} script for ${brand || 'the brand'}. Brief: ${brief}. Format: [Hook] [Main content] [CTA]. Keep it natural, authentic, not salesy. Include timing cues.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ugcgo.ai'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [{ role: 'user', content: sysPrompt }],
        max_tokens: 600
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

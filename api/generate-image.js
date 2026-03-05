const ALLOWED = ['https://ugcgo.ai', 'https://www.ugcgo.ai', 'https://ugcgo-delta.vercel.app'];

const rateLimit = {};
function checkRateLimit(ip, limit) {
  const now = Date.now();
  if (!rateLimit[ip] || now - rateLimit[ip].start > 60000) {
    rateLimit[ip] = { count: 1, start: now };
    return true;
  }
  rateLimit[ip].count++;
  return rateLimit[ip].count <= limit;
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED.includes(origin) ? origin : ALLOWED[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const hasAuth = req.headers.authorization && req.headers.authorization.startsWith('Bearer ');
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const limit = hasAuth ? 20 : 5;
  if (!checkRateLimit(ip, limit)) {
    return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  }

  const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
  if (!OPENROUTER_KEY) return res.status(500).json({ error: 'OpenRouter key not configured' });

  const { prompt, model } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const MODELS = [
    model || 'google/gemini-3.1-flash-image-preview',
    'google/gemini-3-pro-image-preview'
  ];

  let lastError = null;
  for (const m of MODELS) {
    try {
      const isImageModel = m.includes('flash-image');
      const body = {
        model: m,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      };
      if (isImageModel) body.modalities = ['image', 'text'];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ugcgo.ai'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (response.status === 200 && data.choices && data.choices.length > 0) {
        return res.status(200).json(data);
      }
      lastError = data.error?.message || (data.choices?.length === 0 ? 'Empty response' : `HTTP ${response.status}`);
    } catch (e) {
      lastError = e.message;
    }
  }
  return res.status(500).json({ error: 'All models failed: ' + lastError });
};

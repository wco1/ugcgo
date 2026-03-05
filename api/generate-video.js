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
  const limit = hasAuth ? 10 : 3;
  if (!checkRateLimit(ip, limit)) {
    return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  }

  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) return res.status(500).json({ error: 'FAL key not configured' });

  try {
    const { action, endpoint, prompt, duration, aspect_ratio, request_id } = req.body;
    const falEndpoint = endpoint || 'fal-ai/kling-video/v3/pro/text-to-video';
    const headers = { 'Authorization': `Key ${FAL_KEY}`, 'Content-Type': 'application/json' };

    if (action === 'submit') {
      const body = { prompt, duration: duration || '5' };
      if (aspect_ratio) body.aspect_ratio = aspect_ratio;
      const r = await fetch(`https://queue.fal.run/${falEndpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const data = await r.json();
      return res.status(200).json(data);
    }

    if (action === 'status') {
      const r = await fetch(`https://queue.fal.run/${falEndpoint}/requests/${request_id}/status`, { headers });
      const data = await r.json();
      return res.status(200).json(data);
    }

    if (action === 'result') {
      const r = await fetch(`https://queue.fal.run/${falEndpoint}/requests/${request_id}`, { headers });
      const data = await r.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'action must be submit, status, or result' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

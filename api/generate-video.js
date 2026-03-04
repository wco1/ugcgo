module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) return res.status(500).json({ error: 'FAL key not configured' });

  try {
    const { action, endpoint, prompt, duration, request_id } = req.body;
    const falEndpoint = endpoint || 'fal-ai/kling-video/v1.6/standard/text-to-video';
    const headers = { 'Authorization': `Key ${FAL_KEY}`, 'Content-Type': 'application/json' };

    if (action === 'submit') {
      const r = await fetch(`https://queue.fal.run/${falEndpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, duration: duration || '5' })
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

export default async function handler(req, res) {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'q missing' });
    const key = process.env.ABSTRACT_API_KEY;
    if (!key) return res.status(500).json({ error: 'API key not set on server' });
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${key}&email=${encodeURIComponent(q)}`;
    const r = await fetch(url);
    if (!r.ok) {
      const t = await r.text();
      return res.status(r.status).send(t);
    }
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3002;
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

app.use(express.json());

const lookupIp = async (ip) => {
  const cached = cache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
  const data = await res.json();

  if (data.status === 'fail') {
    throw new Error(data.message || 'IP lookup failed');
  }

  const result = {
    ip: data.query,
    country: data.country,
    countryCode: data.countryCode,
    region: data.regionName,
    regionCode: data.region,
    city: data.city,
    zip: data.zip,
    latitude: data.lat,
    longitude: data.lon,
    timezone: data.timezone,
    isp: data.isp,
    organization: data.org,
    as: data.as,
  };

  cache.set(ip, { data: result, timestamp: Date.now() });
  return result;
};

app.get('/', (_req, res) => {
  res.json({
    name: 'IP Geolocation API',
    version: '1.0.0',
    endpoints: {
      'GET /lookup?ip=8.8.8.8': 'Look up geolocation for an IP address',
      'GET /me': 'Look up your own IP geolocation',
      'POST /lookup/batch': 'Look up multiple IPs (body: { ips: [...] }, max 25)',
      'GET /health': 'Health check',
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/lookup', async (req, res) => {
  const { ip } = req.query;
  if (!ip) {
    return res.status(400).json({ error: 'Missing required query parameter: ip' });
  }
  try {
    const result = await lookupIp(ip);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed', message: err.message });
  }
});

app.get('/me', async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.ip;
  try {
    const result = await lookupIp(ip);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed', message: err.message });
  }
});

app.post('/lookup/batch', async (req, res) => {
  const { ips } = req.body;
  if (!ips || !Array.isArray(ips)) {
    return res.status(400).json({ error: 'Request body must contain an "ips" array' });
  }
  if (ips.length > 25) {
    return res.status(400).json({ error: 'Maximum 25 IPs per batch request' });
  }
  try {
    const results = await Promise.allSettled(ips.map(lookupIp));
    const formatted = results.map((r, i) => r.status === 'fulfilled'
      ? r.value
      : { ip: ips[i], error: r.reason?.message || 'Lookup failed' });
    res.json({ total: formatted.length, results: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Batch lookup failed', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`IP Geolocation API running on port ${PORT}`);
});

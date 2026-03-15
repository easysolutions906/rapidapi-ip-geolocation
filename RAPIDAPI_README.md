**Spotlight:** Get country, city, coordinates, timezone, and ISP data for any IP address. Supports IPv4, IPv6, self-lookup, and batch queries.

Get country, region, city, coordinates, timezone, and ISP information for any IPv4 or IPv6 address. Includes a self-lookup endpoint and batch operations.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lookup` | Get geolocation data for an IP address |
| GET | `/me` | Get geolocation for the caller's IP |
| POST | `/lookup/batch` | Look up multiple IPs at once (max 25) |

### Quick Start

```javascript
const response = await fetch('https://ip-geolocation-pro.p.rapidapi.com/lookup?ip=8.8.8.8', {
  headers: {
    'x-rapidapi-key': 'YOUR_API_KEY',
    'x-rapidapi-host': 'ip-geolocation-pro.p.rapidapi.com'
  }
});
const data = await response.json();
// { ip: "8.8.8.8", country: "United States", city: "Ashburn", latitude: 39.03, longitude: -77.5, timezone: "America/New_York", isp: "Google LLC" }
```

### Rate Limits

| Plan | Requests/month | Rate |
|------|---------------|------|
| Basic (Pay Per Use) | Unlimited | 10/min |
| Pro ($9.99/mo) | 5,000 | 50/min |
| Ultra ($29.99/mo) | 25,000 | 200/min |
| Mega ($99.99/mo) | 100,000 | 500/min |

// Simple CORS test endpoint
// Use this to verify CORS is working: https://sunterra-solar-energy.vercel.app/api/test-cors

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.Origin;
  const allowedOrigins = [
    "https://sunterrasolarenergy.com",
    "https://www.sunterrasolarenergy.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  let allowOrigin = origin || "*";
  if (origin && allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  }

  // Handle OPTIONS
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
    if (allowOrigin !== "*") {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.statusCode = 200;
    res.end();
    return;
  }

  // Set CORS for actual requests
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (allowOrigin !== "*") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      success: true,
      message: "CORS test successful",
      origin: origin,
      allowedOrigin: allowOrigin,
      method: req.method,
    })
  );
}

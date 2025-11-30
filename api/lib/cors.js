// CORS utility for Vercel serverless functions
// Ensures proper CORS headers are set for all responses

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://sunterrasolarenergy.com",
    "https://www.sunterrasolarenergy.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  // Set Access-Control-Allow-Origin
  // Note: Cannot use * with credentials, so we check for specific origins
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (origin) {
    // If origin is provided but not in allowed list, still allow it for development
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // No origin header (e.g., same-origin request or server-to-server)
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  // Set other CORS headers
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS,PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
}

export function handleOptions(req, res) {
  setCorsHeaders(req, res);
  res.statusCode = 200;
  res.end();
  return; // Explicit return to ensure function exits
}

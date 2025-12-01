// CORS utility for Vercel serverless functions
// Ensures proper CORS headers are set for all responses

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin || req.headers.Origin;
  const allowedOrigins = [
    "https://sunterrasolarenergy.com",
    "https://www.sunterrasolarenergy.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  // Set Access-Control-Allow-Origin
  // Always allow the requesting origin if it's in our list or matches
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else {
      // For development or other origins, still allow but be more permissive
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
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
    "Content-Type,Authorization,X-Requested-With,Accept,Origin"
  );
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
}

export function handleOptions(req, res) {
  // Set CORS headers explicitly
  const origin = req.headers.origin || req.headers.Origin;
  const allowedOrigins = [
    "https://sunterrasolarenergy.com",
    "https://www.sunterrasolarenergy.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  // Determine the origin to allow
  let allowOrigin = "*";
  let allowCredentials = false;

  if (origin) {
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      allowOrigin = origin;
      allowCredentials = true;
    } else {
      // For development or other origins, still allow but be more permissive
      allowOrigin = origin;
      allowCredentials = true;
    }
  }

  // Set headers individually (Vercel serverless functions work better with this)
  // CRITICAL: These must be set before any response is sent
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS,PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,X-Requested-With,Accept,Origin"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  // Only add credentials header if we're using a specific origin (not *)
  if (allowCredentials && allowOrigin !== "*") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Return 204 No Content for OPTIONS (standard for preflight)
  // Vercel serverless functions use statusCode property
  res.statusCode = 204;
  res.end();
  return;
}

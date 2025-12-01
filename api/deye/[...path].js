// Deye Cloud API Proxy
// Handles all Deye Cloud API requests with proper CORS headers

import { DeyeCloudApi } from "../lib/deye-cloud-api.js";

// Helper function to set CORS headers
function setCorsHeaders(req, res) {
  const origin = req.headers.origin || req.headers.Origin;
  const allowedOrigins = [
    "https://sunterrasolarenergy.com",
    "https://www.sunterrasolarenergy.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  // Determine allowed origin
  let allowOrigin = "*";
  if (origin && allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  } else if (origin) {
    // For development, allow the requesting origin
    allowOrigin = origin;
  }

  // Set CORS headers
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

  if (allowOrigin !== "*") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
}

function sendJson(res, statusCode, data) {
  // Ensure Content-Type is set
  if (!res.getHeader("Content-Type")) {
    res.setHeader("Content-Type", "application/json");
  }
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Log for debugging - check Vercel logs
  console.log(`[DEYE API] ${req.method} ${req.url}`, {
    origin: req.headers.origin,
    method: req.method,
    path: req.query.path,
  });

  // CRITICAL: Handle OPTIONS preflight requests FIRST
  // This MUST return before any other code runs
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin || req.headers.Origin;
    console.log(`[DEYE API] OPTIONS preflight request`, {
      origin,
      url: req.url,
      "access-control-request-method":
        req.headers["access-control-request-method"],
      "access-control-request-headers":
        req.headers["access-control-request-headers"],
    });

    // Set CORS headers for preflight
    setCorsHeaders(req, res);

    // Return 204 No Content for OPTIONS (standard for preflight)
    res.statusCode = 204;
    res.end();
    return;
  }

  // Set CORS headers for all other requests
  setCorsHeaders(req, res);

  try {
    // Only allow GET and POST
    if (req.method !== "GET" && req.method !== "POST") {
      return sendJson(res, 405, {
        success: false,
        message: "Method not allowed",
      });
    }

    // Get the path from the request
    // Vercel dynamic routes: [...path] gives us req.query.path as an array
    const pathArray = req.query.path || [];
    const path = "/" + pathArray.join("/");

    // Initialize Deye Cloud API
    const deyeApi = new DeyeCloudApi();

    // Parse request body if needed (Vercel may already parse it)
    let requestBody = req.body;
    if (typeof requestBody === "string" && requestBody.length > 0) {
      try {
        requestBody = JSON.parse(requestBody);
      } catch (e) {
        // If parsing fails, use as-is (might be empty string)
        requestBody = requestBody || {};
      }
    }

    // Make request to Deye Cloud API (it handles authentication internally)
    const deyeResponse = await deyeApi.request(path, {
      method: req.method,
      body: requestBody,
    });

    // Return the response
    return sendJson(res, 200, deyeResponse);
  } catch (error) {
    return sendJson(res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

// Deye Cloud API Proxy
// Handles all Deye Cloud API requests with proper CORS headers

import { DeyeCloudApi } from "../lib/deye-cloud-api.js";
import { setCorsHeaders, handleOptions } from "../lib/cors.js";

function sendJson(res, statusCode, data) {
  // Ensure Content-Type is set (CORS headers already set by setCorsHeaders)
  if (!res.getHeader("Content-Type")) {
    res.setHeader("Content-Type", "application/json");
  }
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Get origin from request - handle both lowercase and capitalized headers
  const origin =
    req.headers.origin ||
    req.headers.Origin ||
    req.headers["origin"] ||
    req.headers["Origin"];
  const allowedOrigins = [
    "https://sunterrasolarenergy.com",
    "https://www.sunterrasolarenergy.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  // Determine allowed origin - always use the requesting origin if present
  let allowOrigin = origin || "*";
  if (origin && allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  }

  // CRITICAL: Handle OPTIONS preflight requests FIRST
  // This MUST return before any other code runs
  if (req.method === "OPTIONS") {
    // Set headers individually to ensure they're applied
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

    // Return immediately with 200 status
    res.statusCode = 200;
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

    // Make request to Deye Cloud API (it handles authentication internally)
    const deyeResponse = await deyeApi.request(path, {
      method: req.method,
      body: req.body,
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

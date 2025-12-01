// Deye Cloud API Proxy
// Handles all Deye Cloud API requests with proper CORS headers

import { DeyeCloudApi } from "../lib/deye-cloud-api.js";
import { setCorsHeaders, handleOptions } from "../lib/cors.js";

function sendJson(res, statusCode, data) {
  // Ensure Content-Type is set
  if (!res.getHeader("Content-Type")) {
    res.setHeader("Content-Type", "application/json");
  }
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Log EVERY request immediately - this helps debug if requests are reaching the function
  console.log(`[DEYE API] Request received: ${req.method} ${req.url}`, {
    origin: req.headers.origin,
    method: req.method,
    path: req.query.path,
    headers: {
      origin: req.headers.origin,
      "access-control-request-method":
        req.headers["access-control-request-method"],
      "access-control-request-headers":
        req.headers["access-control-request-headers"],
    },
  });

  // CRITICAL: Handle OPTIONS preflight requests FIRST
  // This MUST return before any other code runs
  if (req.method === "OPTIONS") {
    console.log(`[DEYE API] Processing OPTIONS preflight request`);

    // Use the standard handleOptions function (matches pattern from other working routes)
    handleOptions(req, res);
    return;
  }

  // Log for debugging - check Vercel logs
  console.log(`[DEYE API] ${req.method} ${req.url}`, {
    origin: req.headers.origin,
    method: req.method,
    path: req.query.path,
  });

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
    // But with rewrite rules, it might come as a string in the query parameter
    let path = "/";
    if (req.query.path) {
      if (Array.isArray(req.query.path)) {
        // Normal catch-all route: path is an array
        path = "/" + req.query.path.join("/");
      } else {
        // Rewrite rule: path is a string (URL encoded)
        // Decode and use directly
        path = "/" + decodeURIComponent(req.query.path);
      }
    } else {
      // Fallback: extract from URL
      const urlPath = req.url.replace("/api/deye", "") || "/";
      // Remove query string if present
      path = urlPath.split("?")[0] || "/";
    }

    console.log(`[DEYE API] Resolved path: ${path}`);

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

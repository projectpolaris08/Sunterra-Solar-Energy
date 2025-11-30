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
  // Set CORS headers FIRST, before any processing
  setCorsHeaders(req, res);

  // Handle preflight OPTIONS requests immediately
  if (req.method === "OPTIONS") {
    return handleOptions(req, res);
  }

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

// Deye Cloud API Proxy
// Handles all Deye Cloud API requests with proper CORS headers

import { DeyeCloudApi } from "../lib/deye-cloud-api.js";

function sendJson(res, statusCode, data) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Set CORS headers for all responses
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://sunterrasolarenergy.com",
    "https://www.sunterrasolarenergy.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
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

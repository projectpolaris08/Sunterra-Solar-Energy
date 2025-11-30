// API endpoint to get error code database

import { getAllErrorCodes } from "../lib/supabase-storage.js";

function sendJson(res, statusCode, data) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.end();
      return;
    }

    // Only allow GET requests
    if (req.method !== "GET") {
      return sendJson(res, 405, {
        success: false,
        message: "Method not allowed",
      });
    }

    const errorCodes = await getAllErrorCodes();

    return sendJson(res, 200, {
      success: true,
      errorCodes,
      count: errorCodes.length,
    });
  } catch (error) {
    console.error("Error getting error codes:", error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || "Failed to get error codes",
    });
  }
}

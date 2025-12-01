// Admin Settings API endpoint
// Handles settings operations

import { setCorsHeaders, handleOptions } from "../lib/cors.js";
import { getSettings, updateSettings } from "../lib/admin-database.js";

function sendJson(res, statusCode, data) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return handleOptions(req, res);
  }

  // Set CORS headers
  setCorsHeaders(req, res);

  try {
    // GET - Get settings
    if (req.method === "GET") {
      const settings = await getSettings();
      return sendJson(res, 200, {
        success: true,
        settings,
      });
    }

    // PUT - Update settings
    if (req.method === "PUT") {
      const settingsData = req.body;
      const updatedSettings = await updateSettings(settingsData);
      return sendJson(res, 200, {
        success: true,
        settings: updatedSettings,
      });
    }

    // Method not allowed
    return sendJson(res, 405, {
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Error in settings API:", error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}


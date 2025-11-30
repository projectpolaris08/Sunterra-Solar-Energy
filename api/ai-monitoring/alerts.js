// API endpoint to get AI monitoring alerts

import { getAlerts } from "../lib/supabase-storage.js";
import { setCorsHeaders, handleOptions } from "../lib/cors.js";

function sendJson(res, statusCode, data) {
  res.setHeader("Content-Type", "application/json");
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
    // Only allow GET requests
    if (req.method !== "GET") {
      return sendJson(res, 405, {
        success: false,
        message: "Method not allowed",
      });
    }

    const limit = parseInt(req.query.limit || "100", 10);
    const alerts = await getAlerts(limit);

    // Filter out example alerts
    const filtered = alerts.filter(
      (alert) =>
        alert.type !== "voltage" &&
        alert.type !== "device_state" &&
        alert.type !== "low_production"
    );

    return sendJson(res, 200, {
      success: true,
      alerts: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error("Error getting alerts:", error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || "Failed to get alerts",
    });
  }
}

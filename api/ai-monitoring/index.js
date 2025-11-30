// Consolidated AI Monitoring API endpoint
// Handles: /api/ai-monitoring?action=alerts|error-codes|trigger

import { getAlerts, getAllErrorCodes } from "../lib/supabase-storage.js";
import { DeyeCloudApi } from "../lib/deye-cloud-api.js";
import { MonitoringService } from "../lib/monitoring-service.js";
import { setCorsHeaders, handleOptions } from "../lib/cors.js";

function sendJson(res, statusCode, data) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Handle preflight OPTIONS requests FIRST, before anything else
  if (req.method === "OPTIONS") {
    return handleOptions(req, res);
  }

  // Set CORS headers for all other requests
  setCorsHeaders(req, res);

  try {
    const action = req.query.action || "alerts";

    // Handle GET requests
    if (req.method === "GET") {
      if (action === "alerts") {
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
      } else if (action === "error-codes") {
        const errorCodes = await getAllErrorCodes();

        return sendJson(res, 200, {
          success: true,
          errorCodes,
          count: errorCodes.length,
        });
      } else {
        return sendJson(res, 400, {
          success: false,
          message: "Invalid action. Use 'alerts' or 'error-codes'",
        });
      }
    }

    // Handle POST requests
    if (req.method === "POST") {
      if (action === "trigger") {
        // Run monitoring in background (don't wait for completion)
        const deyeCloudApi = new DeyeCloudApi();
        const monitoringService = new MonitoringService(deyeCloudApi);

        // Start monitoring but don't await (return immediately)
        monitoringService.monitorDevices().catch((error) => {
          console.error("Error in manual monitoring trigger:", error);
        });

        return sendJson(res, 200, {
          success: true,
          message: "Monitoring cycle triggered",
        });
      } else {
        return sendJson(res, 400, {
          success: false,
          message: "Invalid action. Use 'trigger' for POST requests",
        });
      }
    }

    // Method not allowed
    return sendJson(res, 405, {
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Error in AI monitoring API:", error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

// API endpoint to manually trigger monitoring cycle

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
    // Only allow POST requests
    if (req.method !== "POST") {
      return sendJson(res, 405, {
        success: false,
        message: "Method not allowed",
      });
    }

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
  } catch (error) {
    console.error("Error triggering monitoring:", error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || "Failed to trigger monitoring",
    });
  }
}

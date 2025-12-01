// Consolidated AI Monitoring API endpoint
// Handles: /api/ai-monitoring?action=alerts|error-codes|trigger

import { getAlerts, getAllErrorCodes, deleteAlert } from "../lib/supabase-storage.js";
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
    console.log("API Request - Method:", req.method, "Action:", action, "Query:", req.query);

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
      console.log("POST request received, action:", action);
      
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
      }
      
      if (action === "delete") {
        console.log("Delete action detected, alertId from query:", req.query.id, "from body:", req.body?.id);
        // Handle delete via POST (more compatible with Vercel)
        const alertId = req.query.id || req.body?.id;
        
        if (!alertId) {
          console.log("No alert ID provided");
          return sendJson(res, 400, {
            success: false,
            message: "Alert ID is required",
          });
        }

        console.log("Attempting to delete alert with ID:", alertId);
        try {
          const deleted = await deleteAlert(alertId);
          console.log("Delete result:", deleted);
          if (deleted) {
            return sendJson(res, 200, {
              success: true,
              message: "Alert deleted successfully",
            });
          } else {
            return sendJson(res, 404, {
              success: false,
              message: "Alert not found",
            });
          }
        } catch (error) {
          console.error("Error deleting alert:", error);
          return sendJson(res, 500, {
            success: false,
            message: error.message || "Failed to delete alert",
          });
        }
      }
      
      // If we get here, action is neither "trigger" nor "delete"
      console.log("Invalid POST action:", action);
      return sendJson(res, 400, {
        success: false,
        message: `Invalid action: '${action}'. Use 'trigger' or 'delete' for POST requests`,
      });
    }

    // Handle DELETE requests (fallback for clients that use DELETE method)
    if (req.method === "DELETE" || req.method === "delete") {
      if (action === "delete") {
        const alertId = req.query.id || req.body?.id;
        
        if (!alertId) {
          return sendJson(res, 400, {
            success: false,
            message: "Alert ID is required",
          });
        }

        try {
          const deleted = await deleteAlert(alertId);
          if (deleted) {
            return sendJson(res, 200, {
              success: true,
              message: "Alert deleted successfully",
            });
          } else {
            return sendJson(res, 404, {
              success: false,
              message: "Alert not found",
            });
          }
        } catch (error) {
          console.error("Error deleting alert:", error);
          return sendJson(res, 500, {
            success: false,
            message: error.message || "Failed to delete alert",
          });
        }
      } else {
        return sendJson(res, 400, {
          success: false,
          message: "Invalid action. Use 'delete' for DELETE requests",
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

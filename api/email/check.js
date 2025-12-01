// API endpoint to check emails for new leads
import { setCorsHeaders, handleOptions } from "../lib/cors.js";
import { checkEmailsForLeads } from "../lib/email-monitor.js";

function sendJson(req, res, statusCode, data) {
  // Ensure CORS headers are set before sending response
  setCorsHeaders(req, res);
  res.setHeader("Content-Type", "application/json");
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Handle preflight OPTIONS requests FIRST
  if (req.method === "OPTIONS") {
    return handleOptions(req, res);
  }

  // Set CORS headers for all requests
  setCorsHeaders(req, res);

  // Verify cron requests (for scheduled runs)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  const isCronRequest = authHeader && (cronSecret ? authHeader === `Bearer ${cronSecret}` : true);

  try {
    // Allow GET (for manual/cron) and POST (for manual trigger)
    if (req.method !== "GET" && req.method !== "POST") {
      return sendJson(req, res, 405, {
        success: false,
        message: "Method not allowed",
      });
    }

    console.log(`[EMAIL CHECK] ${isCronRequest ? 'Cron' : 'Manual'} email check started at ${new Date().toISOString()}`);
    const result = await checkEmailsForLeads();
    
    console.log(`[EMAIL CHECK] Completed: ${result.message || "Success"}`);
    if (result.leads && result.leads.length > 0) {
      console.log(`[EMAIL CHECK] Found ${result.leads.length} new lead(s)`);
    }

    return sendJson(req, res, 200, {
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[EMAIL CHECK] Error:", error);
    return sendJson(req, res, 500, {
      success: false,
      message: error.message || "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
}


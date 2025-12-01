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

  try {
    if (req.method !== "GET" && req.method !== "POST") {
      return sendJson(req, res, 405, {
        success: false,
        message: "Method not allowed",
      });
    }

    const result = await checkEmailsForLeads();

    return sendJson(req, res, 200, result);
  } catch (error) {
    console.error("Error checking emails:", error);
    return sendJson(req, res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}


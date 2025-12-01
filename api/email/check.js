// API endpoint to check emails for new leads
import { setCorsHeaders, handleOptions } from "../lib/cors.js";
import { checkEmailsForLeads } from "../lib/email-monitor.js";

function sendJson(res, statusCode, data) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    handleOptions(req, res);
    return;
  }

  setCorsHeaders(req, res);

  try {
    if (req.method !== "GET" && req.method !== "POST") {
      return sendJson(res, 405, {
        success: false,
        message: "Method not allowed",
      });
    }

    const result = await checkEmailsForLeads();

    return sendJson(res, 200, result);
  } catch (error) {
    console.error("Error checking emails:", error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}


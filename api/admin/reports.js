// Admin Reports API endpoint
// Handles report operations

import { setCorsHeaders, handleOptions } from "../lib/cors.js";
import { getReports, createReport } from "../lib/admin-database.js";

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
    // GET - Get all reports
    if (req.method === "GET") {
      const reports = await getReports();
      return sendJson(res, 200, {
        success: true,
        reports,
        count: reports.length,
      });
    }

    // POST - Create new report
    if (req.method === "POST") {
      const reportData = req.body;
      const newReport = await createReport(reportData);
      return sendJson(res, 201, {
        success: true,
        report: newReport,
      });
    }

    // Method not allowed
    return sendJson(res, 405, {
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Error in reports API:", error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}


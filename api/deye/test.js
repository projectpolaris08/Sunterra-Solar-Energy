// Simple test endpoint to verify /api/deye routes are accessible
import { setCorsHeaders, handleOptions } from "../lib/cors.js";

export default async function handler(req, res) {
  // Handle OPTIONS
  if (req.method === "OPTIONS") {
    handleOptions(req, res);
    return;
  }

  // Set CORS headers
  setCorsHeaders(req, res);

  return res.status(200).json({
    success: true,
    message: "DEYE API test endpoint is working!",
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });
}

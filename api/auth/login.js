// Server-side authentication endpoint
// Validates credentials without exposing them in client code

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

    const { email, password } = req.body || {};

    if (!email || !password) {
      return sendJson(res, 400, {
        success: false,
        message: "Email and password are required",
      });
    }

    // Get credentials from environment variables (server-side only)
    // NOTE: This endpoint is deprecated - use Supabase Auth instead
    // Keeping for backward compatibility only
    const validEmail = process.env.ADMIN_EMAIL;
    const validPassword = process.env.ADMIN_PASSWORD;

    // Require environment variables - no hardcoded fallbacks for security
    if (!validEmail || !validPassword) {
      return sendJson(res, 500, {
        success: false,
        message:
          "Authentication not configured. Please set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel environment variables.",
      });
    }

    // Normalize and compare
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedValidEmail = validEmail.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Validate credentials
    if (
      normalizedEmail === normalizedValidEmail &&
      normalizedPassword === validPassword
    ) {
      // Generate a simple session token (in production, use JWT or similar)
      const sessionToken = Buffer.from(
        `${normalizedEmail}:${Date.now()}`
      ).toString("base64");

      return sendJson(res, 200, {
        success: true,
        message: "Login successful",
        token: sessionToken,
      });
    }

    return sendJson(res, 401, {
      success: false,
      message: "Invalid email or password",
    });
  } catch (error) {
    return sendJson(res, 500, {
      success: false,
      message: "Internal server error",
    });
  }
}

// Server-side authentication endpoint
// Validates credentials without exposing them in client code

function sendJson(res, statusCode, data) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.end();
      return;
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return sendJson(res, 405, {
        success: false,
        message: "Method not allowed",
      });
    }

    const { email, password } = req.body || {};

    console.log("=== LOGIN REQUEST ===");
    console.log(
      "Email provided:",
      email ? `${email.substring(0, 3)}***` : "none"
    );
    console.log("Password provided:", password ? "***" : "none");

    if (!email || !password) {
      console.log("Missing email or password");
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

    console.log(
      "ADMIN_EMAIL configured:",
      validEmail ? `${validEmail.substring(0, 3)}***` : "NOT SET"
    );
    console.log(
      "ADMIN_PASSWORD configured:",
      validPassword ? "SET" : "NOT SET"
    );

    // Require environment variables - no hardcoded fallbacks for security
    if (!validEmail || !validPassword) {
      console.error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables"
      );
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

    console.log("Email match:", normalizedEmail === normalizedValidEmail);
    console.log("Password match:", normalizedPassword === validPassword);

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
    console.error("Login error:", error);
    return sendJson(res, 500, {
      success: false,
      message: "Internal server error",
    });
  }
}

import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Get sensitive information from environment variables
const BASE_URL =
  process.env.DEYE_BASE_URL || "https://eu1-developer.deyecloud.com:443";
const APP_ID = process.env.DEYE_APP_ID;
const APP_SECRET = process.env.DEYE_APP_SECRET;

// Validate required environment variables
if (!APP_ID || !APP_SECRET) {
  process.exit(1);
}

// SHA256 encryption helper
function sha256(message) {
  return crypto.createHash("sha256").update(message).digest("hex");
}

// Store tokens in memory (in production, use Redis or database)
let accessToken = null;
let refreshToken = null;
let tokenExpiry = 0;

// Authenticate and get access token
async function authenticate() {
  try {
    const email = process.env.DEYE_EMAIL;
    const password = process.env.DEYE_PASSWORD;

    // Validate required credentials
    if (!email || !password) {
      throw new Error("DEYE_EMAIL and DEYE_PASSWORD must be set in .env file");
    }

    const encryptedPassword = sha256(password);

    const response = await fetch(
      `${BASE_URL}/v1.0/account/token?appId=${APP_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appSecret: APP_SECRET,
          email: email,
          password: encryptedPassword,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Authentication failed: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Authentication failed: ${data.msg}`);
    }

    if (!data.accessToken) {
      throw new Error("Authentication failed: No access token received");
    }

    // Store token with Bearer prefix for consistency
    accessToken = `Bearer ${data.accessToken}`;
    refreshToken = data.refreshToken;
    // Set expiry time (subtract 5 minutes for safety)
    // expiresIn is in seconds, convert to milliseconds
    const expiresInMs = (data.expiresIn || 7200) * 1000; // Default to 2 hours if not provided
    tokenExpiry = Date.now() + expiresInMs - 300000; // Subtract 5 minutes (300000ms)

    // Return token with Bearer prefix
    return accessToken;
  } catch (error) {
    throw error;
  }
}

// Get or refresh access token
async function getAccessToken() {
  // Check if token is still valid (with 1 minute buffer)
  const bufferTime = 60000; // 1 minute buffer
  if (accessToken && Date.now() < tokenExpiry - bufferTime) {
    // Ensure token has Bearer prefix
    const token = accessToken.startsWith("Bearer ")
      ? accessToken
      : `Bearer ${accessToken}`;
    return token;
  }

  // Token expired or doesn't exist, get a new one
  return await authenticate();
}

// Proxy endpoint for Deye Cloud API - catch all paths using regex
app.post(/^\/api\/deye\/.*/, async (req, res) => {
  try {
    // Extract the path after /api/deye
    const fullPath = req.path;
    const path = fullPath.replace("/api/deye", "") || "/";

    // Get access token (will use cached if valid, or get fresh if needed)
    const token = await getAccessToken();

    if (!token) {
      throw new Error("Failed to obtain access token");
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = {
          msg: errorText || response.statusText,
          code: response.status,
        };
      }

      // Check for auth errors: 401 status, error code 2101019, or error message contains token/auth
      const errorCode =
        typeof errorData.code === "string"
          ? parseInt(errorData.code, 10)
          : errorData.code;
      const isAuthError =
        response.status === 401 ||
        errorCode === 2101019 ||
        errorData.msg?.toLowerCase().includes("token") ||
        errorData.msg?.toLowerCase().includes("auth") ||
        errorData.msg?.toLowerCase().includes("invalid");

      if (isAuthError) {
        // Token expired or invalid, try to refresh
        accessToken = null;
        tokenExpiry = 0; // Force token refresh

        try {
          const newToken = await authenticate();

          // Retry request with new token
          const retryResponse = await fetch(`${BASE_URL}${path}`, {
            method: req.method,
            headers: {
              "Content-Type": "application/json",
              Authorization: newToken,
            },
            body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
          });

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            let retryErrorData;
            try {
              retryErrorData = JSON.parse(retryErrorText);
            } catch {
              retryErrorData = {
                msg: retryErrorText || retryResponse.statusText,
              };
            }
            return res.status(retryResponse.status).json({
              success: false,
              ...retryErrorData,
            });
          }

          const retryData = await retryResponse.json();
          return res.json(retryData);
        } catch (authError) {
          return res.status(500).json({
            success: false,
            msg: `Authentication failed: ${authError.message}`,
            code: 5000000,
          });
        }
      }
      return res.status(response.status).json({
        success: false,
        ...errorData,
      });
    }

    const data = await response.json();

    // Check response body for errors (Deye Cloud returns 200 OK even for errors)
    const responseCode =
      typeof data.code === "string" ? parseInt(data.code, 10) : data.code;

    // Check if response indicates an error (even if HTTP status is 200)
    if (data.code !== undefined && responseCode !== 1000000) {
      // If it's an auth error, try to refresh token and retry
      if (
        responseCode === 2101019 ||
        data.msg?.toLowerCase().includes("token") ||
        data.msg?.toLowerCase().includes("auth")
      ) {
        accessToken = null;
        tokenExpiry = 0;

        try {
          const newToken = await authenticate();

          // Retry request with new token
          const retryResponse = await fetch(`${BASE_URL}${path}`, {
            method: req.method,
            headers: {
              "Content-Type": "application/json",
              Authorization: newToken,
            },
            body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
          });

          const retryData = await retryResponse.json();
          const retryCode =
            typeof retryData.code === "string"
              ? parseInt(retryData.code, 10)
              : retryData.code;

          if (retryCode !== 1000000) {
            return res.status(400).json(retryData);
          }

          return res.json(retryData);
        } catch (authError) {
          return res.status(500).json({
            success: false,
            msg: `Authentication failed: ${authError.message}`,
            code: 5000000,
          });
        }
      }

      // Non-auth error, return it as-is
      return res.status(400).json(data);
    }

    res.json(data);
  } catch (error) {
    // Check if it's an authentication error
    if (error.message.includes("token") || error.message.includes("auth")) {
      // Try to clear token and re-authenticate
      accessToken = null;
      try {
        await authenticate();
      } catch (authError) {
        // Silent fail
      }
    }

    res.status(500).json({
      success: false,
      msg: error.message || "Internal server error",
      code: error.code || 5000000,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Deye Cloud Proxy Server is running",
    endpoints: {
      health: "/api/health",
      deye: "/api/deye/*",
    },
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Deye Cloud Proxy Server is running" });
});

// Email endpoint for contact form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, propertyType, systemType, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !propertyType || !systemType) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // Get email configuration from environment variables
    const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const smtpUser = process.env.SMTP_USER || "info@sunterrasolarenergy.com";
    const smtpPassword = process.env.SMTP_PASSWORD;
    const recipientEmail =
      process.env.RECIPIENT_EMAIL || "info@sunterrasolarenergy.com";

    if (!smtpPassword) {
      console.error("SMTP_PASSWORD is not set in environment variables");
      return res.status(500).json({
        success: false,
        message:
          "Email service is not configured. Please contact the administrator.",
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Sunterra Solar Website" <${smtpUser}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `New Contact Form Submission - ${propertyType} ${systemType} System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Project Details</h3>
            <p><strong>Property Type:</strong> ${propertyType}</p>
            <p><strong>System Interest:</strong> ${systemType}</p>
          </div>

          ${
            message
              ? `
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          `
              : ""
          }

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This email was sent from the Sunterra Solar Energy website contact form.</p>
            <p>You can reply directly to this email to contact ${name} at ${email}.</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Contact Information:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}

Project Details:
- Property Type: ${propertyType}
- System Interest: ${systemType}

${message ? `Message:\n${message}\n` : ""}

---
This email was sent from the Sunterra Solar Energy website contact form.
You can reply directly to this email to contact ${name} at ${email}.
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message:
        "Your message has been sent successfully. We'll contact you within 24 hours.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to send email. Please try again later or contact us directly.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.listen(PORT, () => {
  // Server started
});

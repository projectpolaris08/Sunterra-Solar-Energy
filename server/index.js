import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import AIMonitoringService from "./services/aiMonitoringService.js";
import DeyeCloudApiWrapper from "./services/deyeCloudApiWrapper.js";

// Load environment variables from .env file
dotenv.config();

// Helper function to mask email addresses in logs for security
const maskEmail = (email) => {
  if (!email) return "N/A";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.length > 2 ? local.slice(-2) : local;
  return `${"*".repeat(Math.max(2, local.length - 2))}${visible}@${domain}`;
};

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

// AI Monitoring Service Integration
let aiMonitoringService = null;

// Initialize AI Monitoring Service
function initializeAIMonitoring() {
  try {
    const deyeApiWrapper = new DeyeCloudApiWrapper(
      BASE_URL,
      APP_ID,
      APP_SECRET
    );
    aiMonitoringService = new AIMonitoringService(deyeApiWrapper);

    // Start monitoring with 60 second intervals
    const monitoringInterval = parseInt(
      process.env.AI_MONITORING_INTERVAL || "60",
      10
    );
    aiMonitoringService.startMonitoring(monitoringInterval);

    console.log(
      `AI Monitoring Service initialized (interval: ${monitoringInterval}s)`
    );
  } catch (error) {
    console.error("Failed to initialize AI Monitoring Service:", error);
    console.log("AI Monitoring will be disabled");
  }
}

// API endpoint to get alert history
app.get("/api/ai-monitoring/alerts", async (req, res) => {
  try {
    if (!aiMonitoringService) {
      return res.status(503).json({
        success: false,
        message: "AI Monitoring Service is not available",
      });
    }

    const limit = parseInt(req.query.limit || "100", 10);
    const alerts = aiMonitoringService.getAlertHistory(limit);

    res.json({
      success: true,
      alerts,
      count: alerts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get alerts",
    });
  }
});

// API endpoint to get error code database
app.get("/api/ai-monitoring/error-codes", async (req, res) => {
  try {
    if (!aiMonitoringService) {
      return res.status(503).json({
        success: false,
        message: "AI Monitoring Service is not available",
      });
    }

    const errorCodes = aiMonitoringService.getErrorCodeDatabase();

    res.json({
      success: true,
      errorCodes,
      count: errorCodes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get error codes",
    });
  }
});

// API endpoint to manually trigger monitoring cycle
app.post("/api/ai-monitoring/trigger", async (req, res) => {
  try {
    if (!aiMonitoringService) {
      return res.status(503).json({
        success: false,
        message: "AI Monitoring Service is not available",
      });
    }

    // Run monitoring in background
    aiMonitoringService.monitorDevices().catch((error) => {
      console.error("Error in manual monitoring trigger:", error);
    });

    res.json({
      success: true,
      message: "Monitoring cycle triggered",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to trigger monitoring",
    });
  }
});

// API endpoint to send a test inverter overheat email to a specific address
// Simple SMTP test endpoint
app.post("/api/test-smtp", async (req, res) => {
  try {
    const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const smtpUser = process.env.SMTP_USER || "info@sunterrasolarenergy.com";
    const smtpPassword = process.env.SMTP_PASSWORD;
    const { to } = req.body || {};
    const targetEmail =
      to || process.env.RECIPIENT_EMAIL || "info@sunterrasolarenergy.com";

    if (!smtpPassword) {
      return res.status(400).json({
        success: false,
        message: "SMTP_PASSWORD not configured in .env file",
      });
    }

    // Mask emails in logs for security
    console.log(`Testing SMTP connection to ${smtpHost}:${smtpPort}...`);
    console.log(`From: ${maskEmail(smtpUser)}`);
    console.log(`To: ${maskEmail(targetEmail)}`);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      debug: true,
      logger: true,
    });

    // Verify connection
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    // Send test email
    const info = await transporter.sendMail({
      from: `"Sunterra Test" <${smtpUser}>`,
      to: targetEmail,
      subject: "SMTP Test - Sunterra Solar",
      html: `
        <h2>SMTP Test Email</h2>
        <p>This is a test email to verify SMTP configuration.</p>
        <p>If you receive this, your email settings are working correctly.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
    });

    console.log("Test email sent successfully:", info.messageId);

    res.json({
      success: true,
      message: `Test email sent to ${targetEmail}`,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("SMTP Test Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send test email",
      error: error.toString(),
      stack: error.stack,
    });
  }
});

app.post("/api/ai-monitoring/send-test-email", async (req, res) => {
  console.log(
    `[TEST EMAIL ENDPOINT] Request received at ${new Date().toISOString()}`
  );
  try {
    if (!aiMonitoringService) {
      console.error(
        "[TEST EMAIL ENDPOINT] AI Monitoring Service is not available"
      );
      return res.status(503).json({
        success: false,
        message: "AI Monitoring Service is not available",
      });
    }

    const { to } = req.body || {};
    const targetEmail = to || process.env.RECIPIENT_EMAIL;

    // Mask email in logs
    console.log(
      `[TEST EMAIL ENDPOINT] Target email: ${maskEmail(targetEmail)}`
    );

    if (!targetEmail) {
      console.error("[TEST EMAIL ENDPOINT] No recipient email specified");
      return res.status(400).json({
        success: false,
        message:
          "No recipient email specified. Provide 'to' in body or configure RECIPIENT_EMAIL.",
      });
    }

    console.log(
      `[TEST EMAIL ENDPOINT] Sending test inverter overheat email to ${maskEmail(
        targetEmail
      )}...`
    );

    // Use unique device SN for each test to bypass cooldown
    const testDeviceSn = `TEST-${Date.now()}`;
    console.log(`[TEST EMAIL ENDPOINT] Using test device SN: ${testDeviceSn}`);

    const anomaly = {
      type: "inverter_overheat",
      severity: "critical",
      deviceSn: testDeviceSn,
      stationId: null,
      message: `Inverter Overheat - Auto Shutdown. Device ${testDeviceSn} exceeded safe operating temperature and was automatically shut down to protect the inverter. Immediate on-site inspection is required.`,
      data: null,
      overrideRecipientEmail: targetEmail,
      bypassCooldown: true, // Flag to bypass cooldown for test emails
      aiRecommendation: {
        explanation:
          "The inverter reported an over‑temperature condition and shut itself down to prevent damage. This is treated as a critical fault and the system will not generate power until the issue is resolved. Sunterra support has been notified and will contact you shortly. Please keep your phone and email available so we can coordinate any required on‑site visit.",
        possibleCauses: [
          "Inverter installed in direct sunlight or a poorly ventilated area",
          "Dust or debris blocking inverter heat sinks or vents",
          "High ambient temperature combined with continuous high load",
          "Internal cooling fan failure (if applicable)",
        ],
        recommendedActions: [
          "Check that the inverter has good airflow and is not enclosed or blocked",
          "Clean any dust or debris around the vents and heat sinks (with power off)",
          "Ensure the inverter is not installed in direct sunlight; provide shading if needed",
          "After it cools, restart and monitor temperature and load",
          "If the fault repeats, contact your installer or technical support for a detailed inspection",
          "Sunterra support has been notified and will contact you shortly. Please keep your phone and email available so we can coordinate any required on‑site visit.",
        ],
        severity: "critical",
        ownerCanFix: true,
        requiresOnsite: true,
      },
    };

    console.log(
      `[TEST EMAIL ENDPOINT] Calling sendAlert with anomaly type: ${anomaly.type}`
    );
    await aiMonitoringService.sendAlert(anomaly, anomaly.aiRecommendation);
    console.log(
      `[TEST EMAIL ENDPOINT] sendAlert completed for ${maskEmail(targetEmail)}`
    );

    res.json({
      success: true,
      message: `Test inverter overheat email sent to ${targetEmail}`,
    });
  } catch (error) {
    console.error("Failed to send test email:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send test email",
      error: error.toString(),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize AI Monitoring after server starts
  // Delay to ensure server is fully ready
  setTimeout(() => {
    initializeAIMonitoring();
  }, 2000);
});

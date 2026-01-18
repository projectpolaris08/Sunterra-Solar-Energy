// Consolidated API endpoint - handles all API routes
// Reduces serverless function count to stay under Vercel Hobby plan limit
import { setCorsHeaders, handleOptions } from "./lib/cors.js";
import { checkEmailsForLeads } from "./lib/email-monitor.js";
import { DeyeCloudApi } from "./lib/deye-cloud-api.js";
import { MonitoringService } from "./lib/monitoring-service.js";
import {
  getAlerts,
  getAllErrorCodes,
  deleteAlert,
} from "./lib/supabase-storage.js";
import {
  getClients,
  createClientRecord,
  updateClient,
  deleteClient,
  getNotifications,
  createNotification,
  markNotificationAsRead,
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getReports,
  createReport,
  getSettings,
  updateSettings,
} from "./lib/admin-database.js";
import {
  getReferrers,
  getReferrerById,
  getReferrerByEmail,
  getReferrerByCode,
  createReferrer,
  updateReferrer,
  getReferrals,
  createReferral,
  updateReferral,
  getPayments,
  createPayment,
  updatePayment,
} from "./lib/referral-database.js";
import nodemailer from "nodemailer";
import { createHash } from "crypto";

function sendJson(req, res, statusCode, data) {
  setCorsHeaders(req, res);
  res.setHeader("Content-Type", "application/json");
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Handle preflight OPTIONS requests FIRST - before any other logic
  if (req.method === "OPTIONS") {
    return handleOptions(req, res);
  }

  // Set CORS headers for all requests
  setCorsHeaders(req, res);

  try {
    // Extract endpoint from query or path
    // First check query parameter (from rewrite rules)
    let endpoint = req.query.endpoint;

    // If not in query, extract from URL path
    if (!endpoint) {
      const urlPath = req.url.split("?")[0]; // Remove query string
      const pathMatch = urlPath.match(/\/api\/([^\/\?]+)/);
      if (pathMatch) {
        endpoint = pathMatch[1];
      }
    }

    const resource = req.query.resource;
    const action = req.query.action; // Get action from query
    const body = req.body || {};

    // Route to appropriate handler
    switch (endpoint) {
      case "contact":
        return await handleContact(req, res, body);
      case "auth":
      case "login":
        return await handleAuth(req, res, body);
      case "admin":
        return await handleAdmin(req, res, resource, action, req.query, body);
      case "email":
      case "email/check":
        return await handleEmailCheck(req, res);
      case "ai-monitoring":
        return await handleAIMonitoring(req, res, action, req.query, body);
      case "deye":
        return await handleDeye(req, res, req.query.path, body);
      case "cron":
        return await handleCron(req, res, req.query.path, body);
      case "referral":
        return await handleReferral(
          req,
          res,
          req.query.action,
          req.query,
          body
        );
      default:
        // Try to infer from URL path
        if (req.url.includes("/contact")) {
          return await handleContact(req, res, body);
        }
        if (req.url.includes("/auth") || req.url.includes("/login")) {
          return await handleAuth(req, res, body);
        }
        if (req.url.includes("/admin")) {
          return await handleAdmin(req, res, resource, action, req.query, body);
        }
        if (req.url.includes("/email")) {
          return await handleEmailCheck(req, res);
        }
        if (req.url.includes("/ai-monitoring")) {
          return await handleAIMonitoring(req, res, action, req.query, body);
        }
        if (req.url.includes("/deye")) {
          return await handleDeye(req, res, req.query.path, body);
        }
        if (req.url.includes("/cron")) {
          return await handleCron(req, res, req.query.path, body);
        }
        if (req.url.includes("/referral")) {
          return await handleReferral(
            req,
            res,
            req.query.action,
            req.query,
            body
          );
        }

        return sendJson(req, res, 404, {
          success: false,
          message:
            "Endpoint not found. Available: contact, auth, admin, email, ai-monitoring, deye, referral",
        });
    }
  } catch (error) {
    console.error("Error in consolidated API:", error);
    return sendJson(req, res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

// Contact form handler
async function handleContact(req, res, body) {
  if (req.method !== "POST") {
    return sendJson(req, res, 405, {
      success: false,
      message: "Method not allowed",
    });
  }

  const {
    name,
    email,
    phone,
    propertyType,
    systemType,
    location,
    roofType,
    message,
  } = body;

  if (
    !name ||
    !email ||
    !phone ||
    !propertyType ||
    !systemType ||
    !location ||
    !roofType
  ) {
    return sendJson(req, res, 400, {
      success: false,
      message: "Please fill in all required fields",
    });
  }

  const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const smtpUser = process.env.SMTP_USER || "info@sunterrasolarenergy.com";
  const smtpPassword = process.env.SMTP_PASSWORD;
  const recipientEmail =
    process.env.RECIPIENT_EMAIL || "info@sunterrasolarenergy.com";

  if (!smtpPassword) {
    return sendJson(req, res, 500, {
      success: false,
      message: "Email service is not configured.",
    });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPassword },
  });

  const mailOptions = {
    from: `"Sunterra Solar Website" <${smtpUser}>`,
    to: recipientEmail,
    replyTo: email,
    subject: `New Contact Form Submission - ${propertyType} ${systemType} System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Project Details</h3>
          <p><strong>Property Type:</strong> ${propertyType}</p>
          <p><strong>System Interest:</strong> ${systemType}</p>
          ${location ? `<p><strong>Location:</strong> ${location}</p>` : ""}
          ${roofType ? `<p><strong>Roof Type:</strong> ${roofType}</p>` : ""}
        </div>
        ${
          message
            ? `<div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3>Message</h3><p style="white-space: pre-wrap;">${message}</p></div>`
            : ""
        }
      </div>
    `,
    text: `New Contact Form Submission\n\nContact: ${name} (${email}, ${phone})\nProperty: ${propertyType}\nSystem: ${systemType}${
      location ? `\nLocation: ${location}` : ""
    }${roofType ? `\nRoof Type: ${roofType}` : ""}${
      message ? `\nMessage:\n${message}` : ""
    }`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return sendJson(req, res, 200, {
      success: true,
      message: "Your message has been sent successfully.",
      messageId: info.messageId,
    });
  } catch (error) {
    return sendJson(req, res, 500, {
      success: false,
      message: "Failed to send email. Please try again later.",
    });
  }
}

// Auth handler
async function handleAuth(req, res, body) {
  if (req.method !== "POST") {
    return sendJson(req, res, 405, {
      success: false,
      message: "Method not allowed",
    });
  }

  const { email, password } = body;

  if (!email || !password) {
    return sendJson(req, res, 400, {
      success: false,
      message: "Email and password are required",
    });
  }

  const validEmail = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return sendJson(req, res, 500, {
      success: false,
      message: "Authentication not configured.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedValidEmail = validEmail.trim().toLowerCase();

  if (
    normalizedEmail === normalizedValidEmail &&
    password.trim() === validPassword
  ) {
    const sessionToken = Buffer.from(
      `${normalizedEmail}:${Date.now()}`
    ).toString("base64");
    return sendJson(req, res, 200, {
      success: true,
      message: "Login successful",
      token: sessionToken,
    });
  }

  return sendJson(req, res, 401, {
    success: false,
    message: "Invalid email or password",
  });
}

// Admin handler
async function handleAdmin(req, res, resource, action, queryParams, body) {
  switch (resource) {
    case "clients":
      return await handleClients(req, res, action, queryParams, body);
    case "notifications":
      return await handleNotifications(req, res, action, queryParams, body);
    case "appointments":
      return await handleAppointments(req, res, action, queryParams, body);
    case "reports":
      return await handleReports(req, res, action, queryParams, body);
    case "settings":
      return await handleSettings(req, res, action, queryParams, body);
    default:
      return sendJson(req, res, 400, {
        success: false,
        message:
          "Invalid resource. Use: clients, notifications, appointments, reports, or settings",
      });
  }
}

async function handleClients(req, res, action, queryParams, body) {
  if (req.method === "GET") {
    const clients = await getClients();
    return sendJson(req, res, 200, {
      success: true,
      clients,
      count: clients.length,
    });
  }
  if (req.method === "POST" && action === "create") {
    const client = await createClientRecord(body);
    return sendJson(req, res, 201, { success: true, client });
  }
  if (req.method === "PUT" || req.method === "PATCH") {
    const { id, ...clientData } = body;
    if (!id)
      return sendJson(req, res, 400, {
        success: false,
        message: "Client ID required",
      });
    const client = await updateClient(id, clientData);
    return sendJson(req, res, 200, { success: true, client });
  }
  if (req.method === "DELETE") {
    const id = queryParams.id || body.id;
    if (!id)
      return sendJson(req, res, 400, {
        success: false,
        message: "Client ID required",
      });
    await deleteClient(id);
    return sendJson(req, res, 200, {
      success: true,
      message: "Client deleted",
    });
  }
  return sendJson(req, res, 405, {
    success: false,
    message: "Method not allowed",
  });
}

async function handleNotifications(req, res, action, queryParams, body) {
  if (req.method === "GET") {
    const limit = parseInt(queryParams.limit || "50", 10);
    const notifications = await getNotifications(limit);
    return sendJson(req, res, 200, {
      success: true,
      notifications,
      count: notifications.length,
    });
  }
  if (req.method === "POST") {
    if (action === "mark_read" && body.id) {
      const notification = await markNotificationAsRead(body.id);
      return sendJson(req, res, 200, { success: true, notification });
    }
    const newNotification = await createNotification(body);
    return sendJson(req, res, 201, {
      success: true,
      notification: newNotification,
    });
  }
  return sendJson(req, res, 405, {
    success: false,
    message: "Method not allowed",
  });
}

async function handleAppointments(req, res, action, queryParams, body) {
  if (req.method === "GET") {
    const appointments = await getAppointments(
      queryParams.startDate,
      queryParams.endDate
    );
    return sendJson(req, res, 200, {
      success: true,
      appointments,
      count: appointments.length,
    });
  }
  if (req.method === "POST") {
    const appointment = await createAppointment(body);
    return sendJson(req, res, 201, { success: true, appointment });
  }
  if (req.method === "PUT" || req.method === "PATCH") {
    const { id, ...appointmentData } = body;
    if (!id)
      return sendJson(req, res, 400, {
        success: false,
        message: "Appointment ID required",
      });
    const appointment = await updateAppointment(id, appointmentData);
    return sendJson(req, res, 200, { success: true, appointment });
  }
  if (req.method === "DELETE") {
    const id = queryParams.id || body.id;
    if (!id)
      return sendJson(req, res, 400, {
        success: false,
        message: "Appointment ID required",
      });
    await deleteAppointment(id);
    return sendJson(req, res, 200, {
      success: true,
      message: "Appointment deleted",
    });
  }
  return sendJson(req, res, 405, {
    success: false,
    message: "Method not allowed",
  });
}

async function handleReports(req, res, action, queryParams, body) {
  if (req.method === "GET") {
    const reports = await getReports();
    return sendJson(req, res, 200, {
      success: true,
      reports,
      count: reports.length,
    });
  }
  if (req.method === "POST") {
    const report = await createReport(body);
    return sendJson(req, res, 201, { success: true, report });
  }
  return sendJson(req, res, 405, {
    success: false,
    message: "Method not allowed",
  });
}

async function handleSettings(req, res, action, queryParams, body) {
  if (req.method === "GET") {
    const settings = await getSettings();
    return sendJson(req, res, 200, { success: true, settings });
  }
  if (req.method === "PUT" || req.method === "PATCH" || req.method === "POST") {
    const settings = await updateSettings(body);
    return sendJson(req, res, 200, { success: true, settings });
  }
  return sendJson(req, res, 405, {
    success: false,
    message: "Method not allowed",
  });
}

// Email check handler
async function handleEmailCheck(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return sendJson(req, res, 405, {
      success: false,
      message: "Method not allowed",
    });
  }

  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  const isCronRequest =
    authHeader && (cronSecret ? authHeader === `Bearer ${cronSecret}` : true);

  try {
    console.log(
      `[EMAIL CHECK] ${isCronRequest ? "Cron" : "Manual"} email check started`
    );
    const result = await checkEmailsForLeads();
    console.log(`[EMAIL CHECK] Completed: ${result.message || "Success"}`);
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

// AI Monitoring handler
async function handleAIMonitoring(req, res, action, queryParams, body) {
  const act = action || queryParams.action || "alerts";

  if (req.method === "GET") {
    if (act === "alerts") {
      const limit = parseInt(queryParams.limit || "100", 10);
      const alerts = await getAlerts(limit);
      const filtered = alerts.filter(
        (a) =>
          a.type !== "voltage" &&
          a.type !== "device_state" &&
          a.type !== "low_production"
      );
      return sendJson(req, res, 200, {
        success: true,
        alerts: filtered,
        count: filtered.length,
      });
    }
    if (act === "error-codes") {
      const errorCodes = await getAllErrorCodes();
      return sendJson(req, res, 200, {
        success: true,
        errorCodes,
        count: errorCodes.length,
      });
    }
    return sendJson(req, res, 400, {
      success: false,
      message: "Invalid action. Use 'alerts' or 'error-codes'",
    });
  }

  if (req.method === "POST") {
    if (act === "trigger") {
      const deyeCloudApi = new DeyeCloudApi();
      const monitoringService = new MonitoringService(deyeCloudApi);
      monitoringService.monitorDevices().catch((error) => {
        console.error("Error in monitoring trigger:", error);
      });
      return sendJson(req, res, 200, {
        success: true,
        message: "Monitoring cycle triggered",
      });
    }
    if (act === "delete") {
      const alertId = queryParams.id || body.id;
      if (!alertId)
        return sendJson(req, res, 400, {
          success: false,
          message: "Alert ID required",
        });
      const deleted = await deleteAlert(alertId);
      if (deleted) {
        return sendJson(req, res, 200, {
          success: true,
          message: "Alert deleted",
        });
      }
      return sendJson(req, res, 404, {
        success: false,
        message: "Alert not found",
      });
    }
  }

  return sendJson(req, res, 405, {
    success: false,
    message: "Method not allowed",
  });
}

// Deye handler
async function handleDeye(req, res, pathParam, body) {
  if (req.method !== "GET" && req.method !== "POST") {
    return sendJson(req, res, 405, {
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    let path = "/";

    // Try to get path from various sources
    if (pathParam) {
      if (Array.isArray(pathParam)) {
        path = "/" + pathParam.join("/");
      } else if (typeof pathParam === "string") {
        path = "/" + decodeURIComponent(pathParam);
      }
    } else if (req.query.path) {
      if (Array.isArray(req.query.path)) {
        path = "/" + req.query.path.join("/");
      } else if (typeof req.query.path === "string") {
        path = "/" + decodeURIComponent(req.query.path);
      }
    } else {
      // Extract from URL directly
      const urlPath = req.url.split("?")[0]; // Remove query string
      const deyeMatch = urlPath.match(/\/api\/deye(\/.*)?$/);
      if (deyeMatch && deyeMatch[1]) {
        path = deyeMatch[1];
      } else {
        path = "/";
      }
    }

    // Ensure path starts with /
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    const deyeApi = new DeyeCloudApi();
    let requestBody = body;
    if (typeof requestBody === "string" && requestBody.length > 0) {
      try {
        requestBody = JSON.parse(requestBody);
      } catch {
        requestBody = requestBody || {};
      }
    }

    const deyeResponse = await deyeApi.request(path, {
      method: req.method,
      body: requestBody,
    });

    return sendJson(req, res, 200, deyeResponse);
  } catch (error) {
    console.error("Deye API error:", error);
    return sendJson(req, res, 500, {
      success: false,
      message: error.message || "Deye API request failed",
    });
  }
}

// Cron handler
async function handleCron(req, res, pathParam, body) {
  const path = pathParam || req.query.path || "";

  // Verify cron request
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return sendJson(req, res, 401, { success: false, error: "Unauthorized" });
  }

  if (path === "monitor") {
    try {
      console.log(
        `[Cron] Monitoring job started at ${new Date().toISOString()}`
      );
      const deyeCloudApi = new DeyeCloudApi();
      const monitoringService = new MonitoringService(deyeCloudApi);
      await monitoringService.monitorDevices();
      console.log(
        `[Cron] Monitoring job completed at ${new Date().toISOString()}`
      );
      return sendJson(req, res, 200, {
        success: true,
        message: "Monitoring cycle completed",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Cron] Monitoring job failed:", error);
      return sendJson(req, res, 500, {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  if (path === "all") {
    // Run both monitoring and email check sequentially
    const results = {
      monitoring: null,
      emailCheck: null,
      timestamp: new Date().toISOString(),
    };

    try {
      // Run monitoring first
      console.log(`[Cron] Combined job started at ${new Date().toISOString()}`);

      try {
        console.log(`[Cron] Starting monitoring...`);
        const deyeCloudApi = new DeyeCloudApi();
        const monitoringService = new MonitoringService(deyeCloudApi);
        await monitoringService.monitorDevices();
        results.monitoring = { success: true, message: "Monitoring completed" };
        console.log(`[Cron] Monitoring completed`);
      } catch (error) {
        console.error("[Cron] Monitoring failed:", error);
        results.monitoring = { success: false, error: error.message };
      }

      // Then run email check
      try {
        console.log(`[Cron] Starting email check...`);
        const emailResult = await checkEmailsForLeads();
        results.emailCheck = { success: true, ...emailResult };
        console.log(`[Cron] Email check completed`);
      } catch (error) {
        console.error("[Cron] Email check failed:", error);
        results.emailCheck = { success: false, error: error.message };
      }

      const allSuccess =
        results.monitoring?.success && results.emailCheck?.success;
      return sendJson(req, res, allSuccess ? 200 : 207, {
        success: allSuccess,
        message: "Combined cron job completed",
        results,
      });
    } catch (error) {
      console.error("[Cron] Combined job failed:", error);
      return sendJson(req, res, 500, {
        success: false,
        error: error.message,
        results,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return sendJson(req, res, 404, {
    success: false,
    message: "Cron endpoint not found. Use: monitor or all",
  });
}

// Referral handler
async function handleReferral(req, res, action, queryParams, body) {
  const act = action || queryParams.action;

  try {
    // Sign up new referrer
    if (req.method === "POST" && act === "signup") {
      const {
        name,
        email,
        phone,
        address,
        password,
        paymentMethod,
        paymentDetails,
      } = body;

      if (
        !name ||
        !email ||
        !phone ||
        !address ||
        !password ||
        !paymentMethod ||
        !paymentDetails
      ) {
        return sendJson(req, res, 400, {
          success: false,
          message: "Please fill in all required fields",
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return sendJson(req, res, 400, {
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }

      // Check if referrer already exists
      let existing;
      try {
        existing = await getReferrerByEmail(email);
      } catch (error) {
        console.error("Error checking existing referrer:", error);
        // Continue - might be database not set up yet, will use in-memory
      }

      if (existing) {
        return sendJson(req, res, 400, {
          success: false,
          message: "An account with this email already exists",
        });
      }

      // Hash password using SHA-256
      const hashedPassword = createHash("sha256")
        .update(password)
        .digest("hex");

      let referrer;
      try {
        referrer = await createReferrer({
          name,
          email,
          phone,
          address,
          password: hashedPassword,
          payment_method: paymentMethod,
          payment_details: paymentDetails,
        });

        // Verify referrer was created successfully
        if (!referrer || !referrer.id) {
          console.error("Referrer creation returned invalid data:", referrer);
          return sendJson(req, res, 500, {
            success: false,
            message:
              "Failed to create referral account. Please try again or contact support.",
            error:
              process.env.NODE_ENV === "development"
                ? "Referrer creation returned no ID"
                : undefined,
          });
        }

        console.log("Referrer created successfully:", {
          id: referrer.id,
          email: referrer.email,
          referral_code: referrer.referral_code,
        });
      } catch (error) {
        console.error("Error creating referrer:", error);
        console.error("Error stack:", error.stack);
        console.error("Error name:", error.name);
        console.error(
          "Full error object:",
          JSON.stringify(error, Object.getOwnPropertyNames(error))
        );

        // Provide more helpful error messages
        let errorMessage =
          "Failed to create referral account. Please try again or contact support.";
        const isDevelopment =
          process.env.VERCEL_ENV !== "production" &&
          process.env.NODE_ENV !== "production";

        if (isDevelopment || process.env.VERCEL_ENV === "preview") {
          // Show detailed error in development/preview
          errorMessage = error.message || errorMessage;
        } else if (error.message?.includes("Database not configured")) {
          errorMessage =
            "Database configuration error. Please contact support.";
        } else if (
          error.message?.includes("duplicate key") ||
          error.message?.includes("unique constraint")
        ) {
          errorMessage = "An account with this email already exists.";
        } else if (
          error.message?.includes("column") &&
          error.message?.includes("does not exist")
        ) {
          errorMessage = "Database schema error. Please contact support.";
        }

        return sendJson(req, res, 500, {
          success: false,
          message: errorMessage,
          error: isDevelopment ? error.message : undefined,
        });
      }

      return sendJson(req, res, 201, {
        success: true,
        message: "Referral account created successfully",
        referralCode: referrer.referral_code,
        referrer: {
          id: referrer.id,
          name: referrer.name,
          email: referrer.email,
          referral_code: referrer.referral_code,
        },
      });
    }

    // Login referrer (verify email and password)
    if (req.method === "POST" && act === "login") {
      const { email, password } = body;

      if (!email || !password) {
        return sendJson(req, res, 400, {
          success: false,
          message: "Email and password are required",
        });
      }

      const isDevelopment =
        process.env.VERCEL_ENV !== "production" &&
        process.env.NODE_ENV !== "production";

      if (isDevelopment) {
        console.log("Login attempt for email:", email.toLowerCase());
      }

      const referrer = await getReferrerByEmail(email);
      if (!referrer) {
        if (isDevelopment) {
          console.log("Referrer not found for email:", email.toLowerCase());
        }
        return sendJson(req, res, 401, {
          success: false,
          message: "Invalid email or password",
        });
      }

      if (isDevelopment) {
        console.log("Referrer found:", {
          id: referrer.id,
          email: referrer.email,
          hasPassword: !!referrer.password,
        });
      }

      // Verify password
      const hashedPassword = createHash("sha256")
        .update(password)
        .digest("hex");

      if (!referrer.password) {
        console.error(
          "Referrer has no password set for email:",
          referrer.email
        );
        return sendJson(req, res, 401, {
          success: false,
          message: "Invalid email or password",
        });
      }

      if (referrer.password !== hashedPassword) {
        if (isDevelopment) {
          console.error("Password mismatch for email:", referrer.email);
        }
        return sendJson(req, res, 401, {
          success: false,
          message: "Invalid email or password",
        });
      }

      // Return referrer data (without password)
      const { password: _, ...referrerData } = referrer;
      return sendJson(req, res, 200, {
        success: true,
        referrer: referrerData,
      });
    }

    // Get referrer by email (for dashboard - requires password verification)
    if (req.method === "GET" && act === "referrer") {
      const email = queryParams.email;
      const password = queryParams.password; // Optional for backward compatibility

      if (!email) {
        return sendJson(req, res, 400, {
          success: false,
          message: "Email is required",
        });
      }

      const referrer = await getReferrerByEmail(email);
      if (!referrer) {
        return sendJson(req, res, 404, {
          success: false,
          message: "Referrer not found",
        });
      }

      // If password provided, verify it
      if (password) {
        const hashedPassword = createHash("sha256")
          .update(password)
          .digest("hex");
        if (referrer.password !== hashedPassword) {
          return sendJson(req, res, 401, {
            success: false,
            message: "Invalid password",
          });
        }
      }

      // Return referrer data (without password)
      const { password: _, ...referrerData } = referrer;
      return sendJson(req, res, 200, {
        success: true,
        referrer: referrerData,
      });
    }

    // Get referrals
    if (req.method === "GET" && act === "referrals") {
      const referrerId = queryParams.referrerId;
      if (!referrerId) {
        return sendJson(req, res, 400, {
          success: false,
          message: "Referrer ID is required",
        });
      }

      const referrals = await getReferrals(referrerId);
      return sendJson(req, res, 200, {
        success: true,
        referrals,
      });
    }

    // Get payments
    if (req.method === "GET" && act === "payments") {
      const referrerId = queryParams.referrerId;
      if (!referrerId) {
        return sendJson(req, res, 400, {
          success: false,
          message: "Referrer ID is required",
        });
      }

      const payments = await getPayments(referrerId);
      return sendJson(req, res, 200, {
        success: true,
        payments,
      });
    }

    // Create referral (when contact form is submitted with referral code)
    if (req.method === "POST" && act === "create") {
      const {
        referrerCode,
        customerName,
        customerEmail,
        customerPhone,
        systemType,
        systemSize,
        location,
        propertyType,
        roofType,
        message,
      } = body;

      console.log("Creating referral with code:", referrerCode);

      if (!referrerCode || !customerName || !customerEmail) {
        console.error("Missing required fields:", {
          hasReferrerCode: !!referrerCode,
          hasCustomerName: !!customerName,
          hasCustomerEmail: !!customerEmail,
        });
        return sendJson(req, res, 400, {
          success: false,
          message: "Referrer code and customer information are required",
        });
      }

      const referrer = await getReferrerByCode(referrerCode);
      if (!referrer) {
        console.error("Referrer not found for code:", referrerCode);
        return sendJson(req, res, 404, {
          success: false,
          message: "Invalid referral code",
        });
      }

      console.log("Referrer found:", {
        id: referrer.id,
        email: referrer.email,
        referral_code: referrer.referral_code,
      });

      // Calculate commission (you can customize this logic)
      const commissionAmount = calculateCommission(systemSize, systemType);

      // Create referral with all available data
      // Store additional info in a notes field or extend the table schema
      const referralNotes = [
        location ? `Location: ${location}` : null,
        propertyType ? `Property: ${propertyType}` : null,
        roofType ? `Roof: ${roofType}` : null,
        message ? `Message: ${message}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      let referral;
      try {
        referral = await createReferral({
          referrer_id: referrer.id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          system_type: systemType,
          system_size: systemSize || systemType,
          notes: referralNotes, // Store additional info
          commission_amount: commissionAmount,
        });

        console.log("Referral created successfully:", {
          id: referral.id,
          referrer_id: referral.referrer_id,
          customer_name: referral.customer_name,
        });

        // Update referrer stats automatically
        await updateReferrerStats(referrer.id);

        return sendJson(req, res, 201, {
          success: true,
          message: "Referral created successfully",
          referral,
        });
      } catch (error) {
        console.error("Failed to create referral:", error);
        console.error("Error details:", error.message, error.stack);
        return sendJson(req, res, 500, {
          success: false,
          message: "Failed to create referral. Please try again.",
          error:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }
    }

    // Admin: Get all referrers
    if (req.method === "GET" && act === "admin-referrers") {
      const referrers = await getReferrers();
      return sendJson(req, res, 200, {
        success: true,
        referrers,
      });
    }

    // Admin: Update referral status
    if (req.method === "PUT" && act === "update-referral") {
      const { id, status, commissionAmount } = body;
      if (!id) {
        return sendJson(req, res, 400, {
          success: false,
          message: "Referral ID is required",
        });
      }

      const updates = {};
      if (status) updates.status = status;
      if (commissionAmount !== undefined)
        updates.commission_amount = commissionAmount;

      const referral = await updateReferral(id, updates);
      return sendJson(req, res, 200, {
        success: true,
        referral,
      });
    }

    // Admin: Create payment
    if (req.method === "POST" && act === "create-payment") {
      const { referrerId, amount, paymentMethod, paymentDate } = body;
      if (!referrerId || !amount) {
        return sendJson(req, res, 400, {
          success: false,
          message: "Referrer ID and amount are required",
        });
      }

      const payment = await createPayment({
        referrer_id: referrerId,
        amount,
        payment_method: paymentMethod || "bank",
        payment_date: paymentDate || new Date().toISOString(),
        status: "completed",
      });

      return sendJson(req, res, 201, {
        success: true,
        payment,
      });
    }

    return sendJson(req, res, 400, {
      success: false,
      message:
        "Invalid action. Use: signup, referrer, referrals, payments, create, admin-referrers, update-referral, create-payment",
    });
  } catch (error) {
    console.error("Referral API error:", error);
    return sendJson(req, res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

// Calculate commission based on system size and type
function calculateCommission(systemSize, systemType) {
  // Default commission structure (you can customize this)
  // Example: 2% of system value, minimum ₱1,000, maximum ₱50,000
  const systemValue = parseFloat(systemSize) * 100000; // Assuming ₱100k per kW
  const commissionRate = 0.02; // 2%
  let commission = systemValue * commissionRate;

  // Minimum and maximum limits
  commission = Math.max(1000, Math.min(50000, commission));

  return Math.round(commission);
}

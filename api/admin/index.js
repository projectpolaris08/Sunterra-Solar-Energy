// Consolidated Admin API endpoint
// Handles all admin operations: clients, notifications, appointments, reports, settings
import { setCorsHeaders, handleOptions } from "../lib/cors.js";
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
} from "../lib/admin-database.js";

function sendJson(req, res, statusCode, data) {
  setCorsHeaders(req, res);
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
    const { resource, action, ...queryParams } = req.query;
    const body = req.body || {};

    // Route based on resource parameter
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
          message: "Invalid resource. Use: clients, notifications, appointments, reports, or settings",
        });
    }
  } catch (error) {
    console.error("Error in admin API:", error);
    return sendJson(req, res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

// Clients handlers
async function handleClients(req, res, action, queryParams, body) {
  if (req.method === "GET") {
    const clients = await getClients();
    return sendJson(req, res, 200, {
      success: true,
      clients,
      count: clients.length,
    });
  }

  if (req.method === "POST") {
    if (action === "create") {
      const client = await createClientRecord(body);
      return sendJson(req, res, 201, {
        success: true,
        client,
      });
    }
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const { id, ...clientData } = body;
    if (!id) {
      return sendJson(req, res, 400, {
        success: false,
        message: "Client ID is required",
      });
    }
    const client = await updateClient(id, clientData);
    return sendJson(req, res, 200, {
      success: true,
      client,
    });
  }

  if (req.method === "DELETE") {
    const id = queryParams.id || body.id;
    if (!id) {
      return sendJson(req, res, 400, {
        success: false,
        message: "Client ID is required",
      });
    }
    await deleteClient(id);
    return sendJson(req, res, 200, {
      success: true,
      message: "Client deleted successfully",
    });
  }

  return sendJson(req, res, 405, {
    success: false,
    message: "Method not allowed",
  });
}

// Notifications handlers
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
      return sendJson(req, res, 200, {
        success: true,
        notification,
      });
    }

    // Create new notification
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

// Appointments handlers
async function handleAppointments(req, res, action, queryParams, body) {
  if (req.method === "GET") {
    const startDate = queryParams.startDate;
    const endDate = queryParams.endDate;
    const appointments = await getAppointments(startDate, endDate);
    return sendJson(req, res, 200, {
      success: true,
      appointments,
      count: appointments.length,
    });
  }

  if (req.method === "POST") {
    const appointment = await createAppointment(body);
    return sendJson(req, res, 201, {
      success: true,
      appointment,
    });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const { id, ...appointmentData } = body;
    if (!id) {
      return sendJson(req, res, 400, {
        success: false,
        message: "Appointment ID is required",
      });
    }
    const appointment = await updateAppointment(id, appointmentData);
    return sendJson(req, res, 200, {
      success: true,
      appointment,
    });
  }

  if (req.method === "DELETE") {
    const id = queryParams.id || body.id;
    if (!id) {
      return sendJson(req, res, 400, {
        success: false,
        message: "Appointment ID is required",
      });
    }
    await deleteAppointment(id);
    return sendJson(req, res, 200, {
      success: true,
      message: "Appointment deleted successfully",
    });
  }

  return sendJson(req, res, 405, {
    success: false,
    message: "Method not allowed",
  });
}

// Reports handlers
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
    return sendJson(req, res, 201, {
      success: true,
      report,
    });
  }

  return sendJson(req, res, 405, {
    success: false,
    message: "Method not allowed",
  });
}

// Settings handlers
async function handleSettings(req, res, action, queryParams, body) {
  if (req.method === "GET") {
    const settings = await getSettings();
    return sendJson(req, res, 200, {
      success: true,
      settings,
    });
  }

  if (req.method === "PUT" || req.method === "PATCH" || req.method === "POST") {
    const settings = await updateSettings(body);
    return sendJson(req, res, 200, {
      success: true,
      settings,
    });
  }

  return sendJson(req, res, 405, {
    success: false,
    message: "Method not allowed",
  });
}


// Admin Notifications API endpoint
// Handles notification operations

import { setCorsHeaders, handleOptions } from "../lib/cors.js";
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
} from "../lib/admin-database.js";

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
    // GET - Get notifications
    if (req.method === "GET") {
      const limit = parseInt(req.query.limit || "50", 10);
      const notifications = await getNotifications(limit);
      return sendJson(res, 200, {
        success: true,
        notifications,
        count: notifications.length,
      });
    }

    // POST - Create new notification or mark as read
    if (req.method === "POST") {
      const { action, ...data } = req.body;

      if (action === "mark_read" && data.id) {
        const notification = await markNotificationAsRead(data.id);
        return sendJson(res, 200, {
          success: true,
          notification,
        });
      }

      // Create new notification
      const newNotification = await createNotification(data);
      return sendJson(res, 201, {
        success: true,
        notification: newNotification,
      });
    }

    // Method not allowed
    return sendJson(res, 405, {
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Error in notifications API:", error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}


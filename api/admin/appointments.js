// Admin Appointments API endpoint
// Handles CRUD operations for appointments

import { setCorsHeaders, handleOptions } from "../lib/cors.js";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
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
    // GET - Get appointments (optionally filtered by date range)
    if (req.method === "GET") {
      const { startDate, endDate } = req.query;
      const appointments = await getAppointments(startDate, endDate);
      return sendJson(res, 200, {
        success: true,
        appointments,
        count: appointments.length,
      });
    }

    // POST - Create new appointment
    if (req.method === "POST") {
      const appointmentData = req.body;
      const newAppointment = await createAppointment(appointmentData);
      return sendJson(res, 201, {
        success: true,
        appointment: newAppointment,
      });
    }

    // PUT - Update appointment
    if (req.method === "PUT") {
      const { id, ...appointmentData } = req.body;
      if (!id) {
        return sendJson(res, 400, {
          success: false,
          message: "Appointment ID is required",
        });
      }
      const updatedAppointment = await updateAppointment(id, appointmentData);
      if (!updatedAppointment) {
        return sendJson(res, 404, {
          success: false,
          message: "Appointment not found",
        });
      }
      return sendJson(res, 200, {
        success: true,
        appointment: updatedAppointment,
      });
    }

    // DELETE - Delete appointment
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return sendJson(res, 400, {
          success: false,
          message: "Appointment ID is required",
        });
      }
      await deleteAppointment(parseInt(id));
      return sendJson(res, 200, {
        success: true,
        message: "Appointment deleted successfully",
      });
    }

    // Method not allowed
    return sendJson(res, 405, {
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Error in appointments API:", error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}


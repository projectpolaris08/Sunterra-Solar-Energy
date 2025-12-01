// Admin Clients API endpoint
// Handles CRUD operations for clients

import { setCorsHeaders, handleOptions } from "../lib/cors.js";
import {
  getClients,
  createClientRecord,
  updateClient,
  deleteClient,
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
    // GET - Get all clients
    if (req.method === "GET") {
      const clients = await getClients();
      return sendJson(res, 200, {
        success: true,
        clients,
        count: clients.length,
      });
    }

    // POST - Create new client
    if (req.method === "POST") {
      const clientData = req.body;
      const newClient = await createClientRecord(clientData);
      return sendJson(res, 201, {
        success: true,
        client: newClient,
      });
    }

    // PUT - Update client
    if (req.method === "PUT") {
      const { id, ...clientData } = req.body;
      if (!id) {
        return sendJson(res, 400, {
          success: false,
          message: "Client ID is required",
        });
      }
      const updatedClient = await updateClient(id, clientData);
      if (!updatedClient) {
        return sendJson(res, 404, {
          success: false,
          message: "Client not found",
        });
      }
      return sendJson(res, 200, {
        success: true,
        client: updatedClient,
      });
    }

    // DELETE - Delete client
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return sendJson(res, 400, {
          success: false,
          message: "Client ID is required",
        });
      }
      await deleteClient(parseInt(id));
      return sendJson(res, 200, {
        success: true,
        message: "Client deleted successfully",
      });
    }

    // Method not allowed
    return sendJson(res, 405, {
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Error in clients API:", error);
    return sendJson(res, 500, {
      success: false,
      message: error.message || "Internal server error",
    });
  }
}


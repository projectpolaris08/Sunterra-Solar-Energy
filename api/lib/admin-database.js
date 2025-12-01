// Supabase database utilities for admin features
// Handles clients, appointments, reports, notifications, and settings

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase credentials not configured. Admin features will use in-memory fallback."
  );
}

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// In-memory fallback storage (for development/testing)
const memoryStorage = {
  clients: [],
  appointments: [],
  reports: [],
  notifications: [],
  settings: {},
};

// ==================== CLIENTS ====================
export async function getClients() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("join_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get clients from Supabase:", error);
      return memoryStorage.clients;
    }
  }
  return memoryStorage.clients;
}

export async function createClientRecord(clientData) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          client_name: clientData.clientName,
          email: clientData.email,
          phone: clientData.phone,
          location: clientData.location,
          project_amount: clientData.projectAmount,
          project_date: clientData.date,
          inverter: clientData.inverter,
          solar_panels_pcs: clientData.solarPanelsPcs,
          solar_panels_wattage: clientData.solarPanelsWattage,
          battery_type: clientData.batteryType,
          battery_pcs: clientData.batteryPcs,
          facebook_name: clientData.facebookName,
          visitation_date: clientData.visitationDate,
          notes: clientData.notes,
          join_date: clientData.joinDate || new Date().toISOString().split("T")[0],
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to create client in Supabase:", error);
      // Fallback to memory
      const newClient = {
        id: memoryStorage.clients.length + 1,
        ...clientData,
        joinDate: clientData.joinDate || new Date().toISOString().split("T")[0],
      };
      memoryStorage.clients.push(newClient);
      return newClient;
    }
  }
  // Fallback to memory
  const newClient = {
    id: memoryStorage.clients.length + 1,
    ...clientData,
    joinDate: clientData.joinDate || new Date().toISOString().split("T")[0],
  };
  memoryStorage.clients.push(newClient);
  return newClient;
}

export async function updateClient(id, clientData) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("clients")
        .update({
          client_name: clientData.clientName,
          email: clientData.email,
          phone: clientData.phone,
          location: clientData.location,
          project_amount: clientData.projectAmount,
          project_date: clientData.date,
          inverter: clientData.inverter,
          solar_panels_pcs: clientData.solarPanelsPcs,
          solar_panels_wattage: clientData.solarPanelsWattage,
          battery_type: clientData.batteryType,
          battery_pcs: clientData.batteryPcs,
          facebook_name: clientData.facebookName,
          visitation_date: clientData.visitationDate,
          notes: clientData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to update client in Supabase:", error);
      // Fallback to memory
      const index = memoryStorage.clients.findIndex((c) => c.id === id);
      if (index !== -1) {
        memoryStorage.clients[index] = { ...memoryStorage.clients[index], ...clientData };
        return memoryStorage.clients[index];
      }
      return null;
    }
  }
  // Fallback to memory
  const index = memoryStorage.clients.findIndex((c) => c.id === id);
  if (index !== -1) {
    memoryStorage.clients[index] = { ...memoryStorage.clients[index], ...clientData };
    return memoryStorage.clients[index];
  }
  return null;
}

export async function deleteClient(id) {
  if (supabase) {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to delete client from Supabase:", error);
      // Fallback to memory
      memoryStorage.clients = memoryStorage.clients.filter((c) => c.id !== id);
      return true;
    }
  }
  // Fallback to memory
  memoryStorage.clients = memoryStorage.clients.filter((c) => c.id !== id);
  return true;
}

// ==================== APPOINTMENTS ====================
export async function getAppointments(startDate, endDate) {
  if (supabase) {
    try {
      let query = supabase.from("appointments").select("*");

      if (startDate && endDate) {
        query = query.gte("date", startDate).lte("date", endDate);
      }

      const { data, error } = await query.order("date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get appointments from Supabase:", error);
      return memoryStorage.appointments;
    }
  }
  return memoryStorage.appointments;
}

export async function createAppointment(appointmentData) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          client_name: appointmentData.clientName,
          date: appointmentData.date,
          time: appointmentData.time,
          location: appointmentData.location,
          notes: appointmentData.notes,
          type: appointmentData.type,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to create appointment in Supabase:", error);
      // Fallback to memory
      const newAppointment = {
        id: memoryStorage.appointments.length + 1,
        ...appointmentData,
      };
      memoryStorage.appointments.push(newAppointment);
      return newAppointment;
    }
  }
  // Fallback to memory
  const newAppointment = {
    id: memoryStorage.appointments.length + 1,
    ...appointmentData,
  };
  memoryStorage.appointments.push(newAppointment);
  return newAppointment;
}

export async function updateAppointment(id, appointmentData) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          client_name: appointmentData.clientName,
          date: appointmentData.date,
          time: appointmentData.time,
          location: appointmentData.location,
          notes: appointmentData.notes,
          type: appointmentData.type,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to update appointment in Supabase:", error);
      // Fallback to memory
      const index = memoryStorage.appointments.findIndex((a) => a.id === id);
      if (index !== -1) {
        memoryStorage.appointments[index] = {
          ...memoryStorage.appointments[index],
          ...appointmentData,
        };
        return memoryStorage.appointments[index];
      }
      return null;
    }
  }
  // Fallback to memory
  const index = memoryStorage.appointments.findIndex((a) => a.id === id);
  if (index !== -1) {
    memoryStorage.appointments[index] = {
      ...memoryStorage.appointments[index],
      ...appointmentData,
    };
    return memoryStorage.appointments[index];
  }
  return null;
}

export async function deleteAppointment(id) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to delete appointment from Supabase:", error);
      // Fallback to memory
      memoryStorage.appointments = memoryStorage.appointments.filter(
        (a) => a.id !== id
      );
      return true;
    }
  }
  // Fallback to memory
  memoryStorage.appointments = memoryStorage.appointments.filter(
    (a) => a.id !== id
  );
  return true;
}

// ==================== REPORTS ====================
export async function getReports() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get reports from Supabase:", error);
      return memoryStorage.reports;
    }
  }
  return memoryStorage.reports;
}

export async function createReport(reportData) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("reports")
        .insert({
          name: reportData.name,
          type: reportData.type,
          status: reportData.status || "ready",
          data: reportData.data,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to create report in Supabase:", error);
      // Fallback to memory
      const newReport = {
        id: memoryStorage.reports.length + 1,
        ...reportData,
        status: reportData.status || "ready",
      };
      memoryStorage.reports.push(newReport);
      return newReport;
    }
  }
  // Fallback to memory
  const newReport = {
    id: memoryStorage.reports.length + 1,
    ...reportData,
    status: reportData.status || "ready",
  };
  memoryStorage.reports.push(newReport);
  return newReport;
}

// ==================== NOTIFICATIONS ====================
export async function getNotifications(limit = 50) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get notifications from Supabase:", error);
      return memoryStorage.notifications;
    }
  }
  return memoryStorage.notifications;
}

export async function createNotification(notificationData) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          read: notificationData.read || false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to create notification in Supabase:", error);
      // Fallback to memory
      const newNotification = {
        id: memoryStorage.notifications.length + 1,
        ...notificationData,
        read: notificationData.read || false,
      };
      memoryStorage.notifications.push(newNotification);
      return newNotification;
    }
  }
  // Fallback to memory
  const newNotification = {
    id: memoryStorage.notifications.length + 1,
    ...notificationData,
    read: notificationData.read || false,
  };
  memoryStorage.notifications.push(newNotification);
  return newNotification;
}

export async function markNotificationAsRead(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to mark notification as read in Supabase:", error);
      // Fallback to memory
      const notification = memoryStorage.notifications.find((n) => n.id === id);
      if (notification) {
        notification.read = true;
      }
      return notification;
    }
  }
  // Fallback to memory
  const notification = memoryStorage.notifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
  }
  return notification;
}

// ==================== SETTINGS ====================
export async function getSettings() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" - that's okay for first time
        throw error;
      }
      return data || {};
    } catch (error) {
      console.error("Failed to get settings from Supabase:", error);
      return memoryStorage.settings;
    }
  }
  return memoryStorage.settings;
}

export async function updateSettings(settingsData) {
  if (supabase) {
    try {
      // Try to update first, if not exists, insert
      const { data: existing } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from("settings")
          .update({
            ...settingsData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("settings")
          .insert({
            ...settingsData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error("Failed to update settings in Supabase:", error);
      // Fallback to memory
      memoryStorage.settings = { ...memoryStorage.settings, ...settingsData };
      return memoryStorage.settings;
    }
  }
  // Fallback to memory
  memoryStorage.settings = { ...memoryStorage.settings, ...settingsData };
  return memoryStorage.settings;
}


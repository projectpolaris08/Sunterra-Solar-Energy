// Supabase storage utilities for serverless monitoring
// Handles alerts, error codes, and device history

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase credentials not configured. Using in-memory fallback."
  );
}

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// In-memory fallback storage (for development/testing)
const memoryStorage = {
  alerts: [],
  errorCodes: new Map(),
  deviceHistory: [],
  deviceBaselines: new Map(),
};

// Alert storage
export async function saveAlert(alert) {
  if (supabase) {
    try {
      const { error } = await supabase.from("monitoring_alerts").insert({
        type: alert.type,
        severity: alert.severity,
        device_sn: alert.deviceSn,
        station_id: alert.stationId,
        message: alert.message,
        error_code: alert.errorCode,
        data: alert.data,
        ai_recommendation: alert.aiRecommendation,
        recipient_email: alert.recipientEmail,
        sent: alert.sent !== false,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to save alert to Supabase:", error);
      // Fallback to memory
      memoryStorage.alerts.push({ ...alert, timestamp: Date.now() });
      return true;
    }
  } else {
    memoryStorage.alerts.push({ ...alert, timestamp: Date.now() });
    return true;
  }
}

export async function getAlerts(limit = 100) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("monitoring_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((alert) => ({
        ...alert,
        deviceSn: alert.device_sn,
        stationId: alert.station_id,
        errorCode: alert.error_code,
        aiRecommendation: alert.ai_recommendation,
        recipientEmail: alert.recipient_email,
        timestamp: new Date(alert.created_at).getTime(),
      }));
    } catch (error) {
      console.error("Failed to get alerts from Supabase:", error);
      // Fallback to memory
      return memoryStorage.alerts.slice(-limit).reverse();
    }
  } else {
    return memoryStorage.alerts.slice(-limit).reverse();
  }
}

export async function checkRecentAlert(deviceSn, type, cooldownMs = 3600000) {
  if (supabase) {
    try {
      const cooldownTime = new Date(Date.now() - cooldownMs).toISOString();
      const { data, error } = await supabase
        .from("monitoring_alerts")
        .select("created_at")
        .eq("device_sn", deviceSn)
        .eq("type", type)
        .gte("created_at", cooldownTime)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error("Failed to check recent alert:", error);
      // Fallback to memory
      const recent = memoryStorage.alerts.find(
        (a) =>
          a.deviceSn === deviceSn &&
          a.type === type &&
          Date.now() - a.timestamp < cooldownMs
      );
      return !!recent;
    }
  } else {
    const recent = memoryStorage.alerts.find(
      (a) =>
        a.deviceSn === deviceSn &&
        a.type === type &&
        Date.now() - a.timestamp < cooldownMs
    );
    return !!recent;
  }
}

// Error code storage
export async function saveErrorCode(errorCode, explanation) {
  if (supabase) {
    try {
      const { error } = await supabase.from("error_codes").upsert(
        {
          code: errorCode.toString(),
          name: explanation.name,
          severity: explanation.severity,
          cause: explanation.cause,
          explanation: explanation.explanation,
          troubleshooting: explanation.troubleshooting,
          requires_onsite: explanation.requiresOnsite,
          owner_can_fix: explanation.ownerCanFix,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "code",
        }
      );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to save error code to Supabase:", error);
      // Fallback to memory
      memoryStorage.errorCodes.set(errorCode, explanation);
      return true;
    }
  } else {
    memoryStorage.errorCodes.set(errorCode, explanation);
    return true;
  }
}

export async function getErrorCode(errorCode) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("error_codes")
        .select("*")
        .eq("code", errorCode.toString())
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found

      if (data) {
        return {
          code: data.code,
          name: data.name,
          severity: data.severity,
          cause: data.cause,
          explanation: data.explanation,
          troubleshooting: data.troubleshooting,
          requiresOnsite: data.requires_onsite,
          ownerCanFix: data.owner_can_fix,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to get error code from Supabase:", error);
      // Fallback to memory
      return memoryStorage.errorCodes.get(errorCode) || null;
    }
  } else {
    return memoryStorage.errorCodes.get(errorCode) || null;
  }
}

export async function getAllErrorCodes() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("error_codes")
        .select("*")
        .order("code");

      if (error) throw error;

      return data.map((item) => ({
        code: item.code,
        name: item.name,
        severity: item.severity,
        cause: item.cause,
        explanation: item.explanation,
        troubleshooting: item.troubleshooting,
        requiresOnsite: item.requires_onsite,
        ownerCanFix: item.owner_can_fix,
      }));
    } catch (error) {
      console.error("Failed to get error codes from Supabase:", error);
      // Fallback to memory
      return Array.from(memoryStorage.errorCodes.values());
    }
  } else {
    return Array.from(memoryStorage.errorCodes.values());
  }
}

// Device history storage
export async function saveDeviceHistory(entry) {
  if (supabase) {
    try {
      const { error } = await supabase.from("device_history").insert({
        device_sn: entry.deviceSn,
        device_type: entry.deviceType,
        device_state: entry.deviceState,
        station_id: entry.stationId,
        data: entry.data,
        generation_power: entry.generationPower,
        consumption_power: entry.consumptionPower,
        battery_soc: entry.batterySOC,
        efficiency: entry.efficiency,
        error_code: entry.errorCode,
        created_at: new Date(entry.timestamp).toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to save device history to Supabase:", error);
      // Fallback to memory
      memoryStorage.deviceHistory.push(entry);
      // Keep only last 30 days
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      memoryStorage.deviceHistory = memoryStorage.deviceHistory.filter(
        (e) => e.timestamp > thirtyDaysAgo
      );
      return true;
    }
  } else {
    memoryStorage.deviceHistory.push(entry);
    // Keep only last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    memoryStorage.deviceHistory = memoryStorage.deviceHistory.filter(
      (e) => e.timestamp > thirtyDaysAgo
    );
    return true;
  }
}

export async function getDeviceHistory(deviceSn, days = 30) {
  if (supabase) {
    try {
      const since = new Date(
        Date.now() - days * 24 * 60 * 60 * 1000
      ).toISOString();
      const { data, error } = await supabase
        .from("device_history")
        .select("*")
        .eq("device_sn", deviceSn)
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data.map((entry) => ({
        timestamp: new Date(entry.created_at).getTime(),
        deviceSn: entry.device_sn,
        deviceType: entry.device_type,
        deviceState: entry.device_state,
        stationId: entry.station_id,
        data: entry.data,
        generationPower: entry.generation_power,
        consumptionPower: entry.consumption_power,
        batterySOC: entry.battery_soc,
        efficiency: entry.efficiency,
        errorCode: entry.error_code,
      }));
    } catch (error) {
      console.error("Failed to get device history from Supabase:", error);
      // Fallback to memory
      const since = Date.now() - days * 24 * 60 * 60 * 1000;
      return memoryStorage.deviceHistory.filter(
        (e) => e.deviceSn === deviceSn && e.timestamp > since
      );
    }
  } else {
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    return memoryStorage.deviceHistory.filter(
      (e) => e.deviceSn === deviceSn && e.timestamp > since
    );
  }
}

// Device baseline storage
export async function getDeviceBaseline(deviceSn) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("device_baselines")
        .select("*")
        .eq("device_sn", deviceSn)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        return {
          voltage: data.voltage,
          frequency: data.frequency,
          temperature: data.temperature,
          production: data.production,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to get device baseline:", error);
      return memoryStorage.deviceBaselines.get(deviceSn) || null;
    }
  } else {
    return memoryStorage.deviceBaselines.get(deviceSn) || null;
  }
}

export async function updateDeviceBaseline(deviceSn, baseline) {
  if (supabase) {
    try {
      const { error } = await supabase.from("device_baselines").upsert(
        {
          device_sn: deviceSn,
          voltage: baseline.voltage,
          frequency: baseline.frequency,
          temperature: baseline.temperature,
          production: baseline.production,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "device_sn",
        }
      );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to update device baseline:", error);
      memoryStorage.deviceBaselines.set(deviceSn, baseline);
      return true;
    }
  } else {
    memoryStorage.deviceBaselines.set(deviceSn, baseline);
    return true;
  }
}

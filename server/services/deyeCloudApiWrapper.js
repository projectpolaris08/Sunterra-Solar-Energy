// Deye Cloud API Wrapper for Backend
// Provides the same interface as the frontend API but runs on the server

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeyeCloudApiWrapper {
  constructor(baseUrl, appId, appSecret) {
    this.baseUrl = baseUrl;
    this.appId = appId;
    this.appSecret = appSecret;
    this.accessToken = null;
    this.tokenExpiry = 0;
  }

  async getAccessToken() {
    // This will be handled by the main server's authentication
    // For now, we'll use the proxy endpoint
    return "Bearer token managed by server";
  }

  async request(endpoint, options = {}) {
    // Use the server's proxy endpoint
    const PROXY_URL = `http://localhost:${process.env.PORT || 3001}/api/deye`;

    const body = options.body
      ? typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body)
      : JSON.stringify({});

    // Use dynamic import for fetch if not available (Node 18+ has fetch built-in)
    const fetchFn =
      typeof fetch !== "undefined"
        ? fetch
        : (await import("node-fetch")).default;

    const response = await fetchFn(`${PROXY_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { msg: errorText || response.statusText };
      }
      throw new Error(
        `API request failed: ${errorData.msg || response.statusText}`
      );
    }

    const data = await response.json();

    // Check for success - Deye Cloud uses code: 1000000 for success
    const code =
      typeof data.code === "string" ? parseInt(data.code, 10) : data.code;
    if (data.code !== undefined && code !== 1000000) {
      throw new Error(`API error: ${data.msg || "Unknown error"}`);
    }

    return data;
  }

  async getStationList(page = 1, size = 50) {
    return this.request("/v1.0/station/list", {
      method: "POST",
      body: JSON.stringify({ page, size }),
    });
  }

  async getStationListWithDevices(page = 1, size = 20, deviceType = null) {
    const body = { page, size };
    if (deviceType) body.deviceType = deviceType;

    return this.request("/v1.0/station/listWithDevice", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getStationLatest(stationId) {
    return this.request("/v1.0/station/latest", {
      method: "POST",
      body: JSON.stringify({ stationId }),
    });
  }

  async getDeviceLatestData(deviceSns) {
    if (deviceSns.length > 10) {
      throw new Error("Maximum 10 devices per batch");
    }
    return this.request("/v1.0/device/latest", {
      method: "POST",
      body: JSON.stringify({ deviceList: deviceSns }),
    });
  }
}

export default DeyeCloudApiWrapper;

// Serverless Deye Cloud API Wrapper
// Works in Vercel serverless functions

import crypto from "crypto";

export class DeyeCloudApi {
  constructor() {
    this.baseUrl =
      process.env.DEYE_BASE_URL || "https://eu1-developer.deyecloud.com:443";
    this.appId = process.env.DEYE_APP_ID;
    this.appSecret = process.env.DEYE_APP_SECRET;
    this.email = process.env.DEYE_EMAIL;
    this.password = process.env.DEYE_PASSWORD;

    // Token cache (will be reset on each function invocation, but helps within same execution)
    this.accessToken = null;
    this.tokenExpiry = 0;
  }

  sha256(message) {
    return crypto.createHash("sha256").update(message).digest("hex");
  }

  async authenticate() {
    if (!this.email || !this.password || !this.appId || !this.appSecret) {
      throw new Error("Deye Cloud credentials not configured");
    }

    const encryptedPassword = this.sha256(this.password);

    const response = await fetch(
      `${this.baseUrl}/v1.0/account/token?appId=${this.appId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appSecret: this.appSecret,
          email: this.email,
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

    this.accessToken = `Bearer ${data.accessToken}`;
    const expiresInMs = (data.expiresIn || 7200) * 1000;
    this.tokenExpiry = Date.now() + expiresInMs - 300000; // 5 min buffer

    return this.accessToken;
  }

  async getAccessToken() {
    const bufferTime = 60000; // 1 minute buffer
    if (this.accessToken && Date.now() < this.tokenExpiry - bufferTime) {
      return this.accessToken.startsWith("Bearer ")
        ? this.accessToken
        : `Bearer ${this.accessToken}`;
    }

    return await this.authenticate();
  }

  async request(endpoint, options = {}) {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method || "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { msg: errorText || response.statusText };
      }

      // Check for auth errors
      const errorCode =
        typeof errorData.code === "string"
          ? parseInt(errorData.code, 10)
          : errorData.code;
      const isAuthError =
        response.status === 401 ||
        errorCode === 2101019 ||
        errorData.msg?.toLowerCase().includes("token") ||
        errorData.msg?.toLowerCase().includes("auth");

      if (isAuthError) {
        // Retry with fresh token
        this.accessToken = null;
        this.tokenExpiry = 0;
        const newToken = await this.authenticate();

        const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
          method: options.method || "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: newToken,
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text();
          throw new Error(`API request failed: ${retryErrorText}`);
        }

        const retryData = await retryResponse.json();
        const retryCode =
          typeof retryData.code === "string"
            ? parseInt(retryData.code, 10)
            : retryData.code;

        if (retryCode !== 1000000) {
          throw new Error(`API error: ${retryData.msg || "Unknown error"}`);
        }

        return retryData;
      }

      throw new Error(
        `API request failed: ${errorData.msg || response.statusText}`
      );
    }

    const data = await response.json();
    const responseCode =
      typeof data.code === "string" ? parseInt(data.code, 10) : data.code;

    if (data.code !== undefined && responseCode !== 1000000) {
      throw new Error(`API error: ${data.msg || "Unknown error"}`);
    }

    return data;
  }

  async getStationListWithDevices(page = 1, size = 50, deviceType = null) {
    const body = { page, size };
    if (deviceType) body.deviceType = deviceType;

    return this.request("/v1.0/station/listWithDevice", {
      method: "POST",
      body,
    });
  }

  async getStationLatest(stationId) {
    return this.request("/v1.0/station/latest", {
      method: "POST",
      body: { stationId },
    });
  }

  async getDeviceLatestData(deviceSns) {
    if (deviceSns.length > 10) {
      throw new Error("Maximum 10 devices per batch");
    }
    return this.request("/v1.0/device/latest", {
      method: "POST",
      body: { deviceList: deviceSns },
    });
  }
}

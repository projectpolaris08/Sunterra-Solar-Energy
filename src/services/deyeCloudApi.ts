// Deye Cloud API Service
// Using backend proxy to avoid CORS issues
// Backend proxy URL from environment variable

import { DEYE_PROXY_URL } from "../config/api";

const PROXY_URL = DEYE_PROXY_URL;

class DeyeCloudApi {
  // Get or refresh access token (handled by backend proxy)
  async getAccessToken(): Promise<string> {
    // Token management is now handled by the backend proxy
    return "Bearer token managed by backend";
  }

  // Authenticate and get access token (handled by backend proxy)
  async authenticate(): Promise<string> {
    // Authentication is now handled by the backend proxy
    // This method is kept for compatibility but tokens are managed server-side
    return "Bearer token managed by backend";
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string> {
    // Implementation would depend on Deye Cloud's refresh token endpoint
    // For now, we'll re-authenticate
    return await this.authenticate();
  }

  // Make authenticated API request through backend proxy
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Use backend proxy to avoid CORS issues
    // The proxy handles authentication automatically
    const body = options.body
      ? typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body)
      : JSON.stringify({});

    const response = await fetch(`${PROXY_URL}${endpoint}`, {
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
    // The code can be either a string "1000000" or number 1000000
    const code =
      typeof data.code === "string" ? parseInt(data.code, 10) : data.code;
    if (data.code !== undefined && code !== 1000000) {
      throw new Error(`API error: ${data.msg || "Unknown error"}`);
    }

    // Also check success field if it exists (only if it's explicitly false)
    if (data.success === false && code !== 1000000) {
      throw new Error(`API error: ${data.msg || "Unknown error"}`);
    }

    // Return the data directly (it may already be the response structure)
    return data as T;
  }

  // Get account/organization info
  async getAccountInfo() {
    return this.request("/v1.0/account/info", {
      method: "POST",
    });
  }

  // Get station list with pagination
  async getStationList(page: number = 1, size: number = 50) {
    return this.request<{
      stationList: Array<{
        id: number;
        name: string;
        locationLat: number;
        locationLng: number;
        locationAddress: string;
        regionNationId: number;
        regionTimezone: string;
        gridInterconnectionType: string;
        installedCapacity: number;
        startOperatingTime: number;
        createdDate: number;
        batterySOC: number;
        connectionStatus: string;
        generationPower: number;
        lastUpdateTime: number;
        contactPhone: string;
        ownerName: string | null;
      }>;
      total: number;
    }>("/v1.0/station/list", {
      method: "POST",
      body: JSON.stringify({ page, size }),
    });
  }

  // Get station list with devices
  async getStationListWithDevices(
    page: number = 1,
    size: number = 20,
    deviceType?: string
  ) {
    const body: any = { page, size };
    if (deviceType) body.deviceType = deviceType;

    return this.request<{
      stationList: Array<{
        id: number;
        name: string;
        locationAddress: string;
        locationLat: number;
        locationLng: number;
        installedCapacity: number;
        gridInterconnectionType: string;
        regionTimezone: string;
        contactPhone: string;
        ownerName: string;
        createdDate: string;
        startOperatingTime: string;
        type: string;
        deviceTotal: number;
        deviceListItems: Array<{
          deviceId: number;
          deviceSn: string;
          deviceType: string;
          stationId: number;
          productId: string;
          connectStatus: string;
          collectionTime: number;
        }>;
      }>;
      stationTotal: number;
    }>("/v1.0/station/listWithDevice", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // Get devices for specific stations (batch, up to 10 stations)
  async getStationDevices(
    stationIds: number[],
    page: number = 1,
    size: number = 20
  ) {
    if (stationIds.length > 10) {
      throw new Error("Maximum 10 stations per batch");
    }
    return this.request<{
      deviceListItems: Array<{
        deviceSn: string;
        deviceType: string;
        stationId: number;
      }>;
      total: number;
    }>("/v1.0/station/device", {
      method: "POST",
      body: JSON.stringify({ stationIds, page, size }),
    });
  }

  // Get station latest/real-time data
  async getStationLatest(stationId: number) {
    return this.request<{
      generationPower: number;
      consumptionPower: number;
      gridPower: number;
      purchasePower: number;
      wirePower: number;
      chargePower: number;
      dischargePower: number;
      batteryPower: number;
      batterySOC: number;
      irradiateIntensity: number;
      lastUpdateTime: string;
    }>("/v1.0/station/latest", {
      method: "POST",
      body: JSON.stringify({ stationId }),
    });
  }

  // Get station historical data
  async getStationHistory(
    stationId: number,
    granularity: 1 | 2 | 3 | 4,
    startAt: string | number,
    endAt?: string | number
  ) {
    const body: any = {
      stationId,
      granularity,
      startAt,
    };
    if (endAt) body.endAt = endAt;

    return this.request<{
      stationDataItems: Array<{
        generationPower?: number;
        consumptionPower?: number;
        gridPower?: number;
        purchasePower?: number;
        wirePower?: number;
        chargePower?: number;
        dischargePower?: number;
        batteryPower?: number;
        batterySOC?: number;
        irradiateIntensity?: number;
        generationValue: number;
        consumptionValue: number;
        gridValue: number;
        purchaseValue: number;
        chargeValue: number;
        dischargeValue: number;
        fullPowerHours: number;
        dateTime?: string;
        year?: number;
        month?: number;
        day?: number;
      }>;
      total: number;
    }>("/v1.0/station/history", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // Get station alerts
  async getStationAlerts(
    stationId: number,
    startTimestamp: number,
    endTimestamp: number,
    page: number = 1,
    size: number = 20
  ) {
    return this.request<{
      stationAlertItems: any[];
      total: number;
    }>("/v1.0/station/alertList", {
      method: "POST",
      body: JSON.stringify({
        stationId,
        startTimestamp,
        endTimestamp,
        page,
        size,
      }),
    });
  }

  // Create a new station
  async createStation(stationData: {
    name: string;
    locationAddress: string;
    locationLat: number;
    locationLng: number;
    region: {
      countryCode: string;
      timezone: string;
      nationId?: number;
      level1?: number;
      level2?: number;
      level3?: number;
      level4?: number;
      level5?: number;
    };
    type: string;
    installedCapacity: number;
    gridInterconnectionType: string;
    currency?: string;
    constructionCost?: number;
    contactPhone?: number;
    ownerName?: string;
    ownerCompany?: string;
    startOperatingTime?: string;
    installationAzimuthAngle?: number;
    installationTiltAngle?: number;
    mergeElectricPrice?: number;
    stationImage?: string;
  }) {
    return this.request<{
      id: number;
    }>("/v1.0/station/create", {
      method: "POST",
      body: JSON.stringify(stationData),
    });
  }

  // Get device list with pagination
  // Note: This endpoint may require business account permissions
  async getDeviceList(page: number = 1, size: number = 20) {
    try {
      return await this.request<{
        deviceList: Array<{
          deviceSn: string;
          deviceId: number;
          deviceType: string;
          deviceState: number;
          updateTime: number;
          productId: string;
        }>;
        total: number;
      }>("/v1.0/device/list", {
        method: "POST",
        body: JSON.stringify({ page, size }),
      });
    } catch (error) {
      // If device list fails, it might be a permissions issue
      // Try to get devices from stations instead
      throw error;
    }
  }

  // Get latest/real-time data for devices (up to 10 devices per batch)
  async getDeviceLatestData(deviceSns: string[]) {
    if (deviceSns.length > 10) {
      throw new Error("Maximum 10 devices per batch");
    }
    return this.request<{
      deviceDataList: Array<{
        collectionTime: number;
        dataList: Array<{
          key: string;
          unit: string;
          value: number | string;
        }>;
        deviceSn: string;
        deviceState: number;
        deviceType: string;
      }>;
    }>("/v1.0/device/latest", {
      method: "POST",
      body: JSON.stringify({ deviceList: deviceSns }),
    });
  }

  // Get device historical data
  // granularity: 1=daily, 2=day range, 3=monthly, 4=yearly
  async getDeviceHistory(
    deviceSn: string,
    granularity: 1 | 2 | 3 | 4,
    startAt: string,
    endAt?: string,
    measurePoints?: string[]
  ) {
    const body: any = {
      deviceSn,
      granularity,
      startAt,
    };
    if (endAt) body.endAt = endAt;
    if (measurePoints) body.measurePoints = measurePoints;

    return this.request<{
      dataList: Array<{
        collectionTime: string;
        itemList: Array<{
          key: string;
          value: string;
          unit: string;
          name: string;
        }>;
      }>;
      deviceId: number;
      deviceSn: string;
      deviceType: string;
      granularity: number;
    }>("/v1.0/device/history", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // Get device measure points (available data fields)
  async getDeviceMeasurePoints(deviceSn: string, deviceType: string) {
    return this.request<{
      measurePoints: string[];
      deviceSn: string;
      deviceType: string;
      productId: string;
    }>("/v1.0/device/measurePoints", {
      method: "POST",
      body: JSON.stringify({ deviceSn, deviceType }),
    });
  }

  // Get device alerts
  async getDeviceAlerts(
    deviceSn: string,
    startTimestamp: number,
    endTimestamp: number,
    page: number = 1,
    size: number = 20
  ) {
    return this.request<{
      alertList: Array<{
        alertCode: number;
        alertEndTime: number;
        alertId: string;
        alertName: string;
        alertStartTime: number;
        description: string;
        impact: number;
        level: number;
        protocolName: string;
        reason: string;
        solution: string;
        status: number;
      }>;
      deviceId: number;
      deviceSn: string;
      deviceType: string;
      total: number;
    }>("/v1.0/device/alertList", {
      method: "POST",
      body: JSON.stringify({
        deviceSn,
        startTimestamp,
        endTimestamp,
        page,
        size,
      }),
    });
  }

  // Register device to station
  async registerDevice(deviceSn: string, gatewaySn: string, stationId: number) {
    return this.request<{
      gatewayId: number;
    }>("/v1.0/device/register", {
      method: "POST",
      body: JSON.stringify({ deviceSn, gatewaySn, stationId }),
    });
  }

  // Strategy Operation - Dynamic Control
  async setDeviceStrategy(
    deviceSn: string,
    strategyData: {
      workMode?: "SELLING_FIRST" | "ZERO_EXPORT_TO_LOAD" | "ZERO_EXPORT_TO_CT";
      solarSellAction?: "on" | "off";
      gridChargeAction?: "on" | "off";
      gridChargeAmpere?: number;
      maxSellPower?: number;
      maxSolarPower?: number;
      zeroExportPower?: number;
      touAction?: "on" | "off";
      touDays?: Array<
        | "MONDAY"
        | "TUESDAY"
        | "WEDNESDAY"
        | "THURSDAY"
        | "FRIDAY"
        | "SATURDAY"
        | "SUNDAY"
      >;
      timeUseSettingItems?: Array<{
        time: string; // Format: "HH:mm" (e.g., "02:00")
        enableGeneration?: boolean;
        enableGridCharge?: boolean;
        power?: number;
        soc?: number;
        voltage?: number;
      }>;
    }
  ) {
    return this.request<{
      orderId: number;
      collectionTime: number;
      connectionStatus: number;
    }>("/v1.0/strategy/dynamicControl", {
      method: "POST",
      body: JSON.stringify({
        deviceSn,
        ...strategyData,
      }),
    });
  }
}

// Export singleton instance
export const deyeCloudApi = new DeyeCloudApi();

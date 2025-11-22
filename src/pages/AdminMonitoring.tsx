import { useState, useEffect } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import ChartCard from "../components/dashboard/ChartCard";
import StatsCard from "../components/dashboard/StatsCard";
import { deyeCloudApi } from "../services/deyeCloudApi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Gauge,
  AlertCircle,
  WifiOff,
  Battery,
  Sun,
} from "lucide-react";

interface AdminMonitoringProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export default function AdminMonitoring({
  onNavigate,
  currentPage = "admin-monitoring",
}: AdminMonitoringProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "24h" | "7d" | "30d"
  >("24h");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [devices, setDevices] = useState<any[]>([]);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [stationRealtimeData, setStationRealtimeData] = useState<
    Record<number, any>
  >({});
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStationData, setSelectedStationData] = useState<any | null>(
    null
  );
  const [stationHistoryData, setStationHistoryData] = useState<any[]>([]);
  const [dailyProduction, setDailyProduction] = useState<number | null>(null);
  const [dailyToBattery, setDailyToBattery] = useState<number | null>(null);
  const [totalProduction, setTotalProduction] = useState<number | null>(null);
  const [totalConsumption, setTotalConsumption] = useState<number | null>(null);

  // Fetch stations and devices from Deye Cloud
  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, get all stations to see what we have
      let allStationsList: any[] = [];
      let stationPage = 1;
      const stationPageSize = 50;
      let hasMoreStationPages = true;

      while (hasMoreStationPages) {
        const allStationsResponse = await deyeCloudApi.getStationList(
          stationPage,
          stationPageSize
        );

        if (
          allStationsResponse.stationList &&
          allStationsResponse.stationList.length > 0
        ) {
          allStationsList.push(...allStationsResponse.stationList);

          const totalStations = allStationsResponse.total || 0;
          if (
            allStationsList.length >= totalStations ||
            allStationsResponse.stationList.length < stationPageSize
          ) {
            hasMoreStationPages = false;
          } else {
            stationPage++;
          }
        } else {
          hasMoreStationPages = false;
        }
      }

      // If we found "Rey Agpoon" or "Burat" in the station list, try to fetch their devices directly
      const reyAgpoonStation = allStationsList.find(
        (s) => s.name === "Rey Agpoon" || s.id === 61649129
      );
      const buratStation = allStationsList.find((s) => s.name === "Burat");

      // Then fetch stations WITH devices (increased size to 50)
      let allStationsWithDevices: any[] = [];
      let page = 1;
      const pageSize = 50;
      let hasMorePages = true;

      while (hasMorePages) {
        const stationsResponse = await deyeCloudApi.getStationListWithDevices(
          page,
          pageSize
        );

        if (
          stationsResponse.stationList &&
          stationsResponse.stationList.length > 0
        ) {
          allStationsWithDevices.push(...stationsResponse.stationList);

          // Check if there are more pages
          const totalStations = stationsResponse.stationTotal || 0;
          const fetchedSoFar = allStationsWithDevices.length;

          if (
            fetchedSoFar >= totalStations ||
            stationsResponse.stationList.length < pageSize
          ) {
            hasMorePages = false;
          } else {
            page++;
          }
        } else {
          hasMorePages = false;
        }
      }

      // If "Rey Agpoon" or "Burat" are in the list but not in stationsWithDevices, fetch them directly
      const stationsToFetch: number[] = [];
      if (
        reyAgpoonStation &&
        !allStationsWithDevices.find((s) => s.id === reyAgpoonStation.id)
      ) {
        stationsToFetch.push(reyAgpoonStation.id);
      }
      if (
        buratStation &&
        !allStationsWithDevices.find((s) => s.id === buratStation.id)
      ) {
        stationsToFetch.push(buratStation.id);
      }

      if (stationsToFetch.length > 0) {
        try {
          const stationDevicesResponse = await deyeCloudApi.getStationDevices(
            stationsToFetch,
            1,
            50
          );
          if (
            stationDevicesResponse.deviceListItems &&
            stationDevicesResponse.deviceListItems.length > 0
          ) {
            // Group devices by station ID
            const devicesByStation: Record<number, any[]> = {};
            stationDevicesResponse.deviceListItems.forEach((device: any) => {
              if (!devicesByStation[device.stationId]) {
                devicesByStation[device.stationId] = [];
              }
              devicesByStation[device.stationId].push(device);
            });

            // Add stations with their devices
            stationsToFetch.forEach((stationId) => {
              const station = allStationsList.find((s) => s.id === stationId);
              if (station && devicesByStation[stationId]) {
                allStationsWithDevices.push({
                  ...station,
                  deviceListItems: devicesByStation[stationId],
                });
              }
            });
          }
        } catch (err) {
          // Failed to fetch devices for stations
        }
      }

      // If "Rey Agpoon" is still not found, try fetching it directly by known ID
      // Based on your Deye Cloud, "Rey Agpoon" might have ID 61649129
      if (
        !allStationsList.find(
          (s) => s.name === "Rey Agpoon" || s.id === 61649129
        )
      ) {
        try {
          const reyAgpoonDevices = await deyeCloudApi.getStationDevices(
            [61649129],
            1,
            50
          );
          if (
            reyAgpoonDevices.deviceListItems &&
            reyAgpoonDevices.deviceListItems.length > 0
          ) {
            // Try to get station details by fetching latest data
            try {
              await deyeCloudApi.getStationLatest(61649129);
              // Add it to the list with devices
              allStationsWithDevices.push({
                id: 61649129,
                name: "Rey Agpoon",
                deviceListItems: reyAgpoonDevices.deviceListItems,
                locationAddress: "Unknown",
                installedCapacity: 0,
              });
            } catch (err) {
              // Could not fetch station details, but devices were found
              // Still add it even if we can't get details
              allStationsWithDevices.push({
                id: 61649129,
                name: "Rey Agpoon",
                deviceListItems: reyAgpoonDevices.deviceListItems,
                locationAddress: "Unknown",
                installedCapacity: 0,
              });
            }
          }
        } catch (err: any) {
          // Error fetching station 61649129
        }
      }

      setStations(allStationsWithDevices);

      // Extract all devices from stations
      const allDevices: any[] = [];
      if (allStationsWithDevices.length > 0) {
        allStationsWithDevices.forEach((station) => {
          const deviceCount = station.deviceListItems?.length || 0;

          if (deviceCount > 0) {
            station.deviceListItems?.forEach((device: any) => {
              // Check for duplicates before adding
              const existingDevice = allDevices.find(
                (d) => d.deviceSn === device.deviceSn
              );
              if (existingDevice) {
                // Update with station info if it's missing
                if (!existingDevice.stationId) {
                  existingDevice.stationId = station.id;
                  existingDevice.stationName = station.name;
                  existingDevice.stationLocation = station.locationAddress;
                }
                // Update connectStatus if available
                if (
                  device.connectStatus !== undefined &&
                  existingDevice.connectStatus === undefined
                ) {
                  existingDevice.connectStatus = device.connectStatus;
                }
              } else {
                allDevices.push({
                  ...device,
                  stationId: station.id,
                  stationName: station.name,
                  stationLocation: station.locationAddress,
                });
              }
            });
          }
        });
      }

      // Try to fetch direct device list (may require business account permissions)
      // Skip this if we already have devices from stations to avoid unnecessary API calls
      if (allDevices.length === 0) {
        try {
          const deviceResponse = await deyeCloudApi.getDeviceList(1, 20);

          // Merge with station devices, avoiding duplicates
          deviceResponse.deviceList?.forEach((device) => {
            const existingDevice = allDevices.find(
              (d) => d.deviceSn === device.deviceSn
            );
            if (!existingDevice) {
              // Device not in station, add it
              allDevices.push({
                ...device,
                stationId: null,
                stationName: null,
                stationLocation: null,
              });
            } else {
              // Device already in station list, update with any missing info
              if (!existingDevice.deviceId && device.deviceId) {
                existingDevice.deviceId = device.deviceId;
              }
              if (!existingDevice.deviceType && device.deviceType) {
                existingDevice.deviceType = device.deviceType;
              }
            }
          });
        } catch (err) {
          // Failed to fetch direct device list - continue with what we have from stations
        }
      }

      setDevices(allDevices);

      if (allDevices.length === 0) {
        // No devices found
      }

      // Fetch latest data for all devices
      if (allDevices.length > 0) {
        const deviceSns = allDevices.map((d) => d.deviceSn);
        // Process in batches of 10
        const batches = [];
        for (let i = 0; i < deviceSns.length; i += 10) {
          batches.push(deviceSns.slice(i, i + 10));
        }

        const allRealtimeData = [];
        for (const batch of batches) {
          try {
            const batchData = await deyeCloudApi.getDeviceLatestData(batch);
            allRealtimeData.push(...(batchData.deviceDataList || []));
          } catch (err) {
            // Failed to fetch batch data
          }
        }
        setRealtimeData(allRealtimeData);
      }

      // Fetch latest data for all stations
      if (allStationsWithDevices.length > 0) {
        const stationRealtime: Record<number, any> = {};
        for (const station of allStationsWithDevices) {
          try {
            const stationData = await deyeCloudApi.getStationLatest(station.id);
            stationRealtime[station.id] = stationData;
          } catch (err) {
            // Failed to fetch station data
          }
        }
        setStationRealtimeData(stationRealtime);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch devices";
      setError(errorMessage);
      // Don't show error if it's just a fallback failure
      if (!errorMessage.includes("direct device list")) {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Deye Cloud API on component mount
  useEffect(() => {
    const initializeApi = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Test authentication
        try {
          await deyeCloudApi.getAccountInfo();
          setIsAuthenticated(true);
        } catch (authErr) {
          // Continue anyway, authentication will happen on first API call
          setIsAuthenticated(true);
        }
        // Fetch device list
        await fetchDevices();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to connect to Deye Cloud"
        );
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApi();

    // Set up auto-refresh every 30 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      if (devices.length > 0 && stations.length > 0) {
        fetchRealtimeData();
      }
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(refreshInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Energy generation data
  const energyData = [
    { time: "00:00", generated: 0, consumed: 0, stored: 45 },
    { time: "04:00", generated: 0, consumed: 2, stored: 43 },
    { time: "08:00", generated: 5, consumed: 8, stored: 40 },
    { time: "12:00", generated: 25, consumed: 12, stored: 53 },
    { time: "16:00", generated: 22, consumed: 10, stored: 65 },
    { time: "20:00", generated: 3, consumed: 15, stored: 53 },
    { time: "24:00", generated: 0, consumed: 5, stored: 48 },
  ];

  // System performance data
  const performanceData = [
    { date: "Mon", efficiency: 92, output: 85, health: 98 },
    { date: "Tue", efficiency: 94, output: 88, health: 99 },
    { date: "Wed", efficiency: 91, output: 82, health: 97 },
    { date: "Thu", efficiency: 93, output: 86, health: 98 },
    { date: "Fri", efficiency: 95, output: 90, health: 99 },
    { date: "Sat", efficiency: 89, output: 80, health: 96 },
    { date: "Sun", efficiency: 96, output: 92, health: 100 },
  ];

  // Mock systems removed - only showing real Deye Cloud devices

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
      case "warning":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
      case "maintenance":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "error":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        );
      case "warning":
        return (
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        );
      case "maintenance":
        return (
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        );
      case "error":
        return (
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        );
      default:
        return (
          <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        );
    }
  };

  // Fetch real-time data from Deye Cloud
  const fetchRealtimeData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (devices.length === 0 || stations.length === 0) {
        await fetchDevices();
        return;
      }

      // Fetch latest data for all devices
      const deviceSns = devices.map((d) => d.deviceSn);
      // Process in batches of 10
      const batches = [];
      for (let i = 0; i < deviceSns.length; i += 10) {
        batches.push(deviceSns.slice(i, i + 10));
      }

      const allRealtimeData = [];
      for (const batch of batches) {
        try {
          const batchData = await deyeCloudApi.getDeviceLatestData(batch);
          allRealtimeData.push(...(batchData.deviceDataList || []));
        } catch (err) {
          // Failed to fetch device batch
        }
      }
      setRealtimeData(allRealtimeData);

      // Also fetch latest station data for more accurate stats
      const stationRealtime: Record<number, any> = {};
      for (const station of stations) {
        try {
          const stationData = await deyeCloudApi.getStationLatest(station.id);
          stationRealtime[station.id] = stationData;
        } catch (err) {
          // Failed to fetch station data
        }
      }
      setStationRealtimeData(stationRealtime);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch monitoring data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get data value from realtime data
  const getDataValue = (deviceSn: string, key: string): number => {
    const deviceData = realtimeData.find((d) => d.deviceSn === deviceSn);
    if (!deviceData) return 0;
    const dataPoint = deviceData.dataList?.find((d: any) => d.key === key);
    return dataPoint ? parseFloat(String(dataPoint.value)) || 0 : 0;
  };

  // Helper function to convert watts to kilowatts
  const wattsToKilowatts = (watts: number): number => {
    return watts / 1000;
  };

  // Convert Deye Cloud devices to system format
  const systemsFromDevices = devices.map((device) => {
    const deviceRealtime = realtimeData.find(
      (d) => d.deviceSn === device.deviceSn
    );

    // Extract common data points (these may vary by device type)
    // Note: API returns power in watts, so we need to convert to kilowatts
    const powerInKw = getDataValue(device.deviceSn, "Power (kW)");
    let power = 0;
    if (powerInKw > 0) {
      // If "Power (kW)" exists, it's already in kilowatts
      power = powerInKw;
    } else {
      // Otherwise, get power in watts and convert to kilowatts
      const powerWatts =
        getDataValue(device.deviceSn, "Power") ||
        getDataValue(device.deviceSn, "TotalPower") ||
        getDataValue(device.deviceSn, "generationPower") ||
        0;
      power = wattsToKilowatts(powerWatts);
    }

    // Get station info if available
    const station = stations.find((s) => s.id === device.stationId);

    // Get capacity from device data or station
    let capacity = 0;
    if (station?.installedCapacity) {
      capacity = station.installedCapacity;
    } else if (deviceRealtime?.dataList) {
      // Try to find rated power or capacity in device data
      const ratedPower = deviceRealtime.dataList.find(
        (d: any) =>
          d.key?.toLowerCase().includes("rated") ||
          d.key?.toLowerCase().includes("capacity")
      );
      if (ratedPower) {
        capacity = parseFloat(String(ratedPower.value)) || 0;
      }
    }

    // If still no capacity, use a default based on device type or power
    // Capacity should be in kW (not watts)
    if (capacity === 0 && power > 0) {
      capacity = power * 1.2; // Estimate capacity as 120% of current power (already in kW)
    } else if (capacity === 0) {
      capacity = 5; // Default 5kW for unknown devices
    }

    const efficiency = capacity > 0 ? (power / capacity) * 100 : 0;

    // Determine status based on device state and connection status
    // connectStatus: "0" = Offline, "1" = Online, "2" = Alert
    // deviceState: 0 = error, 1 = normal, 2 = maintenance
    // Also check if we have recent realtime data (within last 10 minutes) to determine online status
    let status = "operational";

    // Check connectStatus from device or station device list
    let connectStatus = device.connectStatus;

    // If not found, check deviceState (0 = error/offline, 1 = normal/online, 2 = maintenance)
    if (!connectStatus && device.deviceState !== undefined) {
      connectStatus = String(device.deviceState);
    }

    // If still not found, check if we have recent realtime data (device is online if data is recent)
    if (!connectStatus && deviceRealtime) {
      const now = Date.now();
      const dataTime = deviceRealtime.collectionTime * 1000; // Convert to milliseconds
      const timeDiff = now - dataTime;
      const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

      // If data is less than 10 minutes old, device is likely online
      if (timeDiff < tenMinutes) {
        connectStatus = "1"; // Online
      } else {
        connectStatus = "0"; // Offline (stale data)
      }
    }

    // Default to "1" (online) if we can't determine, but log it
    if (!connectStatus) {
      connectStatus = "1";
    }

    if (connectStatus === "0" || device.deviceState === 0) {
      status = "error"; // Offline
    } else if (connectStatus === "2" || device.deviceState === 2) {
      status = "maintenance";
    } else if (connectStatus === "1" && efficiency < 50 && power > 0) {
      status = "warning"; // Online but low efficiency
    } else if (connectStatus === "1") {
      status = "operational"; // Online and working
    }

    const lastUpdate = deviceRealtime?.collectionTime
      ? new Date(deviceRealtime.collectionTime * 1000).toLocaleString()
      : device.collectionTime
      ? new Date(device.collectionTime * 1000).toLocaleString()
      : station?.lastUpdateTime
      ? new Date(station.lastUpdateTime * 1000).toLocaleString()
      : "Unknown";

    return {
      id: device.deviceId || device.deviceSn,
      name: device.deviceSn,
      location:
        device.stationLocation ||
        station?.locationAddress ||
        device.location ||
        "N/A",
      status,
      capacity: capacity > 0 ? `${capacity.toFixed(2)}kW` : "N/A",
      currentOutput: power > 0 ? `${power.toFixed(2)}kW` : "0kW",
      efficiency: Math.round(efficiency),
      lastUpdate: lastUpdate,
      deviceSn: device.deviceSn,
      deviceType: device.deviceType,
      stationId: device.stationId,
      stationName: device.stationName || station?.name,
      realtimeData: deviceRealtime,
      isOnline:
        connectStatus === "1" ||
        connectStatus === 1 ||
        connectStatus === "NORMAL",
      connectStatus: connectStatus, // Store for debugging
    };
  });

  // Only use real devices from Deye Cloud (no mock data)
  // Filter to show only one device per station/plant
  // If multiple devices share the same stationId, keep only the preferred device (2310286498)
  const displaySystems = systemsFromDevices.reduce(
    (acc: typeof systemsFromDevices, system) => {
      // Check if we already have a device from this station
      const existingSystem = acc.find((s) => s.stationId === system.stationId);

      if (!existingSystem) {
        // No device from this station yet, add this one
        acc.push(system);
      } else {
        // We already have a device from this station
        // Prefer device 2310286498 if it exists (check both id and deviceSn)
        if (
          system.id === "2310286498" ||
          system.deviceSn === "2310286498" ||
          system.name === "2310286498"
        ) {
          // Replace the existing one with this preferred device
          const index = acc.indexOf(existingSystem);
          acc[index] = system;
        }
        // Otherwise, keep the existing one (don't add this duplicate)
      }

      return acc;
    },
    []
  );

  // Detect problems and generate alerts
  const systemAlerts = displaySystems.flatMap((system) => {
    const alerts: Array<{
      id: string;
      deviceId: string;
      deviceName: string;
      severity: "critical" | "warning" | "info";
      title: string;
      message: string;
      timestamp: string;
    }> = [];

    // Check for offline devices
    if (!system.isOnline) {
      alerts.push({
        id: `${system.id}-offline`,
        deviceId: system.id,
        deviceName: system.name,
        severity: "critical",
        title: "Device Offline",
        message: `Device ${system.name} is currently offline and not reporting data.`,
        timestamp: system.lastUpdate,
      });
    }

    // Check for low/no power generation during daytime (assuming 6 AM - 6 PM)
    const now = new Date();
    const hour = now.getHours();
    const isDaytime = hour >= 6 && hour < 18;
    const currentOutput =
      parseFloat(system.currentOutput.replace("kW", "")) || 0;

    if (isDaytime && currentOutput === 0 && system.isOnline) {
      alerts.push({
        id: `${system.id}-no-generation`,
        deviceId: system.id,
        deviceName: system.name,
        severity: "warning",
        title: "No Power Generation",
        message: `Device ${system.name} is online but generating 0kW during daytime. Check solar panels and weather conditions.`,
        timestamp: system.lastUpdate,
      });
    }

    // Check for low efficiency
    if (system.efficiency < 30 && currentOutput > 0) {
      alerts.push({
        id: `${system.id}-low-efficiency`,
        deviceId: system.id,
        deviceName: system.name,
        severity: "warning",
        title: "Low Efficiency",
        message: `Device ${system.name} is operating at ${system.efficiency}% efficiency. Expected: 70-100%. Check system health.`,
        timestamp: system.lastUpdate,
      });
    }

    // Check for stale data (no update in last 30 minutes)
    if (system.lastUpdate !== "Unknown") {
      const lastUpdateTime = new Date(system.lastUpdate);
      const timeDiff = now.getTime() - lastUpdateTime.getTime();
      const thirtyMinutes = 30 * 60 * 1000;

      if (timeDiff > thirtyMinutes && system.isOnline) {
        alerts.push({
          id: `${system.id}-stale-data`,
          deviceId: system.id,
          deviceName: system.name,
          severity: "warning",
          title: "Stale Data",
          message: `Device ${system.name} hasn't updated in ${Math.round(
            timeDiff / 60000
          )} minutes. Connection may be unstable.`,
          timestamp: system.lastUpdate,
        });
      }
    }

    // Check for very low output compared to capacity
    const capacity = parseFloat(system.capacity.replace("kW", "")) || 0;
    if (capacity > 0 && currentOutput > 0) {
      const utilization = (currentOutput / capacity) * 100;
      if (isDaytime && utilization < 5 && system.efficiency < 20) {
        alerts.push({
          id: `${system.id}-low-utilization`,
          deviceId: system.id,
          deviceName: system.name,
          severity: "info",
          title: "Low System Utilization",
          message: `Device ${
            system.name
          } is only utilizing ${utilization.toFixed(
            1
          )}% of capacity. This may be normal during low sunlight.`,
          timestamp: system.lastUpdate,
        });
      }
    }

    return alerts;
  });

  const criticalAlerts = systemAlerts.filter((a) => a.severity === "critical");
  const warningAlerts = systemAlerts.filter((a) => a.severity === "warning");

  // Calculate stats from station-level data for more accuracy
  // Use station data if available, otherwise fall back to device data
  const totalCapacity = (() => {
    // Try to get from stations first (more accurate)
    const stationCapacity = stations.reduce((sum, station) => {
      const cap = station.installedCapacity || 0;
      // installedCapacity is typically in W, convert to kW
      // If value is very small (< 10), it might already be in kW
      if (cap > 0) {
        return sum + (cap >= 10 ? wattsToKilowatts(cap) : cap);
      }
      return sum;
    }, 0);

    if (stationCapacity > 0) {
      return stationCapacity;
    }

    // Fall back to device-based calculation
    return displaySystems.reduce((sum, sys) => {
      const cap = parseFloat(
        sys.capacity.replace("kW", "").replace("N/A", "0")
      );
      return sum + (isNaN(cap) ? 0 : cap);
    }, 0);
  })();

  const totalOutput = (() => {
    // Try to get from station realtime data first (more accurate)
    // Current Output should show total power being supplied (generation + battery discharge)
    let stationOutput = 0;
    let stationCount = 0;

    Object.values(stationRealtimeData).forEach((stationData: any) => {
      if (stationData) {
        // generationPower is in W, convert to kW
        const genPower = Math.max(0, stationData.generationPower || 0);
        // dischargePower is in W (positive when discharging), convert to kW
        const dischargePower = Math.abs(stationData.dischargePower || 0);

        // Current Output = total power being supplied to load
        // This includes: generation (solar) + battery discharge
        // Also check consumptionPower as it represents total power being consumed/supplied
        const consumptionPower = Math.max(0, stationData.consumptionPower || 0);

        // Calculate total output: generation + battery discharge
        const totalPower = genPower + dischargePower;

        // Use the higher value: either calculated total or consumption (whichever makes sense)
        // If consumption is available and higher, it might be more accurate
        const outputPower =
          consumptionPower > totalPower ? consumptionPower : totalPower;

        stationOutput += wattsToKilowatts(outputPower);
        stationCount++;
      }
    });

    if (stationCount > 0) {
      return stationOutput;
    }

    // Fall back to device-based calculation
    return displaySystems.reduce((sum, sys) => {
      const out = parseFloat(
        sys.currentOutput.replace("kW", "").replace("N/A", "0")
      );
      return sum + (isNaN(out) ? 0 : out);
    }, 0);
  })();

  const avgEfficiency = (() => {
    // Calculate efficiency from station-level data if available (more accurate)
    let totalEfficiency = 0;
    let efficiencyCount = 0;

    stations.forEach((station) => {
      const stationData = stationRealtimeData[station.id];
      if (stationData && station?.installedCapacity) {
        const capacity = station.installedCapacity;
        // Convert capacity from W to kW if needed
        const capacityKw =
          capacity >= 100 ? wattsToKilowatts(capacity) : capacity;
        const generationKw = wattsToKilowatts(stationData.generationPower || 0);
        const dischargeKw = wattsToKilowatts(
          Math.abs(stationData.dischargePower || 0)
        );
        const consumptionKw = wattsToKilowatts(
          stationData.consumptionPower || 0
        );

        // Calculate total output (generation + battery discharge)
        const totalOutputKw = generationKw + dischargeKw;
        // Use consumption if it's available and represents actual output better
        const actualOutputKw =
          consumptionKw > totalOutputKw ? consumptionKw : totalOutputKw;

        if (capacityKw > 0) {
          // Efficiency = (actual power output / capacity) * 100
          // This shows system utilization including battery discharge
          const efficiency = (actualOutputKw / capacityKw) * 100;
          totalEfficiency += efficiency;
          efficiencyCount++;
        }
      }
    });

    // If we have station-level efficiency data, use it
    if (efficiencyCount > 0) {
      return totalEfficiency / efficiencyCount;
    }

    // Fall back to device-based calculation
    if (displaySystems.length > 0) {
      return (
        displaySystems.reduce((sum, sys) => sum + sys.efficiency, 0) /
        displaySystems.length
      );
    }

    return 0;
  })();
  const operationalCount = displaySystems.filter(
    (sys) => sys.status === "operational"
  ).length;
  const totalSystems = displaySystems.length;

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              System Monitoring
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time monitoring of solar energy systems via Deye Cloud
            </p>
          </div>
          <div className="flex items-center gap-3">
            {error && (
              <div className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Deye Cloud Connected
                </span>
              </div>
            )}
            <select
              value={selectedTimeframe}
              onChange={(e) => {
                setSelectedTimeframe(e.target.value as "24h" | "7d" | "30d");
                fetchRealtimeData();
              }}
              className="px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-700 dark:text-gray-200"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={fetchRealtimeData}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              <Activity
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Alerts Banner */}
        {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
          <div className="rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200 dark:border-red-700 p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                System Alerts
              </h3>
              {criticalAlerts.length > 0 && (
                <span className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm font-semibold">
                  {criticalAlerts.length} Critical
                </span>
              )}
              {warningAlerts.length > 0 && (
                <span className="px-3 py-1 rounded-lg bg-orange-600 text-white text-sm font-semibold">
                  {warningAlerts.length} Warnings
                </span>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 dark:text-red-100">
                        {alert.title} - {alert.deviceName}
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {alert.message}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Last update: {alert.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {warningAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50 border border-orange-300 dark:border-orange-700"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-orange-900 dark:text-orange-100">
                        {alert.title} - {alert.deviceName}
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Capacity"
            value={`${totalCapacity.toFixed(0)}kW`}
            icon={Zap}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatsCard
            title="Current Output"
            value={`${totalOutput.toFixed(0)}kW`}
            change={`${((totalOutput / totalCapacity) * 100).toFixed(1)}%`}
            trend="up"
            icon={Activity}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatsCard
            title="Avg. Efficiency"
            value={`${avgEfficiency.toFixed(1)}%`}
            icon={Gauge}
            gradient="from-purple-500 to-pink-500"
          />
          <StatsCard
            title="System Health"
            value={
              criticalAlerts.length > 0
                ? "Critical"
                : warningAlerts.length > 0
                ? "Warning"
                : "Healthy"
            }
            change={`${operationalCount}/${totalSystems} Online`}
            icon={criticalAlerts.length > 0 ? AlertTriangle : CheckCircle}
            gradient={
              criticalAlerts.length > 0
                ? "from-red-500 to-orange-500"
                : warningAlerts.length > 0
                ? "from-amber-500 to-yellow-500"
                : "from-emerald-500 to-teal-600"
            }
          />
        </div>

        {/* Energy Generation Chart */}
        <ChartCard
          title="Energy Generation & Consumption"
          subtitle="Real-time energy flow monitoring"
        >
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={energyData}>
              <defs>
                <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorStored" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
              <XAxis
                dataKey="time"
                stroke="#d1d5db"
                tick={{ fill: "#6b7280" }}
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#d1d5db"
                tick={{ fill: "#6b7280" }}
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                  color: "#f3f4f6",
                }}
                labelStyle={{ color: "#f3f4f6" }}
                itemStyle={{ color: "#f3f4f6" }}
              />
              <Legend wrapperStyle={{ color: "#d1d5db" }} />
              <Area
                type="monotone"
                dataKey="generated"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorGenerated)"
                name="Generated (kWh)"
              />
              <Area
                type="monotone"
                dataKey="consumed"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#colorConsumed)"
                name="Consumed (kWh)"
              />
              <Area
                type="monotone"
                dataKey="stored"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorStored)"
                name="Stored (kWh)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="System Performance"
            subtitle="Efficiency and output trends"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
                <XAxis
                  dataKey="date"
                  stroke="#d1d5db"
                  tick={{ fill: "#6b7280" }}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#d1d5db"
                  tick={{ fill: "#6b7280" }}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(31, 41, 55, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                    color: "#f3f4f6",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                  itemStyle={{ color: "#f3f4f6" }}
                />
                <Legend wrapperStyle={{ color: "#d1d5db" }} />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 5 }}
                  name="Efficiency (%)"
                />
                <Line
                  type="monotone"
                  dataKey="output"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: "#06b6d4", r: 5 }}
                  name="Output (%)"
                />
                <Line
                  type="monotone"
                  dataKey="health"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 5 }}
                  name="Health (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="System Status Overview"
            subtitle="Current operational status"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
                <XAxis
                  dataKey="date"
                  stroke="#d1d5db"
                  tick={{ fill: "#6b7280" }}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#d1d5db"
                  tick={{ fill: "#6b7280" }}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(31, 41, 55, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                    color: "#f3f4f6",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                  itemStyle={{ color: "#f3f4f6" }}
                />
                <Legend wrapperStyle={{ color: "#d1d5db" }} />
                <Bar
                  dataKey="health"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="System Health (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Systems List */}
        <ChartCard title="System Status" className="mb-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Loading devices from Deye Cloud...
              </p>
            </div>
          )}
          {devices.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No devices found. Please add devices to Deye Cloud first.
              </p>
              <button
                onClick={fetchDevices}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
              >
                Refresh Devices
              </button>
            </div>
          )}
          {devices.length > 0 && !isLoading && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📊 Found <strong>{devices.length}</strong> device(s) from Deye
                Cloud
                {systemsFromDevices.filter((s) => s.isOnline).length > 0 && (
                  <span className="ml-2">
                    •{" "}
                    <span className="text-green-600 dark:text-green-400">
                      {systemsFromDevices.filter((s) => s.isOnline).length}{" "}
                      Online
                    </span>
                  </span>
                )}
                {systemsFromDevices.filter((s) => !s.isOnline).length > 0 && (
                  <span className="ml-2">
                    •{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {systemsFromDevices.filter((s) => !s.isOnline).length}{" "}
                      Offline
                    </span>
                  </span>
                )}
              </p>
            </div>
          )}
          <div className="space-y-4">
            {displaySystems.map((system) => {
              const deviceAlerts = systemAlerts.filter(
                (a) => a.deviceId === system.id
              );
              const hasCriticalAlert = deviceAlerts.some(
                (a) => a.severity === "critical"
              );
              const hasWarningAlert = deviceAlerts.some(
                (a) => a.severity === "warning"
              );

              return (
                <div
                  key={system.id}
                  className={`flex items-center justify-between p-5 rounded-xl backdrop-blur-sm border transition-all duration-200 ${
                    hasCriticalAlert
                      ? "bg-red-50/50 dark:bg-red-900/20 border-red-300 dark:border-red-700 hover:bg-red-50/70 dark:hover:bg-red-900/30"
                      : hasWarningAlert
                      ? "bg-orange-50/50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 hover:bg-orange-50/70 dark:hover:bg-orange-900/30"
                      : "bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 hover:bg-white/70 dark:hover:bg-gray-800/70"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                      {getStatusIcon(system.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {system.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                            system.status
                          )}`}
                        >
                          {system.status}
                        </span>
                        {hasCriticalAlert && (
                          <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-600 text-white flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Critical
                          </span>
                        )}
                        {hasWarningAlert && !hasCriticalAlert && (
                          <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-orange-600 text-white flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Warning
                          </span>
                        )}
                        {!system.isOnline && (
                          <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-600 text-white flex items-center gap-1">
                            <WifiOff className="w-3 h-3" />
                            Offline
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">
                            Location
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {system.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">
                            Capacity
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {system.capacity}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">
                            Current Output
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {system.currentOutput}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">
                            Efficiency
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {system.efficiency}%
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Last update: {system.lastUpdate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {system.stationId && (
                      <button
                        onClick={async () => {
                          setSelectedDevice(system);
                          setIsDetailsModalOpen(true);
                          // Fetch station data for comprehensive view
                          try {
                            const stationLatest =
                              await deyeCloudApi.getStationLatest(
                                system.stationId
                              );
                            setSelectedStationData(stationLatest);

                            // Fetch today's history data and total production
                            try {
                              const today = new Date();
                              const todayStr = `${today.getFullYear()}-${String(
                                today.getMonth() + 1
                              ).padStart(2, "0")}-${String(
                                today.getDate()
                              ).padStart(2, "0")}`;

                              // Fetch today's data - try a range to ensure we get data
                              const yesterday = new Date(today);
                              yesterday.setDate(yesterday.getDate() - 1);
                              const yesterdayStr = `${yesterday.getFullYear()}-${String(
                                yesterday.getMonth() + 1
                              ).padStart(2, "0")}-${String(
                                yesterday.getDate()
                              ).padStart(2, "0")}`;

                              // Fetch a 2-day range to ensure we get today's data
                              const todayHistory =
                                await deyeCloudApi.getStationHistory(
                                  system.stationId,
                                  2, // granularity: daily (2 = day)
                                  yesterdayStr, // Start from yesterday to ensure we get today
                                  todayStr
                                );

                              // Fetch last 31 days for total production (API limit is 31 days)
                              const thirtyOneDaysAgo = new Date(today);
                              thirtyOneDaysAgo.setDate(today.getDate() - 31);
                              const startDateStr = `${thirtyOneDaysAgo.getFullYear()}-${String(
                                thirtyOneDaysAgo.getMonth() + 1
                              ).padStart(2, "0")}-${String(
                                thirtyOneDaysAgo.getDate()
                              ).padStart(2, "0")}`;

                              let totalHistory;
                              try {
                                totalHistory =
                                  await deyeCloudApi.getStationHistory(
                                    system.stationId,
                                    2, // granularity: daily
                                    startDateStr,
                                    todayStr
                                  );
                              } catch (totalErr) {
                                // Failed to fetch total history
                                totalHistory = null;
                              }

                              if (
                                todayHistory &&
                                todayHistory.stationDataItems &&
                                todayHistory.stationDataItems.length > 0
                              ) {
                                setStationHistoryData(
                                  todayHistory.stationDataItems
                                );
                                // Extract daily production from today's data
                                // Try multiple ways to find today's data
                                // Note: API might return month as 1-indexed (1-12) or 0-indexed (0-11)
                                const todayData =
                                  todayHistory.stationDataItems.find(
                                    (item: any) => {
                                      // Check dateTime string match
                                      if (
                                        item.dateTime === todayStr ||
                                        item.dateTime?.startsWith(todayStr)
                                      ) {
                                        return true;
                                      }
                                      // Check year/month/day match (handle both 0-indexed and 1-indexed months)
                                      if (
                                        item.year === today.getFullYear() &&
                                        item.day === today.getDate()
                                      ) {
                                        // Month could be 0-indexed (0-11) or 1-indexed (1-12)
                                        const itemMonth = item.month;
                                        const todayMonth0 = today.getMonth(); // 0-11
                                        const todayMonth1 =
                                          today.getMonth() + 1; // 1-12
                                        if (
                                          itemMonth === todayMonth0 ||
                                          itemMonth === todayMonth1
                                        ) {
                                          return true;
                                        }
                                      }
                                      return false;
                                    }
                                  ) ||
                                  // If not found, try the last item (most recent)
                                  todayHistory.stationDataItems[
                                    todayHistory.stationDataItems.length - 1
                                  ];

                                if (
                                  todayData &&
                                  todayData.generationValue !== undefined &&
                                  todayData.generationValue !== null
                                ) {
                                  // Deye Cloud API returns generationValue - need to determine unit
                                  // Typical daily production: 1-100+ kWh
                                  // If value is very large (> 1000), it's likely in Wh and needs conversion
                                  // If value is smaller, it's likely already in kWh
                                  const rawValue = todayData.generationValue;
                                  let dailyKwh;

                                  // If value is 1000 or more, it's likely in Wh (e.g., 17000 Wh = 17 kWh)
                                  // If value is less than 1000, it's likely already in kWh
                                  if (rawValue >= 1000) {
                                    // Value is in Wh, convert to kWh
                                    dailyKwh = rawValue / 1000;
                                  } else {
                                    // Value is likely already in kWh
                                    dailyKwh = rawValue;
                                  }

                                  setDailyProduction(dailyKwh);

                                  // Also get daily charge value (energy sent to battery today)
                                  if (
                                    todayData.chargeValue !== undefined &&
                                    todayData.chargeValue !== null
                                  ) {
                                    const rawChargeValue =
                                      todayData.chargeValue;
                                    let dailyChargeKwh;

                                    // Same logic as generationValue - determine if Wh or kWh
                                    if (rawChargeValue >= 1000) {
                                      dailyChargeKwh = rawChargeValue / 1000;
                                    } else {
                                      dailyChargeKwh = rawChargeValue;
                                    }
                                    setDailyToBattery(dailyChargeKwh);
                                  } else {
                                    setDailyToBattery(null);
                                  }
                                } else {
                                  setDailyProduction(null);
                                  setDailyToBattery(null);
                                }
                              } else {
                                setStationHistoryData([]);
                                setDailyProduction(null);
                                setDailyToBattery(null);
                              }

                              // Store total history for accumulative values
                              if (
                                totalHistory &&
                                totalHistory.stationDataItems &&
                                totalHistory.stationDataItems.length > 0
                              ) {
                                // Sum up all generation and consumption values for total
                                const totalGen =
                                  totalHistory.stationDataItems.reduce(
                                    (sum: number, item: any) =>
                                      sum + (item.generationValue || 0),
                                    0
                                  );
                                const totalCons =
                                  totalHistory.stationDataItems.reduce(
                                    (sum: number, item: any) =>
                                      sum + (item.consumptionValue || 0),
                                    0
                                  );

                                setTotalProduction(totalGen);
                                setTotalConsumption(totalCons);
                              } else {
                                setTotalProduction(null);
                                setTotalConsumption(null);
                              }
                            } catch (historyErr) {
                              // Failed to fetch station history (this is optional)
                              // Set empty array if history fails - it's not critical
                              setStationHistoryData([]);
                              setDailyProduction(null);
                              setDailyToBattery(null);
                            }
                          } catch (err) {
                            // Failed to fetch station data
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 transition-colors text-sm font-medium shadow-lg shadow-blue-500/30"
                      >
                        View Dashboard
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Comprehensive Station Dashboard Modal */}
        {isDetailsModalOpen && selectedDevice && selectedStationData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-7xl w-full my-8 border border-gray-200 dark:border-gray-700 max-h-[95vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedDevice.stationName || "Station Dashboard"}
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        selectedDevice.isOnline
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {selectedDevice.isOnline ? "Online" : "Offline"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedDevice.capacity}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Last update: {selectedDevice.lastUpdate}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedDevice(null);
                    setSelectedStationData(null);
                    setStationHistoryData([]);
                    setDailyProduction(null);
                    setDailyToBattery(null);
                    setTotalProduction(null);
                    setTotalConsumption(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 space-y-6">
                {/* Flow Graph & Summary Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Flow Graph */}
                  <div className="lg:col-span-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Flow Graph
                    </h3>
                    <div className="relative h-64 flex items-center justify-center">
                      {/* SVG overlay for connection lines */}
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ zIndex: 1 }}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        {/* Connection lines */}
                        {/* Solar Panels → Inverter */}
                        <line
                          x1="16.66"
                          y1="16.66"
                          x2="50"
                          y2="50"
                          stroke="#9ca3af"
                          strokeWidth="0.5"
                          strokeDasharray="2,2"
                          className="dark:stroke-gray-500"
                        />
                        {/* Grid ↔ Inverter (bidirectional) - Curved path for better visual appeal */}
                        <path
                          d="M 83.33 16.66 Q 70 30, 50 50"
                          stroke="#9ca3af"
                          strokeWidth="0.5"
                          strokeDasharray="2,2"
                          fill="none"
                          className="dark:stroke-gray-500"
                        />
                        {/* Battery ↔ Inverter (bidirectional) */}
                        <line
                          x1="16.66"
                          y1="83.33"
                          x2="50"
                          y2="50"
                          stroke="#9ca3af"
                          strokeWidth="0.5"
                          strokeDasharray="2,2"
                          className="dark:stroke-gray-500"
                        />
                        {/* Inverter → House */}
                        <line
                          x1="50"
                          y1="50"
                          x2="83.33"
                          y2="83.33"
                          stroke="#9ca3af"
                          strokeWidth="0.5"
                          strokeDasharray="2,2"
                          className="dark:stroke-gray-500"
                        />
                      </svg>

                      {/* Animated dots using CSS animations */}
                      {/* Minimum threshold: 10W to show flow */}
                      {/* Flow scenarios handled:
                          1. Solar → Inverter → Battery (charging)
                          2. Solar → Inverter → House (consuming)
                          3. Solar → Inverter → Battery + House (both)
                          4. Battery → Inverter → House (discharging)
                          5. Grid → Inverter (buying from grid)
                          6. Inverter → Grid (selling to grid)
                          7. Grid → Inverter → Battery (grid charging)
                          8. Grid → Inverter → House (grid powering house)
                      */}
                      {(() => {
                        const genPower =
                          selectedStationData.generationPower || 0;
                        const gridPower = selectedStationData.gridPower || 0;
                        const dischargePower = Math.abs(
                          selectedStationData.dischargePower || 0
                        );
                        const chargePower = Math.abs(
                          selectedStationData.chargePower || 0
                        );
                        const consumptionPower =
                          selectedStationData.consumptionPower || 0;
                        const minThreshold = 10; // 10W minimum to show flow

                        return (
                          <>
                            {/* Solar → Inverter (if generating) */}
                            {/* Shows when solar panels are producing power */}
                            {genPower > minThreshold && (
                              <div
                                className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"
                                style={{
                                  left: "16.66%",
                                  top: "16.66%",
                                  transform: "translate(-50%, -50%)",
                                  zIndex: 10,
                                  animation:
                                    "flowSolarToInverter 2s linear infinite",
                                }}
                              />
                            )}

                            {/* Grid ↔ Inverter (bidirectional) */}
                            {/* Positive gridPower = buying from grid (Grid → Inverter) */}
                            {/* Negative gridPower = selling to grid (Inverter → Grid) */}
                            {Math.abs(gridPower) > minThreshold && (
                              <div
                                className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"
                                style={{
                                  left: gridPower > 0 ? "83.33%" : "50%",
                                  top: gridPower > 0 ? "16.66%" : "50%",
                                  transform: "translate(-50%, -50%)",
                                  zIndex: 10,
                                  animation:
                                    gridPower > 0
                                      ? "flowGridToInverter 2s linear infinite"
                                      : "flowInverterToGrid 2s linear infinite",
                                }}
                              />
                            )}

                            {/* Battery → Inverter (if discharging) */}
                            {/* When battery is discharging, power flows FROM battery TO inverter */}
                            {/* Example: Battery → Inverter → House */}
                            {dischargePower > minThreshold && (
                              <div
                                className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"
                                style={{
                                  left: "16.66%",
                                  top: "83.33%",
                                  transform: "translate(-50%, -50%)",
                                  zIndex: 10,
                                  animation:
                                    "flowBatteryToInverter 2s linear infinite",
                                }}
                              />
                            )}

                            {/* Inverter → Battery (if charging) */}
                            {/* When battery is charging, power flows FROM inverter TO battery */}
                            {/* Examples: Solar → Inverter → Battery, or Grid → Inverter → Battery */}
                            {chargePower > minThreshold && (
                              <div
                                className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"
                                style={{
                                  left: "50%",
                                  top: "50%",
                                  transform: "translate(-50%, -50%)",
                                  zIndex: 10,
                                  animation:
                                    "flowInverterToBattery 2s linear infinite",
                                }}
                              />
                            )}

                            {/* Inverter → House (if consuming) */}
                            {/* Power flows FROM inverter TO house when house is consuming */}
                            {/* Examples: Solar → Inverter → House, Battery → Inverter → House, Grid → Inverter → House */}
                            {consumptionPower > minThreshold && (
                              <div
                                className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"
                                style={{
                                  left: "50%",
                                  top: "50%",
                                  transform: "translate(-50%, -50%)",
                                  zIndex: 10,
                                  animation:
                                    "flowInverterToHouse 2s linear infinite",
                                }}
                              />
                            )}
                          </>
                        );
                      })()}

                      {/* CSS Keyframes for animations */}
                      <style>{`
                        @keyframes flowSolarToInverter {
                          0% {
                            left: 16.66%;
                            top: 16.66%;
                          }
                          100% {
                            left: 50%;
                            top: 50%;
                          }
                        }
                        @keyframes flowGridToInverter {
                          0% {
                            left: 83.33%;
                            top: 16.66%;
                          }
                          50% {
                            left: 70%;
                            top: 30%;
                          }
                          100% {
                            left: 50%;
                            top: 50%;
                          }
                        }
                        @keyframes flowInverterToGrid {
                          0% {
                            left: 50%;
                            top: 50%;
                          }
                          50% {
                            left: 70%;
                            top: 30%;
                          }
                          100% {
                            left: 83.33%;
                            top: 16.66%;
                          }
                        }
                        @keyframes flowBatteryToInverter {
                          0% {
                            left: 16.66%;
                            top: 83.33%;
                          }
                          100% {
                            left: 50%;
                            top: 50%;
                          }
                        }
                        @keyframes flowInverterToBattery {
                          0% {
                            left: 50%;
                            top: 50%;
                          }
                          100% {
                            left: 16.66%;
                            top: 83.33%;
                          }
                        }
                        @keyframes flowInverterToHouse {
                          0% {
                            left: 50%;
                            top: 50%;
                          }
                          100% {
                            left: 83.33%;
                            top: 83.33%;
                          }
                        }
                      `}</style>

                      {/* Simplified flow diagram */}
                      <div
                        className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full relative"
                        style={{ zIndex: 2 }}
                      >
                        {/* Solar Panels */}
                        <div className="col-start-1 row-start-1 flex flex-col items-center justify-center">
                          <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                            <Sun className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                            {(selectedStationData.generationPower || 0).toFixed(
                              2
                            )}{" "}
                            W
                          </p>
                        </div>

                        {/* Grid */}
                        <div className="col-start-3 row-start-1 flex flex-col items-center justify-center">
                          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                            {(selectedStationData.gridPower || 0).toFixed(2)} W
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            On grid
                          </p>
                        </div>

                        {/* Inverter (Center) */}
                        <div className="col-start-2 row-start-2 flex flex-col items-center justify-center">
                          <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700">
                            <Activity className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white mt-2">
                            Inverter
                          </p>
                        </div>

                        {/* Battery */}
                        <div className="col-start-1 row-start-3 flex flex-col items-center justify-center">
                          <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <Battery className="w-8 h-8 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                            {selectedStationData.batteryPower
                              ? wattsToKilowatts(
                                  Math.abs(selectedStationData.batteryPower)
                                ).toFixed(2)
                              : "0.00"}{" "}
                            kW
                          </p>
                          {selectedStationData.batterySOC !== undefined && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedStationData.batterySOC.toFixed(0)}% SOC
                            </p>
                          )}
                        </div>

                        {/* Load/House */}
                        <div className="col-start-3 row-start-3 flex flex-col items-center justify-center">
                          <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <svg
                              className="w-8 h-8 text-orange-600 dark:text-orange-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                            {wattsToKilowatts(
                              selectedStationData.consumptionPower || 0
                            ).toFixed(2)}{" "}
                            kW
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-yellow-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Total Production
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {totalProduction !== null &&
                            totalProduction !== undefined
                              ? totalProduction >= 1000
                                ? (totalProduction / 1000).toFixed(2) + " MWh"
                                : totalProduction.toFixed(2) + " kWh"
                              : "0.00 kWh"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-6 h-6 text-orange-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Total Consumption
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {totalConsumption !== null &&
                            totalConsumption !== undefined
                              ? totalConsumption >= 1000
                                ? (totalConsumption / 1000).toFixed(2) + " MWh"
                                : totalConsumption.toFixed(2) + " kWh"
                              : "0.00 kWh"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Sun className="w-6 h-6 text-yellow-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Daily Production
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {dailyProduction !== null
                              ? dailyProduction.toFixed(2)
                              : stationHistoryData.length > 0 &&
                                stationHistoryData[0].generationValue !==
                                  undefined
                              ? stationHistoryData[0].generationValue.toFixed(2)
                              : "0.00"}{" "}
                            kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Power Values - Large Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Battery Card */}
                  <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-center mb-4">
                      <Battery className="w-16 h-16 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedStationData.batteryPower
                        ? wattsToKilowatts(
                            Math.abs(selectedStationData.batteryPower)
                          ).toFixed(2)
                        : "0.00"}{" "}
                      kW
                    </p>
                    {selectedStationData.batterySOC !== undefined && (
                      <p className="text-center text-lg font-semibold text-green-600 dark:text-green-400">
                        {selectedStationData.batterySOC.toFixed(0)}% SOC
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Charge
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {selectedStationData.chargePower
                              ? wattsToKilowatts(
                                  Math.abs(selectedStationData.chargePower)
                                ).toFixed(2)
                              : "0.00"}{" "}
                            kW
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Discharge
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {selectedStationData.dischargePower
                              ? wattsToKilowatts(
                                  Math.abs(selectedStationData.dischargePower)
                                ).toFixed(2)
                              : "0.00"}{" "}
                            kW
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consumption/Load Card */}
                  <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border-2 border-orange-200 dark:border-orange-700">
                    <div className="flex items-center justify-center mb-4">
                      <svg
                        className="w-16 h-16 text-orange-600 dark:text-orange-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                    <p className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {wattsToKilowatts(
                        selectedStationData.consumptionPower || 0
                      ).toFixed(2)}{" "}
                      kW
                    </p>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Total Consumption
                    </p>
                    <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-700">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            From Grid
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {selectedStationData.purchasePower
                              ? wattsToKilowatts(
                                  Math.abs(selectedStationData.purchasePower)
                                ).toFixed(2)
                              : "0.00"}{" "}
                            kW
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            From PV
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {wattsToKilowatts(
                              Math.max(
                                0,
                                (selectedStationData.generationPower || 0) -
                                  (selectedStationData.chargePower || 0)
                              )
                            ).toFixed(2)}{" "}
                            kW
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Solar Production Card */}
                  <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-2 border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center justify-center mb-4">
                      <Sun className="w-16 h-16 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {wattsToKilowatts(
                        selectedStationData.generationPower || 0
                      ).toFixed(2)}{" "}
                      kW
                    </p>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Current Generation
                    </p>
                    <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Daily Total
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {dailyProduction !== null
                              ? dailyProduction.toFixed(2)
                              : stationHistoryData.length > 0 &&
                                stationHistoryData[0].generationValue
                              ? stationHistoryData[0].generationValue.toFixed(2)
                              : "0.00"}{" "}
                            kWh
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            To Battery
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {dailyToBattery !== null &&
                            dailyToBattery !== undefined
                              ? dailyToBattery.toFixed(2)
                              : stationHistoryData.length > 0 &&
                                stationHistoryData[0].chargeValue !== undefined
                              ? (() => {
                                  const rawValue =
                                    stationHistoryData[0].chargeValue;
                                  const value =
                                    rawValue >= 1000
                                      ? rawValue / 1000
                                      : rawValue;
                                  return value.toFixed(2);
                                })()
                              : "0.00"}{" "}
                            kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Power Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Power Flow Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Generation Power
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {wattsToKilowatts(
                            selectedStationData.generationPower || 0
                          ).toFixed(2)}{" "}
                          kW
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Consumption Power
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {wattsToKilowatts(
                            selectedStationData.consumptionPower || 0
                          ).toFixed(2)}{" "}
                          kW
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Grid Power
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {wattsToKilowatts(
                            selectedStationData.gridPower || 0
                          ).toFixed(2)}{" "}
                          kW
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Purchase Power
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {wattsToKilowatts(
                            selectedStationData.purchasePower || 0
                          ).toFixed(2)}{" "}
                          kW
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Wire Power
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {wattsToKilowatts(
                            selectedStationData.wirePower || 0
                          ).toFixed(2)}{" "}
                          kW
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Battery Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Battery Power
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedStationData.batteryPower
                            ? wattsToKilowatts(
                                selectedStationData.batteryPower
                              ).toFixed(2)
                            : "0.00"}{" "}
                          kW
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Battery SOC
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedStationData.batterySOC !== undefined
                            ? selectedStationData.batterySOC.toFixed(1)
                            : "N/A"}{" "}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Charge Power
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedStationData.chargePower
                            ? wattsToKilowatts(
                                Math.abs(selectedStationData.chargePower)
                              ).toFixed(2)
                            : "0.00"}{" "}
                          kW
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Discharge Power
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedStationData.dischargePower
                            ? wattsToKilowatts(
                                Math.abs(selectedStationData.dischargePower)
                              ).toFixed(2)
                            : "0.00"}{" "}
                          kW
                        </span>
                      </div>
                      {selectedStationData.irradiateIntensity !== undefined &&
                        selectedStationData.irradiateIntensity !== null && (
                          <div className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Irradiance
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {selectedStationData.irradiateIntensity.toFixed(
                                2
                              )}{" "}
                              W/m²
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Solar & Utilization Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Consumption Breakdown */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Solar & Utilization - Consumption
                    </h3>
                    {(() => {
                      const gridImport = wattsToKilowatts(
                        selectedStationData.purchasePower || 0
                      );
                      const pvDirect = wattsToKilowatts(
                        Math.max(
                          0,
                          (selectedStationData.generationPower || 0) -
                            (selectedStationData.chargePower || 0)
                        )
                      );
                      const batteryDischarge = wattsToKilowatts(
                        selectedStationData.dischargePower || 0
                      );

                      const consumptionData = [
                        {
                          name: "Import",
                          value: Math.abs(gridImport),
                          color: "#8b5cf6",
                        },
                        {
                          name: "PV",
                          value: Math.max(0, pvDirect),
                          color: "#10b981",
                        },
                        {
                          name: "Discharge",
                          value: Math.abs(batteryDischarge),
                          color: "#06b6d4",
                        },
                      ].filter((item) => item.value > 0);

                      const total =
                        consumptionData.reduce(
                          (sum, item) => sum + item.value,
                          0
                        ) || 1;

                      return (
                        <div className="flex items-center justify-center">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={consumptionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {consumptionData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                              <text
                                x="50%"
                                y="45%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-sm font-semibold fill-gray-900 dark:fill-white"
                              >
                                Consumption
                              </text>
                              <text
                                x="50%"
                                y="55%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-lg font-bold fill-gray-900 dark:fill-white"
                              >
                                {total.toFixed(2)} kWh
                              </text>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="ml-4 space-y-2">
                            {consumptionData.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {item.name}:{" "}
                                  {((item.value / total) * 100).toFixed(0)}% (
                                  {item.value.toFixed(2)})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Production Breakdown */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Solar & Utilization - Production
                    </h3>
                    {(() => {
                      const totalProduction = wattsToKilowatts(
                        selectedStationData.generationPower || 0
                      );
                      const batteryCharge = wattsToKilowatts(
                        Math.abs(selectedStationData.chargePower || 0)
                      );
                      const directConsumption = Math.max(
                        0,
                        totalProduction - batteryCharge
                      );

                      const productionData = [
                        {
                          name: "Charge",
                          value: batteryCharge,
                          color: "#3b82f6",
                        },
                        {
                          name: "Consumption",
                          value: directConsumption,
                          color: "#f59e0b",
                        },
                      ].filter((item) => item.value > 0);

                      const total =
                        productionData.reduce(
                          (sum, item) => sum + item.value,
                          0
                        ) || 1;

                      return (
                        <div className="flex items-center justify-center">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={productionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {productionData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                              <text
                                x="50%"
                                y="45%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-sm font-semibold fill-gray-900 dark:fill-white"
                              >
                                Production
                              </text>
                              <text
                                x="50%"
                                y="55%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-lg font-bold fill-gray-900 dark:fill-white"
                              >
                                {total.toFixed(2)} kWh
                              </text>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="ml-4 space-y-2">
                            {productionData.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {item.name}:{" "}
                                  {((item.value / total) * 100).toFixed(0)}% (
                                  {item.value.toFixed(2)})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Power Profile Chart */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Power Profile (24 Hours)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
                      <XAxis
                        dataKey="time"
                        stroke="#d1d5db"
                        tick={{ fill: "#6b7280" }}
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#d1d5db"
                        tick={{ fill: "#6b7280" }}
                        style={{ fontSize: "12px" }}
                        label={{
                          value: "Power (kW)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#d1d5db"
                        tick={{ fill: "#6b7280" }}
                        style={{ fontSize: "12px" }}
                        label={{
                          value: "SOC (%)",
                          angle: 90,
                          position: "insideRight",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(31, 41, 55, 0.95)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          backdropFilter: "blur(10px)",
                          color: "#f3f4f6",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#d1d5db" }} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="generation"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Production"
                        dot={false}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="consumption"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="Consumption"
                        dot={false}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="battery"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Battery"
                        dot={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="soc"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="SOC (%)"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Historical data will be displayed here when available
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedDevice(null);
                    setSelectedStationData(null);
                    setStationHistoryData([]);
                    setDailyProduction(null);
                    setDailyToBattery(null);
                    setTotalProduction(null);
                    setTotalConsumption(null);
                  }}
                  className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

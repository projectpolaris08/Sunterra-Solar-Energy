// Serverless Monitoring Service
// Detects anomalies and processes alerts

import {
  getErrorCode,
  saveErrorCode,
  saveDeviceHistory,
  getDeviceHistory,
  getDeviceBaseline,
  updateDeviceBaseline,
  checkRecentAlert,
  saveAlert,
} from "./supabase-storage.js";
import { getErrorExplanation, getAIRecommendation } from "./llm-service.js";

export class MonitoringService {
  constructor(deyeCloudApi) {
    this.deyeCloudApi = deyeCloudApi;
  }

  getDefaultBaseline() {
    return {
      voltage: 230,
      frequency: 50,
      temperature: 25,
      production: 0,
    };
  }

  getExpectedProduction(stationData) {
    const hour = new Date().getHours();
    const capacity = stationData.installedCapacity || 5000; // Default 5kW

    let expectedFactor = 0;
    if (hour >= 6 && hour <= 18) {
      if (hour >= 10 && hour <= 14) {
        expectedFactor = 0.8; // Peak hours
      } else if (hour >= 8 && hour <= 16) {
        expectedFactor = 0.6; // Good hours
      } else {
        expectedFactor = 0.3; // Early/late hours
      }
    }

    return capacity * expectedFactor;
  }

  detectAnomalies(deviceData, stationData = null) {
    const anomalies = [];
    const deviceSn = deviceData.deviceSn || "unknown";

    // Check data list for error codes and anomalies
    if (deviceData.dataList) {
      for (const dataItem of deviceData.dataList) {
        const key = dataItem.key;
        const value = parseFloat(dataItem.value) || 0;

        // Check for error codes
        if (
          key.toLowerCase().includes("error") ||
          key.toLowerCase().includes("fault")
        ) {
          if (value !== 0 && value !== null) {
            anomalies.push({
              type: "error_code",
              severity: "critical",
              message: `Error code detected: ${key} = ${value}`,
              errorCode: value.toString(),
              deviceSn,
              data: deviceData,
            });
          }
        }

        // Check temperature anomalies
        if (
          key.toLowerCase().includes("temperature") ||
          key.toLowerCase().includes("temp")
        ) {
          if (value > 80) {
            anomalies.push({
              type: "temperature",
              severity: "warning",
              message: `High temperature detected: ${value}°C`,
              deviceSn,
              data: { key, value, unit: dataItem.unit },
            });
          } else if (value < -10) {
            anomalies.push({
              type: "temperature",
              severity: "warning",
              message: `Low temperature detected: ${value}°C`,
              deviceSn,
              data: { key, value, unit: dataItem.unit },
            });
          }
        }

        // Check battery SOC
        if (
          key.toLowerCase().includes("soc") ||
          key.toLowerCase().includes("state_of_charge")
        ) {
          if (value < 20) {
            anomalies.push({
              type: "battery_soc",
              severity: "warning",
              message: `Low battery SOC: ${value}%`,
              deviceSn,
              data: { key, value, unit: dataItem.unit },
            });
          }
        }

        // Check battery SOH
        if (
          key.toLowerCase().includes("soh") ||
          key.toLowerCase().includes("state_of_health")
        ) {
          if (value < 80) {
            anomalies.push({
              type: "battery_soh",
              severity: "warning",
              message: `Battery health degraded: ${value}%`,
              deviceSn,
              data: { key, value, unit: dataItem.unit },
            });
          }
        }
      }
    }

    // Check station data for anomalies
    if (stationData) {
      const expectedProduction = this.getExpectedProduction(stationData);

      // Check PV production
      if (stationData.generationPower !== undefined) {
        const hour = new Date().getHours();
        const isDaytime = hour >= 6 && hour < 18;

        if (
          isDaytime &&
          (stationData.generationPower === 0 || stationData.generationPower < 1)
        ) {
          anomalies.push({
            type: "no_production",
            severity: "warning",
            message: `No power generation detected during daytime. Device is online but generating ${stationData.generationPower}W. Expected: ${expectedProduction}W`,
            deviceSn,
            stationId: stationData.stationId || "unknown",
            data: stationData,
          });
        }
      }

      // Check battery SOC from station
      if (stationData.batterySOC !== undefined && stationData.batterySOC < 20) {
        anomalies.push({
          type: "battery_soc",
          severity: "warning",
          message: `Low battery SOC: ${stationData.batterySOC}%`,
          stationId: stationData.stationId || "unknown",
          deviceSn,
          data: stationData,
        });
      }

      // Correlate: Low PV + High Temperature
      if (
        stationData.generationPower !== undefined &&
        expectedProduction > 0 &&
        stationData.generationPower < expectedProduction * 0.5
      ) {
        const tempData = deviceData.dataList?.find(
          (d) =>
            d.key.toLowerCase().includes("temperature") ||
            d.key.toLowerCase().includes("temp")
        );
        if (tempData && parseFloat(tempData.value) > 60) {
          anomalies.push({
            type: "correlation",
            severity: "warning",
            message: `Low PV production (${stationData.generationPower}W) with high temperature (${tempData.value}°C) - Possible shading or panel issue`,
            deviceSn,
            data: {
              generationPower: stationData.generationPower,
              temperature: tempData.value,
            },
          });
        }
      }
    }

    return anomalies;
  }

  async detectPatterns(deviceSn) {
    const patterns = [];
    const deviceHistory = await getDeviceHistory(deviceSn, 30);

    if (deviceHistory.length < 7) {
      return patterns; // Need at least 7 days of data
    }

    // Check for declining efficiency trend
    const recentEfficiency = deviceHistory
      .slice(-7)
      .map((d) => d.efficiency || 0)
      .filter((e) => e > 0);
    const olderEfficiency = deviceHistory
      .slice(-30, -7)
      .map((d) => d.efficiency || 0)
      .filter((e) => e > 0);

    if (recentEfficiency.length > 0 && olderEfficiency.length > 0) {
      const recentAvg =
        recentEfficiency.reduce((a, b) => a + b, 0) / recentEfficiency.length;
      const olderAvg =
        olderEfficiency.reduce((a, b) => a + b, 0) / olderEfficiency.length;

      if (recentAvg < olderAvg * 0.9) {
        patterns.push({
          type: "declining_efficiency",
          severity: "warning",
          message: `Declining efficiency detected: ${recentAvg.toFixed(
            1
          )}% (was ${olderAvg.toFixed(1)}%)`,
          deviceSn,
          trend: "down",
        });
      }
    }

    // Check for repeated errors
    const errorCounts = new Map();
    deviceHistory.forEach((d) => {
      if (d.errorCode) {
        errorCounts.set(d.errorCode, (errorCounts.get(d.errorCode) || 0) + 1);
      }
    });

    errorCounts.forEach((count, errorCode) => {
      if (count >= 3) {
        patterns.push({
          type: "repeated_error",
          severity: "warning",
          message: `Error code ${errorCode} has occurred ${count} times in the last 30 days`,
          deviceSn,
          errorCode,
          count,
        });
      }
    });

    return patterns;
  }

  async sendAlert(anomaly, errorExplanation = null) {
    try {
      // Check cooldown (skip if bypassCooldown flag is set)
      if (!anomaly.bypassCooldown) {
        const hasRecent = await checkRecentAlert(
          anomaly.deviceSn,
          anomaly.type,
          3600000 // 1 hour cooldown
        );

        if (hasRecent) {
          console.log(
            `Skipping duplicate alert for ${anomaly.deviceSn} - ${anomaly.type}`
          );
          return;
        }
      }

      const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
      const smtpUser = process.env.SMTP_USER || "info@sunterrasolarenergy.com";
      const smtpPassword = process.env.SMTP_PASSWORD;
      const recipientEmail =
        anomaly.overrideRecipientEmail ||
        process.env.RECIPIENT_EMAIL ||
        "info@sunterrasolarenergy.com";

      if (!smtpPassword) {
        console.error("SMTP_PASSWORD not configured, cannot send alerts");
        return;
      }

      // Import nodemailer dynamically
      const nodemailer = (await import("nodemailer")).default;

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });

      const severity = (anomaly.severity || "warning").toUpperCase();
      const prettyType = anomaly.type
        ? anomaly.type.replace(/_/g, " ").toUpperCase()
        : "ALERT";

      const subject =
        severity === "CRITICAL"
          ? `[CRITICAL / URGENT] ${prettyType} - ${
              anomaly.deviceSn || "SOLAR SYSTEM"
            }`
          : `[${severity}] ${prettyType} - ${
              anomaly.deviceSn || "SOLAR SYSTEM"
            }`;

      let htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${
            anomaly.severity === "critical" ? "#dc2626" : "#f59e0b"
          };">
            ${
              anomaly.severity === "critical"
                ? "🔴 Critical Alert"
                : "⚠️ Warning Alert"
            }
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Alert Details</h3>
            <p><strong>Type:</strong> ${anomaly.type}</p>
            <p><strong>Severity:</strong> ${anomaly.severity}</p>
            <p><strong>Device:</strong> ${anomaly.deviceSn || "Unknown"}</p>
            <p><strong>Message:</strong> ${anomaly.message}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
      `;

      // Add AI explanation
      const aiInfo = errorExplanation || anomaly.aiRecommendation;
      if (aiInfo) {
        if (errorExplanation && errorExplanation.code) {
          htmlContent += `
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>AI Error Explanation</h3>
              <p><strong>Error Code:</strong> ${errorExplanation.code}</p>
              <p><strong>Error Name:</strong> ${errorExplanation.name}</p>
              <p><strong>Severity:</strong> ${errorExplanation.severity}</p>
              <p><strong>Cause:</strong> ${errorExplanation.cause}</p>
              <p><strong>Explanation:</strong> ${
                errorExplanation.explanation
              }</p>
              
              <h4>Troubleshooting Steps:</h4>
              <ol>
                ${errorExplanation.troubleshooting
                  .map((step) => `<li>${step}</li>`)
                  .join("")}
              </ol>
              
              <p><strong>Requires Onsite Visit:</strong> ${
                errorExplanation.requiresOnsite ? "Yes" : "No"
              }</p>
              <p><strong>Owner Can Fix:</strong> ${
                errorExplanation.ownerCanFix ? "Yes" : "No"
              }</p>
            </div>
          `;
        } else if (aiInfo.explanation) {
          htmlContent += `
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🤖 AI Recommendation</h3>
              <p><strong>Explanation:</strong> ${aiInfo.explanation}</p>
              
              ${
                aiInfo.possibleCauses && aiInfo.possibleCauses.length > 0
                  ? `
                <h4>Possible Causes:</h4>
                <ul>
                  ${aiInfo.possibleCauses
                    .map((cause) => `<li>${cause}</li>`)
                    .join("")}
                </ul>
              `
                  : ""
              }
              
              ${
                aiInfo.recommendedActions &&
                aiInfo.recommendedActions.length > 0
                  ? `
                <h4>Recommended Actions:</h4>
                <ol>
                  ${aiInfo.recommendedActions
                    .map((action) => `<li>${action}</li>`)
                    .join("")}
                </ol>
              `
                  : ""
              }
              
              <p><strong>Severity:</strong> ${aiInfo.severity || "warning"}</p>
              <p><strong>Owner Can Fix:</strong> ${
                aiInfo.ownerCanFix ? "Yes" : "No"
              }</p>
              <p><strong>Requires Onsite Visit:</strong> ${
                aiInfo.requiresOnsite ? "Yes" : "No"
              }</p>
            </div>
          `;
        }
      }

      htmlContent += `
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This is an automated alert from the Sunterra Solar Energy AI Monitoring System.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Sunterra Solar AI Monitor" <${smtpUser}>`,
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
      });

      // Save alert to database
      await saveAlert({
        ...anomaly,
        aiRecommendation: anomaly.aiRecommendation || errorExplanation,
        sent: true,
        recipientEmail: recipientEmail,
      });

      console.log(`Alert sent: ${anomaly.type} for device ${anomaly.deviceSn}`);
    } catch (error) {
      console.error("Failed to send alert email:", error);
    }
  }

  async monitorDevices() {
    try {
      console.log("Starting AI monitoring cycle...");

      // Get all stations with devices
      let allStations = [];
      let page = 1;
      const pageSize = 50;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await this.deyeCloudApi.getStationListWithDevices(
            page,
            pageSize
          );
          if (response.stationList && response.stationList.length > 0) {
            allStations.push(...response.stationList);
            if (response.stationList.length < pageSize) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
        } catch (error) {
          console.error("Error fetching stations:", error);
          hasMore = false;
        }
      }

      // Monitor each station and device
      for (const station of allStations) {
        try {
          // Get station latest data
          const stationData = await this.deyeCloudApi.getStationLatest(
            station.id
          );
          stationData.stationId = station.id;

          // Get devices for this station
          if (station.deviceListItems && station.deviceListItems.length > 0) {
            const deviceSns = station.deviceListItems.map((d) => d.deviceSn);
            const deviceDataList = await this.deyeCloudApi.getDeviceLatestData(
              deviceSns
            );

            for (const deviceData of deviceDataList.deviceDataList || []) {
              // Detect anomalies
              const anomalies = this.detectAnomalies(deviceData, stationData);

              if (anomalies.length > 0) {
                console.log(
                  `Detected ${anomalies.length} anomaly(ies) for device ${deviceData.deviceSn}`
                );
              }

              // Process each anomaly
              for (const anomaly of anomalies) {
                let errorExplanation = null;
                let aiRecommendation = null;

                // If it's an error code, get AI explanation
                if (anomaly.type === "error_code" && anomaly.errorCode) {
                  // Check if we already have explanation in database
                  errorExplanation = await getErrorCode(anomaly.errorCode);

                  if (!errorExplanation) {
                    // Get new explanation from LLM
                    errorExplanation = await getErrorExplanation(
                      anomaly.errorCode,
                      deviceData
                    );
                    // Save to database
                    await saveErrorCode(anomaly.errorCode, errorExplanation);
                  }
                } else {
                  // For other anomaly types, get AI recommendation
                  aiRecommendation = await getAIRecommendation(anomaly.type, {
                    message: anomaly.message,
                    deviceSn: anomaly.deviceSn,
                    stationId: anomaly.stationId,
                    data: anomaly.data,
                  });
                }

                // Store AI recommendation in anomaly
                anomaly.aiRecommendation = aiRecommendation || errorExplanation;

                // Send alert immediately
                await this.sendAlert(
                  anomaly,
                  errorExplanation || aiRecommendation
                );
              }

              // Update baseline
              await this.updateBaseline(deviceData.deviceSn, deviceData);

              // Detect patterns
              const patterns = await this.detectPatterns(deviceData.deviceSn);
              for (const pattern of patterns) {
                await this.sendAlert(pattern);
              }

              // Store in history
              await this.storeHistory(deviceData, stationData);
            }
          }
        } catch (error) {
          console.error(`Error monitoring station ${station.id}:`, error);
        }
      }

      console.log("AI monitoring cycle completed");
    } catch (error) {
      console.error("Error in AI monitoring:", error);
      throw error;
    }
  }

  async updateBaseline(deviceSn, deviceData) {
    let baseline = await getDeviceBaseline(deviceSn);
    if (!baseline) {
      baseline = this.getDefaultBaseline();
    }

    // Update baseline with moving average
    if (deviceData.dataList) {
      deviceData.dataList.forEach((item) => {
        const key = item.key.toLowerCase();
        const value = parseFloat(item.value) || 0;

        if (key.includes("voltage") && !key.includes("battery")) {
          baseline.voltage = baseline.voltage * 0.9 + value * 0.1;
        }
        if (key.includes("temperature") || key.includes("temp")) {
          baseline.temperature = baseline.temperature * 0.9 + value * 0.1;
        }
      });
    }

    await updateDeviceBaseline(deviceSn, baseline);
  }

  async storeHistory(deviceData, stationData) {
    const historyEntry = {
      timestamp: Date.now(),
      deviceSn: deviceData.deviceSn,
      deviceType: deviceData.deviceType,
      deviceState: deviceData.deviceState,
      data: deviceData.dataList || [],
      stationId: stationData?.stationId,
      generationPower: stationData?.generationPower,
      consumptionPower: stationData?.consumptionPower,
      batterySOC: stationData?.batterySOC,
      efficiency: stationData?.generationPower
        ? (stationData.generationPower /
            (stationData.installedCapacity || 5000)) *
          100
        : null,
      errorCode: this.extractErrorCode(deviceData),
    };

    await saveDeviceHistory(historyEntry);
  }

  extractErrorCode(deviceData) {
    if (deviceData.dataList) {
      for (const item of deviceData.dataList) {
        const key = item.key.toLowerCase();
        if (key.includes("error") || key.includes("fault")) {
          const value = parseFloat(item.value) || 0;
          if (value !== 0) {
            return value.toString();
          }
        }
      }
    }
    return null;
  }
}

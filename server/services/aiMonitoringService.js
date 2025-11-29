// AI Monitoring Service
// Real-time anomaly detection and error code analysis

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to mask email addresses in logs
const maskEmailForLog = (email) => {
  if (!email) return "N/A";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.length > 2 ? local.slice(-2) : local;
  return `${"*".repeat(Math.max(2, local.length - 2))}${visible}@${domain}`;
};

class AIMonitoringService {
  constructor(deyeCloudApi) {
    this.deyeCloudApi = deyeCloudApi;
    this.errorCodeDatabase = new Map();
    this.alertHistory = [];
    this.deviceBaselines = new Map(); // Store baseline metrics for each device
    this.monitoringInterval = null;
    this.ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    this.dataHistory = []; // Store 30 days of data
    this.maxHistoryDays = 30;

    // Load error code database
    this.loadErrorCodeDatabase();
  }

  // Load error code database from file
  async loadErrorCodeDatabase() {
    try {
      const dbPath = path.join(__dirname, "../data/errorCodes.json");
      const data = await fs.readFile(dbPath, "utf8");
      const codes = JSON.parse(data);
      codes.forEach((code) => {
        this.errorCodeDatabase.set(code.code, code);
      });
      console.log(
        `Loaded ${this.errorCodeDatabase.size} error codes from database`
      );
    } catch (error) {
      // File doesn't exist yet, will be created as we collect codes
      console.log("Error code database not found, will create new one");
    }
  }

  // Save error code database to file
  async saveErrorCodeDatabase() {
    try {
      const dbPath = path.join(__dirname, "../data/errorCodes.json");
      const dbDir = path.dirname(dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      const codes = Array.from(this.errorCodeDatabase.values());
      await fs.writeFile(dbPath, JSON.stringify(codes, null, 2), "utf8");
    } catch (error) {
      console.error("Failed to save error code database:", error);
    }
  }

  // Get AI recommendation for any anomaly type
  async getAIRecommendation(anomalyType, anomalyData = {}) {
    try {
      // Call Ollama API for general recommendations
      const prompt = `You are a solar energy system expert. A user has a Deye solar inverter system with the following issue:

Issue Type: ${anomalyType}
Details: ${JSON.stringify(anomalyData, null, 2)}

Provide a helpful recommendation in JSON format:
{
  "issue": "${anomalyType}",
  "explanation": "Clear explanation of what this issue means",
  "possibleCauses": ["Cause 1", "Cause 2", "Cause 3"],
  "recommendedActions": ["Action 1", "Action 2", "Action 3"],
  "severity": "info|warning|critical",
  "ownerCanFix": true/false,
  "requiresOnsite": true/false
}

Be specific and practical. Focus on Deye inverters and common solar system issues.`;

      const fetchFn =
        typeof fetch !== "undefined"
          ? fetch
          : (await import("node-fetch")).default;

      const response = await fetchFn(`${this.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || "qwen3:8b",
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      let explanationText = data.response || "";

      // Try to extract JSON from response
      let recommendation = null;
      try {
        const jsonMatch = explanationText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recommendation = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: create structure from text
          recommendation = {
            issue: anomalyType,
            explanation: explanationText,
            possibleCauses: ["Check device status", "Review system logs"],
            recommendedActions: ["Contact support if issue persists"],
            severity: "warning",
            ownerCanFix: false,
            requiresOnsite: true,
          };
        }
      } catch (parseError) {
        recommendation = {
          issue: anomalyType,
          explanation: explanationText,
          possibleCauses: ["Unknown"],
          recommendedActions: ["Check device manual", "Contact support"],
          severity: "warning",
          ownerCanFix: false,
          requiresOnsite: true,
        };
      }

      return recommendation;
    } catch (error) {
      console.error("Failed to get AI recommendation:", error);
      // Return basic recommendation if Ollama fails
      return {
        issue: anomalyType,
        explanation: `Issue detected: ${anomalyType}. AI recommendation service is currently unavailable.`,
        possibleCauses: ["Check device status"],
        recommendedActions: ["Review system logs", "Contact support"],
        severity: "warning",
        ownerCanFix: false,
        requiresOnsite: true,
      };
    }
  }

  // Get AI explanation for error code using Ollama
  async getErrorExplanation(errorCode, deviceData = {}) {
    // Check if we already have explanation in database
    const cached = this.errorCodeDatabase.get(errorCode);
    if (cached && cached.explanation) {
      return cached;
    }

    try {
      // Call Ollama API
      const prompt = `You are a solar inverter technical expert. Explain this Deye inverter error code: ${errorCode}

Device context:
${JSON.stringify(deviceData, null, 2)}

Provide a detailed explanation in JSON format with these fields:
{
  "code": "${errorCode}",
  "name": "Error name/title",
  "severity": "info|warning|critical",
  "cause": "What likely caused this error",
  "explanation": "Detailed explanation of the error",
  "troubleshooting": ["Step 1", "Step 2", "Step 3"],
  "requiresOnsite": true/false,
  "ownerCanFix": true/false
}

Be specific and technical. Focus on Deye inverters.`;

      // Use dynamic import for fetch if not available (Node 18+ has fetch built-in)
      const fetchFn =
        typeof fetch !== "undefined"
          ? fetch
          : (await import("node-fetch")).default;

      const response = await fetchFn(`${this.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || "llama3.2",
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      let explanationText = data.response || "";

      // Try to extract JSON from response
      let explanation = null;
      try {
        // Find JSON in response
        const jsonMatch = explanationText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          explanation = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: create structure from text
          explanation = {
            code: errorCode,
            name: `Error ${errorCode}`,
            severity: "warning",
            cause: "Unknown",
            explanation: explanationText,
            troubleshooting: ["Check device manual", "Contact support"],
            requiresOnsite: true,
            ownerCanFix: false,
          };
        }
      } catch (parseError) {
        // If JSON parsing fails, create basic structure
        explanation = {
          code: errorCode,
          name: `Error ${errorCode}`,
          severity: "warning",
          cause: "Unknown",
          explanation: explanationText,
          troubleshooting: ["Check device manual", "Contact support"],
          requiresOnsite: true,
          ownerCanFix: false,
        };
      }

      // Save to database
      this.errorCodeDatabase.set(errorCode, explanation);
      await this.saveErrorCodeDatabase();

      return explanation;
    } catch (error) {
      console.error("Failed to get AI explanation:", error);
      // Return basic structure if Ollama fails
      return {
        code: errorCode,
        name: `Error ${errorCode}`,
        severity: "warning",
        cause: "Unknown - AI service unavailable",
        explanation: `Error code ${errorCode} detected. AI explanation service is currently unavailable.`,
        troubleshooting: [
          "Check device status",
          "Review device logs",
          "Contact support",
        ],
        requiresOnsite: true,
        ownerCanFix: false,
      };
    }
  }

  // Detect anomalies in device data
  detectAnomalies(deviceData, stationData = null) {
    const anomalies = [];
    const deviceSn = deviceData.deviceSn || "unknown";
    const baseline =
      this.deviceBaselines.get(deviceSn) || this.getDefaultBaseline();

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
      // Calculate expected production once for use in multiple checks
      const expectedProduction = this.getExpectedProduction(stationData);

      // Check PV production
      if (stationData.generationPower !== undefined) {
        const hour = new Date().getHours();
        const isDaytime = hour >= 6 && hour < 18;

        // Check for zero production during daytime
        // Also check if generationPower is very close to 0 (less than 1W) to catch edge cases
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
          console.log(
            `[AI Monitoring] Detected no_production for device ${deviceSn}: generationPower=${stationData.generationPower}W, expected=${expectedProduction}W, isDaytime=${isDaytime}`
          );
        }
      }

      // Check battery SOC from station
      if (stationData.batterySOC !== undefined && stationData.batterySOC < 20) {
        anomalies.push({
          type: "battery_soc",
          severity: "warning",
          message: `Low battery SOC: ${stationData.batterySOC}%`,
          stationId: stationData.stationId || "unknown",
          data: stationData,
        });
      }

      // Correlate: Low PV + High Temperature = Possible shading/panel issue
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

  // Get default baseline values
  getDefaultBaseline() {
    return {
      voltage: 230,
      frequency: 50,
      temperature: 25,
      production: 0,
    };
  }

  // Calculate expected production based on time of day and capacity
  getExpectedProduction(stationData) {
    const hour = new Date().getHours();
    const capacity = stationData.installedCapacity || 5000; // Default 5kW

    // Simple model: peak production around noon (10-14), zero at night
    let expectedFactor = 0;
    if (hour >= 6 && hour <= 18) {
      // Daytime
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

  // Detect patterns in historical data
  detectPatterns(deviceSn) {
    const patterns = [];
    const deviceHistory = this.dataHistory.filter(
      (d) => d.deviceSn === deviceSn
    );

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

  // Send email alert
  async sendAlert(anomaly, errorExplanation = null) {
    try {
      console.log(
        `[sendAlert] Starting alert send for type: ${anomaly.type}, device: ${anomaly.deviceSn}`
      );

      // Check if we've already sent this alert recently (avoid spam)
      // Skip cooldown check if bypassCooldown flag is set (for test emails)
      if (!anomaly.bypassCooldown) {
        const recentAlert = this.alertHistory.find(
          (a) =>
            a.deviceSn === anomaly.deviceSn &&
            a.type === anomaly.type &&
            Date.now() - a.timestamp < 3600000
        ); // 1 hour cooldown

        if (recentAlert) {
          console.log(
            `[sendAlert] Skipping duplicate alert (sent ${Math.round(
              (Date.now() - recentAlert.timestamp) / 1000 / 60
            )} minutes ago)`
          );
          return; // Skip duplicate alert
        }
      } else {
        console.log(`[sendAlert] Bypassing cooldown check (test email)`);
      }

      const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
      const smtpUser = process.env.SMTP_USER || "info@sunterrasolarenergy.com";
      const smtpPassword = process.env.SMTP_PASSWORD;
      const recipientEmail =
        anomaly.overrideRecipientEmail ||
        process.env.RECIPIENT_EMAIL ||
        "info@sunterrasolarenergy.com";

      // Mask email addresses in logs for security
      console.log(
        `[sendAlert] SMTP Config - Host: ${smtpHost}, Port: ${smtpPort}, User: ${maskEmailForLog(
          smtpUser
        )}, Recipient: ${maskEmailForLog(recipientEmail)}`
      );

      if (!smtpPassword) {
        console.error(
          "[sendAlert] SMTP_PASSWORD not configured, cannot send alerts"
        );
        return;
      }

      console.log(`[sendAlert] Creating SMTP transporter...`);

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });

      // Build email subject (make critical alerts clearly urgent)
      const severity = (anomaly.severity || "warning").toUpperCase();
      const prettyType = anomaly.type
        ? anomaly.type.replace(/_/g, " ").toUpperCase()
        : "ALERT";

      let subject;
      if (severity === "CRITICAL") {
        subject = `[CRITICAL / URGENT] ${prettyType} - ${
          anomaly.deviceSn || "SOLAR SYSTEM"
        }`;
      } else {
        subject = `[${severity}] ${prettyType} - ${
          anomaly.deviceSn || "SOLAR SYSTEM"
        }`;
      }
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

      // Show AI explanation or recommendation
      const aiInfo = errorExplanation || anomaly.aiRecommendation;
      if (aiInfo) {
        if (errorExplanation && errorExplanation.code) {
          // Error code explanation
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
          // General AI recommendation
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

      // Mask email in logs
      console.log(
        `[sendAlert] Sending email to ${maskEmailForLog(
          recipientEmail
        )} with subject: ${subject}`
      );
      await transporter.sendMail({
        from: `"Sunterra Solar AI Monitor" <${smtpUser}>`,
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
      });

      // Record alert in history (include AI recommendation and recipient email)
      this.alertHistory.push({
        ...anomaly,
        aiRecommendation: anomaly.aiRecommendation || errorExplanation,
        timestamp: Date.now(),
        sent: true,
        recipientEmail: recipientEmail, // Store recipient email for display
      });

      // Keep only last 1000 alerts in memory
      if (this.alertHistory.length > 1000) {
        this.alertHistory = this.alertHistory.slice(-1000);
      }

      console.log(`Alert sent: ${anomaly.type} for device ${anomaly.deviceSn}`);
      // Mask email in logs
      console.log(`Email sent to: ${maskEmailForLog(recipientEmail)}`);
    } catch (error) {
      console.error("Failed to send alert email:", error);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error response:", error.response);
      if (error.stack) {
        console.error("Error stack:", error.stack);
      }
    }
  }

  // Monitor devices in real-time
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

              // Log detected anomalies for debugging
              if (anomalies.length > 0) {
                console.log(
                  `Detected ${anomalies.length} anomaly(ies) for device ${deviceData.deviceSn}:`,
                  anomalies.map((a) => ({ type: a.type, message: a.message }))
                );
              }

              // Process each anomaly
              for (const anomaly of anomalies) {
                let errorExplanation = null;
                let aiRecommendation = null;

                // If it's an error code, get AI explanation
                if (anomaly.type === "error_code" && anomaly.errorCode) {
                  errorExplanation = await this.getErrorExplanation(
                    anomaly.errorCode,
                    deviceData
                  );
                } else {
                  // For other anomaly types, get AI recommendation
                  aiRecommendation = await this.getAIRecommendation(
                    anomaly.type,
                    {
                      message: anomaly.message,
                      deviceSn: anomaly.deviceSn,
                      stationId: anomaly.stationId,
                      data: anomaly.data,
                    }
                  );
                }

                // Store AI recommendation in anomaly for frontend
                anomaly.aiRecommendation = aiRecommendation || errorExplanation;

                // Send alert immediately
                await this.sendAlert(
                  anomaly,
                  errorExplanation || aiRecommendation
                );
              }

              // Update baseline
              this.updateBaseline(deviceData.deviceSn, deviceData);

              // Detect patterns
              const patterns = this.detectPatterns(deviceData.deviceSn);
              for (const pattern of patterns) {
                await this.sendAlert(pattern);
              }

              // Store in history
              this.storeHistory(deviceData, stationData);
            }
          }
        } catch (error) {
          console.error(`Error monitoring station ${station.id}:`, error);
        }
      }

      // Clean old history (keep only 30 days)
      this.cleanHistory();

      console.log("AI monitoring cycle completed");
    } catch (error) {
      console.error("Error in AI monitoring:", error);
    }
  }

  // Update device baseline
  updateBaseline(deviceSn, deviceData) {
    if (!this.deviceBaselines.has(deviceSn)) {
      this.deviceBaselines.set(deviceSn, this.getDefaultBaseline());
    }

    const baseline = this.deviceBaselines.get(deviceSn);

    // Update baseline with moving average
    if (deviceData.dataList) {
      deviceData.dataList.forEach((item) => {
        const key = item.key.toLowerCase();
        const value = parseFloat(item.value) || 0;

        if (key.includes("voltage") && !key.includes("battery")) {
          baseline.voltage = baseline.voltage * 0.9 + value * 0.1; // Moving average
        }
        if (key.includes("temperature") || key.includes("temp")) {
          baseline.temperature = baseline.temperature * 0.9 + value * 0.1;
        }
      });
    }
  }

  // Store data in history
  storeHistory(deviceData, stationData) {
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

    this.dataHistory.push(historyEntry);

    // Keep only last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.dataHistory = this.dataHistory.filter(
      (entry) => entry.timestamp > thirtyDaysAgo
    );
  }

  // Extract error code from device data
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

  // Clean old history
  cleanHistory() {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.dataHistory = this.dataHistory.filter(
      (entry) => entry.timestamp > thirtyDaysAgo
    );
  }

  // Start monitoring (call this to begin real-time monitoring)
  startMonitoring(intervalSeconds = 60) {
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    console.log(`Starting AI monitoring with ${intervalSeconds}s interval`);
    this.monitorDevices(); // Run immediately
    this.monitoringInterval = setInterval(() => {
      this.monitorDevices();
    }, intervalSeconds * 1000);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log("AI monitoring stopped");
    }
  }

  // Get alert history (excluding example alerts like voltage, device_state, and low_production)
  getAlertHistory(limit = 100) {
    const filtered = this.alertHistory.filter(
      (alert) =>
        alert.type !== "voltage" &&
        alert.type !== "device_state" &&
        alert.type !== "low_production"
    );
    return filtered.slice(-limit).reverse();
  }

  // Get error code database
  getErrorCodeDatabase() {
    return Array.from(this.errorCodeDatabase.values());
  }
}

export default AIMonitoringService;

// Vercel Cron Job: AI Monitoring
// Runs every minute to monitor solar devices

import { DeyeCloudApi } from "../lib/deye-cloud-api.js";
import { MonitoringService } from "../lib/monitoring-service.js";

export default async function handler(req, res) {
  // Verify this is a cron request
  // Vercel automatically adds an Authorization header with a bearer token
  // You can optionally verify it with CRON_SECRET, or trust Vercel's authentication
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, verify it matches
  // Otherwise, trust Vercel's built-in cron authentication
  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    // Vercel automatically authenticates cron jobs, but you can add additional checks here
    // For example, check for Vercel's cron-specific headers
    if (!authHeader) {
      console.warn("Cron job called without authorization header");
    }
  }

  try {
    console.log(`[Cron] Monitoring job started at ${new Date().toISOString()}`);

    // Initialize services
    const deyeCloudApi = new DeyeCloudApi();
    const monitoringService = new MonitoringService(deyeCloudApi);

    // Run monitoring cycle
    await monitoringService.monitorDevices();

    console.log(
      `[Cron] Monitoring job completed at ${new Date().toISOString()}`
    );

    return res.status(200).json({
      success: true,
      message: "Monitoring cycle completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Monitoring job failed:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

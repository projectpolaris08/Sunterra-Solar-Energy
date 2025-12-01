// Cron job to check emails for new leads every 30 minutes
import { checkEmailsForLeads } from "../lib/email-monitor.js";

export default async function handler(req, res) {
  // Only allow GET requests (Vercel cron jobs use GET)
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    console.log("[EMAIL CHECK] Starting email check for leads...");
    const result = await checkEmailsForLeads();
    
    console.log(`[EMAIL CHECK] Completed: ${result.message || "Success"}`);
    if (result.leads && result.leads.length > 0) {
      console.log(`[EMAIL CHECK] Found ${result.leads.length} new lead(s)`);
    }

    return res.status(200).json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[EMAIL CHECK] Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
}


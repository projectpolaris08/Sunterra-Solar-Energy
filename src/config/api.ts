// API Configuration
// This file centralizes all API endpoint URLs

// Vercel API base URL (for serverless functions)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://sunterra-solar-energy.vercel.app";

// Deye Cloud API proxy URL (also on Vercel)
// Always use API_BASE_URL for production, never localhost
export const DEYE_PROXY_URL =
  import.meta.env.VITE_PROXY_URL &&
  !import.meta.env.VITE_PROXY_URL.includes("localhost")
    ? import.meta.env.VITE_PROXY_URL
    : `${API_BASE_URL}/api/deye`;

// AI Monitoring API endpoints (consolidated to reduce serverless function count)
export const AI_MONITORING_API = {
  alerts: `${API_BASE_URL}/api/ai-monitoring?action=alerts`,
  errorCodes: `${API_BASE_URL}/api/ai-monitoring?action=error-codes`,
  trigger: `${API_BASE_URL}/api/ai-monitoring?action=trigger`,
  delete: (id: string | number) =>
    `${API_BASE_URL}/api/ai-monitoring?action=delete&id=${id}`,
};

import { useState, useEffect } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import ChartCard from "../components/dashboard/ChartCard";
import { supabase } from "../lib/supabase";
import { API_BASE_URL } from "../config/api";
import {
  Bell,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Settings,
} from "lucide-react";

interface AdminNotificationsProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

interface Notification {
  id: number | string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  source?: "monitoring" | "system";
}

export default function AdminNotifications({
  onNavigate,
  currentPage = "admin-notifications",
}: AdminNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string | number>>(
    new Set(JSON.parse(localStorage.getItem("dismissed_notifications") || "[]"))
  );
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [emailCheckModal, setEmailCheckModal] = useState<{
    isOpen: boolean;
    message: string;
    leadsCount: number;
    error?: string;
  }>({
    isOpen: false,
    message: "",
    leadsCount: 0,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const todayCount = notifications.filter((n) => {
    const today = new Date().toDateString();
    const notificationDate = new Date(n.timestamp).toDateString();
    return notificationDate === today;
  }).length;

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  // Fetch notifications directly from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }

        // Fetch general notifications from notifications table
        const { data: notificationsData, error: notificationsError } =
          await supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

        let generalNotifications: Notification[] = [];
        if (!notificationsError && notificationsData) {
          generalNotifications = notificationsData.map((n: any) => ({
            id: typeof n.id === "number" ? n.id : parseInt(n.id) || n.id, // Ensure numeric ID for system notifications
            type: (n.type || "info") as
              | "info"
              | "success"
              | "warning"
              | "error",
            title: n.title,
            message: n.message,
            timestamp: n.created_at || n.timestamp,
            read: n.read || false,
            source: "system" as const,
          }));
        }

        // Fetch monitoring alerts from monitoring_alerts table
        const { data: alertsData, error: alertsError } = await supabase
          .from("monitoring_alerts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        let monitoringNotifications: Notification[] = [];
        if (!alertsError && alertsData) {
          monitoringNotifications = alertsData.map((alert: any) => {
            // Map alert severity to notification type
            let type: "info" | "success" | "warning" | "error" = "info";
            if (alert.severity === "critical" || alert.severity === "high") {
              type = "error";
            } else if (alert.severity === "medium") {
              type = "warning";
            } else if (alert.severity === "low") {
              type = "info";
            }

            // Format timestamp
            const alertDate = alert.created_at
              ? new Date(alert.created_at)
              : alert.timestamp
              ? new Date(alert.timestamp)
              : new Date();

            return {
              id: `monitoring-${alert.id || alert.device_sn || Date.now()}-${
                alert.created_at
              }`,
              type,
              title:
                alert.message ||
                `Device Alert: ${alert.device_sn || "Unknown"}`,
              message: alert.ai_recommendation
                ? `${alert.message || "System alert"}. ${
                    alert.ai_recommendation
                  }`
                : alert.message || "System monitoring alert",
              timestamp: alertDate.toISOString(),
              read: false,
              source: "monitoring" as const,
            };
          });
        }

        // Combine and sort by timestamp (newest first), filter out dismissed
        const allNotifications = [
          ...generalNotifications,
          ...monitoringNotifications,
        ]
          .filter((n) => !dismissedIds.has(n.id)) // Filter out dismissed notifications
          .sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateB - dateA;
          });

        setNotifications(allNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        );
      case "warning":
        return (
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        );
      case "error":
        return (
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        );
      default:
        return <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 dark:bg-emerald-900/30";
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/30";
      case "error":
        return "bg-red-50 dark:bg-red-900/30";
      default:
        return "bg-blue-50 dark:bg-blue-900/30";
    }
  };

  const markAsRead = async (id: number | string) => {
    // Optimistically update UI
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Update in database if it's a system notification (has numeric ID)
    if (typeof id === "number" && supabase) {
      try {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  const markAllAsRead = async () => {
    // Optimistically update UI
    setNotifications(notifications.map((n) => ({ ...n, read: true })));

    // Update all system notifications in database
    if (supabase) {
      try {
        const systemNotificationIds = notifications
          .filter((n) => typeof n.id === "number")
          .map((n) => n.id as number);

        if (systemNotificationIds.length > 0) {
          await supabase
            .from("notifications")
            .update({ read: true })
            .in("id", systemNotificationIds);
        }
      } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
      }
    }
  };

  // Modern notification dismiss - instant, no confirmation needed
  const dismissNotification = async (id: number | string) => {
    // Add to dismissed set
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    localStorage.setItem(
      "dismissed_notifications",
      JSON.stringify(Array.from(newDismissed))
    );

    // Set deleting state for animation
    setDeletingId(id);

    // Remove from UI after animation
    setTimeout(() => {
      setNotifications(notifications.filter((n) => n.id !== id));
      setDeletingId(null);
    }, 300);

    // For system notifications, also delete from database
    if (typeof id === "number" && supabase) {
      try {
        await supabase.from("notifications").delete().eq("id", id);
      } catch (error) {
        console.error("Failed to delete notification from database:", error);
      }
    }
    // For monitoring alerts, we just hide them (don't delete from database)
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with system alerts and activities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(
                    `${API_BASE_URL}/api/email/check`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  const contentType = response.headers.get("content-type");
                  if (
                    !contentType ||
                    !contentType.includes("application/json")
                  ) {
                    const text = await response.text();
                    console.error("Non-JSON response:", text.substring(0, 200));
                    throw new Error(
                      `Server returned ${response.status}. The email check endpoint may not be available.`
                    );
                  }

                  if (!response.ok) {
                    const errorData = await response
                      .json()
                      .catch(() => ({ message: `HTTP ${response.status}` }));
                    throw new Error(
                      errorData.message || `HTTP ${response.status}`
                    );
                  }

                  const result = await response.json();
                  if (result.success) {
                    const leadsCount = result.leads?.length || 0;
                    setEmailCheckModal({
                      isOpen: true,
                      message: `Email check completed! ${leadsCount} new lead(s) found.`,
                      leadsCount: leadsCount,
                    });
                    // Refresh notifications after checking emails
                    setTimeout(() => {
                      window.location.reload();
                    }, 2000);
                  } else {
                    setEmailCheckModal({
                      isOpen: true,
                      message: result.message || "No new emails found.",
                      leadsCount: 0,
                    });
                  }
                } catch (error) {
                  console.error("Failed to check emails:", error);
                  setEmailCheckModal({
                    isOpen: true,
                    message: "",
                    leadsCount: 0,
                    error:
                      error instanceof Error
                        ? error.message
                        : "Please try again.",
                  });
                }
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Check Emails Now
            </button>
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 font-medium hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark All Read
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/20 text-gray-700 font-medium hover:bg-white/90 transition-all duration-200 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {notifications.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Unread
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {unreadCount}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30">
                <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Read
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {notifications.length - unreadCount}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Today
                </p>
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  {todayCount}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/30">
                <Bell className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <ChartCard title="All Notifications" className="mb-6">
          {loading ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                No notifications yet
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Monitoring alerts and system notifications will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                    deletingId === notification.id
                      ? "opacity-0 scale-95 -translate-x-4 pointer-events-none"
                      : notification.read
                      ? "bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/30"
                      : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-200/50 dark:border-blue-700/50 shadow-md"
                  }`}
                >
                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-l-2xl"></div>
                  )}

                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 p-3 rounded-xl ${getBgColor(
                      notification.type
                    )}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <h3
                          className={`font-bold text-base ${
                            notification.read
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-all duration-200 opacity-0 group-hover:opacity-100"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            dismissNotification(notification.id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-110 active:scale-95"
                          title="Dismiss notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-500">
                        {formatTimeAgo(new Date(notification.timestamp))}
                      </p>
                      {notification.source === "monitoring" && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          Monitoring
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Email Check Result Modal */}
      {emailCheckModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                {emailCheckModal.error ? (
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                ) : emailCheckModal.leadsCount > 0 ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Info className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                {emailCheckModal.error
                  ? "Email Check Failed"
                  : "Email Check Completed"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                {emailCheckModal.error ||
                  emailCheckModal.message ||
                  "No new emails found."}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() =>
                    setEmailCheckModal({
                      isOpen: false,
                      message: "",
                      leadsCount: 0,
                    })
                  }
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

import { useState } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import ChartCard from "../components/dashboard/ChartCard";
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
  id: number;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function AdminNotifications({
  onNavigate,
  currentPage = "admin-notifications",
}: AdminNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "success",
      title: "Installation Completed",
      message:
        "Solar panel installation for Project #156 has been successfully completed.",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "Maintenance Due",
      message: "Scheduled maintenance for System ID: SYS-045 is due in 3 days.",
      timestamp: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "New Project Proposal",
      message:
        "A new project proposal has been submitted by John Doe. Review required.",
      timestamp: "1 day ago",
      read: true,
    },
    {
      id: 4,
      type: "error",
      title: "System Alert",
      message:
        "Energy generation dropped below threshold for System ID: SYS-023.",
      timestamp: "1 day ago",
      read: false,
    },
    {
      id: 5,
      type: "success",
      title: "Payment Received",
      message: "Payment of $5,000 has been received for Invoice #INV-789.",
      timestamp: "2 days ago",
      read: true,
    },
    {
      id: 6,
      type: "info",
      title: "Team Update",
      message:
        "New team member Sarah Smith has been added to the installation team.",
      timestamp: "3 days ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
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
                  3
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
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                  notification.read
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
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-500">
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </AdminLayout>
  );
}

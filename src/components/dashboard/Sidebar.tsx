import {
  LucideIcon,
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  FileText,
  Bell,
  LogOut,
  Calendar,
  Activity,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "admin" },
  { name: "Analytics", icon: BarChart3, path: "admin-analytics" },
  { name: "Clients", icon: Users, path: "admin-users" },
  { name: "Calendar", icon: Calendar, path: "admin-calendar" },
  { name: "Monitoring", icon: Activity, path: "admin-monitoring" },
  { name: "Reports", icon: FileText, path: "admin-reports" },
  { name: "Notifications", icon: Bell, path: "admin-notifications" },
  { name: "Settings", icon: Settings, path: "admin-settings" },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate("home");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20 shadow-xl z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <img
              src="/images/sunterra.svg"
              alt="Sunterra Solar Energy Philippines"
              className="h-10 w-auto"
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Sunterra Solar
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-md"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

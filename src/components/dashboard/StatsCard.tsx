import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  gradient: string;
}

export default function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  gradient,
}: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 opacity-10 ${gradient} group-hover:opacity-20 transition-opacity duration-300`}
      />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl ${gradient} bg-opacity-20 backdrop-blur-sm`}
          >
            <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </div>
          {change && (
            <span
              className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                trend === "up"
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-red-600 bg-red-50"
              }`}
            >
              {trend === "up" ? "↑" : "↓"} {change}
            </span>
          )}
        </div>

        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

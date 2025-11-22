import { ReactNode } from "react";

interface ChartCardProps {
  title: string | ReactNode;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6 ${className}`}
    >
      <div className="mb-6">
        {typeof title === "string" ? (
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
        ) : (
          <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {title}
          </div>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

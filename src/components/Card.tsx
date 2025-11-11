import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  hover = true,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-100 dark:border-gray-700 rounded-2xl shadow-md dark:shadow-gray-900/50 p-6 ${
        hover
          ? "transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900 hover:-translate-y-1"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

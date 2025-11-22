import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./Header";

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function AdminLayout({
  children,
  currentPage,
  onNavigate,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="ml-64">
        <DashboardHeader />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

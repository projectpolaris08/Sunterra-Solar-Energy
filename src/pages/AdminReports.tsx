import AdminLayout from "../components/dashboard/AdminLayout";
import ChartCard from "../components/dashboard/ChartCard";
import { Download, FileText, Calendar, Filter, Printer } from "lucide-react";

interface AdminReportsProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

interface Report {
  id: number;
  title: string;
  type: string;
  generatedDate: string;
  period: string;
  size: string;
  status: "ready" | "generating";
}

export default function AdminReports({
  onNavigate,
  currentPage = "admin-reports",
}: AdminReportsProps) {
  const reports: Report[] = [];
  const reportTypes = [
    { name: "Sales", count: 0, color: "blue" },
    { name: "Financial", count: 0, color: "emerald" },
    { name: "Marketing", count: 0, color: "purple" },
    { name: "Operations", count: 0, color: "orange" },
    { name: "Projects", count: 0, color: "cyan" },
  ];

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate and manage business reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 font-medium hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {reportTypes.map((type, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {type.name}
                </h3>
                <FileText
                  className={`w-5 h-5 text-${type.color}-600 dark:text-${type.color}-400`}
                />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {type.count}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Reports
              </p>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <ChartCard title="Recent Reports" className="mb-6">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                No reports generated yet
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Use the "Generate Report" button above to create your first report
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {report.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {report.generatedDate}
                        </span>
                        <span>•</span>
                        <span>{report.period}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      {report.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChartCard title="Generate Custom Report">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create a customized report based on your specific requirements.
            </p>
            <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40">
              Create Report
            </button>
          </ChartCard>
          <ChartCard title="Schedule Reports">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Set up automated report generation on a regular schedule.
            </p>
            <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40">
              Schedule
            </button>
          </ChartCard>
          <ChartCard title="Export Data">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Export raw data in various formats (CSV, Excel, PDF).
            </p>
            <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40">
              Export
            </button>
          </ChartCard>
        </div>
      </div>
    </AdminLayout>
  );
}

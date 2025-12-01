import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import AdminLayout from "../components/dashboard/AdminLayout";
import ChartCard from "../components/dashboard/ChartCard";
import StatsCard from "../components/dashboard/StatsCard";
import { Mail, Users, Target, Zap, Phone } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AdminAnalyticsProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export default function AdminAnalytics({
  onNavigate,
  currentPage = "admin-analytics",
}: AdminAnalyticsProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch leads and clients from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }

        // Fetch leads
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false });

        if (leadsError) throw leadsError;
        setLeads(leadsData || []);

        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("*")
          .order("join_date", { ascending: false });

        if (clientsError) throw clientsError;
        setClients(clientsData || []);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate performance data from real leads
  const getPerformanceData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const currentMonth = new Date().getMonth();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      const monthStart = new Date(new Date().getFullYear(), monthIndex, 1);
      const monthEnd = new Date(new Date().getFullYear(), monthIndex + 1, 0);

      const monthLeads = leads.filter((lead) => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= monthStart && leadDate <= monthEnd;
      });

      const monthClients = clients.filter((client) => {
        const clientDate = new Date(client.join_date);
        return clientDate >= monthStart && clientDate <= monthEnd;
      });

      data.push({
        month: monthName,
        sales: monthClients.length,
        leads: monthLeads.length,
        conversions: monthClients.length, // Clients converted from leads
      });
    }

    return data;
  };

  // Calculate lead sources
  const getConversionData = () => {
    const sources: { [key: string]: number } = {};

    leads.forEach((lead) => {
      const source = lead.source || "email";
      sources[source] = (sources[source] || 0) + 1;
    });

    const colors: { [key: string]: string } = {
      email: "#ef4444", // Red
      website: "#3b82f6", // Blue
      referral: "#06b6d4", // Cyan
      "social media": "#8b5cf6", // Purple
      direct: "#f59e0b", // Amber
      manual: "#6b7280", // Gray
      phone: "#10b981", // Green
      facebook: "#1877f2", // Facebook Blue
      instagram: "#e4405f", // Instagram Pink
      linkedin: "#0077b5", // LinkedIn Blue
      tiktok: "#000000", // TikTok Black
      reddit: "#ff4500", // Reddit Orange
      viber: "#665cac", // Viber Purple
      twitter: "#1da1f2", // Twitter Blue
      youtube: "#ff0000", // YouTube Red
      google: "#4285f4", // Google Blue
    };

    return Object.entries(sources).map(([name, value]) => {
      // Format name for display (capitalize first letter, handle camelCase)
      const displayName = name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      return {
        name: displayName,
        value,
        color: colors[name.toLowerCase()] || "#6b7280",
      };
    });
  };

  const performanceData = getPerformanceData();
  const conversionData = getConversionData();

  // Calculate KPIs
  const totalLeads = leads.length;
  const totalClients = clients.length;
  const conversionRate = totalLeads > 0 ? (totalClients / totalLeads) * 100 : 0;
  const newLeadsToday = leads.filter((lead) => {
    const leadDate = new Date(lead.created_at);
    const today = new Date();
    return leadDate.toDateString() === today.toDateString();
  }).length;

  const kpiData = [
    {
      name: "Total Leads",
      value: totalLeads,
      target: 0,
      status: "up",
      icon: Mail,
    },
    {
      name: "Conversion Rate",
      value: conversionRate.toFixed(1),
      target: 30,
      status: conversionRate >= 30 ? "up" : "down",
      icon: Target,
    },
    {
      name: "New Leads Today",
      value: newLeadsToday,
      target: 0,
      status: "up",
      icon: Zap,
    },
    {
      name: "Total Clients",
      value: totalClients,
      target: 0,
      status: "up",
      icon: Users,
    },
  ];

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into your business performance
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <StatsCard
                key={index}
                title={kpi.name}
                value={String(kpi.value)}
                change={
                  kpi.target > 0
                    ? `${kpi.status === "up" ? "+" : ""}${(
                        (Number(kpi.value) - kpi.target) /
                        kpi.target
                      ).toFixed(1)}%`
                    : kpi.name === "New Leads Today"
                    ? "Today"
                    : "Total"
                }
                trend={kpi.status as "up" | "down"}
                icon={IconComponent}
                gradient="from-blue-500 to-cyan-500"
              />
            );
          })}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Performance Trends"
            subtitle="Sales, leads, and conversions over time"
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorConversions"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
                <XAxis
                  dataKey="month"
                  stroke="#d1d5db"
                  tick={{ fill: "#6b7280" }}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#d1d5db"
                  tick={{ fill: "#6b7280" }}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  name="Sales"
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                  name="Leads"
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorConversions)"
                  name="Conversions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Lead Sources"
            subtitle="Distribution of leads by source"
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
                <XAxis
                  dataKey="name"
                  stroke="#d1d5db"
                  tick={{ fill: "#6b7280" }}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#d1d5db"
                  tick={{ fill: "#6b7280" }}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {conversionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Recent Leads Section */}
        {loading ? (
          <ChartCard title="Recent Leads" className="mb-6">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Loading leads...
              </p>
            </div>
          </ChartCard>
        ) : leads.length > 0 ? (
          <ChartCard title="Recent Leads" className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Lead Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Subject
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Source
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 10).map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold">
                            {lead.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {lead.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            {lead.email || "N/A"}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                          {lead.subject || "No subject"}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {lead.source || "email"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            lead.status === "new"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : lead.status === "contacted"
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                              : lead.status === "qualified"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                              : lead.status === "converted"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                              : lead.status === "lost"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {lead.status || "new"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {lead.created_at
                            ? new Date(lead.created_at).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        ) : (
          <ChartCard title="Recent Leads" className="mb-6">
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                No leads yet
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Leads from emails will appear here automatically
              </p>
            </div>
          </ChartCard>
        )}
      </div>
    </AdminLayout>
  );
}

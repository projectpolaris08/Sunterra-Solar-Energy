import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
import { Mail, Users, Target, Zap } from "lucide-react";
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
      email: "#ef4444",
      website: "#3b82f6",
      referral: "#06b6d4",
      "social media": "#8b5cf6",
      direct: "#f59e0b",
    };

    return Object.entries(sources).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[name.toLowerCase()] || "#6b7280",
    }));
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

  // Calculate radar data from actual metrics
  const radarData = [
    {
      subject: "Sales",
      A: totalClients > 0 ? Math.min(100, (totalClients / 10) * 100) : 0,
      B: 75,
      fullMark: 100,
    },
    {
      subject: "Marketing",
      A: totalLeads > 0 ? Math.min(100, (totalLeads / 20) * 100) : 0,
      B: 80,
      fullMark: 100,
    },
    {
      subject: "Support",
      A: conversionRate > 0 ? Math.min(100, conversionRate * 20) : 0,
      B: 82,
      fullMark: 100,
    },
    {
      subject: "Operations",
      A: 82,
      B: 78,
      fullMark: 100,
    },
    {
      subject: "Finance",
      A: 80,
      B: 75,
      fullMark: 100,
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

        {/* Radar Chart */}
        <ChartCard
          title="Department Performance"
          subtitle="Multi-dimensional performance analysis"
        >
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#9ca3af" />
              <PolarAngleAxis
                dataKey="subject"
                stroke="#d1d5db"
                tick={{ fill: "#d1d5db", fontSize: 12 }}
                style={{ fontSize: "12px" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                stroke="#d1d5db"
                tick={{ fill: "#d1d5db", fontSize: 12 }}
              />
              <Radar
                name="Current"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Radar
                name="Previous"
                dataKey="B"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.4}
              />
              <Legend wrapperStyle={{ color: "#d1d5db" }} iconType="square" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                  color: "#f3f4f6",
                }}
                labelStyle={{ color: "#f3f4f6" }}
                itemStyle={{ color: "#f3f4f6" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

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
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {leads.slice(0, 10).map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {lead.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            lead.status === "new"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : lead.status === "contacted"
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                              : lead.status === "qualified"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {lead.email}
                      </p>
                      {lead.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {lead.phone}
                        </p>
                      )}
                      {lead.subject && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {lead.subject}
                        </p>
                      )}
                      {lead.message && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {lead.message.substring(0, 150)}
                          {lead.message.length > 150 ? "..." : ""}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(lead.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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

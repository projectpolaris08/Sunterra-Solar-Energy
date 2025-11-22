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
import { TrendingUp, TrendingDown } from "lucide-react";

interface AdminAnalyticsProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export default function AdminAnalytics({
  onNavigate,
  currentPage = "admin-analytics",
}: AdminAnalyticsProps) {
  // Analytics data
  const performanceData = [
    { month: "Jan", sales: 45, leads: 120, conversions: 38 },
    { month: "Feb", sales: 52, leads: 135, conversions: 42 },
    { month: "Mar", sales: 48, leads: 110, conversions: 35 },
    { month: "Apr", sales: 61, leads: 150, conversions: 48 },
    { month: "May", sales: 55, leads: 140, conversions: 44 },
    { month: "Jun", sales: 67, leads: 165, conversions: 52 },
  ];

  const conversionData = [
    { name: "Website", value: 35, color: "#3b82f6" },
    { name: "Referral", value: 25, color: "#06b6d4" },
    { name: "Social Media", value: 20, color: "#8b5cf6" },
    { name: "Direct", value: 15, color: "#f59e0b" },
    { name: "Email", value: 5, color: "#ef4444" },
  ];

  const kpiData = [
    { name: "Conversion Rate", value: 32, target: 30, status: "up" },
    { name: "Avg. Response Time", value: 2.4, target: 3.0, status: "up" },
    { name: "Customer Satisfaction", value: 4.7, target: 4.5, status: "up" },
    { name: "Retention Rate", value: 87, target: 85, status: "up" },
  ];

  const radarData = [
    { subject: "Sales", A: 85, B: 75, fullMark: 100 },
    { subject: "Marketing", A: 90, B: 80, fullMark: 100 },
    { subject: "Support", A: 88, B: 82, fullMark: 100 },
    { subject: "Operations", A: 82, B: 78, fullMark: 100 },
    { subject: "Finance", A: 80, B: 75, fullMark: 100 },
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
          {kpiData.map((kpi, index) => (
            <StatsCard
              key={index}
              title={kpi.name}
              value={
                typeof kpi.value === "number"
                  ? kpi.value.toFixed(2)
                  : String(kpi.value)
              }
              change={`${kpi.status === "up" ? "+" : "-"}${Math.abs(
                kpi.value - kpi.target
              ).toFixed(2)}%`}
              trend={kpi.status as "up" | "down"}
              icon={kpi.status === "up" ? TrendingUp : TrendingDown}
              gradient="from-blue-500 to-cyan-500"
            />
          ))}
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
      </div>
    </AdminLayout>
  );
}

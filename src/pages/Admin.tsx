import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import StatsCard from "../components/dashboard/StatsCard";
import ChartCard from "../components/dashboard/ChartCard";
import { Users, DollarSign, Zap, Target, Receipt } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AdminProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

interface Activity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: "lead" | "appointment" | "expense" | "client" | "payment" | "project" | "notification";
  timestamp: Date;
}

export default function Admin({
  onNavigate,
  currentPage = "admin",
}: AdminProps) {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  // Fetch expenses data
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        if (!supabase) return;

        const { data, error } = await supabase
          .from("expenses")
          .select("amount, date");

        if (error) throw error;

        const total = (data || []).reduce((sum, e) => sum + (e.amount || 0), 0);
        setTotalExpenses(total);

        // Calculate this month's expenses
        const now = new Date();
        const thisMonth = (data || []).filter((e) => {
          const expenseDate = new Date(e.date);
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        });
        const monthly = thisMonth.reduce((sum, e) => sum + (e.amount || 0), 0);
        setMonthlyExpenses(monthly);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  // Fetch and update recent activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!supabase) return;

        const activities: Activity[] = [];

        // Fetch recent leads
        const { data: leadsData } = await supabase
          .from("leads")
          .select("id, name, source, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (leadsData) {
          leadsData.forEach((lead: any) => {
            activities.push({
              id: `lead-${lead.id}`,
              action: `New lead from ${lead.source || "email"}: ${lead.name}`,
              user: lead.name,
              time: formatTimeAgo(new Date(lead.created_at)),
              type: "lead",
              timestamp: new Date(lead.created_at),
            });
          });
        }

        // Fetch recent appointments
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select("id, client_name, type, date, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (appointmentsData) {
          appointmentsData.forEach((apt: any) => {
            activities.push({
              id: `appointment-${apt.id}`,
              action: `${apt.type} appointment scheduled for ${apt.client_name}`,
              user: apt.client_name,
              time: formatTimeAgo(new Date(apt.created_at)),
              type: "appointment",
              timestamp: new Date(apt.created_at),
            });
          });
        }

        // Fetch recent expenses
        const { data: expensesData } = await supabase
          .from("expenses")
          .select("id, description, amount, category, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (expensesData) {
          expensesData.forEach((exp: any) => {
            activities.push({
              id: `expense-${exp.id}`,
              action: `Expense added: ${exp.description || exp.category} - ₱${exp.amount?.toLocaleString() || 0}`,
              user: "Admin",
              time: formatTimeAgo(new Date(exp.created_at)),
              type: "expense",
              timestamp: new Date(exp.created_at),
            });
          });
        }

        // Fetch recent clients
        const { data: clientsData } = await supabase
          .from("clients")
          .select("id, client_name, project_amount, join_date")
          .order("join_date", { ascending: false })
          .limit(5);

        if (clientsData) {
          clientsData.forEach((client: any) => {
            activities.push({
              id: `client-${client.id}`,
              action: `New client added: ${client.client_name}${client.project_amount ? ` - ₱${client.project_amount.toLocaleString()}` : ""}`,
              user: client.client_name,
              time: formatTimeAgo(new Date(client.join_date)),
              type: "client",
              timestamp: new Date(client.join_date),
            });
          });
        }

        // Fetch recent notifications
        const { data: notificationsData } = await supabase
          .from("notifications")
          .select("id, title, message, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (notificationsData) {
          notificationsData.forEach((notif: any) => {
            activities.push({
              id: `notification-${notif.id}`,
              action: notif.title || notif.message || "New notification",
              user: "System",
              time: formatTimeAgo(new Date(notif.created_at)),
              type: "notification",
              timestamp: new Date(notif.created_at),
            });
          });
        }

        // Sort by timestamp (most recent first) and take top 10
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivities(activities.slice(0, 10));
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      }
    };

    fetchActivities();

    // Set up real-time subscriptions
    if (supabase) {
      // Subscribe to leads changes
      const leadsChannel = supabase
        .channel("leads-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "leads",
          },
          () => {
            fetchActivities();
          }
        )
        .subscribe();

      // Subscribe to appointments changes
      const appointmentsChannel = supabase
        .channel("appointments-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "appointments",
          },
          () => {
            fetchActivities();
          }
        )
        .subscribe();

      // Subscribe to expenses changes
      const expensesChannel = supabase
        .channel("expenses-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "expenses",
          },
          () => {
            fetchActivities();
          }
        )
        .subscribe();

      // Subscribe to clients changes
      const clientsChannel = supabase
        .channel("clients-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "clients",
          },
          () => {
            fetchActivities();
          }
        )
        .subscribe();

      // Subscribe to notifications changes
      const notificationsChannel = supabase
        .channel("notifications-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
          },
          () => {
            fetchActivities();
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        supabase.removeChannel(leadsChannel);
        supabase.removeChannel(appointmentsChannel);
        supabase.removeChannel(expensesChannel);
        supabase.removeChannel(clientsChannel);
        supabase.removeChannel(notificationsChannel);
      };
    }
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Sample data for charts - reflecting current business status
  const revenueData = [
    { name: "Jan", value: 0, target: 0 },
    { name: "Feb", value: 0, target: 0 },
    { name: "Mar", value: 0, target: 0 },
    { name: "Apr", value: 0, target: 0 },
    { name: "May", value: 0, target: 0 },
    { name: "Jun", value: 270000, target: 0 },
  ];

  const salesData = [
    { name: "Mon", sales: 0, installations: 0 },
    { name: "Tue", sales: 0, installations: 0 },
    { name: "Wed", sales: 0, installations: 0 },
    { name: "Thu", sales: 0, installations: 0 },
    { name: "Fri", sales: 0, installations: 0 },
    { name: "Sat", sales: 0, installations: 0 },
    { name: "Sun", sales: 1, installations: 0 },
  ];

  const energyData = [
    { name: "Week 1", generated: 0, consumed: 0 },
    { name: "Week 2", generated: 0, consumed: 0 },
    { name: "Week 3", generated: 0, consumed: 0 },
    { name: "Week 4", generated: 0, consumed: 0 },
  ];

  const projectDistribution = [
    { name: "Residential", value: 100, color: "#3b82f6" },
  ];

  const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b"];

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value="₱270,000"
          change="New"
          trend="up"
          icon={DollarSign}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Total Expenses"
          value={`₱${totalExpenses.toLocaleString()}`}
          change={`₱${monthlyExpenses.toLocaleString()} this month`}
          trend={monthlyExpenses > 0 ? "up" : undefined}
          icon={Receipt}
          gradient="from-red-500 to-rose-600"
        />
        <StatsCard
          title="Active Clients"
          value="1"
          change="New"
          trend="up"
          icon={Users}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Projects"
          value="1"
          change="Pending"
          trend="up"
          icon={Target}
          gradient="from-purple-500 to-pink-500"
        />
        <StatsCard
          title="Energy Generated"
          value="0 kWh"
          change="Pending"
          icon={Zap}
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <ChartCard
          title="Revenue Overview"
          subtitle="Monthly revenue vs targets"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tickFormatter={(value: number) => `₱${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                }}
                formatter={(value: number) => `₱${value.toLocaleString()}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorTarget)"
                name="Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Sales Chart */}
        <ChartCard
          title="Weekly Performance"
          subtitle="Sales and installations this week"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                }}
              />
              <Legend />
              <Bar
                dataKey="sales"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="Sales"
              />
              <Bar
                dataKey="installations"
                fill="#06b6d4"
                radius={[8, 8, 0, 0]}
                name="Installations"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Energy Generation Chart */}
        <ChartCard
          title="Energy Generation"
          subtitle="Weekly energy production and consumption"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="generated"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 5 }}
                name="Generated (kWh)"
              />
              <Line
                type="monotone"
                dataKey="consumed"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: "#06b6d4", r: 5 }}
                name="Consumed (kWh)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Project Distribution */}
        <ChartCard title="Project Distribution" subtitle="Projects by category">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const name = props.name || "";
                  const percent = props.percent || 0;
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {projectDistribution.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <ChartCard title="Recent Activity" className="mb-6">
        {recentActivities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const getTypeColor = (type: string) => {
                switch (type) {
                  case "lead":
                    return "from-blue-600 to-cyan-500";
                  case "appointment":
                    return "from-purple-600 to-pink-500";
                  case "expense":
                    return "from-red-600 to-rose-500";
                  case "client":
                    return "from-emerald-600 to-teal-500";
                  case "notification":
                    return "from-amber-600 to-orange-500";
                  default:
                    return "from-gray-600 to-gray-500";
                }
              };

              return (
                <div
                  key={activity.id}
                  className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${getTypeColor(
                    activity.type
                  )} backdrop-blur-sm border border-white/30 hover:opacity-90 transition-all duration-200 shadow-lg`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-semibold border-2 border-white/30">
                    {activity.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{activity.action}</p>
                    <p className="text-sm text-white/80">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30 capitalize">
                    {activity.type}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </ChartCard>
    </AdminLayout>
  );
}

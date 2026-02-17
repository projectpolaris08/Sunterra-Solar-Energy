import { useState, useEffect } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import ChartCard from "../components/dashboard/ChartCard";
import { supabase } from "../lib/supabase";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  UserCheck,
  X,
  Save,
} from "lucide-react";

interface AdminUsersProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

interface User {
  id: number;
  clientName: string;
  email: string;
  phone: string;
  location: string;
  projectAmount: number;
  date: string;
  inverter: string;
  solarPanelsPcs: number;
  solarPanelsWattage: string;
  batteryType: string;
  batteryPcs: number;
  facebookName: string;
  visitationDate: string;
  notes: string;
  joinDate: string;
}

export default function AdminUsers({
  onNavigate,
  currentPage = "admin-users",
}: AdminUsersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    location: "",
    projectAmount: 0,
    date: new Date().toISOString().split("T")[0],
    inverter: "",
    solarPanelsPcs: 0,
    solarPanelsWattage: "",
    batteryType: "",
    batteryPcs: 0,
    facebookName: "",
    visitationDate: "",
    notes: "",
  });

  const [users, setUsers] = useState<User[]>([]);

  // Fetch clients directly from Supabase on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }

        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .order("join_date", { ascending: false });

        if (error) throw error;

        // Map database fields to component fields
        const mappedClients = (data || []).map((client: any) => ({
          id: client.id,
          clientName: client.client_name,
          email: client.email,
          phone: client.phone,
          location: client.location,
          projectAmount: client.project_amount || 0,
          date: client.project_date || client.join_date,
          inverter: client.inverter,
          solarPanelsPcs: client.solar_panels_pcs || 0,
          solarPanelsWattage: client.solar_panels_wattage,
          batteryType: client.battery_type,
          batteryPcs: client.battery_pcs || 0,
          facebookName: client.facebook_name,
          visitationDate: client.visitation_date,
          notes: client.notes,
          joinDate: client.join_date,
        }));

        setUsers(mappedClients);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        // Fallback to localStorage if Supabase fails
        try {
          const saved = localStorage.getItem("sunterra_clients");
          if (saved) {
            setUsers(JSON.parse(saved));
          }
        } catch (e) {
          console.error("Failed to load from localStorage:", e);
        }
      }
    };

    fetchClients();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.clientName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.location?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.facebookName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  const totalClients = users.length;
  const totalProjects = users.reduce((sum, u) => sum + u.projectAmount, 0);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      const joinDate = new Date().toISOString().split("T")[0];
      const payload: Record<string, unknown> = {
        client_name: formData.clientName || null,
        email: formData.email || null,
        phone: formData.phone || null,
        location: formData.location || null,
        project_amount: formData.projectAmount ?? 0,
        inverter: formData.inverter || null,
        solar_panels_pcs: formData.solarPanelsPcs ?? 0,
        solar_panels_wattage: formData.solarPanelsWattage || null,
        battery_type: formData.batteryType || null,
        battery_pcs: formData.batteryPcs ?? 0,
        facebook_name: formData.facebookName || null,
        notes: formData.notes || null,
        join_date: joinDate,
        visitation_date: formData.visitationDate?.trim() || null,
      };
      // Only include project_date if your clients table has this column (optional)
      const projectDate = formData.date?.trim() || joinDate;
      payload.project_date = projectDate;

      const { data, error } = await supabase
        .from("clients")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Map database fields to component fields
      const newClient: User = {
        id: data.id,
        clientName: data.client_name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        projectAmount: data.project_amount || 0,
        date: data.project_date || data.join_date,
        inverter: data.inverter,
        solarPanelsPcs: data.solar_panels_pcs || 0,
        solarPanelsWattage: data.solar_panels_wattage,
        batteryType: data.battery_type,
        batteryPcs: data.battery_pcs || 0,
        facebookName: data.facebook_name,
        visitationDate: data.visitation_date,
        notes: data.notes,
        joinDate: data.join_date,
      };

      setUsers([...users, newClient]);
    } catch (error: unknown) {
      const errMessage =
        (error && typeof error === "object" && "message" in error)
          ? String((error as { message: string }).message)
          : error instanceof Error
            ? error.message
            : "Unknown error";
      console.error("Failed to add client:", error);
      alert(`Failed to save to database: ${errMessage}. Saving locally as backup.`);
      
      // Fallback: add to local state
      const newClient: User = {
        id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        clientName: formData.clientName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        projectAmount: formData.projectAmount,
        date: formData.date,
        inverter: formData.inverter,
        solarPanelsPcs: formData.solarPanelsPcs,
        solarPanelsWattage: formData.solarPanelsWattage,
        batteryType: formData.batteryType,
        batteryPcs: formData.batteryPcs,
        facebookName: formData.facebookName,
        visitationDate: formData.visitationDate,
        notes: formData.notes,
        joinDate: new Date().toISOString().split("T")[0],
      };
      setUsers([...users, newClient]);
      localStorage.setItem("sunterra_clients", JSON.stringify([...users, newClient]));
    }

    setFormData({
      clientName: "",
      email: "",
      phone: "",
      location: "",
      projectAmount: 0,
      date: new Date().toISOString().split("T")[0],
      inverter: "",
      solarPanelsPcs: 0,
      solarPanelsWattage: "",
      batteryType: "",
      batteryPcs: 0,
      facebookName: "",
      visitationDate: "",
      notes: "",
    });
    setIsModalOpen(false);
  };

  const handleDeleteClient = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }

        const { error } = await supabase
          .from("clients")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setUsers(users.filter((u) => u.id !== id));
      } catch (error) {
        console.error("Failed to delete client:", error);
        alert(`Failed to delete from database: ${error instanceof Error ? error.message : "Unknown error"}. Removing from local view.`);
        // Fallback: delete from local state
        setUsers(users.filter((u) => u.id !== id));
        localStorage.setItem("sunterra_clients", JSON.stringify(users.filter((u) => u.id !== id)));
      }
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Client Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and monitor all system clients
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Clients
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalClients}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Project Value
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₱{totalProjects.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <ChartCard title="Clients List" className="mb-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Client Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Project Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Inverter
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Solar Panels
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Battery
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold">
                          {user.clientName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {user.clientName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.facebookName || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₱{user.projectAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {user.inverter || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user.solarPanelsPcs} pcs
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.solarPanelsWattage || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user.batteryType || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.batteryPcs} pcs
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {user.date}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(user.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add New Client
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="Manila, Philippines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Project Amount *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.projectAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="150000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Inverter
                  </label>
                  <select
                    value={formData.inverter}
                    onChange={(e) =>
                      setFormData({ ...formData, inverter: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select Inverter</option>
                    <option value="3kW">3kW</option>
                    <option value="5kW">5kW</option>
                    <option value="6kW">6kW</option>
                    <option value="8kW">8kW</option>
                    <option value="10kW">10kW</option>
                    <option value="12kW">12kW</option>
                    <option value="16kW">16kW</option>
                    <option value="18kW">18kW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Solar Panels - Pcs
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.solarPanelsPcs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        solarPanelsPcs: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Solar Panels - Wattage
                  </label>
                  <select
                    value={formData.solarPanelsWattage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        solarPanelsWattage: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select Wattage</option>
                    <option value="580W">580W</option>
                    <option value="600W">600W</option>
                    <option value="610W">610W</option>
                    <option value="615W">615W</option>
                    <option value="620W">620W</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Battery Type
                  </label>
                  <select
                    value={formData.batteryType}
                    onChange={(e) =>
                      setFormData({ ...formData, batteryType: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select Battery</option>
                    <option value="24v 280Ah">24v 280Ah</option>
                    <option value="24v 314Ah">24v 314Ah</option>
                    <option value="48v 280Ah">48v 280Ah</option>
                    <option value="48v 314Ah">48v 314Ah</option>
                    <option value="51.2v 280Ah">51.2v 280Ah</option>
                    <option value="51.2v 300Ah">51.2v 300Ah</option>
                    <option value="51.2v 314Ah">51.2v 314Ah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Battery - Pcs
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.batteryPcs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        batteryPcs: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Facebook Name
                  </label>
                  <input
                    type="text"
                    value={formData.facebookName}
                    onChange={(e) =>
                      setFormData({ ...formData, facebookName: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Visitation Date
                  </label>
                  <input
                    type="date"
                    value={formData.visitationDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visitationDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 resize-none"
                  placeholder="Additional notes about the client or project..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 font-semibold hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

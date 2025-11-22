import { useState } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import ChartCard from "../components/dashboard/ChartCard";
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

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      clientName: "John Doe",
      email: "john.doe@example.com",
      phone: "+63 912 345 6789",
      location: "Manila, Philippines",
      projectAmount: 150000,
      date: "2024-01-15",
      inverter: "10kW",
      solarPanelsPcs: 20,
      solarPanelsWattage: "600W",
      batteryType: "48v 280Ah",
      batteryPcs: 2,
      facebookName: "John Doe",
      visitationDate: "2024-01-10",
      notes: "Initial consultation completed",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      clientName: "Sarah Smith",
      email: "sarah.smith@example.com",
      phone: "+63 923 456 7890",
      location: "Cebu, Philippines",
      projectAmount: 120000,
      date: "2024-02-20",
      inverter: "8kW",
      solarPanelsPcs: 16,
      solarPanelsWattage: "580W",
      batteryType: "24v 314Ah",
      batteryPcs: 1,
      facebookName: "Sarah Smith",
      visitationDate: "2024-02-15",
      notes: "Residential installation",
      joinDate: "2024-02-20",
    },
    {
      id: 3,
      clientName: "Mike Johnson",
      email: "mike.j@example.com",
      phone: "+63 934 567 8901",
      location: "Davao, Philippines",
      projectAmount: 200000,
      date: "2024-03-10",
      inverter: "12kW",
      solarPanelsPcs: 24,
      solarPanelsWattage: "615W",
      batteryType: "51.2v 280Ah",
      batteryPcs: 3,
      facebookName: "Mike Johnson",
      visitationDate: "2024-03-05",
      notes: "Commercial project",
      joinDate: "2024-03-10",
    },
    {
      id: 4,
      clientName: "Emily Brown",
      email: "emily.brown@example.com",
      phone: "+63 945 678 9012",
      location: "Quezon City, Philippines",
      projectAmount: 180000,
      date: "2024-03-05",
      inverter: "16kW",
      solarPanelsPcs: 30,
      solarPanelsWattage: "620W",
      batteryType: "48v 314Ah",
      batteryPcs: 4,
      facebookName: "Emily Brown",
      visitationDate: "2024-02-28",
      notes: "Large residential system",
      joinDate: "2024-03-05",
    },
    {
      id: 5,
      clientName: "David Wilson",
      email: "david.w@example.com",
      phone: "+63 956 789 0123",
      location: "Makati, Philippines",
      projectAmount: 95000,
      date: "2024-01-28",
      inverter: "5kW",
      solarPanelsPcs: 10,
      solarPanelsWattage: "600W",
      batteryType: "24v 280Ah",
      batteryPcs: 1,
      facebookName: "David Wilson",
      visitationDate: "2024-01-25",
      notes: "Small residential setup",
      joinDate: "2024-01-28",
    },
  ]);

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

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleDeleteClient = (id: number) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      setUsers(users.filter((u) => u.id !== id));
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

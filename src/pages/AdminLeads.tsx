import { useState, useEffect } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import ChartCard from "../components/dashboard/ChartCard";
import { supabase } from "../lib/supabase";
import { Search, Plus, Edit, Trash2, Mail, Phone, X, Save } from "lucide-react";

interface AdminLeadsProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  createdAt: string;
}

const statusColors = {
  new: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  contacted:
    "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  qualified:
    "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  converted:
    "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  lost: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

export default function AdminLeads({
  onNavigate,
  currentPage = "admin-leads",
}: AdminLeadsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    source: "manual",
    status: "new" as Lead["status"],
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch leads directly from Supabase on mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }

        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Map database fields to component fields
        const mappedLeads = (data || []).map((lead: any) => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone || "",
          subject: lead.subject || "",
          message: lead.message || "",
          source: lead.source || "email",
          status: lead.status || "new",
          createdAt: lead.created_at,
        }));

        setLeads(mappedLeads);
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        // Fallback to localStorage if Supabase fails
        try {
          const saved = localStorage.getItem("sunterra_leads");
          if (saved) {
            setLeads(JSON.parse(saved));
          }
        } catch (e) {
          console.error("Failed to load from localStorage:", e);
        }
      }
    };

    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (lead.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (lead.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    converted: leads.filter((l) => l.status === "converted").length,
    lost: leads.filter((l) => l.status === "lost").length,
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      const leadData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        source: formData.source,
        status: formData.status,
      };

      const { data, error } = await supabase
        .from("leads")
        .insert(leadData)
        .select()
        .single();

      if (error) throw error;

      // Map database fields to component fields
      const newLead: Lead = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        subject: data.subject || "",
        message: data.message || "",
        source: data.source || "manual",
        status: data.status || "new",
        createdAt: data.created_at,
      };

      setLeads([newLead, ...leads]);
    } catch (error) {
      console.error("Failed to add lead:", error);
      alert(
        `Failed to save to database: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Saving locally as backup.`
      );

      // Fallback: add to local state
      const newLead: Lead = {
        id: leads.length > 0 ? Math.max(...leads.map((l) => l.id)) + 1 : 1,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        source: formData.source,
        status: formData.status,
        createdAt: new Date().toISOString(),
      };
      setLeads([newLead, ...leads]);
      localStorage.setItem(
        "sunterra_leads",
        JSON.stringify([newLead, ...leads])
      );
    }

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      source: "manual",
      status: "new",
    });
    setIsModalOpen(false);
    setEditingLead(null);
  };

  const handleUpdateStatus = async (id: number, newStatus: Lead["status"]) => {
    try {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setLeads(
        leads.map((lead) =>
          lead.id === id ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (error) {
      console.error("Failed to update lead status:", error);
      alert(
        `Failed to update status: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Updating locally.`
      );
      // Fallback: update local state
      setLeads(
        leads.map((lead) =>
          lead.id === id ? { ...lead, status: newStatus } : lead
        )
      );
      localStorage.setItem(
        "sunterra_leads",
        JSON.stringify(
          leads.map((lead) =>
            lead.id === id ? { ...lead, status: newStatus } : lead
          )
        )
      );
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }

        const { error } = await supabase.from("leads").delete().eq("id", id);

        if (error) throw error;

        setLeads(leads.filter((l) => l.id !== id));
      } catch (error) {
        console.error("Failed to delete lead:", error);
        alert(
          `Failed to delete from database: ${
            error instanceof Error ? error.message : "Unknown error"
          }. Removing from local view.`
        );
        // Fallback: delete from local state
        setLeads(leads.filter((l) => l.id !== id));
        localStorage.setItem(
          "sunterra_leads",
          JSON.stringify(leads.filter((l) => l.id !== id))
        );
      }
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      subject: lead.subject,
      message: lead.message,
      source: lead.source,
      status: lead.status,
    });
    setIsModalOpen(true);
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      const { error } = await supabase
        .from("leads")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          source: formData.source,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingLead.id);

      if (error) throw error;

      setLeads(
        leads.map((lead) =>
          lead.id === editingLead.id
            ? {
                ...lead,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                subject: formData.subject,
                message: formData.message,
                source: formData.source,
                status: formData.status,
              }
            : lead
        )
      );
    } catch (error) {
      console.error("Failed to update lead:", error);
      alert(
        `Failed to update: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Updating locally.`
      );
      // Fallback: update local state
      setLeads(
        leads.map((lead) =>
          lead.id === editingLead.id
            ? {
                ...lead,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                subject: formData.subject,
                message: formData.message,
                source: formData.source,
                status: formData.status,
              }
            : lead
        )
      );
      localStorage.setItem(
        "sunterra_leads",
        JSON.stringify(
          leads.map((lead) =>
            lead.id === editingLead.id
              ? {
                  ...lead,
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  subject: formData.subject,
                  message: formData.message,
                  source: formData.source,
                  status: formData.status,
                }
              : lead
          )
        )
      );
    }

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      source: "manual",
      status: "new",
    });
    setIsModalOpen(false);
    setEditingLead(null);
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Lead Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and track all potential leads
            </p>
          </div>
          <button
            onClick={() => {
              setEditingLead(null);
              setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
                source: "manual",
                status: "new",
              });
              setIsModalOpen(true);
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Lead
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Leads
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              New
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.new}
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Contacted
            </p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.contacted}
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Qualified
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.qualified}
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Converted
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.converted}
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Lost
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.lost}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <ChartCard title="Leads List" className="mb-6">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, phone, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-700 dark:text-gray-200"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Leads Table */}
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No leads found
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    return (
                      <tr
                        key={lead.id}
                        className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {lead.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              {lead.email}
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
                            {lead.source}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleUpdateStatus(
                                lead.id,
                                e.target.value as Lead["status"]
                              )
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border-0 ${
                              statusColors[lead.status]
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="converted">Converted</option>
                            <option value="lost">Lost</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditLead(lead)}
                              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Add/Edit Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingLead ? "Edit Lead" : "Add New Lead"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingLead(null);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    subject: "",
                    message: "",
                    source: "manual",
                    status: "new",
                  });
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingLead ? handleUpdateLead : handleAddLead}
              className="p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
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
                    Phone Number
                  </label>
                  <input
                    type="tel"
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
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                  >
                    <option value="email">Email</option>
                    <option value="manual">Manual</option>
                    <option value="website">Website</option>
                    <option value="phone">Phone</option>
                    <option value="referral">Referral</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                    <option value="reddit">Reddit</option>
                    <option value="viber">Viber</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as Lead["status"],
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                  placeholder="Inquiry about solar installation"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 resize-none"
                  placeholder="Message from the lead..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingLead(null);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      subject: "",
                      message: "",
                      source: "manual",
                      status: "new",
                    });
                  }}
                  className="px-6 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 font-semibold hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingLead ? "Update Lead" : "Add Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

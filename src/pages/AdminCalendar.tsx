import { useState, useEffect } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import ChartCard from "../components/dashboard/ChartCard";
import { supabase } from "../lib/supabase";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  X,
} from "lucide-react";

interface AdminCalendarProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

interface Appointment {
  id: number;
  clientName: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  type: "visitation" | "installation" | "maintenance" | "consultation";
}

export default function AdminCalendar({
  onNavigate,
  currentPage = "admin-calendar",
}: AdminCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    location: "",
    notes: "",
    type: "visitation" as
      | "visitation"
      | "installation"
      | "maintenance"
      | "consultation",
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch appointments directly from Supabase on mount
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }

        const { data, error } = await supabase
          .from("appointments")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw error;

        // Map database fields to component fields
        const mappedAppointments = (data || []).map((apt: any) => ({
          id: apt.id,
          clientName: apt.client_name,
          date: apt.date,
          time: apt.time,
          location: apt.location,
          notes: apt.notes,
          type: apt.type,
        }));

        setAppointments(mappedAppointments);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        // Fallback to localStorage if Supabase fails
        try {
          const saved = localStorage.getItem("sunterra_appointments");
          if (saved) {
            setAppointments(JSON.parse(saved));
          }
        } catch (e) {
          console.error("Failed to load from localStorage:", e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number | null) => {
    if (day) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // getMonth() is 0-indexed
      // Format as YYYY-MM-DD without timezone conversion
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      setFormData({ ...formData, date: dateStr });
      setIsModalOpen(true);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          client_name: formData.clientName,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          notes: formData.notes,
          type: formData.type,
        })
        .select()
        .single();

      if (error) throw error;

      // Map database fields to component fields
      const newAppointment: Appointment = {
        id: data.id,
        clientName: data.client_name,
        date: data.date,
        time: data.time,
        location: data.location,
        notes: data.notes,
        type: data.type,
      };

      setAppointments([...appointments, newAppointment]);
    } catch (error) {
      console.error("Failed to add appointment:", error);
      alert(`Failed to save to database: ${error instanceof Error ? error.message : "Unknown error"}. Saving locally as backup.`);
      
      // Fallback: add to local state
      const newAppointment: Appointment = {
        id:
          appointments.length > 0
            ? Math.max(...appointments.map((a) => a.id)) + 1
            : 1,
        clientName: formData.clientName,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        notes: formData.notes,
        type: formData.type,
      };
      setAppointments([...appointments, newAppointment]);
      localStorage.setItem("sunterra_appointments", JSON.stringify([...appointments, newAppointment]));
    }

    setFormData({
      clientName: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      location: "",
      notes: "",
      type: "visitation",
    });
    setIsModalOpen(false);
  };

  const handleDeleteAppointment = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }

        const { error } = await supabase
          .from("appointments")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setAppointments(appointments.filter((a) => a.id !== id));
      } catch (error) {
        console.error("Failed to delete appointment:", error);
        alert(`Failed to delete from database: ${error instanceof Error ? error.message : "Unknown error"}. Removing from local view.`);
        // Fallback: delete from local state
        setAppointments(appointments.filter((a) => a.id !== id));
        localStorage.setItem("sunterra_appointments", JSON.stringify(appointments.filter((a) => a.id !== id)));
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "visitation":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "installation":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
      case "maintenance":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
      case "consultation":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todayAppointments = appointments.filter(
    (apt) => apt.date === today.toISOString().split("T")[0]
  );

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Schedule and manage client appointments
            </p>
          </div>
          <button
            onClick={() => {
              setFormData({
                clientName: "",
                date: new Date().toISOString().split("T")[0],
                time: "09:00",
                location: "",
                notes: "",
                type: "visitation",
              });
              setIsModalOpen(true);
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Schedule Appointment
          </button>
        </div>

        {/* Today's Appointments */}
        {todayAppointments.length > 0 && (
          <ChartCard title="Today's Appointments" className="mb-6">
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`p-3 rounded-xl ${getTypeColor(
                        appointment.type
                      )}`}
                    >
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {appointment.clientName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold ${getTypeColor(
                            appointment.type
                          )}`}
                        >
                          {appointment.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {appointment.location}
                        </span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAppointment(appointment.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {/* Calendar */}
        <ChartCard
          title={`${
            monthNames[currentDate.getMonth()]
          } ${currentDate.getFullYear()}`}
          className="mb-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 font-medium hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              // Format date as YYYY-MM-DD without timezone conversion
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth() + 1; // getMonth() is 0-indexed
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayAppointments = appointments.filter(
                (apt) => apt.date === dateStr
              );
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square p-2 rounded-xl border-2 transition-all duration-200 hover:shadow-md min-h-[100px] ${
                    isCurrentDay
                      ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white border-blue-400 shadow-lg"
                      : "bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 hover:bg-white/70 dark:hover:bg-gray-800/70"
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={`text-sm font-semibold mb-1 ${
                        isCurrentDay
                          ? "text-white"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={`text-xs px-1.5 py-1 rounded-md ${getTypeColor(
                            apt.type
                          )} flex flex-col gap-0.5`}
                          title={`${apt.clientName} - ${apt.type} - ${apt.location}${apt.notes ? ` - ${apt.notes}` : ""}`}
                        >
                          <div className="font-semibold truncate">
                            {apt.time} {apt.clientName}
                          </div>
                          <div className="text-[10px] opacity-90 truncate">
                            {apt.location}
                          </div>
                          <div className="text-[10px] opacity-75 truncate capitalize">
                            {apt.type}
                          </div>
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-1.5 py-0.5">
                          +{dayAppointments.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ChartCard>

        {/* Add Appointment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Schedule Appointment
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAppointment} className="p-6 space-y-6">
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
                      Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Appointment Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as
                            | "visitation"
                            | "installation"
                            | "maintenance"
                            | "consultation",
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100"
                    >
                      <option value="visitation">Visitation</option>
                      <option value="installation">Installation</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="consultation">Consultation</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 resize-none"
                      placeholder="Additional notes about the appointment..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                    className="px-6 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 font-semibold hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

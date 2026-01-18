import { useState, useEffect } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import StatsCard from "../components/dashboard/StatsCard";
import {
  Users,
  DollarSign,
  TrendingUp,
  Gift,
  Search,
  Edit,
  X,
  Plus,
  Save,
} from "lucide-react";

interface AdminReferralsProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

interface Referrer {
  id: string;
  name: string;
  email: string;
  phone: string;
  referral_code: string;
  total_referrals: number;
  total_earnings: number;
  paid_earnings: number;
  pending_earnings: number;
  status: string;
  created_at: string;
}

interface Referral {
  id: string;
  referrer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  system_type: string;
  system_size: string;
  status: string;
  commission_amount: number;
  notes?: string;
  created_at: string;
}

interface Payment {
  id: string;
  referrer_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_date: string;
  created_at: string;
}

const statusColors = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminReferrals({
  onNavigate,
  currentPage = "admin-referrals",
}: AdminReferralsProps) {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "referrers" | "referrals" | "payments"
  >("referrers");
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    referrerId: "",
    amount: "",
    paymentMethod: "bank",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  const apiUrl =
    import.meta.env.VITE_API_URL || "https://sunterra-solar-energy.vercel.app";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch referrers
      const referrersRes = await fetch(
        `${apiUrl}/api/referral?action=admin-referrers`
      );
      const referrersData = await referrersRes.json();
      if (referrersData.success) {
        setReferrers(referrersData.referrers || []);
      }

      // Fetch all referrals (we'll need to get them per referrer or create an admin endpoint)
      // For now, let's fetch referrals for each referrer
      const allReferrals: Referral[] = [];
      if (referrersData.referrers) {
        for (const referrer of referrersData.referrers) {
          try {
            const referralsRes = await fetch(
              `${apiUrl}/api/referral?action=referrals&referrerId=${referrer.id}`
            );
            const referralsData = await referralsRes.json();
            if (referralsData.success && referralsData.referrals) {
              allReferrals.push(...referralsData.referrals);
            }
          } catch (err) {
            console.error(`Failed to fetch referrals for ${referrer.id}:`, err);
          }
        }
      }
      setReferrals(allReferrals);

      // Fetch payments for all referrers
      const allPayments: Payment[] = [];
      if (referrersData.referrers) {
        for (const referrer of referrersData.referrers) {
          try {
            const paymentsRes = await fetch(
              `${apiUrl}/api/referral?action=payments&referrerId=${referrer.id}`
            );
            const paymentsData = await paymentsRes.json();
            if (paymentsData.success && paymentsData.payments) {
              allPayments.push(...paymentsData.payments);
            }
          } catch (err) {
            console.error(`Failed to fetch payments for ${referrer.id}:`, err);
          }
        }
      }
      setPayments(allPayments);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReferral = async (referral: Referral) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/referral?action=update-referral`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: referral.id,
            status: referral.status,
            commissionAmount: referral.commission_amount,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setReferrals((prev) =>
          prev.map((r) => (r.id === referral.id ? { ...referral } : r))
        );
        setEditingReferral(null);
        fetchData(); // Refresh to update stats
      }
    } catch (error) {
      console.error("Failed to update referral:", error);
      alert("Failed to update referral. Please try again.");
    }
  };

  const handleCreatePayment = async () => {
    if (!paymentForm.referrerId || !paymentForm.amount) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/api/referral?action=create-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referrerId: paymentForm.referrerId,
            amount: parseFloat(paymentForm.amount),
            paymentMethod: paymentForm.paymentMethod,
            paymentDate: paymentForm.paymentDate,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setShowPaymentModal(false);
        setPaymentForm({
          referrerId: "",
          amount: "",
          paymentMethod: "bank",
          paymentDate: new Date().toISOString().split("T")[0],
        });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to create payment:", error);
      alert("Failed to create payment. Please try again.");
    }
  };

  const stats = [
    {
      label: "Total Referrers",
      value: referrers.length,
      icon: Users,
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Total Referrals",
      value: referrals.length,
      icon: Gift,
      color: "from-purple-500 to-pink-400",
    },
    {
      label: "Total Earnings",
      value: `₱${referrers
        .reduce((sum, r) => sum + (r.total_earnings || 0), 0)
        .toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-400",
    },
    {
      label: "Pending Payments",
      value: `₱${referrers
        .reduce((sum, r) => sum + (r.pending_earnings || 0), 0)
        .toLocaleString()}`,
      icon: TrendingUp,
      color: "from-amber-500 to-orange-400",
    },
  ];

  const filteredReferrers = referrers.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referral_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReferrals = referrals.filter(
    (r) =>
      r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.system_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Referral Management
          </h1>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Payment
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.label}
              value={stat.value}
              icon={stat.icon}
              gradient={stat.color}
            />
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1 p-2">
              {[
                {
                  id: "referrers",
                  label: "Referrers",
                  count: referrers.length,
                },
                {
                  id: "referrals",
                  label: "Referrals",
                  count: referrals.length,
                },
                { id: "payments", label: "Payments", count: payments.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === "referrers" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Referral Code
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Referrals
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Total Earnings
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Paid
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Pending
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferrers.map((referrer) => (
                      <tr
                        key={referrer.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {referrer.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {referrer.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {referrer.referral_code}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {referrer.total_referrals || 0}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                          ₱{(referrer.total_earnings || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">
                          ₱{(referrer.paid_earnings || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-amber-600 dark:text-amber-400">
                          ₱{(referrer.pending_earnings || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "referrals" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        System
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Commission
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Date
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferrals.map((referral) => (
                      <tr
                        key={referral.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {referral.customer_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {referral.customer_email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {referral.system_type}
                        </td>
                        <td className="py-3 px-4">
                          {editingReferral?.id === referral.id ? (
                            <select
                              value={editingReferral.status}
                              onChange={(e) =>
                                setEditingReferral({
                                  ...editingReferral,
                                  status: e.target.value,
                                })
                              }
                              className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[
                                  referral.status as keyof typeof statusColors
                                ] || statusColors.pending
                              }`}
                            >
                              {referral.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {editingReferral?.id === referral.id ? (
                            <input
                              type="number"
                              value={editingReferral.commission_amount}
                              onChange={(e) =>
                                setEditingReferral({
                                  ...editingReferral,
                                  commission_amount:
                                    parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-24 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          ) : (
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ₱
                              {(
                                referral.commission_amount || 0
                              ).toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {editingReferral?.id === referral.id ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateReferral(editingReferral)
                                  }
                                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingReferral(null)}
                                  className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setEditingReferral(referral)}
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Referrer
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Method
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
                    {payments
                      .filter((p) => {
                        const referrer = referrers.find(
                          (r) => r.id === p.referrer_id
                        );
                        return (
                          !searchTerm ||
                          referrer?.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          referrer?.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        );
                      })
                      .map((payment) => {
                        const referrer = referrers.find(
                          (r) => r.id === payment.referrer_id
                        );
                        return (
                          <tr
                            key={payment.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                              {referrer?.name || "Unknown"}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                              ₱{payment.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">
                              {payment.payment_method}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  payment.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                              {new Date(
                                payment.payment_date
                              ).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Payment
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Referrer
                </label>
                <select
                  value={paymentForm.referrerId}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      referrerId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select referrer</option>
                  {referrers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.referral_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₱)
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="gcash">GCash</option>
                  <option value="paypal">PayPal</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreatePayment}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Payment
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

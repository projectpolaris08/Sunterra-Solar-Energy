import { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Copy,
  Share2,
  LogOut,
  ArrowRight,
  Gift,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface ReferralDashboardProps {
  onNavigate: (page: string) => void;
}

interface ReferrerData {
  id: string;
  name: string;
  email: string;
  referral_code: string;
  total_referrals: number;
  total_earnings: number;
  paid_earnings: number;
  pending_earnings: number;
  payment_method: string;
  payment_details: string;
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

export default function ReferralDashboard({ onNavigate }: ReferralDashboardProps) {
  const [referrer, setReferrer] = useState<ReferrerData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Get referrer ID from localStorage or prompt for email
  const [referrerEmail, setReferrerEmail] = useState<string | null>(
    localStorage.getItem("referrer_email")
  );
  const [showLogin, setShowLogin] = useState(!referrerEmail);

  useEffect(() => {
    if (referrerEmail) {
      fetchDashboardData();
    }
  }, [referrerEmail]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://sunterra-solar-energy.vercel.app";

      // Fetch referrer data
      const referrerResponse = await fetch(
        `${apiUrl}/api/referral?action=referrer&email=${encodeURIComponent(referrerEmail!)}`
      );
      const referrerData = await referrerResponse.json();

      if (!referrerData.success) {
        throw new Error(referrerData.message || "Referrer not found");
      }

      setReferrer(referrerData.referrer);

      // Fetch referrals
      const referralsResponse = await fetch(
        `${apiUrl}/api/referral?action=referrals&referrerId=${referrerData.referrer.id}`
      );
      const referralsData = await referralsResponse.json();
      if (referralsData.success) {
        setReferrals(referralsData.referrals || []);
      }

      // Fetch payments
      const paymentsResponse = await fetch(
        `${apiUrl}/api/referral?action=payments&referrerId=${referrerData.referrer.id}`
      );
      const paymentsData = await paymentsResponse.json();
      if (paymentsData.success) {
        setPayments(paymentsData.payments || []);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    localStorage.setItem("referrer_email", email);
    setReferrerEmail(email);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("referrer_email");
    setReferrerEmail(null);
    setShowLogin(true);
    setReferrer(null);
    setReferrals([]);
    setPayments([]);
  };

  const copyReferralCode = () => {
    if (referrer?.referral_code) {
      navigator.clipboard.writeText(referrer.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/contact?ref=${referrer?.referral_code}`;
    if (navigator.share) {
      navigator.share({
        title: "Join Sunterra Solar Energy",
        text: `Use my referral code ${referrer?.referral_code} when you sign up for solar!`,
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (showLogin) {
    return (
      <>
        <SEO
          title="Referral Dashboard - Login | Sunterra Solar Energy"
          description="Access your referral dashboard to track your referrals and earnings"
        />
        <section className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <Gift className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Referral Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Enter your email to access your dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full">
                  Access Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <button
                    onClick={() => onNavigate("referral-signup")}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </Card>
          </div>
        </section>
      </>
    );
  }

  if (loading) {
    return (
      <section className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <Card className="max-w-6xl mx-auto text-center py-20">
            <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
          </Card>
        </div>
      </section>
    );
  }

  if (error && !referrer) {
    return (
      <section className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center py-20">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => setShowLogin(true)}>Try Again</Button>
          </Card>
        </div>
      </section>
    );
  }

  const stats = [
    {
      label: "Total Referrals",
      value: referrer?.total_referrals || 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Earnings",
      value: `₱${(referrer?.total_earnings || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Pending Earnings",
      value: `₱${(referrer?.pending_earnings || 0).toLocaleString()}`,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Paid Out",
      value: `₱${(referrer?.paid_earnings || 0).toLocaleString()}`,
      icon: CheckCircle,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <>
      <SEO
        title="Referral Dashboard | Sunterra Solar Energy"
        description="Track your referrals, earnings, and payments in your referral dashboard"
      />
      <section className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {referrer?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track your referrals and earnings
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="mt-4 md:mt-0">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Referral Code Card */}
          <Card className="mb-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p className="text-blue-100 mb-2">Your Referral Code</p>
                <div className="flex items-center space-x-4">
                  <p className="text-3xl font-bold font-mono">{referrer?.referral_code}</p>
                  <button
                    onClick={copyReferralCode}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                    title="Copy code"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-blue-100 text-sm mt-2">
                  Share this code with friends and family
                </p>
              </div>
              <Button
                onClick={shareReferralLink}
                className="mt-4 md:mt-0 bg-white text-blue-600 hover:bg-blue-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="card-3d immersive-hover depth-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Referrals Table */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Your Referrals
            </h2>
            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No referrals yet. Start sharing your referral code!
                </p>
              </div>
            ) : (
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
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((referral) => (
                      <tr
                        key={referral.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
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
                        <td className="py-3 px-4">
                          <p className="text-gray-900 dark:text-white">
                            {referral.system_type}
                          </p>
                          {referral.system_size && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {referral.system_size}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              referral.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : referral.status === "approved"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {referral.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ₱{referral.commission_amount?.toLocaleString() || "0"}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Payments History */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Payment History
            </h2>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No payments yet. Payments will appear here once processed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ₱{payment.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.payment_method} • {payment.payment_date}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : payment.status === "pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </>
  );
}

import { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  Copy,
  Share2,
  LogOut,
  ArrowRight,
  Gift,
  Lock,
  Mail,
  RefreshCw,
  Eye,
  EyeOff,
  CreditCard,
  Edit,
  Save,
  X,
  Info,
  FileText,
  UserCheck,
  TrendingUp,
  Phone,
  MessageCircle,
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
  contract_price?: number;
  notes?: string;
  location?: string;
  property_type?: string;
  roof_type?: string;
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

export default function ReferralDashboard({
  onNavigate,
}: ReferralDashboardProps) {
  const [referrer, setReferrer] = useState<ReferrerData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [newReferralsCount, setNewReferralsCount] = useState(0);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [paymentUpdateError, setPaymentUpdateError] = useState<string | null>(
    null
  );
  const [paymentUpdateSuccess, setPaymentUpdateSuccess] = useState(false);

  // Get referrer ID from localStorage or prompt for email
  const [referrerEmail, setReferrerEmail] = useState<string | null>(
    localStorage.getItem("referrer_email")
  );
  const [showLogin, setShowLogin] = useState(!referrerEmail);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (referrerEmail) {
      fetchDashboardData();

      // Auto-refresh every 30 seconds to get new referrals (silent refresh)
      const refreshInterval = setInterval(() => {
        fetchDashboardData(false); // Don't show loading spinner on auto-refresh
      }, 30000); // 30 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [referrerEmail]);

  // Add focus event to refresh when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (referrerEmail && !loading) {
        fetchDashboardData(false); // Silent refresh on focus
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [referrerEmail, loading]);

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://sunterra-solar-energy.vercel.app";

      // Get password from localStorage (stored after login)
      const storedPassword = localStorage.getItem("referrer_password");

      // Fetch referrer data (password optional for backward compatibility)
      const referrerResponse = await fetch(
        `${apiUrl}/api/referral?action=referrer&email=${encodeURIComponent(
          referrerEmail!
        )}${
          storedPassword
            ? `&password=${encodeURIComponent(storedPassword)}`
            : ""
        }`
      );
      const referrerData = await referrerResponse.json();

      if (!referrerData.success) {
        throw new Error(referrerData.message || "Referrer not found");
      }

      setReferrer(referrerData.referrer);
      // Initialize payment method and details from referrer data
      if (referrerData.referrer.payment_method) {
        setPaymentMethod(referrerData.referrer.payment_method);
      }
      if (referrerData.referrer.payment_details) {
        setPaymentDetails(referrerData.referrer.payment_details);
      }

      // Fetch referrals
      const referralsResponse = await fetch(
        `${apiUrl}/api/referral?action=referrals&referrerId=${referrerData.referrer.id}`
      );
      const referralsData = await referralsResponse.json();
      if (referralsData.success) {
        const newReferrals = referralsData.referrals || [];

        // Check for new referrals (compare with existing)
        if (referrals.length > 0) {
          const existingIds = new Set(referrals.map((r: Referral) => r.id));
          const newCount = newReferrals.filter(
            (r: Referral) => !existingIds.has(r.id)
          ).length;
          if (newCount > 0) {
            setNewReferralsCount(newCount);
            // Clear notification after 5 seconds
            setTimeout(() => setNewReferralsCount(0), 5000);
          }
        }

        setReferrals(newReferrals);
        setLastRefreshTime(new Date());
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
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://sunterra-solar-energy.vercel.app";

      const response = await fetch(`${apiUrl}/api/referral?action=login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid email or password");
      }

      // Login successful - store email and password
      localStorage.setItem("referrer_email", email);
      localStorage.setItem("referrer_password", password);
      setReferrerEmail(email);
      setShowLogin(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("referrer_email");
    localStorage.removeItem("referrer_password");
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

  const getReferralLink = () => {
    // Use production URL for sharing, but allow localhost for development
    const baseUrl =
      window.location.hostname === "localhost"
        ? window.location.origin
        : "https://sunterrasolarenergy.com";
    return `${baseUrl}/contact?ref=${referrer?.referral_code}`;
  };

  const shareReferralLink = () => {
    const referralLink = getReferralLink();
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

  const copyReferralLink = () => {
    const referralLink = getReferralLink();
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditPayment = () => {
    setIsEditingPayment(true);
    setPaymentMethod(referrer?.payment_method || "");
    setPaymentDetails(referrer?.payment_details || "");
    setPaymentUpdateError(null);
    setPaymentUpdateSuccess(false);
  };

  const handleCancelEditPayment = () => {
    setIsEditingPayment(false);
    setPaymentMethod(referrer?.payment_method || "");
    setPaymentDetails(referrer?.payment_details || "");
    setPaymentUpdateError(null);
    setPaymentUpdateSuccess(false);
  };

  const handleSavePayment = async () => {
    if (!referrer?.id) {
      setPaymentUpdateError("Referrer ID not found");
      return;
    }

    if (!paymentMethod || !paymentDetails) {
      setPaymentUpdateError(
        "Please fill in both payment method and payment details"
      );
      return;
    }

    setUpdatingPayment(true);
    setPaymentUpdateError(null);
    setPaymentUpdateSuccess(false);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://sunterra-solar-energy.vercel.app";

      const response = await fetch(
        `${apiUrl}/api/referral?action=update-payment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            referrerId: referrer.id,
            paymentMethod,
            paymentDetails,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update payment details");
      }

      // Update local referrer state
      setReferrer({
        ...referrer,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
      });

      setPaymentUpdateSuccess(true);
      setIsEditingPayment(false);

      // Clear success message after 3 seconds
      setTimeout(() => setPaymentUpdateSuccess(false), 3000);
    } catch (err) {
      setPaymentUpdateError(
        err instanceof Error ? err.message : "Failed to update payment details"
      );
    } finally {
      setUpdatingPayment(false);
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
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
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
            <p className="text-gray-600 dark:text-gray-300">
              Loading dashboard...
            </p>
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
            <Button
              variant="outline"
              onClick={handleLogout}
              className="mt-4 md:mt-0"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Payment Method Card */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Payment Information
                </h2>
              </div>
              {!isEditingPayment && (
                <button
                  onClick={handleEditPayment}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {paymentUpdateSuccess && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Payment details updated successfully!
                </p>
              </div>
            )}

            {paymentUpdateError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {paymentUpdateError}
                </p>
              </div>
            )}

            {isEditingPayment ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select payment method</option>
                    <option value="gcash">GCash</option>
                    <option value="paymaya">PayMaya</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Details
                  </label>
                  <input
                    type="text"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder="e.g., GCash number, bank account number, PayPal email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter your account number, email, or other payment details
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleSavePayment}
                    disabled={updatingPayment}
                    className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                  >
                    {updatingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancelEditPayment}
                    variant="outline"
                    disabled={updatingPayment}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Payment Method
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {referrer?.payment_method || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Payment Details
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {referrer?.payment_details || "Not provided"}
                  </p>
                </div>
                {!referrer?.payment_method || !referrer?.payment_details ? (
                  <p className="text-sm text-amber-600 dark:text-amber-400 italic">
                    Please update your payment information to receive payments
                  </p>
                ) : null}
              </div>
            )}
          </Card>

          {/* Referral Code Card */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 shadow-xl">
            <div className="space-y-4">
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-2 font-semibold text-sm uppercase tracking-wide">
                  Your Referral Code
                </p>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-md">
                    <p className="text-3xl font-bold font-mono">
                      {referrer?.referral_code}
                    </p>
                  </div>
                  <button
                    onClick={copyReferralCode}
                    className="p-3 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-all shadow-md border-2 border-blue-300 dark:border-blue-700"
                    title="Copy code"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-2 font-semibold text-sm uppercase tracking-wide">
                  Your Referral Link
                </p>
                <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border-2 border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-mono text-gray-800 dark:text-gray-200 flex-1 break-all">
                    {getReferralLink()}
                  </p>
                  <button
                    onClick={copyReferralLink}
                    className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-all flex-shrink-0 shadow-md border border-blue-300 dark:border-blue-700"
                    title="Copy full link"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
                  {copied ? (
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      ✓ Link copied to clipboard!
                    </span>
                  ) : (
                    "Click the copy button to copy the full link - it will auto-fill the referral code on the contact form"
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={shareReferralLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
                <Button
                  onClick={copyReferralLink}
                  className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 shadow-md hover:shadow-lg transition-all"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Referrals
                </h2>
                {newReferralsCount > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
                    ✨ {newReferralsCount} new referral
                    {newReferralsCount > 1 ? "s" : ""}!
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => fetchDashboardData(true)}
                className="flex items-center px-4 py-2 text-sm font-semibold rounded-lg border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white transition-all"
                title="Refresh to see new referrals"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
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
                        Contract Price
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Commission (3%)
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
                          <p className="text-gray-900 dark:text-white font-medium">
                            {referral.system_type}
                          </p>
                          {referral.system_size &&
                            referral.system_size !== referral.system_type && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {referral.system_size}
                              </p>
                            )}
                          {referral.notes && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                              {referral.notes.split(" | ").map((note, idx) => (
                                <p key={idx}>{note}</p>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              referral.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : referral.status === "paid"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
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
                            {referral.contract_price
                              ? `₱${referral.contract_price.toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}`
                              : "—"}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ₱
                            {referral.commission_amount?.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            ) || "0.00"}
                          </p>
                          {referral.contract_price && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              (3% of ₱{referral.contract_price.toLocaleString()}
                              )
                            </p>
                          )}
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

          {/* How It Works / Referral Mechanics */}
          <Card className="mb-8 bg-gradient-to-br from-blue-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-blue-700 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
                <Info className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                How the Referral Program Works
              </h2>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex-shrink-0">
                  <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Share2 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Share Your Referral Code or Link
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    Share your unique referral code or referral link with friends, family, or anyone interested in solar energy. 
                    You can copy your code above or share the link directly.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                      💡 Tip: Use your referral link - it automatically fills in your code on the contact form!
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex-shrink-0">
                  <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Client Submits Assessment or Contact Form
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    When your referral is ready to get a solar assessment, they need to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <li><strong>Option 1 (Recommended):</strong> Click your referral link - the code will automatically fill in!</li>
                    <li><strong>Option 2:</strong> Visit the <strong>Contact</strong> page and manually enter your referral code</li>
                    <li>Fill out their information (name, email, phone, property details, etc.)</li>
                    <li>Submit the form with your referral code included</li>
                  </ul>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700 mb-3">
                    <p className="text-xs text-green-800 dark:text-green-300 font-medium">
                      ✅ <strong>Automatic Fill:</strong> If your client clicks your referral link, the referral code will automatically fill in the contact/assessment form - no manual entry needed!
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      ⚠️ <strong>Important:</strong> The referral code MUST be present in the contact/assessment form for us to track who referred them. If they don't use your referral link, they must manually enter your code in the "Referral Code" field.
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate("contact")}
                      className="text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Go to Contact Form
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex-shrink-0">
                  <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    We Process the Referral
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    Once the form is submitted with your referral code:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>We verify the referral code and link it to your account</li>
                    <li>The referral appears in your dashboard with "Pending" status</li>
                    <li>We contact the client to schedule their free site assessment</li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex-shrink-0">
                  <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                    Installation Completed = Commission Earned
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    When the client completes their solar installation:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <li>The referral status changes to "Completed" in your dashboard</li>
                    <li>Commission is calculated as <strong className="text-green-600 dark:text-green-400">3% of the contract price</strong></li>
                    <li>Your earnings are updated and shown as "Pending" until payment is processed</li>
                  </ul>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                    <p className="text-xs text-green-800 dark:text-green-300 font-medium">
                      💰 Commission Rate: 3% of total contract price (set by admin after installation)
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex-shrink-0">
                  <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    5
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Get Paid
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    Once your payment information is verified:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>Payments are processed according to our payment schedule</li>
                    <li>You'll receive payment via your preferred method (GCash, PayMaya, Bank, PayPal)</li>
                    <li>Payment history is tracked in your dashboard</li>
                  </ul>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700 mt-3">
                    <p className="text-xs text-purple-800 dark:text-purple-300 font-medium">
                      📝 Make sure your payment information is up to date in the Payment Information section above!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
                Pro Tips for Maximum Earnings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong className="text-blue-600 dark:text-blue-400">✓</strong> Always use your referral link when sharing - it's easier for clients
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong className="text-blue-600 dark:text-blue-400">✓</strong> Remind clients to enter your code when filling out the form
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong className="text-blue-600 dark:text-blue-400">✓</strong> Check your dashboard regularly to track referral status
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong className="text-blue-600 dark:text-blue-400">✓</strong> Keep your payment information updated for faster payouts
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Support Section */}
            <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Have Questions?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                If you have any questions about the referral program, need assistance, or want to learn more, 
                feel free to reach out to us through any of the following channels:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="https://www.facebook.com/sunterrasolarenergy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-md group"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Facebook Page</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Visit our page</p>
                    </div>
                  </div>
                </a>

                <a
                  href="tel:+639606921760"
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-md group"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-green-600 dark:bg-green-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Contact Number</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">+63 960 692 1760</p>
                    </div>
                  </div>
                </a>

                <a
                  href="mailto:info@sunterrasolarenergy.com"
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-md group"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-amber-600 dark:bg-amber-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Email Us</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">info@sunterrasolarenergy.com</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}

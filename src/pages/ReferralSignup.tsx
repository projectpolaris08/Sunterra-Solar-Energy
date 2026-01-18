import { useState } from "react";
import { UserPlus, Mail, Phone, MapPin, ArrowRight, CheckCircle, X, LogIn, Lock, Eye, EyeOff } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface ReferralSignupProps {
  onNavigate: (page: string) => void;
}

export default function ReferralSignup({ onNavigate }: ReferralSignupProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    paymentMethod: "",
    paymentDetails: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const paymentMethods = [
    { value: "gcash", label: "GCash", placeholder: "Enter GCash number (e.g., 09171234567)" },
    { value: "paymaya", label: "PayMaya", placeholder: "Enter PayMaya number (e.g., 09171234567)" },
    { value: "bank", label: "Bank Transfer", placeholder: "Enter bank account details" },
    { value: "paypal", label: "PayPal", placeholder: "Enter PayPal email" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://sunterra-solar-energy.vercel.app";

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      // Validate password strength
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/referral?action=signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
          paymentMethod: formData.paymentMethod,
          paymentDetails: formData.paymentDetails,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          `Server error: ${response.status} ${response.statusText}. ${text.substring(0, 100)}`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to sign up. Please try again."
        );
      }

      // Success
      setSubmitted(true);
      setReferralCode(data.referralCode);
      setSignedUpEmail(formData.email); // Save email for display
      // Don't auto-login - user needs to login with password
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
        paymentMethod: "",
        paymentDetails: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign up. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted && referralCode) {
    return (
      <>
        <SEO
          title="Referral Sign Up - Success | Sunterra Solar Energy"
          description="Successfully signed up for Sunterra Solar's referral program"
        />
        <section className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Our Referral Program!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Your account has been created successfully.
              </p>

              <div className="bg-gradient-to-br from-blue-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Referral Code</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {referralCode}
                </p>
              </div>

              <div className="space-y-4 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Next Steps:</h3>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Share Your Referral Code
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Share your unique code with friends and family. When they mention your code during their solar installation, you'll earn rewards!
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Access Your Dashboard
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Log in to track your referrals, view earnings, and manage your account.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Start Earning
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Once a referral completes their installation, you'll receive your reward!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => {
                    // Clear any stored email - user needs to login with password
                    localStorage.removeItem("referrer_email");
                    onNavigate("referral-dashboard");
                  }}
                  className="w-full sm:w-auto"
                >
                  Login to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate("referral")}
                  className="w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Need to login later? Use your email to access your dashboard.
                </p>
                {signedUpEmail && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Your login email: <strong className="text-gray-700 dark:text-gray-300">{signedUpEmail}</strong>
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate("referral-dashboard")}
                  className="mt-2"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to Dashboard
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Join Referral Program - Sign Up | Sunterra Solar Energy"
        description="Sign up for Sunterra Solar's referral program and start earning money by referring friends and family to solar energy"
        keywords="referral program sign up, join referral program, solar referral, earn money solar"
      />

      <section className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full mb-6">
                <UserPlus className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Join Our Referral Program
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
                Start Earning Today
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Fill out the form below to join our referral program
              </p>
            </div>

            <Card className="card-3d immersive-hover depth-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="Juan dela Cruz"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        placeholder="juan@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        placeholder="+63 917 123 4567"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                      placeholder="City, Province, Philippines"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        placeholder="At least 6 characters"
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        minLength={6}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                          formData.confirmPassword && formData.password === formData.confirmPassword
                            ? "border-green-500 dark:border-green-400"
                            : formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? "border-red-500 dark:border-red-400"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <div className="mt-1 flex items-center space-x-1">
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Passwords match
                            </p>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-500" />
                            <p className="text-xs text-red-600 dark:text-red-400">
                              Passwords do not match
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Preferred Payment Method *
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    required
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  >
                    <option value="">Select payment method</option>
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.paymentMethod && (
                  <div>
                    <label
                      htmlFor="paymentDetails"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Payment Details *
                    </label>
                    <input
                      type="text"
                      id="paymentDetails"
                      name="paymentDetails"
                      required
                      value={formData.paymentDetails}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder={
                        paymentMethods.find((m) => m.value === formData.paymentMethod)
                          ?.placeholder || "Enter payment details"
                      }
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Signing Up...
                    </>
                  ) : (
                    <>
                      Sign Up Now
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By signing up, you agree to our referral program terms and conditions
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

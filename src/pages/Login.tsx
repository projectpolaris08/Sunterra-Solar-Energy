import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";

interface LoginProps {
  onNavigate: (page: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        onNavigate("admin");
      } else {
        // Check browser console for detailed error
        setError(
          "Invalid email or password. Please check the browser console for details."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        `An error occurred: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mb-4 shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Sunterra Solar Energy</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-400 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200/50 backdrop-blur-sm">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Hint - Only show in development */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 rounded-xl bg-blue-50/50 border border-blue-200/50 backdrop-blur-sm">
              <p className="text-xs text-gray-600 text-center">
                <span className="font-semibold">Development Mode:</span>
                <br />
                Email:{" "}
                <span className="font-mono">
                  {import.meta.env.VITE_ADMIN_EMAIL || "Not configured"}
                </span>
                <br />
                Password: <span className="font-mono">[Hidden]</span>
              </p>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => onNavigate("home")}
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

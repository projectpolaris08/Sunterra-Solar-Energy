import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const authStatus = localStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Admin credentials (hardcoded for simplicity)
    const validEmail =
      import.meta.env.VITE_ADMIN_EMAIL || "info@sunterrasolarenergy.com";
    const validPassword =
      import.meta.env.VITE_ADMIN_PASSWORD || "2Tradeasiaprime";

    // Trim whitespace and normalize email to lowercase for comparison
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedValidEmail = validEmail.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Debug logging (only in development)
    if (import.meta.env.DEV) {
      console.log("Login attempt:", {
        providedEmail: normalizedEmail,
        validEmail: normalizedValidEmail,
        emailMatch: normalizedEmail === normalizedValidEmail,
        passwordMatch: normalizedPassword === validPassword,
      });
    }

    if (
      normalizedEmail === normalizedValidEmail &&
      normalizedPassword === validPassword
    ) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_authenticated", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_authenticated");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

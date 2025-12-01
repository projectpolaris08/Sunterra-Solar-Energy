import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Check localStorage for server-side auth token on initial load
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if there's a stored auth token from server-side login
    return localStorage.getItem("admin_authenticated") === "true";
  });
  const [user, setUser] = useState<any>(null);

  // Check if user is already logged in (Supabase session or localStorage)
  useEffect(() => {
    // First, check localStorage for server-side auth
    const storedAuth = localStorage.getItem("admin_authenticated") === "true";
    if (storedAuth) {
      setIsAuthenticated(true);
    }

    if (!supabase) {
      // If no Supabase, rely on localStorage only
      return;
    }

    // Check existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
        localStorage.setItem("admin_authenticated", "true");
      } else if (storedAuth) {
        // If localStorage says authenticated but no Supabase session,
        // keep authenticated state (server-side auth)
        setIsAuthenticated(true);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
        localStorage.setItem("admin_authenticated", "true");
      } else {
        // Only clear auth if localStorage also doesn't have it
        // This prevents clearing server-side auth on Supabase session expiry
        const hasStoredAuth =
          localStorage.getItem("admin_authenticated") === "true";
        if (!hasStoredAuth) {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Option 1: Try server-side auth first (Vercel endpoint)
    // This is more reliable if Supabase user doesn't exist yet
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://sunterra-solar-energy.vercel.app";

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type") || "";
      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error(
          `Server returned non-JSON response: ${response.status} ${response.statusText}`
        );
      }

      if (data.success) {
        setIsAuthenticated(true);
        // Store authentication state in localStorage for persistence
        localStorage.setItem("admin_authenticated", "true");
        if (data.token) {
          localStorage.setItem("admin_token", data.token);
        }
        return true;
      }
    } catch (error) {
      // Silently fall through to Supabase auth
    }

    // Option 2: Fallback to Supabase Auth if server-side fails
    if (!supabase) {
      return false;
    }

    // Use Supabase Auth as fallback
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        return false;
      }

      if (data.user && data.session) {
        setIsAuthenticated(true);
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    // Clear localStorage
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_token");

    if (!supabase) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
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

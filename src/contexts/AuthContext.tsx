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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check if user is already logged in (Supabase session)
  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase not configured");
      return;
    }

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
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

      console.log(
        "Attempting server-side login to:",
        `${apiUrl}/api/auth/login`
      );
      console.log("Email:", email);

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Server-side login response status:", response.status);

      // Check if response is JSON
      const contentType = response.headers.get("content-type") || "";
      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error(
          `Server returned non-JSON response: ${response.status} ${response.statusText}`
        );
      }

      console.log("Server-side login response data:", {
        ...data,
        password: "[REDACTED]",
      });

      if (data.success) {
        console.log("Server-side login successful!");
        setIsAuthenticated(true);
        return true;
      }

      console.warn("Server-side login failed, trying Supabase...");
      console.error(
        "Server-side login error:",
        data.message || "Unknown error"
      );
    } catch (error) {
      console.warn("Server-side login error, trying Supabase...", error);
    }

    // Option 2: Fallback to Supabase Auth if server-side fails
    if (!supabase) {
      console.error("Supabase not configured and server-side auth failed");
      return false;
    }

    // Use Supabase Auth as fallback
    try {
      console.log("Attempting Supabase login...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error("Supabase login error:", error.message, error);
        return false;
      }

      if (data.user && data.session) {
        console.log("Supabase login successful!");
        setIsAuthenticated(true);
        setUser(data.user);
        return true;
      }

      console.error("Supabase login: No user or session returned");
      return false;
    } catch (error) {
      console.error("Supabase login exception:", error);
      return false;
    }
  };

  const logout = async () => {
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

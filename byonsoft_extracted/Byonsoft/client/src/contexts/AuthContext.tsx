import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { getToken, setToken, removeToken } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  subscription_status: boolean;
  subscription_expiry_date?: string | null;
  referral_code?: string | null;
  whatsapp_number?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  isAdmin: boolean;
  isLoading: boolean;
  userRef: React.MutableRefObject<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<AuthUser | null>(null);

  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((r) => r.json())
        .then((u) => {
          if (u.id) {
            userRef.current = u;
            setUser(u);
          } else {
            removeToken();
          }
        })
        .catch(() => removeToken())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setTokenState(newToken);
    userRef.current = newUser;
    setUser(newUser);
    setIsLoading(false);
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    userRef.current = null;
    setUser(null);
    queryClient.clear();
  };

  const updateUser = (newUser: AuthUser) => {
    userRef.current = newUser;
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAdmin: user?.role === "admin", isLoading, userRef }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const logout = () => {
  localStorage.removeItem("token");          // ya jo bhi key use ho rahi hai
  localStorage.removeItem("byonsoft_token"); // dono clear karo
  setUser(null);
  window.location.href = "/";  // ← YEH LINE ADD KARO
};

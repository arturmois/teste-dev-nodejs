"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  is_online?: boolean;
  last_seen?: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: (onDisconnectSocket?: () => void) => Promise<void>;
  checkAuth: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const publicRoutes = ["/", "/auth/signin", "/auth/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 401) {
        return { success: false, error: "Usuario ou senha inválidos" };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Usuario ou senha inválidos",
        };
      }

      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: "Dados de resposta inválidos" };
    } catch (error) {
      console.error("Erro no login:", error);
      return {
        success: false,
        error: "Erro de conexão. Verifique sua internet.",
      };
    }
  };

  const signup = async (name: string, username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username, password }),
      });

      if (response.ok) {
        return { success: true };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Falha ao criar conta",
      };
    } catch (error) {
      console.error("Erro no cadastro:", error);
      return {
        success: false,
        error: "Erro de conexão. Verifique sua internet.",
      };
    }
  };

  const logout = async (onDisconnectSocket?: () => void) => {
    try {
      if (onDisconnectSocket) {
        onDisconnectSocket();
      }

      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    if (isPublicRoute) {
      setLoading(false);
      setUser(null);
    } else {
      checkAuth();
    }
  }, [pathname, isPublicRoute]);

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

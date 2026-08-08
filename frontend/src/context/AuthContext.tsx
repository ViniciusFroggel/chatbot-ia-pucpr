import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AuthResponse } from "../lib/types";

interface AuthState {
  token: string | null;
  name: string | null;
  email: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  setSession: (auth: AuthResponse) => void;
  logout: () => void;
}

const STORAGE_KEY = "chatbotia:session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredSession(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, name: null, email: null };
    const parsed = JSON.parse(raw) as AuthResponse;
    if (new Date(parsed.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return { token: null, name: null, email: null };
    }
    return { token: parsed.token, name: parsed.name, email: parsed.email };
  } catch {
    return { token: null, name: null, email: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadStoredSession);

  const setSession = useCallback((auth: AuthResponse) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    setState({ token: auth.token, name: auth.name, email: auth.email });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ token: null, name: null, email: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, isAuthenticated: !!state.token, setSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchCurrentUser, logout as logoutApi } from "../lib/auth-api";
import type { AuthUser } from "../types/auth";

type AuthStatus = "loading" | "anonymous" | "unverified" | "authenticated";

type RefreshOptions = {
  /** Actualiza el usuario sin pantalla de carga (no desmonta la página actual). */
  silent?: boolean;
};

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  logout: () => Promise<void>;
  refresh: (options?: RefreshOptions) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async (options?: RefreshOptions) => {
    if (!options?.silent) {
      setStatus("loading");
    }
    try {
      const me = await fetchCurrentUser();
      if (me?.rol === "VERIFIED_STUDENT") {
        setUser(me);
        setStatus("authenticated");
        return;
      }
      if (me?.rol === "STUDENT") {
        setUser(me);
        setStatus("unverified");
        return;
      }
      if (me) await logoutApi();
      setUser(null);
      setStatus("anonymous");
    } catch {
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({ status, user, logout, refresh }),
    [status, user, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}

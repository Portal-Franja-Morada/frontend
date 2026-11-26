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
import type { AuthUser, Role } from "../types/auth";

type AuthStatus = "loading" | "anonymous" | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const STUDENT_ROLES = new Set<Role>(["STUDENT", "VERIFIED_STUDENT"]);

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const me = await fetchCurrentUser();
      if (me && STUDENT_ROLES.has(me.rol)) {
        setUser(me);
        setStatus("authenticated");
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

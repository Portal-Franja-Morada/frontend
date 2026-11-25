import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchCurrentUser,
  login as loginApi,
  logout as logoutApi,
} from "../lib/auth-api";
import type { AuthUser } from "../types/auth";

type AuthStatus = "loading" | "anonymous" | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isAdmin(user: AuthUser | null): user is AuthUser {
  return user?.rol === "ADMIN";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const me = await fetchCurrentUser();
      if (isAdmin(me)) {
        setUser(me);
        setStatus("authenticated");
        return;
      }
      if (me) {
        await logoutApi();
      }
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

  const login = useCallback(async (email: string, password: string) => {
    const me = await loginApi(email, password);
    if (me.rol !== "ADMIN") {
      await logoutApi();
      const error = new Error(
        "Esta cuenta no tiene permisos de administración",
      );
      error.name = "NotAdminError";
      throw error;
    }
    setUser(me);
    setStatus("authenticated");
    return me;
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({ status, user, login, logout, refresh }),
    [status, user, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}

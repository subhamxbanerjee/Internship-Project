import { restoreAuthCredentials } from "../services/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  AuthUser,
  clearAuthCredentials,
  fetchCurrentUser,
  login as apiLogin,
  setAuthCredentials,
  setUnauthorizedHandler,
} from "../services/api";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: string;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearAuthCredentials();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthCredentials();
      setUser(null);
    });
  }, []);

  // Restore logged-in user on page refresh
 useEffect(() => {
  restoreAuthCredentials();
  async function restoreSession() {
      try {
        const authUser = await fetchCurrentUser();
        setUser(authUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    await apiLogin(username, password);
    const authUser = await fetchCurrentUser();
    setAuthCredentials(username, password);
    setUser(authUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || "EMPLOYEE",
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

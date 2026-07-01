import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  AuthUser,
  clearAuthCredentials,
  fetchCurrentUser,
  login as apiLogin,
  setAuthCredentials,
} from '../services/api';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'centuryply_auth';

interface StoredAuth {
  username: string;
  password: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    const { username, password } = JSON.parse(stored) as StoredAuth;
    setAuthCredentials(username, password);
    fetchCurrentUser()
      .then(setUser)
      .catch(() => {
        sessionStorage.removeItem(STORAGE_KEY);
        clearAuthCredentials();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    await apiLogin(username, password);
    const authUser = await fetchCurrentUser();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ username, password }));
    setUser(authUser);
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    clearAuthCredentials();
    setUser(null);
  };

  const refreshUser = async () => {
    const authUser = await fetchCurrentUser();
    setUser(authUser);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading portal...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || 'EMPLOYEE',
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

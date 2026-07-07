import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import {
  AuthUser,
  clearAuthCredentials,
  fetchCurrentUser,
  login as apiLogin,
  setAuthCredentials,
  setUnauthorizedHandler,
} from '../services/api';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

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
        role: user?.role || 'EMPLOYEE',
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

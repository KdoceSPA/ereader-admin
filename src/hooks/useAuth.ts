import { createContext, useContext, useState, useCallback } from 'react';
import type { AuthUser } from '@/types/api';
import { getToken, getUser, setToken, setUser, clearAuth } from '@/lib/auth';
import { login as apiLogin } from '@/api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthState(): AuthContextValue {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const token = getToken();
    return token ? getUser() : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    setToken(response.token);
    setUser(response.user);
    setUserState(response.user);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUserState(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

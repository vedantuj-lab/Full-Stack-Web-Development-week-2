import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  stats: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchRole: (role: 'student' | 'instructor' | 'admin') => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setStats(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setStats(res.data.stats);
      } else {
        removeStoredToken();
        setUser(null);
        setStats(null);
      }
    } catch (err) {
      console.error('Failed to load current user:', err);
      removeStoredToken();
      setUser(null);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await api.login({ email, password });
    setIsLoading(false);

    if (res.success && res.data) {
      setStoredToken(res.data.token);
      setUser(res.data.user);
      await fetchCurrentUser();
      return { success: true, message: res.message };
    } else {
      return {
        success: false,
        message: res.error?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (email: string, password: string, fullName: string, role: UserRole = 'student') => {
    setIsLoading(true);
    const res = await api.register({ email, password, full_name: fullName, role });
    setIsLoading(false);

    if (res.success && res.data) {
      setStoredToken(res.data.token);
      setUser(res.data.user);
      await fetchCurrentUser();
      return { success: true, message: res.message };
    } else {
      return {
        success: false,
        message: res.error?.message || 'Registration failed.',
      };
    }
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
    setStats(null);
  };

  const switchRole = async (role: 'student' | 'instructor' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await api.switchDemo(role);
      if (res.success && res.data) {
        setStoredToken(res.data.token);
        setUser(res.data.user);
        await fetchCurrentUser();
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMe = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

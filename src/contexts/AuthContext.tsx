import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, RegisterData } from '../types';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setError(null);
        } catch (error) {
          console.warn('Authentication failed, clearing invalid token:', error);
          // Clear invalid token and user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setError('Session expired. Please log in again.');
          // Don't redirect here to avoid infinite loops
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { user, token } = await authService.login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Welcome back!');
      return { user, token };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setError(null);
      const { user, token } = await authService.register(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Account created successfully!');
      return { user, token };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    toast.success('Logged out successfully');
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setError(null);
        return userData;
      }
    } catch (error) {
      console.warn('Failed to refresh user data:', error);
      logout();
      // Don't redirect here to avoid infinite loops
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
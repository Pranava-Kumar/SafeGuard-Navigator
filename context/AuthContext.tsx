"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'premium';
  preferences: {
    riskTolerance: number;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('safeguard_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('safeguard_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call - in a real app, this would be a backend authentication
    return new Promise((resolve) => {
      setTimeout(() => {
        // Demo credentials for different user types
        const validCredentials = [
          { email: 'user@example.com', password: 'password', role: 'user' as const },
          { email: 'admin@example.com', password: 'admin123', role: 'admin' as const },
          { email: 'premium@example.com', password: 'premium123', role: 'premium' as const }
        ];

        const validCredential = validCredentials.find(
          cred => cred.email === email && cred.password === password
        );

        if (validCredential) {
          const userData: User = {
            id: `user_${Date.now()}`,
            email: validCredential.email,
            name: validCredential.email.split('@')[0],
            role: validCredential.role,
            preferences: {
              riskTolerance: 50,
              notifications: {
                email: true,
                sms: true,
                push: true
              }
            }
          };

          setUser(userData);
          localStorage.setItem('safeguard_user', JSON.stringify(userData));
          setIsLoading(false);
          resolve(true);
        } else {
          setIsLoading(false);
          resolve(false);
        }
      }, 1000); // Simulate network delay
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('safeguard_user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
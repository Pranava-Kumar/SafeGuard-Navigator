"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Add the EmergencyContact interface before the User interface
interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isVerified: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced User interface based on SafeRoute requirements with DPDP compliance
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  avatar?: string;
  userType: 'pedestrian' | 'two_wheeler' | 'cyclist' | 'public_transport';
  role: 'user' | 'premium' | 'admin' | 'trusted_reporter' | 'civic_partner' | 'super_admin';
  emailVerified: boolean;
  language: 'en' | 'ta' | 'hi'; // English, Tamil, Hindi
  city?: string;
  state?: string;
  country: string;
  subscriptionPlan: 'free' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'trial';
  dataProcessingConsent: boolean;
  consentDate?: Date;
  consentVersion: string;
  locationSharingLevel: 'precise' | 'coarse' | 'city_only';
  crowdsourcingParticipation: boolean;
  personalizedRecommendations: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  riskTolerance: number; // 0-100
  timePreference: 'safety_first' | 'balanced' | 'time_first';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  emergencyContacts?: EmergencyContact[]; // Add this line
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'pedestrian' | 'two_wheeler' | 'cyclist' | 'public_transport';
  dataProcessingConsent: boolean;
  locationSharingLevel: 'precise' | 'coarse' | 'city_only';
  city?: string;
  state?: string;
  language?: 'en' | 'ta' | 'hi';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; errors?: Record<string, string> }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string; errors?: Record<string, string> }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed',
          errors: data.errors
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/simple-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.user) {
        setUser(result.user);
        return {
          success: true,
          message: result.message || 'Registration successful'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Registration failed',
          errors: result.errors
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear user state
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
    refreshUser
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
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
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        // Check for existing session/token
        const token = localStorage.getItem('authToken');
        if (token) {
          // Validate token with backend
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
          const response = await fetch(`${backendUrl}/api/v1/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.user) {
              setUser(result.user);
            }
          } else {
            // Invalid token, clear it
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        // Store token and user data
        localStorage.setItem('authToken', data.access_token);
        setUser(data.user);
        return { success: true, message: "Login successful" };
      } else {
        return {
          success: false,
          message: data.detail || data.message || 'Login failed',
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
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (response.ok && responseData.access_token) {
        // Auto-login after successful registration
        localStorage.setItem('authToken', responseData.access_token);
        setUser(responseData.user);
        return {
          success: true,
          message: 'Registration successful'
        };
      } else {
        return {
          success: false,
          message: responseData.detail || responseData.message || 'Registration failed',
          errors: responseData.errors
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
      
      // Call backend logout endpoint
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch(`${backendUrl}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      // Clear local storage and user state
      localStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if backend call fails
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user) {
            setUser(result.user);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
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
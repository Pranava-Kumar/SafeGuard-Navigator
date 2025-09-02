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
  // Create a mock user for guest access
  const mockUser: User = {
    id: "guest-user-id",
    email: "guest@example.com",
    firstName: "Guest",
    lastName: "User",
    displayName: "Guest User",
    userType: "pedestrian",
    role: "user",
    emailVerified: true,
    language: "en",
    country: "India",
    subscriptionPlan: "free",
    subscriptionStatus: "active",
    dataProcessingConsent: true,
    consentDate: new Date(),
    consentVersion: "1.0",
    locationSharingLevel: "city_only",
    crowdsourcingParticipation: true,
    personalizedRecommendations: true,
    analyticsConsent: false,
    marketingConsent: false,
    riskTolerance: 50,
    timePreference: "balanced",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const [user, setUser] = useState<User | null>(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with mock user (no need to check auth)
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Always succeed with mock user
      setUser(mockUser);
      return { success: true, message: "Login successful" };
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Always succeed with mock user
      setUser(mockUser);
      return {
        success: true,
        message: 'Registration successful'
      };
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Keep the mock user (no actual logout)
      setUser(mockUser);
    } catch (error) {
      console.error('Logout error:', error);
      // Still keep the mock user
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    // No need to refresh for mock user
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: true, // Always authenticated with mock user
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
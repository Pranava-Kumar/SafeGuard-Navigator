"use client";

import { useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'admin' | 'premium';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  redirectTo = '/dashboard' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Store the intended destination for redirect after login
        sessionStorage.setItem('redirect_after_login', window.location.pathname);
        router.push('/dashboard');
        return;
      }

      // Check role-based access
      if (requiredRole === 'admin' && user?.role !== 'admin') {
        router.push('/unauthorized');
        return;
      }

      if (requiredRole === 'premium' && user?.role !== 'premium' && user?.role !== 'admin') {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (requiredRole === 'premium' && user?.role !== 'premium' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">Premium Feature</h1>
          <p className="text-gray-600 mb-4">This feature requires a premium subscription.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
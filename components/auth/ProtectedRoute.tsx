"use client";

import { useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'admin' | 'premium' | 'trusted_reporter' | 'civic_partner';
  redirectTo?: string;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/unauthorized'
];

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if still loading or if on a public route
    if (isLoading || PUBLIC_ROUTES.includes(pathname)) {
      return;
    }

    if (!isAuthenticated) {
      // Store the intended destination for redirect after login
      sessionStorage.setItem('redirect_after_login', pathname);
      router.push(redirectTo);
      return;
    }

    // Check role-based access
    if (user && requiredRole) {
      const hasAccess = checkRoleAccess(user.role, requiredRole);
      if (!hasAccess) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router, redirectTo, pathname]);

  // Role hierarchy check
  const checkRoleAccess = (userRole: string, requiredRole: string): boolean => {
    const roleHierarchy: Record<string, number> = {
      'user': 1,
      'trusted_reporter': 2,
      'premium': 3,
      'civic_partner': 4,
      'admin': 5
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Allow access to public routes regardless of auth status
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // Show redirect message for unauthenticated users
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
  if (user && requiredRole && !checkRoleAccess(user.role, requiredRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. 
            {requiredRole === 'premium' && 'This feature requires a premium subscription.'}
            {requiredRole === 'admin' && 'This page is restricted to administrators.'}
            {requiredRole === 'trusted_reporter' && 'This feature is available to trusted community reporters.'}
            {requiredRole === 'civic_partner' && 'This page is restricted to civic partners.'}
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Go to Dashboard
          </button>
          {requiredRole === 'premium' && (
            <button 
              onClick={() => router.push('/upgrade')}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Upgrade Now
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
"use client";

import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'admin' | 'premium' | 'trusted_reporter' | 'civic_partner';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children 
}: ProtectedRouteProps) {
  // Simply return children without any authentication checks
  return <>{children}</>;
}
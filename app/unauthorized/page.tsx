"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    if (user) {
      // If user is logged in but doesn't have permission, redirect to dashboard
      window.location.href = "/dashboard";
    } else {
      // If user is not logged in, redirect to home
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don&#39;t have permission to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="text-sm text-gray-600 text-center">
              Logged in as: <span className="font-medium">{user.email}</span>
              <br />
              Role: <span className="font-medium capitalize">{user.role}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>

            {user && (
              <Button
                variant="outline"
                onClick={logout}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>

          {!user && (
            <div className="text-center text-sm text-gray-500">
              Please sign in to access this feature.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
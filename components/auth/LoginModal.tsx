"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Lock, Eye, EyeOff, Fingerprint, Smartphone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  // Generate a simple device ID for tracking (in a real app, you'd use a more robust method)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('device_id');
      if (!id) {
        id = 'device_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device_id', id);
      }
      setDeviceId(id);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all fields" });
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      toast({ title: "Success", description: "Logged in successfully!" });
      onClose();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message || "Invalid email or password" });
    }
  };

  const handleDemoLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your SafeGuard Navigator account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="remember-me" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Button variant="link" className="text-sm p-0 h-auto">
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Quick Access
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="text-sm text-gray-600">Demo Accounts:</div>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-between text-xs"
                  onClick={() => handleDemoLogin("pedestrian@demo.com", "Demo123!")}
                >
                  <div className="flex items-center">
                    <span>🚶</span>
                    <span className="ml-2">Pedestrian Demo</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Demo</Badge>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between text-xs"
                  onClick={() => handleDemoLogin("rider@demo.com", "Demo123!")}
                >
                  <div className="flex items-center">
                    <span>🏍️</span>
                    <span className="ml-2">Two-Wheeler Demo</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Demo</Badge>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between text-xs"
                  onClick={() => handleDemoLogin("admin@demo.com", "Admin123!")}
                >
                  <div className="flex items-center">
                    <span>🛡️</span>
                    <span className="ml-2">Admin Demo</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Demo</Badge>
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="ghost" className="w-full" disabled>
                <Fingerprint className="mr-2 h-4 w-4" />
                Biometric Login
              </Button>
              <Button variant="ghost" className="w-full" disabled>
                <Smartphone className="mr-2 h-4 w-4" />
                OTP Login
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button variant="link" onClick={onSwitchToSignup} className="text-sm">
              Don't have an account? Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
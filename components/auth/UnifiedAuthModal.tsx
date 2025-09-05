"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  MapPin, 
  Check, 
  Globe, 
  Languages,
  Fingerprint,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnifiedAuthModal({ isOpen, onClose }: UnifiedAuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    userType: "pedestrian" as "pedestrian" | "two_wheeler" | "cyclist" | "public_transport",
    city: "",
    state: "",
    language: "en" as "en" | "ta" | "hi",
    dataProcessingConsent: false,
    locationSharingConsent: false,
    crowdsourcingConsent: true,
    analyticsConsent: false,
    marketingConsent: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [deviceId, setDeviceId] = useState("");

  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  // Generate a simple device ID for tracking
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

  // Handle login form changes
  const handleLoginChange = (field: string, value: string | boolean) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  // Handle signup form changes
  const handleSignupChange = (field: string, value: string | boolean) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (signupErrors[field]) {
      setSignupErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle demo login
  const handleDemoLogin = (email: string, password: string) => {
    setLoginData({ email, password, rememberMe: false });
  };

  // Validate signup form
  const validateSignupForm = () => {
    const newErrors: Record<string, string> = {};

    if (!signupData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!signupData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!signupData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!signupData.password) {
      newErrors.password = "Password is required";
    } else if (signupData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signupData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter, one uppercase letter, and one number";
    }

    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!signupData.dataProcessingConsent) {
      newErrors.dataProcessingConsent = "You must consent to data processing to create an account";
    }

    if (!signupData.locationSharingConsent) {
      newErrors.locationSharingConsent = "You must consent to location sharing for safety features";
    }

    setSignupErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginData.email || !loginData.password) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all fields" });
      return;
    }

    const result = await login(loginData.email, loginData.password);
    if (result.success) {
      toast({ title: "Success", description: "Logged in successfully!" });
      onClose();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message || "Invalid email or password" });
    }
  };

  // Handle signup submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignupForm()) {
      return;
    }

    try {
      const result = await register({
        email: signupData.email,
        password: signupData.password,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        phone: signupData.phone || undefined,
        userType: signupData.userType,
        dataProcessingConsent: signupData.dataProcessingConsent,
        locationSharingLevel: "coarse",
        city: signupData.city || undefined,
        state: signupData.state || undefined,
        language: signupData.language
      });

      if (result.success) {
        toast({ title: "Success", description: result.message || "Account created successfully! Welcome to SafeRoute." });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message || "Registration failed. Please try again." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Network error. Please try again." });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">
            {activeTab === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {activeTab === "login" 
              ? "Sign in to your SafeGuard Navigator account" 
              : "Join SafeGuard Navigator to start your safety journey"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => handleLoginChange("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => handleLoginChange("password", e.target.value)}
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
                      checked={loginData.rememberMe}
                      onChange={(e) => handleLoginChange("rememberMe", e.target.checked)}
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
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter first name"
                        value={signupData.firstName}
                        onChange={(e) => handleSignupChange("firstName", e.target.value)}
                        className={`pl-10 ${signupErrors.firstName ? 'border-red-300' : ''}`}
                        required
                      />
                    </div>
                    {signupErrors.firstName && (
                      <p className="text-sm text-red-600">{signupErrors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter last name"
                        value={signupData.lastName}
                        onChange={(e) => handleSignupChange("lastName", e.target.value)}
                        className={`pl-10 ${signupErrors.lastName ? 'border-red-300' : ''}`}
                        required
                      />
                    </div>
                    {signupErrors.lastName && (
                      <p className="text-sm text-red-600">{signupErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => handleSignupChange("email", e.target.value)}
                      className={`pl-10 ${signupErrors.email ? 'border-red-300' : ''}`}
                      required
                    />
                  </div>
                  {signupErrors.email && (
                    <p className="text-sm text-red-600">{signupErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={signupData.phone}
                      onChange={(e) => handleSignupChange("phone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userType">I am a</Label>
                    <Select value={signupData.userType} onValueChange={(value) => handleSignupChange("userType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pedestrian">
                          <div className="flex items-center gap-2">
                            <span>🚶</span>
                            <span>Pedestrian</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="two_wheeler">
                          <div className="flex items-center gap-2">
                            <span>🏍️</span>
                            <span>Two-Wheeler Rider</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cyclist">
                          <div className="flex items-center gap-2">
                            <span>🚴</span>
                            <span>Cyclist</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="public_transport">
                          <div className="flex items-center gap-2">
                            <span>🚌</span>
                            <span>Public Transport User</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City (Optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="city"
                        type="text"
                        placeholder="Your city"
                        value={signupData.city}
                        onChange={(e) => handleSignupChange("city", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State (Optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="state"
                        type="text"
                        placeholder="Your state"
                        value={signupData.state}
                        onChange={(e) => handleSignupChange("state", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language Preference</Label>
                  <div className="relative">
                    <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Select value={signupData.language} onValueChange={(value) => handleSignupChange("language", value)}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => handleSignupChange("password", e.target.value)}
                      className={`pl-10 pr-10 ${signupErrors.password ? 'border-red-300' : ''}`}
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
                  {signupErrors.password && (
                    <p className="text-sm text-red-600">{signupErrors.password}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => handleSignupChange("confirmPassword", e.target.value)}
                      className={`pl-10 pr-10 ${signupErrors.confirmPassword ? 'border-red-300' : ''}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {signupErrors.confirmPassword && (
                    <p className="text-sm text-red-600">{signupErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="dataProcessingConsent"
                        checked={signupData.dataProcessingConsent}
                        onCheckedChange={(checked) => handleSignupChange("dataProcessingConsent", checked === true)}
                        className={signupErrors.dataProcessingConsent ? 'border-red-300' : ''}
                      />
                      <Label htmlFor="dataProcessingConsent" className="text-sm leading-5">
                        I consent to the processing of my personal data in accordance with SafeRoute's Privacy Policy and India's Digital Personal Data Protection Act 2023. *
                      </Label>
                    </div>
                    {signupErrors.dataProcessingConsent && (
                      <p className="text-sm text-red-600">{signupErrors.dataProcessingConsent}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Your data will be processed securely within India and you retain full control over your information.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="locationSharingConsent"
                        checked={signupData.locationSharingConsent}
                        onCheckedChange={(checked) => handleSignupChange("locationSharingConsent", checked === true)}
                        className={signupErrors.locationSharingConsent ? 'border-red-300' : ''}
                      />
                      <Label htmlFor="locationSharingConsent" className="text-sm leading-5">
                        I consent to sharing my location data for safety scoring and route optimization. *
                      </Label>
                    </div>
                    {signupErrors.locationSharingConsent && (
                      <p className="text-sm text-red-600">{signupErrors.locationSharingConsent}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Location data is used to calculate safety scores and provide personalized route recommendations.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="crowdsourcingConsent"
                        checked={signupData.crowdsourcingConsent}
                        onCheckedChange={(checked) => handleSignupChange("crowdsourcingConsent", checked === true)}
                      />
                      <Label htmlFor="crowdsourcingConsent" className="text-sm leading-5">
                        I consent to participate in community safety reporting (crowdsourcing).
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your reports help improve safety for the entire community. You can opt out at any time.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="analyticsConsent"
                        checked={signupData.analyticsConsent}
                        onCheckedChange={(checked) => handleSignupChange("analyticsConsent", checked === true)}
                      />
                      <Label htmlFor="analyticsConsent" className="text-sm leading-5">
                        I consent to anonymized usage analytics for product improvement.
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Analytics help us improve SafeRoute and understand user needs. All data is anonymized.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="marketingConsent"
                        checked={signupData.marketingConsent}
                        onCheckedChange={(checked) => handleSignupChange("marketingConsent", checked === true)}
                      />
                      <Label htmlFor="marketingConsent" className="text-sm leading-5">
                        I consent to receive product updates and safety tips via email.
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Stay informed about new features, safety tips, and community initiatives.
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create SafeRoute Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
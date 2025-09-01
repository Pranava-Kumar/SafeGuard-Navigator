"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Mail, Lock, User, Phone, Eye, EyeOff, MapPin, Check, Globe, Languages } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { register, isLoading } = useAuth();
  const { toast } = useToast();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter, one uppercase letter, and one number";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.dataProcessingConsent) {
      newErrors.dataProcessingConsent = "You must consent to data processing to create an account";
    }

    if (!formData.locationSharingConsent) {
      newErrors.locationSharingConsent = "You must consent to location sharing for safety features";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        userType: formData.userType,
        dataProcessingConsent: formData.dataProcessingConsent,
        locationSharingLevel: "coarse",
        city: formData.city || undefined,
        state: formData.state || undefined,
        language: formData.language
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Join SafeGuard Navigator to start your safety journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {generalError && (
                <Alert variant="destructive">
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className={`pl-10 ${errors.firstName ? 'border-red-300' : ''}`}
                      required
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
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
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className={`pl-10 ${errors.lastName ? 'border-red-300' : ''}`}
                      required
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-300' : ''}`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
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
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userType">I am a</Label>
                  <Select value={formData.userType} onValueChange={(value) => handleChange("userType", value)}>
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
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
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
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language Preference</Label>
                <div className="relative">
                  <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select value={formData.language} onValueChange={(value) => handleChange("language", value)}>
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
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-300' : ''}`}
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
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className={`pl-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="dataProcessingConsent"
                      checked={formData.dataProcessingConsent}
                      onCheckedChange={(checked) => handleChange("dataProcessingConsent", checked === true)}
                      className={errors.dataProcessingConsent ? 'border-red-300' : ''}
                    />
                    <Label htmlFor="dataProcessingConsent" className="text-sm leading-5">
                      I consent to the processing of my personal data in accordance with SafeRoute's Privacy Policy and India's Digital Personal Data Protection Act 2023. *
                    </Label>
                  </div>
                  {errors.dataProcessingConsent && (
                    <p className="text-sm text-red-600">{errors.dataProcessingConsent}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Your data will be processed securely within India and you retain full control over your information.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="locationSharingConsent"
                      checked={formData.locationSharingConsent}
                      onCheckedChange={(checked) => handleChange("locationSharingConsent", checked === true)}
                      className={errors.locationSharingConsent ? 'border-red-300' : ''}
                    />
                    <Label htmlFor="locationSharingConsent" className="text-sm leading-5">
                      I consent to sharing my location data for safety scoring and route optimization. *
                    </Label>
                  </div>
                  {errors.locationSharingConsent && (
                    <p className="text-sm text-red-600">{errors.locationSharingConsent}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Location data is used to calculate safety scores and provide personalized route recommendations.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="crowdsourcingConsent"
                      checked={formData.crowdsourcingConsent}
                      onCheckedChange={(checked) => handleChange("crowdsourcingConsent", checked === true)}
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
                      checked={formData.analyticsConsent}
                      onCheckedChange={(checked) => handleChange("analyticsConsent", checked === true)}
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
                      checked={formData.marketingConsent}
                      onCheckedChange={(checked) => handleChange("marketingConsent", checked === true)}
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
          )}

          <div className="mt-6 text-center">
            <Button variant="link" onClick={onSwitchToLogin} className="text-sm">
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
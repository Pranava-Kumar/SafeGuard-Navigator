"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  MapPin, 
  BarChart3, 
  Navigation, 
  AlertTriangle,
  Users,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NavigationBar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/", icon: Shield },
    { name: "Map", href: "/map", icon: MapPin },
    { name: "Routes", href: "/routes", icon: Navigation },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Emergency", href: "/emergency", icon: AlertTriangle },
    { name: "Community", href: "/community", icon: Users },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SafeRoute</span>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* User actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600 hidden md:inline">
                  Welcome, {user.firstName || user.email}!
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/login"}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => window.location.href = "/register"}>
                  Get Started
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
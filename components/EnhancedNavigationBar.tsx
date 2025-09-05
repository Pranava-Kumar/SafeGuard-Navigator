"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Shield,
  MapPin,
  BarChart3,
  Navigation,
  AlertTriangle,
  Users,
  Menu,
  X,
  Home,
  TrendingUp,
  MessageCircle,
  ChevronDown,
  User,
  LogIn,
  UserPlus,
  BookOpen,
  Phone,
  DollarSign,
  Info,
  Heart,
  Lightbulb,
  Route,
  FileText,
  Award,
  Bell,
  Settings,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UnifiedAuthModal from "@/components/auth/UnifiedAuthModal";

export default function EnhancedNavigationBar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pathname = usePathname();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside of any dropdown
      const dropdownElements = document.querySelectorAll('[data-dropdown]');
      let clickedInsideDropdown = false;
      
      dropdownElements.forEach(element => {
        if (element.contains(e.target as Node)) {
          clickedInsideDropdown = true;
        }
      });
      
      if (!clickedInsideDropdown) {
        setDropdownOpen(null);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Navigation items with dropdowns
  const navItems = [
    { 
      name: "Home", 
      href: "/", 
      icon: Home,
      showInDropdown: false
    },
    { 
      name: "Map & Routes", 
      href: "#", 
      icon: MapPin,
      showInDropdown: false,
      dropdown: [
        { name: "Safety Map", href: "/map", icon: MapPin },
        { name: "Route Planning", href: "/routes", icon: Navigation }
      ]
    },
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: BarChart3,
      showInDropdown: false
    },
    { 
      name: "Analytics", 
      href: "/analytics", 
      icon: TrendingUp,
      showInDropdown: false
    },
    { 
      name: "Safety Hub", 
      href: "#", 
      icon: Shield,
      showInDropdown: false,
      dropdown: [
        { name: "Emergency Hub", href: "/emergency", icon: AlertTriangle },
        { name: "Safety Tips", href: "/safety/tips", icon: Lightbulb },
        { name: "First Aid", href: "/safety/first-aid", icon: Heart },
        { name: "Safety Resources", href: "/safety/resources", icon: BookOpen }
      ]
    },
    { 
      name: "Community", 
      href: "/community", 
      icon: Users,
      showInDropdown: false
    },
    { 
      name: "About", 
      href: "/about", 
      icon: Info,
      showInDropdown: false
    }
  ];

  // Additional pages that should appear in dropdowns
  const additionalPages = [
    { name: "Pricing", href: "/pricing", icon: DollarSign },
    { name: "Contact", href: "/contact", icon: Phone }
  ];

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathnames = pathname.split("/").filter((x) => x);
    
    if (pathnames.length === 0) {
      return [{ name: "Home", href: "/" }];
    }
    
    let breadcrumbPath = "";
    const breadcrumbs = [{ name: "Home", href: "/" }];
    
    pathnames.forEach((pathname, index) => {
      breadcrumbPath += `/${pathname}`;
      const isLast = index === pathnames.length - 1;
      
      breadcrumbs.push({
        name: pathname.charAt(0).toUpperCase() + pathname.slice(1),
        href: isLast ? "" : breadcrumbPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleDropdownToggle = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDropdownOpen(dropdownOpen === name ? null : name);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      {/* Main Navigation */}
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
                  <div key={item.name} className="relative" data-dropdown>
                    {item.dropdown ? (
                      <div 
                        className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center cursor-pointer"
                        onClick={(e) => handleDropdownToggle(item.name, e)}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    )}
                    
                    {/* Dropdown menu */}
                    {item.dropdown && dropdownOpen === item.name && (
                      <div 
                        className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                              onClick={() => setDropdownOpen(null)}
                            >
                              <dropdownItem.icon className="h-4 w-4 mr-3" />
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* User actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" data-dropdown>
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={(e) => handleDropdownToggle("user", e)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600 hidden md:inline">
                    {user.firstName || user.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden md:inline" />
                </div>
                
                {/* User dropdown menu */}
                {dropdownOpen === "user" && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div>Signed in as</div>
                        <div className="font-medium truncate">{user.email}</div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                        onClick={() => setDropdownOpen(null)}
                      >
                        <User className="h-4 w-4 mr-3 inline" />
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                        onClick={() => setDropdownOpen(null)}
                      >
                        <Settings className="h-4 w-4 mr-3 inline" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <LogIn className="h-4 w-4 mr-3 inline" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative" data-dropdown>
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAuthModal(true);
                    setDropdownOpen(null);
                  }}
                >
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
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
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 hidden md:block">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index}>
                <div className="flex items-center">
                  {index > 0 && (
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {breadcrumb.href ? (
                    <Link
                      href={breadcrumb.href}
                      className={`ml-2 text-sm font-medium ${
                        index === breadcrumbs.length - 1
                          ? "text-gray-900"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {breadcrumb.name}
                    </Link>
                  ) : (
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {breadcrumb.name}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <div key={item.name}>
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
                {item.dropdown && (
                  <div className="pl-6 py-1 space-y-1">
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.name}
                        href={dropdownItem.href}
                        className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-sm font-medium flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <dropdownItem.icon className="h-4 w-4 mr-2" />
                        {dropdownItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Additional pages in mobile menu */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                More
              </div>
              {additionalPages.map((page) => (
                <Link
                  key={page.name}
                  href={page.href}
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <page.icon className="h-4 w-4 mr-2" />
                  {page.name}
                </Link>
              ))}
            </div>
            
            {/* User actions in mobile menu */}
            {user ? (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-700">
                  Signed in as {user.email}
                </div>
                <Link
                  href="/dashboard"
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center w-full text-left"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center w-full text-left"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Authentication Modal */}
      <UnifiedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </nav>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  Database,
  Server,
  MapPin,
  Shield
} from "lucide-react";

interface ServiceStatus {
  name: string;
  status: "running" | "stopped" | "checking" | "error";
  url: string;
  description: string;
  icon: React.ReactNode;
}

export default function ServiceStatusDashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Frontend",
      status: "checking",
      url: "http://localhost:3000",
      description: "Next.js Development Server",
      icon: <Server className="h-5 w-5" />
    },
    {
      name: "Backend API",
      status: "checking",
      url: "http://localhost:8000",
      description: "FastAPI Backend Server",
      icon: <Shield className="h-5 w-5" />
    },
    {
      name: "OSRM Service",
      status: "checking",
      url: "http://localhost:5000",
      description: "OSRM Routing Engine",
      icon: <MapPin className="h-5 w-5" />
    },
    {
      name: "Database",
      status: "checking",
      url: "Database Connection",
      description: "PostgreSQL/NeonDB",
      icon: <Database className="h-5 w-5" />
    }
  ]);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkServiceStatus = async (service: ServiceStatus) => {
    // For frontend, we can't actually check localhost from the browser due to CORS
    // This is a simulation - in a real implementation, this would be a backend endpoint
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Randomly determine status for demonstration
      const statuses: ("running" | "stopped" | "error")[] = ["running", "stopped", "error"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return randomStatus;
    } catch (error) {
      return "error";
    }
  };

  const checkAllServices = async () => {
    setLastChecked(new Date());
    
    const updatedServices = await Promise.all(
      services.map(async (service) => {
        // Skip database check in frontend simulation
        if (service.name === "Database") {
          return { ...service, status: "checking" };
        }
        
        const status = await checkServiceStatus(service);
        return { ...service, status };
      })
    );
    
    setServices(updatedServices);
  };

  useEffect(() => {
    checkAllServices();
    const interval = setInterval(checkAllServices, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "running":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "stopped":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "checking":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "running":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Running</Badge>;
      case "stopped":
        return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">Stopped</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "checking":
        return <Badge variant="secondary">Checking</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Service Status Dashboard
            </CardTitle>
            <CardDescription>
              Monitor the status of all SafeRoute services
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkAllServices}
            disabled={services.some(s => s.status === "checking")}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${services.some(s => s.status === "checking") ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{service.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(service.status)}
                {getStatusIcon(service.status)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Service Status Legend</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-blue-800">Running - Service is operational</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-blue-800">Stopped/Error - Service is down</span>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-blue-800">Checking - Status being verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gray-300"></div>
              <span className="text-blue-800">Unknown - Status cannot be determined</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lightbulb, 
  Users, 
  AlertTriangle, 
  Target, 
  Clock,
  BarChart3
} from "lucide-react";

interface SafetyFactors {
  lighting?: number;
  footfall?: number;
  hazards?: number;
  proximity_to_help?: number;
  [key: string]: number | undefined;
}

interface SafetyScoreDisplayProps {
  score: number;
  factors?: SafetyFactors;
  className?: string;
}

export default function SafetyScoreDisplay({ 
  score, 
  factors = {}, 
  className = ""
}: SafetyScoreDisplayProps) {
  const getSafetyColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getSafetyLevel = (score: number) => {
    if (score >= 80) return { level: "Very Safe", icon: Shield, color: "text-green-600" };
    if (score >= 60) return { level: "Safe", icon: Shield, color: "text-yellow-600" };
    if (score >= 40) return { level: "Moderate", icon: AlertTriangle, color: "text-orange-600" };
    return { level: "Unsafe", icon: AlertTriangle, color: "text-red-600" };
  };

  const safetyInfo = getSafetyLevel(score);
  const IconComponent = safetyInfo.icon;

  // Default factors if not provided
  const defaultFactors: SafetyFactors = {
    lighting: factors.lighting ?? 75,
    footfall: factors.footfall ?? 80,
    hazards: factors.hazards ?? 15,
    proximity_to_help: factors.proximity_to_help ?? 82
  };

  const safetyFactors = [
    {
      name: "Lighting",
      score: defaultFactors.lighting!,
      icon: Lightbulb,
      color: "bg-yellow-500"
    },
    {
      name: "Footfall",
      score: defaultFactors.footfall!,
      icon: Users,
      color: "bg-blue-500"
    },
    {
      name: "Hazards",
      score: defaultFactors.hazards!,
      icon: AlertTriangle,
      color: "bg-red-500"
    },
    {
      name: "Proximity to Help",
      score: defaultFactors.proximity_to_help!,
      icon: Target,
      color: "bg-green-500"
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <IconComponent className={`h-5 w-5 mr-2 ${safetyInfo.color}`} />
          Safety Information
        </CardTitle>
        <CardDescription>
          Real-time safety assessment for this location
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className={`text-5xl font-bold ${getSafetyColor(score).includes('green') ? 'text-green-600' : 
            getSafetyColor(score).includes('yellow') ? 'text-yellow-600' : 
            getSafetyColor(score).includes('orange') ? 'text-orange-600' : 'text-red-600'}`}>
            {score}
          </div>
          <div className="text-sm text-gray-500 mt-1">out of 100</div>
          <Badge variant="outline" className={`mt-2 ${getSafetyColor(score)}`}>
            {safetyInfo.level}
          </Badge>
        </div>
        
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Safety Factors</h4>
          <div className="space-y-3">
            {safetyFactors.map((factor) => {
              const IconComponent = factor.icon;
              return (
                <div key={factor.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <IconComponent className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{factor.name}</span>
                    </div>
                    <span className={`text-sm font-medium ${getSafetyColor(factor.score).includes('green') ? 'text-green-600' : 
                      getSafetyColor(factor.score).includes('yellow') ? 'text-yellow-600' : 
                      getSafetyColor(factor.score).includes('orange') ? 'text-orange-600' : 'text-red-600'}`}>
                      {factor.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getSafetyColor(factor.score).includes('green') ? 'bg-green-500' : 
                        getSafetyColor(factor.score).includes('yellow') ? 'bg-yellow-500' : 
                        getSafetyColor(factor.score).includes('orange') ? 'bg-orange-500' : 'bg-red-500'}`} 
                      style={{ width: `${factor.score}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">AI-Powered Analysis</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Real-time
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
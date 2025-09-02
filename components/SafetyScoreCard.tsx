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

interface SafetyFactor {
  name: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface SafetyScoreDisplayProps {
  score: number;
  factors: {
    lighting: number;
    footfall: number;
    hazards: number;
    proximity_to_help: number;
  };
  className?: string;
}

export default function SafetyScoreDisplay({ 
  score, 
  factors, 
  className = "" 
}: SafetyScoreDisplayProps) {
  const getSafetyColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getSafetyLevel = (score: number) => {
    if (score >= 80) return "Very Safe";
    if (score >= 60) return "Safe";
    if (score >= 40) return "Moderate";
    return "Unsafe";
  };

  const safetyFactors: SafetyFactor[] = [
    {
      name: "Lighting",
      score: factors.lighting,
      icon: Lightbulb,
      color: "bg-yellow-500",
      description: "Quality of street lighting and illumination"
    },
    {
      name: "Footfall",
      score: factors.footfall,
      icon: Users,
      color: "bg-blue-500",
      description: "Pedestrian activity providing natural surveillance"
    },
    {
      name: "Hazards",
      score: factors.hazards,
      icon: AlertTriangle,
      color: "bg-red-500",
      description: "Potential risks and dangerous conditions"
    },
    {
      name: "Proximity to Help",
      score: factors.proximity_to_help,
      icon: Target,
      color: "bg-green-500",
      description: "Distance to emergency services and help"
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className={`h-5 w-5 mr-2 ${getSafetyColor(score).includes('green') ? 'text-green-600' : 
            getSafetyColor(score).includes('yellow') ? 'text-yellow-600' : 
            getSafetyColor(score).includes('orange') ? 'text-orange-600' : 'text-red-600'}`} />
          Safety Score
        </CardTitle>
        <CardDescription>
          Overall safety assessment for this location
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
            {getSafetyLevel(score)}
          </Badge>
        </div>
        
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Safety Factors</h4>
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
                    {factor.score}
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
        
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <BarChart3 className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Safety Insights</span>
          </div>
          <p className="text-xs text-blue-800 mt-1">
            {score >= 80 
              ? "This location is considered very safe with good lighting, high footfall, and minimal hazards."
              : score >= 60
              ? "This location is generally safe but has some areas for improvement."
              : score >= 40
              ? "Exercise caution in this area, especially during night hours."
              : "Avoid this area if possible, especially during night hours."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface SafetyScoreDisplayProps {
  score: number;
  factors: {
    lighting: number;
    footfall: number;
    hazards: number;
    proximity_to_help: number;
  };
}

export default function SafetyScoreDisplay({ score, factors }: SafetyScoreDisplayProps) {
  const getSafetyColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    if (score >= 25) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className={`h-5 w-5 mr-2 ${getSafetyColor(score)}`} />
          Safety Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className={`text-6xl font-bold ${getSafetyColor(score)}`}>{score}</div>
          <div className="text-sm text-gray-500">out of 100</div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Lighting</span>
            <span className={`text-sm font-medium ${getSafetyColor(factors.lighting)}`}>
              {factors.lighting}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Footfall</span>
            <span className={`text-sm font-medium ${getSafetyColor(factors.footfall)}`}>
              {factors.footfall}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Hazards</span>
            <span className={`text-sm font-medium ${getSafetyColor(factors.hazards)}`}>
              {factors.hazards}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Proximity to Help</span>
            <span className={`text-sm font-medium ${getSafetyColor(factors.proximity_to_help)}`}>
              {factors.proximity_to_help}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Safety Scoring Types and Interfaces
 * Defines the data structures and types used in the safety scoring system
 */

// Safety factors interface
export interface SafetyFactors {
  lighting: number; // 0-100 normalized lighting quality
  footfall: number; // 0-100 normalized footfall activity
  hazards: number; // 0-100 normalized hazard index (inverted in final score)
  proximityToHelp: number; // 0-100 normalized proximity to help services
}

// Safety score result interface
export interface SafetyScoreResult {
  overall: number; // 0-100 final safety score
  factors: SafetyFactors;
  confidence: number; // 0-1 data reliability
  weightedFactors: {
    lighting: number;
    footfall: number;
    hazards: number; // Inverted (100 - hazards)
    proximityToHelp: number;
  };
}

// Contextual information for safety scoring
export interface SafetyScoreContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userType: 'pedestrian' | 'two_wheeler' | 'cyclist' | 'public_transport';
  weatherCondition?: 'clear' | 'cloudy' | 'rainy' | 'stormy';
  localEvents?: string[];
}

// Default weights for the SafetyScore algorithm
export const DEFAULT_WEIGHTS = {
  lighting: 0.30,      // wL - Critical for night safety
  footfall: 0.25,      // wF - Activity indicates safety
  hazards: 0.20,       // wH - Hazard index (inverted)
  proximityToHelp: 0.25 // wP - Proximity to help
};

// Safety level definitions
export const SAFETY_LEVELS = {
  verySafe: {
    minScore: 80,
    level: "Very Safe",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "High safety with excellent lighting, activity, and help proximity"
  },
  safe: {
    minScore: 60,
    level: "Safe",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    description: "Generally safe with some areas for improvement"
  },
  moderate: {
    minScore: 40,
    level: "Moderate",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "Exercise caution, especially at night or in isolated areas"
  },
  unsafe: {
    minScore: 0,
    level: "Unsafe",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "Avoid if possible, especially at night or for vulnerable users"
  }
};

// Get safety level based on score
export function getSafetyLevel(score: number): typeof SAFETY_LEVELS[keyof typeof SAFETY_LEVELS] {
  if (score >= 80) return SAFETY_LEVELS.verySafe;
  if (score >= 60) return SAFETY_LEVELS.safe;
  if (score >= 40) return SAFETY_LEVELS.moderate;
  return SAFETY_LEVELS.unsafe;
}

// Mock infrastructure data for demonstration
export const MOCK_INFRASTRUCTURE_DATA = {
  police: [
    { id: 'police-1', name: 'Central Police Station', distance: 500, responseTime: 300 },
    { id: 'police-2', name: 'North Police Station', distance: 800, responseTime: 420 }
  ],
  hospitals: [
    { id: 'hospital-1', name: 'City General Hospital', distance: 600, responseTime: 360 },
    { id: 'hospital-2', name: 'Emergency Care Center', distance: 1200, responseTime: 600 }
  ],
  fire: [
    { id: 'fire-1', name: 'Central Fire Station', distance: 700, responseTime: 300 }
  ],
  streetLights: [
    { id: 'light-1', name: 'Street Lamp', distance: 100, status: 'working' },
    { id: 'light-2', name: 'Street Lamp', distance: 150, status: 'broken' }
  ],
  cctv: [
    { id: 'cctv-1', name: 'Security Camera', distance: 200, status: 'active' }
  ]
};

// Mock hazard data for demonstration
export const MOCK_HAZARD_DATA = [
  { id: 'hazard-1', type: 'pothole', severity: 3, timestamp: new Date('2025-01-10'), verified: true },
  { id: 'hazard-2', type: 'poor_lighting', severity: 4, timestamp: new Date('2025-01-12'), verified: false },
  { id: 'hazard-3', type: 'harassment', severity: 5, timestamp: new Date('2025-01-08'), verified: true }
];

// Mock footfall data for demonstration
export const MOCK_FOOTFALL_DATA = {
  poiDensity: 25,
  businessActivity: 75,
  transitActivity: 80,
  historicalData: [10, 15, 20, 30, 50, 80, 90, 85, 70, 60, 55, 50, 45, 40, 35, 45, 60, 80, 95, 100, 90, 75, 60, 40]
};

// Mock weather data for demonstration
export const MOCK_WEATHER_DATA = {
  temperature: 28,
  humidity: 65,
  visibility: 8,
  conditions: 'clear',
  windSpeed: 5,
  precipitation: 0
};

// Mock municipal dark spot data for demonstration
export const MOCK_MUNICIPAL_DATA = {
  darkSpots: [
    { id: 'dark-1', location: [13.0827, 80.2707], status: 'identified', priority: 'high' },
    { id: 'dark-2', location: [13.0398, 80.2342], status: 'improving', priority: 'medium' }
  ],
  lightingIssues: [
    { id: 'light-issue-1', location: [13.0827, 80.2707], type: 'broken', priority: 'high' },
    { id: 'light-issue-2', location: [13.0398, 80.2342], type: 'dim', priority: 'medium' }
  ]
};

// Mock VIIRS satellite data for demonstration
export const MOCK_VIIRS_DATA = {
  brightness: 75,
  cloudCover: 5,
  acquisitionDate: new Date(),
  processingLevel: 'L3'
};

// Mock crowdsourced data for demonstration
export const MOCK_CROWDSOURCED_DATA = {
  reports: [
    { id: 'report-1', reporterId: 'user-1', location: [13.0827, 80.2707], type: 'poor_lighting', severity: 4, timestamp: new Date('2025-01-12'), verified: true },
    { id: 'report-2', reporterId: 'user-2', location: [13.0398, 80.2342], type: 'harassment', severity: 5, timestamp: new Date('2025-01-11'), verified: false }
  ],
  userTrustScores: {
    'user-1': 0.85,
    'user-2': 0.65
  }
};

// Export all types and interfaces
export type { SafetyFactors, SafetyScoreResult, SafetyScoreContext };
export { 
  DEFAULT_WEIGHTS,
  SAFETY_LEVELS,
  getSafetyLevel,
  MOCK_INFRASTRUCTURE_DATA,
  MOCK_HAZARD_DATA,
  MOCK_FOOTFALL_DATA,
  MOCK_WEATHER_DATA,
  MOCK_MUNICIPAL_DATA,
  MOCK_VIIRS_DATA,
  MOCK_CROWDSOURCED_DATA
};
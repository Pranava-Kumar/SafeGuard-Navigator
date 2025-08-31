/*
  Warnings:

  - You are about to drop the column `score` on the `SafetyScore` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `overallScore` to the `SafetyScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sources` to the `SafetyScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PrivacySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dataProcessingConsent" BOOLEAN NOT NULL DEFAULT false,
    "locationSharingLevel" TEXT NOT NULL DEFAULT 'coarse',
    "crowdsourcingParticipation" BOOLEAN NOT NULL DEFAULT true,
    "personalizedRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeviceInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "osName" TEXT,
    "osVersion" TEXT,
    "appVersion" TEXT,
    "hasAccelerometer" BOOLEAN NOT NULL DEFAULT false,
    "hasCamera" BOOLEAN NOT NULL DEFAULT false,
    "offlineCapable" BOOLEAN NOT NULL DEFAULT false,
    "networkQuality" TEXT NOT NULL DEFAULT 'medium',
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeviceInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "relationship" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmergencyContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReputationScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trustLevel" REAL NOT NULL DEFAULT 0.5,
    "reportsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "reportsVerified" INTEGER NOT NULL DEFAULT 0,
    "reportsRejected" INTEGER NOT NULL DEFAULT 0,
    "communityStanding" TEXT NOT NULL DEFAULT 'new',
    "lastCalculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReputationScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LightingData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "viirsBrightness" REAL,
    "municipalStatus" TEXT,
    "lastInspection" DATETIME,
    "lightType" TEXT,
    "wattage" INTEGER,
    "coverage" REAL,
    "crowdsourcedReports" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "POIData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "businessHours" TEXT,
    "safetyRating" REAL,
    "footfallDensity" INTEGER NOT NULL DEFAULT 0,
    "isEmergencyService" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "WeatherData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area" TEXT NOT NULL,
    "temperature" REAL,
    "humidity" REAL,
    "visibility" REAL,
    "weatherCondition" TEXT NOT NULL,
    "windSpeed" REAL,
    "pressure" REAL,
    "uvIndex" REAL,
    "alerts" TEXT,
    "source" TEXT NOT NULL DEFAULT 'imd',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DarkSpotData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "spotType" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "description" TEXT,
    "reportedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "resolutionDate" DATETIME,
    "municipalId" TEXT,
    "lastVerified" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IncidentReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address" TEXT,
    "incidentType" TEXT NOT NULL,
    "subcategory" TEXT,
    "description" TEXT,
    "severity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verifiedBy" TEXT,
    "verificationCount" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "trustScore" REAL,
    "timeOfIncident" DATETIME,
    "weatherCondition" TEXT,
    "crowdLevel" TEXT,
    "lightingCondition" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "comments" TEXT,
    "actionTaken" TEXT,
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IncidentReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_IncidentReport" ("createdAt", "description", "id", "incidentType", "latitude", "longitude", "severity", "status", "updatedAt", "userId") SELECT "createdAt", "description", "id", "incidentType", "latitude", "longitude", "severity", "status", "updatedAt", "userId" FROM "IncidentReport";
DROP TABLE "IncidentReport";
ALTER TABLE "new_IncidentReport" RENAME TO "IncidentReport";
CREATE INDEX "IncidentReport_userId_idx" ON "IncidentReport"("userId");
CREATE INDEX "IncidentReport_incidentType_idx" ON "IncidentReport"("incidentType");
CREATE INDEX "IncidentReport_status_idx" ON "IncidentReport"("status");
CREATE INDEX "IncidentReport_createdAt_idx" ON "IncidentReport"("createdAt");
CREATE INDEX "IncidentReport_latitude_longitude_idx" ON "IncidentReport"("latitude", "longitude");
CREATE INDEX "IncidentReport_severity_idx" ON "IncidentReport"("severity");
CREATE TABLE "new_Route" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startLat" REAL NOT NULL,
    "startLng" REAL NOT NULL,
    "endLat" REAL NOT NULL,
    "endLng" REAL NOT NULL,
    "startAddress" TEXT,
    "endAddress" TEXT,
    "routeData" TEXT NOT NULL,
    "distance" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "safetyScore" INTEGER NOT NULL,
    "routeType" TEXT NOT NULL,
    "userType" TEXT NOT NULL DEFAULT 'pedestrian',
    "weatherCondition" TEXT,
    "timeOfDay" TEXT,
    "feedback" TEXT,
    "rating" INTEGER,
    "actualTravelTime" INTEGER,
    "incidents" TEXT,
    "alternatives" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Route_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Route" ("createdAt", "distance", "duration", "endLat", "endLng", "id", "routeData", "routeType", "safetyScore", "startLat", "startLng", "userId") SELECT "createdAt", "distance", "duration", "endLat", "endLng", "id", "routeData", "routeType", "safetyScore", "startLat", "startLng", "userId" FROM "Route";
DROP TABLE "Route";
ALTER TABLE "new_Route" RENAME TO "Route";
CREATE INDEX "Route_userId_idx" ON "Route"("userId");
CREATE INDEX "Route_createdAt_idx" ON "Route"("createdAt");
CREATE INDEX "Route_routeType_idx" ON "Route"("routeType");
CREATE INDEX "Route_safetyScore_idx" ON "Route"("safetyScore");
CREATE TABLE "new_SafetyPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "riskTolerance" INTEGER NOT NULL DEFAULT 50,
    "timePreference" TEXT NOT NULL DEFAULT 'safety_first',
    "preferredFactors" TEXT NOT NULL,
    "accessibilityNeeds" TEXT,
    "locationSharingLevel" TEXT NOT NULL DEFAULT 'coarse',
    "personalizedRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "crowdsourcingParticipation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SafetyPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SafetyPreference" ("createdAt", "id", "preferredFactors", "riskTolerance", "updatedAt", "userId") SELECT "createdAt", "id", "preferredFactors", "riskTolerance", "updatedAt", "userId" FROM "SafetyPreference";
DROP TABLE "SafetyPreference";
ALTER TABLE "new_SafetyPreference" RENAME TO "SafetyPreference";
CREATE UNIQUE INDEX "SafetyPreference_userId_key" ON "SafetyPreference"("userId");
CREATE TABLE "new_SafetyScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "lightingScore" INTEGER NOT NULL DEFAULT 50,
    "footfallScore" INTEGER NOT NULL DEFAULT 50,
    "hazardScore" INTEGER NOT NULL DEFAULT 50,
    "proximityScore" INTEGER NOT NULL DEFAULT 50,
    "timeOfDay" TEXT NOT NULL DEFAULT 'day',
    "weatherCondition" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'pedestrian',
    "sources" TEXT NOT NULL,
    "factors" TEXT NOT NULL,
    "aiPredictions" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME
);
INSERT INTO "new_SafetyScore" ("factors", "id", "latitude", "longitude", "timestamp") SELECT "factors", "id", "latitude", "longitude", "timestamp" FROM "SafetyScore";
DROP TABLE "SafetyScore";
ALTER TABLE "new_SafetyScore" RENAME TO "SafetyScore";
CREATE INDEX "SafetyScore_latitude_longitude_idx" ON "SafetyScore"("latitude", "longitude");
CREATE INDEX "SafetyScore_timestamp_idx" ON "SafetyScore"("timestamp");
CREATE INDEX "SafetyScore_overallScore_idx" ON "SafetyScore"("overallScore");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "userType" TEXT NOT NULL DEFAULT 'pedestrian',
    "role" TEXT NOT NULL DEFAULT 'user',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "lastLoginAt" DATETIME,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "dataProcessingConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" TEXT NOT NULL DEFAULT '1.0',
    "consentDate" DATETIME,
    "dataRetentionExpiry" DATETIME,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "updatedAt") SELECT "createdAt", "email", "id", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PrivacySettings_userId_key" ON "PrivacySettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceInfo_deviceId_key" ON "DeviceInfo"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceInfo_userId_idx" ON "DeviceInfo"("userId");

-- CreateIndex
CREATE INDEX "EmergencyContact_userId_idx" ON "EmergencyContact"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReputationScore_userId_key" ON "ReputationScore"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "LightingData_latitude_longitude_idx" ON "LightingData"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "LightingData_timestamp_idx" ON "LightingData"("timestamp");

-- CreateIndex
CREATE INDEX "POIData_latitude_longitude_idx" ON "POIData"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "POIData_category_idx" ON "POIData"("category");

-- CreateIndex
CREATE INDEX "POIData_isEmergencyService_idx" ON "POIData"("isEmergencyService");

-- CreateIndex
CREATE INDEX "WeatherData_area_idx" ON "WeatherData"("area");

-- CreateIndex
CREATE INDEX "WeatherData_timestamp_idx" ON "WeatherData"("timestamp");

-- CreateIndex
CREATE INDEX "DarkSpotData_latitude_longitude_idx" ON "DarkSpotData"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "DarkSpotData_city_state_idx" ON "DarkSpotData"("city", "state");

-- CreateIndex
CREATE INDEX "DarkSpotData_status_idx" ON "DarkSpotData"("status");

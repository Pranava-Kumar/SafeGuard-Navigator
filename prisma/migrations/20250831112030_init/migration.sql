/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncidentReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrivacySettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReputationScore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Route` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SafetyPreference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SafetyScore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "AuditLog_timestamp_idx";

-- DropIndex
DROP INDEX "AuditLog_action_idx";

-- DropIndex
DROP INDEX "AuditLog_userId_idx";

-- DropIndex
DROP INDEX "IncidentReport_severity_idx";

-- DropIndex
DROP INDEX "IncidentReport_latitude_longitude_idx";

-- DropIndex
DROP INDEX "IncidentReport_createdAt_idx";

-- DropIndex
DROP INDEX "IncidentReport_status_idx";

-- DropIndex
DROP INDEX "IncidentReport_incidentType_idx";

-- DropIndex
DROP INDEX "IncidentReport_userId_idx";

-- DropIndex
DROP INDEX "Post_authorId_idx";

-- DropIndex
DROP INDEX "PrivacySettings_userId_key";

-- DropIndex
DROP INDEX "ReputationScore_userId_key";

-- DropIndex
DROP INDEX "Route_safetyScore_idx";

-- DropIndex
DROP INDEX "Route_routeType_idx";

-- DropIndex
DROP INDEX "Route_createdAt_idx";

-- DropIndex
DROP INDEX "Route_userId_idx";

-- DropIndex
DROP INDEX "SafetyPreference_userId_key";

-- DropIndex
DROP INDEX "SafetyScore_overallScore_idx";

-- DropIndex
DROP INDEX "SafetyScore_timestamp_idx";

-- DropIndex
DROP INDEX "SafetyScore_latitude_longitude_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AuditLog";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "IncidentReport";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Post";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PrivacySettings";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ReputationScore";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Route";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SafetyPreference";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SafetyScore";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "avatar" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "userType" TEXT NOT NULL DEFAULT 'pedestrian',
    "role" TEXT NOT NULL DEFAULT 'user',
    "password" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" DATETIME,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "dataProcessingConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" DATETIME,
    "dataRetentionExpiry" DATETIME,
    "locationSharingLevel" TEXT NOT NULL DEFAULT 'coarse',
    "crowdsourcingParticipation" BOOLEAN NOT NULL DEFAULT true,
    "personalizedRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "safety_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "riskTolerance" INTEGER NOT NULL DEFAULT 50,
    "timePreference" TEXT NOT NULL DEFAULT 'safety_first',
    "preferredFactors" TEXT,
    "locationSharingLevel" TEXT NOT NULL DEFAULT 'coarse',
    "personalizedRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "crowdsourcingParticipation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "safety_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "privacy_settings" (
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
    CONSTRAINT "privacy_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reputation_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trustLevel" REAL NOT NULL DEFAULT 0.5,
    "communityStanding" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reputation_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "deviceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "consent_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "grantedAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "consent_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "data_exports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dataTypes" TEXT NOT NULL,
    "fileUrl" TEXT,
    "expiresAt" DATETIME,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "data_exports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "safety_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "safety_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "safety_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "geohash" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "lightingScore" INTEGER NOT NULL DEFAULT 50,
    "lightingWeight" REAL NOT NULL DEFAULT 0.30,
    "lightingData" TEXT,
    "footfallScore" INTEGER NOT NULL DEFAULT 50,
    "footfallWeight" REAL NOT NULL DEFAULT 0.25,
    "footfallData" TEXT,
    "hazardScore" INTEGER NOT NULL DEFAULT 50,
    "hazardWeight" REAL NOT NULL DEFAULT 0.20,
    "hazardData" TEXT,
    "proximityScore" INTEGER NOT NULL DEFAULT 50,
    "proximityWeight" REAL NOT NULL DEFAULT 0.25,
    "proximityData" TEXT,
    "timeOfDay" TEXT NOT NULL DEFAULT 'day',
    "weatherCondition" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'pedestrian',
    "seasonalFactor" REAL NOT NULL DEFAULT 1.0,
    "viirsBrightness" REAL,
    "municipalData" TEXT,
    "osmData" TEXT,
    "mapplsData" TEXT,
    "crowdsourcedData" TEXT,
    "weatherData" TEXT,
    "sources" TEXT NOT NULL,
    "aiPredictions" TEXT,
    "riskForecast" REAL,
    "anomalyScore" REAL,
    "incidentProbability" REAL,
    "dataQuality" TEXT NOT NULL DEFAULT 'medium',
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "updateFrequency" TEXT NOT NULL DEFAULT 'daily',
    "calculationTime" INTEGER,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT '1.0'
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startLat" REAL NOT NULL,
    "startLng" REAL NOT NULL,
    "endLat" REAL NOT NULL,
    "endLng" REAL NOT NULL,
    "startAddress" TEXT,
    "endAddress" TEXT,
    "startGeohash" TEXT,
    "endGeohash" TEXT,
    "routeData" TEXT NOT NULL,
    "distance" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "elevationGain" REAL,
    "safetyScore" INTEGER NOT NULL,
    "lightingScore" INTEGER,
    "hazardCount" INTEGER NOT NULL DEFAULT 0,
    "riskSegments" TEXT,
    "safetyFactors" TEXT,
    "routeType" TEXT NOT NULL,
    "routeCategory" TEXT NOT NULL DEFAULT 'primary',
    "userType" TEXT NOT NULL DEFAULT 'pedestrian',
    "transportMode" TEXT,
    "weatherCondition" TEXT,
    "timeOfDay" TEXT,
    "trafficLevel" TEXT,
    "crowdLevel" TEXT,
    "localEvents" TEXT,
    "preferences" TEXT,
    "feedback" TEXT,
    "rating" INTEGER,
    "actualTravelTime" INTEGER,
    "incidents" TEXT,
    "alternatives" TEXT,
    "parentRouteId" TEXT,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "dynamicUpdates" TEXT,
    "alertsActive" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculationTime" INTEGER,
    "algorithmVersion" TEXT NOT NULL DEFAULT '1.0',
    "dataSourcesUsed" TEXT,
    "emergencyExits" TEXT,
    "nearbyHelp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "routes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "incident_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "geohash" TEXT NOT NULL,
    "address" TEXT,
    "landmark" TEXT,
    "incidentType" TEXT NOT NULL,
    "subcategory" TEXT,
    "severity" INTEGER NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'medium',
    "title" TEXT,
    "description" TEXT,
    "tags" TEXT,
    "images" TEXT,
    "audio" TEXT,
    "video" TEXT,
    "mediaProcessed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verifiedBy" TEXT,
    "verificationCount" INTEGER NOT NULL DEFAULT 0,
    "crossReports" INTEGER NOT NULL DEFAULT 0,
    "officialConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "trustScore" REAL,
    "reliabilityScore" REAL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "reporterTrust" REAL,
    "reporterHistory" TEXT,
    "timeOfIncident" DATETIME,
    "reportDelay" INTEGER,
    "weatherCondition" TEXT,
    "crowdLevel" TEXT,
    "lightingCondition" TEXT,
    "trafficLevel" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "flaggedCount" INTEGER NOT NULL DEFAULT 0,
    "comments" TEXT,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "affectedUsers" INTEGER NOT NULL DEFAULT 0,
    "routesImpacted" TEXT,
    "safetyImpact" TEXT NOT NULL DEFAULT 'local',
    "actionTaken" TEXT,
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,
    "resolutionDate" DATETIME,
    "resolutionTime" INTEGER,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "aiAnalysis" TEXT,
    "sentimentScore" REAL,
    "topicsExtracted" TEXT,
    "similarReports" TEXT,
    "deviceInfo" TEXT,
    "appVersion" TEXT,
    "reportMethod" TEXT NOT NULL DEFAULT 'app',
    "dataQuality" TEXT NOT NULL DEFAULT 'medium',
    "dataRetention" DATETIME,
    "consentGiven" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "incident_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "viirs_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "geohash" TEXT NOT NULL,
    "brightness" REAL NOT NULL,
    "quality" TEXT NOT NULL,
    "cloudCover" REAL,
    "acquisitionDate" DATETIME NOT NULL,
    "processingLevel" TEXT NOT NULL DEFAULT 'L3',
    "lightingCategory" TEXT NOT NULL,
    "darknessScore" INTEGER NOT NULL,
    "reliability" REAL NOT NULL DEFAULT 0.8,
    "satellitePass" TEXT,
    "resolution" REAL NOT NULL DEFAULT 500,
    "dataSource" TEXT NOT NULL DEFAULT 'NASA_VIIRS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "municipal_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "streetLights" TEXT,
    "cctvCameras" TEXT,
    "policeStations" TEXT,
    "hospitals" TEXT,
    "busStops" TEXT,
    "officialDarkSpots" TEXT,
    "maintenanceSchedule" TEXT,
    "budgetAllocations" TEXT,
    "emergencyNumbers" TEXT,
    "contactPersons" TEXT,
    "dataSource" TEXT NOT NULL,
    "lastSyncAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextSyncAt" DATETIME,
    "apiEndpoint" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "safety_predictions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "geohash" TEXT NOT NULL,
    "predictionType" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "incidentProbability" REAL,
    "riskLevel" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "hourlyRisk" TEXT,
    "weeklyPattern" TEXT,
    "seasonalFactors" TEXT,
    "anomalyScore" REAL,
    "anomalyType" TEXT,
    "topFactors" TEXT,
    "modelFeatures" TEXT,
    "validatedBy" TEXT,
    "accuracy" REAL,
    "predictionFor" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "realtime_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "geohash" TEXT,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "radiusMeters" INTEGER,
    "affectedRoutes" TEXT,
    "affectedUsers" TEXT,
    "autoResponse" TEXT,
    "notificationsSent" INTEGER NOT NULL DEFAULT 0,
    "responseTime" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "acknowledgedBy" TEXT,
    "acknowledgedAt" DATETIME,
    "resolvedAt" DATETIME,
    "source" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "configKey" TEXT NOT NULL,
    "configValue" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "requiresRestart" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "previousValue" TEXT,
    "changedBy" TEXT,
    "changedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeviceInfo" (
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
    CONSTRAINT "DeviceInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DeviceInfo" ("appVersion", "createdAt", "deviceId", "deviceType", "hasAccelerometer", "hasCamera", "id", "lastSeenAt", "networkQuality", "offlineCapable", "osName", "osVersion", "userId") SELECT "appVersion", "createdAt", "deviceId", "deviceType", "hasAccelerometer", "hasCamera", "id", "lastSeenAt", "networkQuality", "offlineCapable", "osName", "osVersion", "userId" FROM "DeviceInfo";
DROP TABLE "DeviceInfo";
ALTER TABLE "new_DeviceInfo" RENAME TO "DeviceInfo";
CREATE UNIQUE INDEX "DeviceInfo_deviceId_key" ON "DeviceInfo"("deviceId");
CREATE INDEX "DeviceInfo_userId_idx" ON "DeviceInfo"("userId");
CREATE TABLE "new_EmergencyAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "contacts" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "EmergencyAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmergencyAlert" ("alertType", "contacts", "createdAt", "id", "latitude", "longitude", "message", "resolvedAt", "status", "userId") SELECT "alertType", "contacts", "createdAt", "id", "latitude", "longitude", "message", "resolvedAt", "status", "userId" FROM "EmergencyAlert";
DROP TABLE "EmergencyAlert";
ALTER TABLE "new_EmergencyAlert" RENAME TO "EmergencyAlert";
CREATE INDEX "EmergencyAlert_userId_idx" ON "EmergencyAlert"("userId");
CREATE INDEX "EmergencyAlert_status_idx" ON "EmergencyAlert"("status");
CREATE INDEX "EmergencyAlert_createdAt_idx" ON "EmergencyAlert"("createdAt");
CREATE TABLE "new_EmergencyContact" (
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
    CONSTRAINT "EmergencyContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmergencyContact" ("createdAt", "email", "id", "isActive", "name", "phone", "priority", "relationship", "updatedAt", "userId") SELECT "createdAt", "email", "id", "isActive", "name", "phone", "priority", "relationship", "updatedAt", "userId" FROM "EmergencyContact";
DROP TABLE "EmergencyContact";
ALTER TABLE "new_EmergencyContact" RENAME TO "EmergencyContact";
CREATE INDEX "EmergencyContact_userId_idx" ON "EmergencyContact"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "safety_preferences_userId_key" ON "safety_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "privacy_settings_userId_key" ON "privacy_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "reputation_scores_userId_key" ON "reputation_scores"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON "user_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refreshToken_key" ON "user_sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_sessionToken_idx" ON "user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "user_sessions_refreshToken_idx" ON "user_sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "consent_history_userId_idx" ON "consent_history"("userId");

-- CreateIndex
CREATE INDEX "consent_history_consentType_idx" ON "consent_history"("consentType");

-- CreateIndex
CREATE INDEX "consent_history_grantedAt_idx" ON "consent_history"("grantedAt");

-- CreateIndex
CREATE INDEX "data_exports_userId_idx" ON "data_exports"("userId");

-- CreateIndex
CREATE INDEX "data_exports_status_idx" ON "data_exports"("status");

-- CreateIndex
CREATE INDEX "data_exports_requestedAt_idx" ON "data_exports"("requestedAt");

-- CreateIndex
CREATE INDEX "achievements_userId_idx" ON "achievements"("userId");

-- CreateIndex
CREATE INDEX "achievements_type_idx" ON "achievements"("type");

-- CreateIndex
CREATE INDEX "safety_badges_userId_idx" ON "safety_badges"("userId");

-- CreateIndex
CREATE INDEX "safety_badges_badgeType_idx" ON "safety_badges"("badgeType");

-- CreateIndex
CREATE INDEX "safety_scores_latitude_longitude_idx" ON "safety_scores"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "safety_scores_geohash_idx" ON "safety_scores"("geohash");

-- CreateIndex
CREATE INDEX "safety_scores_overallScore_idx" ON "safety_scores"("overallScore");

-- CreateIndex
CREATE INDEX "safety_scores_timeOfDay_idx" ON "safety_scores"("timeOfDay");

-- CreateIndex
CREATE INDEX "safety_scores_lastUpdated_idx" ON "safety_scores"("lastUpdated");

-- CreateIndex
CREATE INDEX "safety_scores_expiresAt_idx" ON "safety_scores"("expiresAt");

-- CreateIndex
CREATE INDEX "safety_scores_confidence_idx" ON "safety_scores"("confidence");

-- CreateIndex
CREATE INDEX "routes_userId_idx" ON "routes"("userId");

-- CreateIndex
CREATE INDEX "routes_createdAt_idx" ON "routes"("createdAt");

-- CreateIndex
CREATE INDEX "routes_routeType_idx" ON "routes"("routeType");

-- CreateIndex
CREATE INDEX "routes_safetyScore_idx" ON "routes"("safetyScore");

-- CreateIndex
CREATE INDEX "routes_startGeohash_idx" ON "routes"("startGeohash");

-- CreateIndex
CREATE INDEX "routes_endGeohash_idx" ON "routes"("endGeohash");

-- CreateIndex
CREATE INDEX "routes_userType_idx" ON "routes"("userType");

-- CreateIndex
CREATE INDEX "routes_isRecommended_idx" ON "routes"("isRecommended");

-- CreateIndex
CREATE INDEX "incident_reports_userId_idx" ON "incident_reports"("userId");

-- CreateIndex
CREATE INDEX "incident_reports_incidentType_idx" ON "incident_reports"("incidentType");

-- CreateIndex
CREATE INDEX "incident_reports_status_idx" ON "incident_reports"("status");

-- CreateIndex
CREATE INDEX "incident_reports_severity_idx" ON "incident_reports"("severity");

-- CreateIndex
CREATE INDEX "incident_reports_createdAt_idx" ON "incident_reports"("createdAt");

-- CreateIndex
CREATE INDEX "incident_reports_latitude_longitude_idx" ON "incident_reports"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "incident_reports_geohash_idx" ON "incident_reports"("geohash");

-- CreateIndex
CREATE INDEX "incident_reports_trustScore_idx" ON "incident_reports"("trustScore");

-- CreateIndex
CREATE INDEX "incident_reports_timeOfIncident_idx" ON "incident_reports"("timeOfIncident");

-- CreateIndex
CREATE INDEX "incident_reports_verificationCount_idx" ON "incident_reports"("verificationCount");

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");

-- CreateIndex
CREATE INDEX "viirs_data_latitude_longitude_idx" ON "viirs_data"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "viirs_data_geohash_idx" ON "viirs_data"("geohash");

-- CreateIndex
CREATE INDEX "viirs_data_acquisitionDate_idx" ON "viirs_data"("acquisitionDate");

-- CreateIndex
CREATE INDEX "viirs_data_lightingCategory_idx" ON "viirs_data"("lightingCategory");

-- CreateIndex
CREATE INDEX "municipal_data_city_state_idx" ON "municipal_data"("city", "state");

-- CreateIndex
CREATE INDEX "municipal_data_lastSyncAt_idx" ON "municipal_data"("lastSyncAt");

-- CreateIndex
CREATE INDEX "safety_predictions_latitude_longitude_idx" ON "safety_predictions"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "safety_predictions_geohash_idx" ON "safety_predictions"("geohash");

-- CreateIndex
CREATE INDEX "safety_predictions_predictionType_idx" ON "safety_predictions"("predictionType");

-- CreateIndex
CREATE INDEX "safety_predictions_riskLevel_idx" ON "safety_predictions"("riskLevel");

-- CreateIndex
CREATE INDEX "safety_predictions_predictionFor_idx" ON "safety_predictions"("predictionFor");

-- CreateIndex
CREATE INDEX "safety_predictions_validUntil_idx" ON "safety_predictions"("validUntil");

-- CreateIndex
CREATE INDEX "realtime_events_eventType_idx" ON "realtime_events"("eventType");

-- CreateIndex
CREATE INDEX "realtime_events_severity_idx" ON "realtime_events"("severity");

-- CreateIndex
CREATE INDEX "realtime_events_status_idx" ON "realtime_events"("status");

-- CreateIndex
CREATE INDEX "realtime_events_latitude_longitude_idx" ON "realtime_events"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "realtime_events_geohash_idx" ON "realtime_events"("geohash");

-- CreateIndex
CREATE INDEX "realtime_events_createdAt_idx" ON "realtime_events"("createdAt");

-- CreateIndex
CREATE INDEX "realtime_events_expiresAt_idx" ON "realtime_events"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_configKey_key" ON "system_config"("configKey");

-- CreateIndex
CREATE INDEX "system_config_configKey_idx" ON "system_config"("configKey");

-- CreateIndex
CREATE INDEX "system_config_category_idx" ON "system_config"("category");

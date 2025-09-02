-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'pedestrian',
    "role" TEXT NOT NULL DEFAULT 'user',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'free',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'active',
    "dataProcessingConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "consentVersion" TEXT NOT NULL DEFAULT '1.0',
    "locationSharingLevel" TEXT NOT NULL DEFAULT 'coarse',
    "crowdsourcingParticipation" BOOLEAN NOT NULL DEFAULT true,
    "personalizedRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "riskTolerance" INTEGER NOT NULL DEFAULT 50,
    "timePreference" TEXT NOT NULL DEFAULT 'safety_first',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "dataRetentionExpiry" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SafetyReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "landmark" TEXT,
    "city" TEXT,
    "state" TEXT,
    "reportType" TEXT NOT NULL,
    "reportCategory" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT,
    "images" TEXT,
    "video" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verifiedBy" TEXT,
    "verificationCount" INTEGER NOT NULL DEFAULT 0,
    "officialConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "timeOfDay" TEXT,
    "weatherCondition" TEXT,
    "crowdLevel" TEXT,
    "lightingLevel" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "flaggedCount" INTEGER NOT NULL DEFAULT 0,
    "actionTaken" TEXT,
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,
    "resolutionDate" TIMESTAMP(3),
    "deviceInfo" TEXT,
    "appVersion" TEXT,
    "reportMethod" TEXT NOT NULL DEFAULT 'app',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Route" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startLat" DOUBLE PRECISION NOT NULL,
    "startLng" DOUBLE PRECISION NOT NULL,
    "endLat" DOUBLE PRECISION NOT NULL,
    "endLng" DOUBLE PRECISION NOT NULL,
    "startAddress" TEXT,
    "endAddress" TEXT,
    "routeData" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "elevationGain" DOUBLE PRECISION,
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
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculationTime" INTEGER,
    "algorithmVersion" TEXT NOT NULL DEFAULT '1.0',
    "dataSourcesUsed" TEXT,
    "emergencyExits" TEXT,
    "nearbyHelp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmergencyAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "contacts" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "EmergencyAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IncidentReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
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
    "trustScore" DOUBLE PRECISION,
    "reliabilityScore" DOUBLE PRECISION,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "reporterTrust" DOUBLE PRECISION,
    "reporterHistory" TEXT,
    "timeOfIncident" TIMESTAMP(3),
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
    "resolutionDate" TIMESTAMP(3),
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "aiAnalysis" TEXT,
    "sentimentScore" DOUBLE PRECISION,
    "topicsExtracted" TEXT,
    "similarReports" TEXT,
    "deviceInfo" TEXT,
    "appVersion" TEXT,
    "reportMethod" TEXT NOT NULL DEFAULT 'app',
    "dataQuality" TEXT NOT NULL DEFAULT 'medium',
    "consentGiven" BOOLEAN NOT NULL DEFAULT true,
    "dataRetention" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmergencyContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "relationship" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verificationCode" TEXT,
    "verificationCodeExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."POIData" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "hours" TEXT,
    "isEmergencyService" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSource" TEXT NOT NULL,
    "municipalityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "POIData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SafetyDataSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reliability" INTEGER NOT NULL,
    "updateFrequency" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiEndpoint" TEXT,
    "apiKey" TEXT,
    "dataFormat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyDataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SafetyEvent" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius" INTEGER,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SafetySubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "radius" INTEGER,
    "eventTypes" TEXT[],
    "minSeverity" TEXT,
    "notificationChannels" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SafetyNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceType" TEXT,
    "pushToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SafetyScore" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geohash" TEXT,
    "overallScore" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION,
    "lightingScore" INTEGER,
    "footfallScore" INTEGER,
    "hazardScore" INTEGER,
    "proximityScore" INTEGER,
    "timeOfDay" TEXT,
    "userType" TEXT,
    "sources" TEXT,
    "factors" TEXT,
    "lightingData" TEXT,
    "footfallData" TEXT,
    "hazardData" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SafetyPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskTolerance" INTEGER NOT NULL DEFAULT 50,
    "timePreference" TEXT NOT NULL DEFAULT 'safety_first',
    "preferredFactors" TEXT,
    "locationSharingLevel" TEXT NOT NULL DEFAULT 'coarse',
    "personalizedRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "crowdsourcingParticipation" BOOLEAN NOT NULL DEFAULT true,
    "autoReportIncidents" BOOLEAN NOT NULL DEFAULT false,
    "shareLocationWithEmergencyContacts" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrivacySettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dataProcessingConsent" BOOLEAN NOT NULL DEFAULT false,
    "locationSharingLevel" TEXT NOT NULL DEFAULT 'coarse',
    "crowdsourcingParticipation" BOOLEAN NOT NULL DEFAULT true,
    "personalizedRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReputationScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trustLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "communityStanding" TEXT NOT NULL DEFAULT 'new',
    "reputationPoints" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReputationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConsentHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "deviceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataExport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dataTypes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "downloadUrl" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "EmergencyContact_userId_idx" ON "public"."EmergencyContact"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "POIData_category_idx" ON "public"."POIData"("category");

-- CreateIndex
CREATE INDEX "POIData_latitude_longitude_idx" ON "public"."POIData"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "SafetyDataSource_type_idx" ON "public"."SafetyDataSource"("type");

-- CreateIndex
CREATE INDEX "SafetyDataSource_isActive_idx" ON "public"."SafetyDataSource"("isActive");

-- CreateIndex
CREATE INDEX "SafetyEvent_eventType_idx" ON "public"."SafetyEvent"("eventType");

-- CreateIndex
CREATE INDEX "SafetyEvent_severity_idx" ON "public"."SafetyEvent"("severity");

-- CreateIndex
CREATE INDEX "SafetyEvent_latitude_longitude_idx" ON "public"."SafetyEvent"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "SafetyEvent_startTime_idx" ON "public"."SafetyEvent"("startTime");

-- CreateIndex
CREATE INDEX "SafetySubscription_userId_idx" ON "public"."SafetySubscription"("userId");

-- CreateIndex
CREATE INDEX "SafetySubscription_deviceId_idx" ON "public"."SafetySubscription"("deviceId");

-- CreateIndex
CREATE INDEX "SafetySubscription_isActive_idx" ON "public"."SafetySubscription"("isActive");

-- CreateIndex
CREATE INDEX "SafetyNotification_userId_idx" ON "public"."SafetyNotification"("userId");

-- CreateIndex
CREATE INDEX "SafetyNotification_deviceId_idx" ON "public"."SafetyNotification"("deviceId");

-- CreateIndex
CREATE INDEX "SafetyNotification_isRead_idx" ON "public"."SafetyNotification"("isRead");

-- CreateIndex
CREATE INDEX "SafetyNotification_timestamp_idx" ON "public"."SafetyNotification"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_deviceId_key" ON "public"."UserDevice"("deviceId");

-- CreateIndex
CREATE INDEX "UserDevice_userId_idx" ON "public"."UserDevice"("userId");

-- CreateIndex
CREATE INDEX "UserDevice_deviceId_idx" ON "public"."UserDevice"("deviceId");

-- CreateIndex
CREATE INDEX "UserDevice_isActive_idx" ON "public"."UserDevice"("isActive");

-- CreateIndex
CREATE INDEX "UserConsent_userId_idx" ON "public"."UserConsent"("userId");

-- CreateIndex
CREATE INDEX "UserConsent_consentType_idx" ON "public"."UserConsent"("consentType");

-- CreateIndex
CREATE INDEX "UserConsent_status_idx" ON "public"."UserConsent"("status");

-- CreateIndex
CREATE INDEX "UserConsent_timestamp_idx" ON "public"."UserConsent"("timestamp");

-- CreateIndex
CREATE INDEX "SafetyScore_latitude_longitude_idx" ON "public"."SafetyScore"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "SafetyScore_timestamp_idx" ON "public"."SafetyScore"("timestamp");

-- CreateIndex
CREATE INDEX "SafetyScore_userType_timeOfDay_idx" ON "public"."SafetyScore"("userType", "timeOfDay");

-- CreateIndex
CREATE INDEX "SafetyPreference_userId_idx" ON "public"."SafetyPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacySettings_userId_key" ON "public"."PrivacySettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReputationScore_userId_key" ON "public"."ReputationScore"("userId");

-- CreateIndex
CREATE INDEX "ReputationScore_userId_idx" ON "public"."ReputationScore"("userId");

-- CreateIndex
CREATE INDEX "ReputationScore_trustLevel_idx" ON "public"."ReputationScore"("trustLevel");

-- CreateIndex
CREATE INDEX "ConsentHistory_userId_idx" ON "public"."ConsentHistory"("userId");

-- CreateIndex
CREATE INDEX "ConsentHistory_consentType_idx" ON "public"."ConsentHistory"("consentType");

-- CreateIndex
CREATE INDEX "ConsentHistory_grantedAt_idx" ON "public"."ConsentHistory"("grantedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_sessionToken_key" ON "public"."UserSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_refreshToken_key" ON "public"."UserSession"("refreshToken");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "public"."UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_sessionToken_idx" ON "public"."UserSession"("sessionToken");

-- CreateIndex
CREATE INDEX "UserSession_refreshToken_idx" ON "public"."UserSession"("refreshToken");

-- CreateIndex
CREATE INDEX "UserSession_isActive_idx" ON "public"."UserSession"("isActive");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "public"."UserSession"("expiresAt");

-- CreateIndex
CREATE INDEX "DataExport_userId_idx" ON "public"."DataExport"("userId");

-- CreateIndex
CREATE INDEX "DataExport_status_idx" ON "public"."DataExport"("status");

-- CreateIndex
CREATE INDEX "DataExport_requestedAt_idx" ON "public"."DataExport"("requestedAt");

-- AddForeignKey
ALTER TABLE "public"."SafetyReport" ADD CONSTRAINT "SafetyReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Route" ADD CONSTRAINT "Route_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmergencyAlert" ADD CONSTRAINT "EmergencyAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IncidentReport" ADD CONSTRAINT "IncidentReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmergencyContact" ADD CONSTRAINT "EmergencyContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SafetySubscription" ADD CONSTRAINT "SafetySubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SafetyNotification" ADD CONSTRAINT "SafetyNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserConsent" ADD CONSTRAINT "UserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SafetyPreference" ADD CONSTRAINT "SafetyPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivacySettings" ADD CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReputationScore" ADD CONSTRAINT "ReputationScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsentHistory" ADD CONSTRAINT "ConsentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataExport" ADD CONSTRAINT "DataExport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

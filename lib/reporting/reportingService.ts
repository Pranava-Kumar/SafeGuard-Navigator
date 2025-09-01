/**
 * SafeRoute Crowdsourced Reporting Service
 * Implements a reputation-based reporting system for safety incidents
 * Compliant with DPDP Act 2023
 */

import { PrismaClient } from '@prisma/client';
import { LocationData } from '../safety/safetyScoreService';

const prisma = new PrismaClient();

// Types for reporting system
export interface ReportData extends LocationData {
  reportType: ReportType;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mediaUrls?: string[];
  isAnonymous: boolean;
  userId?: string;
  deviceId: string;
  ipAddress?: string;
  userAgent?: string;
  consentToShare: boolean;
}

export type ReportType = 
  | 'crime'
  | 'harassment'
  | 'unsafe_infrastructure'
  | 'poor_lighting'
  | 'suspicious_activity'
  | 'road_hazard'
  | 'public_disturbance'
  | 'other';

export interface ReportVerification {
  reportId: string;
  userId: string;
  deviceId: string;
  action: 'upvote' | 'downvote' | 'confirm' | 'dispute';
  comment?: string;
  timestamp: Date;
}

export interface ReportFilter {
  reportTypes?: ReportType[];
  minSeverity?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: Date;
  endDate?: Date;
  radius?: number; // in kilometers
  minReliabilityScore?: number;
  verifiedOnly?: boolean;
  location?: LocationData;
}

export interface ReportingStats {
  totalReports: number;
  verifiedReports: number;
  disputedReports: number;
  reportsByType: Record<ReportType, number>;
  reportsBySeverity: Record<string, number>;
  userReputationScore?: number;
  userReportCount?: number;
  userVerifiedReportCount?: number;
}

// Reporting Service
class ReportingService {
  /**
   * Submit a new safety incident report
   * DPDP Act 2023 compliant with consent management
   */
  async submitReport(reportData: ReportData): Promise<{ reportId: string; reliabilityScore: number }> {
    try {
      // Validate report data
      this.validateReportData(reportData);
      
      // Check if user has consent to share location data
      if (reportData.userId) {
        const hasConsent = await this.verifyUserConsent(reportData.userId);
        if (!hasConsent && !reportData.consentToShare) {
          throw new Error('User has not provided consent to share location data');
        }
      } else if (!reportData.consentToShare) {
        throw new Error('Anonymous reports require explicit consent to share location data');
      }
      
      // Calculate initial reliability score based on user reputation
      const userReputationScore = reportData.userId 
        ? await this.getUserReputationScore(reportData.userId)
        : 50; // Default score for anonymous reports
      
      // Apply reliability modifiers
      const reliabilityScore = this.calculateReliabilityScore(reportData, userReputationScore);
      
      // Store report in database
      const report = await prisma.safetyReport.create({
        data: {
          reportType: reportData.reportType,
          description: reportData.description,
          severity: reportData.severity,
          latitude: reportData.latitude,
          longitude: reportData.longitude,
          timestamp: reportData.time || new Date(),
          mediaUrls: reportData.mediaUrls || [],
          isAnonymous: reportData.isAnonymous,
          userId: reportData.isAnonymous ? null : reportData.userId,
          deviceId: reportData.deviceId,
          ipAddress: reportData.ipAddress,
          userAgent: reportData.userAgent,
          reliabilityScore,
          status: 'pending',
          consentToShare: reportData.consentToShare
        }
      });
      
      // Log audit trail for DPDP Act 2023 compliance
      await this.logReportingActivity({
        userId: reportData.userId,
        deviceId: reportData.deviceId,
        ipAddress: reportData.ipAddress,
        userAgent: reportData.userAgent,
        action: 'submit_report',
        resourceId: report.id,
        details: {
          reportType: reportData.reportType,
          isAnonymous: reportData.isAnonymous,
          consentToShare: reportData.consentToShare
        }
      });
      
      // Return the report ID and reliability score
      return {
        reportId: report.id,
        reliabilityScore
      };
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  }

  /**
   * Verify or dispute an existing report
   */
  async verifyReport(verification: ReportVerification): Promise<{ success: boolean; newReliabilityScore: number }> {
    try {
      // Get the report
      const report = await prisma.safetyReport.findUnique({
        where: { id: verification.reportId }
      });
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Check if user has already verified this report
      const existingVerification = await prisma.reportVerification.findFirst({
        where: {
          reportId: verification.reportId,
          userId: verification.userId,
          deviceId: verification.deviceId
        }
      });
      
      if (existingVerification) {
        // Update existing verification
        await prisma.reportVerification.update({
          where: { id: existingVerification.id },
          data: {
            action: verification.action,
            comment: verification.comment,
            timestamp: verification.timestamp
          }
        });
      } else {
        // Create new verification
        await prisma.reportVerification.create({
          data: {
            reportId: verification.reportId,
            userId: verification.userId,
            deviceId: verification.deviceId,
            action: verification.action,
            comment: verification.comment,
            timestamp: verification.timestamp
          }
        });
      }
      
      // Recalculate report reliability score
      const newReliabilityScore = await this.recalculateReportReliability(verification.reportId);
      
      // Update report status based on verifications
      await this.updateReportStatus(verification.reportId);
      
      // Update user reputation scores
      if (report.userId) {
        await this.updateUserReputation(report.userId, verification.action);
      }
      await this.updateUserReputation(verification.userId, 'verification_activity');
      
      // Log audit trail for DPDP Act 2023 compliance
      await this.logReportingActivity({
        userId: verification.userId,
        deviceId: verification.deviceId,
        action: `report_${verification.action}`,
        resourceId: verification.reportId,
        details: { comment: verification.comment }
      });
      
      return {
        success: true,
        newReliabilityScore
      };
    } catch (error) {
      console.error('Error verifying report:', error);
      throw error;
    }
  }

  /**
   * Get reports based on location and filters
   */
  async getReports(location: LocationData, filter: ReportFilter = {}): Promise<any[]> {
    try {
      // Calculate bounding box for location query
      const boundingBox = this.calculateBoundingBox(
        location.latitude,
        location.longitude,
        filter.radius || 1 // Default 1km radius
      );
      
      // Build query filters
      const whereClause: any = {
        latitude: { gte: boundingBox.minLat, lte: boundingBox.maxLat },
        longitude: { gte: boundingBox.minLng, lte: boundingBox.maxLng },
      };
      
      // Add optional filters
      if (filter.reportTypes && filter.reportTypes.length > 0) {
        whereClause.reportType = { in: filter.reportTypes };
      }
      
      if (filter.minSeverity) {
        const severityLevels = ['low', 'medium', 'high', 'critical'];
        const minIndex = severityLevels.indexOf(filter.minSeverity);
        if (minIndex !== -1) {
          whereClause.severity = { in: severityLevels.slice(minIndex) };
        }
      }
      
      if (filter.startDate) {
        whereClause.timestamp = { ...(whereClause.timestamp || {}), gte: filter.startDate };
      }
      
      if (filter.endDate) {
        whereClause.timestamp = { ...(whereClause.timestamp || {}), lte: filter.endDate };
      }
      
      if (filter.minReliabilityScore) {
        whereClause.reliabilityScore = { gte: filter.minReliabilityScore };
      }
      
      if (filter.verifiedOnly) {
        whereClause.status = 'verified';
      }
      
      // Query reports
      const reports = await prisma.safetyReport.findMany({
        where: whereClause,
        include: {
          verifications: {
            select: {
              action: true,
              timestamp: true
            }
          }
        },
        orderBy: [
          { reliabilityScore: 'desc' },
          { timestamp: 'desc' }
        ]
      });
      
      // Filter out personal data for DPDP Act 2023 compliance
      return reports.map(report => ({
        id: report.id,
        reportType: report.reportType,
        description: report.description,
        severity: report.severity,
        latitude: report.latitude,
        longitude: report.longitude,
        timestamp: report.timestamp,
        mediaUrls: report.mediaUrls,
        isAnonymous: report.isAnonymous,
        reliabilityScore: report.reliabilityScore,
        status: report.status,
        verificationCount: report.verifications.length,
        // Only include non-PII data
        userId: report.isAnonymous ? null : report.userId
      }));
    } catch (error) {
      console.error('Error getting reports:', error);
      throw error;
    }
  }

  /**
   * Get reporting statistics
   */
  async getReportingStats(userId?: string): Promise<ReportingStats> {
    try {
      // Get overall reporting stats
      const totalReports = await prisma.safetyReport.count();
      const verifiedReports = await prisma.safetyReport.count({ where: { status: 'verified' } });
      const disputedReports = await prisma.safetyReport.count({ where: { status: 'disputed' } });
      
      // Get reports by type
      const reportTypes: ReportType[] = [
        'crime', 'harassment', 'unsafe_infrastructure', 'poor_lighting',
        'suspicious_activity', 'road_hazard', 'public_disturbance', 'other'
      ];
      
      const reportsByType: Record<ReportType, number> = {} as Record<ReportType, number>;
      
      for (const type of reportTypes) {
        reportsByType[type] = await prisma.safetyReport.count({
          where: { reportType: type }
        });
      }
      
      // Get reports by severity
      const severityLevels = ['low', 'medium', 'high', 'critical'];
      const reportsBySeverity: Record<string, number> = {};
      
      for (const severity of severityLevels) {
        reportsBySeverity[severity] = await prisma.safetyReport.count({
          where: { severity }
        });
      }
      
      // Get user-specific stats if userId provided
      let userReputationScore;
      let userReportCount;
      let userVerifiedReportCount;
      
      if (userId) {
        userReputationScore = await this.getUserReputationScore(userId);
        userReportCount = await prisma.safetyReport.count({
          where: { userId }
        });
        userVerifiedReportCount = await prisma.safetyReport.count({
          where: {
            userId,
            status: 'verified'
          }
        });
      }
      
      return {
        totalReports,
        verifiedReports,
        disputedReports,
        reportsByType,
        reportsBySeverity,
        userReputationScore,
        userReportCount,
        userVerifiedReportCount
      };
    } catch (error) {
      console.error('Error getting reporting stats:', error);
      throw error;
    }
  }

  /**
   * Delete a user's reports (for DPDP Act 2023 compliance)
   */
  async deleteUserReports(userId: string): Promise<{ success: boolean; count: number }> {
    try {
      // Find all reports by this user
      const reports = await prisma.safetyReport.findMany({
        where: { userId }
      });
      
      // Delete all verifications for these reports
      for (const report of reports) {
        await prisma.reportVerification.deleteMany({
          where: { reportId: report.id }
        });
      }
      
      // Delete the reports
      const result = await prisma.safetyReport.deleteMany({
        where: { userId }
      });
      
      // Log audit trail for DPDP Act 2023 compliance
      await this.logReportingActivity({
        userId,
        action: 'delete_user_reports',
        details: { count: result.count }
      });
      
      return {
        success: true,
        count: result.count
      };
    } catch (error) {
      console.error('Error deleting user reports:', error);
      throw error;
    }
  }

  /**
   * Anonymize a user's reports (for DPDP Act 2023 compliance)
   */
  async anonymizeUserReports(userId: string): Promise<{ success: boolean; count: number }> {
    try {
      // Update all reports to be anonymous
      const result = await prisma.safetyReport.updateMany({
        where: { userId },
        data: {
          isAnonymous: true,
          userId: null
        }
      });
      
      // Log audit trail for DPDP Act 2023 compliance
      await this.logReportingActivity({
        userId,
        action: 'anonymize_user_reports',
        details: { count: result.count }
      });
      
      return {
        success: true,
        count: result.count
      };
    } catch (error) {
      console.error('Error anonymizing user reports:', error);
      throw error;
    }
  }

  /**
   * Validate report data
   */
  private validateReportData(reportData: ReportData): void {
    // Check required fields
    if (!reportData.reportType) {
      throw new Error('Report type is required');
    }
    
    if (!reportData.description) {
      throw new Error('Description is required');
    }
    
    if (!reportData.severity) {
      throw new Error('Severity is required');
    }
    
    if (reportData.latitude === undefined || reportData.longitude === undefined) {
      throw new Error('Location coordinates are required');
    }
    
    if (!reportData.deviceId) {
      throw new Error('Device ID is required');
    }
    
    // Validate coordinates
    if (reportData.latitude < -90 || reportData.latitude > 90) {
      throw new Error('Invalid latitude value');
    }
    
    if (reportData.longitude < -180 || reportData.longitude > 180) {
      throw new Error('Invalid longitude value');
    }
    
    // Validate report type
    const validReportTypes: ReportType[] = [
      'crime', 'harassment', 'unsafe_infrastructure', 'poor_lighting',
      'suspicious_activity', 'road_hazard', 'public_disturbance', 'other'
    ];
    
    if (!validReportTypes.includes(reportData.reportType)) {
      throw new Error('Invalid report type');
    }
    
    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(reportData.severity)) {
      throw new Error('Invalid severity level');
    }
    
    // Validate media URLs if provided
    if (reportData.mediaUrls && reportData.mediaUrls.length > 0) {
      for (const url of reportData.mediaUrls) {
        try {
          new URL(url);
        } catch (e) {
          throw new Error('Invalid media URL format');
        }
      }
    }
  }

  /**
   * Calculate reliability score for a report
   */
  private calculateReliabilityScore(reportData: ReportData, userReputationScore: number): number {
    let reliabilityScore = userReputationScore;
    
    // Adjust based on report attributes
    
    // Media evidence increases reliability
    if (reportData.mediaUrls && reportData.mediaUrls.length > 0) {
      reliabilityScore += 10 * Math.min(reportData.mediaUrls.length, 3); // Up to 3 media items
    }
    
    // Anonymous reports are slightly less reliable
    if (reportData.isAnonymous) {
      reliabilityScore -= 10;
    }
    
    // Detailed descriptions are more reliable
    if (reportData.description.length > 100) {
      reliabilityScore += 5;
    }
    
    // Cap the score between 0 and 100
    return Math.max(0, Math.min(100, reliabilityScore));
  }

  /**
   * Recalculate report reliability based on verifications
   */
  private async recalculateReportReliability(reportId: string): Promise<number> {
    // Get the report
    const report = await prisma.safetyReport.findUnique({
      where: { id: reportId },
      include: {
        verifications: true
      }
    });
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    // Get user reputation score
    const userReputationScore = report.userId 
      ? await this.getUserReputationScore(report.userId)
      : 50; // Default for anonymous
    
    // Start with base score
    let reliabilityScore = userReputationScore;
    
    // Count verifications by type
    const upvotes = report.verifications.filter(v => v.action === 'upvote').length;
    const downvotes = report.verifications.filter(v => v.action === 'downvote').length;
    const confirms = report.verifications.filter(v => v.action === 'confirm').length;
    const disputes = report.verifications.filter(v => v.action === 'dispute').length;
    
    // Calculate verification score
    const totalVotes = upvotes + downvotes + confirms + disputes;
    if (totalVotes > 0) {
      // Weighted impact: confirms have more weight than upvotes, disputes more than downvotes
      const positiveScore = (upvotes * 1) + (confirms * 2);
      const negativeScore = (downvotes * 1) + (disputes * 2);
      
      // Calculate percentage of positive verifications (0-100)
      const verificationScore = (positiveScore / (positiveScore + negativeScore)) * 100;
      
      // Blend original score with verification score, giving more weight to verification
      // as the number of verifications increases
      const verificationWeight = Math.min(0.8, totalVotes / 10); // Max 80% weight for verifications
      reliabilityScore = (reliabilityScore * (1 - verificationWeight)) + (verificationScore * verificationWeight);
    }
    
    // Media evidence increases reliability
    if (report.mediaUrls && report.mediaUrls.length > 0) {
      reliabilityScore += 5 * Math.min(report.mediaUrls.length, 3); // Up to 3 media items
    }
    
    // Cap the score between 0 and 100
    reliabilityScore = Math.max(0, Math.min(100, reliabilityScore));
    
    // Update the report with new reliability score
    await prisma.safetyReport.update({
      where: { id: reportId },
      data: { reliabilityScore }
    });
    
    return reliabilityScore;
  }

  /**
   * Update report status based on verifications
   */
  private async updateReportStatus(reportId: string): Promise<void> {
    // Get the report with verifications
    const report = await prisma.safetyReport.findUnique({
      where: { id: reportId },
      include: {
        verifications: true
      }
    });
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    // Count verifications by type
    const confirms = report.verifications.filter(v => v.action === 'confirm').length;
    const disputes = report.verifications.filter(v => v.action === 'dispute').length;
    
    // Determine status based on verification counts
    let status = report.status;
    
    if (confirms >= 3 && confirms > disputes) {
      status = 'verified';
    } else if (disputes >= 3 && disputes > confirms) {
      status = 'disputed';
    } else if (confirms === 0 && disputes === 0) {
      status = 'pending';
    }
    
    // Update report status if changed
    if (status !== report.status) {
      await prisma.safetyReport.update({
        where: { id: reportId },
        data: { status }
      });
    }
  }

  /**
   * Get user reputation score
   */
  private async getUserReputationScore(userId: string): Promise<number> {
    try {
      // Get user reputation from database
      const userReputation = await prisma.userReputation.findUnique({
        where: { userId }
      });
      
      // Return score or default if not found
      return userReputation?.score || 50; // Default starting score
    } catch (error) {
      console.error('Error getting user reputation:', error);
      return 50; // Default score on error
    }
  }

  /**
   * Update user reputation based on activity
   */
  private async updateUserReputation(userId: string, action: string): Promise<void> {
    try {
      // Get current reputation
      const userReputation = await prisma.userReputation.findUnique({
        where: { userId }
      });
      
      // Calculate score adjustment based on action
      let scoreAdjustment = 0;
      
      switch (action) {
        case 'upvote':
          scoreAdjustment = 0.2;
          break;
        case 'downvote':
          scoreAdjustment = -0.2;
          break;
        case 'confirm':
          scoreAdjustment = 0.5;
          break;
        case 'dispute':
          scoreAdjustment = -0.5;
          break;
        case 'verification_activity':
          scoreAdjustment = 0.1; // Small bonus for participating
          break;
        default:
          scoreAdjustment = 0;
      }
      
      // Create or update user reputation
      if (userReputation) {
        // Update existing reputation
        const newScore = Math.max(0, Math.min(100, userReputation.score + scoreAdjustment));
        
        await prisma.userReputation.update({
          where: { userId },
          data: {
            score: newScore,
            lastUpdated: new Date()
          }
        });
      } else {
        // Create new reputation entry
        await prisma.userReputation.create({
          data: {
            userId,
            score: 50 + scoreAdjustment, // Start with default + adjustment
            lastUpdated: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error updating user reputation:', error);
    }
  }

  /**
   * Verify user has given consent for location sharing
   */
  private async verifyUserConsent(userId: string): Promise<boolean> {
    try {
      // Get user consent settings
      const userConsent = await prisma.userConsent.findFirst({
        where: {
          userId,
          consentType: 'location_sharing',
          status: 'granted'
        },
        orderBy: {
          timestamp: 'desc'
        }
      });
      
      return !!userConsent;
    } catch (error) {
      console.error('Error verifying user consent:', error);
      return false; // Default to no consent on error
    }
  }

  /**
   * Log reporting activity for audit trail (DPDP Act 2023 compliance)
   */
  private async logReportingActivity(data: {
    userId?: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    action: string;
    resourceId?: string;
    details?: any;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          deviceId: data.deviceId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          action: data.action,
          resourceType: 'safety_report',
          resourceId: data.resourceId,
          details: data.details,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging reporting activity:', error);
    }
  }

  /**
   * Calculate bounding box for location-based queries
   */
  private calculateBoundingBox(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
    // Earth's radius in kilometers
    const earthRadius = 6371;
    
    // Convert radius from kilometers to radians
    const radiusRadians = radiusKm / earthRadius;
    
    // Convert latitude and longitude to radians
    const latRad = this.deg2rad(latitude);
    const lngRad = this.deg2rad(longitude);
    
    // Calculate min/max latitudes
    const minLat = latRad - radiusRadians;
    const maxLat = latRad + radiusRadians;
    
    // Calculate min/max longitudes
    // This is an approximation and works well for small distances
    const latDelta = Math.asin(Math.sin(radiusRadians) / Math.cos(latRad));
    const minLng = lngRad - latDelta;
    const maxLng = lngRad + latDelta;
    
    // Convert back to degrees
    return {
      minLat: this.rad2deg(minLat),
      maxLat: this.rad2deg(maxLat),
      minLng: this.rad2deg(minLng),
      maxLng: this.rad2deg(maxLng)
    };
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  private rad2deg(radians: number): number {
    return radians * (180 / Math.PI);
  }
}

export default ReportingService;
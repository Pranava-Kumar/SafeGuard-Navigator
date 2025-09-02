/**
 * SafeRoute Real-time Safety Data Pipeline
 * Implements a data pipeline for processing and distributing safety information
 * Compliant with DPDP Act 2023
 */

import { PrismaClient } from '@prisma/client';
import { LocationData } from '../safety/safetyScoreService';
import SafetyScoreService from '../safety/safetyScoreService';
import ReportingService from '../reporting/reportingService';

const prisma = new PrismaClient();
const safetyScoreService = new SafetyScoreService();
const reportingService = new ReportingService();

// Types for real-time data pipeline
export interface SafetyDataSource {
  sourceId: string;
  name: string;
  type: 'official' | 'crowdsourced' | 'sensor' | 'weather' | 'emergency' | 'traffic';
  reliability: number; // 0-100
  updateFrequency: number; // in seconds
  lastUpdated: Date;
  isActive: boolean;
  apiEndpoint?: string | null;
  apiKey?: string | null;
  dataFormat?: string | null;
}

export interface SafetyDataEvent {
  eventId: string;
  sourceId: string;
  eventType: string;
  severity: 'info' | 'warning' | 'alert' | 'emergency';
  location: LocationData;
  timestamp: Date;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  isVerified: boolean;
}

export interface SafetyDataSubscription {
  userId: string;
  deviceId: string;
  location?: LocationData;
  radius?: number; // in kilometers
  eventTypes?: string[];
  minSeverity?: 'info' | 'warning' | 'alert' | 'emergency';
  notificationChannels: ('push' | 'email' | 'sms')[];
  isActive: boolean;
}

export interface SafetyNotification {
  notificationId: string;
  userId: string;
  deviceId: string;
  eventId: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'alert' | 'emergency';
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string | null;
}

// Safety Data Pipeline Service
class SafetyDataPipeline {
  private dataSources: Map<string, SafetyDataSource> = new Map();
  private dataUpdateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private eventCache: Map<string, SafetyDataEvent> = new Map();
  
  constructor() {
    // Initialize data sources and start data collection
    this.initializeDataSources();
  }

  /**
   * Initialize data sources and start data collection
   */
  private async initializeDataSources(): Promise<void> {
    try {
      // Load data sources from database
      const sources = await prisma.safetyDataSource.findMany({
        where: { isActive: true }
      });
      
      // Initialize each data source
      for (const source of sources) {
        this.dataSources.set(source.id, {
          sourceId: source.id,
          name: source.name,
          type: source.type as SafetyDataSource['type'], // Properly typed instead of 'any'
          reliability: source.reliability,
          updateFrequency: source.updateFrequency,
          lastUpdated: source.lastUpdated,
          isActive: source.isActive,
          apiEndpoint: source.apiEndpoint ?? undefined,
          apiKey: source.apiKey ?? undefined,
          dataFormat: source.dataFormat ?? undefined
        });
        
        // Start data collection for this source
        this.startDataCollection(source.id);
      }
      
      console.log(`Initialized ${sources.length} safety data sources`);
    } catch (error) {
      console.error('Error initializing data sources:', error);
    }
  }

  /**
   * Start data collection for a specific source
   */
  private startDataCollection(sourceId: string): void {
    const source = this.dataSources.get(sourceId);
    if (!source || !source.isActive) return;
    
    // Clear any existing interval
    if (this.dataUpdateIntervals.has(sourceId)) {
      clearInterval(this.dataUpdateIntervals.get(sourceId));
    }
    
    // Set up interval for data collection
    const interval = setInterval(async () => {
      try {
        await this.collectDataFromSource(sourceId);
      } catch (error) {
        console.error(`Error collecting data from source ${sourceId}:`, error);
      }
    }, source.updateFrequency * 1000);
    
    this.dataUpdateIntervals.set(sourceId, interval);
    
    // Collect data immediately on start
    this.collectDataFromSource(sourceId).catch(error => {
      console.error(`Error collecting initial data from source ${sourceId}:`, error);
    });
  }

  /**
   * Stop data collection for a specific source
   */
  private stopDataCollection(sourceId: string): void {
    if (this.dataUpdateIntervals.has(sourceId)) {
      clearInterval(this.dataUpdateIntervals.get(sourceId));
      this.dataUpdateIntervals.delete(sourceId);
    }
  }

  /**
   * Collect data from a specific source
   */
  private async collectDataFromSource(sourceId: string): Promise<void> {
    const source = this.dataSources.get(sourceId);
    if (!source) return;
    
    try {
      // Update last updated timestamp
      source.lastUpdated = new Date();
      this.dataSources.set(sourceId, source);
      
      // Collect data based on source type
      let events: SafetyDataEvent[] = [];
      
      switch (source.type) {
        case 'official':
          events = await this.collectOfficialData(source);
          break;
        case 'crowdsourced':
          events = await this.collectCrowdsourcedData(source);
          break;
        case 'sensor':
          events = await this.collectSensorData(source);
          break;
        case 'weather':
          events = await this.collectWeatherData(source);
          break;
        case 'emergency':
          events = await this.collectEmergencyData(source);
          break;
        case 'traffic':
          events = await this.collectTrafficData(source);
          break;
      }
      
      // Process collected events
      await this.processEvents(events);
      
      // Update source in database
      await prisma.safetyDataSource.update({
        where: { id: sourceId },
        data: { lastUpdated: source.lastUpdated }
      });
    } catch (error) {
      console.error(`Error collecting data from source ${sourceId}:`, error);
    }
  }

  /**
   * Process safety data events
   */
  private async processEvents(events: SafetyDataEvent[]): Promise<void> {
    for (const event of events) {
      try {
        // Check if event already exists
        const existingEvent = this.eventCache.get(event.eventId);
        
        if (existingEvent) {
          // Update existing event
          await this.updateEvent(event);
        } else {
          // Store new event
          await this.storeEvent(event);
        }
        
        // Update event cache
        this.eventCache.set(event.eventId, event);
        
        // Send notifications for this event
        await this.sendEventNotifications(event);
      } catch (error) {
        console.error(`Error processing event ${event.eventId}:`, error);
      }
    }
  }

  /**
   * Store a new safety data event
   */
  private async storeEvent(event: SafetyDataEvent): Promise<void> {
    try {
      // Store event in database
      await prisma.safetyEvent.create({
        data: {
          id: event.eventId,
          sourceId: event.sourceId,
          eventType: event.eventType,
          severity: event.severity,
          latitude: event.location.latitude,
          longitude: event.location.longitude,
          radius: event.radius || 100, // Default 100m radius
          startTime: event.startTime,
          endTime: event.endTime,
          description: event.description,
          metadata: event.metadata || {},
          isVerified: event.isVerified,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Update safety scores for affected area
      await this.updateSafetyScores(event);
    } catch (error) {
      console.error(`Error storing event ${event.eventId}:`, error);
    }
  }

  /**
   * Update an existing safety data event
   */
  private async updateEvent(event: SafetyDataEvent): Promise<void> {
    try {
      // Update event in database
      await prisma.safetyEvent.update({
        where: { id: event.eventId },
        data: {
          severity: event.severity,
          radius: event.radius,
          endTime: event.endTime,
          description: event.description,
          metadata: event.metadata || {},
          isVerified: event.isVerified,
          updatedAt: new Date()
        }
      });
      
      // Update safety scores for affected area if severity changed
      const existingEvent = this.eventCache.get(event.eventId);
      if (existingEvent && existingEvent.severity !== event.severity) {
        await this.updateSafetyScores(event);
      }
    } catch (error) {
      console.error(`Error updating event ${event.eventId}:`, error);
    }
  }

  /**
   * Update safety scores for an affected area
   */
  private async updateSafetyScores(event: SafetyDataEvent): Promise<void> {
    try {
      // Get affected area
      const affectedArea = this.calculateAffectedArea(
        event.location.latitude,
        event.location.longitude,
        event.radius || 100 // Default 100m radius
      );
      
      // Update safety scores in the affected area
      // This is a simplified implementation - in a real system, this would
      // update a spatial database or cache of safety scores
      
      // For now, we'll just log that we're updating scores
      console.log(`Updating safety scores for area affected by event ${event.eventId}`);
      console.log(`Affected area: ${JSON.stringify(affectedArea)}`);
    } catch (error) {
      console.error(`Error updating safety scores for event ${event.eventId}:`, error);
    }
  }

  /**
   * Send notifications for a safety data event
   */
  private async sendEventNotifications(event: SafetyDataEvent): Promise<void> {
    try {
      // Find users who should be notified about this event
      const subscriptions = await this.findMatchingSubscriptions(event);
      
      // Send notifications to each subscriber
      for (const subscription of subscriptions) {
        await this.sendNotification(subscription, event);
      }
    } catch (error) {
      console.error(`Error sending notifications for event ${event.eventId}:`, error);
    }
  }

  /**
   * Find subscriptions that match an event
   */
  private async findMatchingSubscriptions(event: SafetyDataEvent): Promise<SafetyDataSubscription[]> {
    try {
      // Get all active subscriptions
      const allSubscriptions = await prisma.safetySubscription.findMany({
        where: { isActive: true }
      });
      
      // Filter subscriptions that match this event
      return allSubscriptions
        .filter(sub => {
          // Check if subscription has location and radius
          if (sub.latitude && sub.longitude && sub.radius) {
            // Calculate distance between event and subscription location
            const distance = this.calculateDistance(
              event.location.latitude,
              event.location.longitude,
              sub.latitude,
              sub.longitude
            );
            
            // Check if event is within subscription radius
            if (distance > sub.radius) {
              return false;
            }
          }
          
          // Check event type filter
          if (sub.eventTypes && sub.eventTypes.length > 0) {
            if (!sub.eventTypes.includes(event.eventType)) {
              return false;
            }
          }
          
          // Check severity filter
          if (sub.minSeverity) {
            const severityLevels = ['info', 'warning', 'alert', 'emergency'];
            const subSeverityIndex = severityLevels.indexOf(sub.minSeverity);
            const eventSeverityIndex = severityLevels.indexOf(event.severity);
            
            if (eventSeverityIndex < subSeverityIndex) {
              return false;
            }
          }
          
          return true;
        })
        .map(sub => ({
          userId: sub.userId,
          deviceId: sub.deviceId,
          location: sub.latitude && sub.longitude ? {
            latitude: sub.latitude,
            longitude: sub.longitude,
            time: new Date()
          } : undefined,
          radius: sub.radius ?? undefined,
          eventTypes: sub.eventTypes,
          minSeverity: sub.minSeverity as 'info' | 'warning' | 'alert' | 'emergency',
          notificationChannels: sub.notificationChannels as ('push' | 'email' | 'sms')[],
          isActive: sub.isActive

        }));
    } catch (error) {
      console.error(`Error finding matching subscriptions for event ${event.eventId}:`, error);
      return [];
    }
  }

  /**
   * Send a notification to a subscriber
   */
  private async sendNotification(
    subscription: SafetyDataSubscription,
    event: SafetyDataEvent
  ): Promise<void> {
    try {
      // Create notification record
      const notification = await prisma.safetyNotification.create({
        data: {
          userId: subscription.userId,
          deviceId: subscription.deviceId,
          eventId: event.eventId,
          title: this.getNotificationTitle(event),
          message: this.getNotificationMessage(event),
          severity: event.severity,
          timestamp: new Date(),
          isRead: false,
          actionUrl: `/safety/event/${event.eventId}`
        }
      });
      
      // Send notification through each channel
      for (const channel of subscription.notificationChannels) {
        await this.sendNotificationViaChannel({
          notificationId: notification.id,
          userId: notification.userId,
          deviceId: notification.deviceId,
          eventId: notification.eventId,
          title: notification.title,
          message: notification.message,
          severity: notification.severity as 'info' | 'warning' | 'alert' | 'emergency',
          timestamp: notification.timestamp,
          isRead: notification.isRead,
          actionUrl: notification.actionUrl
        }, channel, subscription.userId);
      }
      
      // Log notification activity for DPDP Act 2023 compliance
      await this.logNotificationActivity({
        userId: subscription.userId,
        deviceId: subscription.deviceId,
        action: 'send_safety_notification',
        resourceId: notification.id,
        details: {
          eventId: event.eventId,
          eventType: event.eventType,
          severity: event.severity,
          channels: subscription.notificationChannels
        }
      });
    } catch (error) {
      console.error(`Error sending notification to user ${subscription.userId} for event ${event.eventId}:`, error);
    }
  }

  /**
   * Send notification via a specific channel
   */
  private async sendNotificationViaChannel(
    notification: SafetyNotification,
    channel: 'push' | 'email' | 'sms',
    userId: string
  ): Promise<void> {
    try {
      // Check if user has consent for this notification channel
      const hasConsent = await this.verifyUserConsent(userId, `notifications_${channel}`);
      if (!hasConsent) {
        console.log(`User ${userId} has not provided consent for ${channel} notifications`);
        return;
      }
      
      // Send notification based on channel
      switch (channel) {
        case 'push':
          await this.sendPushNotification(notification, userId);
          break;
        case 'email':
          await this.sendEmailNotification(notification, userId);
          break;
        case 'sms':
          await this.sendSmsNotification(notification, userId);
          break;
      }
    } catch (error) {
      console.error(`Error sending ${channel} notification to user ${userId}:`, error);
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: SafetyNotification, userId: string): Promise<void> {
    try {
      // Get user's push notification tokens
      const devices = await prisma.userDevice.findMany({
        where: {
          userId,
          pushToken: { not: null }
        }
      });
      
      if (devices.length === 0) {
        console.log(`No push-enabled devices found for user ${userId}`);
        return;
      }
      
      // In a real implementation, this would use Firebase Cloud Messaging,
      // OneSignal, or another push notification service
      console.log(`Sending push notification to ${devices.length} devices for user ${userId}`);
      console.log(`Notification: ${notification.title} - ${notification.message}`);
    } catch (error) {
      console.error(`Error sending push notification to user ${userId}:`, error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: SafetyNotification, userId: string): Promise<void> {
    try {
      // Get user's email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });
      
      if (!user?.email) {
        console.log(`No email found for user ${userId}`);
        return;
      }
      
      // In a real implementation, this would use an email service
      // like SendGrid, Mailgun, or AWS SES
      console.log(`Sending email notification to ${user.email}`);
      console.log(`Subject: ${notification.title}`);
      console.log(`Body: ${notification.message}`);
    } catch (error) {
      console.error(`Error sending email notification to user ${userId}:`, error);
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSmsNotification(notification: SafetyNotification, userId: string): Promise<void> {
    try {
      // Get user's phone number
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true }
      });
      
      if (!user?.phone) {
        console.log(`No phone number found for user ${userId}`);
        return;
      }
      
      // In a real implementation, this would use an SMS service
      // like Twilio, Nexmo, or AWS SNS
      console.log(`Sending SMS notification to ${user.phone}`);
      console.log(`Message: ${notification.title} - ${notification.message}`);
    } catch (error) {
      console.error(`Error sending SMS notification to user ${userId}:`, error);
    }
  }

  /**
   * Get notification title based on event type and severity
   */
  private getNotificationTitle(event: SafetyDataEvent): string {
    const severityPrefix = this.getSeverityPrefix(event.severity);
    
    switch (event.eventType) {
      case 'crime':
        return `${severityPrefix} Crime Alert`;
      case 'harassment':
        return `${severityPrefix} Harassment Alert`;
      case 'accident':
        return `${severityPrefix} Accident Alert`;
      case 'natural_disaster':
        return `${severityPrefix} Natural Disaster Alert`;
      case 'weather':
        return `${severityPrefix} Weather Alert`;
      case 'traffic':
        return `${severityPrefix} Traffic Alert`;
      case 'infrastructure':
        return `${severityPrefix} Infrastructure Alert`;
      default:
        return `${severityPrefix} Safety Alert`;
    }
  }

  /**
   * Get notification message based on event
   */
  private getNotificationMessage(event: SafetyDataEvent): string {
    // Format location for readability
    const locationStr = `near ${event.location.latitude.toFixed(4)}, ${event.location.longitude.toFixed(4)}`;
    
    // Format time for readability
    const timeStr = event.startTime.toLocaleTimeString();
    
    return `${event.description} reported at ${timeStr} ${locationStr}. ${this.getSafetyAdvice(event)}`;
  }

  /**
   * Get severity prefix for notifications
   */
  private getSeverityPrefix(severity: string): string {
    switch (severity) {
      case 'emergency':
        return '🚨 EMERGENCY:';
      case 'alert':
        return '⚠️ ALERT:';
      case 'warning':
        return '⚠️ Warning:';
      case 'info':
        return 'Info:';
      default:
        return '';
    }
  }

  /**
   * Get safety advice based on event type
   */
  private getSafetyAdvice(event: SafetyDataEvent): string {
    switch (event.eventType) {
      case 'crime':
        return 'Avoid the area and contact authorities if you witness suspicious activity.';
      case 'harassment':
        return 'Stay in well-lit, populated areas and consider traveling with others.';
      case 'accident':
        return 'Expect delays and use alternative routes if possible.';
      case 'natural_disaster':
        return 'Follow evacuation orders and seek shelter immediately if necessary.';
      case 'weather':
        return 'Take appropriate precautions and check weather updates regularly.';
      case 'traffic':
        return 'Expect delays and consider alternative routes.';
      case 'infrastructure':
        return 'Use caution and follow any detour signs.';
      default:
        return 'Stay alert and use caution in the area.';
    }
  }

  /**
   * Verify user has given consent for a specific purpose
   */
  private async verifyUserConsent(userId: string, consentType: string): Promise<boolean> {
    try {
      // Get user consent settings
      const userConsent = await prisma.userConsent.findFirst({
        where: {
          userId,
          consentType,
          status: 'granted'
        },
        orderBy: {
          timestamp: 'desc'
        }
      });
      
      return !!userConsent;
    } catch (error) {
      console.error(`Error verifying user consent for ${userId}:`, error);
      return false; // Default to no consent on error
    }
  }

  /**
   * Log notification activity for audit trail (DPDP Act 2023 compliance)
   */
  private async logNotificationActivity(data: {
    userId?: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    action: string;
    resourceId?: string;
    details?: any;
  }): Promise<void> {
    try {
      // Only log if we have a userId, as it's required in the AuditLog model
      if (!data.userId) {
        console.warn('Skipping audit log entry - no userId provided');
        return;
      }
      
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: 'safety_notification',
          metadata: data.details ? JSON.stringify(data.details) : null,
        }
      });
    } catch (error) {
      console.error('Error logging notification activity:', error);
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Calculate affected area for an event
   */
  private calculateAffectedArea(
    latitude: number,
    longitude: number,
    radiusMeters: number
  ): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
    // Convert radius from meters to kilometers
    const radiusKm = radiusMeters / 1000;
    
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

  /**
   * Collect data from official sources
   */
  private async collectOfficialData(source: SafetyDataSource): Promise<SafetyDataEvent[]> {
    // This is a placeholder implementation
    // In a real system, this would call an API or parse data from an official source
    console.log(`Collecting data from official source: ${source.name}`);
    return [];
  }

  /**
   * Collect data from crowdsourced reports
   */
  private async collectCrowdsourcedData(source: SafetyDataSource): Promise<SafetyDataEvent[]> {
    try {
      // Get recent reports from the reporting service
      const currentTime = new Date();
      const startTime = new Date(currentTime.getTime() - 15 * 60 * 1000); // Last 15 minutes
      
      // This would typically call the reporting service to get recent reports
      // For now, we'll just return an empty array
      console.log(`Collecting crowdsourced data from: ${source.name}`);
      return [];
    } catch (error) {
      console.error(`Error collecting crowdsourced data from ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Collect data from sensor networks
   */
  private async collectSensorData(source: SafetyDataSource): Promise<SafetyDataEvent[]> {
    // This is a placeholder implementation
    // In a real system, this would call an API or parse data from sensor networks
    console.log(`Collecting data from sensor network: ${source.name}`);
    return [];
  }

  /**
   * Collect data from weather services
   */
  private async collectWeatherData(source: SafetyDataSource): Promise<SafetyDataEvent[]> {
    // This is a placeholder implementation
    // In a real system, this would call a weather API
    console.log(`Collecting data from weather service: ${source.name}`);
    return [];
  }

  /**
   * Collect data from emergency services
   */
  private async collectEmergencyData(source: SafetyDataSource): Promise<SafetyDataEvent[]> {
    // This is a placeholder implementation
    // In a real system, this would call an emergency services API
    console.log(`Collecting data from emergency services: ${source.name}`);
    return [];
  }

  /**
   * Collect data from traffic services
   */
  private async collectTrafficData(source: SafetyDataSource): Promise<SafetyDataEvent[]> {
    // This is a placeholder implementation
    // In a real system, this would call a traffic API
    console.log(`Collecting data from traffic service: ${source.name}`);
    return [];
  }

  /**
   * Add a new data source
   */
  async addDataSource(source: Omit<SafetyDataSource, 'sourceId'>): Promise<SafetyDataSource> {
    try {
      // Create data source in database
      const newSource = await prisma.safetyDataSource.create({
        data: {
          name: source.name,
          type: source.type,
          reliability: source.reliability,
          updateFrequency: source.updateFrequency,
          lastUpdated: new Date(),
          isActive: source.isActive,
          apiEndpoint: source.apiEndpoint,
          apiKey: source.apiKey,
          dataFormat: source.dataFormat
        }
      });
      
      // Add to in-memory map
      const dataSource: SafetyDataSource = {
        sourceId: newSource.id,
        name: newSource.name,
        type: newSource.type as any,
        reliability: newSource.reliability,
        updateFrequency: newSource.updateFrequency,
        lastUpdated: newSource.lastUpdated,
        isActive: newSource.isActive,
        apiEndpoint: newSource.apiEndpoint,
        apiKey: newSource.apiKey,
        dataFormat: newSource.dataFormat
      };
      
      this.dataSources.set(newSource.id, dataSource);
      
      // Start data collection if active
      if (dataSource.isActive) {
        this.startDataCollection(newSource.id);
      }
      
      return dataSource;
    } catch (error) {
      console.error('Error adding data source:', error);
      throw error;
    }
  }

  /**
   * Update a data source
   */
  async updateDataSource(sourceId: string, updates: Partial<SafetyDataSource>): Promise<SafetyDataSource> {
    try {
      // Get existing source
      const existingSource = this.dataSources.get(sourceId);
      if (!existingSource) {
        throw new Error(`Data source ${sourceId} not found`);
      }
      
      // Update in database
      await prisma.safetyDataSource.update({
        where: { id: sourceId },
        data: {
          name: updates.name,
          type: updates.type,
          reliability: updates.reliability,
          updateFrequency: updates.updateFrequency,
          isActive: updates.isActive,
          apiEndpoint: updates.apiEndpoint,
          apiKey: updates.apiKey,
          dataFormat: updates.dataFormat
        }
      });
      
      // Update in-memory map
      const updatedSource: SafetyDataSource = {
        ...existingSource,
        ...updates
      };
      
      this.dataSources.set(sourceId, updatedSource);
      
      // Restart data collection if active status or frequency changed
      if (updates.isActive !== undefined || updates.updateFrequency !== undefined) {
        if (updatedSource.isActive) {
          this.startDataCollection(sourceId);
        } else {
          this.stopDataCollection(sourceId);
        }
      }
      
      return updatedSource;
    } catch (error) {
      console.error(`Error updating data source ${sourceId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a data source
   */
  async removeDataSource(sourceId: string): Promise<boolean> {
    try {
      // Stop data collection
      this.stopDataCollection(sourceId);
      
      // Remove from in-memory map
      this.dataSources.delete(sourceId);
      
      // Remove from database
      await prisma.safetyDataSource.delete({
        where: { id: sourceId }
      });
      
      return true;
    } catch (error) {
      console.error(`Error removing data source ${sourceId}:`, error);
      return false;
    }
  }

  /**
   * Create a new safety data subscription
   */
  async createSubscription(subscription: Omit<SafetyDataSubscription, 'isActive'>): Promise<SafetyDataSubscription> {
    try {
      // Verify user has consent for notifications
      const hasConsent = await this.verifyUserConsent(subscription.userId, 'notifications');
      if (!hasConsent) {
        throw new Error('User has not provided consent for notifications');
      }
      
      // Create subscription in database
      const newSubscription = await prisma.safetySubscription.create({
        data: {
          userId: subscription.userId,
          deviceId: subscription.deviceId,
          latitude: subscription.location?.latitude,
          longitude: subscription.location?.longitude,
          radius: subscription.radius,
          eventTypes: subscription.eventTypes || [],
          minSeverity: subscription.minSeverity,
          notificationChannels: subscription.notificationChannels,
          isActive: true
        }
      });
      
      // Log for DPDP Act 2023 compliance
      await this.logNotificationActivity({
        userId: subscription.userId,
        deviceId: subscription.deviceId,
        action: 'create_safety_subscription',
        resourceId: newSubscription.id,
        details: {
          notificationChannels: subscription.notificationChannels,
          eventTypes: subscription.eventTypes,
          minSeverity: subscription.minSeverity
        }
      });
      
      return {
        userId: newSubscription.userId,
        deviceId: newSubscription.deviceId,
        location: newSubscription.latitude && newSubscription.longitude ? {
          latitude: newSubscription.latitude,
          longitude: newSubscription.longitude,
          time: new Date()
        } : undefined,
        radius: newSubscription.radius ?? undefined,
        eventTypes: newSubscription.eventTypes,
        minSeverity: newSubscription.minSeverity as any,
        notificationChannels: newSubscription.notificationChannels as any,
        isActive: newSubscription.isActive
      };
    } catch (error) {
      console.error(`Error creating subscription for user ${subscription.userId}:`, error);
      throw error;
    }
  }

  /**
   * Update a safety data subscription
   */
  async updateSubscription(
    userId: string,
    deviceId: string,
    updates: Partial<SafetyDataSubscription>
  ): Promise<SafetyDataSubscription> {
    try {
      // Find existing subscription
      const existingSubscription = await prisma.safetySubscription.findFirst({
        where: {
          userId,
          deviceId
        }
      });
      
      if (!existingSubscription) {
        throw new Error(`Subscription not found for user ${userId} and device ${deviceId}`);
      }
      
      // Update subscription in database
      const updatedSubscription = await prisma.safetySubscription.update({
        where: { id: existingSubscription.id },
        data: {
          latitude: updates.location?.latitude,
          longitude: updates.location?.longitude,
          radius: updates.radius,
          eventTypes: updates.eventTypes,
          minSeverity: updates.minSeverity,
          notificationChannels: updates.notificationChannels,
          isActive: updates.isActive
        }
      });
      
      // Log for DPDP Act 2023 compliance
      await this.logNotificationActivity({
        userId,
        deviceId,
        action: 'update_safety_subscription',
        resourceId: existingSubscription.id,
        details: {
          notificationChannels: updates.notificationChannels,
          eventTypes: updates.eventTypes,
          minSeverity: updates.minSeverity,
          isActive: updates.isActive
        }
      });
      
      return {
        userId: updatedSubscription.userId,
        deviceId: updatedSubscription.deviceId,
        location: updatedSubscription.latitude && updatedSubscription.longitude ? {
          latitude: updatedSubscription.latitude,
          longitude: updatedSubscription.longitude,
          time: new Date()
        } : undefined,
        radius: updatedSubscription.radius ?? undefined,
        eventTypes: updatedSubscription.eventTypes,
        minSeverity: updatedSubscription.minSeverity as any,
        notificationChannels: updatedSubscription.notificationChannels as any,
        isActive: updatedSubscription.isActive
      };
    } catch (error) {
      console.error(`Error updating subscription for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a safety data subscription
   */
  async deleteSubscription(userId: string, deviceId: string): Promise<boolean> {
    try {
      // Find existing subscription
      const existingSubscription = await prisma.safetySubscription.findFirst({
        where: {
          userId,
          deviceId
        }
      });
      
      if (!existingSubscription) {
        throw new Error(`Subscription not found for user ${userId} and device ${deviceId}`);
      }
      
      // Delete subscription from database
      await prisma.safetySubscription.delete({
        where: { id: existingSubscription.id }
      });
      
      // Log for DPDP Act 2023 compliance
      await this.logNotificationActivity({
        userId,
        deviceId,
        action: 'delete_safety_subscription',
        resourceId: existingSubscription.id
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting subscription for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get user's safety notifications
   */
  async getUserNotifications(
    userId: string,
    options: { unreadOnly?: boolean; limit?: number; offset?: number } = {}
  ): Promise<SafetyNotification[]> {
    try {
      // Build query
      const whereClause: any = { userId };
      if (options.unreadOnly) {
        whereClause.isRead = false;
      }
      
      // Get notifications from database
      const notifications = await prisma.safetyNotification.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        skip: options.offset || 0,
        take: options.limit || 20
      });
      
      // Map to return type
      return notifications.map(notification => ({
        notificationId: notification.id,
        userId: notification.userId,
        deviceId: notification.deviceId,
        eventId: notification.eventId,
        title: notification.title,
        message: notification.message,
        severity: notification.severity as any,
        timestamp: notification.timestamp,
        isRead: notification.isRead,
        actionUrl: notification.actionUrl
      }));
    } catch (error) {
      console.error(`Error getting notifications for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      // Find notification
      const notification = await prisma.safetyNotification.findUnique({
        where: { id: notificationId }
      });
      
      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }
      
      // Verify user owns this notification
      if (notification.userId !== userId) {
        throw new Error('Unauthorized access to notification');
      }
      
      // Update notification
      await prisma.safetyNotification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });
      
      return true;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      return false;
    }
  }
}

export default SafetyDataPipeline;
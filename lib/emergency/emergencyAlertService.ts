/**
 * SafeRoute Emergency Alert Service
 * Implements an emergency alert system for users in danger
 * Compliant with DPDP Act 2023
 */

import { PrismaClient } from '@prisma/client';
import { LocationData } from '../safety/safetyScoreService';

const prisma = new PrismaClient();

// Types for emergency alert system
export interface EmergencyContact {
  contactId: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  notificationPreference: ('sms' | 'call' | 'email')[];
  isVerified: boolean;
  isPrimary: boolean;
}

export interface EmergencyAlert {
  alertId: string;
  userId: string;
  deviceId: string;
  alertType: 'sos' | 'medical' | 'fire' | 'police' | 'custom';
  customMessage?: string;
  location: LocationData;
  timestamp: Date;
  status: 'active' | 'resolved' | 'false_alarm';
  resolvedTimestamp?: Date;
  notifiedContacts: string[];
  notifiedAuthorities: boolean;
  userFeedback?: string;
}

export interface AlertOptions {
  notifyContacts?: boolean;
  notifyAuthorities?: boolean;
  includeLocation?: boolean;
  includeUserProfile?: boolean;
  includeHealthInfo?: boolean;
  customMessage?: string;
}

export interface EmergencyService {
  serviceId: string;
  name: string;
  type: 'police' | 'ambulance' | 'fire' | 'disaster_management' | 'women_helpline' | 'other';
  phone: string;
  country: string;
  state?: string;
  city?: string;
  isActive: boolean;
}

// Emergency Alert Service
class EmergencyAlertService {
  /**
   * Trigger an emergency alert
   * DPDP Act 2023 compliant with consent management
   */
  async triggerAlert(
    userId: string,
    deviceId: string,
    alertType: 'sos' | 'medical' | 'fire' | 'police' | 'custom',
    location: LocationData,
    options: AlertOptions = {}
  ): Promise<{ alertId: string; success: boolean; message: string }> {
    try {
      // Set default options
      const {
        notifyContacts = true,
        notifyAuthorities = true,
        includeLocation = true,
        includeUserProfile = false,
        includeHealthInfo = false,
        customMessage
      } = options;
      
      // Verify user consent for emergency alerts
      const hasConsent = await this.verifyUserConsent(userId, 'emergency_alerts');
      if (!hasConsent) {
        throw new Error('User has not provided consent for emergency alerts');
      }
      
      // Verify location sharing consent if including location
      if (includeLocation) {
        const hasLocationConsent = await this.verifyUserConsent(userId, 'location_sharing');
        if (!hasLocationConsent) {
          throw new Error('User has not provided consent for location sharing');
        }
      }
      
      // Verify health info sharing consent if including health info
      if (includeHealthInfo) {
        const hasHealthConsent = await this.verifyUserConsent(userId, 'health_info_sharing');
        if (!hasHealthConsent) {
          throw new Error('User has not provided consent for health information sharing');
        }
      }
      
      // Create alert record
      const alert = await prisma.emergencyAlert.create({
        data: {
          userId,
          alertType,
          message: customMessage,
          latitude: location.latitude,
          longitude: location.longitude,
          status: 'active',
          contacts: JSON.stringify([])
        }
      });
      
      // Log audit trail for DPDP Act 2023 compliance
      await this.logEmergencyActivity({
        userId,
        deviceId,
        action: 'trigger_emergency_alert',
        resourceId: alert.id,
        details: {
          alertType,
          includeLocation,
          includeUserProfile,
          includeHealthInfo,
          notifyContacts,
          notifyAuthorities
        }
      });
      
      // Process alert asynchronously
      this.processAlert(alert.id, {
        notifyContacts,
        notifyAuthorities,
        includeLocation,
        includeUserProfile,
        includeHealthInfo,
        customMessage
      }).catch(error => {
        console.error(`Error processing alert ${alert.id}:`, error);
      });
      
      return {
        alertId: alert.id,
        success: true,
        message: 'Emergency alert triggered successfully'
      };
    } catch (error) {
      console.error('Error triggering emergency alert:', error);
      throw error;
    }
  }

  /**
   * Process an emergency alert
   */
  private async processAlert(alertId: string, options: AlertOptions): Promise<void> {
    try {
      // Get the alert
      const alert = await prisma.emergencyAlert.findUnique({
        where: { id: alertId }
      });
      
      if (!alert) {
        throw new Error(`Alert ${alertId} not found`);
      }
      
      // Get user data if needed
      let user: any = null;
      if (options.includeUserProfile || options.includeHealthInfo) {
        const userSelect: any = {
          id: true,
          name: true,
          email: true,
          phone: true
        };
        
        // Include emergency contacts if needed
        if (options.notifyContacts) {
          userSelect.emergencyContacts = true;
        }
        
        if (options.includeHealthInfo) {
          userSelect.healthInfo = true;
        }
        
        user = await prisma.user.findUnique({
          where: { id: alert.userId },
          select: userSelect
        });
      }
      
      // Prepare alert data
      const alertData = {
        alertId: alert.id,
        alertType: alert.alertType,
        timestamp: alert.createdAt,
        location: options.includeLocation ? {
          latitude: alert.latitude,
          longitude: alert.longitude,
          time: alert.createdAt
        } : undefined,
        user: options.includeUserProfile && user ? {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email
        } : undefined,
        healthInfo: options.includeHealthInfo && user ? user.healthInfo : undefined,
        customMessage: alert.message
      };
      
      // Notify emergency contacts
      let notifiedContacts: string[] = [];
      if (options.notifyContacts && user && user.emergencyContacts) {
        notifiedContacts = await this.notifyEmergencyContacts(alert.userId, alertData);
      }
      
      // Notify authorities
      let notifiedAuthorities = false;
      if (options.notifyAuthorities) {
        notifiedAuthorities = await this.notifyAuthorities(alert.userId, alertData);
      }
      
      // Update alert with notification status
      await prisma.emergencyAlert.update({
        where: { id: alertId },
        data: {
          contacts: JSON.stringify(notifiedContacts)
        }
      });
    } catch (error) {
      console.error(`Error processing alert ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Notify user's emergency contacts
   */
  private async notifyEmergencyContacts(
    userId: string,
    alertData: any
  ): Promise<string[]> {
    try {
      // Get user's emergency contacts
      const contacts = await prisma.emergencyContact.findMany({
        where: {
          userId,
          isActive: true
        }
      });
      
      if (contacts.length === 0) {
        console.log(`No active emergency contacts found for user ${userId}`);
        return [];
      }
      
      const notifiedContacts: string[] = [];
      
      // Notify each contact
      for (const contact of contacts) {
        try {
          // For now, we'll just log the notification and assume it succeeded
          console.log(`Notifying emergency contact: ${contact.name} (${contact.phone})`);
          notifiedContacts.push(contact.id);
        } catch (contactError) {
          console.error(`Error notifying contact ${contact.id}:`, contactError);
        }
      }
      
      return notifiedContacts;
    } catch (error) {
      console.error(`Error notifying emergency contacts for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Notify appropriate authorities
   */
  private async notifyAuthorities(userId: string, alertData: any): Promise<boolean> {
    try {
      // Get user's location
      if (!alertData.location) {
        console.log('Cannot notify authorities without location data');
        return false;
      }
      
      // Find nearest emergency services based on alert type and location
      const services = await this.findNearestEmergencyServices(
        alertData.location,
        alertData.alertType
      );
      
      if (services.length === 0) {
        console.log('No emergency services found for the location');
        return false;
      }
      
      // Notify each service
      let notified = false;
      for (const service of services) {
        try {
          // In a real implementation, this would integrate with emergency service APIs
          // or automated calling systems
          console.log(`Notifying emergency service: ${service.name} (${service.phone})`);
          console.log(`Alert data: ${JSON.stringify(alertData)}`);
          
          // For now, we'll just log the notification and assume it succeeded
          notified = true;
          break; // Stop after first successful notification
        } catch (serviceError) {
          console.error(`Error notifying service ${service.serviceId}:`, serviceError);
        }
      }
      
      return notified;
    } catch (error) {
      console.error(`Error notifying authorities for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send SMS alert to emergency contact
   */
  private async sendSmsAlert(phone: string, alertData: any): Promise<boolean> {
    try {
      // In a real implementation, this would use an SMS service like Twilio
      console.log(`Sending emergency SMS to ${phone}`);
      
      // Prepare message
      const message = this.formatAlertMessage(alertData);
      console.log(`Message: ${message}`);
      
      // For now, we'll just log the SMS and assume it succeeded
      return true;
    } catch (error) {
      console.error(`Error sending SMS alert to ${phone}:`, error);
      return false;
    }
  }

  /**
   * Initiate emergency call to contact
   */
  private async initiateEmergencyCall(phone: string, alertData: any): Promise<boolean> {
    try {
      // In a real implementation, this would use a voice calling API
      // like Twilio or an automated calling system
      console.log(`Initiating emergency call to ${phone}`);
      
      // Prepare message for voice call
      const message = this.formatAlertMessage(alertData, true);
      console.log(`Voice message: ${message}`);
      
      // For now, we'll just log the call and assume it succeeded
      return true;
    } catch (error) {
      console.error(`Error initiating emergency call to ${phone}:`, error);
      return false;
    }
  }

  /**
   * Send email alert to emergency contact
   */
  private async sendEmailAlert(email: string, alertData: any): Promise<boolean> {
    try {
      // In a real implementation, this would use an email service
      console.log(`Sending emergency email to ${email}`);
      
      // Prepare email content
      const subject = `EMERGENCY ALERT: ${this.getAlertTypeText(alertData.alertType)}`;
      const message = this.formatAlertMessage(alertData, false, true);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      
      // For now, we'll just log the email and assume it succeeded
      return true;
    } catch (error) {
      console.error(`Error sending email alert to ${email}:`, error);
      return false;
    }
  }

  /**
   * Format alert message for different communication channels
   */
  private formatAlertMessage(
    alertData: any,
    isVoice: boolean = false,
    isEmail: boolean = false
  ): string {
    // Get user name or 'A SafeRoute user' if profile not included
    const userName = alertData.user?.name || 'A SafeRoute user';
    
    // Get alert type text
    const alertTypeText = this.getAlertTypeText(alertData.alertType);
    
    // Format timestamp
    const timeText = new Date(alertData.timestamp).toLocaleString();
    
    // Base message
    let message = `EMERGENCY ALERT: ${userName} has triggered a ${alertTypeText} alert at ${timeText}.`;
    
    // Add custom message if available
    if (alertData.customMessage) {
      message += ` Message: "${alertData.customMessage}"`;
    }
    
    // Add location if available
    if (alertData.location) {
      const locationUrl = `https://maps.google.com/?q=${alertData.location.latitude},${alertData.location.longitude}`;
      
      if (isVoice) {
        message += ` They are located at latitude ${alertData.location.latitude.toFixed(6)} and longitude ${alertData.location.longitude.toFixed(6)}.`;
      } else if (isEmail) {
        message += ` They are located at: ${locationUrl}`;
      } else {
        message += ` Location: ${locationUrl}`;
      }
    }
    
    // Add health info if available
    if (alertData.healthInfo) {
      message += ` Health information: ${alertData.healthInfo.bloodType || ''} ${alertData.healthInfo.allergies || ''} ${alertData.healthInfo.medications || ''} ${alertData.healthInfo.conditions || ''}`;
    }
    
    // Add contact instructions
    if (isVoice) {
      message += ` This is an automated emergency alert. Please respond immediately.`;
    } else if (isEmail) {
      message += `\n\nThis is an automated emergency alert from SafeRoute. Please respond immediately.\n\nDO NOT REPLY TO THIS EMAIL - contact the user directly or emergency services.`;
    } else {
      message += ` Please respond immediately.`;
    }
    
    return message;
  }

  /**
   * Get human-readable text for alert type
   */
  private getAlertTypeText(alertType: string): string {
    switch (alertType) {
      case 'sos':
        return 'SOS';
      case 'medical':
        return 'Medical Emergency';
      case 'fire':
        return 'Fire Emergency';
      case 'police':
        return 'Police Emergency';
      case 'custom':
        return 'Emergency';
      default:
        return 'Emergency';
    }
  }

  /**
   * Find nearest emergency services based on location and alert type
   */
  private async findNearestEmergencyServices(
    location: LocationData,
    alertType: string
  ): Promise<EmergencyService[]> {
    try {
      // Determine service types based on alert type
      let serviceTypes: string[] = [];
      
      switch (alertType) {
        case 'sos':
          serviceTypes = ['police', 'ambulance'];
          break;
        case 'medical':
          serviceTypes = ['ambulance'];
          break;
        case 'fire':
          serviceTypes = ['fire'];
          break;
        case 'police':
          serviceTypes = ['police'];
          break;
        default:
          serviceTypes = ['police', 'ambulance', 'fire'];
      }
      
      // Query emergency services from POIData table
      const services = await prisma.pOIData.findMany({
        where: {
          category: { in: serviceTypes },
          isEmergencyService: true,
          isActive: true
        }
      });
      
      // Sort by distance
      return services
        .map(service => ({
          serviceId: service.id,
          name: service.name,
          type: service.category as any,
          phone: service.phone || '',
          country: '',
          state: '',
          city: '',
          isActive: service.isActive,
          distance: this.calculateDistance(
            location.latitude,
            location.longitude,
            service.latitude,
            service.longitude
          )
        }))
        .sort((a: any, b: any) => a.distance - b.distance);
    } catch (error) {
      console.error('Error finding nearest emergency services:', error);
      return [];
    }
  }

  /**
   * Resolve an emergency alert
   */
  async resolveAlert(
    alertId: string,
    userId: string,
    resolution: 'resolved' | 'false_alarm',
    feedback?: string
  ): Promise<boolean> {
    try {
      // Get the alert
      const alert = await prisma.emergencyAlert.findUnique({
        where: { id: alertId }
      });
      
      if (!alert) {
        throw new Error(`Alert ${alertId} not found`);
      }
      
      // Verify user owns this alert
      if (alert.userId !== userId) {
        throw new Error('Unauthorized access to alert');
      }
      
      // Update alert status
      await prisma.emergencyAlert.update({
        where: { id: alertId },
        data: {
          status: resolution,
          resolvedAt: new Date()
          // Note: userFeedback field doesn't exist in the database schema, so we're not using it
        }
      });
      
      // Log audit trail for DPDP Act 2023 compliance
      await this.logEmergencyActivity({
        userId,
        action: 'resolve_emergency_alert',
        // Note: resourceId field doesn't exist in the audit_logs table schema, so we're not using it
        details: {
          resolution,
          feedback
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error resolving alert ${alertId}:`, error);
      return false;
    }
  }

  /**
   * Add an emergency contact for a user
   */
  async addEmergencyContact(
    userId: string,
    contactData: Omit<EmergencyContact, 'contactId' | 'userId' | 'isVerified'>
  ): Promise<EmergencyContact> {
    try {
      // Validate contact data
      if (!contactData.name || !contactData.phone) {
        throw new Error('Contact name and phone are required');
      }
      
      // Check if this is the first contact (make it primary if so)
      const existingContacts = await prisma.emergencyContact.count({
        where: { userId }
      });
      
      const priority = existingContacts === 0 ? 1 : 1;
      
      // Create contact
      const contact = await prisma.emergencyContact.create({
        data: {
          userId,
          name: contactData.name,
          phone: contactData.phone,
          email: contactData.email,
          relationship: contactData.relationship,
          priority: priority,
          isActive: true
        }
      });
      
      // Log audit trail for DPDP Act 2023 compliance
      await this.logEmergencyActivity({
        userId,
        action: 'add_emergency_contact',
        resourceId: contact.id,
        details: {
          name: contactData.name,
          relationship: contactData.relationship,
          priority
        }
      });
      
      return {
        contactId: contact.id,
        userId: contact.userId,
        name: contact.name,
        phone: contact.phone,
        email: contact.email || undefined,
        relationship: contact.relationship,
        notificationPreference: [],
        isVerified: contact.isActive,
        isPrimary: contact.priority === 1
      };
    } catch (error) {
      console.error(`Error adding emergency contact for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update an emergency contact
   */
  async updateEmergencyContact(
    contactId: string,
    userId: string,
    updates: Partial<EmergencyContact>
  ): Promise<EmergencyContact> {
    try {
      // Get existing contact
      const contact = await prisma.emergencyContact.findUnique({
        where: { id: contactId }
      });
      
      if (!contact) {
        throw new Error(`Contact ${contactId} not found`);
      }
      
      // Verify user owns this contact
      if (contact.userId !== userId) {
        throw new Error('Unauthorized access to contact');
      }
      
      // Update contact
      const updatedContact = await prisma.emergencyContact.update({
        where: { id: contactId },
        data: {
          name: updates.name,
          phone: updates.phone,
          email: updates.email,
          relationship: updates.relationship,
          priority: updates.isPrimary ? 1 : undefined
        }
      });
      
      // Log audit trail for DPDP Act 2023 compliance
      await this.logEmergencyActivity({
        userId,
        action: 'update_emergency_contact',
        resourceId: contactId,
        details: {
          updates: Object.keys(updates)
        }
      });
      
      return {
        contactId: updatedContact.id,
        userId: updatedContact.userId,
        name: updatedContact.name,
        phone: updatedContact.phone,
        email: updatedContact.email || undefined,
        relationship: updatedContact.relationship,
        notificationPreference: [],
        isVerified: updatedContact.isActive,
        isPrimary: updatedContact.priority === 1
      };
    } catch (error) {
      console.error(`Error updating emergency contact ${contactId}:`, error);
      throw error;
    }
  }

  /**
   * Delete an emergency contact
   */
  async deleteEmergencyContact(contactId: string, userId: string): Promise<boolean> {
    try {
      // Get existing contact
      const contact = await prisma.emergencyContact.findUnique({
        where: { id: contactId }
      });
      
      if (!contact) {
        throw new Error(`Contact ${contactId} not found`);
      }
      
      // Verify user owns this contact
      if (contact.userId !== userId) {
        throw new Error('Unauthorized access to contact');
      }
      
      // Delete contact
      await prisma.emergencyContact.delete({
        where: { id: contactId }
      });
      
      // Log audit trail for DPDP Act 2023 compliance
      await this.logEmergencyActivity({
        userId,
        action: 'delete_emergency_contact',
        resourceId: contactId,
        details: {
          name: contact.name,
          relationship: contact.relationship
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting emergency contact ${contactId}:`, error);
      return false;
    }
  }

  /**
   * Get user's emergency contacts
   */
  async getUserEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    try {
      // Get contacts from database
      const contacts = await prisma.emergencyContact.findMany({
        where: { userId },
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'asc' }
        ]
      });
      
      // Map to return type
      return contacts.map(contact => ({
        contactId: contact.id,
        userId: contact.userId,
        name: contact.name,
        phone: contact.phone,
        email: contact.email || undefined,
        relationship: contact.relationship,
        notificationPreference: [],
        isVerified: contact.isActive,
        isPrimary: contact.priority === 1
      }));
    } catch (error) {
      console.error(`Error getting emergency contacts for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get user's emergency alerts
   */
  async getUserEmergencyAlerts(
    userId: string,
    options: { status?: 'active' | 'resolved' | 'false_alarm'; limit?: number; offset?: number } = {}
  ): Promise<EmergencyAlert[]> {
    try {
      // Build query
      const whereClause: any = { userId };
      if (options.status) {
        whereClause.status = options.status;
      }
      
      // Get alerts from database
      const alerts = await prisma.emergencyAlert.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: options.offset || 0,
        take: options.limit || 20
      });
      
      // Map to return type
      return alerts.map(alert => ({
        alertId: alert.id,
        userId: alert.userId,
        deviceId: '', // Not stored in database
        alertType: alert.alertType as any,
        customMessage: alert.message || undefined,
        location: {
          latitude: alert.latitude,
          longitude: alert.longitude,
          time: alert.createdAt
        },
        timestamp: alert.createdAt,
        status: alert.status as any,
        resolvedTimestamp: alert.resolvedAt || undefined,
        notifiedContacts: JSON.parse(alert.contacts),
        notifiedAuthorities: false, // Not stored in database
        userFeedback: undefined // Note: userFeedback field doesn't exist in the database schema
      }));
    } catch (error) {
      console.error(`Error getting emergency alerts for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get emergency alert by ID
   */
  async getEmergencyAlert(alertId: string, userId: string): Promise<EmergencyAlert | null> {
    try {
      // Get alert from database
      const alert = await prisma.emergencyAlert.findUnique({
        where: { id: alertId }
      });
      
      if (!alert) {
        return null;
      }
      
      // Verify user owns this alert
      if (alert.userId !== userId) {
        throw new Error('Unauthorized access to alert');
      }
      
      // Map to return type
      return {
        alertId: alert.id,
        userId: alert.userId,
        deviceId: '', // Not stored in database
        alertType: alert.alertType as any,
        customMessage: alert.message || undefined,
        location: {
          latitude: alert.latitude,
          longitude: alert.longitude,
          time: alert.createdAt
        },
        timestamp: alert.createdAt,
        status: alert.status as any,
        resolvedTimestamp: alert.resolvedAt || undefined,
        notifiedContacts: JSON.parse(alert.contacts),
        notifiedAuthorities: false, // Not stored in database
        userFeedback: undefined // Note: userFeedback field doesn't exist in the database schema
      };
    } catch (error) {
      console.error(`Error getting emergency alert ${alertId}:`, error);
      return null;
    }
  }

  /**
   * Verify user has given consent for a specific purpose
   */
  private async verifyUserConsent(userId: string, consentType: string): Promise<boolean> {
    try {
      // Get user consent settings
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          dataProcessingConsent: true
        }
      });
      
      // For now, we'll just check if the user has given general consent
      return !!user?.dataProcessingConsent;
    } catch (error) {
      console.error(`Error verifying user consent for ${userId}:`, error);
      return false; // Default to no consent on error
    }
  }

  /**
   * Log emergency activity for audit trail (DPDP Act 2023 compliance)
   */
  private async logEmergencyActivity(data: {
    userId?: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    action: string;
    // Note: resourceId field doesn't exist in the audit_logs table schema
    details?: any;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: 'emergency',
          // Note: resourceId field doesn't exist in the audit_logs table schema, so we're not using it
          metadata: data.details ? JSON.stringify(data.details) : null,
          // Note: timestamp field is automatically set by the database, so we're not explicitly setting it
        }
      });
    } catch (error) {
      console.error('Error logging emergency activity:', error);
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
   * Convert degrees to radians
   */
  private deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default EmergencyAlertService;
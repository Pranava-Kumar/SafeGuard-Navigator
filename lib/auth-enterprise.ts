/**
 * Enterprise Authentication Utilities
 * DPDP Act 2023 Compliant Authentication System
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db, redis } from './db-enterprise';
import { User, UserSession } from '@prisma/client';

// Type definitions
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'pedestrian' | 'two_wheeler' | 'cyclist' | 'public_transport';
  dataProcessingConsent: boolean;
  locationSharingLevel: 'precise' | 'coarse' | 'city_only';
  language?: string;
}

export interface ConsentData {
  dataProcessingConsent: boolean;
  locationSharingLevel: string;
  crowdsourcingParticipation: boolean;
  personalizedRecommendations: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  consentVersion: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  sessionTimeout: number; // hours
  refreshTokenExpiry: number; // days
}

class EnterpriseAuth {
  private static readonly SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
  private static readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  private static readonly SECURITY_CONFIG: SecurityConfig = {
    maxLoginAttempts: 5,
    lockoutDuration: 30, // minutes
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    sessionTimeout: 24, // hours
    refreshTokenExpiry: 7 // days
  };

  /**
   * Hash password with salt
   */
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  public static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   */
  public static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < this.SECURITY_CONFIG.passwordMinLength) {
      errors.push(`Password must be at least ${this.SECURITY_CONFIG.passwordMinLength} characters long`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.SECURITY_CONFIG.passwordRequireSpecial && !/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate JWT tokens
   */
  public static async generateTokens(
    user: User,
    deviceId?: string,
    ipAddress?: string
  ): Promise<AuthTokens> {
    // Create session
    const session = await db.userSession.create({
      data: {
        userId: user.id,
        sessionToken: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        deviceId: deviceId || 'unknown',
        ipAddress: ipAddress || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true
      }
    });

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN as string,
      issuer: 'saferoute-auth',
      audience: 'saferoute-app'
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { sessionId: session.id, userId: user.id },
      this.JWT_REFRESH_SECRET,
      {
        expiresIn: this.JWT_REFRESH_EXPIRES_IN as string,
        issuer: 'saferoute-auth',
        audience: 'saferoute-app'
      } as jwt.SignOptions
    );

    // Cache session in Redis
    await redis().setex(
      `session:${session.id}`,
      24 * 60 * 60, // 24 hours
      JSON.stringify({ userId: user.id, sessionId: session.id, isActive: true })
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
      tokenType: 'Bearer'
    };
  }

  /**
   * Verify and decode JWT token
   */
  public static async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'saferoute-auth',
        audience: 'saferoute-app'
      }) as TokenPayload;

      // Check if session is still active
      const cachedSession = await redis().get(`session:${decoded.sessionId}`);
      if (!cachedSession) {
        return null;
      }

      const session = JSON.parse(cachedSession);
      if (!session.isActive) {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  public static async refreshToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as {
        sessionId: string;
        userId: string;
      };

      // Get session from database
      const session = await db.userSession.findUnique({
        where: { id: decoded.sessionId },
        include: { user: true }
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return null;
      }

      // Generate new tokens
      return this.generateTokens(
        session.user, 
        session.deviceId || undefined, 
        session.ipAddress || undefined
      );
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  /**
   * Register new user with DPDP compliance
   */
  public static async register(
    data: RegisterRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    // Validate email
    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate password
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Validate DPDP consent
    if (!data.dataProcessingConsent) {
      throw new Error('Data processing consent is required under DPDP Act 2023');
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user with DPDP compliance
    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        userType: data.userType,
        language: data.language || 'en',
        dataProcessingConsent: data.dataProcessingConsent,
        consentDate: new Date(),
        consentVersion: '1.0',
        locationSharingLevel: data.locationSharingLevel,
        dataRetentionExpiry: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
        crowdsourcingParticipation: true,
        personalizedRecommendations: true,
        analyticsConsent: false,
        marketingConsent: false
      }
    });

    // Record consent history
    await db.consentHistory.create({
      data: {
        userId: user.id,
        consentType: 'data_processing',
        consentVersion: '1.0',
        granted: true,
        grantedAt: new Date(),
        ipAddress,
        userAgent
      }
    });

    // Initialize reputation score
    await db.reputationScore.create({
      data: {
        userId: user.id,
        trustLevel: 0.5, // Default Wilson score
        communityStanding: 'new'
      }
    });

    // Generate authentication tokens
    const tokens = await this.generateTokens(user, undefined, ipAddress);

    // Log registration
    await this.logAuditEvent(user.id, 'user_registration', 'user', ipAddress, userAgent);

    return { user, tokens };
  }

  /**
   * Authenticate user login
   */
  public static async login(
    data: LoginRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await db.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const unlockTime = user.lockedUntil.toLocaleString();
      throw new Error(`Account is locked until ${unlockTime}`);
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(data.password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      const attempts = user.loginAttempts + 1;
      const shouldLock = attempts >= this.SECURITY_CONFIG.maxLoginAttempts;

      await db.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + this.SECURITY_CONFIG.lockoutDuration * 60 * 1000)
            : null
        }
      });

      if (shouldLock) {
        throw new Error('Account has been locked due to too many failed login attempts');
      }

      throw new Error('Invalid email or password');
    }

    // Reset login attempts on successful login
    await db.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    });

    // Generate tokens
    const tokens = await this.generateTokens(user, data.deviceId, ipAddress);

    // Log successful login
    await this.logAuditEvent(user.id, 'user_login', 'user', ipAddress, userAgent);

    return { user, tokens };
  }

  /**
   * Logout user and invalidate session
   */
  public static async logout(sessionId: string): Promise<void> {
    // Invalidate session in database
    await db.userSession.update({
      where: { id: sessionId },
      data: { isActive: false }
    });

    // Remove from Redis cache
    await redis().del(`session:${sessionId}`);
  }

  /**
   * Update user consent (DPDP Act compliance)
   */
  public static async updateConsent(
    userId: string,
    consentData: Partial<ConsentData>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Update user consent settings
    await db.user.update({
      where: { id: userId },
      data: {
        dataProcessingConsent: consentData.dataProcessingConsent,
        locationSharingLevel: consentData.locationSharingLevel,
        crowdsourcingParticipation: consentData.crowdsourcingParticipation,
        personalizedRecommendations: consentData.personalizedRecommendations,
        analyticsConsent: consentData.analyticsConsent,
        marketingConsent: consentData.marketingConsent,
        consentVersion: consentData.consentVersion || '1.0'
      }
    });

    // Record consent history for each type of consent
    const consentTypes = [
      'dataProcessingConsent',
      'locationSharingLevel',
      'crowdsourcingParticipation',
      'personalizedRecommendations',
      'analyticsConsent',
      'marketingConsent'
    ];

    for (const consentType of consentTypes) {
      if (consentData[consentType as keyof ConsentData] !== undefined) {
        await db.consentHistory.create({
          data: {
            userId,
            consentType,
            consentVersion: consentData.consentVersion || '1.0',
            granted: Boolean(consentData[consentType as keyof ConsentData]),
            grantedAt: new Date(),
            ipAddress,
            userAgent
          }
        });
      }
    }
  }

  /**
   * Log audit events for compliance
   */
  public static async logAuditEvent(
    userId: string,
    action: string,
    resource: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any
  ): Promise<void> {
    await db.auditLog.create({
      data: {
        userId,
        action,
        resource,
        ...(ipAddress && { ipAddress }),
        ...(userAgent && { userAgent }),
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  }

  /**
   * Check if user has required permission for resource
   */
  public static hasPermission(
    userRole: string,
    resource: string,
    action: string
  ): boolean {
    const rolePermissions: Record<string, Record<string, string[]>> = {
      user: {
        routes: ['read', 'create'],
        'safety-reports': ['read', 'create'],
        'emergency-services': ['read', 'create'],
        profile: ['read', 'update']
      },
      premium: {
        routes: ['read', 'create'],
        'safety-reports': ['read', 'create'],
        'emergency-services': ['read', 'create'],
        analytics: ['read'],
        'offline-maps': ['read', 'create'],
        'real-time-alerts': ['read'],
        profile: ['read', 'update']
      },
      trusted_reporter: {
        reports: ['read', 'create', 'moderate'],
        'community-moderation': ['read', 'moderate'],
        verification: ['read', 'create']
      },
      civic_partner: {
        'municipal-data': ['read', 'create', 'update'],
        'infrastructure-analytics': ['read', 'export'],
        'civic-reports': ['read', 'create', 'update'],
        'public-dashboard': ['read']
      },
      admin: {
        '*': ['create', 'read', 'update', 'delete', 'moderate', 'export']
      },
      super_admin: {
        '*': ['create', 'read', 'update', 'delete', 'moderate', 'export'],
        'system-config': ['create', 'read', 'update', 'delete'],
        'user-management': ['create', 'read', 'update', 'delete']
      }
    };

    const permissions = rolePermissions[userRole];
    if (!permissions) return false;

    // Check wildcard permission
    if (permissions['*'] && permissions['*'].includes(action)) {
      return true;
    }

    // Check specific resource permission
    if (permissions[resource] && permissions[resource].includes(action)) {
      return true;
    }

    return false;
  }

  /**
   * Middleware for authentication
   */
  public static async authMiddleware(
    request: NextRequest
  ): Promise<{ user: User | null; error?: string }> {
    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null, error: 'Missing or invalid authorization header' };
      }

      const token = authHeader.substring(7);
      const payload = await this.verifyToken(token);

      if (!payload) {
        return { user: null, error: 'Invalid or expired token' };
      }

      const user = await db.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user) {
        return { user: null, error: 'User not found' };
      }

      return { user };
    } catch (error) {
      console.error('Auth middleware error:', error);
      return { user: null, error: 'Authentication failed' };
    }
  }
}

export default EnterpriseAuth;
export { EnterpriseAuth };
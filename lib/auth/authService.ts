import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType?: string;
  language?: string;
  // DPDP Act 2023 compliance fields
  dataProcessingConsent: boolean;
  locationSharingLevel?: string;
  crowdsourcingParticipation?: boolean;
  personalizedRecommendations?: boolean;
  analyticsConsent?: boolean;
  marketingConsent?: boolean;
  // Device information
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: Partial<User>;
  token?: string;
  refreshToken?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface ConsentUpdateData {
  userId: string;
  consentType: string;
  granted: boolean;
  consentVersion: string;
  ipAddress?: string;
  userAgent?: string;
}

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'];
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
const ACCOUNT_LOCKOUT_TIME = parseInt(process.env.ACCOUNT_LOCKOUT_TIME || '15', 10); // minutes

// Authentication Service
class AuthService {
  /**
   * Register a new user with DPDP Act 2023 compliance
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists',
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

      // Create user with DPDP Act 2023 compliance fields
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          userType: data.userType || 'pedestrian',
          language: data.language || 'en',
          // DPDP Act 2023 compliance
          dataProcessingConsent: data.dataProcessingConsent,
          consentDate: new Date(),
          dataRetentionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          locationSharingLevel: data.locationSharingLevel || 'coarse',
          crowdsourcingParticipation: data.crowdsourcingParticipation ?? true,
          personalizedRecommendations: data.personalizedRecommendations ?? true,
          analyticsConsent: data.analyticsConsent ?? false,
          marketingConsent: data.marketingConsent ?? false,
          consentVersion: '1.0',
        },
      });

      // Create default safety preferences
      await prisma.safetyPreference.create({
        data: {
          userId: user.id,
        },
      });

      // Create default privacy settings
      await prisma.privacySettings.create({
        data: {
          userId: user.id,
          dataProcessingConsent: data.dataProcessingConsent,
          locationSharingLevel: data.locationSharingLevel || 'coarse',
          crowdsourcingParticipation: data.crowdsourcingParticipation ?? true,
          personalizedRecommendations: data.personalizedRecommendations ?? true,
          analyticsConsent: data.analyticsConsent ?? false,
          marketingConsent: data.marketingConsent ?? false,
        },
      });

      // Create reputation score
      await prisma.reputationScore.create({
        data: {
          userId: user.id,
          trustLevel: 0.5,
          communityStanding: 'new',
        },
      });

      // Record consent history
      await prisma.consentHistory.create({
        data: {
          userId: user.id,
          consentType: 'data_processing',
          consentVersion: '1.0',
          granted: data.dataProcessingConsent,
          grantedAt: new Date(),
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'user_registration',
          resource: 'user',
          metadata: JSON.stringify({
            email: data.email,
            userType: data.userType || 'pedestrian',
            consentGiven: data.dataProcessingConsent,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
          }),
        },
      });

      // Generate tokens
      const { token, refreshToken } = this.generateTokens(user);

      // Create user session
      await this.createUserSession({
        userId: user.id,
        token,
        refreshToken,
        deviceId: data.deviceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      // Return success with user data (excluding sensitive fields)
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        message: 'User registered successfully',
        user: userWithoutPassword,
        token,
        refreshToken,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.',
      };
    }
  }

  /**
   * Login user with security measures
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil(
          (user.lockedUntil.getTime() - Date.now()) / (60 * 1000)
        );
        return {
          success: false,
          message: `Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`,
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

      if (!isPasswordValid) {
        // Increment login attempts
        const loginAttempts = user.loginAttempts + 1;
        let lockedUntil = null;

        // Lock account if max attempts reached
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          lockedUntil = new Date(Date.now() + ACCOUNT_LOCKOUT_TIME * 60 * 1000);
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts,
            lockedUntil,
          },
        });

        // Create audit log for failed login
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'login_failed',
            resource: 'user',
            metadata: JSON.stringify({
              attempts: loginAttempts,
              locked: lockedUntil !== null,
              ipAddress: credentials.ipAddress,
              userAgent: credentials.userAgent,
            }),
          },
        });

        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Reset login attempts on successful login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });

      // Generate tokens
      const { token, refreshToken } = this.generateTokens(user);

      // Create user session
      await this.createUserSession({
        userId: user.id,
        token,
        refreshToken,
        deviceId: credentials.deviceId,
        ipAddress: credentials.ipAddress,
        userAgent: credentials.userAgent,
      });

      // Create audit log for successful login
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'login_success',
          resource: 'user',
          metadata: JSON.stringify({
            ipAddress: credentials.ipAddress,
            userAgent: credentials.userAgent,
          }),
        },
      });

      // Return success with user data (excluding sensitive fields)
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
        token,
        refreshToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.',
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload;

      // Find user session by refresh token
      const session = await prisma.userSession.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return {
          success: false,
          message: 'Invalid or expired refresh token',
        };
      }

      // Generate new tokens
      const newTokens = this.generateTokens(session.user);

      // Update session with new tokens
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          sessionToken: newTokens.token,
          refreshToken: newTokens.refreshToken,
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Return success with new tokens
      const { password, ...userWithoutPassword } = session.user;
      return {
        success: true,
        message: 'Token refreshed successfully',
        user: userWithoutPassword,
        token: newTokens.token,
        refreshToken: newTokens.refreshToken,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Failed to refresh token',
      };
    }
  }

  /**
   * Logout user and invalidate session
   */
  async logout(refreshToken: string, options: { 
    allDevices?: boolean; 
    ipAddress?: string; 
    userAgent?: string;
    userId?: string;
  }): Promise<AuthResult> {
    try {
      // Find session by refresh token
      const session = await prisma.userSession.findUnique({
        where: { refreshToken },
      });

      if (!session) {
        return {
          success: false,
          message: 'Invalid session',
        };
      }

      // If logging out all devices or if userId provided, invalidate all sessions
      if (options.allDevices || options.userId) {
        const userId = options.userId || session.userId;
        await prisma.userSession.updateMany({
          where: {
            userId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });

        // Create audit log for logout all devices
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'logout_all_devices',
            resource: 'user',
            metadata: JSON.stringify({
              ipAddress: options.ipAddress,
              userAgent: options.userAgent,
            }),
          },
        });
      } else {
        // Invalidate specific session
        await prisma.userSession.update({
          where: { refreshToken },
          data: {
            isActive: false,
          },
        });

        // Create audit log for logout
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: 'logout',
            resource: 'user',
            metadata: JSON.stringify({
              ipAddress: options.ipAddress,
              userAgent: options.userAgent,
            }),
          },
        });
      }

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed',
      };
    }
  }

  /**
   * Update user consent (DPDP Act 2023 compliance)
   */
  async updateConsent(data: ConsentUpdateData): Promise<AuthResult> {
    try {
      // Update user consent based on type
      const updateData: any = {};
      switch (data.consentType) {
        case 'data_processing':
          updateData.dataProcessingConsent = data.granted;
          break;
        case 'location_sharing':
          updateData.locationSharingLevel = data.granted ? 'precise' : 'city_only';
          break;
        case 'crowdsourcing':
          updateData.crowdsourcingParticipation = data.granted;
          break;
        case 'personalized_recommendations':
          updateData.personalizedRecommendations = data.granted;
          break;
        case 'analytics':
          updateData.analyticsConsent = data.granted;
          break;
        case 'marketing':
          updateData.marketingConsent = data.granted;
          break;
        default:
          return {
            success: false,
            message: 'Invalid consent type',
          };
      }

      // Update user consent
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          ...updateData,
          consentDate: new Date(),
          consentVersion: data.consentVersion,
        },
      });

      // Update privacy settings
      await prisma.privacySettings.update({
        where: { userId: data.userId },
        data: updateData,
      });

      // Record consent history
      await prisma.consentHistory.create({
        data: {
          userId: data.userId,
          consentType: data.consentType,
          consentVersion: data.consentVersion,
          granted: data.granted,
          grantedAt: new Date(),
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: 'consent_update',
          resource: 'privacy_settings',
          metadata: JSON.stringify({
            consentType: data.consentType,
            granted: data.granted,
            version: data.consentVersion,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
          }),
        },
      });

      return {
        success: true,
        message: 'Consent updated successfully',
      };
    } catch (error) {
      console.error('Consent update error:', error);
      return {
        success: false,
        message: 'Failed to update consent',
      };
    }
  }

  /**
   * Request data export (DPDP Act 2023 compliance)
   */
  async requestDataExport(userId: string, requestType: string): Promise<AuthResult> {
    try {
      // Create data export request
      await prisma.dataExport.create({
        data: {
          userId,
          requestType,
          status: 'pending',
          dataTypes: JSON.stringify(['profile', 'preferences', 'reports', 'routes']),
          requestedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'data_export_request',
          resource: 'user_data',
          metadata: JSON.stringify({
            requestType,
          }),
        },
      });

      return {
        success: true,
        message: 'Data export request submitted successfully',
      };
    } catch (error) {
      console.error('Data export request error:', error);
      return {
        success: false,
        message: 'Failed to request data export',
      };
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: User): { token: string; refreshToken: string } {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokenOptions: SignOptions = {
      expiresIn: JWT_EXPIRES_IN,
    };

    const refreshTokenOptions: SignOptions = {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    };

    const token = jwt.sign(payload, JWT_SECRET, tokenOptions);
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, refreshTokenOptions);

    return { token, refreshToken };
  }

  /**
   * Create user session
   */
  private async createUserSession({
    userId,
    token,
    refreshToken,
    deviceId,
    ipAddress,
    userAgent,
  }: {
    userId: string;
    token: string;
    refreshToken: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.userSession.create({
      data: {
        userId,
        sessionToken: token,
        refreshToken,
        deviceId,
        ipAddress,
        userAgent,
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();
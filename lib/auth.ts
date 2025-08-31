import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { z } from 'zod';

// Environment variables validation
const JWT_SECRET = process.env.JWT_SECRET || 'saferoute-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = 12;

// Validation schemas
export const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  phone: z.string().optional(),
  userType: z.enum(['pedestrian', 'two_wheeler', 'cyclist', 'public_transport']).default('pedestrian'),
  language: z.enum(['en', 'ta']).default('en'),
  dataProcessingConsent: z.boolean().refine(val => val === true, 'Data processing consent is required'),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;

// Enhanced User type for SafeRoute
export interface SafeRouteUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  avatar?: string;
  language: string;
  userType: string;
  role: string;
  emailVerified: boolean;
  city?: string;
  state?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  user?: SafeRouteUser;
  token?: string;
  message?: string;
  errors?: Record<string, string>;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token for user
 */
export function generateToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
    if (decoded.type === 'access') {
      return { userId: decoded.userId };
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is locked out due to failed login attempts
 */
async function isAccountLocked(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { loginAttempts: true, lockedUntil: true }
  });

  if (!user) return false;

  // Check if account is currently locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return true;
  }

  // Reset lock if expired
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    await db.user.update({
      where: { id: userId },
      data: {
        loginAttempts: 0,
        lockedUntil: null
      }
    });
  }

  return false;
}

/**
 * Handle failed login attempt
 */
async function handleFailedLogin(userId: string): Promise<void> {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { loginAttempts: true }
  });

  if (!user) return;

  const newAttempts = user.loginAttempts + 1;
  const lockUntil = newAttempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_TIME) : null;

  await db.user.update({
    where: { id: userId },
    data: {
      loginAttempts: newAttempts,
      lockedUntil: lockUntil
    }
  });
}

/**
 * Reset login attempts on successful login
 */
async function resetLoginAttempts(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date()
    }
  });
}

/**
 * Register a new user
 */
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  try {
    // Validate input data
    const validatedData = RegisterSchema.parse(data);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email.toLowerCase() }
    });

    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user with enhanced profile
    const user = await db.user.create({
      data: {
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        displayName: `${validatedData.firstName} ${validatedData.lastName}`,
        phone: validatedData.phone,
        language: validatedData.language,
        userType: validatedData.userType,
        role: 'user',
        emailVerified: false, // In production, implement email verification
        dataProcessingConsent: validatedData.dataProcessingConsent,
        consentDate: new Date(),
        dataRetentionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        city: validatedData.city,
        state: validatedData.state,
      }
    });

    // Create default safety preferences
    await db.safetyPreference.create({
      data: {
        userId: user.id,
        riskTolerance: 50,
        timePreference: 'safety_first',
        preferredFactors: JSON.stringify({
          lighting: { weight: 0.30, enabled: true },
          footfall: { weight: 0.25, enabled: true },
          hazards: { weight: 0.20, enabled: true },
          proximityToHelp: { weight: 0.25, enabled: true }
        }),
        locationSharingLevel: 'coarse',
        personalizedRecommendations: true,
        analyticsConsent: false,
        crowdsourcingParticipation: true
      }
    });

    // Create default privacy settings
    await db.privacySettings.create({
      data: {
        userId: user.id,
        dataProcessingConsent: validatedData.dataProcessingConsent,
        locationSharingLevel: 'coarse',
        crowdsourcingParticipation: true,
        personalizedRecommendations: true,
        analyticsConsent: false,
        marketingConsent: false
      }
    });

    // Create reputation score
    await db.reputationScore.create({
      data: {
        userId: user.id,
        trustLevel: 0.5,
        communityStanding: 'new'
      }
    });

    // Generate token
    const token = generateToken(user.id);

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'user_registration',
        resource: 'user_account',
        metadata: JSON.stringify({ userType: user.userType, language: user.language })
      }
    });

    // Return user data (excluding sensitive information)
    const safeUser: SafeRouteUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName || undefined,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      language: user.language,
      userType: user.userType,
      role: user.role,
      emailVerified: user.emailVerified,
      city: user.city || undefined,
      state: user.state || undefined,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || undefined
    };

    return {
      success: true,
      user: safeUser,
      token,
      message: 'Account created successfully! Welcome to SafeRoute.'
    };

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        if (err.path.length > 0) {
          acc[err.path[0]] = err.message;
        }
        return acc;
      }, {} as Record<string, string>);
      
      return {
        success: false,
        message: 'Please fix the validation errors',
        errors
      };
    }

    return {
      success: false,
      message: 'Registration failed. Please try again.'
    };
  }
}

/**
 * Login user
 */
export async function loginUser(data: LoginData): Promise<AuthResponse> {
  try {
    // Validate input data
    const validatedData = LoginSchema.parse(data);

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: validatedData.email.toLowerCase() }
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Check if account is locked
    if (await isAccountLocked(user.id)) {
      return {
        success: false,
        message: 'Account temporarily locked due to failed login attempts. Please try again later.'
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password);

    if (!isValidPassword) {
      await handleFailedLogin(user.id);
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Reset login attempts and update last login
    await resetLoginAttempts(user.id);

    // Generate token
    const token = generateToken(user.id);

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'user_login',
        resource: 'user_session',
        metadata: JSON.stringify({ loginMethod: 'email_password' })
      }
    });

    // Return user data (excluding sensitive information)
    const safeUser: SafeRouteUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName || undefined,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      language: user.language,
      userType: user.userType,
      role: user.role,
      emailVerified: user.emailVerified,
      city: user.city || undefined,
      state: user.state || undefined,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || undefined
    };

    return {
      success: true,
      user: safeUser,
      token,
      message: 'Login successful! Welcome back to SafeRoute.'
    };

  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        if (err.path.length > 0) {
          acc[err.path[0]] = err.message;
        }
        return acc;
      }, {} as Record<string, string>);
      
      return {
        success: false,
        message: 'Please fix the validation errors',
        errors
      };
    }

    return {
      success: false,
      message: 'Login failed. Please try again.'
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<SafeRouteUser | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
        avatar: true,
        language: true,
        userType: true,
        role: true,
        emailVerified: true,
        city: true,
        state: true,
        createdAt: true,
        lastLoginAt: true,
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName || undefined,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      language: user.language,
      userType: user.userType,
      role: user.role,
      emailVerified: user.emailVerified,
      city: user.city || undefined,
      state: user.state || undefined,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || undefined
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Logout user (create audit log)
 */
export async function logoutUser(userId: string): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action: 'user_logout',
        resource: 'user_session',
        metadata: JSON.stringify({ logoutTime: new Date().toISOString() })
      }
    });
  } catch (error) {
    console.error('Logout audit error:', error);
  }
}
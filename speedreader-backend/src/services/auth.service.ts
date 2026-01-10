/**
 * Authentication Service
 * Handles user registration, login, guest access, social auth, token generation/validation
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import type { RegisterInput, LoginInput, AuthTokens, JwtPayload, UserProfile, SocialAuthInput, GuestConvertInput } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short for security
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '365d'; // 1 year for mobile

const SALT_ROUNDS = 10;

// ============ EMAIL/PASSWORD AUTH ============

/**
 * Register a new user with email/password
 */
export async function register(input: RegisterInput): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    const { email, password, name } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            authMethod: 'email',
            isGuest: false,
        },
    });

    // Create initial stats
    await prisma.userStats.create({
        data: { userId: user.id },
    });

    // Generate tokens
    const tokens = await generateTokens(user.id, user.email || user.id);

    return {
        user: mapUserToProfile(user),
        tokens,
    };
}

/**
 * Login with email and password
 */
export async function login(input: LoginInput): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    const { email, password } = input;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = await generateTokens(user.id, user.email || user.id);

    return {
        user: mapUserToProfile(user),
        tokens,
    };
}

// ============ GUEST AUTH ============

/**
 * Create a guest user (no email/password required)
 */
export async function createGuestUser(): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    // Generate a guest name
    const guestNumber = Math.floor(Math.random() * 10000);
    const guestName = `Guest ${guestNumber}`;

    // Create guest user
    const user = await prisma.user.create({
        data: {
            name: guestName,
            authMethod: 'guest',
            isGuest: true,
        },
    });

    // Create initial stats
    await prisma.userStats.create({
        data: { userId: user.id },
    });

    // Generate tokens
    const tokens = await generateTokens(user.id, user.id);

    return {
        user: mapUserToProfile(user),
        tokens,
    };
}

// ============ SOCIAL AUTH ============

/**
 * Login/Register with Google
 */
export async function googleAuth(input: SocialAuthInput): Promise<{ user: UserProfile; tokens: AuthTokens; isNewUser: boolean }> {
    const { idToken, email, name, avatarUrl } = input;

    // In production, verify the idToken with Google's servers
    // For now, we trust the client-sent data (implement verification for production)

    // Check if user exists by googleId
    let user = await prisma.user.findUnique({ where: { googleId: idToken } });
    let isNewUser = false;

    if (!user) {
        // Check if email exists (user might want to link accounts)
        if (email) {
            user = await prisma.user.findUnique({ where: { email } });
        }

        if (user) {
            // Link Google to existing account
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: idToken, avatarUrl: avatarUrl || user.avatarUrl },
            });
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || 'Google User',
                    googleId: idToken,
                    avatarUrl,
                    authMethod: 'google',
                    isGuest: false,
                },
            });
            isNewUser = true;

            // Create initial stats for new user
            await prisma.userStats.create({
                data: { userId: user.id },
            });
        }
    }

    const tokens = await generateTokens(user.id, user.email || user.id);

    return {
        user: mapUserToProfile(user),
        tokens,
        isNewUser,
    };
}

/**
 * Login/Register with Apple
 */
export async function appleAuth(input: SocialAuthInput): Promise<{ user: UserProfile; tokens: AuthTokens; isNewUser: boolean }> {
    const { idToken, email, name, avatarUrl } = input;

    // In production, verify the identityToken with Apple's servers

    let user = await prisma.user.findUnique({ where: { appleId: idToken } });
    let isNewUser = false;

    if (!user) {
        if (email) {
            user = await prisma.user.findUnique({ where: { email } });
        }

        if (user) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { appleId: idToken },
            });
        } else {
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || 'Apple User',
                    appleId: idToken,
                    avatarUrl,
                    authMethod: 'apple',
                    isGuest: false,
                },
            });
            isNewUser = true;

            await prisma.userStats.create({
                data: { userId: user.id },
            });
        }
    }

    const tokens = await generateTokens(user.id, user.email || user.id);

    return {
        user: mapUserToProfile(user),
        tokens,
        isNewUser,
    };
}

// ============ GUEST CONVERSION ============

/**
 * Convert a guest account to a full account
 * Preserves all user data (books, progress, stats)
 */
export async function convertGuestToAccount(
    guestUserId: string,
    input: GuestConvertInput
): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    const guestUser = await prisma.user.findUnique({ where: { id: guestUserId } });

    if (!guestUser || !guestUser.isGuest) {
        throw new Error('User is not a guest account');
    }

    let updatedUser;

    if (input.method === 'email') {
        if (!input.email || !input.password) {
            throw new Error('Email and password are required');
        }

        // Check if email is already taken
        const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
        if (existingUser) {
            throw new Error('Email is already in use');
        }

        const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

        updatedUser = await prisma.user.update({
            where: { id: guestUserId },
            data: {
                email: input.email,
                password: hashedPassword,
                name: input.name || guestUser.name,
                authMethod: 'email',
                isGuest: false,
            },
        });
    } else if (input.method === 'google') {
        if (!input.idToken) {
            throw new Error('Google ID token is required');
        }

        updatedUser = await prisma.user.update({
            where: { id: guestUserId },
            data: {
                email: input.email,
                name: input.name || guestUser.name,
                googleId: input.idToken,
                avatarUrl: input.avatarUrl,
                authMethod: 'google',
                isGuest: false,
            },
        });
    } else if (input.method === 'apple') {
        if (!input.idToken) {
            throw new Error('Apple ID token is required');
        }

        updatedUser = await prisma.user.update({
            where: { id: guestUserId },
            data: {
                email: input.email,
                name: input.name || guestUser.name,
                appleId: input.idToken,
                avatarUrl: input.avatarUrl,
                authMethod: 'apple',
                isGuest: false,
            },
        });
    } else {
        throw new Error('Invalid conversion method');
    }

    // Clean up old tokens and generate new ones
    await prisma.refreshToken.deleteMany({ where: { userId: guestUserId } });
    const tokens = await generateTokens(updatedUser.id, updatedUser.email || updatedUser.id);

    return {
        user: mapUserToProfile(updatedUser),
        tokens,
    };
}

// ============ TOKEN MANAGEMENT ============

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
        throw new Error('Invalid refresh token');
    }

    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new Error('Refresh token expired or invalid');
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    return generateTokens(user.id, user.email || user.id);
}

/**
 * Logout - invalidate refresh token
 */
export async function logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
    });
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) return null;

    return mapUserToProfile(user);
}

// ============ HELPERS ============

/**
 * Map database user to UserProfile
 */
function mapUserToProfile(user: {
    id: string;
    email: string | null;
    name: string;
    avatarUrl: string | null;
    createdAt: Date;
    authMethod: string;
    isGuest: boolean;
}): UserProfile {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        authMethod: user.authMethod as 'email' | 'google' | 'apple' | 'guest',
        isGuest: user.isGuest,
    };
}

/**
 * Generate access and refresh tokens
 */
async function generateTokens(userId: string, identifier: string): Promise<AuthTokens> {
    const payload: JwtPayload = { userId, email: identifier };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as string,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN as string,
    } as jwt.SignOptions);

    // 1 year expiry for refresh token
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId,
            expiresAt,
        },
    });

    return { accessToken, refreshToken };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

/**
 * Authentication Service
 * Handles user authentication, registration, and token management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createLogger } from '@/utils/logger';
import { User } from '@/models/user';
import { ChatHistory } from '@/models/chat';
import { config } from '@/config';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError } from '@/utils/errorHandler';

const logger = createLogger('AuthService');

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    acceptTerms: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        subscription: {
            plan: string;
            status: string;
            tokensLimit: number;
            tokensUsed: number;
        };
        profile: {
            avatar?: string;
            timezone?: string;
            language?: string;
        };
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface ChangePasswordRequest {
    userId: string;
    currentPassword: string;
    newPassword: string;
}

export interface ResetPasswordRequest {
    email: string;
}

export interface UpdateProfileRequest {
    userId: string;
    firstName?: string;
    lastName?: string;
    profile?: {
        avatar?: string;
        timezone?: string;
        language?: string;
        preferences?: {
            theme?: 'light' | 'dark';
            defaultModel?: string;
            streamingEnabled?: boolean;
        };
    };
}

export class AuthService {
    private readonly JWT_SECRET = config.auth.jwt.secret;
    private readonly JWT_EXPIRES_IN = config.auth.jwt.expiresIn;
    private readonly JWT_REFRESH_EXPIRES_IN = config.auth.jwt.refreshExpiresIn;

    // ============================================================================
    // USER REGISTRATION & LOGIN
    // ============================================================================

    async register(request: RegisterRequest): Promise<AuthResponse> {
        try {
            logger.info('User registration attempt', {
                email: request.email,
                firstName: request.firstName
            });

            // Validate inputs
            await this.validateRegistrationData(request);

            // Check if user already exists
            const existingUser = await User.findOne({ email: request.email.toLowerCase() });
            if (existingUser) {
                throw new ConflictError('User with this email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(request.password, 12);

            // Create user
            const user = new User({
                email: request.email.toLowerCase(),
                password: hashedPassword,
                username: request.username, // Generate username from email
                role: 'user',
                status: 'active',
                subscription: {
                    plan: 'free',
                    status: 'active',
                    tokensLimit: 10000,
                    tokensUsed: 0,
                    startDate: new Date()
                },
                firstName: request.firstName.trim(),
                lastName: request.lastName.trim(),
                timezone: 'UTC',
                language: 'en',
                preferences: { // ← moved here (outside of profile)
                    theme: 'light',
                    language: 'en',
                    notifications: {
                        email: true,
                        push: true,
                        marketing: false,
                        security: true
                    },
                    chatSettings: {
                        defaultModel: 'groq-llama2-70b',
                        temperature: 0.7,
                        maxTokens: 2048,
                        enableTools: true,
                        enabledTools: []
                    }
                },
                isVerified: false,
                auth: {
                    failedLoginAttempts: 0,
                    accountLocked: false
                },
                lastLogin: new Date(),
                loginCount: 0
            });

            await user.save();

            // Initialize chat history
            await this.initializeChatHistory(user._id.toString());

            // Generate tokens
            const tokens = await this.generateTokens(user);

            logger.info('User registered successfully', {
                userId: user._id,
                email: user.email
            });

            return this.formatAuthResponse(user, tokens);
        } catch (error) {
            logger.error('Registration failed', {
                error: (error as Error).message,
                email: request.email
            });
            throw error;
        }
    }

    async login(request: LoginRequest): Promise<AuthResponse> {
        try {
            logger.info('User login attempt', { email: request.email });

            // Find user
            const user = await User.findOne({
                email: request.email.toLowerCase(),
                status: 'active'
            }).select('+password');

            if (!user) {
                throw new UnauthorizedError('Invalid email or password');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(request.password, user.password);
            if (!isPasswordValid) {
                // Update failed login attempts
                await User.findByIdAndUpdate(user._id, {
                    $inc: { 'auth.failedLoginAttempts': 1 },
                    $set: { 'auth.lastFailedLogin': new Date() }
                });

                throw new UnauthorizedError('Invalid email or password');
            }

            // Check if account is locked
            if (user.auth.failedLoginAttempts >= 5) {
                const lockUntil = user.auth.lastFailedLogin ? new Date(user.auth.lastFailedLogin) : new Date();
                lockUntil.setMinutes(lockUntil.getMinutes() + 15); // 15 minutes lockout

                if (new Date() < lockUntil) {
                    throw new UnauthorizedError('Account temporarily locked due to too many failed attempts');
                }
            }

            // Reset failed attempts on successful login
            await User.findByIdAndUpdate(user._id, {
                $unset: { 'auth.failedLoginAttempts': 1, 'auth.lastFailedLogin': 1 },
                $set: { 'auth.lastLogin': new Date() }
            });

            // Generate tokens
            const tokens = await this.generateTokens(user, request.rememberMe);

            logger.info('User logged in successfully', {
                userId: user._id,
                email: user.email
            });

            return this.formatAuthResponse(user, tokens);
        } catch (error) {
            logger.error('Login failed', {
                error: (error as Error).message,
                email: request.email
            });
            throw error;
        }
    }

    async refreshToken(request: RefreshTokenRequest): Promise<{ accessToken: string; expiresIn: number }> {
        try {
            // Verify refresh token
            const decoded = jwt.verify(request.refreshToken, this.JWT_SECRET) as any;

            if (decoded.type !== 'refresh') {
                throw new UnauthorizedError('Invalid refresh token');
            }

            // Find user
            const user = await User.findById(decoded.userId);
            if (!user || user.status !== 'active') {
                throw new UnauthorizedError('User not found or inactive');
            }

            // Generate new access token
            const accessToken = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    type: 'access'
                },
                this.JWT_SECRET,
                { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions
            );

            logger.info('Token refreshed successfully', { userId: user._id });

            return {
                accessToken,
                expiresIn: this.parseExpiration(this.JWT_EXPIRES_IN)
            };
        } catch (error) {
            logger.error('Token refresh failed', {
                error: (error as Error).message
            });
            throw new UnauthorizedError('Invalid refresh token');
        }
    }

    async logout(userId: string, _refreshToken: string): Promise<void> {
        try {
            // In a production environment, you might want to maintain a blacklist of tokens
            // For now, we'll just log the logout
            logger.info('User logged out', { userId });

            // Update last activity
            await User.findByIdAndUpdate(userId, {
                $set: { 'auth.lastActivity': new Date() }
            });
        } catch (error) {
            logger.error('Logout error', {
                error: (error as Error).message,
                userId
            });
        }
    }

    // ============================================================================
    // PASSWORD MANAGEMENT
    // ============================================================================

    async changePassword(request: ChangePasswordRequest): Promise<void> {
        try {
            logger.info('Password change attempt', { userId: request.userId });

            // Find user with password
            const user = await User.findById(request.userId).select('+password');
            if (!user) {
                throw new NotFoundError('User not found');
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(request.currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new UnauthorizedError('Current password is incorrect');
            }

            // Validate new password
            this.validatePassword(request.newPassword);

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(request.newPassword, 12);

            // Update password
            await User.findByIdAndUpdate(request.userId, {
                $set: {
                    password: hashedNewPassword,
                    'auth.passwordChangedAt': new Date()
                }
            });

            logger.info('Password changed successfully', { userId: request.userId });
        } catch (error) {
            logger.error('Password change failed', {
                error: (error as Error).message,
                userId: request.userId
            });
            throw error;
        }
    }

    async requestPasswordReset(request: ResetPasswordRequest): Promise<void> {
        try {
            logger.info('Password reset requested', { email: request.email });

            const user = await User.findOne({
                email: request.email.toLowerCase(),
                status: 'active'
            });

            if (!user) {
                // Don't reveal if email exists or not for security
                logger.info('Password reset requested for non-existent email', {
                    email: request.email
                });
                return;
            }

            // Generate reset token
            const resetToken = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    type: 'password_reset'
                },
                this.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Update user with reset token info
            await User.findByIdAndUpdate(user._id, {
                $set: {
                    'auth.passwordResetToken': resetToken,
                    'auth.passwordResetExpires': new Date(Date.now() + 3600000) // 1 hour
                }
            });

            // In a real application, you would send an email here
            logger.info('Password reset token generated', {
                userId: user._id,
                token: resetToken // Remove this in production
            });

            // TODO: Send password reset email
            // await emailService.sendPasswordResetEmail(user.email, resetToken);
        } catch (error) {
            logger.error('Password reset request failed', {
                error: (error as Error).message,
                email: request.email
            });
            throw error;
        }
    }

    // ============================================================================
    // PROFILE MANAGEMENT
    // ============================================================================

    async getProfile(userId: string): Promise<any> {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user;
    }

    async updateProfile(request: UpdateProfileRequest): Promise<any> {
        try {
            logger.info('Profile update attempt', { userId: request.userId });

            const updateData: any = {};

            if (request.firstName) {
                updateData.firstName = request.firstName.trim();
            }

            if (request.lastName) {
                updateData.lastName = request.lastName.trim();
            }

            if (request.profile) {
                if (request.profile.avatar) {
                    updateData['profile.avatar'] = request.profile.avatar;
                }
                if (request.profile.timezone) {
                    updateData['profile.timezone'] = request.profile.timezone;
                }
                if (request.profile.language) {
                    updateData['profile.language'] = request.profile.language;
                }
                if (request.profile.preferences) {
                    Object.keys(request.profile.preferences).forEach(key => {
                        updateData[`profile.preferences.${key}`] = request.profile!.preferences![key as keyof typeof request.profile.preferences];
                    });
                }
            }

            const user = await User.findByIdAndUpdate(
                request.userId,
                { $set: updateData },
                { new: true }
            );

            if (!user) {
                throw new NotFoundError('User not found');
            }

            logger.info('Profile updated successfully', { userId: request.userId });

            return user;
        } catch (error) {
            logger.error('Profile update failed', {
                error: (error as Error).message,
                userId: request.userId
            });
            throw error;
        }
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private async validateRegistrationData(data: RegisterRequest): Promise<void> {
        if (!data.email || !data.email.includes('@')) {
            throw new ValidationError('Valid email is required');
        }

        if (!data.password || data.password.length < 8) {
            throw new ValidationError('Password must be at least 8 characters long');
        }

        this.validatePassword(data.password);
        if (!data.username || data.username.trim().length < 2) {
            throw new ValidationError('User name must be at least 2 characters long');
        }

        if (!data.firstName || data.firstName.trim().length < 2) {
            throw new ValidationError('First name must be at least 2 characters long');
        }

        if (!data.lastName || data.lastName.trim().length < 2) {
            throw new ValidationError('Last name must be at least 2 characters long');
        }

        if (!data.acceptTerms) {
            throw new ValidationError('You must accept the terms and conditions');
        }
    }

    private validatePassword(password: string): void {
        if (password.length < 8) {
            throw new ValidationError('Password must be at least 8 characters long');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            throw new ValidationError('Password must contain at least one lowercase letter');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            throw new ValidationError('Password must contain at least one uppercase letter');
        }

        if (!/(?=.*\d)/.test(password)) {
            throw new ValidationError('Password must contain at least one number');
        }

        if (!/(?=.*[@$!%*?&])/.test(password)) {
            throw new ValidationError('Password must contain at least one special character');
        }
    }

    private async generateTokens(user: any, longLived = false): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }> {
        const accessToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
                type: 'access'
            },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions
        );

        const refreshToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                type: 'refresh'
            },
            this.JWT_SECRET,
            { expiresIn: longLived ? '30d' : this.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
        );

        return {
            accessToken,
            refreshToken,
            expiresIn: this.parseExpiration(this.JWT_EXPIRES_IN)
        };
    }

    private formatAuthResponse(user: any, tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }): AuthResponse {
        return {
            user: {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                subscription: {
                    plan: user.subscription.plan,
                    status: user.subscription.status,
                    tokensLimit: user.subscription.tokensLimit,
                    tokensUsed: user.subscription.tokensUsed
                },
                profile: {
                    avatar: user.profile.avatar,
                    timezone: user.profile.timezone,
                    language: user.profile.language
                }
            },
            tokens
        };
    }

    private parseExpiration(expiration: string): number {
        const unit = expiration.slice(-1);
        const value = parseInt(expiration.slice(0, -1));

        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 3600;
            case 'd': return value * 86400;
            default: return 3600; // Default 1 hour
        }
    }

    private async initializeChatHistory(userId: string): Promise<void> {
        const chatHistory = new ChatHistory({
            userId,
            conversations: [],
            totalConversations: 0,
            totalMessages: 0,
            totalTokens: 0,
            lastActivity: new Date()
        });

        await chatHistory.save();
    }
}

export const authService = new AuthService();
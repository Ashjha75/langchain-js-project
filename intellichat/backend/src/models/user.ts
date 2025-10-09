/**
 * User Model
 * MongoDB schema for user authentication and profile management
 */

import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, Permission } from '@/types';

export interface UserSchema {
    _id: Types.ObjectId;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    timezone: string;
    language?: string;
    role: UserRole;
    permissions: Permission[];
    isVerified: boolean;
    status: 'active' | 'inactive' | 'suspended';
    auth: {
        failedLoginAttempts: number;
        lastFailedLogin?: Date;
        accountLocked: boolean;
        lockUntil?: Date;
    };
    preferences: {
        theme: 'light' | 'dark' | 'auto';
        language: string;
        notifications: {
            email: boolean;
            push: boolean;
            marketing: boolean;
            security: boolean;
        };
        chatSettings: {
            defaultModel: string;
            temperature: number;
            maxTokens: number;
            enableTools: boolean;
            enabledTools: string[];
            systemPrompt?: string;
        };
    };
    subscription: {
        plan: 'free' | 'pro' | 'enterprise';
        status: 'active' | 'cancelled' | 'expired';
        tokensUsed: number;
        tokensLimit: number;
        billingCycle?: Date;
    };
    lastLogin: Date;
    loginCount: number;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    createdAt: Date;
    updatedAt: Date;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
    getPublicProfile(): any;
}

export type IUserDocument = Document & UserSchema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 255,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false // Don't include password in queries by default
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    avatar: {
        type: String,
        maxlength: 500
    },
    bio: {
        type: String,
        maxlength: 500,
        trim: true
    },
    timezone: {
        type: String,
        default: 'UTC',
        maxlength: 50
    },
    language: {
        type: String,
        default: 'en',
        maxlength: 10
    },
    role: {
        type: String,
        enum: ['user', 'premium', 'admin'],
        default: 'user'
    },
    permissions: [{
        type: String,
        enum: [
            'read:conversations',
            'write:conversations',
            'delete:conversations',
            'read:messages',
            'write:messages',
            'delete:messages',
            'read:tools',
            'execute:tools',
            'admin:users',
            'admin:system'
        ]
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    auth: {
        failedLoginAttempts: {
            type: Number,
            default: 0
        },
        lastFailedLogin: Date,
        accountLocked: {
            type: Boolean,
            default: false
        },
        lockUntil: Date
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        },
        language: {
            type: String,
            default: 'en',
            maxlength: 10
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            },
            marketing: {
                type: Boolean,
                default: false
            },
            security: {
                type: Boolean,
                default: true
            }
        },
        chatSettings: {
            defaultModel: {
                type: String,
                default: 'llama-3.1-70b-versatile'
            },
            temperature: {
                type: Number,
                default: 0.7,
                min: 0,
                max: 2
            },
            maxTokens: {
                type: Number,
                default: 2048,
                min: 1,
                max: 32000
            },
            enableTools: {
                type: Boolean,
                default: true
            },
            enabledTools: [{
                type: String
            }],
            systemPrompt: {
                type: String,
                maxlength: 2000
            }
        }
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free'
        },
        status: {
            type: String,
            enum: ['active', 'cancelled', 'expired'],
            default: 'active'
        },
        tokensUsed: {
            type: Number,
            default: 0,
            min: 0
        },
        tokensLimit: {
            type: Number,
            default: 10000, // Free tier limit
            min: 0
        },
        billingCycle: Date
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    loginCount: {
        type: Number,
        default: 0,
        min: 0
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date
}, {
    timestamps: true,
    collection: 'users'
});

// Indexes
// email already has unique: true, no need for separate index
// username already has unique: true, no need for separate index  
UserSchema.index({ role: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ 'subscription.plan': 1 });
UserSchema.index({ lastLogin: -1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Update login statistics
UserSchema.pre('save', function (next) {
    if (this.isModified('lastLogin')) {
        this.loginCount += 1;
    }
    next();
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// Instance method to get public profile (without sensitive data)
UserSchema.methods.getPublicProfile = function () {
    return {
        id: this._id,
        username: this.username,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        
        role: this.role,
        isVerified: this.isVerified,
        preferences: {
            theme: this.preferences.theme,
            language: this.preferences.language
        },
        subscription: {
            plan: this.subscription.plan,
            status: this.subscription.status
        },
        lastLogin: this.lastLogin,
        createdAt: this.createdAt
    };
};

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
    return this.firstName && this.lastName ? `${this.firstName} ${this.lastName}` : '';
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });

export const User = mongoose.model<IUserDocument>('User', UserSchema);
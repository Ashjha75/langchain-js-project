import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { CONFIG } from '@/config';
import { createLogger } from '@/utils/logger';
import { ValidationError } from '@/utils/errorHandler';

const logger = createLogger('ValidationMiddleware');

/**
 * Generic Zod Schema Validation Middleware
 * Validates request data against provided Zod schema
 */
export const validateSchema = <T>(schema: ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            let dataToValidate: any;

            switch (source) {
                case 'body':
                    dataToValidate = req.body;
                    break;
                case 'query':
                    dataToValidate = req.query;
                    break;
                case 'params':
                    dataToValidate = req.params;
                    break;
                default:
                    dataToValidate = req.body;
            }

            // Validate data against schema
            const validatedData = schema.parse(dataToValidate);

            // Replace original data with validated data
            switch (source) {
                case 'body':
                    req.body = validatedData;
                    break;
                case 'query':
                    req.query = validatedData as any;
                    break;
                case 'params':
                    req.params = validatedData as any;
                    break;
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const validationErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    value: (err as any).received || 'invalid',
                }));

                logger.warn('Validation failed', {
                    source,
                    errors: validationErrors,
                    ip: (req as any).clientIP || req.ip,
                    url: req.originalUrl,
                });

                const validationError = new ValidationError('Validation failed');
                res.status(400).json({
                    status: 'error',
                    message: validationError.message,
                    errors: validationErrors,
                    statusCode: 400,
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            logger.error('Validation middleware error', { error });
            const validationError = new ValidationError('Validation error occurred');
            res.status(400).json({
                status: 'error',
                message: validationError.message,
                statusCode: 400,
                timestamp: new Date().toISOString(),
            });
        }
    };
};

// Common Validation Schemas

/**
 * User Registration Schema
 */
export const userRegistrationSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .max(255, 'Email must be less than 255 characters'),
    password: z.string()
        .min(CONFIG.auth.passwordPolicy.minLength, `Password must be at least ${CONFIG.auth.passwordPolicy.minLength} characters`)
        .max(128, 'Password must be less than 128 characters'),
    username: z.string()
        .min(2, 'Username must be at least 2 characters')
        .max(30, 'Username must be less than 30 characters')
        .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, periods, underscores, and hyphens')
        .regex(/^[a-zA-Z]/, 'Username must start with a letter'),
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
    acceptTerms: z.boolean()
        .refine(val => val === true, 'Terms and conditions must be accepted'),
});

/**
 * User Login Schema
 */
export const userLoginSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase(),
    password: z.string()
        .min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
});

/**
 * Password Reset Request Schema
 */
export const passwordResetRequestSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase(),
});

/**
 * Password Reset Schema
 */
export const passwordResetSchema = z.object({
    token: z.string()
        .min(1, 'Reset token is required'),
    password: z.string()
        .min(CONFIG.auth.passwordPolicy.minLength, `Password must be at least ${CONFIG.auth.passwordPolicy.minLength} characters`)
        .max(128, 'Password must be less than 128 characters'),
});

/**
 * Change Password Schema
 */
export const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, 'Current password is required'),
    newPassword: z.string()
        .min(CONFIG.auth.passwordPolicy.minLength, `Password must be at least ${CONFIG.auth.passwordPolicy.minLength} characters`)
        .max(128, 'Password must be less than 128 characters'),
});

/**
 * Update Profile Schema
 */
export const updateProfileSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
        .optional(),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
        .optional(),
    preferences: z.object({
        theme: z.enum(['light', 'dark', 'auto']).optional(),
        language: z.string().max(10).optional(),
        notifications: z.object({
            email: z.boolean().optional(),
            push: z.boolean().optional(),
            sms: z.boolean().optional(),
        }).optional(),
    }).optional(),
});

/**
 * Conversation Creation Schema
 */
export const createConversationSchema = z.object({
    title: z.string()
        .max(200, 'Title must be less than 200 characters')
        .optional(),
    model: z.string()
        .min(1, 'Model is required')
        .max(50, 'Model name must be less than 50 characters'),
    systemPrompt: z.string()
        .max(2000, 'System prompt must be less than 2000 characters')
        .optional(),
    temperature: z.number()
        .min(0, 'Temperature must be between 0 and 2')
        .max(2, 'Temperature must be between 0 and 2')
        .optional()
        .default(0.7),
    maxTokens: z.number()
        .min(1, 'Max tokens must be at least 1')
        .max(32000, 'Max tokens cannot exceed 32000')
        .optional()
        .default(2048),
});

/**
 * Message Creation Schema
 */
export const createMessageSchema = z.object({
    content: z.string()
        .min(1, 'Message content is required')
        .max(10000, 'Message content must be less than 10000 characters'),
    role: z.enum(['user', 'assistant', 'system']),
    attachments: z.array(z.object({
        type: z.enum(['file', 'image', 'url']),
        content: z.string(),
        metadata: z.record(z.any()).optional(),
    })).optional().default([]),
});

/**
 * Tool Execution Schema
 */
export const toolExecutionSchema = z.object({
    toolName: z.string()
        .min(1, 'Tool name is required')
        .max(100, 'Tool name must be less than 100 characters'),
    parameters: z.record(z.any()),
    conversationId: z.string()
        .min(1, 'Conversation ID is required'),
});

/**
 * File Upload Schema
 */
export const fileUploadSchema = z.object({
    fileName: z.string()
        .min(1, 'File name is required')
        .max(255, 'File name must be less than 255 characters'),
    fileType: z.string()
        .min(1, 'File type is required')
        .max(100, 'File type must be less than 100 characters'),
    fileSize: z.number()
        .min(1, 'File size must be greater than 0')
        .max(CONFIG.upload.maxFileSize, `File size cannot exceed ${CONFIG.upload.maxFileSize} bytes`),
});

/**
 * Search Schema
 */
export const searchSchema = z.object({
    query: z.string()
        .min(1, 'Search query is required')
        .max(500, 'Search query must be less than 500 characters'),
    limit: z.number()
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .optional()
        .default(20),
    offset: z.number()
        .min(0, 'Offset cannot be negative')
        .optional()
        .default(0),
    filters: z.record(z.any()).optional(),
});

/**
 * Pagination Schema for Query Parameters
 */
export const paginationQuerySchema = z.object({
    page: z.preprocess(
        (val) => val ? parseInt(val as string, 10) : 1,
        z.number().min(1, 'Page must be greater than 0').default(1)
    ),
    limit: z.preprocess(
        (val) => val ? parseInt(val as string, 10) : 20,
        z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20)
    ),
    sort: z.string().max(50, 'Sort field must be less than 50 characters').optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Pagination Schema (Original)
 */
export const paginationSchema = z.object({
    page: z.number()
        .min(1, 'Page must be greater than 0')
        .optional()
        .default(1),
    limit: z.number()
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .optional()
        .default(20),
    sort: z.string()
        .max(50, 'Sort field must be less than 50 characters')
        .optional(),
    order: z.enum(['asc', 'desc'])
        .optional()
        .default('desc'),
});

/**
 * ID Parameter Schema
 */
export const idParamSchema = z.object({
    id: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
        .length(24, 'ID must be 24 characters'),
});

/**
 * Email Schema
 */
export const emailSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase(),
});

/**
 * UUID Schema
 */
export const uuidSchema = z.object({
    uuid: z.string()
        .uuid('Invalid UUID format'),
});

// Validation Middleware Factories

/**
 * Body Validation Middleware
 */
export const validateBody = <T>(schema: ZodSchema<T>) => validateSchema(schema, 'body');

/**
 * Query Validation Middleware
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => validateSchema(schema, 'query');

/**
 * Params Validation Middleware
 */
export const validateParams = <T>(schema: ZodSchema<T>) => validateSchema(schema, 'params');

// Common Validation Middleware

export const validateUserRegistration = validateBody(userRegistrationSchema);
export const validateUserLogin = validateBody(userLoginSchema);
export const validatePasswordResetRequest = validateBody(passwordResetRequestSchema);
export const validatePasswordReset = validateBody(passwordResetSchema);
export const validateChangePassword = validateBody(changePasswordSchema);
export const validateUpdateProfile = validateBody(updateProfileSchema);
export const validateCreateConversation = validateBody(createConversationSchema);
export const validateCreateMessage = validateBody(createMessageSchema);
export const validateToolExecution = validateBody(toolExecutionSchema);
export const validateFileUpload = validateBody(fileUploadSchema);
export const validateSearch = validateQuery(searchSchema);
export const validatePagination = validateQuery(paginationQuerySchema);
export const validateIdParam = validateParams(idParamSchema);
export const validateEmail = validateBody(emailSchema);
export const validateUUID = validateParams(uuidSchema);

/**
 * Multi-Source Validation Middleware
 * Validates multiple sources in a single middleware
 */
export const validateMultiple = (validations: {
    body?: ZodSchema<any>;
    query?: ZodSchema<any>;
    params?: ZodSchema<any>;
}) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const errors: Array<{ source: string; field: string; message: string; value: any }> = [];

        // Validate body
        if (validations.body) {
            try {
                req.body = validations.body.parse(req.body);
            } catch (error) {
                if (error instanceof ZodError) {
                    errors.push(...error.errors.map(err => ({
                        source: 'body',
                        field: err.path.join('.'),
                        message: err.message,
                        value: (err as any).received || 'invalid',
                    })));
                }
            }
        }

        // Validate query
        if (validations.query) {
            try {
                req.query = validations.query.parse(req.query);
            } catch (error) {
                if (error instanceof ZodError) {
                    errors.push(...error.errors.map(err => ({
                        source: 'query',
                        field: err.path.join('.'),
                        message: err.message,
                        value: (err as any).received || 'invalid',
                    })));
                }
            }
        }

        // Validate params
        if (validations.params) {
            try {
                req.params = validations.params.parse(req.params);
            } catch (error) {
                if (error instanceof ZodError) {
                    errors.push(...error.errors.map(err => ({
                        source: 'params',
                        field: err.path.join('.'),
                        message: err.message,
                        value: (err as any).received || 'invalid',
                    })));
                }
            }
        }

        if (errors.length > 0) {
            logger.warn('Multi-source validation failed', {
                errors,
                ip: (req as any).clientIP || req.ip,
                url: req.originalUrl,
            });

            const validationError = new ValidationError('Validation failed');
            res.status(400).json({
                status: 'error',
                message: validationError.message,
                errors,
                statusCode: 400,
                timestamp: new Date().toISOString(),
            });
            return;
        }

        next();
    };
};

/**
 * Optional Validation Middleware
 * Validates data only if present
 */
export const validateOptional = <T>(schema: ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            let dataToValidate: any;

            switch (source) {
                case 'body':
                    dataToValidate = req.body;
                    break;
                case 'query':
                    dataToValidate = req.query;
                    break;
                case 'params':
                    dataToValidate = req.params;
                    break;
            }

            // Skip validation if no data to validate
            if (!dataToValidate || Object.keys(dataToValidate).length === 0) {
                next();
                return;
            }

            // For optional validation, we'll just validate what's provided
            const validatedData = schema.parse(dataToValidate);

            // Replace original data with validated data
            switch (source) {
                case 'body':
                    req.body = validatedData;
                    break;
                case 'query':
                    req.query = validatedData as any;
                    break;
                case 'params':
                    req.params = validatedData as any;
                    break;
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const validationErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    value: (err as any).received || 'invalid',
                }));

                logger.warn('Optional validation failed', {
                    source,
                    errors: validationErrors,
                    ip: (req as any).clientIP || req.ip,
                    url: req.originalUrl,
                });

                const validationError = new ValidationError('Validation failed');
                res.status(400).json({
                    status: 'error',
                    message: validationError.message,
                    errors: validationErrors,
                    statusCode: 400,
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            logger.error('Optional validation middleware error', { error });
            next(); // Continue on error for optional validation
        }
    };
};

// Export all validation middleware
export default {
    validateSchema,
    validateBody,
    validateQuery,
    validateParams,
    validateMultiple,
    validateOptional,

    // Common validations
    validateUserRegistration,
    validateUserLogin,
    validatePasswordResetRequest,
    validatePasswordReset,
    validateChangePassword,
    validateUpdateProfile,
    validateCreateConversation,
    validateCreateMessage,
    validateToolExecution,
    validateFileUpload,
    validateSearch,
    validatePagination,
    validateIdParam,
    validateEmail,
    validateUUID,

    // Schemas
    userRegistrationSchema,
    userLoginSchema,
    passwordResetRequestSchema,
    passwordResetSchema,
    changePasswordSchema,
    updateProfileSchema,
    createConversationSchema,
    createMessageSchema,
    toolExecutionSchema,
    fileUploadSchema,
    searchSchema,
    paginationSchema,
    idParamSchema,
    emailSchema,
    uuidSchema,
};
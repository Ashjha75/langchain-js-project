import Joi from 'joi';
import { logger } from './logger.js';

// Environment validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  GOOGLE_API_KEY: Joi.string().required(),
  GOOGLE_MODEL_NAME: Joi.string().default('gemini-1.5-flash'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info')
});

export function validateEnvironment() {
  const { error, value } = envSchema.validate(process.env, {
    allowUnknown: true,
    stripUnknown: false
  });

  if (error) {
    logger.error('Environment validation failed:', error.details);
    throw new Error(`Environment validation failed: ${error.message}`);
  }

  logger.info('Environment validation passed');
  return value;
}

// Request validation schemas
export const requestSchemas = {
  nextjs: Joi.object({
    requirements: Joi.string().required(),
    components: Joi.array().items(Joi.string()).default([]),
    features: Joi.array().items(Joi.string()).default([])
  }),

  express: Joi.object({
    requirements: Joi.string().required(),
    routes: Joi.array().items(Joi.object({
      path: Joi.string().required(),
      method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').required(),
      description: Joi.string()
    })).default([]),
    middleware: Joi.array().items(Joi.string()).default([]),
    database: Joi.string().valid('none', 'mongodb', 'postgresql', 'mysql', 'sqlite').default('none')
  }),

  fullstack: Joi.object({
    requirements: Joi.string().required(),
    frontend: Joi.object({
      components: Joi.array().items(Joi.string()).default([]),
      features: Joi.array().items(Joi.string()).default([]),
      styling: Joi.string().valid('tailwind', 'css-modules', 'styled-components').default('tailwind')
    }).default({}),
    backend: Joi.object({
      routes: Joi.array().items(Joi.object({
        path: Joi.string().required(),
        method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').required(),
        description: Joi.string()
      })).default([]),
      middleware: Joi.array().items(Joi.string()).default([]),
      database: Joi.string().valid('none', 'mongodb', 'postgresql', 'mysql', 'sqlite').default('none'),
      auth: Joi.boolean().default(false)
    }).default({})
  })
};

export function validateRequest(data, schema) {
  const { error, value } = schema.validate(data);
  
  if (error) {
    logger.warn('Request validation failed:', error.details);
    throw new Error(`Validation failed: ${error.message}`);
  }
  
  return value;
}

// Code validation utilities
export function validateJavaScript(code) {
  try {
    // Basic syntax validation using Function constructor
    new Function(code);
    return { valid: true, errors: [] };
  } catch (error) {
    return { 
      valid: false, 
      errors: [{ 
        message: error.message, 
        line: error.lineNumber || 'unknown' 
      }] 
    };
  }
}

export function validateJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return { valid: true, errors: [] };
  } catch (error) {
    return { 
      valid: false, 
      errors: [{ 
        message: error.message, 
        position: error.toString().match(/position (\d+)/)?.[1] || 'unknown' 
      }] 
    };
  }
}
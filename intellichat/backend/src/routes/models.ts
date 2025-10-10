/**
 * Models Routes
 * API endpoints for AI model configuration
 */

import { Router } from 'express';
import { modelsController } from '@/controllers/models';
import { authenticateJWT } from '@/middleware/auth';

const router = Router();

// Public routes (no authentication required)

/**
 * @route   GET /api/models
 * @desc    Get all available AI models
 * @access  Public
 */
router.get('/', modelsController.listModels);

/**
 * @route   GET /api/models/:modelId
 * @desc    Get specific model configuration
 * @access  Public
 */
router.get('/:modelId', modelsController.getModel);

/**
 * @route   GET /api/models/provider/:provider
 * @desc    Get models for a specific provider
 * @access  Public
 */
router.get('/provider/:provider', modelsController.getProviderModels);

// Admin routes (require authentication and admin role)

/**
 * @route   POST /api/models/reload
 * @desc    Reload model configuration from file
 * @access  Admin
 */
router.post('/reload', authenticateJWT, modelsController.reloadConfig);

export { router as modelsRoutes };

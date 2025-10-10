/**
 * Models Controller
 * Handles requests for AI model information and configuration
 */

import { Request, Response, NextFunction } from 'express';
import { aiConfigManager } from '@/config/ai-config';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ModelsController');

export class ModelsController {
  /**
   * Get all available models
   */
  async listModels(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const models = aiConfigManager.exportConfig();

      res.json({
        success: true,
        data: models
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific model configuration
   */
  async getModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { modelId } = req.params;
      
      if (!modelId) {
        res.status(400).json({
          success: false,
          message: 'Model ID is required'
        });
        return;
      }

      const model = aiConfigManager.getModelConfig(modelId);

      if (!model) {
        res.status(404).json({
          success: false,
          message: `Model ${modelId} not found`
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: model.modelId,
          name: model.displayName,
          description: model.description,
          provider: model.provider,
          enabled: model.enabled,
          config: model.config,
          features: model.features,
          limits: model.limits
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get models by provider
   */
  async getProviderModels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider } = req.params;
      
      if (!provider) {
        res.status(400).json({
          success: false,
          message: 'Provider is required'
        });
        return;
      }

      const models = aiConfigManager.getProviderModels(provider);

      if (models.length === 0) {
        res.status(404).json({
          success: false,
          message: `No models found for provider: ${provider}`
        });
        return;
      }

      res.json({
        success: true,
        data: models.map(model => ({
          id: model.modelId,
          name: model.displayName,
          description: model.description,
          provider: model.provider,
          enabled: model.enabled,
          config: model.config,
          features: model.features,
          limits: model.limits
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reload model configuration (useful for hot-reloading)
   */
  async reloadConfig(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      aiConfigManager.reloadConfig();

      logger.info('Model configuration reloaded');

      res.json({
        success: true,
        message: 'Configuration reloaded successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const modelsController = new ModelsController();

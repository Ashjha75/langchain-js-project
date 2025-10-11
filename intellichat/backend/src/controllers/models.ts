/**
 * Models Controller
 * Handles requests for AI model information and configuration
 */

import type { Request, Response, NextFunction } from "express";
import { AIModel } from "@/models/aiModel";
import { createLogger } from "@/utils/logger";

const logger = createLogger("ModelsController");

export class ModelsController {
  /**
   * Get all available models from database
   */
  async listModels(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const models = await AIModel.find({ active: true, can_run: true })
        .select('-__v -createdAt -updatedAt')
        .sort({ 'metadata.display_name': 1 });

      res.json({
        success: true,
        count: models.length,
        data: models,
      });
    } catch (error) {
      logger.error("Error fetching models:", error);
      next(error);
    }
  }

  /**
   * Get specific model configuration from database
   */
  async getModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { modelId } = req.params;

      if (!modelId) {
        res.status(400).json({
          success: false,
          message: "Model ID is required",
        });
        return;
      }

      const model = await AIModel.findOne({ modelId })
        .select('-__v -createdAt -updatedAt');

      if (!model) {
        res.status(404).json({
          success: false,
          message: `Model ${modelId} not found`,
        });
        return;
      }

      res.json({
        success: true,
        data: model,
      });
    } catch (error) {
      logger.error("Error fetching model:", error);
      next(error);
    }
  }

  /**
   * Get models by provider from database
   */
  async getProviderModels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider } = req.params;

      if (!provider) {
        res.status(400).json({
          success: false,
          message: "Provider is required",
        });
        return;
      }

      const models = await AIModel.find({ 
        owned_by: new RegExp(provider, 'i'),
        active: true,
        can_run: true
      })
        .select('-__v -createdAt -updatedAt')
        .sort({ 'metadata.display_name': 1 });

      if (models.length === 0) {
        res.status(404).json({
          success: false,
          message: `No models found for provider: ${provider}`,
        });
        return;
      }

      res.json({
        success: true,
        count: models.length,
        data: models,
      });
    } catch (error) {
      logger.error("Error fetching provider models:", error);
      next(error);
    }
  }

  /**
   * Reload model configuration from database (re-sync)
   */
  async reloadConfig(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Count models in database
      const count = await AIModel.countDocuments({ active: true, can_run: true });

      logger.info("Model configuration check", { activeModels: count });

      res.json({
        success: true,
        message: "Configuration synced with database",
        activeModels: count,
      });
    } catch (error) {
      logger.error("Error reloading config:", error);
      next(error);
    }
  }
}

export const modelsController = new ModelsController();

/**
 * AI Model Configuration Manager
 * Single source of truth for all AI model configurations
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AIConfig');

export interface ModelFeatures {
  jsonMode: boolean;
  browserSearch: boolean;
  codeInterpreter: boolean;
  moderation: boolean;
}

export interface ModelLimits {
  maxCompletionTokens: number;
  contextWindow: number;
}

export interface ModelConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  stream: boolean;
  reasoning?: 'low' | 'medium' | 'high';
  seed?: number | null;
  stopSequence?: string;
}

export interface ModelDefinition {
  provider: string;
  modelId: string;
  displayName: string;
  description: string;
  enabled: boolean;
  config: ModelConfig;
  features: ModelFeatures;
  limits: ModelLimits;
}

export interface AIModelsConfig {
  models: {
    [provider: string]: {
      [modelId: string]: ModelDefinition;
    };
  };
  defaultModel: string;
  defaultProvider: string;
}

class AIConfigManager {
  private config: AIModelsConfig | null = null;
  private configPath: string;

  constructor() {
    this.configPath = join(__dirname, 'ai-models.json');
    this.loadConfig();
  }

  /**
   * Load configuration from JSON file
   */
  private loadConfig(): void {
    try {
      const configFile = readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(configFile);
      logger.info('AI models configuration loaded successfully', {
        totalModels: this.getTotalModelsCount(),
        defaultModel: this.config?.defaultModel,
        defaultProvider: this.config?.defaultProvider
      });
    } catch (error) {
      logger.error('Failed to load AI models configuration', {
        error: (error as Error).message,
        path: this.configPath
      });
      throw new Error('Failed to load AI models configuration');
    }
  }

  /**
   * Reload configuration from file (useful for hot-reloading)
   */
  public reloadConfig(): void {
    logger.info('Reloading AI models configuration');
    this.loadConfig();
  }

  /**
   * Get configuration for a specific model
   */
  public getModelConfig(modelId: string, provider?: string): ModelDefinition | null {
    if (!this.config) {
      throw new Error('AI configuration not loaded');
    }

    // If provider is specified, search in that provider only
    if (provider && this.config.models[provider]) {
      return this.config.models[provider][modelId] || null;
    }

    // Search across all providers
    for (const providerKey in this.config.models) {
      const providerModels = this.config.models[providerKey];
      if (providerModels && providerModels[modelId]) {
        return providerModels[modelId];
      }
    }

    return null;
  }

  /**
   * Get all models for a specific provider
   */
  public getProviderModels(provider: string): ModelDefinition[] {
    if (!this.config || !this.config.models[provider]) {
      return [];
    }

    return Object.values(this.config.models[provider]);
  }

  /**
   * Get all enabled models
   */
  public getEnabledModels(): ModelDefinition[] {
    if (!this.config) {
      return [];
    }

    const enabledModels: ModelDefinition[] = [];
    
    for (const provider in this.config.models) {
      const providerModels = this.config.models[provider];
      if (providerModels) {
        for (const modelId in providerModels) {
          const model = providerModels[modelId];
          if (model && model.enabled) {
            enabledModels.push(model);
          }
        }
      }
    }

    return enabledModels;
  }

  /**
   * Get list of all model IDs
   */
  public getAllModelIds(): string[] {
    if (!this.config) {
      return [];
    }

    const modelIds: string[] = [];
    
    for (const provider in this.config.models) {
      const providerModels = this.config.models[provider];
      if (providerModels) {
        modelIds.push(...Object.keys(providerModels));
      }
    }

    return modelIds;
  }

  /**
   * Check if a model is valid and enabled
   */
  public isValidModel(modelId: string): boolean {
    const model = this.getModelConfig(modelId);
    return model !== null && model.enabled;
  }

  /**
   * Get default model configuration
   */
  public getDefaultModel(): ModelDefinition | null {
    if (!this.config) {
      return null;
    }

    return this.getModelConfig(
      this.config.defaultModel,
      this.config.defaultProvider
    );
  }

  /**
   * Get merged configuration (user config + model defaults)
   */
  public getMergedConfig(
    modelId: string,
    userConfig?: Partial<ModelConfig>
  ): ModelConfig {
    const modelDef = this.getModelConfig(modelId);
    
    if (!modelDef) {
      throw new Error(`Model ${modelId} not found in configuration`);
    }

    if (!modelDef.enabled) {
      throw new Error(`Model ${modelId} is disabled`);
    }

    // Merge user config with model defaults
    return {
      ...modelDef.config,
      ...userConfig,
      // Ensure values are within limits
      maxTokens: Math.min(
        userConfig?.maxTokens || modelDef.config.maxTokens,
        modelDef.limits.maxCompletionTokens
      ),
      temperature: Math.max(0, Math.min(2, userConfig?.temperature || modelDef.config.temperature)),
      topP: Math.max(0, Math.min(1, userConfig?.topP || modelDef.config.topP))
    };
  }

  /**
   * Get model features
   */
  public getModelFeatures(modelId: string): ModelFeatures | null {
    const model = this.getModelConfig(modelId);
    return model ? model.features : null;
  }

  /**
   * Get model limits
   */
  public getModelLimits(modelId: string): ModelLimits | null {
    const model = this.getModelConfig(modelId);
    return model ? model.limits : null;
  }

  /**
   * Get total number of models
   */
  private getTotalModelsCount(): number {
    if (!this.config) {
      return 0;
    }

    let count = 0;
    for (const provider in this.config.models) {
      const providerModels = this.config.models[provider];
      if (providerModels) {
        count += Object.keys(providerModels).length;
      }
    }
    return count;
  }

  /**
   * Export configuration for API response
   */
  public exportConfig() {
    return {
      models: this.getEnabledModels().map(model => ({
        id: model.modelId,
        name: model.displayName,
        description: model.description,
        provider: model.provider,
        config: model.config,
        features: model.features,
        limits: model.limits
      })),
      defaultModel: this.config?.defaultModel,
      defaultProvider: this.config?.defaultProvider
    };
  }
}

// Singleton instance
export const aiConfigManager = new AIConfigManager();

// Export for convenience
export const getModelConfig = (modelId: string, provider?: string) => 
  aiConfigManager.getModelConfig(modelId, provider);

export const getMergedConfig = (modelId: string, userConfig?: Partial<ModelConfig>) =>
  aiConfigManager.getMergedConfig(modelId, userConfig);

export const isValidModel = (modelId: string) =>
  aiConfigManager.isValidModel(modelId);

export const getEnabledModels = () =>
  aiConfigManager.getEnabledModels();

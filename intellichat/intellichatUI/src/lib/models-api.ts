/**
 * Models API Client
 * Handles API calls to fetch AI model configurations from database
 */

import api from './api';

export interface ModelFeatures {
  chat: boolean;
  tools: boolean;
  json_mode: boolean;
  max_input_images: number;
  transcription: boolean;
  audio_translation: boolean;
  is_batch_enabled: boolean;
}

export interface ModelPrice {
  Model: string;
  PriceInTokens: string;
  PriceOutTokens: string;
  PriceAudioInSeconds: string | null;
  PriceInImageTokens: string | null;
  PriceInCachedTokens: string | null;
  PriceInBlock: string | null;
  PriceOutBlock: string | null;
  BuiltInTool: string;
  BuiltInToolPrice: string | null;
  PriceSSO: string | null;
  PriceSCIM: string | null;
  ServiceTier: string;
  AudioInSecondsFloor: number | null;
}

export interface ModelLimits {
  requests_per_minute: number;
  requests_per_day: number;
  tokens_per_minute: number;
  audio_seconds_per_hour: number;
  audio_seconds_per_day: number;
  tokens_per_day: number;
  max_file_size: number;
}

export interface ModelMetadata {
  model_card?: string;
  display_name: string;
  image_max_bytes?: number;
  model_price?: {
    batch?: ModelPrice;
    on_demand?: ModelPrice;
  };
  release_stage: string;
  limits: ModelLimits;
}

export interface AIModelFromDB {
  _id: string;
  modelId: string; // This is the actual model ID like "openai/gpt-oss-120b"
  object: string;
  created: number;
  owned_by: string;
  active: boolean;
  context_window: number;
  public_apps: string | null;
  max_completion_tokens: number;
  features: ModelFeatures;
  metadata: ModelMetadata;
  terms_url: string | null;
  is_terms_required: boolean;
  is_terms_accepted: boolean | null;
  is_fine_tuned: boolean;
  fine_tune_name: string;
  can_run: boolean;
}

// Transform database model to match frontend format (with 'id' field)
export interface AIModel extends Omit<AIModelFromDB, '_id'> {
  id: string; // Alias for modelId to match frontend expectations
}

/**
 * Get all available models from database
 */
export const getModels = async (): Promise<AIModel[]> => {
  try {
    console.log('🚀 [Models API] Fetching models from database...');
    
    const response = await api.get('/models');
    
    const models: AIModel[] = response.data.data.map((model: AIModelFromDB) => ({
      ...model,
      id: model.modelId // Add 'id' as alias for 'modelId'
    }));
    
    console.log('✅ [Models API] Fetched models:', {
      count: models.length,
      models: models.map(m => ({ id: m.id, name: m.metadata.display_name }))
    });
    
    return models;
  } catch (error: any) {
    console.error('❌ [Models API] Failed to fetch models:', error);
    throw error;
  }
};

/**
 * Get specific model by ID
 */
export const getModelById = async (modelId: string): Promise<AIModel> => {
  try {
    console.log('🚀 [Models API] Fetching model:', modelId);
    
    const response = await api.get(`/models/${modelId}`);
    
    const model: AIModel = {
      ...response.data.data,
      id: response.data.data.modelId
    };
    
    console.log('✅ [Models API] Fetched model:', {
      id: model.id,
      name: model.metadata.display_name
    });
    
    return model;
  } catch (error: any) {
    console.error('❌ [Models API] Failed to fetch model:', error);
    throw error;
  }
};

/**
 * Get models by provider
 */
export const getModelsByProvider = async (provider: string): Promise<AIModel[]> => {
  try {
    console.log('🚀 [Models API] Fetching models for provider:', provider);
    
    const response = await api.get(`/models/provider/${provider}`);
    
    const models: AIModel[] = response.data.data.map((model: AIModelFromDB) => ({
      ...model,
      id: model.modelId
    }));
    
    console.log('✅ [Models API] Fetched provider models:', {
      provider,
      count: models.length
    });
    
    return models;
  } catch (error: any) {
    console.error('❌ [Models API] Failed to fetch provider models:', error);
    throw error;
  }
};

const modelsAPI = {
  getModels,
  getModelById,
  getModelsByProvider,
};

export default modelsAPI;

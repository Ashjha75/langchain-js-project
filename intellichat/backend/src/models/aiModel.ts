/**
 * AI Model Schema
 * Stores AI model configurations in MongoDB
 */

import mongoose, { Document, Schema } from "mongoose";

// Model Feature flags
interface IModelFeatures {
  chat: boolean;
  tools: boolean;
  json_mode: boolean;
  max_input_images: number;
  transcription: boolean;
  audio_translation: boolean;
  is_batch_enabled: boolean;
}

// Model pricing information
interface IModelPrice {
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

// Model limits
interface IModelLimits {
  requests_per_minute: number;
  requests_per_day: number;
  tokens_per_minute: number;
  audio_seconds_per_hour: number;
  audio_seconds_per_day: number;
  tokens_per_day: number;
  max_file_size: number;
}

// Model metadata
interface IModelMetadata {
  model_card?: string;
  display_name: string;
  image_max_bytes?: number;
  model_price: {
    batch?: IModelPrice;
    on_demand?: IModelPrice;
  };
  release_stage: string;
  limits: IModelLimits;
}

// Main AI Model interface
export interface IAIModel {
  modelId: string; // Renamed to avoid conflict with Mongoose Document 'id' field
  object: string;
  created: number;
  owned_by: string;
  active: boolean;
  context_window: number;
  public_apps: string | null;
  max_completion_tokens: number;
  features: IModelFeatures;
  metadata: IModelMetadata;
  terms_url: string | null;
  is_terms_required: boolean;
  is_terms_accepted: boolean | null;
  is_fine_tuned: boolean;
  fine_tune_name: string;
  can_run: boolean;
}

export interface IAIModelDocument extends IAIModel, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const ModelFeaturesSchema = new Schema<IModelFeatures>(
  {
    chat: { type: Boolean, required: true },
    tools: { type: Boolean, required: true },
    json_mode: { type: Boolean, required: true },
    max_input_images: { type: Number, required: true },
    transcription: { type: Boolean, required: true },
    audio_translation: { type: Boolean, required: true },
    is_batch_enabled: { type: Boolean, required: true },
  },
  { _id: false }
);

const ModelPriceSchema = new Schema<IModelPrice>(
  {
    Model: { type: String, required: true },
    PriceInTokens: { type: String, required: true },
    PriceOutTokens: { type: String, required: true },
    PriceAudioInSeconds: { type: String, default: null },
    PriceInImageTokens: { type: String, default: null },
    PriceInCachedTokens: { type: String, default: null },
    PriceInBlock: { type: String, default: null },
    PriceOutBlock: { type: String, default: null },
    BuiltInTool: { type: String, default: "" },
    BuiltInToolPrice: { type: String, default: null },
    PriceSSO: { type: String, default: null },
    PriceSCIM: { type: String, default: null },
    ServiceTier: { type: String, required: true },
    AudioInSecondsFloor: { type: Number, default: null },
  },
  { _id: false }
);

const ModelLimitsSchema = new Schema<IModelLimits>(
  {
    requests_per_minute: { type: Number, required: true },
    requests_per_day: { type: Number, required: true },
    tokens_per_minute: { type: Number, required: true },
    audio_seconds_per_hour: { type: Number, required: true },
    audio_seconds_per_day: { type: Number, required: true },
    tokens_per_day: { type: Number, required: true },
    max_file_size: { type: Number, required: true },
  },
  { _id: false }
);

const ModelMetadataSchema = new Schema<IModelMetadata>(
  {
    model_card: { type: String },
    display_name: { type: String, required: true },
    image_max_bytes: { type: Number },
    model_price: {
      batch: { type: ModelPriceSchema },
      on_demand: { type: ModelPriceSchema },
    },
    release_stage: { type: String, required: true },
    limits: { type: ModelLimitsSchema, required: true },
  },
  { _id: false }
);

const AIModelSchema = new Schema<IAIModelDocument>(
  {
    modelId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    object: { type: String, required: true },
    created: { type: Number, required: true },
    owned_by: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
    context_window: { type: Number, required: true },
    public_apps: { type: String, default: null },
    max_completion_tokens: { type: Number, required: true },
    features: { type: ModelFeaturesSchema, required: true },
    metadata: { type: ModelMetadataSchema, required: true },
    terms_url: { type: String, default: null },
    is_terms_required: { type: Boolean, required: true, default: false },
    is_terms_accepted: { type: Boolean, default: null },
    is_fine_tuned: { type: Boolean, required: true, default: false },
    fine_tune_name: { type: String, default: "" },
    can_run: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    collection: "ai_models",
  }
);

// Indexes
AIModelSchema.index({ owned_by: 1 });
AIModelSchema.index({ active: 1, can_run: 1 });
AIModelSchema.index({ "metadata.display_name": 1 });

// Static methods
AIModelSchema.statics.findActiveModels = function () {
  return this.find({ active: true, can_run: true });
};

AIModelSchema.statics.findByProvider = function (provider: string) {
  return this.find({ 
    owned_by: new RegExp(provider, 'i'), 
    active: true, 
    can_run: true 
  });
};

AIModelSchema.statics.findByModelId = function (modelId: string) {
  return this.findOne({ modelId });
};

export const AIModel = mongoose.model<IAIModelDocument>("AIModel", AIModelSchema);

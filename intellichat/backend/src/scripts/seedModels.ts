/**
 * Seed AI Models Script
 * Imports model configurations from frontend models.ts into MongoDB
 */

import mongoose from "mongoose";
import { AIModel } from "../models/aiModel";
import { createLogger } from "../utils/logger";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const logger = createLogger("SeedModels");

// Import models data from the frontend config
const models = [{
    "modelId": "openai/gpt-oss-120b",
    "object": "model",
    "created": 1754408224,
    "owned_by": "OpenAI",
    "active": true,
    "context_window": 131072,
    "public_apps": null,
    "max_completion_tokens": 65536,
    "features": {
        "chat": true,
        "tools": true,
        "json_mode": true,
        "max_input_images": 0,
        "transcription": false,
        "audio_translation": false,
        "is_batch_enabled": true
    },
    "metadata": {
        "model_card": "https://openai.com/index/gpt-oss-model-card",
        "display_name": "GPT OSS 120B",
        "model_price": {
            "batch": {
                "Model": "openai/gpt-oss-120b",
                "PriceInTokens": "0.000000075",
                "PriceOutTokens": "0.000000375",
                "PriceAudioInSeconds": null,
                "PriceInImageTokens": null,
                "PriceInCachedTokens": null,
                "PriceInBlock": null,
                "PriceOutBlock": null,
                "BuiltInTool": "",
                "BuiltInToolPrice": null,
                "PriceSSO": null,
                "PriceSCIM": null,
                "ServiceTier": "batch",
                "AudioInSecondsFloor": null
            },
            "on_demand": {
                "Model": "openai/gpt-oss-120b",
                "PriceInTokens": "0.00000015",
                "PriceOutTokens": "0.00000075",
                "PriceAudioInSeconds": null,
                "PriceInImageTokens": null,
                "PriceInCachedTokens": "0.000000075",
                "PriceInBlock": null,
                "PriceOutBlock": null,
                "BuiltInTool": "",
                "BuiltInToolPrice": null,
                "PriceSSO": null,
                "PriceSCIM": null,
                "ServiceTier": "on_demand",
                "AudioInSecondsFloor": null
            }
        },
        "release_stage": "production",
        "limits": {
            "requests_per_minute": 30,
            "requests_per_day": 1000,
            "tokens_per_minute": 8000,
            "audio_seconds_per_hour": 1800,
            "audio_seconds_per_day": 14400,
            "tokens_per_day": 200000,
            "max_file_size": 26214400
        }
    },
    "terms_url": null,
    "is_terms_required": false,
    "is_terms_accepted": null,
    "is_fine_tuned": false,
    "fine_tune_name": "",
    "can_run": true
},
{
    "modelId": "openai/gpt-oss-20b",
    "object": "model",
    "created": 1754407957,
    "owned_by": "OpenAI",
    "active": true,
    "context_window": 131072,
    "public_apps": null,
    "max_completion_tokens": 65536,
    "features": {
        "chat": true,
        "tools": true,
        "json_mode": true,
        "max_input_images": 0,
        "transcription": false,
        "audio_translation": false,
        "is_batch_enabled": true
    },
    "metadata": {
        "model_card": "https://openai.com/index/gpt-oss-model-card",
        "display_name": "GPT OSS 20B",
        "model_price": {
            "batch": {
                "Model": "openai/gpt-oss-20b",
                "PriceInTokens": "0.00000005",
                "PriceOutTokens": "0.00000025",
                "PriceAudioInSeconds": null,
                "PriceInImageTokens": null,
                "PriceInCachedTokens": null,
                "PriceInBlock": null,
                "PriceOutBlock": null,
                "BuiltInTool": "",
                "BuiltInToolPrice": null,
                "PriceSSO": null,
                "PriceSCIM": null,
                "ServiceTier": "batch",
                "AudioInSecondsFloor": null
            },
            "on_demand": {
                "Model": "openai/gpt-oss-20b",
                "PriceInTokens": "0.0000001",
                "PriceOutTokens": "0.0000005",
                "PriceAudioInSeconds": null,
                "PriceInImageTokens": null,
                "PriceInCachedTokens": "0.00000005",
                "PriceInBlock": null,
                "PriceOutBlock": null,
                "BuiltInTool": "",
                "BuiltInToolPrice": null,
                "PriceSSO": null,
                "PriceSCIM": null,
                "ServiceTier": "on_demand",
                "AudioInSecondsFloor": null
            }
        },
        "release_stage": "production",
        "limits": {
            "requests_per_minute": 30,
            "requests_per_day": 1000,
            "tokens_per_minute": 8000,
            "audio_seconds_per_hour": 1800,
            "audio_seconds_per_day": 14400,
            "tokens_per_day": 200000,
            "max_file_size": 26214400
        }
    },
    "terms_url": null,
    "is_terms_required": false,
    "is_terms_accepted": null,
    "is_fine_tuned": false,
    "fine_tune_name": "",
    "can_run": true
},
{
    "modelId": "llama-3.1-8b-instant",
    "object": "model",
    "created": 1693721698,
    "owned_by": "Meta",
    "active": true,
    "context_window": 131072,
    "public_apps": null,
    "max_completion_tokens": 131072,
    "features": {
        "chat": true,
        "tools": true,
        "json_mode": true,
        "max_input_images": 0,
        "transcription": false,
        "audio_translation": false,
        "is_batch_enabled": true
    },
    "metadata": {
        "model_card": "https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct",
        "display_name": "Llama 3.1 8B",
        "model_price": {
            "batch": {
                "Model": "llama-3.1-8b-instant",
                "PriceInTokens": "0.000000025",
                "PriceOutTokens": "0.00000004",
                "PriceAudioInSeconds": null,
                "PriceInImageTokens": null,
                "PriceInCachedTokens": null,
                "PriceInBlock": null,
                "PriceOutBlock": null,
                "BuiltInTool": "",
                "BuiltInToolPrice": null,
                "PriceSSO": null,
                "PriceSCIM": null,
                "ServiceTier": "batch",
                "AudioInSecondsFloor": null
            },
            "on_demand": {
                "Model": "llama-3.1-8b-instant",
                "PriceInTokens": "0.00000005",
                "PriceOutTokens": "0.00000008",
                "PriceAudioInSeconds": null,
                "PriceInImageTokens": null,
                "PriceInCachedTokens": "0.000000025",
                "PriceInBlock": null,
                "PriceOutBlock": null,
                "BuiltInTool": "",
                "BuiltInToolPrice": null,
                "PriceSSO": null,
                "PriceSCIM": null,
                "ServiceTier": "on_demand",
                "AudioInSecondsFloor": null
            }
        },
        "release_stage": "production",
        "limits": {
            "requests_per_minute": 30,
            "requests_per_day": 14400,
            "tokens_per_minute": 6000,
            "audio_seconds_per_hour": 1800,
            "audio_seconds_per_day": 14400,
            "tokens_per_day": 500000,
            "max_file_size": 26214400
        }
    },
    "terms_url": null,
    "is_terms_required": false,
    "is_terms_accepted": null,
    "is_fine_tuned": false,
    "fine_tune_name": "",
    "can_run": true
},
{
    "modelId": "llama-3.3-70b-versatile",
    "object": "model",
    "created": 1733447754,
    "owned_by": "Meta",
    "active": true,
    "context_window": 131072,
    "public_apps": null,
    "max_completion_tokens": 32768,
    "features": {
        "chat": true,
        "tools": true,
        "json_mode": true,
        "max_input_images": 0,
        "transcription": false,
        "audio_translation": false,
        "is_batch_enabled": true
    },
    "metadata": {
        "model_card": "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct",
        "display_name": "Llama 3.3 70B",
        "model_price": {
            "batch": {
                "Model": "llama-3.3-70b-versatile",
                "PriceInTokens": "0.000000295",
                "PriceOutTokens": "0.000000395",
                "PriceAudioInSeconds": null,
                "PriceInImageTokens": null,
                "PriceInCachedTokens": null,
                "PriceInBlock": null,
                "PriceOutBlock": null,
                "BuiltInTool": "",
                "BuiltInToolPrice": null,
                "PriceSSO": null,
                "PriceSCIM": null,
                "ServiceTier": "batch",
                "AudioInSecondsFloor": null
            },
            "on_demand": {
                "Model": "llama-3.3-70b-versatile",
                "PriceInTokens": "0.00000044",
                "PriceOutTokens": "0.00000067",
                "PriceAudioInSeconds": null,
                "PriceInImageTokens": null,
                "PriceInCachedTokens": null,
                "PriceInBlock": null,
                "PriceOutBlock": null,
                "BuiltInTool": "",
                "BuiltInToolPrice": null,
                "PriceSSO": null,
                "PriceSCIM": null,
                "ServiceTier": "on_demand",
                "AudioInSecondsFloor": null
            }
        },
        "release_stage": "production",
        "limits": {
            "requests_per_minute": 30,
            "requests_per_day": 1000,
            "tokens_per_minute": 12000,
            "audio_seconds_per_hour": 1800,
            "audio_seconds_per_day": 14400,
            "tokens_per_day": 100000,
            "max_file_size": 26214400
        }
    },
    "terms_url": null,
    "is_terms_required": false,
    "is_terms_accepted": null,
    "is_fine_tuned": false,
    "fine_tune_name": "",
    "can_run": true
},
{
    "modelId": "groq/compound",
    "object": "model",
    "created": 1756949530,
    "owned_by": "Groq",
    "active": true,
    "context_window": 131072,
    "public_apps": null,
    "max_completion_tokens": 8192,
    "features": {
        "chat": true,
        "tools": false,
        "json_mode": true,
        "max_input_images": 0,
        "transcription": false,
        "audio_translation": false,
        "is_batch_enabled": false
    },
    "metadata": {
        "display_name": "Compound",
        "release_stage": "production",
        "limits": {
            "requests_per_minute": 30,
            "requests_per_day": 250,
            "tokens_per_minute": 70000,
            "audio_seconds_per_hour": 1800,
            "audio_seconds_per_day": 14400,
            "tokens_per_day": 0,
            "max_file_size": 26214400
        }
    },
    "terms_url": null,
    "is_terms_required": false,
    "is_terms_accepted": null,
    "is_fine_tuned": false,
    "fine_tune_name": "",
    "can_run": true
},
{
    "modelId": "groq/compound-mini",
    "object": "model",
    "created": 1756949707,
    "owned_by": "Groq",
    "active": true,
    "context_window": 131072,
    "public_apps": null,
    "max_completion_tokens": 8192,
    "features": {
        "chat": true,
        "tools": false,
        "json_mode": true,
        "max_input_images": 0,
        "transcription": false,
        "audio_translation": false,
        "is_batch_enabled": false
    },
    "metadata": {
        "display_name": "Compound Mini",
        "release_stage": "production",
        "limits": {
            "requests_per_minute": 30,
            "requests_per_day": 250,
            "tokens_per_minute": 70000,
            "audio_seconds_per_hour": 1800,
            "audio_seconds_per_day": 14400,
            "tokens_per_day": 0,
            "max_file_size": 26214400
        }
    },
    "terms_url": null,
    "is_terms_required": false,
    "is_terms_accepted": null,
    "is_fine_tuned": false,
    "fine_tune_name": "",
    "can_run": true
}];

async function seedModels() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    logger.info("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB");

    // Clear existing models
    logger.info("Clearing existing models...");
    await AIModel.deleteMany({});

    // Insert new models
    logger.info(`Inserting ${models.length} models...`);
    const result = await AIModel.insertMany(models);

    logger.info(`Successfully inserted ${result.length} models`);
    
    // Log summary
    const summary = result.reduce((acc, model) => {
      const provider = model.owned_by;
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    logger.info("Models by provider:", summary);

    // Close connection
    await mongoose.disconnect();
    logger.info("Database connection closed");

    process.exit(0);
  } catch (error) {
    logger.error("Error seeding models:", error);
    process.exit(1);
  }
}

// Run the seed script
seedModels();

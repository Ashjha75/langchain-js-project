/**
 * Sync Models from UI to Database
 * This script reads models.ts from the frontend and syncs them to MongoDB
 */

import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import { AIModel } from "../models/aiModel";
import { createLogger } from "../utils/logger";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const logger = createLogger("SyncModels");

async function syncModels() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI or MONGO_URI not found in environment variables"
      );
    }

    logger.info("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB");

    // Read models from UI config
    const uiModelsPath = path.join(
      __dirname,
      "../../../intellichatUI/src/config/models.ts"
    );
    logger.info(`Reading models from: ${uiModelsPath}`);

    if (!fs.existsSync(uiModelsPath)) {
      throw new Error(`UI models file not found at: ${uiModelsPath}`);
    }

    const fileContent = fs.readFileSync(uiModelsPath, "utf-8");

    // Extract models - Remove "export const models = " and parse the JSON
    const modelsStart = fileContent.indexOf("export const models = [");
    if (modelsStart === -1) {
      throw new Error("Could not find models export in UI file");
    }

    // Extract just the array part
    const arrayStart = fileContent.indexOf("[", modelsStart);
    const arrayEnd = fileContent.lastIndexOf("];");

    if (arrayStart === -1 || arrayEnd === -1) {
      throw new Error("Could not find models array boundaries");
    }

    const modelsArrayString = fileContent.substring(arrayStart, arrayEnd + 1);
    const uiModels = JSON.parse(modelsArrayString);
    logger.info(`Found ${uiModels.length} models in UI config`);

    // Transform UI models to database format (id -> modelId)
    const dbModels = uiModels.map((model: any) => ({
      ...model,
      modelId: model.id,
      // Remove the id field as it conflicts with MongoDB's _id
    }));

    // Delete id field from each model
    dbModels.forEach((model: any) => delete model.id);

    // Clear existing models
    logger.info("Clearing existing models...");
    await AIModel.deleteMany({});
    logger.info("Cleared existing models");

    // Insert new models
    logger.info(`Inserting ${dbModels.length} models...`);
    await AIModel.insertMany(dbModels);
    logger.info(`Successfully inserted ${dbModels.length} models`);

    // Show summary
    const summary = dbModels.reduce((acc: any, model: any) => {
      const provider = model.owned_by;
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    logger.info("Models by provider:", summary);

    // List all model IDs
    const modelIds = dbModels.map((m: any) => m.modelId);
    logger.info("Inserted model IDs:", modelIds);

    // Close connection
    await mongoose.disconnect();
    logger.info("Database connection closed");

    process.exit(0);
  } catch (error) {
    logger.error("Error syncing models:", error);
    process.exit(1);
  }
}

// Run the sync script
syncModels();

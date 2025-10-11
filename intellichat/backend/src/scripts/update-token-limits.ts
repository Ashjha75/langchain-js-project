/**
 * Update Token Limits Migration
 * Updates all existing users to have higher token limits for development
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/intellichat";
const NEW_TOKEN_LIMIT = parseInt(process.env.DEFAULT_TOKEN_LIMIT || "10000000", 10);

async function updateTokenLimits() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const User = mongoose.model("User");

    // Update all users with the old limit (10,000) to new limit
    const result = await User.updateMany(
      { "subscription.tokensLimit": { $lt: NEW_TOKEN_LIMIT } },
      {
        $set: {
          "subscription.tokensLimit": NEW_TOKEN_LIMIT,
          "subscription.tokensUsed": 0, // Reset usage for fresh start
        },
      },
    );

    console.log(
      `✅ Updated ${result.modifiedCount} users with new token limit: ${NEW_TOKEN_LIMIT.toLocaleString()}`,
    );

    // Show current user stats
    const users = await User.find({}).select(
      "email subscription.tokensLimit subscription.tokensUsed",
    );
    console.log("\n📊 Current User Token Stats:");
    console.log("─".repeat(80));
    users.forEach((user: any) => {
      const used = user.subscription.tokensUsed || 0;
      const limit = user.subscription.tokensLimit || 0;
      const percentage = limit > 0 ? ((used / limit) * 100).toFixed(2) : "0.00";
      console.log(`👤 ${user.email}`);
      console.log(
        `   Tokens: ${used.toLocaleString()} / ${limit.toLocaleString()} (${percentage}%)`,
      );
    });
    console.log("─".repeat(80));

    await mongoose.disconnect();
    console.log("\n✅ Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
updateTokenLimits();

/**
 * Main Application Entry Point
 * Sets up Express server with all middleware, routes, and configurations
 */

console.log("🟢 APP.TS: Starting to load");
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { CONFIG } from "@/config";
import { createLogger } from "@/utils/logger";
import { globalErrorHandler } from "@/utils/errorHandler";

console.log("🟢 APP.TS: Core imports loaded");

// Routes
import { authRoutes } from "@/routes/auth";
console.log("🟢 APP.TS: Auth routes loaded");
import { chatRoutes } from "@/routes/chat";
console.log("🟢 APP.TS: Chat routes loaded");
import { modelsRoutes } from "@/routes/models";
console.log("🟢 APP.TS: Models routes loaded");
// import { documentRoutes } from "@/routes/document";
// console.log("🟢 APP.TS: Document routes loaded");

console.log("🟢 APP.TS: All imports loaded");

const logger = createLogger("Application");

// Create Express app
const app = express();

// ===========================
// Middleware Configuration
// ===========================

// Basic Express middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(express.json({ limit: "10mb" })); // JSON body parser
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // URL-encoded body parser

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

logger.info("Middleware initialized successfully");

// ===========================
// Routes Configuration
// ===========================

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: CONFIG.app.env,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/models", modelsRoutes);
// app.use("/api/documents", documentRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
});

logger.info("Routes initialized successfully");

// ===========================
// Error Handling
// ===========================

app.use(globalErrorHandler);
logger.info("Error handling initialized successfully");

console.log("🟢 APP.TS: Exporting app");

// Export the Express app (server lifecycle is managed in server.ts)
export default app;

console.log("🟢 APP.TS: Module fully loaded");

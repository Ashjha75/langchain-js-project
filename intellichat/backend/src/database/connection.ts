import mongoose from "mongoose";
import { createLogger } from "@/utils/logger";
import { CONFIG } from "@/config";

const logger = createLogger("Database");

/**
 * MongoDB Connection Manager
 * Handles connection, reconnection, and graceful shutdown
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected: boolean = false;
  private connectionPromise: Promise<typeof mongoose> | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Connect to MongoDB with optimized settings
   */
  public async connect(): Promise<typeof mongoose> {
    if (this.isConnected) {
      logger.info("Already connected to MongoDB");
      return mongoose;
    }

    if (this.connectionPromise) {
      logger.info("Connection in progress, waiting...");
      return this.connectionPromise;
    }

    this.connectionPromise = this.establishConnection();
    return this.connectionPromise;
  }

  private async establishConnection(): Promise<typeof mongoose> {
    try {
      logger.info("Connecting to MongoDB...", {
        uri: CONFIG.database.mongodb.uri.replace(/\/\/.*@/, "//***:***@"),
        environment: CONFIG.app.env,
      });

      // Configure mongoose settings
      mongoose.set("strictQuery", true);

      // Connection options
      const options: mongoose.ConnectOptions = {
        maxPoolSize: CONFIG.database.mongodb.options.maxPoolSize,
        serverSelectionTimeoutMS: CONFIG.database.mongodb.options.serverSelectionTimeoutMS,
        retryWrites: CONFIG.database.mongodb.options.retryWrites,
        bufferCommands: false,
      };

      const connection = await mongoose.connect(CONFIG.database.mongodb.uri, options);

      this.isConnected = true;
      this.connectionPromise = null;

      logger.info("Successfully connected to MongoDB", {
        host: connection.connection.host,
        port: connection.connection.port,
        database: connection.connection.name,
        readyState: connection.connection.readyState,
      });

      this.setupEventListeners();

      return connection;
    } catch (error) {
      this.isConnected = false;
      this.connectionPromise = null;

      logger.error("Failed to connect to MongoDB", error, {
        uri: CONFIG.database.mongodb.uri.replace(/\/\/.*@/, "//***:***@"),
      });

      throw error;
    }
  }

  /**
   * Setup event listeners for connection monitoring
   */
  private setupEventListeners(): void {
    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      logger.info("MongoDB connection established");
    });

    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
      logger.warn("MongoDB connection lost");
    });

    mongoose.connection.on("reconnected", () => {
      this.isConnected = true;
      logger.info("MongoDB reconnected");
    });

    mongoose.connection.on("error", (error) => {
      logger.error("MongoDB connection error", error);
    });

    mongoose.connection.on("close", () => {
      this.isConnected = false;
      logger.info("MongoDB connection closed");
    });

    // Graceful shutdown handlers
    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
    process.on("SIGUSR2", () => this.gracefulShutdown("SIGUSR2")); // Nodemon restart
  }

  /**
   * Graceful shutdown of database connection
   */
  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`${signal} received. Closing MongoDB connection...`);

    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed successfully");
      process.exit(0);
    } catch (error) {
      logger.error("Error during MongoDB shutdown", error);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.info("MongoDB already disconnected");
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("MongoDB disconnected successfully");
    } catch (error) {
      logger.error("Error disconnecting from MongoDB", error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): {
    isConnected: boolean;
    readyState: number;
    host?: string;
    port?: number;
    database?: string;
  } {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name,
    };
  }

  /**
   * Health check for database connection
   */
  public async healthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    details: any;
  }> {
    try {
      const adminDb = mongoose.connection.db?.admin();
      const result = await adminDb?.ping();

      return {
        status: "healthy",
        details: {
          ping: result,
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          database: mongoose.connection.name,
        },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        details: {
          error: (error as Error).message,
          readyState: mongoose.connection.readyState,
        },
      };
    }
  }

  /**
   * Get database statistics
   */
  public async getStats(): Promise<any> {
    try {
      if (!this.isConnected) {
        throw new Error("Database not connected");
      }

      const stats = await mongoose.connection.db?.stats();
      return stats;
    } catch (error) {
      logger.error("Error getting database stats", error);
      throw error;
    }
  }

  /**
   * Drop database (for testing purposes)
   */
  public async dropDatabase(): Promise<void> {
    if (CONFIG.app.env === "production") {
      throw new Error("Cannot drop database in production environment");
    }

    try {
      await mongoose.connection.dropDatabase();
      logger.warn("Database dropped successfully");
    } catch (error) {
      logger.error("Error dropping database", error);
      throw error;
    }
  }
}

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<typeof mongoose> => {
  const dbManager = DatabaseManager.getInstance();
  return dbManager.connect();
};

/**
 * Get database connection status
 */
export const getDatabaseStatus = () => {
  const dbManager = DatabaseManager.getInstance();
  return dbManager.getConnectionStatus();
};

/**
 * Database health check
 */
export const checkDatabaseHealth = async () => {
  const dbManager = DatabaseManager.getInstance();
  return dbManager.healthCheck();
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
  const dbManager = DatabaseManager.getInstance();
  return dbManager.getStats();
};

/**
 * Utility function to create indexes for optimal performance
 */
export const createOptimalIndexes = async (): Promise<void> => {
  if (!mongoose.connection.readyState) {
    throw new Error("Database not connected");
  }

  logger.info("Creating optimal indexes...");

  try {
    // Users collection indexes
    await mongoose.connection
      .collection("users")
      .createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { username: 1 }, unique: true },
        { key: { "subscription.plan": 1 } },
        { key: { createdAt: 1 } },
        { key: { lastLogin: 1 } },
      ]);

    // Conversations collection indexes
    await mongoose.connection
      .collection("conversations")
      .createIndexes([
        { key: { userId: 1, createdAt: -1 } },
        { key: { status: 1 } },
        { key: { "metadata.lastMessageAt": -1 } },
        { key: { "metadata.tags": 1 } },
      ]);

    // Messages collection indexes
    await mongoose.connection
      .collection("messages")
      .createIndexes([
        { key: { conversationId: 1, createdAt: 1 } },
        { key: { userId: 1, createdAt: -1 } },
        { key: { role: 1 } },
        { key: { "flags.isDeleted": 1 } },
      ]);

    // Context collection indexes
    await mongoose.connection.collection("contexts").createIndexes([
      { key: { userId: 1, type: 1 } },
      { key: { sessionId: 1 } },
      { key: { conversationId: 1 } },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 }, // TTL index
    ]);

    // Tools collection indexes
    await mongoose.connection
      .collection("tools")
      .createIndexes([
        { key: { name: 1 }, unique: true },
        { key: { category: 1 } },
        { key: { isActive: 1, isPublic: 1 } },
        { key: { "permissions.requiredRole": 1 } },
      ]);

    // Sessions collection indexes
    await mongoose.connection.collection("sessions").createIndexes([
      { key: { sessionId: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { status: 1 } },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 }, // TTL index
    ]);

    logger.info("Optimal indexes created successfully");
  } catch (error) {
    logger.error("Error creating indexes", error);
    throw error;
  }
};

// Export the database manager instance
export default DatabaseManager.getInstance();

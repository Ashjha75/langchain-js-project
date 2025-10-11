/**
 * Chat Controller
 * Handles HTTP requests for chat operations and AI interactions
 */

import type { Request, Response, NextFunction } from "express";
import { chatService } from "@/services/chat";
import { createLogger } from "@/utils/logger";
import { ValidationError, UnauthorizedError } from "@/utils/errorHandler";

const logger = createLogger("ChatController");

export class ChatController {
  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  async createConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.id;
      const { title, model, systemPrompt, config } = req.body;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      if (!model) {
        throw new ValidationError("Model is required");
      }

      const conversation = await chatService.createConversation({
        userId,
        title,
        model,
        systemPrompt,
        config,
      });

      logger.info("Conversation created", {
        conversationId: conversation._id,
        userId,
        model,
        ip: req.ip,
      });

      res.status(201).json({
        success: true,
        message: "Conversation created successfully",
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { conversationId } = req.params;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      if (!conversationId) {
        throw new ValidationError("Conversation ID is required");
      }

      const conversation = await chatService.getConversation(conversationId, userId);

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  async listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { page = "1", limit = "20", status = "active", search } = req.query;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      const result = await chatService.listConversations({
        userId,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        status: status as "active" | "archived" | "deleted",
        search: search as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { conversationId } = req.params;
      const { title, systemPrompt, config } = req.body;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      if (!conversationId) {
        throw new ValidationError("Conversation ID is required");
      }

      const conversation = await chatService.updateConversation(conversationId, userId, {
        title,
        systemPrompt,
        config,
      });

      logger.info("Conversation updated", {
        conversationId,
        userId,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: "Conversation updated successfully",
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { conversationId } = req.params;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      if (!conversationId) {
        throw new ValidationError("Conversation ID is required");
      }

      await chatService.deleteConversation(conversationId, userId);

      logger.info("Conversation deleted", {
        conversationId,
        userId,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: "Conversation deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================

  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.id;
      const { content, attachments, model, systemPrompt, config } = req.body;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      if (!model) {
        throw new ValidationError("Model is required");
      }

      if (!content || content.trim().length === 0) {
        throw new ValidationError("Message content is required");
      }

      const conversation = await chatService.createConversation({
        userId,
        title: content.substring(0, 50),
        model,
        systemPrompt,
        config,
      });

      const message = await chatService.sendMessage({
        conversationId: conversation._id.toString(),
        userId,
        content: content.trim(),
        attachments,
      });

      logger.info("Message sent to new conversation", {
        conversationId: conversation._id,
        messageId: message._id,
        userId,
        ip: req.ip,
      });

      res.status(201).json({
        success: true,
        message: "Message sent and conversation created",
        data: {
          conversation,
          message: {
            ...message.toObject(),
            contentType: "markdown", // 👈 Add content type at response level
            formatted: {
              isMarkdown: true,
              hasCodeBlocks: message.content.includes("```"),
              hasTables: message.content.includes("|"),
              hasHeaders: message.content.includes("#"),
            },
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { conversationId } = req.params;
      const { content, attachments, config } = req.body;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      if (!conversationId) {
        throw new ValidationError("Conversation ID is required");
      }

      if (!content || content.trim().length === 0) {
        throw new ValidationError("Message content is required");
      }

      logger.info("Sending message with config", {
        conversationId,
        userId,
        contentLength: content.length,
        config,
        ip: req.ip,
      });

      const message = await chatService.sendMessage({
        conversationId,
        userId,
        content: content.trim(),
        attachments,
        config,
      });

      logger.info("Message sent", {
        conversationId,
        messageId: message._id,
        userId,
        contentLength: content.length,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: "Message sent successfully",
        data: {
          ...message.toObject(),
          contentType: "markdown", // 👈 Add content type indicator
          formatted: {
            isMarkdown: true,
            hasCodeBlocks: message.content.includes("```"),
            hasTables: message.content.includes("|"),
            hasHeaders: message.content.includes("#"),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessageStream(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { conversationId } = req.params;

      // Support both POST (body) and GET (query params) for EventSource compatibility
      const isGet = req.method === "GET";
      const content = isGet ? (req.query.content as string) : req.body.content;
      const attachments = isGet
        ? req.query.attachments
          ? JSON.parse(req.query.attachments as string)
          : undefined
        : req.body.attachments;
      const config = isGet
        ? req.query.config
          ? JSON.parse(req.query.config as string)
          : undefined
        : req.body.config;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      if (!conversationId) {
        throw new ValidationError("Conversation ID is required");
      }

      if (!content || content.trim().length === 0) {
        throw new ValidationError("Message content is required");
      }

      // Set headers for Server-Sent Events
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      });

      logger.info("Starting message stream", {
        conversationId,
        userId,
        method: req.method,
        contentLength: content.length,
        config,
        ip: req.ip,
      });

      try {
        for await (const chunk of chatService.sendMessageStream({
          conversationId,
          userId,
          content: content.trim(),
          attachments,
          config,
        })) {
          // Send data as Server-Sent Event
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        // Send completion event
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();

        logger.info("Message stream completed", {
          conversationId,
          userId,
        });
      } catch (streamError) {
        // Send error event
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            error: (streamError as Error).message,
          })}\n\n`,
        );
        res.end();
        throw streamError;
      }
    } catch (error) {
      if (!res.headersSent) {
        next(error);
      } else {
        logger.error("Stream error after headers sent", {
          error: (error as Error).message,
          conversationId: req.params.conversationId,
          userId: (req as any).user?.id,
        });
      }
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { conversationId } = req.params;
      const { limit = "50", before } = req.query;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      if (!conversationId) {
        throw new ValidationError("Conversation ID is required");
      }

      // Verify user has access to this conversation
      await chatService.getConversation(conversationId, userId);

      const messages = await chatService.getConversationMessages(
        conversationId,
        parseInt(limit as string, 10),
        before as string,
      );

      res.json({
        success: true,
        data: {
          messages: messages.reverse(), // Return in chronological order
          hasMore: messages.length === parseInt(limit as string, 10),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  async getTokenUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      const stats = await chatService.getTokenUsageStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async healthCheck(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: "Chat service is healthy",
      timestamp: new Date().toISOString(),
    });
  }
}

export const chatController = new ChatController();

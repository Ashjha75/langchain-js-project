/**
 * Chat Routes
 * Defines all chat-related API endpoints
 */

import { Router } from 'express';
import { chatController } from '@/controllers/chat';
import { authenticateJWT } from '@/middleware/auth';
import { validateBody, validateParams, validateQuery } from '@/middleware/validation';
import { z } from 'zod';

const router = Router();

// All chat routes require authentication
router.use(authenticateJWT);

// Validation schemas for body data
const createConversationBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  model: z.string().min(1),
  systemPrompt: z.string().max(2000).optional(),
  config: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(8192).optional(),
    topP: z.number().min(0).max(1).optional(),
    stream: z.boolean().optional()
  }).optional()
});

const updateConversationBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  systemPrompt: z.string().max(2000).optional(),
  config: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(8192).optional(),
    topP: z.number().min(0).max(1).optional(),
    stream: z.boolean().optional()
  }).optional()
});

const sendMessageBodySchema = z.object({
  content: z.string().min(1).max(10000),
  attachments: z.array(z.object({
    type: z.enum(['file', 'image', 'url']),
    content: z.string().min(1),
    metadata: z.record(z.any()).optional()
  })).optional()
});

const sendBodySchema = z.object({
  content: z.string().min(1).max(10000),
  attachments: z.array(z.object({
    type: z.enum(['file', 'image', 'url']),
    content: z.string().min(1),
    metadata: z.record(z.any()).optional()
  })).optional(),
  model: z.string().min(1),
  systemPrompt: z.string().max(2000).optional(),
  config: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(8192).optional(),
    topP: z.number().min(0).max(1).optional(),
    stream: z.boolean().optional()
  }).optional()
});

// Validation schemas for query parameters
const listConversationsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
  search: z.string().max(100).optional()
});

const getMessagesQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional(),
  before: z.string().regex(/^[0-9a-fA-F]{24}$/).optional()
});

// Validation schema for path parameters
const conversationIdParamsSchema = z.object({
  conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/)
});

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

/**
 * @route   POST /api/chat/conversations
 * @desc    Create a new conversation
 * @access  Private
 */
router.post('/conversations', 
  validateBody(createConversationBodySchema), 
  chatController.createConversation
);

/**
 * @route   GET /api/chat/conversations
 * @desc    Get list of user's conversations
 * @access  Private
 */
router.get('/conversations', 
  validateQuery(listConversationsQuerySchema), 
  chatController.listConversations
);

/**
 * @route   GET /api/chat/conversations/:conversationId
 * @desc    Get a specific conversation
 * @access  Private
 */
router.get('/conversations/:conversationId', 
  validateParams(conversationIdParamsSchema), 
  chatController.getConversation
);

/**
 * @route   PUT /api/chat/conversations/:conversationId
 * @desc    Update a conversation
 * @access  Private
 */
router.put('/conversations/:conversationId', 
  validateParams(conversationIdParamsSchema), 
  validateBody(updateConversationBodySchema), 
  chatController.updateConversation
);

/**
 * @route   DELETE /api/chat/conversations/:conversationId
 * @desc    Delete a conversation
 * @access  Private
 */
router.delete('/conversations/:conversationId', 
  validateParams(conversationIdParamsSchema), 
  chatController.deleteConversation
);

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * @route   POST /api/chat/send
 * @desc    Send a message and create a conversation in one call
 * @access  Private
 */
router.post('/send',
  validateBody(sendBodySchema),
  chatController.send
);

/**
 * @route   POST /api/chat/conversations/:conversationId/messages
 * @desc    Send a message in a conversation
 * @access  Private
 */
router.post('/conversations/:conversationId/messages', 
  validateParams(conversationIdParamsSchema), 
  validateBody(sendMessageBodySchema), 
  chatController.sendMessage
);

/**
 * @route   POST /api/chat/conversations/:conversationId/messages/stream
 * @desc    Send a message with streaming response
 * @access  Private
 */
router.post('/conversations/:conversationId/messages/stream', 
  validateParams(conversationIdParamsSchema), 
  validateBody(sendMessageBodySchema), 
  chatController.sendMessageStream
);

/**
 * @route   GET /api/chat/conversations/:conversationId/messages
 * @desc    Get messages from a conversation
 * @access  Private
 */
router.get('/conversations/:conversationId/messages', 
  validateParams(conversationIdParamsSchema), 
  validateQuery(getMessagesQuerySchema), 
  chatController.getMessages
);

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * @route   GET /api/chat/usage
 * @desc    Get user's token usage statistics
 * @access  Private
 */
router.get('/usage', chatController.getTokenUsage);

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * @route   GET /api/chat/health
 * @desc    Health check for chat service
 * @access  Private
 */
router.get('/health', chatController.healthCheck);

export { router as chatRoutes };

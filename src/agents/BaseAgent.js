import { logger } from '../utils/logger.js';

export class BaseAgent {
  constructor() {
    this.name = this.constructor.name;
    this.createdAt = new Date().toISOString();
    logger.info(`Initializing agent: ${this.name}`);
  }

  async initialize() {
    logger.info(`${this.name} agent initialized successfully`);
  }

  async execute(task) {
    logger.info(`Executing task with ${this.name}:`, task);
    throw new Error('execute method must be implemented by subclass');
  }

  async validateInput(input) {
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected object');
    }
    return true;
  }

  async handleError(error, context = {}) {
    logger.error(`Error in ${this.name}:`, { error: error.message, context });
    throw error;
  }

  getAgentInfo() {
    return {
      name: this.name,
      createdAt: this.createdAt,
      status: 'active'
    };
  }
}
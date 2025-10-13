/**
 * Queue Service
 * Manages the Redis-based job queue for asynchronous tasks.
 */

import IORedis, { RedisOptions } from 'ioredis';
import { CONFIG } from '@/config';

class QueueService {
  private client: IORedis;
  private queueName = 'document-processing-queue';

  constructor() {
    const redisOptions: RedisOptions = {
      db: CONFIG.database.redis.db,
    };

    if (CONFIG.database.redis.password) {
      redisOptions.password = CONFIG.database.redis.password;
    }

    this.client = new IORedis(CONFIG.database.redis.url, redisOptions);
  }

  public async add(jobName: string, data: any): Promise<void> {
    await this.client.lpush(this.queueName, JSON.stringify({ jobName, data }));
  }
}

export const redisQueue = new QueueService();

import { createClient, RedisClientType } from 'redis';
import { env } from '../config/environment';
import { logger } from '../logging/logger';

// Redis configuration
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  connectTimeout: number;
}

// Cache entry with TTL
interface CacheEntry<T = any> {
  value: T;
  expiresAt?: number;
}

// Redis connection class
export class RedisConnection {
  private client: RedisClientType | null = null;
  private isInitialized = false;
  private config: RedisConfig;

  constructor() {
    this.config = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized && this.client?.isReady) return;

    try {
      this.client = createClient({
        socket: {
          host: this.config.host,
          port: this.config.port,
          connectTimeout: this.config.connectTimeout,
        },
        password: this.config.password,
      });

      this.client.on('error', (error) => {
        logger.error('Redis client error', error);
      });

      this.client.on('connect', () => {
        logger.debug('Redis client connected');
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });

      this.client.on('end', () => {
        logger.debug('Redis client disconnected');
      });

      await this.client.connect();
      this.isInitialized = true;
      logger.info('Redis connection initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Redis connection', error as Error);
      // Don't throw - allow app to continue without Redis
      this.client = null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client?.isReady) {
      await this.client.quit();
      this.client = null;
      this.isInitialized = false;
      logger.info('Redis connection closed');
    }
  }

  private ensureConnected(): void {
    if (!this.client?.isReady) {
      throw new Error('Redis client not connected');
    }
  }

  // Basic operations
  async get<T = string>(key: string): Promise<T | null> {
    try {
      this.ensureConnected();
      const value = await this.client!.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET failed', error as Error, { key });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      this.ensureConnected();
      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.client!.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client!.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      logger.error('Redis SET failed', error as Error, { key, ttlSeconds });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      this.ensureConnected();
      const result = await this.client!.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis DEL failed', error as Error, { key });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      this.ensureConnected();
      const result = await this.client!.exists(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis EXISTS failed', error as Error, { key });
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      this.ensureConnected();
      const result = await this.client!.expire(key, ttlSeconds);
      return result;
    } catch (error) {
      logger.error('Redis EXPIRE failed', error as Error, { key, ttlSeconds });
      return false;
    }
  }

  // List operations
  async lpush(key: string, ...values: any[]): Promise<number> {
    try {
      this.ensureConnected();
      const serialized = values.map(v => JSON.stringify(v));
      return await this.client!.lPush(key, serialized);
    } catch (error) {
      logger.error('Redis LPUSH failed', error as Error, { key });
      return 0;
    }
  }

  async rpush(key: string, ...values: any[]): Promise<number> {
    try {
      this.ensureConnected();
      const serialized = values.map(v => JSON.stringify(v));
      return await this.client!.rPush(key, serialized);
    } catch (error) {
      logger.error('Redis RPUSH failed', error as Error, { key });
      return 0;
    }
  }

  async lpop<T = any>(key: string): Promise<T | null> {
    try {
      this.ensureConnected();
      const value = await this.client!.lPop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis LPOP failed', error as Error, { key });
      return null;
    }
  }

  async rpop<T = any>(key: string): Promise<T | null> {
    try {
      this.ensureConnected();
      const value = await this.client!.rPop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis RPOP failed', error as Error, { key });
      return null;
    }
  }

  async lrange<T = any>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      this.ensureConnected();
      const values = await this.client!.lRange(key, start, stop);
      return values.map(v => JSON.parse(v));
    } catch (error) {
      logger.error('Redis LRANGE failed', error as Error, { key, start, stop });
      return [];
    }
  }

  async llen(key: string): Promise<number> {
    try {
      this.ensureConnected();
      return await this.client!.lLen(key);
    } catch (error) {
      logger.error('Redis LLEN failed', error as Error, { key });
      return 0;
    }
  }

  // Hash operations
  async hget<T = string>(key: string, field: string): Promise<T | null> {
    try {
      this.ensureConnected();
      const value = await this.client!.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis HGET failed', error as Error, { key, field });
      return null;
    }
  }

  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      this.ensureConnected();
      const serialized = JSON.stringify(value);
      const result = await this.client!.hSet(key, field, serialized);
      return result >= 0;
    } catch (error) {
      logger.error('Redis HSET failed', error as Error, { key, field });
      return false;
    }
  }

  async hgetall<T = Record<string, any>>(key: string): Promise<T | null> {
    try {
      this.ensureConnected();
      const hash = await this.client!.hGetAll(key);
      if (Object.keys(hash).length === 0) return null;
      
      const parsed: Record<string, any> = {};
      for (const [field, value] of Object.entries(hash)) {
        parsed[field] = JSON.parse(value);
      }
      return parsed as T;
    } catch (error) {
      logger.error('Redis HGETALL failed', error as Error, { key });
      return null;
    }
  }

  // Pattern operations
  async keys(pattern: string): Promise<string[]> {
    try {
      this.ensureConnected();
      return await this.client!.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS failed', error as Error, { pattern });
      return [];
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      this.ensureConnected();
      const result = await this.client!.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING failed', error as Error);
      return false;
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this.client?.isReady ?? false;
  }

  // Raw client access for advanced operations
  get raw(): RedisClientType | null {
    return this.client;
  }
}

// Singleton instance
export const redis = new RedisConnection();

// Helper functions for common patterns
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache first
  const cached = await redis.get<T>(key);
  if (cached !== null) {
    logger.debug('Cache hit', { key });
    return cached;
  }

  // Fetch and cache
  logger.debug('Cache miss', { key });
  const value = await fetcher();
  await redis.set(key, value, ttlSeconds);
  return value;
}

// Session management helpers
export const SESSION_PREFIX = 'session:';
export const RESPONSE_LIST_PREFIX = 'response:';

export async function setSession(sessionId: string, data: any, ttlSeconds: number = 3600): Promise<boolean> {
  return redis.set(`${SESSION_PREFIX}${sessionId}`, data, ttlSeconds);
}

export async function getSession<T = any>(sessionId: string): Promise<T | null> {
  return redis.get<T>(`${SESSION_PREFIX}${sessionId}`);
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  return redis.del(`${SESSION_PREFIX}${sessionId}`);
}

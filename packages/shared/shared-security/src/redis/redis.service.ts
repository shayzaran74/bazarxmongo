// packages/shared/shared-security/src/redis/redis.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Merkezi Redis servisi. 
 * Token blacklist ve session yönetimi için kullanılır.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required');
    }
    this.client = new Redis(redisUrl);
  }

  onModuleInit() {
    // Bağlantı zaten constructor'da başlatıldı
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * Ana Redis istemcisini döner.
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Verilen anahtara (key) veri set eder (TTL ile birlikte).
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Verilen anahtardaki veriyi getirir.
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Verilen anahtarı siler.
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}

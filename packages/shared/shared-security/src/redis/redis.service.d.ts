import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
/**
 * Merkezi Redis servisi.
 * Token blacklist ve session yönetimi için kullanılır.
 */
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private client;
    constructor();
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    /**
     * Ana Redis istemcisini döner.
     */
    getClient(): Redis;
    /**
     * Verilen anahtara (key) veri set eder (TTL ile birlikte).
     */
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    /**
     * Verilen anahtardaki veriyi getirir.
     */
    get(key: string): Promise<string | null>;
    /**
     * Verilen anahtarı siler.
     */
    del(key: string): Promise<void>;
}

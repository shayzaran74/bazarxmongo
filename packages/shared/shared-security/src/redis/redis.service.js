"use strict";
// packages/shared/shared-security/src/redis/redis.service.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
/**
 * Merkezi Redis servisi.
 * Token blacklist ve session yönetimi için kullanılır.
 */
let RedisService = class RedisService {
    client;
    constructor() {
        this.client = new ioredis_1.Redis(process.env.REDIS_URL || 'redis://localhost:6379');
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
    getClient() {
        return this.client;
    }
    /**
     * Verilen anahtara (key) veri set eder (TTL ile birlikte).
     */
    async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        }
        else {
            await this.client.set(key, value);
        }
    }
    /**
     * Verilen anahtardaki veriyi getirir.
     */
    async get(key) {
        return this.client.get(key);
    }
    /**
     * Verilen anahtarı siler.
     */
    async del(key) {
        await this.client.del(key);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map
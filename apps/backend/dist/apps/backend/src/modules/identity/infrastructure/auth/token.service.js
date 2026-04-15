"use strict";
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
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const shared_security_1 = require("@barterborsa/shared-security");
let TokenService = class TokenService {
    jwtService;
    redisService;
    constructor(jwtService, redisService) {
        this.jwtService = jwtService;
        this.redisService = redisService;
    }
    async generateAccessToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            platform: user.platform
        };
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-key-123',
            expiresIn: '15m'
        });
    }
    async generateRefreshToken(user) {
        const payload = {
            sub: user.id,
            email: user.email
        };
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key-123',
            expiresIn: '7d'
        });
    }
    async verifyRefreshToken(token) {
        try {
            const isBlacklisted = await this.isTokenBlacklisted(token);
            if (isBlacklisted) {
                throw new common_1.UnauthorizedException('Token geçersiz (Blacklist)');
            }
            return this.jwtService.verify(token, {
                secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key-123'
            });
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Geçersiz Refresh Token');
        }
    }
    async blacklistToken(token, expiresInSeconds) {
        await this.redisService.set(`blacklist:${token}`, '1', expiresInSeconds);
    }
    async isTokenBlacklisted(token) {
        const result = await this.redisService.get(`blacklist:${token}`);
        return result !== null;
    }
    async revokeRefreshToken(token) {
        await this.blacklistToken(token, 7 * 24 * 60 * 60); // 7 days
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        shared_security_1.RedisService])
], TokenService);
//# sourceMappingURL=token.service.js.map
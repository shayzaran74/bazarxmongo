"use strict";
// packages/shared/shared-security/src/shared-security.module.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedSecurityModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const hashing_service_1 = require("./encryption/hashing.service");
const encryption_service_1 = require("./encryption/encryption.service");
const redis_service_1 = require("./redis/redis.service");
const jwt_strategy_1 = require("./auth/jwt.strategy");
const google_oauth_strategy_1 = require("./auth/google-oauth.strategy");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const roles_guard_1 = require("./auth/roles.guard");
let SharedSecurityModule = class SharedSecurityModule {
};
exports.SharedSecurityModule = SharedSecurityModule;
exports.SharedSecurityModule = SharedSecurityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                useFactory: () => ({
                    secret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-key-123',
                    signOptions: {
                        expiresIn: '15m' // Access Token ömrü 15 dakika
                    },
                }),
            }),
        ],
        providers: [
            hashing_service_1.HashingService,
            encryption_service_1.EncryptionService,
            redis_service_1.RedisService,
            jwt_strategy_1.JwtStrategy,
            google_oauth_strategy_1.GoogleOAuthStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
        ],
        exports: [
            hashing_service_1.HashingService,
            encryption_service_1.EncryptionService,
            redis_service_1.RedisService,
            jwt_strategy_1.JwtStrategy,
            google_oauth_strategy_1.GoogleOAuthStrategy,
            jwt_1.JwtModule,
            passport_1.PassportModule,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
        ],
    })
], SharedSecurityModule);
//# sourceMappingURL=shared-security.module.js.map
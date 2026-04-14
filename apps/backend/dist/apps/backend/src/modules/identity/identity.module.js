"use strict";
// apps/backend/src/modules/identity/identity.module.ts
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
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
const shared_security_1 = require("@barterborsa/shared-security");
const domain_identity_1 = require("@barterborsa/domain-identity");
const auth_controller_1 = require("./auth.controller");
const google_oauth_controller_1 = require("./google-oauth.controller");
const auth_service_1 = require("./infrastructure/auth/auth.service");
const token_service_1 = require("./infrastructure/auth/token.service");
const google_auth_guard_1 = require("./infrastructure/auth/google-auth.guard");
let IdentityModule = class IdentityModule {
    googleStrategy;
    constructor(googleStrategy) {
        this.googleStrategy = googleStrategy;
        // Strateji başlatıldı.
    }
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            shared_security_1.SharedSecurityModule,
            shared_persistence_1.PrismaModule,
        ],
        controllers: [
            auth_controller_1.AuthController,
            google_oauth_controller_1.GoogleOAuthController,
        ],
        providers: [
            auth_service_1.AuthService,
            token_service_1.TokenService,
            google_auth_guard_1.GoogleAuthGuard,
            shared_security_1.GoogleOAuthStrategy,
            {
                provide: 'IUserRepository',
                useFactory: (prisma) => new domain_identity_1.PrismaUserRepository(prisma),
                inject: [shared_persistence_1.PrismaService],
            },
            {
                provide: domain_identity_1.RegisterUserUseCase,
                useFactory: (repo, hash) => new domain_identity_1.RegisterUserUseCase(repo, hash),
                inject: ['IUserRepository', shared_security_1.HashingService],
            },
            {
                provide: domain_identity_1.LoginUserUseCase,
                useFactory: (repo, hash) => new domain_identity_1.LoginUserUseCase(repo, hash),
                inject: ['IUserRepository', shared_security_1.HashingService],
            },
        ],
        exports: [auth_service_1.AuthService, token_service_1.TokenService, domain_identity_1.RegisterUserUseCase],
    }),
    __metadata("design:paramtypes", [shared_security_1.GoogleOAuthStrategy])
], IdentityModule);
//# sourceMappingURL=identity.module.js.map
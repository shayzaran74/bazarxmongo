"use strict";
// apps/backend/src/modules/identity/identity.module.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
const shared_security_1 = require("@barterborsa/shared-security");
const domain_identity_1 = require("@barterborsa/domain-identity");
const auth_controller_1 = require("./auth.controller");
let IdentityModule = class IdentityModule {
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [shared_persistence_1.PrismaModule],
        controllers: [auth_controller_1.AuthController],
        providers: [
            shared_security_1.HashingService,
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
        exports: [domain_identity_1.RegisterUserUseCase, domain_identity_1.LoginUserUseCase],
    })
], IdentityModule);
//# sourceMappingURL=identity.module.js.map
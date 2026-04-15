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
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
const shared_security_1 = require("@barterborsa/shared-security");
const domain_identity_1 = require("@barterborsa/domain-identity");
const auth_controller_1 = require("./auth.controller");
const google_oauth_controller_1 = require("./google-oauth.controller");
const profile_controller_1 = require("./profile.controller");
const address_controller_1 = require("./address.controller");
const user_controller_1 = require("./user.controller");
const auth_service_1 = require("./infrastructure/auth/auth.service");
const token_service_1 = require("./infrastructure/auth/token.service");
const google_auth_guard_1 = require("./infrastructure/auth/google-auth.guard");
const Handlers = [
    domain_identity_1.RegisterUserHandler,
    domain_identity_1.LoginUserHandler,
    domain_identity_1.UpdateProfileHandler,
    domain_identity_1.ChangePasswordHandler,
    domain_identity_1.AddAddressHandler,
    domain_identity_1.UpdateAddressHandler,
    domain_identity_1.DeleteAddressHandler,
    domain_identity_1.SetTransactionPinHandler,
    domain_identity_1.GetUserHandler,
    domain_identity_1.GetProfileHandler,
    domain_identity_1.ListUsersHandler,
    domain_identity_1.GetAddressesHandler,
    domain_identity_1.GetLoginHistoryHandler,
    domain_identity_1.UserRegisteredHandler,
    domain_identity_1.UserUpdatedHandler,
    domain_identity_1.ForgotPasswordHandler,
    domain_identity_1.ResetPasswordHandler,
];
let IdentityModule = class IdentityModule {
    googleStrategy;
    constructor(googleStrategy) {
        this.googleStrategy = googleStrategy;
    }
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            shared_security_1.SharedSecurityModule,
            shared_persistence_1.PrismaModule,
        ],
        controllers: [
            auth_controller_1.AuthController,
            google_oauth_controller_1.GoogleOAuthController,
            profile_controller_1.ProfileController,
            address_controller_1.AddressController,
            user_controller_1.UserController,
        ],
        providers: [
            auth_service_1.AuthService,
            token_service_1.TokenService,
            google_auth_guard_1.GoogleAuthGuard,
            shared_security_1.GoogleOAuthStrategy,
            domain_identity_1.SessionService,
            domain_identity_1.IdentityEventPublisher,
            domain_identity_1.LocalStrategy,
            ...Handlers,
            {
                provide: 'IUserRepository',
                useFactory: (prisma) => new domain_identity_1.PrismaUserRepository(prisma),
                inject: [shared_persistence_1.PrismaService],
            },
            {
                provide: 'IUserProfileRepository',
                useFactory: (prisma) => new domain_identity_1.PrismaUserProfileRepository(prisma),
                inject: [shared_persistence_1.PrismaService],
            },
            {
                provide: 'IUserAddressRepository',
                useFactory: (prisma) => new domain_identity_1.PrismaUserAddressRepository(prisma),
                inject: [shared_persistence_1.PrismaService],
            },
            {
                provide: 'IVerificationTokenRepository',
                useFactory: (prisma) => new domain_identity_1.PrismaVerificationTokenRepository(prisma),
                inject: [shared_persistence_1.PrismaService],
            },
            {
                provide: 'IEventBus',
                useValue: { publish: async (topic, data) => console.log(`[EventBus] ${topic}`, data) },
            }
        ],
        exports: [auth_service_1.AuthService, token_service_1.TokenService],
    }),
    __metadata("design:paramtypes", [shared_security_1.GoogleOAuthStrategy])
], IdentityModule);
//# sourceMappingURL=identity.module.js.map
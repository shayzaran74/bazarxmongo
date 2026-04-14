"use strict";
// apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const domain_identity_1 = require("@barterborsa/domain-identity");
const token_service_1 = require("./token.service");
const shared_security_1 = require("@barterborsa/shared-security");
const domain_identity_2 = require("@barterborsa/domain-identity");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
let AuthService = class AuthService {
    loginUserUseCase;
    tokenService;
    hashingService;
    prisma;
    userRepository;
    constructor(loginUserUseCase, tokenService, hashingService, prisma, userRepository) {
        this.loginUserUseCase = loginUserUseCase;
        this.tokenService = tokenService;
        this.hashingService = hashingService;
        this.prisma = prisma;
        this.userRepository = userRepository;
    }
    /**
     * E-posta ve şifre ile giriş işlemi.
     */
    async login(input) {
        const result = await this.loginUserUseCase.execute(input);
        if (!result.success) {
            throw new common_1.UnauthorizedException(result.error.message);
        }
        const user = result.data;
        const tokens = await this.generateUserTokens(user);
        // Session kaydı oluştur
        await this.createSession(user.id);
        return {
            user: this.toResponseDto(user),
            ...tokens,
        };
    }
    /**
     * Google OAuth ile giriş veya otomatik kayıt işlemi.
     */
    async googleLogin(googleProfile) {
        let user = await this.userRepository.findByEmail(googleProfile.email);
        if (!user) {
            // Kullanıcı yoksa Google bilgileriyle oluştur (Şifresiz hesap)
            const userResult = domain_identity_2.User.create({
                email: googleProfile.email,
                googleId: googleProfile.googleId,
                firstName: googleProfile.firstName,
                lastName: googleProfile.lastName,
                role: 'USER',
                status: 'ACTIVE',
                isEmailVerified: true,
                platform: 'BAZARX',
            });
            if (!userResult.success) {
                throw new Error('Google kullanıcısı oluşturulamadı.');
            }
            user = userResult.data;
            await this.userRepository.save(user);
        }
        const tokens = await this.generateUserTokens(user);
        // Session kaydı oluştur
        await this.createSession(user.id);
        return {
            user: this.toResponseDto(user),
            ...tokens,
        };
    }
    /**
     * Kullanıcı için Session oluşturur (PostgreSQL).
     * Redis session mantığı TokenService/Blacklist üzerinden yürütülür.
     */
    async createSession(userId) {
        await this.prisma.session.create({
            data: {
                userId,
                userAgent: 'Backend-Node', // İleride request'ten alınabilir
                ipAddress: '127.0.0.1', // İleride request'ten alınabilir
            },
        });
    }
    /**
     * Kullanıcı için yeni token seti üretir.
     */
    async generateUserTokens(user) {
        const accessToken = await this.tokenService.generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
            platform: user.platform
        });
        const refreshToken = await this.tokenService.generateRefreshToken({
            id: user.id,
            email: user.email
        });
        return { accessToken, refreshToken };
    }
    /**
     * User entity'sini frontend'e dönecek güvenli bir nesneye çevirir.
     */
    toResponseDto(user) {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)('IUserRepository')),
    __metadata("design:paramtypes", [domain_identity_1.LoginUserUseCase,
        token_service_1.TokenService,
        shared_security_1.HashingService,
        shared_persistence_1.PrismaService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map
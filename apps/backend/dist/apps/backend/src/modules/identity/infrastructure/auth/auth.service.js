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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const domain_identity_1 = require("@barterborsa/domain-identity");
const token_service_1 = require("./token.service");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
let AuthService = AuthService_1 = class AuthService {
    commandBus;
    tokenService;
    prisma;
    userRepository;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(commandBus, tokenService, prisma, userRepository) {
        this.commandBus = commandBus;
        this.tokenService = tokenService;
        this.prisma = prisma;
        this.userRepository = userRepository;
    }
    /**
     * E-posta ve şifre ile giriş işlemi.
     */
    async login(input) {
        const result = await this.commandBus.execute(new domain_identity_1.LoginUserCommand(input));
        if (!result.success) {
            throw new common_1.UnauthorizedException(result.error.message);
        }
        const user = result.data;
        const tokens = await this.generateUserTokens(user);
        // Session kaydı oluştur
        await this.createSession(user.id);
        return {
            user: domain_identity_1.UserResponseDto.fromEntity(user),
            ...tokens,
        };
    }
    /**
     * Google OAuth ile giriş veya otomatik kayıt işlemi.
     */
    async googleLogin(googleProfile) {
        let user = await this.userRepository.findByEmail(googleProfile.email);
        if (!user) {
            const userResult = domain_identity_1.User.create({
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
        await this.createSession(user.id);
        return {
            user: domain_identity_1.UserResponseDto.fromEntity(user),
            ...tokens,
        };
    }
    /**
     * Refresh token ile yeni access token üretir.
     */
    async refresh(refreshToken) {
        try {
            const payload = await this.tokenService.verifyRefreshToken(refreshToken);
            const user = await this.userRepository.findById(payload.sub);
            if (!user || user.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('Kullanıcı bulunamadı veya pasif.');
            }
            // Old token'ı revoke et (rotation)
            await this.tokenService.revokeRefreshToken(refreshToken);
            const tokens = await this.generateUserTokens(user);
            return tokens;
        }
        catch (e) {
            this.logger.error(`Refresh failed: ${e.message}`);
            throw new common_1.UnauthorizedException('Refresh token geçersiz.');
        }
    }
    /**
     * Çıkış işlemi: Session silinir ve token blacklist'e eklenir.
     */
    async logout(userId, refreshToken) {
        // Session'ları sil
        await this.prisma.session.deleteMany({ where: { userId } });
        // Refresh token'ı geçersiz kıl
        if (refreshToken) {
            await this.tokenService.revokeRefreshToken(refreshToken);
        }
    }
    async createSession(userId) {
        await this.prisma.session.create({
            data: {
                userId,
                userAgent: 'Backend-Node',
                ipAddress: '127.0.0.1',
            },
        });
    }
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)('IUserRepository')),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        token_service_1.TokenService,
        shared_persistence_1.PrismaService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map
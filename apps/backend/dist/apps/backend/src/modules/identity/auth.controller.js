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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const domain_identity_1 = require("@barterborsa/domain-identity");
const auth_service_1 = require("./infrastructure/auth/auth.service");
const shared_security_1 = require("@barterborsa/shared-security");
let AuthController = class AuthController {
    commandBus;
    queryBus;
    authService;
    constructor(commandBus, queryBus, authService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.authService = authService;
    }
    async me(req) {
        return this.queryBus.execute(new domain_identity_1.GetUserQuery(req.user.id));
    }
    async register(dto) {
        const result = await this.commandBus.execute(new domain_identity_1.RegisterUserCommand(dto));
        if (!result.success) {
            throw new common_1.HttpException(result.error.message, common_1.HttpStatus.BAD_REQUEST);
        }
        return {
            success: true,
            message: 'Kullanıcı başarıyla oluşturuldu.',
            data: result.data,
        };
    }
    async login(input) {
        const authData = await this.authService.login(input);
        return {
            success: true,
            message: 'Giriş başarılı.',
            data: authData,
        };
    }
    async refresh(refreshToken) {
        const tokens = await this.authService.refresh(refreshToken);
        return {
            success: true,
            data: tokens
        };
    }
    async logout(req) {
        await this.authService.logout(req.user.id);
        return {
            success: true,
            message: 'Çıkış yapıldı.',
        };
    }
    async forgotPassword(dto) {
        await this.commandBus.execute(new domain_identity_1.ForgotPasswordCommand(dto));
        return {
            success: true,
            message: 'Eğer e-posta adresi kayıtlı ise bir bağlantı gönderilecektir.',
        };
    }
    async resetPassword(dto) {
        const result = await this.commandBus.execute(new domain_identity_1.ResetPasswordCommand(dto));
        if (!result.success) {
            throw new common_1.HttpException(result.error.message, common_1.HttpStatus.BAD_REQUEST);
        }
        return {
            success: true,
            message: 'Şifreniz başarıyla sıfırlandı.',
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile', description: 'Oturum açmış kullanıcının bilgilerini döner.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kullanıcı bilgileri.' }),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, shared_security_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user', description: 'Yeni bir kullanıcı hesabı oluşturur.' }),
    (0, swagger_1.ApiBody)({ type: domain_identity_1.RegisterUserDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Kullanıcı başarıyla oluşturuldu.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Geçersiz veri veya e-posta zaten kullanımda.' }),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [domain_identity_1.RegisterUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, shared_security_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Login user', description: 'Kullanıcı girişi yapar ve JWT token döner.' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'Password123!' }
            },
            required: ['email', 'password']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Giriş başarılı.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Hatalı e-posta veya şifre.' }),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, shared_security_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token', description: 'Refresh token kullanarak yeni bir access token alır.' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                refreshToken: { type: 'string' }
            },
            required: ['refreshToken']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token yenileme başarılı.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Geçersiz veya süresi dolmuş refresh token.' }),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user', description: 'Kullanıcı oturumunu sonlandırır ve refresh token\'ı geçersiz kılar.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Çıkış yapıldı.' }),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, shared_security_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset link', description: 'Şifre sıfırlama bağlantısı talep eder.' }),
    (0, swagger_1.ApiBody)({ type: domain_identity_1.ForgotPasswordDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bağlantı başarıyla gönderildi.' }),
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, shared_security_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password', description: 'Şifre sıfırlama işlemini tamamlar.' }),
    (0, swagger_1.ApiBody)({ type: domain_identity_1.ResetPasswordDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Şifre başarıyla sıfırlandı.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Geçersiz veya süresi dolmuş token.' }),
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
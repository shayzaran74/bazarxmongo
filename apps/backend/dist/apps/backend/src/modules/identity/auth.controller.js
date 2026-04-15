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
const domain_identity_1 = require("@barterborsa/domain-identity");
const auth_service_1 = require("./infrastructure/auth/auth.service");
const shared_security_1 = require("@barterborsa/shared-security");
let AuthController = class AuthController {
    commandBus;
    authService;
    constructor(commandBus, authService) {
        this.commandBus = commandBus;
        this.authService = authService;
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
    (0, shared_security_1.Public)(),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [domain_identity_1.RegisterUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, shared_security_1.Public)(),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, shared_security_1.Public)(),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, shared_security_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, shared_security_1.Public)(),
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
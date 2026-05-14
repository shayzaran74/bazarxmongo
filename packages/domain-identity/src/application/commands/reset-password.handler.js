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
exports.ResetPasswordHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reset_password_command_1 = require("./reset-password.command");
const shared_security_1 = require("@barterborsa/shared-security");
const shared_core_1 = require("@barterborsa/shared-core");
let ResetPasswordHandler = class ResetPasswordHandler {
    userRepository;
    tokenRepository;
    hashingService;
    constructor(userRepository, tokenRepository, hashingService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.hashingService = hashingService;
    }
    async execute(command) {
        const { token, newPassword } = command.dto;
        // Tokenı bul
        const tokenResult = await this.tokenRepository.findByToken(token);
        if (!tokenResult || tokenResult.type !== 'PASSWORD_RESET') {
            return (0, shared_core_1.Err)(new shared_core_1.DomainException('Geçersiz veya süresi dolmuş token.'));
        }
        // Süre kontrolü
        if (new Date() > tokenResult.expiresAt) {
            await this.tokenRepository.delete(tokenResult.id);
            return (0, shared_core_1.Err)(new shared_core_1.DomainException('Token süresi dolmuş.'));
        }
        // Kullanıcıyı bul
        const user = await this.userRepository.findById(tokenResult.userId);
        if (!user) {
            return (0, shared_core_1.Err)(new shared_core_1.NotFoundException('Kullanıcı bulunamadı.'));
        }
        // Yeni şifreyi hashle ve kaydet
        const hashedPassword = await this.hashingService.hash(newPassword);
        // User entity içinde passwordHash güncelleme metodu olmalı veya direkt props üzerinden (shared-core AggregateRoot izin veriyorsa)
        // Şimdilik set-transaction-pin benzeri bir yaklaşımla:
        user.props.passwordHash = hashedPassword;
        await this.userRepository.update(user);
        // Kullanılan tokenı sil
        await this.tokenRepository.delete(tokenResult.id);
        return (0, shared_core_1.Ok)(undefined);
    }
};
exports.ResetPasswordHandler = ResetPasswordHandler;
exports.ResetPasswordHandler = ResetPasswordHandler = __decorate([
    (0, cqrs_1.CommandHandler)(reset_password_command_1.ResetPasswordCommand),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __param(1, (0, common_1.Inject)('IVerificationTokenRepository')),
    __metadata("design:paramtypes", [Object, Object, shared_security_1.HashingService])
], ResetPasswordHandler);
//# sourceMappingURL=reset-password.handler.js.map
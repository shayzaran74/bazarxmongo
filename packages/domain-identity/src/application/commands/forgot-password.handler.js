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
exports.ForgotPasswordHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const forgot_password_command_1 = require("./forgot-password.command");
const shared_core_1 = require("@barterborsa/shared-core");
let ForgotPasswordHandler = class ForgotPasswordHandler {
    userRepository;
    tokenRepository;
    eventBus;
    constructor(userRepository, tokenRepository, eventBus) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.eventBus = eventBus;
    }
    async execute(command) {
        const { email } = command.dto;
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            // Güvenlik nedeniyle kullanıcı bulunamadığında da başarılı dönüyoruz (email enumeration engelleme)
            return (0, shared_core_1.Ok)(undefined);
        }
        // Varsa eski tokenları temizle
        await this.tokenRepository.deleteByUserIdAndType(user.id, 'PASSWORD_RESET');
        // 1 saat geçerli token oluştur (6 haneli veya UUID olabilir, biz şimdilik random string/hex yapalım)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        const token = await this.tokenRepository.create(user.id, 'PASSWORD_RESET', expiresAt);
        // Event fırlat (Email gönderimi için)
        this.eventBus.publish('auth.password_reset_requested', {
            userId: user.id,
            email: user.email,
            token: token,
        });
        return (0, shared_core_1.Ok)(undefined);
    }
};
exports.ForgotPasswordHandler = ForgotPasswordHandler;
exports.ForgotPasswordHandler = ForgotPasswordHandler = __decorate([
    (0, cqrs_1.CommandHandler)(forgot_password_command_1.ForgotPasswordCommand),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __param(1, (0, common_1.Inject)('IVerificationTokenRepository')),
    __param(2, (0, common_1.Inject)('IEventBus')),
    __metadata("design:paramtypes", [Object, Object, Object])
], ForgotPasswordHandler);
//# sourceMappingURL=forgot-password.handler.js.map
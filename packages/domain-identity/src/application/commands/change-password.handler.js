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
exports.ChangePasswordHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const change_password_command_1 = require("./change-password.command");
const shared_security_1 = require("@barterborsa/shared-security");
const shared_core_1 = require("@barterborsa/shared-core");
let ChangePasswordHandler = class ChangePasswordHandler {
    userRepository;
    hashingService;
    constructor(userRepository, hashingService) {
        this.userRepository = userRepository;
        this.hashingService = hashingService;
    }
    async execute(command) {
        const { userId, dto } = command;
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return (0, shared_core_1.Err)(new shared_core_1.NotFoundException('Kullanıcı bulunamadı.'));
        }
        if (user.passwordHash) {
            const isValid = await this.hashingService.compare(dto.currentPassword, user.passwordHash);
            if (!isValid) {
                return (0, shared_core_1.Err)(new shared_core_1.DomainException('Mevcut şifre hatalı. Lütfen kontrol edip tekrar deneyin.'));
            }
        }
        else if (dto.currentPassword) {
            // Kullanıcının şifresi yok (Google ile kayıt olmuş olabilir) ama bir mevcut şifre girmiş
            return (0, shared_core_1.Err)(new shared_core_1.DomainException('Hesabınızda kayıtlı bir şifre bulunamadı. Lütfen destek ile iletişime geçin.'));
        }
        const newHash = await this.hashingService.hash(dto.newPassword);
        user.changePassword(newHash);
        await this.userRepository.update(user);
        return (0, shared_core_1.Ok)(undefined);
    }
};
exports.ChangePasswordHandler = ChangePasswordHandler;
exports.ChangePasswordHandler = ChangePasswordHandler = __decorate([
    (0, cqrs_1.CommandHandler)(change_password_command_1.ChangePasswordCommand),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, shared_security_1.HashingService])
], ChangePasswordHandler);
//# sourceMappingURL=change-password.handler.js.map
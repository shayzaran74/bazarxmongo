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
exports.RegisterUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const register_user_command_1 = require("./register-user.command");
const shared_security_1 = require("@barterborsa/shared-security");
const shared_core_1 = require("@barterborsa/shared-core");
const user_response_dto_1 = require("../dtos/user-response.dto");
const user_entity_1 = require("../../domain/entities/user.entity");
let RegisterUserHandler = class RegisterUserHandler {
    userRepository;
    verificationTokenRepository;
    hashingService;
    eventBus;
    constructor(userRepository, verificationTokenRepository, hashingService, eventBus) {
        this.userRepository = userRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.hashingService = hashingService;
        this.eventBus = eventBus;
    }
    async execute(command) {
        const { email, password, phoneNumber, platform, referralCode } = command.dto;
        const exists = await this.userRepository.exists(email);
        if (exists) {
            return (0, shared_core_1.Err)(new shared_core_1.DomainException('Bu e-posta adresi zaten kullanımda.'));
        }
        const passwordHash = await this.hashingService.hash(password);
        const userResult = user_entity_1.User.create({
            email,
            passwordHash,
            firstName: command.dto.firstName,
            lastName: command.dto.lastName,
            phoneNumber,
            platform: platform || 'BAZARX',
            role: 'USER',
            status: 'ACTIVE',
            isEmailVerified: false,
        });
        if (!userResult.success) {
            return (0, shared_core_1.Err)(new shared_core_1.DomainException('Kullanıcı oluşturulamadı.'));
        }
        const user = userResult.data;
        await this.userRepository.save(user);
        // E-posta doğrulama kodu oluştur (1 saat geçerli)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        const verificationCode = await this.verificationTokenRepository.create(user.id, 'EMAIL', expiresAt);
        // RabbitMQ Publish user.registered
        this.eventBus.publish('user.registered', {
            userId: user.id,
            email: user.email,
            role: user.role,
            platform: user.platform,
            verificationCode: verificationCode
        });
        return (0, shared_core_1.Ok)(user_response_dto_1.UserResponseDto.fromEntity(user));
    }
};
exports.RegisterUserHandler = RegisterUserHandler;
exports.RegisterUserHandler = RegisterUserHandler = __decorate([
    (0, cqrs_1.CommandHandler)(register_user_command_1.RegisterUserCommand),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __param(1, (0, common_1.Inject)('IVerificationTokenRepository')),
    __param(3, (0, common_1.Inject)('IEventBus')),
    __metadata("design:paramtypes", [Object, Object, shared_security_1.HashingService, Object])
], RegisterUserHandler);
//# sourceMappingURL=register-user.handler.js.map
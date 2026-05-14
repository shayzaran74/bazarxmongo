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
exports.LoginUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const login_user_command_1 = require("./login-user.command");
const shared_security_1 = require("@barterborsa/shared-security");
const shared_core_1 = require("@barterborsa/shared-core");
let LoginUserHandler = class LoginUserHandler {
    userRepository;
    hashingService;
    constructor(userRepository, hashingService) {
        this.userRepository = userRepository;
        this.hashingService = hashingService;
    }
    async execute(command) {
        const { email, password } = command.dto;
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return (0, shared_core_1.Err)(new shared_core_1.UnauthorizedException('Geçersiz e-posta veya şifre.'));
        }
        if (!user.passwordHash) {
            return (0, shared_core_1.Err)(new shared_core_1.UnauthorizedException('Bu hesap için şifre tanımlanmamış. Lütfen Google ile giriş yapın.'));
        }
        const isPasswordValid = await this.hashingService.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return (0, shared_core_1.Err)(new shared_core_1.UnauthorizedException('Geçersiz e-posta veya şifre.'));
        }
        if (user.status !== 'ACTIVE') {
            return (0, shared_core_1.Err)(new shared_core_1.DomainException('Hesabınız aktif değil. Durum: ' + user.status));
        }
        return (0, shared_core_1.Ok)(user);
    }
};
exports.LoginUserHandler = LoginUserHandler;
exports.LoginUserHandler = LoginUserHandler = __decorate([
    (0, cqrs_1.CommandHandler)(login_user_command_1.LoginUserCommand),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, shared_security_1.HashingService])
], LoginUserHandler);
//# sourceMappingURL=login-user.handler.js.map
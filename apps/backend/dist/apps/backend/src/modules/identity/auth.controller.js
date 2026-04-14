"use strict";
// apps/backend/src/modules/identity/auth.controller.ts
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
const shared_types_1 = require("@barterborsa/shared-types");
const domain_identity_1 = require("@barterborsa/domain-identity");
let AuthController = class AuthController {
    registerUseCase;
    loginUseCase;
    constructor(registerUseCase, loginUseCase) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
    }
    async register(input) {
        const result = await this.registerUseCase.execute(input);
        if (!result.success) {
            throw new common_1.HttpException(result.error.message, common_1.HttpStatus.BAD_REQUEST);
        }
        return {
            success: true,
            message: 'Kullanıcı başarıyla oluşturuldu.',
            data: {
                id: result.data.id,
                email: result.data.email,
                role: result.data.role,
                firstName: result.data.firstName,
                lastName: result.data.lastName,
            },
        };
    }
    async login(input) {
        const result = await this.loginUseCase.execute(input);
        if (!result.success) {
            throw new common_1.HttpException(result.error.message, common_1.HttpStatus.UNAUTHORIZED);
        }
        return {
            success: true,
            message: 'Giriş başarılı.',
            data: {
                id: result.data.id,
                email: result.data.email,
                role: result.data.role,
                firstName: result.data.firstName,
                lastName: result.data.lastName,
            },
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shared_types_1.RegisterUserInput]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shared_types_1.LoginUserInput]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [domain_identity_1.RegisterUserUseCase,
        domain_identity_1.LoginUserUseCase])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
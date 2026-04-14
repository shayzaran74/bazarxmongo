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
exports.GoogleOAuthController = void 0;
const common_1 = require("@nestjs/common");
const google_auth_guard_1 = require("./infrastructure/auth/google-auth.guard");
const auth_service_1 = require("./infrastructure/auth/auth.service");
const shared_security_1 = require("@barterborsa/shared-security");
let GoogleOAuthController = class GoogleOAuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    /**
     * Google girişini başlatır.
     */
    async googleAuth() {
        // GoogleAuthGuard bizi otomatik yönlendirir.
    }
    /**
     * Google callback endpoint'i.
     */
    async googleAuthRedirect(req, res) {
        const user = req.user;
        const result = await this.authService.googleLogin(user);
        // Frontend'e tokenları ve kullanıcı bilgilerini gönder
        const frontendUrl = process.env.FRONTEND_URL || 'http://192.168.1.102:3000';
        // AuthData içindeki user bilgilerini de ekleyelim
        const url = new URL(`${frontendUrl}/auth/success`);
        url.searchParams.append('accessToken', result.accessToken);
        url.searchParams.append('refreshToken', result.refreshToken);
        url.searchParams.append('userId', result.user.id);
        url.searchParams.append('email', result.user.email);
        url.searchParams.append('role', result.user.role);
        return res.redirect(url.toString());
    }
};
exports.GoogleOAuthController = GoogleOAuthController;
__decorate([
    (0, shared_security_1.Public)(),
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoogleOAuthController.prototype, "googleAuth", null);
__decorate([
    (0, shared_security_1.Public)(),
    (0, common_1.Get)('callback'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GoogleOAuthController.prototype, "googleAuthRedirect", null);
exports.GoogleOAuthController = GoogleOAuthController = __decorate([
    (0, common_1.Controller)('auth/google'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], GoogleOAuthController);
//# sourceMappingURL=google-oauth.controller.js.map
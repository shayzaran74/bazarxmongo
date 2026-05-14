"use strict";
// packages/shared/shared-security/src/auth/google-oauth.strategy.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOAuthStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
/**
 * Google OAuth2 Giriş Stratejisi.
 */
let GoogleOAuthStrategy = class GoogleOAuthStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    logger = new common_1.Logger('GoogleOAuthStrategy');
    constructor() {
        const clientId = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
        super({
            clientID: clientId,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://127.0.0.1.nip.io:3001/api/v1/auth/google/callback',
            scope: ['email', 'profile'],
        });
        this.logger.warn(`[DEBUG] Strateji yüklendi. ClientID: ${clientId.substring(0, 15)}...`);
    }
    /**
     * Google'dan başarılı dönen profil verilerini işleriz.
     */
    async validate(accessToken, refreshToken, profile, done) {
        const { id, name, emails, photos } = profile;
        const user = {
            googleId: id,
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
        };
        done(null, user);
    }
};
exports.GoogleOAuthStrategy = GoogleOAuthStrategy;
exports.GoogleOAuthStrategy = GoogleOAuthStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GoogleOAuthStrategy);
//# sourceMappingURL=google-oauth.strategy.js.map
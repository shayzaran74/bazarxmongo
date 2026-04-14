"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
/**
 * Fastify ve Passport arasındaki 'res.setHeader' uyumsuzluğunu gideren özel Google Guard.
 */
let GoogleAuthGuard = class GoogleAuthGuard extends (0, passport_1.AuthGuard)('google') {
    logger = new common_1.Logger('GoogleAuthGuard');
    async canActivate(context) {
        this.logger.log('GoogleAuthGuard tetiklendi, Passport uyumluluk yaması uygulanıyor...');
        const response = context.switchToHttp().getResponse();
        /**
         * Passport OAuth stratejileri (Google gibi) yönlendirme yaparken Express'in res.setHeader metodunu arar.
         * Fastify'da bu metod bulunmadığı için çalışma anında (runtime) bir polyfill ekliyoruz.
         */
        if (!response.setHeader) {
            response.setHeader = (name, value) => {
                response.header(name, value);
            };
        }
        /**
         * Passport yönlendirmeyi bitirmek için res.end() metodunu çağırır.
         * Fastify'da bu metodu send() ile eşleştiriyoruz.
         */
        if (!response.end) {
            response.end = (payload) => {
                response.send(payload);
            };
        }
        // Passport'un standart canActivate mantığını çalıştır
        return (await super.canActivate(context));
    }
};
exports.GoogleAuthGuard = GoogleAuthGuard;
exports.GoogleAuthGuard = GoogleAuthGuard = __decorate([
    (0, common_1.Injectable)()
], GoogleAuthGuard);
//# sourceMappingURL=google-auth.guard.js.map
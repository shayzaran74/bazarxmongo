"use strict";
// packages/domain-identity/src/application/use-cases/login-user.use-case.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserUseCase = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class LoginUserUseCase {
    userRepository;
    hashingService;
    constructor(userRepository, hashingService) {
        this.userRepository = userRepository;
        this.hashingService = hashingService;
    }
    async execute(input) {
        // 1. Kullanıcıyı bul
        const user = await this.userRepository.findByEmail(input.email);
        if (!user) {
            return (0, shared_core_1.Err)(new Error('E-posta veya şifre hatalı.'));
        }
        // 2. Şifre doğrula
        if (!user.passwordHash) {
            return (0, shared_core_1.Err)(new Error('Bu hesap için şifre tanımlanmamış. Lütfen sosyal medya ile giriş yapın.'));
        }
        const isPasswordValid = await this.hashingService.compare(input.password, user.passwordHash);
        if (!isPasswordValid) {
            return (0, shared_core_1.Err)(new Error('E-posta veya şifre hatalı.'));
        }
        // 3. Durum kontrolü
        if (user.status === 'SUSPENDED') {
            return (0, shared_core_1.Err)(new Error('Hesabınız askıya alınmıştır.'));
        }
        return (0, shared_core_1.Ok)(user);
    }
}
exports.LoginUserUseCase = LoginUserUseCase;
//# sourceMappingURL=login-user.use-case.js.map
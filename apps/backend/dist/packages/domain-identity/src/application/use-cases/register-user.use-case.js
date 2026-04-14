"use strict";
// packages/domain-identity/src/application/use-cases/register-user.use-case.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserUseCase = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
const user_entity_1 = require("../../domain/entities/user.entity");
class RegisterUserUseCase {
    userRepository;
    hashingService;
    constructor(userRepository, hashingService) {
        this.userRepository = userRepository;
        this.hashingService = hashingService;
    }
    async execute(input) {
        console.log('[USE-CASE] Registering user with input:', input);
        // 1. Email kontrolü (logic barterborsa'dan)
        const exists = await this.userRepository.exists(input.email);
        if (exists) {
            return (0, shared_core_1.Err)(new Error('Bu e-posta adresi zaten kullanımda.'));
        }
        // 2. Şifre hashleme
        const passwordHash = await this.hashingService.hash(input.password);
        // 3. Entity oluşturma (Aggregate Root)
        const userProps = {
            email: input.email,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName,
            role: 'USER',
            status: 'INACTIVE',
            isEmailVerified: false,
        };
        const userResult = user_entity_1.User.create(userProps);
        if (!userResult.success) {
            return userResult;
        }
        const user = userResult.data;
        // 4. Kaydetme
        await this.userRepository.save(user);
        return (0, shared_core_1.Ok)(user);
    }
}
exports.RegisterUserUseCase = RegisterUserUseCase;
//# sourceMappingURL=register-user.use-case.js.map
"use strict";
// packages/domain-identity/src/domain/entities/user.entity.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class User extends shared_core_1.AggregateRoot {
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        // Invariant kontrolleri burada yapılabilir (Örn: email formatı)
        if (!props.email.includes('@')) {
            return (0, shared_core_1.Err)(new Error('Geçersiz e-posta adresi.'));
        }
        const user = new User({
            ...props,
            status: props.status ?? 'INACTIVE',
            isEmailVerified: props.isEmailVerified ?? false,
        }, id);
        return (0, shared_core_1.Ok)(user);
    }
    // Domain Logic: Şifre değiştirme, profil güncelleme vb.
    updateProfile(firstName, lastName) {
        this.props.firstName = firstName;
        this.props.lastName = lastName;
        // this._updatedAt handle edilebilir (shared-core'da setter yoksa eklenmeli)
    }
    get email() { return this.props.email; }
    get firstName() { return this.props.firstName; }
    get lastName() { return this.props.lastName; }
    get role() { return this.props.role; }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map
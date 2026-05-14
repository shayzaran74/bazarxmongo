"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
const user_registered_event_1 = require("../events/user-registered.event");
class User extends shared_core_1.AggregateRoot {
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        // Temel validasyonlar
        if (!props.email.includes('@')) {
            return (0, shared_core_1.Err)(new Error('Geçersiz e-posta adresi.'));
        }
        const user = new User({
            ...props,
            status: props.status || 'ACTIVE',
            platform: props.platform || 'BAZARX',
            isEmailVerified: props.isEmailVerified ?? false,
        }, id);
        // Yeni kullanıcı kaydı ise event ekle
        if (!id) {
            user.addDomainEvent(new user_registered_event_1.UserRegisteredEvent(user.id, user.email, user.role, user.platform));
        }
        return (0, shared_core_1.Ok)(user);
    }
    updateProfile(firstName, lastName) {
        this.props.firstName = firstName;
        this.props.lastName = lastName;
    }
    changePassword(newHash) {
        this.props.passwordHash = newHash;
        this.props.lockoutUntil = undefined; // Reset lockout on successful change
    }
    verifyEmail() {
        this.props.isEmailVerified = true;
        this.props.status = 'ACTIVE';
    }
    updateLastLogin() {
        this.props.lastLoginAt = new Date();
    }
    get email() { return this.props.email; }
    get phoneNumber() { return this.props.phoneNumber; }
    get firstName() { return this.props.firstName; }
    get lastName() { return this.props.lastName; }
    get role() { return this.props.role; }
    get status() { return this.props.status; }
    get platform() { return this.props.platform; }
    get passwordHash() { return this.props.passwordHash; }
    get isEmailVerified() { return this.props.isEmailVerified; }
    get lastLoginAt() { return this.props.lastLoginAt; }
    get googleId() { return this.props.googleId; }
    get vendor() { return this.props.vendor; }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map
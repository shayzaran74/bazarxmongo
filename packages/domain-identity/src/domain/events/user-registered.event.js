"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRegisteredEvent = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class UserRegisteredEvent extends shared_core_1.DomainEvent {
    userId;
    email;
    role;
    platform;
    constructor(userId, email, role, platform) {
        super(userId);
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.platform = platform;
    }
    get eventName() {
        return 'UserRegistered';
    }
}
exports.UserRegisteredEvent = UserRegisteredEvent;
//# sourceMappingURL=user-registered.event.js.map
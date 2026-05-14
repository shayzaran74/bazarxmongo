"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDeletedEvent = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class UserDeletedEvent extends shared_core_1.DomainEvent {
    userId;
    reason;
    constructor(userId, reason) {
        super(userId);
        this.userId = userId;
        this.reason = reason;
    }
    get eventName() {
        return 'UserDeleted';
    }
}
exports.UserDeletedEvent = UserDeletedEvent;
//# sourceMappingURL=user-deleted.event.js.map
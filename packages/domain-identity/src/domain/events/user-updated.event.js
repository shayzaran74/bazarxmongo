"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUpdatedEvent = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class UserUpdatedEvent extends shared_core_1.DomainEvent {
    userId;
    changedFields;
    constructor(userId, changedFields) {
        super(userId);
        this.userId = userId;
        this.changedFields = changedFields;
    }
    get eventName() {
        return 'UserUpdated';
    }
}
exports.UserUpdatedEvent = UserUpdatedEvent;
//# sourceMappingURL=user-updated.event.js.map
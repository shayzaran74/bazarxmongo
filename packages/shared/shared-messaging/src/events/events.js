"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationEvent = void 0;
// packages/shared/shared-messaging/src/events/integration-event.base.ts
class IntegrationEvent {
    eventId;
    occurredAt;
    constructor() {
        this.eventId = crypto.randomUUID();
        this.occurredAt = new Date();
    }
}
exports.IntegrationEvent = IntegrationEvent;
//# sourceMappingURL=events.js.map
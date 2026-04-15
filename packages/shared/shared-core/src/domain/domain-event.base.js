"use strict";
// packages/shared/shared-core/src/domain/domain-event.base.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
const uuid_1 = require("uuid");
class DomainEvent {
    eventId;
    occurredAt;
    aggregateId;
    constructor(aggregateId) {
        this.eventId = (0, uuid_1.v4)();
        this.occurredAt = new Date();
        this.aggregateId = aggregateId;
    }
}
exports.DomainEvent = DomainEvent;
//# sourceMappingURL=domain-event.base.js.map
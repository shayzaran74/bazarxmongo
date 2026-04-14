export declare abstract class DomainEvent {
    readonly eventId: string;
    readonly occurredAt: Date;
    readonly aggregateId: string;
    constructor(aggregateId: string);
    abstract get eventName(): string;
}

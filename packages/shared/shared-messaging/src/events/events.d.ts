export interface IEventBus {
    publish(exchange: string, routingKey: string, payload: any): Promise<void>;
}
export declare abstract class IntegrationEvent {
    readonly eventId: string;
    readonly occurredAt: Date;
    constructor();
    abstract get routingKey(): string;
}

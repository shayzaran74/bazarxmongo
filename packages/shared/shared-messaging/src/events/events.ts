// packages/shared/shared-messaging/src/events/event-bus.interface.ts
export interface IEventBus {
  publish(exchange: string, routingKey: string, payload: any): Promise<void>;
}

// packages/shared/shared-messaging/src/events/integration-event.base.ts
export abstract class IntegrationEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;

  constructor() {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }

  abstract get routingKey(): string;
}

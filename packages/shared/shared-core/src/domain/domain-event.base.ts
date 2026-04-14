// packages/shared/shared-core/src/domain/domain-event.base.ts

import { v4 as uuidv4 } from 'uuid';

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly aggregateId: string;

  constructor(aggregateId: string) {
    this.eventId = uuidv4();
    this.occurredAt = new Date();
    this.aggregateId = aggregateId;
  }

  abstract get eventName(): string;
}

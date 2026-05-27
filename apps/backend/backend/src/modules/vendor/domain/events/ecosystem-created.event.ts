// apps/backend/src/modules/vendor/domain/events/ecosystem-created.event.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class EcosystemCreatedEvent extends DomainEvent {
  constructor(
    public readonly ecosystemId: string,
    public readonly name: string,
    public readonly ownerId: string,
  ) {
    super(ecosystemId);
  }

  get eventName(): string {
    return 'ecosystem.created';
  }
}

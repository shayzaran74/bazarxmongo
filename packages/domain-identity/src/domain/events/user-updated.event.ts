import { DomainEvent } from '@barterborsa/shared-core';

export class UserUpdatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly changedFields: string[]
  ) {
    super(userId);
  }

  get eventName(): string {
    return 'UserUpdated';
  }
}

import { DomainEvent } from '@barterborsa/shared-core';

export class UserDeletedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly reason?: string
  ) {
    super(userId);
  }

  get eventName(): string {
    return 'UserDeleted';
  }
}

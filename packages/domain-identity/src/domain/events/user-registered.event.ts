import { DomainEvent } from '@barterborsa/shared-core';

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly role: string,
    public readonly platform: string
  ) {
    super(userId);
  }

  get eventName(): string {
    return 'UserRegistered';
  }
}

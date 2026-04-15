import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserUpdatedEvent } from '../../domain/events/user-updated.event';
import { Inject, Logger } from '@nestjs/common';

@EventsHandler(UserUpdatedEvent)
export class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent> {
  private readonly logger = new Logger(UserUpdatedHandler.name);

  constructor(
    @Inject('IEventBus') private readonly eventBus: any
  ) {}

  async handle(event: UserUpdatedEvent) {
    this.logger.log(`User updated: ${event.userId}`);

    try {
      await this.eventBus.publish('user.updated', {
        userId: event.userId,
        changedFields: event.changedFields
      });
    } catch (error: any) {
      this.logger.error(`Failed to publish UserUpdated integration event: ${error.message}`);
    }
  }
}

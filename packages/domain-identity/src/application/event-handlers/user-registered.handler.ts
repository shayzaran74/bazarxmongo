import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { Inject, Logger } from '@nestjs/common';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger(UserRegisteredHandler.name);

  constructor(
    @Inject('IEventBus') private readonly eventBus: any // Integration Event Bus (RabbitMQ)
  ) {}

  async handle(event: UserRegisteredEvent) {
    this.logger.log(`User registered: ${event.userId} (${event.email})`);

    // Publish Integration Event to RabbitMQ
    try {
      await this.eventBus.publish('user.registered', {
        userId: event.userId,
        email: event.email,
        role: event.role,
        platform: event.platform
      });
    } catch (error: any) {
      this.logger.error(`Failed to publish UserRegistered integration event: ${error.message}`);
    }
  }
}

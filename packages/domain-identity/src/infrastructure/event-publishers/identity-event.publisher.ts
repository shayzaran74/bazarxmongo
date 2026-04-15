import { Injectable, Inject } from '@nestjs/common';
import { IEventBus } from '@barterborsa/shared-core';

@Injectable()
export class IdentityEventPublisher {
  constructor(
    @Inject('IEventBus') private readonly eventBus: IEventBus
  ) {}

  async publishUserRegistered(data: any) {
    await this.eventBus.publish('user.registered', data);
  }

  async publishUserUpdated(data: any) {
    await this.eventBus.publish('user.updated', data);
  }

  async publishUserDeleted(data: any) {
    await this.eventBus.publish('user.deleted', data);
  }
}

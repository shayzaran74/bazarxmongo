// apps/backend/src/modules/vendor/application/handlers/ecosystem-created.handler.ts

import { EventsHandler, IEventHandler, EventBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EcosystemCreatedEvent } from '../../domain/events/ecosystem-created.event';

@EventsHandler(EcosystemCreatedEvent)
export class EcosystemCreatedHandler implements IEventHandler<EcosystemCreatedEvent> {
  private readonly logger = new Logger(EcosystemCreatedHandler.name);

  constructor(private readonly eventBus: EventBus) {}

  async handle(event: EcosystemCreatedEvent): Promise<void> {
    this.logger.log(`Ekosistem oluşturuldu: ${event.ecosystemId}`, {
      name: event.name,
      ownerId: event.ownerId,
    });
    // Şimdilik loglama — gelecekte ek bildirimler veya provisioning burada yapılabilir
  }
}
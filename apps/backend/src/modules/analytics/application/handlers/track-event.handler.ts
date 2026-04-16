// apps/backend/src/modules/analytics/application/handlers/track-event.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TrackEventCommand, TrackBatchEventsCommand } from '../commands-queries/analytics.bus';
import { PrismaAnalyticsRepository } from '../../infrastructure/persistence/prisma-analytics.repositories';
import { AnalyticsEvent } from '../../domain/entities/analytics.entities';

@CommandHandler(TrackEventCommand)
export class TrackEventHandler implements ICommandHandler<TrackEventCommand> {
  constructor(private readonly repository: PrismaAnalyticsRepository) {}
  async execute(command: TrackEventCommand) {
    const event = AnalyticsEvent.track(command.event);
    await this.repository.trackEvent(event);
  }
}

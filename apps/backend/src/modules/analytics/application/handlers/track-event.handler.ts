// apps/backend/src/modules/analytics/application/handlers/track-event.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TrackEventCommand, TrackBatchEventsCommand } from '../commands-queries/analytics.bus';
import { PrismaAnalyticsRepository } from '../../infrastructure/persistence/prisma-analytics.repositories';
import { AnalyticsEvent } from '../../domain/entities/analytics.entities';

@CommandHandler(TrackEventCommand)
export class TrackEventHandler implements ICommandHandler<TrackEventCommand> {
  constructor(private readonly repository: PrismaAnalyticsRepository) {}
  async execute(command: TrackEventCommand) {
    try {
      if (!command || !command.event) {
        return;
      }
      const event = AnalyticsEvent.track(command.event);
      await this.repository.trackEvent(event);
      return { success: true };
    } catch (error) {
      // Analytics tracking should never crash the main process or block the user
      console.error('TrackEventHandler Error:', error);
      return { success: false, error: 'Failed to track event' };
    }
  }
}

// apps/backend/src/modules/analytics/application/handlers/track-event.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TrackEventCommand } from '../commands-queries/analytics.bus';
import { MongoAnalyticsRepository } from '../../infrastructure/persistence/mongo-analytics.repository';

@CommandHandler(TrackEventCommand)
export class TrackEventHandler implements ICommandHandler<TrackEventCommand> {
  private readonly logger = new Logger(TrackEventHandler.name);

  constructor(private readonly repository: MongoAnalyticsRepository) {}

  async execute(command: TrackEventCommand) {
    try {
      if (!command?.event?.eventType) {
        return { success: false, error: 'Missing eventType' };
      }
      await this.repository.trackEvent(command.event);
      return { success: true };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      this.logger.warn('Analitik event kaydedilemedi', { error: msg });
      return { success: false, error: 'Failed to track event' };
    }
  }
}
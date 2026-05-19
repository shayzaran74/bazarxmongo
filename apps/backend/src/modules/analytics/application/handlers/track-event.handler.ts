// apps/backend/src/modules/analytics/application/handlers/track-event.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TrackEventCommand, TrackBatchEventsCommand } from '../commands-queries/analytics.bus';
import { MongoAnalyticsRepository } from '../../infrastructure/persistence/mongo-analytics.repository';
import { AnalyticsEvent } from '../../domain/entities/analytics.entities';

@CommandHandler(TrackEventCommand)
export class TrackEventHandler implements ICommandHandler<TrackEventCommand> {
  constructor(private readonly repository: MongoAnalyticsRepository) {}
  async execute(command: TrackEventCommand) {
    try {
      if (!command || !command.event) {
        return;
      }
      const entity = AnalyticsEvent.track(command.event);
      const props = entity.getProps();
      await this.repository.trackEvent({
        eventType: props.eventType as string,
        userId: props.userId,
        sessionId: props.sessionId,
        path: props.path,
        ipAddress: props.ipAddress,
        userAgent: props.userAgent,
        listingId: props.listingId,
        vendorId: props.vendorId,
        source: props.source,
        medium: props.medium,
        campaign: props.campaign,
        referrer: props.referrer,
        metadata: { ...props.metadata, intent: props.intent, eventSource: props.eventSource, catalogProductId: props.catalogProductId, categoryId: props.categoryId },
        timestamp: props.timestamp,
      });
      return { success: true };
    } catch (error) {
      console.error('TrackEventHandler Error:', error);
      return { success: false, error: 'Failed to track event' };
    }
  }
}

// apps/backend/src/modules/analytics/analytics.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';

import { TrackingController, AnalyticsAdminController } from './presentation/analytics.controllers';

import { TrackEventHandler } from './application/handlers/track-event.handler';
import { GetDashboardStatsHandler } from './application/handlers/analytics-query.handlers';

import { PrismaAnalyticsRepository } from './infrastructure/persistence/prisma-analytics.repositories';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [TrackingController, AnalyticsAdminController],
  providers: [
    TrackEventHandler,
    GetDashboardStatsHandler,
    PrismaAnalyticsRepository,
  ],
})
export class AnalyticsModule {}

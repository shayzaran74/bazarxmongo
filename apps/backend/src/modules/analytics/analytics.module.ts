// apps/backend/src/modules/analytics/analytics.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';

import { TrackingController, AnalyticsAdminController, VendorAnalyticsController } from './presentation/analytics.controllers';
import { AdminDashboardController } from './admin-dashboard.controller';

import { TrackEventHandler } from './application/handlers/track-event.handler';
import { 
  GetDashboardStatsHandler, 
  GetAdminStatsHandler, 
  GetVendorStatsHandler 
} from './application/handlers/analytics-query.handlers';

import { PrismaAnalyticsRepository } from './infrastructure/persistence/prisma-analytics.repositories';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [
    TrackingController, 
    AnalyticsAdminController, 
    VendorAnalyticsController,
    AdminDashboardController
  ],
  providers: [
    TrackEventHandler,
    GetDashboardStatsHandler,
    GetAdminStatsHandler,
    GetVendorStatsHandler,
    PrismaAnalyticsRepository,
  ],
})
export class AnalyticsModule {}

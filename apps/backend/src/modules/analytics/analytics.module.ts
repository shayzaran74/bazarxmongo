// apps/backend/src/modules/analytics/analytics.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@barterborsa/shared-persistence';

import { TrackingController } from './presentation/tracking.controller';
import { AnalyticsAdminController } from './presentation/analytics-admin.controller';
import { VendorAnalyticsController } from './presentation/vendor-analytics.controller';
import { AdminDashboardController } from './presentation/admin-dashboard.controller';

import { TrackEventHandler } from './application/handlers/track-event.handler';
import { GetDashboardStatsHandler } from './application/handlers/get-dashboard-stats.handler';
import { GetAdminStatsHandler } from './application/handlers/get-admin-stats.handler';
import { GetVendorStatsHandler } from './application/handlers/get-vendor-stats.handler';

import { PrismaAnalyticsRepository } from './infrastructure/persistence/prisma-analytics.repositories';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [
    TrackingController,
    AnalyticsAdminController,
    VendorAnalyticsController,
    AdminDashboardController,
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

// apps/backend/src/modules/analytics/analytics.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsEvent, AnalyticsEventSchema } from '@barterborsa/shared-persistence';

import { TrackingController, AnalyticsAdminController, VendorAnalyticsController } from './presentation/analytics.controllers';
import { AdminDashboardController } from './presentation/admin-dashboard.controller';

import { TrackEventHandler } from './application/handlers/track-event.handler';
import { GetDashboardStatsHandler } from './application/handlers/get-dashboard-stats.handler';
import { GetAdminStatsHandler } from './application/handlers/get-admin-stats.handler';
import { GetVendorStatsHandler } from './application/handlers/get-vendor-stats.handler';

import { MongoAnalyticsRepository } from './infrastructure/persistence/mongo-analytics.repository';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
    ]),
  ],
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
    MongoAnalyticsRepository,
  ],
})
export class AnalyticsModule {}
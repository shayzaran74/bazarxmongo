// apps/backend/src/modules/analytics/presentation/analytics.controllers.ts

import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '@barterborsa/shared-nest';
import { Public } from '@barterborsa/shared-security';
import { TrackEventCommand, GetDashboardStatsQuery } from '../application/commands-queries/analytics.bus';

@Controller('analytics')
export class TrackingController {
  constructor(private readonly commandBus: CommandBus) {}
  @Public()
  @Post('track')
  async track(@Body() dto: any) { return this.commandBus.execute(new TrackEventCommand(dto)); }
}

@Controller('admin/analytics')
@Roles('ADMIN')
export class AnalyticsAdminController {
  constructor(private readonly queryBus: QueryBus) {}
  @Get('dashboard')
  async getDashboard(@Query('period') period: any) { return this.queryBus.execute(new GetDashboardStatsQuery(period)); }
}

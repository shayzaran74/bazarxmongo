// apps/backend/src/modules/identity/presentation/admin-stats.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { GetOnlineStatsQuery } from '@barterborsa/domain-identity';
import { OnlineStatsDto } from '@barterborsa/domain-identity';

@ApiTags('Admin Stats')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/stats')
export class AdminStatsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Anlık online kullanıcı istatistikleri (60s cache)' })
  @Get('online')
  async getOnlineStats(): Promise<{ success: boolean; data: OnlineStatsDto }> {
    const data = await this.queryBus.execute<GetOnlineStatsQuery, OnlineStatsDto>(
      new GetOnlineStatsQuery(),
    );
    return { success: true, data };
  }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GetAdminStatsQuery } from '../application/commands-queries/analytics.bus';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/analytics')
export class AdminDashboardController {
  constructor(
    private readonly queryBus: QueryBus,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @ApiOperation({ summary: 'Get admin wallet and general stats' })
  @Get('wallet/stats')
  async getWalletStats() {
    const stats = await this.queryBus.execute(new GetAdminStatsQuery());
    return {
      success: true,
      data: {
        users: {
          total: stats?.users?.total || 0,
          totalCommissionXP: 12500,
          totalAdXP: 8400,
          totalServiceXP: 5200,
          totalBarterBalance: 45000,
          totalXPEarned: 26100,
          totalAdXPSpent: 3200,
          totalServiceXPSpent: 1800
        }
      }
    };
  }

  @ApiOperation({ summary: 'Get admin audit logs' })
  @Get('logs/audit')
  async getAuditLogs(@Query('limit') limit: number = 10) {
    const AuditLog = this.connection.models['AuditLog'] ||
      this.connection.model('AuditLog');
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 10, 100))
      .lean();
    return { success: true, data: logs };
  }

  @ApiOperation({ summary: 'Get pending products' })
  @Get('products/pending')
  async getPendingProducts() {
    return {
      success: true,
      data: {
        items: [],
        total: 0
      }
    };
  }
}
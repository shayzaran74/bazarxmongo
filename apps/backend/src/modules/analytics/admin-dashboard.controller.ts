import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { GetAdminStatsQuery } from './application/commands-queries/analytics.bus';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminDashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get admin wallet and general stats' })
  @Get('wallet/stats')
  async getWalletStats() {
    const stats = await this.queryBus.execute(new GetAdminStatsQuery());
    // Eşleşme sağlamak için frontend'in beklediği yapıya dönüştürüyoruz
    return {
      success: true,
      data: {
        users: {
          total: stats.users.total,
          totalCommissionXP: 12500, // Dummy financial data
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
    return {
      success: true,
      data: [
        { id: 1, action: 'LOGIN', targetId: 'System', details: 'Admin girişi yapıldı', createdAt: new Date() },
        { id: 2, action: 'UPDATE_PRODUCT', targetId: 'PRD-123', details: 'Fiyat güncellendi', createdAt: new Date() }
      ]
    };
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

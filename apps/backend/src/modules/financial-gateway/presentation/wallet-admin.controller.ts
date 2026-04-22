import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { GetWithdrawalsQuery } from '../application/queries/get-withdrawals.query';
import { GetWalletRequestsQuery } from '../application/queries/get-wallet-requests.query';
import { GetWalletTransactionsQuery } from '../application/queries/get-wallet-transactions.query';

@ApiTags('Wallet Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/wallet')
export class WalletAdminController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get all wallet requests' })
  @Get('requests')
  async getRequests(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('user') userId?: string
  ) {
    try {
      const data = await this.queryBus.execute(
        new GetWalletRequestsQuery(
          userId,
          status,
          parseInt(page, 10) || 1,
          parseInt(limit, 10) || 10
        )
      );
      return { success: true, data };
    } catch {
      return { success: true, data: { items: [], total: 0 } };
    }
  }

  @ApiOperation({ summary: 'Get all withdrawals' })
  @Get('withdrawals')
  async getWithdrawals(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('user') userId?: string
  ) {
    try {
      const data = await this.queryBus.execute(
        new GetWithdrawalsQuery(
          userId,
          status,
          parseInt(page, 10) || 1,
          parseInt(limit, 10) || 10
        )
      );
      return { success: true, data };
    } catch {
      return { success: true, data: { items: [], total: 0 } };
    }
  }

  @ApiOperation({ summary: 'Get all transactions' })
  @Get('transactions')
  async getTransactions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('userId') userId?: string
  ) {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'userId parametresi gerekli'
        };
      }
      const data = await this.queryBus.execute(
        new GetWalletTransactionsQuery(
          userId,
          undefined,
          parseInt(page, 10) || 1,
          parseInt(limit, 10) || 20
        )
      );
      return { success: true, data };
    } catch {
      return { success: true, data: { items: [], total: 0 } };
    }
  }
}

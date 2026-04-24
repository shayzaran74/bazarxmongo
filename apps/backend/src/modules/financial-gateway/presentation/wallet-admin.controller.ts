import { Controller, Get, Query, Post, Param, Body, UseGuards } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles, CurrentUser } from '@barterborsa/shared-nest';
import { GetWithdrawalsQuery } from '../application/queries/get-withdrawals.query';
import { GetWalletRequestsQuery } from '../application/queries/get-wallet-requests.query';
import { GetWalletTransactionsQuery } from '../application/queries/get-wallet-transactions.query';

import { ProcessWalletRequestCommand } from '../application/commands/process-wallet-request.command';

@ApiTags('Wallet Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/wallet')
export class WalletAdminController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

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

  @ApiOperation({ summary: 'Approve wallet request' })
  @Post('requests/:id/approve')
  async approveRequest(@Param('id') id: string, @CurrentUser() admin: any) {
    await this.commandBus.execute(
      new ProcessWalletRequestCommand(id, 'approve', admin.id)
    );
    return { success: true, message: 'Talep onaylandı' };
  }

  @ApiOperation({ summary: 'Reject wallet request' })
  @Post('requests/:id/reject')
  async rejectRequest(
    @Param('id') id: string, 
    @Body() body: { reason?: string },
    @CurrentUser() admin: any
  ) {
    await this.commandBus.execute(
      new ProcessWalletRequestCommand(id, 'reject', admin.id, body.reason)
    );
    return { success: true, message: 'Talep reddedildi' };
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

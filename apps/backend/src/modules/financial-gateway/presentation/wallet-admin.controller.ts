import { Controller, Get, Query, Post, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles, CurrentUser } from '@barterborsa/shared-nest';
import { GetWithdrawalsQuery } from '../application/queries/get-withdrawals.query';
import { GetWalletRequestsQuery } from '../application/queries/get-wallet-requests.query';
import { GetWalletTransactionsQuery } from '../application/queries/get-wallet-transactions.query';
import { ProcessWalletRequestCommand } from '../application/commands/process-wallet-request.command';

interface AuthenticatedUser {
  id: string;
  role: string;
}

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
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('user') userId?: string,
  ) {
    const data = await this.queryBus.execute(
      new GetWalletRequestsQuery(userId, status, parseInt(page, 10) || 1, parseInt(limit, 10) || 10),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Approve wallet request' })
  @Post('requests/:id/approve')
  async approveRequest(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    await this.commandBus.execute(new ProcessWalletRequestCommand(id, 'approve', admin.id));
    return { success: true, message: 'Talep onaylandı' };
  }

  @ApiOperation({ summary: 'Reject wallet request' })
  @Post('requests/:id/reject')
  async rejectRequest(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    await this.commandBus.execute(new ProcessWalletRequestCommand(id, 'reject', admin.id, body.reason));
    return { success: true, message: 'Talep reddedildi' };
  }

  @ApiOperation({ summary: 'Get all withdrawals' })
  @Get('withdrawals')
  async getWithdrawals(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('user') userId?: string,
  ) {
    const data = await this.queryBus.execute(
      new GetWithdrawalsQuery(userId, status, parseInt(page, 10) || 1, parseInt(limit, 10) || 10),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get transactions for a specific user (admin view)' })
  @Get('transactions')
  async getTransactions(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('userId') userId?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId parametresi gerekli');
    }
    const data = await this.queryBus.execute(
      new GetWalletTransactionsQuery(userId, undefined, parseInt(page, 10) || 1, parseInt(limit, 10) || 20),
    );
    return { success: true, data };
  }
}

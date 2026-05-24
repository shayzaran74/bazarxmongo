import { Controller, Get, Query, Post, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles, CurrentUser } from '@barterborsa/shared-nest';
import { GetWithdrawalsQuery } from '../application/queries/get-withdrawals.query';
import { GetWalletRequestsQuery } from '../application/queries/get-wallet-requests.query';
import { GetWalletTransactionsQuery } from '../application/queries/get-wallet-transactions.query';
import { ProcessWalletRequestCommand } from '../application/commands/process-wallet-request.command';
import { ProcessWithdrawalCommand } from '../application/commands/process-withdrawal.command';
import { WalletQueryDto, RejectWithdrawalDto } from './dto/wallet.dto';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
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
    @Query() query: WalletQueryDto,
  ) {
    const userId = query.user || query.accountId;
    const data = await this.queryBus.execute(
      new GetWalletRequestsQuery(userId || '', query.accountType, query.page || 1, query.limit || 10),
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
    @Body() body: RejectWithdrawalDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    await this.commandBus.execute(new ProcessWalletRequestCommand(id, 'reject', admin.id, body.reason || ''));
    return { success: true, message: 'Talep reddedildi' };
  }

  @ApiOperation({ summary: 'Get all withdrawals' })
  @Get('withdrawals')
  async getWithdrawals(
    @Query() query: WalletQueryDto,
  ) {
    const userId = query.user || query.accountId;
    const data = await this.queryBus.execute(
      new GetWithdrawalsQuery(userId || '', query.accountType, query.page || 1, query.limit || 10),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Approve withdrawal' })
  @Post('withdrawals/:id/approve')
  async approveWithdrawal(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    await this.commandBus.execute(new ProcessWithdrawalCommand(id, 'approve', admin.id));
    return { success: true, message: 'Çekim talebi onaylandı' };
  }

  @ApiOperation({ summary: 'Reject withdrawal' })
  @Post('withdrawals/:id/reject')
  async rejectWithdrawal(
    @Param('id') id: string,
    @Body() body: RejectWithdrawalDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    await this.commandBus.execute(new ProcessWithdrawalCommand(id, 'reject', admin.id, body.reason || ''));
    return { success: true, message: 'Çekim talebi reddedildi' };
  }

  @ApiOperation({ summary: 'Get transactions for a specific user (admin view)' })
  @Get('transactions')
  async getTransactions(
    @Query() query: WalletQueryDto & { userId?: string },
  ) {
    const data = await this.queryBus.execute(
      new GetWalletTransactionsQuery(query.userId || '', undefined, query.page || 1, query.limit || 20),
    );
    return { success: true, data };
  }
}

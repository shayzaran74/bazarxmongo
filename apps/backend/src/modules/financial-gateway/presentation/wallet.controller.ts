import { Controller, Get, Post, Body, Query, UseGuards, Param, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { GetWalletTransactionsQuery } from '../application/queries/get-wallet-transactions.query';
import { TopUpWalletCommand } from '../application/commands/top-up-wallet.command';
import { RequestWithdrawalCommand } from '../application/commands/request-withdrawal.command';
import { FinancialGatewayService } from '../financial-gateway.service';

interface AuthenticatedUser {
  id: string;
  role: string;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  @Get()
  async getMyWallet(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.financialGateway.getWallet(user.id);
    return { success: true, data };
  }

  @Get('transactions')
  async getTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query('accountType') accountType?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('accountId') accountId?: string,
  ) {
    const data = await this.queryBus.execute(
      new GetWalletTransactionsQuery(
        user.id,
        accountType,
        parseInt(page, 10) || 1,
        parseInt(limit, 10) || 20,
        accountId,
      ),
    );
    return { success: true, data };
  }

  @Get('accounts/:accountId/transactions')
  async getAccountTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('accountId') accountId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const data = await this.queryBus.execute(
      new GetWalletTransactionsQuery(
        user.id,
        undefined,
        parseInt(page, 10) || 1,
        parseInt(limit, 10) || 20,
        accountId,
      ),
    );
    return { success: true, data };
  }

  @Get('ledger')
  async getLedger(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const data = await this.queryBus.execute(
      new GetWalletTransactionsQuery(
        user.id,
        undefined,
        parseInt(page, 10) || 1,
        parseInt(limit, 10) || 50,
        undefined,
      ),
    );
    return { success: true, data };
  }

  @Post('topup')
  async topUp(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: { amount: number; paymentMethod: string },
  ) {
    const data = await this.commandBus.execute(
      new TopUpWalletCommand(user.id, dto.amount, dto.paymentMethod),
    );
    return { success: true, data };
  }

  @Post('withdraw')
  async withdraw(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: { amount: number; iban: string; accountHolder: string; bankName: string },
  ) {
    const data = await this.commandBus.execute(
      new RequestWithdrawalCommand(user.id, dto.amount, dto.iban, dto.accountHolder, dto.bankName),
    );
    return { success: true, data };
  }
}

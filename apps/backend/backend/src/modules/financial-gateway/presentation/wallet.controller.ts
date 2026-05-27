import { Controller, Get, Post, Body, Query, UseGuards, Param, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { GetWalletTransactionsQuery } from '../application/queries/get-wallet-transactions.query';
import { TopUpWalletCommand } from '../application/commands/top-up-wallet.command';
import { RequestWithdrawalCommand } from '../application/commands/request-withdrawal.command';
import { FinancialGatewayService } from '../financial-gateway.service';
import { TopUpWalletDto, RequestWithdrawalDto, WalletQueryDto } from './dto/wallet.dto';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
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
    @Query() query: WalletQueryDto,
  ) {
    const data = await this.queryBus.execute(
      new GetWalletTransactionsQuery(
        user.id,
        query.accountType,
        query.page || 1,
        query.limit || 20,
        query.accountId,
      ),
    );
    return { success: true, data };
  }

  @Get('accounts/:accountId/transactions')
  async getAccountTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('accountId') accountId: string,
    @Query() query: Pick<WalletQueryDto, 'page' | 'limit'>,
  ) {
    const data = await this.queryBus.execute(
      new GetWalletTransactionsQuery(
        user.id,
        undefined,
        query.page || 1,
        query.limit || 20,
        accountId,
      ),
    );
    return { success: true, data };
  }

  @Get('ledger')
  async getLedger(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: Pick<WalletQueryDto, 'page' | 'limit'>,
  ) {
    const data = await this.queryBus.execute(
      new GetWalletTransactionsQuery(
        user.id,
        undefined,
        query.page || 1,
        query.limit || 50,
        undefined,
      ),
    );
    return { success: true, data };
  }

  @Post('topup')
  async topUp(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: TopUpWalletDto,
  ) {
    const data = await this.commandBus.execute(
      new TopUpWalletCommand(user.id, dto.amount, dto.paymentMethod),
    );
    return { success: true, data };
  }

  @Post('withdraw')
  async withdraw(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RequestWithdrawalDto,
  ) {
    const data = await this.commandBus.execute(
      new RequestWithdrawalCommand(user.id, dto.amount, dto.iban, dto.accountHolder, dto.bankName),
    );
    return { success: true, data };
  }

  @Get('gift-cards')
  async getGiftCards(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: Pick<WalletQueryDto, 'page' | 'limit'>,
  ) {
    const data = await this.financialGateway.listGiftCards({
      customerId: user.id,
      page: query.page || 1,
      limit: query.limit || 20,
    });
    return { success: true, data };
  }
}

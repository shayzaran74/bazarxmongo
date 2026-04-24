import { Controller, Get, Post, Body, Req, Query, UseGuards, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { GetWalletBalanceQuery } from '../application/queries/get-wallet-balance.query';
import { GetWalletTransactionsQuery } from '../application/queries/get-wallet-transactions.query';
import { TopUpWalletCommand } from '../application/commands/top-up-wallet.command';
import { RequestWithdrawalCommand } from '../application/commands/request-withdrawal.command';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getMyWallet(@Req() req: any) {
    try {
      const data = await this.queryBus.execute(
        new GetWalletBalanceQuery(req.user.id, 'MAIN')
      );
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: 'Cüzdan bilgileri alınamadı.' };
    }
  }

  @Get('transactions')
  async getTransactions(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('accountType') accountType?: string
  ) {
    try {
      const data = await this.queryBus.execute(
        new GetWalletTransactionsQuery(
          req.user.id,
          accountType,
          parseInt(page, 10) || 1,
          parseInt(limit, 10) || 20
        )
      );
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: 'İşlem geçmişi alınamadı.' };
    }
  }

  @Get('accounts/:accountId/transactions')
  async getAccountTransactions(
    @Req() req: any,
    @Param('accountId') accountId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    try {
      // For now, we can reuse the same query but maybe with accountId filter
      // If the financial-service supports it. 
      // Let's check GetWalletTransactionsQuery definition.
      const data = await this.queryBus.execute(
        new GetWalletTransactionsQuery(
          req.user.id,
          undefined, // accountType
          parseInt(page, 10) || 1,
          parseInt(limit, 10) || 20,
          accountId
        )
      );
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: 'Hesap hareketleri alınamadı.' };
    }
  }

  @Post('topup')
  async topUp(
    @Req() req: any,
    @Body() dto: { amount: number; paymentMethod: string }
  ) {
    try {
      const data = await this.commandBus.execute(
        new TopUpWalletCommand(req.user.id, dto.amount, dto.paymentMethod)
      );
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: 'Bakiye yükleme başarısız.' };
    }
  }

  @Post('withdraw')
  async withdraw(
    @Req() req: any,
    @Body() dto: {
      amount: number;
      iban: string;
      accountHolder: string;
      bankName: string
    }
  ) {
    try {
      const data = await this.commandBus.execute(
        new RequestWithdrawalCommand(
          req.user.id,
          dto.amount,
          dto.iban,
          dto.accountHolder,
          dto.bankName
        )
      );
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: 'Para çekme talebi başarısız.' };
    }
  }
}

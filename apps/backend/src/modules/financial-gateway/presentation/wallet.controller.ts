import { Controller, Get, Post, Body, Req, Query, UseGuards } from '@nestjs/common';
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

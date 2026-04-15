import { Controller, Get, Post, Body, Req, OnModuleInit, Inject, Query } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { UseGuards } from '@nestjs/common';

interface GetBalanceResponse {
  balance: string;
  availableBalance: string;
  blockedBalance: string;
}

interface WalletService {
  getBalance(data: { userId: string; accountType: string }): Observable<GetBalanceResponse>;
}

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController implements OnModuleInit {
  private walletService!: WalletService;

  constructor(@Inject('FINANCIAL_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.walletService = this.client.getService<WalletService>('FinancialService');
  }

  @Get()
  async getMyWallet(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    try {
      const balance = await firstValueFrom(this.walletService.getBalance({ userId, accountType: 'MAIN' }));
      return {
        success: true,
        data: {
          balance: parseFloat(balance.balance),
          availableBalance: parseFloat(balance.availableBalance),
          blockedBalance: parseFloat(balance.blockedBalance),
          currency: 'TRY',
          accounts: [], // Opsiyonel: Diğer hesaplar buraya eklenebilir
          cards: [],
          requests: []
        }
      };
    } catch (err: unknown) {
      console.error('Wallet balance fetch error:', err);
      return {
        success: false,
        message: 'Cüzdan bilgileri alınamadı.'
      };
    }
  }

  @Get('transactions')
  async getTransactions(@Req() _req: AuthenticatedRequest, @Query('page') _page: string, @Query('limit') _limit: string) {
    // Şimdilik dummy veri dönüyoruz, ledger entegrasyonu sonra eklenebilir
    return {
      success: true,
      data: [
        {
          id: '1',
          type: 'TOPUP',
          amount: 500,
          status: 'COMPLETED',
          createdAt: new Date(),
          description: 'Bakiye Yükleme',
          direction: 'CREDIT',
          account: { type: 'MAIN' }
        }
      ]
    };
  }

  @Post('topup')
  async topUp(@Req() _req: AuthenticatedRequest, @Body() _dto: { amount: number; paymentMethod: string }) {
    // Bu kısım normalde bir ödeme sistemine (Iyzico vb.) gider.
    // Şimdilik simüle ediyoruz.
    return {
      success: true,
      message: 'Bakiye yükleme talebi alındı.'
    };
  }

  @Post('withdraw')
  async withdraw(@Req() _req: AuthenticatedRequest, @Body() _dto: { amount: number; iban: string; accountHolder: string; bankName: string }) {
    return {
      success: true,
      message: 'Para çekme talebi alındı.'
    };
  }
}

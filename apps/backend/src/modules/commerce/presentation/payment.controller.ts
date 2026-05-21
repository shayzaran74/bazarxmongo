import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { TopUpWalletCommand } from '../../financial-gateway/application/commands/top-up-wallet.command';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Subscribe to premium', description: 'Premium üyelik aboneliği başlatır.' })
  @Post('premium/subscribe')
  async subscribe(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    return {
      success: true,
      message: 'Abonelik işlemi başlatıldı.',
      data: {
        subscriptionId: 'sub_dummy_123',
        status: 'PENDING'
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Process credit card payment', description: 'Kredi kartı ödemesini işler.' })
  @Post('credit-card/process')
  async processCreditCard(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    // If it's a wallet top-up (no orderNumber)
    if (!dto.orderNumber) {
      await this.commandBus.execute(
        new TopUpWalletCommand(user.id, Number(dto.amount), 'CREDIT_CARD')
      );
    }

    return {
      success: true,
      message: 'Ödeme işlemi başarıyla tamamlandı.',
      data: {
        status: 'SUCCESS',
        transactionId: 'txn_' + Math.random().toString(36).substring(2, 11),
        requires3DS: false
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('bank-transfer/confirm')
  async confirmBankTransfer(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    
    await this.commandBus.execute(
      new TopUpWalletCommand(user.id, Number(dto.amount), 'BANK_TRANSFER')
    );

    return {
      success: true,
      message: 'Banka havalesi bildirimi alındı.',
      data: { status: 'PENDING' }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('eft/confirm')
  async confirmEft(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {

    await this.commandBus.execute(
      new TopUpWalletCommand(user.id, Number(dto.amount), 'EFT')
    );

    return {
      success: true,
      message: 'EFT bildirimi alındı.',
      data: { status: 'PENDING' }
    };
  }
}

export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }

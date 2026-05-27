// apps/backend/src/modules/commerce/presentation/payment.controller.ts

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IsNumber, IsPositive, Max, IsOptional, IsString } from 'class-validator';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { TopUpWalletCommand } from '../../financial-gateway/application/commands/top-up-wallet.command';

// Maksimum tekli yükleme limiti (₺) — iş kuralına göre ayarlanmalı
const MAX_TOPUP_AMOUNT = 50_000;

export class SubscribeDto {
  @IsOptional() @IsString() planId?: string;
  @IsOptional() @IsString() paymentMethod?: string;
}

export class CreditCardProcessDto {
  @IsOptional() @IsString() orderNumber?: string;
  @IsNumber() @IsPositive() @Max(MAX_TOPUP_AMOUNT) amount!: number;
  @IsOptional() @IsString() cardToken?: string;
}

export class BankTransferConfirmDto {
  @IsNumber() @IsPositive() @Max(MAX_TOPUP_AMOUNT) amount!: number;
  @IsOptional() @IsString() referenceNumber?: string;
}

export class EftConfirmDto {
  @IsNumber() @IsPositive() @Max(MAX_TOPUP_AMOUNT) amount!: number;
  @IsOptional() @IsString() senderAccount?: string;
}

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Subscribe to premium', description: 'Premium üyelik aboneliği başlatır.' })
  @Post('premium/subscribe')
  async subscribe(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubscribeDto) {
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
  async processCreditCard(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreditCardProcessDto) {
    if (!dto.orderNumber) {
      await this.commandBus.execute(
        new TopUpWalletCommand(user.id, Number(dto.amount), 'CREDIT_CARD')
      );
    }

    return {
      success: true,
      message: 'Ödeme işlemi başarıyla tamamlandı.',
      data: {
        status: 'PENDING_GATEWAY',
        transactionId: 'txn_' + randomUUID(),
        requires3DS: true
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('bank-transfer/confirm')
  async confirmBankTransfer(@CurrentUser() user: AuthenticatedUser, @Body() dto: BankTransferConfirmDto) {

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
  async confirmEft(@CurrentUser() user: AuthenticatedUser, @Body() dto: EftConfirmDto) {

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
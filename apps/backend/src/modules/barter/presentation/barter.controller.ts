// apps/backend/src/modules/barter/presentation/barter.controller.ts
// /api/barter/* — barter cüzdan ve genel barter bilgisi

import {
  Controller, Get, Post, Body, UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBarterInfoQuery } from '../application/queries/get-barter-info.query';
import { GetMyBarterChainsQuery } from '../application/queries/get-my-barter-chains.query';
import { GetMyBarterOffersQuery } from '../application/queries/get-my-barter-offers.query';
import { RegisterBarterCommand } from '../application/commands/register-barter.command';
import { FinancialGatewayService } from '../../financial-gateway/financial-gateway.service';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
}

@ApiTags('Barter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
@Controller('barter')
export class BarterController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  // ─── Barter bilgisi ───────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Barter hesap bilgisi' })
  @Get('info')
  async getInfo(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetBarterInfoQuery(user.id));
    return { success: true, data };
  }

  // ─── Zincirler (swap sessions) ────────────────────────────────────────────

  @ApiOperation({ summary: 'Benim takas zincirlerim' })
  @Get('my-chains')
  async getMyChains(@CurrentUser() user: AuthenticatedUser) {
    const sessions = await this.queryBus.execute(new GetMyBarterChainsQuery(user.id));
    return { success: true, data: sessions };
  }

  // ─── Teklifler ────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Benim tekliflerim' })
  @Get('my-offers')
  async getMyOffers(@CurrentUser() user: AuthenticatedUser) {
    const offers = await this.queryBus.execute(new GetMyBarterOffersQuery(user.id));
    return { success: true, data: offers };
  }

  // ─── Barter kaydı ────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Barter sistemine kayıt' })
  @ApiResponse({ status: 201 })
  @Post('register')
  async register(@CurrentUser() user: AuthenticatedUser) {
    return this.commandBus.execute(new RegisterBarterCommand(user.id));
  }

  // ─── Cüzdan işlemleri ─────────────────────────────────────────────────────
  // Not: Gerçek ödeme financial-gateway üzerinden yapılır.
  // Bu endpoint'ler FinancialGatewayService'e bağlanmalı — şimdilik stub.

  @ApiOperation({ summary: 'Barter cüzdanına para yükle' })
  @Post('topup')
  async topup(@CurrentUser() user: AuthenticatedUser, @Body() body: { amount: number }) {
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Geçersiz miktar');
    }
    
    return this.financialGateway.transferBetweenAccounts({
      userId: user.id,
      fromAccountType: 'MAIN',
      toAccountType: 'BARTER',
      amount: body.amount.toString(),
      note: 'Barter havuzuna bakiye aktarımı',
    });
  }

  @ApiOperation({ summary: 'Barter cüzdanından para çek' })
  @Post('withdraw')
  async withdraw(@CurrentUser() user: AuthenticatedUser, @Body() body: { amount: number }) {
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Geçersiz miktar');
    }
    
    return this.financialGateway.transferBetweenAccounts({
      userId: user.id,
      fromAccountType: 'BARTER',
      toAccountType: 'MAIN',
      amount: body.amount.toString(),
      note: 'Barter havuzundan nakit iadesi',
    });
  }

  @ApiOperation({ summary: 'Barter transferi başlat' })
  @Post('transfer')
  async transfer(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { toCompanyId: string; amount: number; note?: string },
  ) {
    if (!body.toCompanyId || !body.amount || body.amount <= 0) {
      throw new BadRequestException('Geçersiz transfer parametreleri');
    }
    // TODO: FinancialGatewayService.transfer(...)
    return {
      success: true,
      message: 'Transfer isteği alındı',
      data: {
        transactionId: `transfer_${Date.now()}`,
        amount:        body.amount,
        toCompanyId:   body.toCompanyId,
        status:        'PENDING',
      },
    };
  }
}


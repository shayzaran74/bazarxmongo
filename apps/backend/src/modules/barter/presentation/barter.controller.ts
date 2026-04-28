// apps/backend/src/modules/barter/presentation/barter.controller.ts
// /api/barter/* — barter cüzdan ve genel barter bilgisi

import {
  Controller, Get, Post, Body, UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Barter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('barter')
export class BarterController {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Barter bilgisi ───────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Barter hesap bilgisi' })
  @Get('info')
  async getInfo(@CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      include: {
        company: { select: { id: true, name: true } },
        metrics: { select: { totalRevenue: true } },
        stats:   { select: { rating: true, reviewCount: true } },
      },
    });

    return {
      success: true,
      data: {
        isRegistered: !!vendor,
        vendorId:     vendor?.id,
        companyId:    vendor?.company?.id,
        companyName:  vendor?.company?.name,
        tier:         vendor?.tier || 'STANDARD',
        rating:       Number(vendor?.stats?.rating || 0),
        balance:      0, // financial-gateway'den gelecek
      },
    };
  }

  // ─── Zincirler (swap sessions) ────────────────────────────────────────────

  @ApiOperation({ summary: 'Benim takas zincirlerim' })
  @Get('my-chains')
  async getMyChains(@CurrentUser() user: any) {
    const vendor = await this.getVendor(user.id);

    const sessions = await this.prisma.swapSession.findMany({
      where: {
        OR: [
          { initiatorId: vendor.company?.id },
          { receiverId: vendor.company?.id },
        ],
      },
      include: {
        tradeOffer: {
          include: {
            fromCompany: { select: { id: true, name: true } },
            toCompany:   { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: sessions };
  }

  // ─── Teklifler ────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Benim tekliflerim' })
  @Get('my-offers')
  async getMyOffers(@CurrentUser() user: any) {
    const vendor = await this.getVendor(user.id);

    const offers = await this.prisma.tradeOffer.findMany({
      where: {
        OR: [
          { fromCompanyId: vendor.company?.id },
          { toCompanyId: vendor.company?.id },
        ],
        status: { in: ['PENDING', 'COUNTER_OFFERED', 'ACCEPTED'] },
      },
      include: {
        fromCompany: { select: { id: true, name: true } },
        toCompany:   { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: offers };
  }

  // ─── Barter kaydı ────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Barter sistemine kayıt' })
  @ApiResponse({ status: 201 })
  @Post('register')
  async register(@CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true, status: true },
    });

    if (!vendor) {
      throw new BadRequestException('Önce satıcı kaydı yapılmalıdır');
    }
    if (vendor.status !== 'APPROVED') {
      throw new BadRequestException('Barter sistemine katılmak için satıcı hesabı onaylı olmalıdır');
    }

    // Vendor tier'ı güncelle — barter erişimi aç
    await this.prisma.vendor.update({
      where: { id: vendor.id },
      data: { barterEnabled: true },
    });

    return {
      success: true,
      message: 'Barter sistemine başarıyla kayıt oldunuz',
      data: { vendorId: vendor.id },
    };
  }

  // ─── Cüzdan işlemleri ─────────────────────────────────────────────────────
  // Not: Gerçek ödeme financial-gateway üzerinden yapılır.
  // Bu endpoint'ler FinancialGatewayService'e bağlanmalı — şimdilik stub.

  @ApiOperation({ summary: 'Barter cüzdanına para yükle' })
  @Post('topup')
  async topup(@CurrentUser() user: any, @Body() body: { amount: number }) {
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Geçersiz miktar');
    }
    // TODO: FinancialGatewayService.topup(user.id, body.amount)
    return {
      success: true,
      message: 'Para yükleme isteği alındı',
      data: {
        transactionId: `topup_${Date.now()}`,
        amount:        body.amount,
        status:        'PENDING',
      },
    };
  }

  @ApiOperation({ summary: 'Barter cüzdanından para çek' })
  @Post('withdraw')
  async withdraw(@CurrentUser() user: any, @Body() body: { amount: number }) {
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Geçersiz miktar');
    }
    // TODO: FinancialGatewayService.withdraw(user.id, body.amount)
    return {
      success: true,
      message: 'Para çekme isteği alındı',
      data: {
        transactionId: `withdraw_${Date.now()}`,
        amount:        body.amount,
        status:        'PENDING',
      },
    };
  }

  @ApiOperation({ summary: 'Barter transferi başlat' })
  @Post('transfer')
  async transfer(
    @CurrentUser() user: any,
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

  // ─── Yardımcı ─────────────────────────────────────────────────────────────

  private async getVendor(userId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId },
      include: { company: { select: { id: true, name: true } } },
    });
    if (!vendor) throw new BadRequestException('Satıcı hesabı bulunamadı');
    return vendor;
  }
}

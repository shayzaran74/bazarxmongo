// apps/backend/src/modules/barter/presentation/offers.controller.ts

import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AcceptTradeOfferCommand } from '../application/commands/accept-trade-offer.command';
import { Prisma } from '@prisma/client';
import { TradeOffer } from '../domain/entities/trade-offer.entity';
import { TradeOfferItem } from '../domain/entities/trade-offer-item.entity';

@ApiTags('Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Gelen/giden teklifleri listele' })
  @Get('my')
  async getMyOffers(@CurrentUser() user: any) {
    const vendor = await this.getVendorWithCompany(user.id);

    const offers = await this.prisma.tradeOffer.findMany({
      where: {
        OR: [
          { fromCompanyId: vendor.company.id },
          { toCompanyId: vendor.company.id },
        ],
      },
      include: {
        fromCompany: { select: { id: true, name: true } },
        toCompany:   { select: { id: true, name: true } },
        offeredItems: true,
        requestedItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: offers };
  }

  @ApiOperation({ summary: 'Takas teklifi oluştur' })
  @ApiResponse({ status: 201 })
  @Post()
  async createOffer(@CurrentUser() user: any, @Body() body: any) {
    const vendor = await this.getVendorWithCompany(user.id);

    // toCompany doğrula
    const toCompany = await this.prisma.company.findUnique({
      where: { id: body.toCompanyId },
      select: { id: true },
    });
    if (!toCompany) throw new NotFoundException('Hedef şirket bulunamadı');

    // Domain entity ile oluştur
    const offeredItems = (body.offeredItems || []).map((i: any) =>
      TradeOfferItem.create(
        new Prisma.Decimal(i.quantity || 1),
        new Prisma.Decimal(i.estimatedValue || 0),
        i.listingId,
        i.surplusItemId,
      ),
    );
    const requestedItems = (body.requestedItems || []).map((i: any) =>
      TradeOfferItem.create(
        new Prisma.Decimal(i.quantity || 1),
        new Prisma.Decimal(i.estimatedValue || 0),
        i.listingId,
        i.surplusItemId,
      ),
    );

    const offer = TradeOffer.create(
      vendor.company.id,
      body.toCompanyId,
      offeredItems,
      requestedItems,
      new Prisma.Decimal(body.cashAmount || 0),
      body.cashDirection || 'TO_RECEIVER',
      body.expiresInDays || 7,
      body.message,
    );

    // Prisma'ya yaz
    await this.prisma.tradeOffer.create({
      data: {
        id:            offer.id,
        fromCompanyId: vendor.company.id,
        toCompanyId:   body.toCompanyId,
        status:        'PENDING',
        cashAmount:    new Prisma.Decimal(body.cashAmount || 0),
        cashDirection: body.cashDirection || 'TO_RECEIVER',
        cashCurrency:  body.currency || 'TRY',
        message:       body.message,
        initiatorId:   user.id,
        initiatorType: 'VENDOR',
        receiverId:    body.receiverId || body.toCompanyId,
        receiverType:  'VENDOR',
        expiresAt:     new Date(Date.now() + (body.expiresInDays || 7) * 24 * 60 * 60 * 1000),
      },
    });

    return { success: true, data: { id: offer.id, status: 'PENDING' } };
  }

  @ApiOperation({ summary: 'Teklife karşı teklif ver' })
  @ApiParam({ name: 'id', description: 'Orijinal teklif ID' })
  @Post(':id/counter')
  async counterOffer(
    @CurrentUser() user: any,
    @Param('id') originalOfferId: string,
    @Body() body: any,
  ) {
    const vendor = await this.getVendorWithCompany(user.id);

    const original = await this.prisma.tradeOffer.findFirst({
      where: { id: originalOfferId, toCompanyId: vendor.company.id, status: 'PENDING' },
    });
    if (!original) throw new NotFoundException('Teklif bulunamadı veya yanıtlamaya yetkili değilsiniz');

    // Orijinal teklifi COUNTER_OFFERED olarak işaretle
    await this.prisma.tradeOffer.update({
      where: { id: originalOfferId },
      data: { status: 'COUNTER_OFFERED' },
    });

    // Yeni karşı teklif oluştur
    const counter = await this.prisma.tradeOffer.create({
      data: {
        fromCompanyId:  vendor.company.id,
        toCompanyId:    original.fromCompanyId!,
        status:         'PENDING',
        cashAmount:     new Prisma.Decimal(body.cashAmount || 0),
        cashDirection:  body.cashDirection || 'TO_RECEIVER',
        cashCurrency:   body.currency || 'TRY',
        message:        body.message,
        parentOfferId:  originalOfferId,
        counterOfferId: originalOfferId,
        initiatorId:    user.id,
        initiatorType:  'VENDOR',
        receiverId:     original.fromCompanyId!,
        receiverType:   'VENDOR',
        expiresAt:      new Date(Date.now() + (body.expiresInDays || 7) * 24 * 60 * 60 * 1000),
      },
    });

    return { success: true, data: counter };
  }

  @ApiOperation({ summary: 'Teklif detayı' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    const vendor = await this.getVendorWithCompany(user.id);

    const offer = await this.prisma.tradeOffer.findFirst({
      where: {
        id,
        OR: [
          { fromCompanyId: vendor.company.id },
          { toCompanyId: vendor.company.id },
        ],
      },
      include: {
        fromCompany:    { select: { id: true, name: true } },
        toCompany:      { select: { id: true, name: true } },
        offeredItems:   true,
        requestedItems: true,
      },
    });
    if (!offer) throw new NotFoundException('Teklif bulunamadı');
    return { success: true, data: offer };
  }

  @ApiOperation({ summary: 'Teklifi kabul et' })
  @ApiParam({ name: 'id' })
  @Post(':id/accept')
  async acceptOffer(@CurrentUser() user: any, @Param('id') id: string) {
    const vendor = await this.getVendorWithCompany(user.id);

    const offer = await this.prisma.tradeOffer.findFirst({
      where: { id, toCompanyId: vendor.company.id, status: 'PENDING' },
    });
    if (!offer) throw new NotFoundException('Teklif bulunamadı');

    return this.commandBus.execute(new AcceptTradeOfferCommand(id));
  }

  @ApiOperation({ summary: 'Teklifi iptal et' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  async cancelOffer(@CurrentUser() user: any, @Param('id') id: string) {
    const vendor = await this.getVendorWithCompany(user.id);

    const offer = await this.prisma.tradeOffer.findFirst({
      where: {
        id,
        fromCompanyId: vendor.company.id,
        status: { in: ['PENDING', 'COUNTER_OFFERED', 'ACCEPTED'] },
      },
    });
    if (!offer) throw new NotFoundException('İptal edilebilir teklif bulunamadı');

    await this.prisma.tradeOffer.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
    return { success: true };
  }

  // ─── Yardımcı ─────────────────────────────────────────────────────────────

  private async getVendorWithCompany(userId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId },
      include: { company: { select: { id: true, name: true } } },
    });
    if (!vendor?.company) {
      throw new BadRequestException('Şirket hesabı bulunamadı');
    }
    return vendor;
  }
}

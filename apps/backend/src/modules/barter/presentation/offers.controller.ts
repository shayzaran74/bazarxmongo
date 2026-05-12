// apps/backend/src/modules/barter/presentation/offers.controller.ts

import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, NotFoundException, BadRequestException, ForbiddenException,
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
import { TRADE_OFFER_DEFAULT_TTL_MS } from '@barterborsa/shared-core';

interface AuthenticatedUser {
  id: string;
  role: string;
}

interface TradeOfferItemBody {
  quantity?: number;
  estimatedValue?: number;
  listingId?: string;
  surplusItemId?: string;
}

interface CreateOfferBody {
  toCompanyId?: string;
  surplusItemId?: string;
  offeredItems?: TradeOfferItemBody[];
  requestedItems?: TradeOfferItemBody[];
  cashAmount?: number;
  cashDirection?: string;
  currency?: string;
  expiresInDays?: number;
  message?: string;
  note?: string;
  type?: string;
  barterAmount?: number;
  receiverId?: string;
}

interface CounterOfferBody {
  cashAmount?: number;
  cashDirection?: string;
  currency?: string;
  expiresInDays?: number;
  message?: string;
  note?: string;
  barterAmount?: number;
}

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
  async getMyOffers(@CurrentUser() user: AuthenticatedUser) {
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
        offeredItems:   true,
        requestedItems: true,
        // Kabul sonrası swap session ID'yi frontend'e taşı
        swapSession: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: offers };
  }

  @ApiOperation({ summary: 'Takas teklifi oluştur' })
  @ApiResponse({ status: 201 })
  @Post()
  async createOffer(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateOfferBody) {
    const vendor = await this.getVendorWithCompany(user.id);

    let toCompanyId = body.toCompanyId;
    let receiverId = body.receiverId;

    // Eğer toCompanyId veya receiverId yoksa ama surplusItemId varsa, ilandan bul
    if ((!toCompanyId || !receiverId) && body.surplusItemId) {
      const item = await this.prisma.surplusItem.findUnique({
        where: { id: body.surplusItemId },
        include: { company: { include: { vendor: true } } }
      });
      if (item) {
        if (!toCompanyId) toCompanyId = item.companyId;
        if (!receiverId) {
          // İlan sahibinin vendor ID'sini bul, yoksa companyId'yi fallback yap
          receiverId = item.company?.vendor?.userId || item.company?.vendor?.id || item.companyId;
        }
      }
    }

    if (!toCompanyId) throw new BadRequestException('Hedef şirket ID (toCompanyId) bulunamadı.');
    if (!receiverId) throw new BadRequestException('Hedef alıcı ID (receiverId) bulunamadı.');

    // toCompany doğrula
    const toCompany = await this.prisma.company.findUnique({
      where: { id: toCompanyId },
      select: { id: true, status: true },
    });
    if (!toCompany) throw new NotFoundException('Hedef şirket bulunamadı');

    // Domain entity ile oluştur
    const offeredItems = (body.offeredItems ?? []).map((i) =>
      TradeOfferItem.create(
        new Prisma.Decimal(i.quantity ?? 1),
        new Prisma.Decimal(i.estimatedValue ?? 0),
        i.listingId,
        i.surplusItemId,
      ),
    );
    const requestedItems = (body.requestedItems ?? []).map((i) =>
      TradeOfferItem.create(
        new Prisma.Decimal(i.quantity ?? 1),
        new Prisma.Decimal(i.estimatedValue ?? 0),
        i.listingId,
        i.surplusItemId,
      ),
    );

    const offer = TradeOffer.create(
      vendor.company.id,
      toCompanyId,
      offeredItems,
      requestedItems,
      new Prisma.Decimal(body.cashAmount ?? 0),
      (body.cashDirection ?? 'TO_RECEIVER') as 'TO_INITIATOR' | 'TO_RECEIVER',
      body.expiresInDays ?? 7,
      body.note || body.message,
    );

    // Prisma'ya yaz
    const createdOffer = await this.prisma.tradeOffer.create({
      data: {
        id:            offer.id,
        fromCompanyId: vendor.company.id,
        toCompanyId:   toCompanyId,
        status:        'PENDING',
        cashAmount:    new Prisma.Decimal(body.cashAmount ?? 0),
        cashDirection: body.cashDirection ?? 'TO_RECEIVER',
        cashCurrency:  body.currency ?? 'TRY',
        message:       body.note || body.message,
        initiatorId:   user.id,
        initiatorType: 'VENDOR',
        receiverId:    receiverId,
        receiverType:  'VENDOR',
        expiresAt: new Date(Date.now() + (body.expiresInDays ?? 7) * (TRADE_OFFER_DEFAULT_TTL_MS / 7)),
      }
    });

    return { success: true, data: createdOffer };
  }

  @ApiOperation({ summary: 'Teklife karşı teklif ver' })
  @ApiParam({ name: 'id', description: 'Orijinal teklif ID' })
  @Post(':id/counter')
  async counterOffer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') originalOfferId: string,
    @Body() body: CounterOfferBody,
  ) {
    const vendor = await this.getVendorWithCompany(user.id);

    const original = await this.prisma.tradeOffer.findUnique({
      where: { id: originalOfferId },
    });

    if (!original) {
      throw new NotFoundException(`Orijinal teklif (${originalOfferId}) bulunamadı.`);
    }

    if (original.toCompanyId !== vendor.company.id) {
      throw new ForbiddenException('Bu teklife karşı teklif verme yetkiniz yok (Şirket uyuşmazlığı).');
    }

    if (original.status !== 'PENDING') {
      throw new BadRequestException(`Sadece 'BEKLEMEDE' (PENDING) durumundaki tekliflere karşı teklif verilebilir. Mevcut durum: ${original.status}`);
    }

    // Karşı teklif hedefi (orijinal teklifçi) APPROVED olmalı
    if (original.fromCompanyId) {
      const fromCompany = await this.prisma.company.findUnique({
        where: { id: original.fromCompanyId },
        select: { status: true },
      });
      if (fromCompany?.status !== 'APPROVED') {
        throw new BadRequestException('Karşı teklif gönderilecek şirket onaylı değil.');
      }
    }

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
        cashAmount:     new Prisma.Decimal(body.cashAmount ?? 0),
        cashDirection:  body.cashDirection ?? 'TO_RECEIVER',
        cashCurrency:   body.currency ?? 'TRY',
        message:        body.note || body.message,
        parentOfferId:  originalOfferId,
        counterOfferId: originalOfferId,
        initiatorId:    user.id,
        initiatorType:  'VENDOR',
        receiverId:     original.fromCompanyId!,
        receiverType:   'VENDOR',
        expiresAt: new Date(Date.now() + (body.expiresInDays ?? 7) * (TRADE_OFFER_DEFAULT_TTL_MS / 7)),
      },
    });

    return { success: true, data: counter };
  }

  @ApiOperation({ summary: 'Teklif detayı' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
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
  async acceptOffer(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const vendor = await this.getVendorWithCompany(user.id);

    const offer = await this.prisma.tradeOffer.findFirst({
      where: { id, toCompanyId: vendor.company.id, status: 'PENDING' },
    });
    if (!offer) throw new NotFoundException('Teklif bulunamadı');

    return this.commandBus.execute(new AcceptTradeOfferCommand(id, user.id));
  }

  @ApiOperation({ summary: 'Teklifi iptal et' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  async cancelOffer(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
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

  private async getVendorWithCompany(userId: string): Promise<{
    id: string;
    status: string;
    barterEnabled: boolean;
    company: { id: string; name: string; status: string };
  }> {
    const vendor = await this.prisma.vendor.findFirst({
      where:   { userId },
      include: { company: { select: { id: true, name: true, status: true } } },
    });

    if (!vendor) {
      throw new BadRequestException('Satıcı profiliniz bulunamadı.');
    }
    if (vendor.status !== 'APPROVED') {
      throw new BadRequestException('Satıcı hesabınız henüz onaylanmamış.');
    }

    const company = vendor.company ?? {
      id:     vendor.id,
      name:   vendor.slug ?? 'Bireysel Satıcı',
      status: 'APPROVED',
    };

    return { id: vendor.id, status: vendor.status, barterEnabled: vendor.barterEnabled, company };
  }
}

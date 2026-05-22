// apps/backend/src/modules/barter/presentation/offers.controller.ts

import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, NotFoundException, BadRequestException, ForbiddenException, Inject,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { AcceptTradeOfferCommand } from '../application/commands/accept-trade-offer.command';
import { TradeOfferItem } from '../domain/entities/trade-offer-item.entity';
import { TRADE_OFFER_DEFAULT_TTL_MS } from '@barterborsa/shared-core';
import { IVendorRepository } from '../../vendor/domain/repositories/vendor.repository.interface';
import { ITradeOfferRepository } from '../domain/repositories/trade-offer.repository.interface';
import { ISurplusItemRepository } from '../domain/repositories/surplus-item.repository.interface';
import { SurplusItem } from '../domain/entities/surplus-item.entity';

interface AuthenticatedUser { id: string; role: string; }

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
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @Inject('ITradeOfferRepository') private readonly tradeOfferRepository: ITradeOfferRepository,
    @Inject('ISurplusItemRepository') private readonly surplusItemRepository: ISurplusItemRepository,
  ) {}

  @ApiOperation({ summary: 'Gelen/giden teklifleri listele' })
  @Get('my')
  async getMyOffers(@CurrentUser() user: AuthenticatedUser) {
    const vendor = await this.getVendorWithCompany(user.id);

    const result = await this.tradeOfferRepository.findByCompanyWithFilters(
      vendor.company.id,
      0,
      100,
      ['PENDING', 'COUNTER_OFFERED', 'ACCEPTED'],
    );

    return { success: true, data: result.items };
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
      const item = await this.surplusItemRepository.findByIdWithCompany(body.surplusItemId);
      if (item) {
        if (!toCompanyId) toCompanyId = item.companyId;
        if (!receiverId) receiverId = item.companyId;
      }
    }

    if (!toCompanyId) throw new BadRequestException('Hedef şirket ID (toCompanyId) bulunamadı.');
    if (!receiverId) throw new BadRequestException('Hedef alıcı ID (receiverId) bulunamadı.');

    // Receiver vendor APPROVED kontrolü
    const receiverVendorCheck = await this.vendorRepository.findByCompanyId(toCompanyId);
    if (!receiverVendorCheck || receiverVendorCheck.getProps().status !== 'APPROVED') {
      throw new BadRequestException('Hedef firmanın satıcı hesabı onaylanmamış.');
    }

    // Master Plan v4.3 §4.5 — Ekosistem içi takas yasağı.
    // Aynı fabrika ekosistemine ait iki bayi birbirleriyle takas yapamaz; pazaryerine geçmeliler.
    if (vendor.ecosystemId) {
      // Hedef şirketin vendor kaydından ekosistem bilgisini al
      const receiverVendor = await this.vendorRepository.findByCompanyId(toCompanyId);
      const receiverEcosystemId = receiverVendor?.getProps()?.ecosystemId;
      if (receiverEcosystemId && receiverEcosystemId === vendor.ecosystemId) {
        throw new ForbiddenException({
          code: 'BARTER_NOT_ALLOWED_IN_ECOSYSTEM',
          message: 'Aynı ekosistemdeki bayilerle takas yapamazsınız. Lütfen BazarX Pazaryeri\'ne geçin.',
          details: { ecosystemId: vendor.ecosystemId },
        });
      }
    }

    // Master Plan v4.3 §4.2 — Fabrikadan satın alınan ürünler pazaryerinde takas edilebilir mi?
    // `allowOnlineResale` izni olmayan ekosistem listing'leri takasa konu edilemez.
    if (body.surplusItemId) {
      const surplus = await this.surplusItemRepository.findById(body.surplusItemId);
      // SurplusItem domain entity'sinde allowOnlineResale yansıtılmışsa kontrol et
      interface SurplusResaleProps { ecosystemId?: string; allowOnlineResale?: boolean }
      const surplusProps: SurplusResaleProps = (surplus as SurplusItem | null)?.getProps?.() ?? {};
      const ecosystemListing = surplusProps.ecosystemId;
      const allowResale = surplusProps.allowOnlineResale;
      if (ecosystemListing && allowResale === false) {
        throw new ForbiddenException({
          code: 'ONLINE_RESALE_NOT_ALLOWED',
          message: 'Bu fabrika ürünü çevrimiçi takasa açık değil.',
        });
      }
    }

    const expiresAt = new Date(Date.now() + (body.expiresInDays ?? 7) * (TRADE_OFFER_DEFAULT_TTL_MS / 7));
    const cashAmount = body.cashAmount ?? 0;

    const createdOffer = await this.tradeOfferRepository.create({
      fromCompanyId: vendor.company.id,
      toCompanyId,
      status: 'PENDING',
      cashAmount,
      cashDirection: body.cashDirection ?? 'TO_RECEIVER',
      cashCurrency: body.currency ?? 'TRY',
      message: body.note || body.message,
      initiatorId: user.id,
      initiatorType: 'VENDOR',
      receiverId,
      receiverType: 'VENDOR',
      expiresAt,
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

    const original = await this.tradeOfferRepository.findByIdWithRelations(originalOfferId);

    if (!original) {
      throw new NotFoundException(`Orijinal teklif (${originalOfferId}) bulunamadı.`);
    }

    if (original.toCompanyId !== vendor.company.id) {
      throw new ForbiddenException('Bu teklife karşı teklif verme yetkiniz yok (Şirket uyuşmazlığı).');
    }

    if (original.status !== 'PENDING') {
      throw new BadRequestException(`Sadece 'BEKLEMEDE' (PENDING) durumundaki tekliflere karşı teklif verilebilir. Mevcut durum: ${original.status}`);
    }

    // Orijinal teklifi COUNTER_OFFERED olarak işaretle
    await this.tradeOfferRepository.updateStatus(originalOfferId, 'COUNTER_OFFERED');

    // Karşı teklif alıcısının vendor kaydını bul (receiverId vendor ID olmalı, company ID değil)
    const originalInitiatorVendor = await this.vendorRepository.findByCompanyId(original.fromCompanyId ?? '');
    if (!originalInitiatorVendor) {
      throw new BadRequestException('Orijinal teklif sahibinin satıcı kaydı bulunamadı.');
    }

    // Yeni karşı teklif oluştur
    const expiresAt = new Date(Date.now() + (body.expiresInDays ?? 7) * (TRADE_OFFER_DEFAULT_TTL_MS / 7));
    const counter = await this.tradeOfferRepository.create({
      fromCompanyId:  vendor.company.id,
      toCompanyId:    original.fromCompanyId ?? '',
      status:         'PENDING',
      cashAmount:     body.cashAmount ?? 0,
      cashDirection:  body.cashDirection ?? 'TO_RECEIVER',
      cashCurrency:   body.currency ?? 'TRY',
      message:        body.note || body.message,
      parentOfferId:  originalOfferId,
      counterOfferId: originalOfferId,
      initiatorId:    user.id,
      initiatorType:  'VENDOR',
      receiverId:     originalInitiatorVendor.id,
      receiverType:   'VENDOR',
      expiresAt,
    });

    return { success: true, data: counter };
  }

  @ApiOperation({ summary: 'Teklif detayı' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const vendor = await this.getVendorWithCompany(user.id);

    const offer = await this.tradeOfferRepository.findByIdWithRelations(id);
    if (!offer) throw new NotFoundException('Teklif bulunamadı');

    if (offer.fromCompanyId !== vendor.company.id && offer.toCompanyId !== vendor.company.id) {
      throw new NotFoundException('Teklif bulunamadı');
    }

    return { success: true, data: offer };
  }

  @ApiOperation({ summary: 'Teklifi kabul et' })
  @ApiParam({ name: 'id' })
  @Post(':id/accept')
  async acceptOffer(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const vendor = await this.getVendorWithCompany(user.id);

    const offer = await this.tradeOfferRepository.findByIdWithRelations(id);
    if (!offer || offer.toCompanyId !== vendor.company.id || offer.status !== 'PENDING') {
      throw new NotFoundException('Teklif bulunamadı');
    }

    return this.commandBus.execute(new AcceptTradeOfferCommand(id, user.id));
  }

  @ApiOperation({ summary: 'Teklifi iptal et' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  async cancelOffer(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const vendor = await this.getVendorWithCompany(user.id);

    const offer = await this.tradeOfferRepository.findByIdWithRelations(id);
    if (!offer || offer.fromCompanyId !== vendor.company.id) {
      throw new NotFoundException('İptal edilebilir teklif bulunamadı');
    }

    if (!['PENDING', 'COUNTER_OFFERED', 'ACCEPTED'].includes(offer.status)) {
      throw new NotFoundException('İptal edilebilir teklif bulunamadı');
    }

    await this.tradeOfferRepository.updateStatus(id, 'CANCELLED');
    return { success: true };
  }

  // ─── Yardımcı ─────────────────────────────────────────────────────────────

  private async getVendorWithCompany(userId: string): Promise<{
    id: string;
    status: string;
    barterEnabled: boolean;
    ecosystemId?: string;
    company: { id: string; name: string; status: string };
  }> {
    const vendor = await this.vendorRepository.findByUserId(userId);

    if (!vendor) {
      throw new BadRequestException('Satıcı profiliniz bulunamadı.');
    }
    const props = vendor.getProps();
    if (props.status !== 'APPROVED') {
      throw new BadRequestException('Satıcı hesabınız henüz onaylanmamış.');
    }
    if (!props.barterEnabled) {
      throw new BadRequestException('Takas (barter) modülü hesabınız için aktif değil.');
    }

    const company = {
      id: props.companyId ?? vendor.id,
      name: '',
      status: props.companyStatus ?? 'APPROVED',
    };

    return {
      id: vendor.id,
      status: props.status,
      barterEnabled: props.barterEnabled ?? false,
      ecosystemId: props.ecosystemId,
      company,
    };
  }
}
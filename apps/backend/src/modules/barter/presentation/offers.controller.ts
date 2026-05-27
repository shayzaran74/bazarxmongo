// apps/backend/src/modules/barter/presentation/offers.controller.ts

import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, NotFoundException, BadRequestException, ForbiddenException, Inject,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CommandBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { AcceptTradeOfferCommand } from '../application/commands/accept-trade-offer.command';
import { TradeOfferItem as TradeOfferItemModel } from '@barterborsa/shared-persistence/schemas/backend/tradeOfferItem.schema';
import { TradeOfferItem } from '../domain/entities/trade-offer-item.entity';
import { TRADE_OFFER_DEFAULT_TTL_MS } from '@barterborsa/shared-core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICompany } from '@barterborsa/shared-persistence';
import { ISwapSession } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { IVendorRepository } from '../../vendor/domain/repositories/vendor.repository.interface';
import { IEcosystemMembershipRepository } from '../../vendor/domain/repositories/i-ecosystem-membership.repository';
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
  offeredItemId?: string;
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
  surplusItemId?: string;
  offeredItemId?: string;
  offeredItems?: TradeOfferItemBody[];
  requestedItems?: TradeOfferItemBody[];
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
    @Inject('IEcosystemMembershipRepository')
    private readonly membershipRepo: IEcosystemMembershipRepository,
    @Inject('ITradeOfferRepository') private readonly tradeOfferRepository: ITradeOfferRepository,
    @Inject('ISurplusItemRepository') private readonly surplusItemRepository: ISurplusItemRepository,
    @InjectModel('Company') private readonly companyModel: Model<ICompany>,
    @InjectModel('SwapSession') private readonly swapSessionModel: Model<ISwapSession>,
  ) {}

  @ApiOperation({ summary: 'Gelen/giden teklifleri listele' })
  @Get('my')
  async getMyOffers(
    @CurrentUser() user: AuthenticatedUser,
    @Query('companyId') _companyId?: string,
    @Query('type') _type?: string,
  ) {
    const vendor = await this.getVendorWithCompany(user.id);

    const result = await this.tradeOfferRepository.findByCompanyWithFilters(
      vendor.company.id,
      0,
      100,
      ['PENDING', 'COUNTER_OFFERED', 'ACCEPTED', 'COMPLETED'],
    );

    const plainOffers = result.items.map(o => ({ ...o.getProps(), id: o.id }) as Record<string, unknown>);
    const enriched = await Promise.all(plainOffers.map(o => this.enrichOffer(o)));

    return { success: true, data: enriched };
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

    // Receiver vendor APPROVED + barterEnabled kontrolü (initiator getVendorWithCompany'de denetlendi)
    const receiverVendorCheck = await this.vendorRepository.findByCompanyId(toCompanyId);
    if (!receiverVendorCheck || receiverVendorCheck.getProps().status !== 'APPROVED') {
      throw new BadRequestException('Hedef firmanın satıcı hesabı onaylanmamış.');
    }
    if (!receiverVendorCheck.getProps().barterEnabled) {
      throw new BadRequestException('Hedef firmanın takas (barter) modülü aktif değil.');
    }

    // Master Plan v4.3 §4.5 — Ekosistem içi takas yasağı.
    // Aynı fabrika ekosistemine ait iki bayi birbirleriyle takas yapamaz; pazaryerine geçmeliler.
    // Sadece VENDOR → VENDOR takaslarında çalışır.
    const initiatorVendor = await this.vendorRepository.findByCompanyId(vendor.company.id);
    if (!initiatorVendor) {
      throw new BadRequestException('Gönderen satıcı bilgisi bulunamadı.');
    }

    const initiatorIsVendor = initiatorVendor.getProps().vendorType === 'COMMERCE';
    const receiverVendor = await this.vendorRepository.findByCompanyId(toCompanyId);
    const receiverIsVendor = receiverVendor?.getProps().vendorType === 'COMMERCE';

    if (initiatorIsVendor && receiverIsVendor) {
      // Her iki taraf da VENDOR — ekosistem membership kontrolü yap
      const initiatorMemberships = await this.membershipRepo.findActiveByDealerId(initiatorVendor.id);
      const receiverMemberships = await this.membershipRepo.findActiveByDealerId(receiverVendor!.id);

      const initiatorEcoIds = new Set(initiatorMemberships.map(m => m.ecosystemId));
      const sharedEcosystem = receiverMemberships.find(m => initiatorEcoIds.has(m.ecosystemId));

      if (sharedEcosystem) {
        throw new ForbiddenException({
          code: 'BARTER_NOT_ALLOWED_IN_ECOSYSTEM',
          message: 'Aynı fabrika ekosistemine üye bayiler birbirleriyle takas yapamaz. Genel BazarX Pazaryeri\'ni kullanın.',
          details: { ecosystemId: sharedEcosystem.ecosystemId },
        });
      }
    }

    // KENDİ İLANINA TEKLİF YASAK — Master Plan v4.3 §4
    const allOfferedIds = [
      ...(body.offeredItems?.map(o => o.surplusItemId) ?? []),
      body.offeredItemId,
    ].filter(Boolean) as string[];
    if (body.surplusItemId && allOfferedIds.includes(body.surplusItemId)) {
      throw new ForbiddenException({
        code: 'SELF_BARTER_NOT_ALLOWED',
        message: 'Kendi ilanınıza teklif yapamazsınız.',
      });
    }
    // Çoklu offeredItems içinde kendi ürünü var mı kontrolü
    if (body.offeredItems?.length && body.surplusItemId) {
      const offeredCompanyIds = await Promise.all(
        body.offeredItems.map(async o => {
          if (!o.surplusItemId) return null
          const s = await this.surplusItemRepository.findById(o.surplusItemId)
          return s ? (s as { get companyId(): string }).companyId : null
        })
      )
      const targetItem = await this.surplusItemRepository.findById(body.surplusItemId)
      const targetCompanyId = targetItem ? (targetItem as { get companyId(): string }).companyId : null
      if (targetCompanyId && offeredCompanyIds.includes(targetCompanyId)) {
        throw new ForbiddenException({
          code: 'SELF_BARTER_NOT_ALLOWED',
          message: 'Kendi ilanınıza teklif yapamazsınız.',
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
      cashDirection: body.cashDirection ?? (cashAmount > 0 ? 'TO_RECEIVER' : 'NONE'),
      cashCurrency: body.currency ?? 'TRY',
      message: body.note || body.message,
      initiatorId: user.id,
      initiatorType: 'VENDOR',
      receiverId,
      receiverType: 'VENDOR',
      expiresAt,
      requestedItemId: body.surplusItemId,
      offeredItemId:   body.offeredItemId,
    });

    const offerId = createdOffer.id;

    // ─── Çoklu offeredItems ───────────────────────────────────────────────────
    const allOffered: TradeOfferItemBody[] =
      (body.offeredItems?.length ?? 0) > 0
        ? body.offeredItems!
        : (body.offeredItemId ? [{ surplusItemId: body.offeredItemId }] : []);

    for (const item of allOffered) {
      if (!item.surplusItemId) continue
      const surplus = await this.surplusItemRepository.findById(item.surplusItemId);
      if (surplus) {
        const props = surplus.getProps();
        const qty = item.quantity ?? 1;
        const computedValue = item.estimatedValue
          ?? props.estimatedValue
          ?? ((props.unitPrice ?? 0) * qty);
        await TradeOfferItemModel.create({
          _id:              randomUUID(),
          id:               randomUUID(),
          surplusItemId:    item.surplusItemId,
          quantity:         Types.Decimal128.fromString(String(qty)),
          estimatedValue:   Types.Decimal128.fromString(String(computedValue || 0)),
          offered_offer_id: offerId,
        });
      }
    }

    // ─── Çoklu requestedItems ─────────────────────────────────────────────────
    const allRequested: TradeOfferItemBody[] =
      (body.requestedItems?.length ?? 0) > 0
        ? body.requestedItems!
        : (body.surplusItemId ? [{ surplusItemId: body.surplusItemId }] : []);

    for (const item of allRequested) {
      if (!item.surplusItemId) continue
      const surplus = await this.surplusItemRepository.findById(item.surplusItemId);
      if (surplus) {
        const props = surplus.getProps();
        const qty = item.quantity ?? 1;
        const computedValue = item.estimatedValue
          ?? props.estimatedValue
          ?? ((props.unitPrice ?? 0) * qty);
        await TradeOfferItemModel.create({
          _id:                 randomUUID(),
          id:                  randomUUID(),
          surplusItemId:       item.surplusItemId,
          quantity:            Types.Decimal128.fromString(String(qty)),
          estimatedValue:      Types.Decimal128.fromString(String(computedValue || 0)),
          requested_offer_id:  offerId,
        });
      }
    }

    const offerProps = createdOffer.getProps();
    return { success: true, data: { ...offerProps, id: createdOffer.id } };
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

    // KENDİ İLANINA TEKLİF YASAK — counter-offer için de geçerli
    const allOfferedIdsCounter = [
      ...(body.offeredItems?.map(o => o.surplusItemId) ?? []),
      body.offeredItemId,
    ].filter(Boolean) as string[];
    if (body.surplusItemId && allOfferedIdsCounter.includes(body.surplusItemId)) {
      throw new ForbiddenException({
        code: 'SELF_BARTER_NOT_ALLOWED',
        message: 'Kendi ilanınıza teklif yapamazsınız.',
      });
    }
    if (body.offeredItems?.length && body.surplusItemId) {
      const offeredCompanyIds = await Promise.all(
        body.offeredItems.map(async o => {
          if (!o.surplusItemId) return null
          const s = await this.surplusItemRepository.findById(o.surplusItemId)
          return s ? (s as { get companyId(): string }).companyId : null
        })
      )
      const targetItem = await this.surplusItemRepository.findById(body.surplusItemId)
      const targetCompanyId = targetItem ? (targetItem as { get companyId(): string }).companyId : null
      if (targetCompanyId && offeredCompanyIds.includes(targetCompanyId)) {
        throw new ForbiddenException({
          code: 'SELF_BARTER_NOT_ALLOWED',
          message: 'Kendi ilanınıza teklif yapamazsınız.',
        });
      }
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
      receiverId:     originalInitiatorVendor.getProps().companyId,
      receiverType:   'VENDOR',
      expiresAt,
      offerSource:    'COUNTER',
    });

    const counterId = counter.id;

    // ─── Counter-offer için TradeOfferItem kayıtları ─────────────────────────
    const allOffered: TradeOfferItemBody[] =
      (body.offeredItems?.length ?? 0) > 0
        ? body.offeredItems!
        : (body.offeredItemId ? [{ surplusItemId: body.offeredItemId }] : []);

    for (const item of allOffered) {
      if (!item.surplusItemId) continue
      const surplus = await this.surplusItemRepository.findById(item.surplusItemId);
      if (surplus) {
        const props = surplus.getProps();
        const qty = item.quantity ?? 1;
        const computedValue = item.estimatedValue
          ?? props.estimatedValue
          ?? ((props.unitPrice ?? 0) * qty);
        await TradeOfferItemModel.create({
          _id:              randomUUID(),
          id:               randomUUID(),
          surplusItemId:    item.surplusItemId,
          quantity:         Types.Decimal128.fromString(String(qty)),
          estimatedValue:   Types.Decimal128.fromString(String(computedValue || 0)),
          offered_offer_id: counterId,
        });
      }
    }

    const allRequested: TradeOfferItemBody[] =
      (body.requestedItems?.length ?? 0) > 0
        ? body.requestedItems!
        : (body.surplusItemId ? [{ surplusItemId: body.surplusItemId }] : []);

    for (const item of allRequested) {
      if (!item.surplusItemId) continue
      const surplus = await this.surplusItemRepository.findById(item.surplusItemId);
      if (surplus) {
        const props = surplus.getProps();
        const qty = item.quantity ?? 1;
        const computedValue = item.estimatedValue
          ?? props.estimatedValue
          ?? ((props.unitPrice ?? 0) * qty);
        await TradeOfferItemModel.create({
          _id:                 randomUUID(),
          id:                  randomUUID(),
          surplusItemId:       item.surplusItemId,
          quantity:            Types.Decimal128.fromString(String(qty)),
          estimatedValue:      Types.Decimal128.fromString(String(computedValue || 0)),
          requested_offer_id:  counterId,
        });
      }
    }

    return { success: true, data: counter };
  }

  @ApiOperation({ summary: 'Teklif detayı' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const vendor = await this.getVendorWithCompany(user.id);

    const raw = await this.tradeOfferRepository.findByIdWithRelations(id);
    if (!raw) throw new NotFoundException('Teklif bulunamadı');

    if (raw.fromCompanyId !== vendor.company.id && raw.toCompanyId !== vendor.company.id) {
      throw new NotFoundException('Teklif bulunamadı');
    }

    const enriched = await this.enrichOffer(raw);
    return { success: true, data: enriched };
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

  @ApiOperation({ summary: 'Teklif durumunu güncelle (reddet vb.)' })
  @ApiParam({ name: 'id' })
  @Patch(':id/status')
  async updateOfferStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const vendor = await this.getVendorWithCompany(user.id);
    const newStatus = (body.status ?? '').toUpperCase();

    const offer = await this.tradeOfferRepository.findByIdWithRelations(id);
    if (!offer) throw new NotFoundException('Teklif bulunamadı');

    const isReceiver  = offer.toCompanyId === vendor.company.id;
    const isInitiator = offer.fromCompanyId === vendor.company.id;

    if (newStatus === 'REJECTED') {
      if (!isReceiver) throw new ForbiddenException('Sadece alıcı taraf teklifi reddedebilir.');
      if (!['PENDING', 'COUNTER_OFFERED'].includes(offer.status)) {
        throw new BadRequestException(`Mevcut durumda (${offer.status}) reddedilemez.`);
      }
      await this.tradeOfferRepository.updateStatus(id, 'REJECTED');
      return { success: true };
    }

    if (newStatus === 'CANCELLED') {
      if (!isInitiator) throw new ForbiddenException('Sadece teklif veren taraf iptal edebilir.');
      if (!['PENDING', 'COUNTER_OFFERED'].includes(offer.status)) {
        throw new BadRequestException(`Mevcut durumda (${offer.status}) iptal edilemez.`);
      }
      await this.tradeOfferRepository.updateStatus(id, 'CANCELLED');
      return { success: true };
    }

    throw new BadRequestException(`Desteklenmeyen durum: ${body.status}`);
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
      status: 'APPROVED',
    };

    return {
      id: vendor.id,
      status: props.status,
      barterEnabled: props.barterEnabled ?? false,
      ecosystemId: props.ecosystemId,
      company,
    };
  }

  private normalizeImages(images: unknown): string[] {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.map(img => {
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && img !== null && 'url' in img) {
          return (img as { url: string }).url;
        }
        return String(img);
      }).filter((url): url is string => Boolean(url));
    }
    return [];
  }

  private async enrichOffer(raw: Record<string, unknown>): Promise<Record<string, unknown>> {
    const fromCompanyId = raw['fromCompanyId'] as string | undefined;
    const toCompanyId   = raw['toCompanyId']   as string | undefined;
    const requestedItemId = raw['requestedItemId'] as string | undefined;
    const offeredItemId   = raw['offeredItemId']   as string | undefined;
    const offerId = raw['id'] as string | undefined;

    const companyIds = [fromCompanyId, toCompanyId].filter(Boolean) as string[];
    const companies = companyIds.length
      ? await this.companyModel.find({ id: { $in: companyIds } }).lean()
      : [];
    const companyMap = new Map(companies.map(c => [c.id, { id: c.id, name: c.name ?? '' }]));

    // TradeOfferItem kayıtlarından çoklu ürünleri al
    const tradeOfferItems = offerId
      ? await TradeOfferItemModel.find({ $or: [{ offeredOfferId: offerId }, { requestedOfferId: offerId }] }).lean()
      : [];

    const offeredItemIds   = tradeOfferItems.filter(i => i.offeredOfferId   === offerId).map(i => i.surplusItemId).filter(Boolean) as string[];
    const requestedItemIds = tradeOfferItems.filter(i => i.requestedOfferId === offerId).map(i => i.surplusItemId).filter(Boolean) as string[];
    const allItemIds = [...new Set([...offeredItemIds, ...requestedItemIds, requestedItemId, offeredItemId].filter(Boolean))] as string[];

    const surplusItems = allItemIds.length
      ? await this.surplusItemRepository.findWithFilters({ id: { $in: allItemIds } }, 0, allItemIds.length)
      : { items: [] };
    const itemMap = new Map<string, { id: string; title: string; images: string[] }>(
      surplusItems.items.map(item => {
        const p = item.getProps();
        const normalizedImages = this.normalizeImages(p.images);
        return [item.id, { id: item.id, title: p.title, images: normalizedImages }] as [string, { id: string; title: string; images: string[] }];
      })
    );

    const status  = raw['status'] as string | undefined;
    let swapSession: { id: string } | null = null;
    if ((status === 'ACCEPTED' || status === 'COMPLETED') && offerId) {
      const session = await this.swapSessionModel.findOne({ tradeOfferId: offerId }, { id: 1 }).lean();
      if (session) swapSession = { id: session.id };
    }

    return {
      ...raw,
      fromCompany:    fromCompanyId ? (companyMap.get(fromCompanyId) ?? null) : null,
      toCompany:      toCompanyId   ? (companyMap.get(toCompanyId)   ?? null) : null,
      requestedItems: requestedItemIds.map(id => itemMap.get(id)).filter(Boolean) as unknown[],
      offeredItems:   offeredItemIds.map(id => itemMap.get(id)).filter(Boolean) as unknown[],
      swapSession,
    };
  }
}
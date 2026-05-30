// apps/backend/src/modules/barter/application/commands/create-trade-offer.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { ICompany } from '@barterborsa/shared-persistence';
import { TradeOfferItem as TradeOfferItemModel } from '@barterborsa/shared-persistence/schemas/backend/tradeOfferItem.schema';
import { TRADE_OFFER_DEFAULT_TTL_MS } from '@barterborsa/shared-core';
import { CreateTradeOfferCommand, TradeOfferItemInput } from './create-trade-offer.command';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { IEcosystemMembershipRepository } from '../../../vendor/domain/repositories/i-ecosystem-membership.repository';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { SurplusItem } from '../../domain/entities/surplus-item.entity';
import { BarterVendorGuardService } from '../services/barter-vendor-guard.service';

@CommandHandler(CreateTradeOfferCommand)
export class CreateTradeOfferHandler implements ICommandHandler<CreateTradeOfferCommand> {
  constructor(
    private readonly vendorGuard: BarterVendorGuardService,
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @Inject('IEcosystemMembershipRepository')
    private readonly membershipRepo: IEcosystemMembershipRepository,
    @Inject('ITradeOfferRepository') private readonly tradeOfferRepository: ITradeOfferRepository,
    @Inject('ISurplusItemRepository') private readonly surplusItemRepository: ISurplusItemRepository,
    @InjectModel('Company') private readonly companyModel: Model<ICompany>,
  ) {}

  async execute(command: CreateTradeOfferCommand): Promise<Record<string, unknown>> {
    const { userId, body } = command;
    const vendor = await this.vendorGuard.requireApprovedVendorWithCompany(userId);

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

    // Receiver vendor APPROVED + barterEnabled kontrolü (initiator guard'da denetlendi)
    const receiverVendorCheck = await this.vendorRepository.findByCompanyId(toCompanyId);
    if (!receiverVendorCheck || receiverVendorCheck.getProps().status !== 'APPROVED') {
      throw new BadRequestException('Hedef firmanın satıcı hesabı onaylanmamış.');
    }
    if (!receiverVendorCheck.getProps().barterEnabled) {
      throw new BadRequestException('Hedef firmanın takas (barter) modülü aktif değil.');
    }
    // Firma onay duvarı (kural #1): teklif alan firmanın da APPROVED olması gerekir
    const receiverCompanyDoc = await this.companyModel.findOne({ id: toCompanyId }).lean().exec();
    if (!receiverCompanyDoc || receiverCompanyDoc.status !== 'APPROVED') {
      throw new BadRequestException('Hedef firma onaylanmamış. Takas için karşı firmanın onaylı olması gerekir.');
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
          if (!o.surplusItemId) return null;
          const s = await this.surplusItemRepository.findById(o.surplusItemId);
          return s ? (s as { get companyId(): string }).companyId : null;
        }),
      );
      const targetItem = await this.surplusItemRepository.findById(body.surplusItemId);
      const targetCompanyId = targetItem ? (targetItem as { get companyId(): string }).companyId : null;
      if (targetCompanyId && offeredCompanyIds.includes(targetCompanyId)) {
        throw new ForbiddenException({
          code: 'SELF_BARTER_NOT_ALLOWED',
          message: 'Kendi ilanınıza teklif yapamazsınız.',
        });
      }
    }

    // Master Plan v4.3 §4.2 — `allowOnlineResale` izni olmayan ekosistem listing'leri takasa konu edilemez.
    if (body.surplusItemId) {
      const surplus = await this.surplusItemRepository.findById(body.surplusItemId);
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
      initiatorId: userId,
      initiatorType: 'VENDOR',
      receiverId,
      receiverType: 'VENDOR',
      expiresAt,
      requestedItemId: body.surplusItemId,
      offeredItemId: body.offeredItemId,
    });

    const offerId = createdOffer.id;

    // ─── Çoklu offeredItems ───────────────────────────────────────────────────
    const allOffered: TradeOfferItemInput[] =
      (body.offeredItems?.length ?? 0) > 0
        ? body.offeredItems!
        : (body.offeredItemId ? [{ surplusItemId: body.offeredItemId }] : []);

    for (const item of allOffered) {
      if (!item.surplusItemId) continue;
      const surplus = await this.surplusItemRepository.findById(item.surplusItemId);
      if (surplus) {
        const props = surplus.getProps();
        const qty = item.quantity ?? 1;
        const computedValue = item.estimatedValue
          ?? props.estimatedValue
          ?? ((props.unitPrice ?? 0) * qty);
        await TradeOfferItemModel.create({
          _id: randomUUID(),
          id: randomUUID(),
          surplusItemId: item.surplusItemId,
          quantity: Types.Decimal128.fromString(String(qty)),
          estimatedValue: Types.Decimal128.fromString(String(computedValue || 0)),
          offered_offer_id: offerId,
        });
      }
    }

    // ─── Çoklu requestedItems ─────────────────────────────────────────────────
    const allRequested: TradeOfferItemInput[] =
      (body.requestedItems?.length ?? 0) > 0
        ? body.requestedItems!
        : (body.surplusItemId ? [{ surplusItemId: body.surplusItemId }] : []);

    for (const item of allRequested) {
      if (!item.surplusItemId) continue;
      const surplus = await this.surplusItemRepository.findById(item.surplusItemId);
      if (surplus) {
        const props = surplus.getProps();
        const qty = item.quantity ?? 1;
        const computedValue = item.estimatedValue
          ?? props.estimatedValue
          ?? ((props.unitPrice ?? 0) * qty);
        await TradeOfferItemModel.create({
          _id: randomUUID(),
          id: randomUUID(),
          surplusItemId: item.surplusItemId,
          quantity: Types.Decimal128.fromString(String(qty)),
          estimatedValue: Types.Decimal128.fromString(String(computedValue || 0)),
          requested_offer_id: offerId,
        });
      }
    }

    const offerProps = createdOffer.getProps();
    return { ...offerProps, id: createdOffer.id };
  }
}

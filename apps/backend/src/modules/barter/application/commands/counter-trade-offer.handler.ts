// apps/backend/src/modules/barter/application/commands/counter-trade-offer.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { TradeOfferItem as TradeOfferItemModel } from '@barterborsa/shared-persistence/schemas/backend/tradeOfferItem.schema';
import { TRADE_OFFER_DEFAULT_TTL_MS } from '@barterborsa/shared-core';
import { CounterTradeOfferCommand, CounterTradeOfferInput } from './counter-trade-offer.command';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { TradeOffer } from '../../domain/entities/trade-offer.entity';
import { BarterVendorGuardService } from '../services/barter-vendor-guard.service';

@CommandHandler(CounterTradeOfferCommand)
export class CounterTradeOfferHandler implements ICommandHandler<CounterTradeOfferCommand> {
  constructor(
    private readonly vendorGuard: BarterVendorGuardService,
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @Inject('ITradeOfferRepository') private readonly tradeOfferRepository: ITradeOfferRepository,
    @Inject('ISurplusItemRepository') private readonly surplusItemRepository: ISurplusItemRepository,
  ) {}

  async execute(command: CounterTradeOfferCommand): Promise<TradeOffer> {
    const { userId, originalOfferId, body } = command;
    const vendor = await this.vendorGuard.requireApprovedVendorWithCompany(userId);

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

    // Orijinal teklifi COUNTER_OFFERED olarak işaretle
    await this.tradeOfferRepository.updateStatus(originalOfferId, 'COUNTER_OFFERED');

    // Karşı teklif alıcısının vendor kaydını bul
    const originalInitiatorVendor = await this.vendorRepository.findByCompanyId(original.fromCompanyId ?? '');
    if (!originalInitiatorVendor) {
      throw new BadRequestException('Orijinal teklif sahibinin satıcı kaydı bulunamadı.');
    }

    // Yeni karşı teklif oluştur
    const expiresAt = new Date(Date.now() + (body.expiresInDays ?? 7) * (TRADE_OFFER_DEFAULT_TTL_MS / 7));
    const counter = await this.tradeOfferRepository.create({
      fromCompanyId: vendor.company.id,
      toCompanyId: original.fromCompanyId ?? '',
      status: 'PENDING',
      cashAmount: body.cashAmount ?? 0,
      cashDirection: body.cashDirection ?? 'TO_RECEIVER',
      cashCurrency: body.currency ?? 'TRY',
      message: body.note || body.message,
      parentOfferId: originalOfferId,
      counterOfferId: originalOfferId,
      initiatorId: userId,
      initiatorType: 'VENDOR',
      receiverId: originalInitiatorVendor.getProps().companyId,
      receiverType: 'VENDOR',
      expiresAt,
      offerSource: 'COUNTER',
    });

    const counterId = counter.id;

    await this.createOfferItems(body, counterId);

    // Orijinal davranışı koru: ham TradeOffer entity'si data olarak döner
    return counter;
  }

  // offered/requested item kayıtlarını oluşturur (createOffer ile aynı kural)
  private async createOfferItems(body: CounterTradeOfferInput, counterId: string): Promise<void> {
    const allOffered: NonNullable<CounterTradeOfferInput['offeredItems']> =
      (body.offeredItems?.length ?? 0) > 0
        ? body.offeredItems!
        : (body.offeredItemId ? [{ surplusItemId: body.offeredItemId }] : []);

    for (const item of allOffered) {
      await this.persistItem(item, counterId, 'offered');
    }

    const allRequested: NonNullable<CounterTradeOfferInput['requestedItems']> =
      (body.requestedItems?.length ?? 0) > 0
        ? body.requestedItems!
        : (body.surplusItemId ? [{ surplusItemId: body.surplusItemId }] : []);

    for (const item of allRequested) {
      await this.persistItem(item, counterId, 'requested');
    }
  }

  private async persistItem(
    item: NonNullable<CounterTradeOfferInput['offeredItems']>[number],
    counterId: string,
    role: 'offered' | 'requested',
  ): Promise<void> {
    if (!item.surplusItemId) return;
    const surplus = await this.surplusItemRepository.findById(item.surplusItemId);
    if (!surplus) return;
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
      ...(role === 'offered'
        ? { offered_offer_id: counterId }
        : { requested_offer_id: counterId }),
    });
  }
}

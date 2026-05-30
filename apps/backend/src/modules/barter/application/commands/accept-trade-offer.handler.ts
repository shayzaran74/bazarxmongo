// apps/backend/src/modules/barter/application/commands/accept-trade-offer.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { AcceptTradeOfferCommand } from './accept-trade-offer.command';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { SwapSession } from '../../domain/entities/swap-session.entity';
import { BarterPart } from '../../domain/entities/barter-part.entity';
import { CollateralCalculatorService } from '../services/collateral-calculator.service';
import { WatchtowerService } from '../services/watchtower.service';
import { CommissionEngineService } from '../../../vendor/application/services/commission-engine.service';
import { DomainException } from '@barterborsa/shared-core';
import { TradeOffer as TradeOfferModel } from '@barterborsa/shared-persistence/schemas/backend/tradeOffer.schema';
import { TradeOfferItem as TradeOfferItemModel, ITradeOfferItem } from '@barterborsa/shared-persistence/schemas/backend/tradeOfferItem.schema';
import { SwapSession as SwapSessionModel } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { SurplusItem as SurplusItemModel } from '@barterborsa/shared-persistence/schemas/backend/surplusItem.schema';
import { BarterPart as BarterPartModel } from '@barterborsa/shared-persistence/schemas/backend/barterPart.schema';
import { OutboxMessage } from '@barterborsa/shared-persistence/schemas/backend/outbox-message.schema';
import { RabbitMQService } from '@barterborsa/shared-messaging';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { Company as CompanyModel } from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { Vendor as VendorModel } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';

@CommandHandler(AcceptTradeOfferCommand)
export class AcceptTradeOfferHandler implements ICommandHandler<AcceptTradeOfferCommand> {
  private readonly logger = new Logger(AcceptTradeOfferHandler.name);

  constructor(
    @Inject('ITradeOfferRepository') private readonly offerRepository: ITradeOfferRepository,
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    private readonly collateralCalculator: CollateralCalculatorService,
    private readonly watchtower: WatchtowerService,
    private readonly commissionEngine: CommissionEngineService,
    @InjectConnection() private readonly connection: Connection,
    private readonly rabbitMQ: RabbitMQService,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: AcceptTradeOfferCommand) {
    const offer = await this.offerRepository.findById(command.offerId);
    if (!offer) throw new DomainException('Trade offer not found');

    this.logger.log('Teklif bulundu', { offerId: offer.id, status: offer.getProps().status });

    offer.accept();

    // Teklif edilen ürünleri ayrı koleksiyondan yükle (trade_offer_items)
    const offeredItems = await TradeOfferItemModel
      .find({ offeredOfferId: offer.id })
      .lean()
      .exec() as ITradeOfferItem[];

    this.logger.log('TradeOfferItem sorgusu', { offerId: offer.id, foundCount: offeredItems.length });

    // Geriye dönük uyumluluk: TradeOfferItem yoksa surplusItem üzerinden hesapla
    let totalOfferedValue = 0;
    const offerProps = offer.getProps();

    if (offeredItems.length > 0) {
      totalOfferedValue = offeredItems.reduce(
        (acc, item) => acc + parseFloat(item.estimatedValue?.toString() ?? '0'),
        0,
      );
      // Teklif edilen miktar kadar blockedQuantity artır; tamamı bloke ise RESERVED yap
      for (const item of offeredItems) {
        if (item.surplusItemId) {
          const itemQty = parseFloat(item.quantity?.toString() ?? '0');
          await this.reserveSurplusPartially(item.surplusItemId, itemQty);
        }
      }
    } else if (offerProps.offeredItemId) {
      const surplus = await SurplusItemModel.findOne({ id: offerProps.offeredItemId }).lean();
      if (surplus) {
        const sd = surplus as Record<string, unknown>;
        totalOfferedValue = parseFloat(sd.price?.toString() ?? '0') || 0;
        const surplusQty = parseFloat(sd.quantity?.toString() ?? '0');
        await this.reserveSurplusPartially(offerProps.offeredItemId, surplusQty);
      }
    }

    // İstenen (requested) ürünleri de kısmi blokaja al
    const requestedItems = await TradeOfferItemModel
      .find({ requestedOfferId: offer.id })
      .lean()
      .exec() as ITradeOfferItem[];

    for (const item of requestedItems) {
      if (item.surplusItemId) {
        const itemQty = parseFloat(item.quantity?.toString() ?? '0');
        await this.reserveSurplusPartially(item.surplusItemId, itemQty);
      }
    }

    // İstenen ürünlerin toplam değeri (initiator'ın aldığı değer — komisyon tabanı)
    let totalRequestedValue = 0;
    if (requestedItems.length > 0) {
      totalRequestedValue = requestedItems.reduce(
        (acc, item) => acc + parseFloat(item.estimatedValue?.toString() ?? '0'),
        0,
      );
    } else if (offerProps.requestedItemId) {
      const reqSurplus = await SurplusItemModel.findOne({ id: offerProps.requestedItemId }).lean();
      if (reqSurplus) {
        const rd = reqSurplus as Record<string, unknown>;
        totalRequestedValue = parseFloat(rd.price?.toString() ?? '0') || 0;
      }
    }

    if (totalOfferedValue <= 0) {
      throw new DomainException('Teklif edilen ürünlerin toplam değeri sıfır olamaz');
    }

    const collateralAmount = this.collateralCalculator.calculateCollateral(totalOfferedValue);

    // SmartCap: teminat firma limitini aşıyorsa DomainException
    await this.watchtower.checkBarterSmartCap(
      offer.getProps().initiatorId,
      collateralAmount,
      command.offerId,
    );

    // SwapSession oluştur (henüz holdId yok)
    const session = SwapSession.create(
      offer.id,
      offer.getProps().fromCompanyId,
      offer.getProps().toCompanyId,
      collateralAmount,
    );

    const idempotencyBase = `barter-collateral-${session.id}`;

    // ─── receiverId (companyId) → userId çözümlemesi ────────────────────────
    const initiatorUserId = offer.getProps().initiatorId;
    let receiverUserId = offer.getProps().receiverId;

    const receiverVendor = await VendorModel
      .findOne({ companyId: receiverUserId })
      .select('userId id')
      .lean()
      .exec() as { userId?: string; id?: string } | null;

    if (receiverVendor?.userId) {
      receiverUserId = receiverVendor.userId;
    }

    // Komisyon motoru için her iki tarafın vendorId'si (companyId üzerinden)
    const initiatorVendor = await VendorModel
      .findOne({ companyId: offer.getProps().fromCompanyId })
      .select('id')
      .lean()
      .exec() as { id?: string } | null;
    const initiatorVendorId = initiatorVendor?.id;
    const receiverVendorId = receiverVendor?.id;

    // ─── Bakiye Kontrolü ─────────────────────────────────────────────────────
    const { sufficient: initiatorHasBalance, currentBalance: initiatorBalance } =
      await this.financialGateway.checkBalance(initiatorUserId, collateralAmount.toString());
    if (!initiatorHasBalance) {
      throw new DomainException(
        `Teklifçinin cüzdanında yeterli bakiye yok. Mevcut: ${initiatorBalance} ₺, Gerekli: ${collateralAmount.toString()} ₺`,
      );
    }

    const { sufficient: receiverHasBalance, currentBalance: receiverBalance } =
      await this.financialGateway.checkBalance(receiverUserId, collateralAmount.toString());
    if (!receiverHasBalance) {
      throw new DomainException(
        `Alıcının cüzdanında yeterli bakiye yok. Mevcut: ${receiverBalance} ₺, Gerekli: ${collateralAmount.toString()} ₺`,
      );
    }

    // ─── Sıralı holdFunds + Telafi ─────────────────────────────────────────────
    // 1. Initiator (teklifçi) teminat blokajı
    const initiatorHoldResult = await this.financialGateway.holdFunds(
      initiatorUserId,
      collateralAmount.toString(),
      'BARTER_COLLATERAL',
      session.id,
      'SWAP_SESSION',
      `${idempotencyBase}-initiator`,
    );
    const fromHoldId = initiatorHoldResult.holdId as string;

    // 2. Receiver (alıcı) teminat blokajı — başarısız olursa initiator iadesi
    let toHoldId: string;
    try {
      const receiverHoldResult = await this.financialGateway.holdFunds(
        receiverUserId,
        collateralAmount.toString(),
        'BARTER_COLLATERAL',
        session.id,
        'SWAP_SESSION',
        `${idempotencyBase}-receiver`,
      );
      toHoldId = receiverHoldResult.holdId as string;
    } catch (receiverError: unknown) {
      // Telafi: initiator'ın blokajını iade et
      try {
        await this.financialGateway.refundFunds(
          fromHoldId,
          `${idempotencyBase}-initiator-refund`,
        );
      } catch (refundError: unknown) {
        const msg = refundError instanceof Error ? refundError.message : 'Bilinmeyen hata';
        this.logger.error('Initiator teminat iadesi başarısız', { fromHoldId, error: msg });
      }
      const errMsg = receiverError instanceof Error ? receiverError.message : 'Bilinmeyen hata';
      throw new DomainException(`Alıcı teminat blokajı başarısız: ${errMsg}`);
    }

    // HoldId'leri session'a yaz; collateralStatus → HELD
    session.setHoldIds(fromHoldId, toHoldId);
    session.activate();

    // ─── Komisyon (Master Plan §3/§6 — Faz 1: HELD, capture Faz 2) ──────────────
    // Her taraf ALDIĞI değer + aldığı nakit üzerinden kendi tier'ından komisyon öder.
    const cashAmount = offerProps.cashAmount ?? 0;
    const cashDirection = offerProps.cashDirection;
    const initiatorBase = totalRequestedValue + (cashDirection === 'TO_INITIATOR' ? cashAmount : 0);
    const receiverBase = totalOfferedValue + (cashDirection === 'TO_RECEIVER' ? cashAmount : 0);

    let fromCommissionAmount = 0;
    let toCommissionAmount = 0;
    let fromXpCommission = 0;
    let toXpCommission = 0;
    let commissionRateType = 'STANDARD';
    let fromCommissionHoldId: string | undefined;
    let toCommissionHoldId: string | undefined;
    let commissionStatus: 'NONE' | 'HELD' = 'NONE';

    if (initiatorVendorId && receiverVendorId) {
      // Faz 3c: XP indirimi opt-in. xpToApply yalnızca İSTEĞİ YAPAN tarafa (actorId) uygulanır;
      // karşı taraf accept anında kendi XP'sini kullanamaz.
      const xp = command.xpToApply ?? 0;
      const initiatorXp = command.actorId === initiatorUserId ? xp : 0;
      const receiverXp = command.actorId === receiverUserId ? xp : 0;

      try {
        // Faz 3a: taraflar ortak bir ekosisteme üye/sahip ise grup oranı (fabrika↔bayi).
        const sharedEcosystemId = await this.commissionEngine.resolveSharedEcosystemId(
          initiatorVendorId,
          receiverVendorId,
        );
        const isGroup = !!sharedEcosystemId;

        // §3: XP indirimi ile grup içi (ekosistem) oran aynı işlemde birleşemez
        if (xp > 0 && isGroup) {
          throw new DomainException('XP indirimi, grup içi (ekosistem) komisyon oranı ile aynı işlemde uygulanamaz.');
        }

        const [initiatorBreakdown, receiverBreakdown] = await Promise.all([
          this.commissionEngine.calculate({
            vendorId: initiatorVendorId,
            counterpartyVendorId: receiverVendorId,
            transactionAmount: initiatorBase,
            isGroupTransaction: isGroup,
            xpToApply: initiatorXp,
            referenceId: session.id,
            referenceType: 'TRADE',
          }),
          this.commissionEngine.calculate({
            vendorId: receiverVendorId,
            counterpartyVendorId: initiatorVendorId,
            transactionAmount: receiverBase,
            isGroupTransaction: isGroup,
            xpToApply: receiverXp,
            referenceId: session.id,
            referenceType: 'TRADE',
          }),
        ]);
        fromCommissionAmount = initiatorBreakdown.cashCommission;
        toCommissionAmount = receiverBreakdown.cashCommission;
        fromXpCommission = initiatorBreakdown.xpCommission;
        toXpCommission = receiverBreakdown.xpCommission;
        // XP uygulanan tarafın rateType'ı yansıtılır (yoksa standart/grup)
        commissionRateType = receiverXp > 0 ? receiverBreakdown.rateType : initiatorBreakdown.rateType;
      } catch (commErr: unknown) {
        const msg = commErr instanceof Error ? commErr.message : 'Bilinmeyen hata';
        if (xp > 0) {
          // Kullanıcı AÇIKÇA XP istedi ama geçersiz (yetersiz XP / ilk işlem / grup çakışması):
          // teminat blokajlarını geri al ve hatayı yüzeye çıkar.
          for (const [hid, key] of [
            [fromHoldId, `${idempotencyBase}-initiator-refund-xp`],
            [toHoldId, `${idempotencyBase}-receiver-refund-xp`],
          ] as Array<[string | undefined, string]>) {
            if (!hid) continue;
            try {
              await this.financialGateway.refundFunds(hid, key);
            } catch (refundErr: unknown) {
              this.logger.error('XP hatası sonrası teminat iadesi başarısız', {
                holdId: hid,
                error: refundErr instanceof Error ? refundErr.message : String(refundErr),
              });
            }
          }
          throw commErr;
        }
        this.logger.warn('Komisyon hesaplaması başarısız — komisyon olmadan devam edilecek', {
          sessionId: session.id,
          error: msg,
        });
      }
    }

    // Komisyon blokajı yalnızca config bayrağı açıkken yapılır (güvenli rollout — Faz 1)
    const commissionHoldEnabled = process.env.BARTER_COMMISSION_HOLD_ENABLED === 'true';
    const platformAccountId = process.env.BARTER_COMMISSION_PLATFORM_ACCOUNT_ID ?? '';

    if (commissionHoldEnabled && platformAccountId && (fromCommissionAmount > 0 || toCommissionAmount > 0)) {
      const commissionIdemBase = `barter-commission-${session.id}`;
      try {
        if (fromCommissionAmount > 0) {
          const r = await this.financialGateway.holdFunds(
            initiatorUserId,
            fromCommissionAmount.toString(),
            'BARTER_COMMISSION',
            session.id,
            'SWAP_SESSION',
            `${commissionIdemBase}-initiator`,
            platformAccountId,
          );
          fromCommissionHoldId = r.holdId as string;
        }
        if (toCommissionAmount > 0) {
          const r = await this.financialGateway.holdFunds(
            receiverUserId,
            toCommissionAmount.toString(),
            'BARTER_COMMISSION',
            session.id,
            'SWAP_SESSION',
            `${commissionIdemBase}-receiver`,
            platformAccountId,
          );
          toCommissionHoldId = r.holdId as string;
        }
        commissionStatus = 'HELD';
      } catch (commHoldErr: unknown) {
        // Telafi: yerleştirilen komisyon + her iki teminat blokajını geri al
        const refunds: Array<[string | undefined, string]> = [
          [fromCommissionHoldId, `${commissionIdemBase}-initiator-refund`],
          [fromHoldId, `${idempotencyBase}-initiator-refund-commission`],
          [toHoldId, `${idempotencyBase}-receiver-refund-commission`],
        ];
        for (const [hid, key] of refunds) {
          if (!hid) continue;
          try {
            await this.financialGateway.refundFunds(hid, key);
          } catch (refundErr: unknown) {
            this.logger.error('Komisyon telafi iadesi başarısız', {
              holdId: hid,
              error: refundErr instanceof Error ? refundErr.message : String(refundErr),
            });
          }
        }
        const msg = commHoldErr instanceof Error ? commHoldErr.message : 'Bilinmeyen hata';
        throw new DomainException(`Komisyon blokajı başarısız: ${msg}`);
      }
    }

    // ─── BarterPart'lar ────────────────────────────────────────────────────────
    const part1 = BarterPart.create(
      session.id,
      1,
      offer.getProps().fromCompanyId,
      offer.getProps().toCompanyId,
    );
    const part2 = BarterPart.create(
      session.id,
      2,
      offer.getProps().toCompanyId,
      offer.getProps().fromCompanyId,
    );

    // ─── Atomik DB yazımı — tüm belgeler aynı transaction içinde ────────────
    const mongoSession = await this.connection.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        // Teklif statüsünü session ile güncelle; hata olursa rollback'e dahil olur
        await TradeOfferModel.findOneAndUpdate(
          { id: offer.id },
          { $set: { status: 'ACCEPTED', acceptedAt: new Date() } },
          { session: mongoSession },
        ).exec();

        await SwapSessionModel.create(
          [
            {
              _id: session.id,
              id: session.id,
              tradeOfferId: offer.id,
              initiatorId: session.getProps().initiatorId,
              receiverId: session.getProps().receiverId,
              collateralAmount: Types.Decimal128.fromString(session.getProps().collateralAmount.toString()),
              collateralCurrency: session.getProps().collateralCurrency,
              collateralStatus: session.getProps().collateralStatus,
              collateralLockedAt: session.getProps().collateralLockedAt,
              fromCollateralHoldId: session.getProps().fromCollateralHoldId,
              toCollateralHoldId: session.getProps().toCollateralHoldId,
              initiatorHoldId: fromHoldId,
              receiverHoldId: toHoldId,
              status: session.getProps().status,
              timeoutAt: session.getProps().timeoutAt,
              shipmentMode: session.getProps().shipmentMode,
              // ─── Komisyon (Faz 1) ───────────────────────────────────────
              offeredValue: Types.Decimal128.fromString(totalOfferedValue.toString()),
              requestedValue: Types.Decimal128.fromString(totalRequestedValue.toString()),
              cashAmount: Types.Decimal128.fromString(cashAmount.toString()),
              cashDirection,
              fromCommissionAmount: Types.Decimal128.fromString(fromCommissionAmount.toString()),
              toCommissionAmount: Types.Decimal128.fromString(toCommissionAmount.toString()),
              fromXpCommission: Types.Decimal128.fromString(fromXpCommission.toString()),
              toXpCommission: Types.Decimal128.fromString(toXpCommission.toString()),
              fromCommissionHoldId,
              toCommissionHoldId,
              commissionStatus,
              commissionRateType,
            },
          ],
          { session: mongoSession },
        );

        await BarterPartModel.create(
          [
            {
              _id: part1.id,
              id: part1.id,
              swapSessionId: session.id,
              partNumber: 1,
              senderId: part1.getProps().senderId,
              recipientId: part1.getProps().recipientId,
              status: part1.getProps().status,
            },
            {
              _id: part2.id,
              id: part2.id,
              swapSessionId: session.id,
              partNumber: 2,
              senderId: part2.getProps().senderId,
              recipientId: part2.getProps().recipientId,
              status: part2.getProps().status,
            },
          ],
          { session: mongoSession, ordered: true },
        );

        // Outbox event — session içinde kaydedilir
        await OutboxMessage.create(
          [
            {
              _id: randomUUID(),
              aggregateId: offer.id,
              aggregateType: 'TradeOffer',
              eventType: 'offer.accepted',
              exchange: 'barter.events',
              routingKey: 'offer.accepted',
              payload: {
                offerId: offer.id,
                sessionId: session.id,
                fromCompanyId: offer.getProps().fromCompanyId,
                toCompanyId: offer.getProps().toCompanyId,
                initiatorId: offer.getProps().initiatorId,
                receiverId: offer.getProps().receiverId,
                fromAddress: {},
                toAddress: {},
                collateralAmount: session.getProps().collateralAmount.toString(),
                fromCollateralHoldId: fromHoldId,
                toCollateralHoldId: toHoldId,
              },
              status: 'PENDING',
            },
          ],
          { session: mongoSession },
        );
      });
    } finally {
      await mongoSession.endSession();
    }

    await this.auditLog.log({
      actorId: command.actorId,
      action: 'BARTER_OFFER_ACCEPTED',
      resourceType: 'SwapSession',
      resourceId: session.id,
      newValue: {
        offerId: offer.id,
        fromCompanyId: offer.getProps().fromCompanyId,
        toCompanyId: offer.getProps().toCompanyId,
        collateralAmount: collateralAmount.toString(),
        fromCollateralHoldId: fromHoldId,
        toCollateralHoldId: toHoldId,
        status: session.getProps().collateralStatus,
        // Komisyon (Faz 1)
        commissionStatus,
        commissionRateType,
        fromCommissionAmount: fromCommissionAmount.toString(),
        toCommissionAmount: toCommissionAmount.toString(),
      },
    });

    this.logger.log('Takas teklifi kabul edildi', {
      offerId: offer.id,
      sessionId: session.id,
      collateralAmount: collateralAmount.toString(),
    });

    return { success: true, sessionId: session.id };
  }

  private async reserveSurplusPartially(surplusItemId: string, requestedQty: number): Promise<void> {
    // Atomik compare-and-swap: blockedQuantity'yu $inc ile artır, yeterli stok kontrolü yap
    const updated = await SurplusItemModel.findOneAndUpdate(
      {
        _id: surplusItemId,
        $expr: { $lte: [{ $add: [{ $ifNull: ['$blockedQuantity', 0] }, requestedQty] }, '$quantity'] },
      },
      {
        $inc: { blockedQuantity: requestedQty },
        $set: { status: 'RESERVED' },
      },
      { new: true },
    );
    if (!updated) {
      // Eşzamanlı bloke kazandı — yeterli stok yok
      this.logger.warn('Kısmi blokaj başarısız: yetersiz stok veya eşzamanlı bloke', { surplusItemId, requestedQty });
    }
  }
}

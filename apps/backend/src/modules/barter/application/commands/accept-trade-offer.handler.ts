// apps/backend/src/modules/barter/application/commands/accept-trade-offer.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { AcceptTradeOfferCommand } from './accept-trade-offer.command';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { SwapSession } from '../../domain/entities/swap-session.entity';
import { BarterPart } from '../../domain/entities/barter-part.entity';
import { CollateralCalculatorService } from '../services/collateral-calculator.service';
import { WatchtowerService } from '../services/watchtower.service';
import { DomainException } from '@barterborsa/shared-core';
import { SwapSession as SwapSessionModel } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { BarterPart as BarterPartModel } from '@barterborsa/shared-persistence/schemas/backend/barterPart.schema';
import { OutboxMessage } from '@barterborsa/shared-persistence/schemas/backend/outbox-message.schema';
import { RabbitMQService } from '@barterborsa/shared-messaging';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(AcceptTradeOfferCommand)
export class AcceptTradeOfferHandler implements ICommandHandler<AcceptTradeOfferCommand> {
  private readonly logger = new Logger(AcceptTradeOfferHandler.name);

  constructor(
    @Inject('ITradeOfferRepository') private readonly offerRepository: ITradeOfferRepository,
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    private readonly collateralCalculator: CollateralCalculatorService,
    private readonly watchtower: WatchtowerService,
    @InjectConnection() private readonly connection: Connection,
    private readonly rabbitMQ: RabbitMQService,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: AcceptTradeOfferCommand) {
    const offer = await this.offerRepository.findById(command.offerId);
    if (!offer) throw new DomainException('Trade offer not found');

    offer.accept();

    // Teklif edilen ürünlerin toplam değeri üzerinden teminat hesapla
    const totalOfferedValue = offer.getProps().offeredItems.reduce(
      (acc, item) => Number(acc) + Number(item.getProps().estimatedValue),
      0,
    );
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

    // ─── Sıralı holdFunds + Telafi ─────────────────────────────────────────────
    // 1. Initiator (teklifçi) teminat blokajı
    const initiatorHoldResult = await this.financialGateway.holdFunds(
      offer.getProps().initiatorId,
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
        offer.getProps().receiverId,
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

    // ─── Atomik DB yazımı — Outbox ile event'ler session içinde yazılır ───
    const mongoSession = await this.connection.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        await this.offerRepository.save(offer);

        await SwapSessionModel.create(
          {
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
            status: session.getProps().status,
            timeoutAt: session.getProps().timeoutAt,
            shipmentMode: session.getProps().shipmentMode,
          },
          { session: mongoSession },
        );

        await BarterPartModel.create(
          [
            {
              id: part1.id,
              swapSessionId: session.id,
              partNumber: 1,
              senderId: part1.getProps().senderId,
              recipientId: part1.getProps().recipientId,
              status: part1.getProps().status,
            },
            {
              id: part2.id,
              swapSessionId: session.id,
              partNumber: 2,
              senderId: part2.getProps().senderId,
              recipientId: part2.getProps().recipientId,
              status: part2.getProps().status,
            },
          ],
          { session: mongoSession },
        );

        // Outbox event — session içinde kaydedilir
        await OutboxMessage.create(
          {
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
      },
    });

    this.logger.log('Takas teklifi kabul edildi', {
      offerId: offer.id,
      sessionId: session.id,
      collateralAmount: collateralAmount.toString(),
    });

    return { success: true, sessionId: session.id };
  }
}

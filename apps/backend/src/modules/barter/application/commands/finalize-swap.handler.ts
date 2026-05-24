// apps/backend/src/modules/barter/application/commands/finalize-swap.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { FinalizeSwapCommand } from './finalize-swap.command';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { IBarterPartRepository } from '../../domain/repositories/barter-part.repository.interface';
import { IVendorB2BDataRepository } from '../../domain/repositories/vendor-b2b-data.repository.interface';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { TradeOfferStatus } from '../../domain/enums/trade-offer-status.enum';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { DomainException } from '@barterborsa/shared-core';
import { BarterPart as BarterPartModel } from '@barterborsa/shared-persistence/schemas/backend/barterPart.schema';
import { SwapSession as SwapSessionModel } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';

@CommandHandler(FinalizeSwapCommand)
export class FinalizeSwapHandler implements ICommandHandler<FinalizeSwapCommand> {
  private readonly logger = new Logger(FinalizeSwapHandler.name);

  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    @Inject('IBarterPartRepository') private readonly partRepository: IBarterPartRepository,
    @Inject('IVendorB2BDataRepository') private readonly b2bDataRepository: IVendorB2BDataRepository,
    @Inject('ITradeOfferRepository') private readonly offerRepository: ITradeOfferRepository,
    private readonly auditLog: AuditLogService,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  async execute(command: FinalizeSwapCommand): Promise<{ success: boolean }> {
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) throw new DomainException('Swap session bulunamadı.');

    const props = session.getProps();

    if (props.status !== SwapSessionStatus.COMPLETED && props.status !== SwapSessionStatus.PARTIALLY_COMPLETED) {
      throw new BadRequestException(`Sonlandırma için session 'COMPLETED' veya 'PARTIALLY_COMPLETED' olmalı. Mevcut: ${props.status}`);
    }

    const isInitiator = props.initiatorId === command.vendorId;
    const isReceiver = props.receiverId === command.vendorId;
    if (!isInitiator && !isReceiver) {
      throw new ForbiddenException('Bu swap session\'a erişim yetkiniz yok.');
    }

    if (!props.fromCollateralHoldId || !props.toCollateralHoldId) {
      throw new DomainException('Teminat hold ID\'leri eksik, sistem hatası.');
    }

    const allParts = await this.partRepository.findAllBySwapSession(command.sessionId);
    const now = new Date();
    const allConfirmed = allParts.every(p => p.status === 'CONFIRMED');

    if (!allConfirmed) {
      // Henüz tüm part'lar onaylanmadı — onaylanmamış part'ların süresini kontrol et
      const pendingParts = allParts.filter(
        p => p.status !== 'CONFIRMED' && p.disputeWindowEndsAt && p.disputeWindowEndsAt > now,
      );
      if (pendingParts.length > 0) {
        const latestEndsAt = new Date(Math.max(...pendingParts.map(p => p.disputeWindowEndsAt!.getTime())));
        throw new BadRequestException(
          `İnceleme süresi henüz dolmadı. Teminatlar ${latestEndsAt.toLocaleString('tr-TR')} tarihinde serbest bırakılabilir.`,
        );
      }
    }

    // Tüm part'lar onaylandıysa inceleme sürelerini sıfırla
    for (const part of allParts) {
      if (part.disputeWindowEndsAt && part.disputeWindowEndsAt > now) {
        await BarterPartModel.updateOne(
          { id: part.id },
          { $set: { disputeWindowEndsAt: now, updatedAt: now } },
        ).exec();
      }
    }

    // Teminatları hemen serbest bırakmak yerine admin onayına al
    await SwapSessionModel.updateOne(
      { id: command.sessionId },
      { $set: { collateralStatus: 'PENDING_RELEASE', pendingReleaseAt: now, updatedAt: now } },
    ).exec();

    // Session durumunu COMPLETED'a güncelle
    if (props.status !== SwapSessionStatus.COMPLETED) {
      await this.sessionRepository.updateStatus(command.sessionId, SwapSessionStatus.COMPLETED);
    }

    // Swap tamamlandığında TradeOffer'ı da COMPLETED yap
    if (props.tradeOfferId) {
      try {
        const offer = await this.offerRepository.findById(props.tradeOfferId);
        if (offer && offer.getProps().status !== TradeOfferStatus.COMPLETED) {
          await this.offerRepository.updateStatus(props.tradeOfferId, TradeOfferStatus.COMPLETED);
          this.logger.log('TradeOffer COMPLETED olarak güncellendi', { tradeOfferId: props.tradeOfferId });
        }
      } catch (err) {
        this.logger.warn('TradeOffer güncelleme hatası (kritik değil)', { tradeOfferId: props.tradeOfferId, error: err });
      }
    }

    await this.auditLog.log({
      actorId:      command.actorUserId,
      action:       'SWAP_FINALIZED',
      resourceType: 'SwapSession',
      resourceId:   command.sessionId,
      newValue:     {
        vendorId:           command.vendorId,
        fromCollateralHoldId: props.fromCollateralHoldId,
        toCollateralHoldId:   props.toCollateralHoldId,
        collateralStatus:    'PENDING_RELEASE',
      },
    });

    this.logger.log('Takas onaylandı, admin onayı bekleniyor', {
      sessionId: command.sessionId,
      collateralStatus: 'PENDING_RELEASE',
    });

    return { success: true };
  }
}
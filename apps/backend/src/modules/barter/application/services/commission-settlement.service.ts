// apps/backend/src/modules/barter/application/services/commission-settlement.service.ts
// Master Plan v4.3 §3/§6 — Barter komisyon mutabakatı (Faz 2)
//
// Faz 1 accept-trade-offer.handler komisyonu PLATFORM sellerId ile HELD olarak bloke eder.
// Bu servis, tamamlanan takasta komisyonu platforma capture eder; iptal/timeout'ta iade eder.
//
// Not (Faz 3): PARTIALLY_COMPLETED için orantılı (ratio) capture eklenecek. Tek hold üzerinde
// kısmi capture mümkün olmadığından şimdilik yalnızca tam tamamlanmada capture yapılır.

import { Injectable, Logger, Inject } from '@nestjs/common';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { CommissionEngineService } from '../../../vendor/application/services/commission-engine.service';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { IUserLevelRepository } from '../../domain/repositories/user-level.repository.interface';
import { SwapSession } from '../../domain/entities/swap-session.entity';
import { SwapSession as SwapSessionModel } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { Vendor as VendorModel } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';

@Injectable()
export class CommissionSettlementService {
  private readonly logger = new Logger(CommissionSettlementService.name);

  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepo: ISwapSessionRepository,
    @Inject('IUserLevelRepository') private readonly userLevelRepo: IUserLevelRepository,
    private readonly financialGateway: FinancialGatewayService,
    private readonly commissionEngine: CommissionEngineService,
  ) {}

  /**
   * Tam tamamlanmada komisyon hold'larını PLATFORM'a capture eder.
   * Idempotent: yalnızca commissionStatus === 'HELD' iken çalışır.
   * Finansal işlem hatasında throw eder (çağıran teminat işlemini bu çağrıdan SONRA yapmalı).
   */
  async captureOnCompletion(sessionId: string): Promise<void> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) return;
    const props = session.getProps();
    if (props.commissionStatus !== 'HELD') return; // idempotent — capture edilecek bir şey yok

    const idem = `commission-capture-${sessionId}`;
    // releaseFunds → hold'un sellerId'si (=PLATFORM) hesabına capture eder
    if (props.fromCommissionHoldId) {
      await this.financialGateway.releaseFunds(props.fromCommissionHoldId, `${idem}-from`);
    }
    if (props.toCommissionHoldId) {
      await this.financialGateway.releaseFunds(props.toCommissionHoldId, `${idem}-to`);
    }

    // Domain invariant (HELD → CAPTURED); persist targeted (mapper toPersistence komisyon yazmaz)
    session.captureCommission();
    await this.persistCommissionStatus(session);

    // İlk işlem işaretle + kullanılan XP indirimini bakiyeden düş — best-effort.
    // XP yalnızca capture'da düşülür (iptal/timeout'ta düşülmez → XP iadesine gerek kalmaz).
    // CAPTURED set edildikten SONRA çalışır → idempotent guard çift düşümü önler.
    await this.finalizeParties(
      props.initiatorId,
      props.receiverId,
      props.fromXpCommission ?? 0,
      props.toXpCommission ?? 0,
    );

    this.logger.log('Komisyon platforma capture edildi', { sessionId });
  }

  /**
   * İptal / timeout / alıcı-kazandı durumunda komisyon hold'larını sahibine iade eder.
   * Idempotent: yalnızca commissionStatus === 'HELD' iken çalışır.
   */
  async refundOnCancellation(sessionId: string): Promise<void> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) return;
    const props = session.getProps();
    if (props.commissionStatus !== 'HELD') return; // idempotent

    const idem = `commission-refund-${sessionId}`;
    if (props.fromCommissionHoldId) {
      await this.financialGateway.refundFunds(props.fromCommissionHoldId, `${idem}-from`);
    }
    if (props.toCommissionHoldId) {
      await this.financialGateway.refundFunds(props.toCommissionHoldId, `${idem}-to`);
    }

    // Domain invariant (HELD → REFUNDED); persist targeted
    session.refundCommission();
    await this.persistCommissionStatus(session);

    this.logger.log('Komisyon iade edildi', { sessionId });
  }

  // Yalnızca commissionStatus alanını hedefli günceller — diğer save noktalarının
  // (scheduler/dispute) collateral yazımlarını ezmemek için mapper toPersistence kullanılmaz.
  private async persistCommissionStatus(session: SwapSession): Promise<void> {
    await SwapSessionModel.updateOne(
      { id: session.id },
      { $set: { commissionStatus: session.getProps().commissionStatus, updatedAt: new Date() } },
    ).exec();
  }

  // Capture sonrası taraf finalizasyonu: ilk işlem işaretle + kullanılan XP'yi bakiyeden düş.
  private async finalizeParties(
    initiatorId?: string,
    receiverId?: string,
    fromXp = 0,
    toXp = 0,
  ): Promise<void> {
    const parties: Array<[string | undefined, number]> = [
      [initiatorId, fromXp],
      [receiverId, toXp],
    ];
    for (const [companyId, xpAmount] of parties) {
      if (!companyId) continue;
      try {
        const vendor = await VendorModel
          .findOne({ companyId })
          .select('id userId')
          .lean()
          .exec() as { id?: string; userId?: string } | null;
        if (vendor?.id) {
          await this.commissionEngine.markFirstTransaction(vendor.id);
        }
        if (xpAmount > 0 && vendor?.userId) {
          await this.userLevelRepo.decrementXp(vendor.userId, xpAmount);
        }
      } catch (err: unknown) {
        this.logger.warn('Taraf finalizasyonu (markFirstTransaction/XP düşümü) başarısız (kritik değil)', {
          companyId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }
}

// apps/backend/src/modules/barter/application/commands/finalize-swap.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { FinalizeSwapCommand } from './finalize-swap.command';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { IBarterPartRepository } from '../../domain/repositories/barter-part.repository.interface';
import { IVendorB2BDataRepository } from '../../domain/repositories/vendor-b2b-data.repository.interface';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(FinalizeSwapCommand)
export class FinalizeSwapHandler implements ICommandHandler<FinalizeSwapCommand> {
  private readonly logger = new Logger(FinalizeSwapHandler.name);

  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    @Inject('IBarterPartRepository') private readonly partRepository: IBarterPartRepository,
    @Inject('IVendorB2BDataRepository') private readonly b2bDataRepository: IVendorB2BDataRepository,
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
    const pendingParts = allParts.filter(p => p.disputeWindowEndsAt && p.disputeWindowEndsAt > now);

    if (pendingParts.length > 0) {
      const latestEndsAt = new Date(Math.max(...pendingParts.map(p => p.disputeWindowEndsAt!.getTime())));
      throw new BadRequestException(
        `İnceleme süresi henüz dolmadı. Teminatlar ${latestEndsAt.toLocaleString('tr-TR')} tarihinde serbest bırakılabilir.`,
      );
    }

    const idempotencyBase = `finalize-${command.sessionId}`;

    try {
      await this.financialGateway.releaseFunds(props.fromCollateralHoldId, `${idempotencyBase}-from`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('From collateral iadesi başarısız', { holdId: props.fromCollateralHoldId, msg });
    }

    try {
      await this.financialGateway.releaseFunds(props.toCollateralHoldId, `${idempotencyBase}-to`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('To collateral iadesi başarısız', { holdId: props.toCollateralHoldId, msg });
    }

    session['props'].collateralStatus = 'RELEASED';
    session['props'].collateralReleasedAt = new Date();
    await this.sessionRepository.save(session);

    await this.b2bDataRepository.updateFirstTransaction([props.initiatorId, props.receiverId]);

    await this.auditLog.log({
      actorId:      command.actorUserId,
      action:       'SWAP_FINALIZED',
      resourceType: 'SwapSession',
      resourceId:   command.sessionId,
      newValue:     {
        vendorId:           command.vendorId,
        fromCollateralHoldId: props.fromCollateralHoldId,
        toCollateralHoldId:   props.toCollateralHoldId,
        collateralStatus:    'RELEASED',
      },
    });

    return { success: true };
  }
}
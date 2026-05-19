// apps/backend/src/modules/barter/application/commands/resolve-dispute.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ResolveDisputeCommand } from './resolve-dispute.command';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { IDisputeRepository } from '../../domain/repositories/dispute.repository.interface';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { DisputeResolutionResult } from '../../domain/enums/dispute-resolution-result.enum';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';

@CommandHandler(ResolveDisputeCommand)
export class ResolveDisputeHandler implements ICommandHandler<ResolveDisputeCommand> {
  private readonly logger = new Logger(ResolveDisputeHandler.name);

  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    @Inject('IDisputeRepository') private readonly disputeRepository: IDisputeRepository,
    private readonly auditLog: AuditLogService,
    private readonly financialGateway: FinancialGatewayService,
  ) {}

  async execute(command: ResolveDisputeCommand): Promise<{ success: boolean }> {
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) throw new NotFoundException('Swap session bulunamadı.');

    const props = session.getProps();

    if (props.status !== SwapSessionStatus.DISPUTED) {
      throw new BadRequestException('Sadece ihtilaflı (DISPUTED) oturumlar çözümlenebilir.');
    }

    const idempotencyBase = `resolve-${command.sessionId}-${Date.now()}`;

    // İhtilaf durumunu güncelle
    // Not: MongoDB'de updateMany ile tek seferde tüm alanlar güncellenir
    // resolveDispute'ta swapSessionId ile sınırlı olduğumuz için ilk document'i bulup güncelleriz
    await this.disputeRepository.updateResolved(command.sessionId, {
      resolvedAt: new Date(),
      resolvedById: command.adminId,
      resolutionNote: command.adminNote,
    });

    if (command.result === 'SELLER_WINS' || command.result === 'RELEASE_ALL') {
      if (props.fromCollateralHoldId) {
        try {
          await this.financialGateway.releaseFunds(props.fromCollateralHoldId, `${idempotencyBase}-from`);
        } catch (err) {
          this.logger.error('From collateral release failed', err);
        }
      }
      if (props.toCollateralHoldId) {
        try {
          await this.financialGateway.releaseFunds(props.toCollateralHoldId, `${idempotencyBase}-to`);
        } catch (err) {
          this.logger.error('To collateral release failed', err);
        }
      }

      session['props'].status = SwapSessionStatus.COMPLETED;
      session['props'].collateralStatus = 'RELEASED';
      session['props'].collateralReleasedAt = new Date();
      await this.sessionRepository.save(session);
    } else if (command.result === 'BUYER_WINS' || command.result === 'REFUND_ALL') {
      if (props.fromCollateralHoldId) {
        try {
          await this.financialGateway.refundFunds(props.fromCollateralHoldId, `${idempotencyBase}-from-ref`);
        } catch (err) {
          this.logger.error('From collateral refund failed', err);
        }
      }
      if (props.toCollateralHoldId) {
        try {
          await this.financialGateway.refundFunds(props.toCollateralHoldId, `${idempotencyBase}-to-ref`);
        } catch (err) {
          this.logger.error('To collateral refund failed', err);
        }
      }

      session['props'].status = SwapSessionStatus.CANCELLED;
      session['props'].collateralStatus = 'REFUNDED';
      (session['props'] as any).collateralForfeitedAt = new Date();
      await this.sessionRepository.save(session);
    }

    await this.auditLog.log({
      actorId: command.adminId,
      action: 'SWAP_DISPUTE_RESOLVED',
      resourceType: 'SwapSession',
      resourceId: command.sessionId,
      newValue: { result: command.result, note: command.adminNote },
    });

    return { success: true };
  }
}
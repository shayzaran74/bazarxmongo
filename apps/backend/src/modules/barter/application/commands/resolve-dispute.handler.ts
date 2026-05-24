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

    const idempotencyBase = `resolve-${command.sessionId}-${command.result}`;

    // Önce finansal operasyonlar — başarısız olursa dispute "çözümlendi" olarak işaretlenmez
    if (command.result === 'SELLER_WINS' || command.result === 'RELEASE_ALL') {
      await this.executeCollateralOps([
        props.fromCollateralHoldId
          ? () => this.financialGateway.releaseFunds(props.fromCollateralHoldId!, `${idempotencyBase}-from`)
          : null,
        props.toCollateralHoldId
          ? () => this.financialGateway.releaseFunds(props.toCollateralHoldId!, `${idempotencyBase}-to`)
          : null,
      ], command.sessionId, 'release');

      session.complete();
      session.releaseCollateral();
    } else if (command.result === 'BUYER_WINS' || command.result === 'REFUND_ALL') {
      await this.executeCollateralOps([
        props.fromCollateralHoldId
          ? () => this.financialGateway.refundFunds(props.fromCollateralHoldId!, `${idempotencyBase}-from-ref`)
          : null,
        props.toCollateralHoldId
          ? () => this.financialGateway.refundFunds(props.toCollateralHoldId!, `${idempotencyBase}-to-ref`)
          : null,
      ], command.sessionId, 'refund');

      session.cancel();
      session.forfeitCollateral();
    }

    // Finansal operasyonlar başarılı → dispute ve session güncellenir
    await this.disputeRepository.updateResolved(command.sessionId, {
      resolvedAt: new Date(),
      resolvedById: command.adminId,
      resolutionNote: command.adminNote,
    });

    await this.sessionRepository.save(session);

    await this.auditLog.log({
      actorId: command.adminId,
      action: 'SWAP_DISPUTE_RESOLVED',
      resourceType: 'SwapSession',
      resourceId: command.sessionId,
      newValue: { result: command.result, note: command.adminNote },
    });

    return { success: true };
  }

  // Teminat işlemlerini çalıştırır; herhangi biri başarısız olursa BadRequestException fırlatır
  private async executeCollateralOps(
    ops: Array<(() => Promise<unknown>) | null>,
    sessionId: string,
    opType: 'release' | 'refund',
  ): Promise<void> {
    const failures: string[] = [];

    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      if (!op) continue;
      try {
        await op();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Collateral ${opType} [${i}] başarısız`, { sessionId, error: msg });
        failures.push(`op-${i}: ${msg}`);
      }
    }

    if (failures.length > 0) {
      throw new BadRequestException(
        `Teminat ${opType === 'release' ? 'serbest bırakma' : 'iade'} işlemi başarısız. ` +
        `İşlem iptal edildi, session DISPUTED kaldı. Detay: ${failures.join(' | ')}`,
      );
    }
  }
}
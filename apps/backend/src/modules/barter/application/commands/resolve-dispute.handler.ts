// apps/backend/src/modules/barter/application/commands/resolve-dispute.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ResolveDisputeCommand } from './resolve-dispute.command';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { DisputeResolutionResult } from '../../domain/enums/dispute-resolution-result.enum';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';

@CommandHandler(ResolveDisputeCommand)
export class ResolveDisputeHandler implements ICommandHandler<ResolveDisputeCommand> {
  private readonly logger = new Logger(ResolveDisputeHandler.name);

  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    private readonly prisma: PrismaService,
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

    await this.prisma.$transaction(async (tx) => {
      // 1. İhtilaf durumunu güncelle
      await tx.barterDisputeLog.updateMany({
        where: { swapSessionId: command.sessionId },
        data: {
          resolvedAt: new Date(),
          resolvedById: command.adminId,
          resolutionNote: command.adminNote,
          status: 'RESOLVED',
        } as any,
      });

      // 2. Karara göre finansal aksiyon al
      if (command.result === DisputeResolutionResult.SELLER_WINS || command.result === DisputeResolutionResult.RELEASE_ALL) {
        // Her iki tarafın teminatını serbest bırak (Release)
        if (props.fromCollateralHoldId) {
          await this.financialGateway.releaseFunds(props.fromCollateralHoldId, `${idempotencyBase}-from`);
        }
        if (props.toCollateralHoldId) {
          await this.financialGateway.releaseFunds(props.toCollateralHoldId, `${idempotencyBase}-to`);
        }
        
        await tx.swapSession.update({
          where: { id: command.sessionId },
          data: {
            status: SwapSessionStatus.COMPLETED,
            collateralStatus: 'RELEASED',
            collateralReleasedAt: new Date(),
          },
        });
      } else if (command.result === DisputeResolutionResult.BUYER_WINS || command.result === DisputeResolutionResult.REFUND_ALL) {
        // Her iki tarafın teminatını iade et (Refund)
        if (props.fromCollateralHoldId) {
          await this.financialGateway.refundFunds(props.fromCollateralHoldId, `${idempotencyBase}-from-ref`);
        }
        if (props.toCollateralHoldId) {
          await this.financialGateway.refundFunds(props.toCollateralHoldId, `${idempotencyBase}-to-ref`);
        }

        await tx.swapSession.update({
          where: { id: command.sessionId },
          data: {
            status: SwapSessionStatus.CANCELLED,
            collateralStatus: 'REFUNDED',
            collateralForfeitedAt: new Date(),
          },
        });
      }
    });

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

// apps/backend/src/modules/barter/application/commands/open-dispute.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OpenDisputeCommand } from './open-dispute.command';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { DisputeResolutionStatus, DISPUTE_TIMINGS } from '../../domain/enums/dispute-resolution-status.enum';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(OpenDisputeCommand)
export class OpenDisputeHandler implements ICommandHandler<OpenDisputeCommand> {
  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: OpenDisputeCommand): Promise<{ success: boolean }> {
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) throw new DomainException('Swap session bulunamadı.');

    const props = session.getProps();

    // Tamamlanmış veya zaten dispute olan session'larda anlaşmazlık açılamaz
    if ([SwapSessionStatus.DISPUTED, SwapSessionStatus.CANCELLED, SwapSessionStatus.TIMEOUT].includes(props.status)) {
      throw new BadRequestException(`Bu durumda (${props.status}) anlaşmazlık bildirimi yapılamaz.`);
    }

    const isInitiator = props.initiatorId === command.vendorId;
    const isReceiver = props.receiverId === command.vendorId;
    if (!isInitiator && !isReceiver) {
      throw new ForbiddenException('Bu swap session\'a erişim yetkiniz yok.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.swapSession.update({
        where: { id: command.sessionId },
        data: {
          status:     SwapSessionStatus.DISPUTED,
          disputedAt: new Date(),
          updatedAt:  new Date(),
        },
      });

      // Karşı tarafı belirle (reporter initiator ise respondent receiver)
      const swapRaw = await tx.swapSession.findUnique({ where: { id: command.sessionId } });
      const respondentId = swapRaw?.initiatorId === command.actorUserId ? (swapRaw?.receiverId ?? command.actorUserId) : (swapRaw?.initiatorId ?? command.actorUserId);

      // Master Plan v4.3 §3.4 — Delil sunma penceresi: oluşumdan itibaren 24 saat
      const deadlineAt = new Date(Date.now() + DISPUTE_TIMINGS.RESPONSE_WINDOW_HOURS * 60 * 60 * 1000);

      await tx.barterDisputeLog.create({
        data: {
          swapSessionId:        command.sessionId,
          tradeOfferId:         swapRaw?.tradeOfferId ?? '',
          openedById:           command.actorUserId,
          respondentId,
          tradeValueInKurus:    0,
          reason:               command.reason,
          status:               DisputeResolutionStatus.OPEN,
          resolutionDeadlineAt: deadlineAt,
        },
      });
    });

    await this.auditLog.log({
      actorId:      command.actorUserId,
      action:       'SWAP_DISPUTED',
      resourceType: 'SwapSession',
      resourceId:   command.sessionId,
      newValue:     { vendorId: command.vendorId, reason: command.reason },
    });

    return { success: true };
  }
}

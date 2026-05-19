// apps/backend/src/modules/barter/application/commands/open-dispute.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { OpenDisputeCommand } from './open-dispute.command';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { IDisputeRepository } from '../../domain/repositories/dispute.repository.interface';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { DisputeResolutionStatus, DISPUTE_TIMINGS } from '../../domain/enums/dispute-resolution-status.enum';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(OpenDisputeCommand)
export class OpenDisputeHandler implements ICommandHandler<OpenDisputeCommand> {
  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    @Inject('IDisputeRepository') private readonly disputeRepository: IDisputeRepository,
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

    // Session'ı DISPUTED olarak güncelle
    await this.sessionRepository.save(session);

    // Karşı tarafı belirle
    const respondentId = props.initiatorId === command.vendorId ? props.receiverId : props.initiatorId;

    // Master Plan v4.3 §3.4 — Delil sunma penceresi: oluşumdan itibaren 24 saat
    const deadlineAt = new Date(Date.now() + DISPUTE_TIMINGS.RESPONSE_WINDOW_HOURS * 60 * 60 * 1000);

    await this.disputeRepository.create({
      swapSessionId:        command.sessionId,
      tradeOfferId:         props.tradeOfferId ?? '',
      openedById:           command.actorUserId,
      respondentId,
      reason:               command.reason,
      status:               DisputeResolutionStatus.OPEN,
      resolutionDeadlineAt: deadlineAt,
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
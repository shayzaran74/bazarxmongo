// apps/backend/src/modules/barter/application/commands/confirm-receipt.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfirmReceiptCommand } from './confirm-receipt.command';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { IBarterPartRepository } from '../../domain/repositories/barter-part.repository.interface';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(ConfirmReceiptCommand)
export class ConfirmReceiptHandler implements ICommandHandler<ConfirmReceiptCommand> {
  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    @Inject('IBarterPartRepository') private readonly partRepository: IBarterPartRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: ConfirmReceiptCommand): Promise<{ success: boolean }> {
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) throw new DomainException('Swap session bulunamadı.');

    const props = session.getProps();

    if (props.status !== SwapSessionStatus.SHIPPING && props.status !== SwapSessionStatus.PARTIALLY_COMPLETED) {
      throw new BadRequestException(`Teslimat onayı için session 'SHIPPING' veya 'PARTIALLY_COMPLETED' olmalı. Mevcut: ${props.status}`);
    }

    const isInitiator = props.initiatorId === command.vendorId;
    const isReceiver = props.receiverId === command.vendorId;
    if (!isInitiator && !isReceiver) {
      throw new ForbiddenException('Bu swap session\'a erişim yetkiniz yok.');
    }

    const myReceivedPart = await this.partRepository.findBySwapSessionAndRecipient(command.sessionId, command.vendorId);
    if (!myReceivedPart) throw new DomainException('Teslimat onayı yetkisi bulunamadı (BarterPart yok).');
    if (!['SHIPPED', 'DELIVERED'].includes(myReceivedPart.status)) {
      throw new BadRequestException('Onaylanacak kargolama henüz yapılmamış.');
    }
    if (myReceivedPart.status === 'CONFIRMED') {
      throw new BadRequestException('Teslimat zaten onaylandı.');
    }

    const disputeWindowEndsAt = new Date();
    disputeWindowEndsAt.setDate(disputeWindowEndsAt.getDate() + 3);

    const now = new Date();
    await this.partRepository.updateConfirmation(myReceivedPart.id, {
      status:             'CONFIRMED',
      deliveredAt:        now,
      confirmedAt:         now,
      disputeWindowEndsAt,
    });

    const allParts = await this.partRepository.findAllBySwapSession(command.sessionId);
    const allConfirmed = allParts.every(p => p.status === 'CONFIRMED');

    const newStatus = allConfirmed ? SwapSessionStatus.COMPLETED : SwapSessionStatus.PARTIALLY_COMPLETED;
    await this.sessionRepository.updateStatus(command.sessionId, newStatus);
    if (allConfirmed) {
      // completedAt güncellemesi için entity kullanılmalı — şimdilik sadece status
      await this.sessionRepository.save(session);
    }

    await this.auditLog.log({
      actorId:      command.actorUserId,
      action:       'SWAP_RECEIPT_CONFIRMED',
      resourceType: 'SwapSession',
      resourceId:   command.sessionId,
      newValue:     { vendorId: command.vendorId, partId: myReceivedPart.id },
    });

    return { success: true };
  }
}
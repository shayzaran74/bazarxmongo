// apps/backend/src/modules/barter/application/commands/confirm-receipt.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfirmReceiptCommand } from './confirm-receipt.command';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(ConfirmReceiptCommand)
export class ConfirmReceiptHandler implements ICommandHandler<ConfirmReceiptCommand> {
  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    private readonly prisma: PrismaService,
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

    // Alıcı olarak kendi BarterPart'ımı bul (recipientId === vendorId)
    const myReceivedPart = await this.prisma.barterPart.findFirst({
      where: { swapSessionId: command.sessionId, recipientId: command.vendorId },
    });
    if (!myReceivedPart) throw new DomainException('Teslimat onayı yetkisi bulunamadı (BarterPart yok).');
    if (!['SHIPPED', 'DELIVERED'].includes(myReceivedPart.status)) {
      throw new BadRequestException('Onaylanacak kargolama henüz yapılmamış.');
    }
    if (myReceivedPart.status === 'CONFIRMED') {
      throw new BadRequestException('Teslimat zaten onaylandı.');
    }

    // 3 günlük inceleme penceresi başlat
    const disputeWindowEndsAt = new Date();
    disputeWindowEndsAt.setDate(disputeWindowEndsAt.getDate() + 3);

    await this.prisma.$transaction(async (tx) => {
      await tx.barterPart.update({
        where: { id: myReceivedPart.id },
        data: {
          status:             'CONFIRMED',
          deliveredAt:        new Date(),
          confirmedAt:        new Date(),
          disputeWindowEndsAt,
        },
      });

      // Tüm partlar CONFIRMED ise session → COMPLETED, değilse → PARTIALLY_COMPLETED
      const allParts = await tx.barterPart.findMany({ where: { swapSessionId: command.sessionId } });
      const updatedStatuses = allParts.map(p => p.id === myReceivedPart.id ? 'CONFIRMED' : p.status);
      const allConfirmed = updatedStatuses.every(s => s === 'CONFIRMED');

      await tx.swapSession.update({
        where: { id: command.sessionId },
        data: {
          status:    allConfirmed ? SwapSessionStatus.COMPLETED : SwapSessionStatus.PARTIALLY_COMPLETED,
          completedAt: allConfirmed ? new Date() : undefined,
          updatedAt: new Date(),
        },
      });
    });

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

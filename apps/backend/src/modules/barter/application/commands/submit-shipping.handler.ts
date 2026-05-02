// apps/backend/src/modules/barter/application/commands/submit-shipping.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SubmitShippingCommand } from './submit-shipping.command';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(SubmitShippingCommand)
export class SubmitShippingHandler implements ICommandHandler<SubmitShippingCommand> {
  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: SubmitShippingCommand): Promise<{ success: boolean }> {
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) throw new DomainException('Swap session bulunamadı.');

    const props = session.getProps();

    // Sadece ACTIVE veya SHIPPING durumunda kargo bildirilebilir
    if (props.status !== SwapSessionStatus.ACTIVE && props.status !== SwapSessionStatus.SHIPPING) {
      throw new BadRequestException(`Kargo bildirimi için session 'ACTIVE' veya 'SHIPPING' olmalı. Mevcut: ${props.status}`);
    }

    // Kullanıcının bu session'ın parçası olduğunu doğrula
    const isInitiator = props.initiatorId === command.vendorId;
    const isReceiver = props.receiverId === command.vendorId;
    if (!isInitiator && !isReceiver) {
      throw new ForbiddenException('Bu swap session\'a erişim yetkiniz yok.');
    }

    // Vendor'un ilgili BarterPart'ını bul (senderId === vendorId)
    const myPart = await this.prisma.barterPart.findFirst({
      where: { swapSessionId: command.sessionId, senderId: command.vendorId },
    });
    if (!myPart) throw new DomainException('Kargolama yetkisi bulunamadı (BarterPart yok).');
    if (myPart.status !== 'PENDING') {
      throw new BadRequestException('Kargo bilgisi zaten girilmiş.');
    }

    // BarterPart güncelle ve session → SHIPPING durumuna geçir
    await this.prisma.$transaction(async (tx) => {
      await tx.barterPart.update({
        where: { id: myPart.id },
        data: {
          trackingCode: command.trackingCode,
          carrier:      command.carrier,
          status:       'SHIPPED',
          shippedAt:    new Date(),
        },
      });

      // İki taraftan en az biri gönderdiyse session → SHIPPING
      await tx.swapSession.update({
        where: { id: command.sessionId },
        data:  { status: SwapSessionStatus.SHIPPING, updatedAt: new Date() },
      });
    });

    await this.auditLog.log({
      actorId:      command.actorUserId,
      action:       'SWAP_PART_SHIPPED',
      resourceType: 'BarterPart',
      resourceId:   myPart.id,
      newValue:     { sessionId: command.sessionId, trackingCode: command.trackingCode, carrier: command.carrier },
    });

    return { success: true };
  }
}

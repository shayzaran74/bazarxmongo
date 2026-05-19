// apps/backend/src/modules/barter/application/commands/submit-shipping.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SubmitShippingCommand } from './submit-shipping.command';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { IBarterPartRepository } from '../../domain/repositories/barter-part.repository.interface';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(SubmitShippingCommand)
export class SubmitShippingHandler implements ICommandHandler<SubmitShippingCommand> {
  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    @Inject('IBarterPartRepository') private readonly partRepository: IBarterPartRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: SubmitShippingCommand): Promise<{ success: boolean }> {
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) throw new DomainException('Swap session bulunamadı.');

    const props = session.getProps();

    if (props.status !== SwapSessionStatus.ACTIVE && props.status !== SwapSessionStatus.SHIPPING) {
      throw new BadRequestException(`Kargo bildirimi için session 'ACTIVE' veya 'SHIPPING' olmalı. Mevcut: ${props.status}`);
    }

    const isInitiator = props.initiatorId === command.vendorId;
    const isReceiver = props.receiverId === command.vendorId;
    if (!isInitiator && !isReceiver) {
      throw new ForbiddenException('Bu swap session\'a erişim yetkiniz yok.');
    }

    const myPart = await this.partRepository.findBySwapSessionAndSender(command.sessionId, command.vendorId);
    if (!myPart) throw new DomainException('Kargolama yetkisi bulunamadı (BarterPart yok).');
    if (myPart.status !== 'PENDING') {
      throw new BadRequestException('Kargo bilgisi zaten girilmiş.');
    }

    const now = new Date();
    await this.partRepository.updateShipping(myPart.id, {
      trackingCode: command.trackingCode,
      carrier:      command.carrier,
      status:       'SHIPPED',
      shippedAt:    now,
    });

    await this.sessionRepository.updateStatus(command.sessionId, SwapSessionStatus.SHIPPING);

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
// apps/backend/src/modules/barter/application/commands/submit-shipping.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { SubmitShippingCommand } from './submit-shipping.command';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { IBarterPartRepository } from '../../domain/repositories/barter-part.repository.interface';
import { SwapSessionStatus } from '../../domain/enums/swap-session-status.enum';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(SubmitShippingCommand)
export class SubmitShippingHandler implements ICommandHandler<SubmitShippingCommand> {
  private readonly logger = new Logger(SubmitShippingHandler.name);

  constructor(
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    @Inject('IBarterPartRepository') private readonly partRepository: IBarterPartRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: SubmitShippingCommand): Promise<{ success: boolean }> {
    const trackingCode = command.trackingCode?.trim() ?? '';
    const carrier      = command.carrier?.trim() ?? '';

    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) throw new DomainException('Swap session bulunamadı.');

    const props = session.getProps();

    // DIGITAL mod: kargo kodu gerekmez, anında teslim
    if (props.shipmentMode === 'DIGITAL') {
      const myPart = await this.partRepository.findBySwapSessionAndSender(command.sessionId, command.vendorId);
      if (!myPart) throw new DomainException('Kargolama yetkisi bulunamadı (BarterPart yok).');
      if (myPart.status !== 'PENDING') {
        throw new BadRequestException('Kargo bilgisi zaten girilmiş.');
      }

      const now = new Date();
      await this.partRepository.updateShipping(myPart.id, {
        trackingCode:  `DIGITAL-${session.id}-${myPart.id}-${Date.now()}`,
        carrier:       'DIGITAL',
        status:        'SHIPPED',
        shippedAt:     now,
      });

      // Anında onayla
      await this.partRepository.updateConfirmation(myPart.id, {
        status:             'CONFIRMED',
        deliveredAt:        now,
        confirmedAt:         now,
        disputeWindowEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      this.logger.log(`Digital shipment for part ${myPart.id} auto-confirmed`, SubmitShippingHandler.name);
      return { success: true };
    }

    if (!carrier || carrier.length < 2 || carrier.length > 50) {
      throw new BadRequestException('Kargo firması 2-50 karakter arasında olmalıdır');
    }

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
      trackingCode,
      carrier,
      status:    'SHIPPED',
      shippedAt: now,
    });

    await this.sessionRepository.updateStatus(command.sessionId, SwapSessionStatus.SHIPPING);

    await this.auditLog.log({
      actorId:      command.actorUserId,
      action:       'SWAP_PART_SHIPPED',
      resourceType: 'BarterPart',
      resourceId:   myPart.id,
      newValue:     { sessionId: command.sessionId, trackingCode, carrier },
    });

    return { success: true };
  }
}
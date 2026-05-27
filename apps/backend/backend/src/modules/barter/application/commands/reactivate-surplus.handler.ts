// apps/backend/src/modules/barter/application/commands/reactivate-surplus.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReactivateSurplusCommand } from './reactivate-surplus.command';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { SurplusStatus } from '../../domain/enums/surplus-status.enum';

@CommandHandler(ReactivateSurplusCommand)
export class ReactivateSurplusHandler implements ICommandHandler<ReactivateSurplusCommand> {
  constructor(
    @Inject('ISurplusItemRepository') private readonly repository: ISurplusItemRepository,
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: ReactivateSurplusCommand): Promise<{ success: boolean }> {
    const surplus = await this.repository.findById(command.surplusId);
    if (!surplus) throw new NotFoundException('İlan bulunamadı');

    // Sahiplik kontrolü: ilanın şirketi kullanıcının firmasıyla eşleşmeli
    const vendor = await this.vendorRepository.findByUserId(command.userId);
    if (!vendor) throw new ForbiddenException('Satıcı bulunamadı');

    const props = surplus.getProps();
    if (!props.companyId || vendor.getProps().companyId !== props.companyId) {
      throw new ForbiddenException('Bu ilan üzerinde işlem yapma yetkiniz yok');
    }

    const prevStatus = props.status;

    // MongoDB'ye uygun güncelleme
    await this.repository.update(command.surplusId, {
      status: SurplusStatus.PENDING_APPROVAL,
      quantity: command.newQuantity,
    });

    await this.auditLog.log({
      actorId:      command.userId,
      action:       'SURPLUS_REACTIVATED',
      resourceType: 'SurplusItem',
      resourceId:   command.surplusId,
      oldValue:     { status: prevStatus },
      newValue:     { status: SurplusStatus.PENDING_APPROVAL, quantity: command.newQuantity },
    });

    return { success: true };
  }
}
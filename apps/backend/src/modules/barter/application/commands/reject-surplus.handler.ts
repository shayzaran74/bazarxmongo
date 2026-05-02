// apps/backend/src/modules/barter/application/commands/reject-surplus.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { RejectSurplusCommand } from './reject-surplus.command';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(RejectSurplusCommand)
export class RejectSurplusHandler implements ICommandHandler<RejectSurplusCommand> {
  constructor(
    @Inject('ISurplusItemRepository')
    private readonly repository: ISurplusItemRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: RejectSurplusCommand): Promise<{ success: boolean }> {
    const surplus = await this.repository.findById(command.surplusId);
    if (!surplus) throw new NotFoundException('İlan bulunamadı');

    const prevStatus = surplus.status;
    surplus.reject(command.adminId, command.rejectionReason);
    await this.repository.save(surplus);

    await this.auditLog.log({
      actorId:      command.adminId,
      action:       'SURPLUS_REJECTED',
      resourceType: 'SurplusItem',
      resourceId:   command.surplusId,
      oldValue:     { status: prevStatus },
      newValue:     { status: surplus.status, reason: command.rejectionReason },
    });

    return { success: true };
  }
}

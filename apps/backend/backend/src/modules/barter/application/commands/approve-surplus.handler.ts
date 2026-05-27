// apps/backend/src/modules/barter/application/commands/approve-surplus.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ApproveSurplusCommand } from './approve-surplus.command';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';

@CommandHandler(ApproveSurplusCommand)
export class ApproveSurplusHandler implements ICommandHandler<ApproveSurplusCommand> {
  constructor(
    @Inject('ISurplusItemRepository')
    private readonly repository: ISurplusItemRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: ApproveSurplusCommand): Promise<{ success: boolean }> {
    const surplus = await this.repository.findById(command.surplusId);
    if (!surplus) throw new NotFoundException('İlan bulunamadı');

    const prevStatus = surplus.status;
    surplus.approve(command.adminId);
    await this.repository.save(surplus);

    await this.auditLog.log({
      actorId:      command.adminId,
      action:       'SURPLUS_APPROVED',
      resourceType: 'SurplusItem',
      resourceId:   command.surplusId,
      oldValue:     { status: prevStatus },
      newValue:     { status: surplus.status },
    });

    return { success: true };
  }
}

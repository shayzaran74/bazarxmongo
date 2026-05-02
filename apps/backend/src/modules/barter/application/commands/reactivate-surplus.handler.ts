// apps/backend/src/modules/barter/application/commands/reactivate-surplus.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReactivateSurplusCommand } from './reactivate-surplus.command';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { PrismaService } from '@barterborsa/shared-persistence';

@CommandHandler(ReactivateSurplusCommand)
export class ReactivateSurplusHandler implements ICommandHandler<ReactivateSurplusCommand> {
  constructor(
    @Inject('ISurplusItemRepository')
    private readonly repository: ISurplusItemRepository,
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: ReactivateSurplusCommand): Promise<{ success: boolean }> {
    const surplus = await this.repository.findById(command.surplusId);
    if (!surplus) throw new NotFoundException('İlan bulunamadı');

    // Sahiplik kontrolü: ilanın şirketi kullanıcının firmasıyla eşleşmeli
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: command.userId },
      include: { company: { select: { id: true } } },
    });
    if (!vendor?.company || vendor.company.id !== surplus.companyId) {
      throw new ForbiddenException('Bu ilan üzerinde işlem yapma yetkiniz yok');
    }

    const prevStatus = surplus.status;
    surplus.reactivate(new Prisma.Decimal(command.newQuantity));
    await this.repository.save(surplus);

    await this.auditLog.log({
      actorId:      command.userId,
      action:       'SURPLUS_REACTIVATED',
      resourceType: 'SurplusItem',
      resourceId:   command.surplusId,
      oldValue:     { status: prevStatus },
      newValue:     { status: surplus.status, quantity: command.newQuantity },
    });

    return { success: true };
  }
}

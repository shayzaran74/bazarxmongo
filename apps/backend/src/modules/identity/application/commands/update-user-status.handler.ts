import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { UpdateUserStatusCommand } from './update-user-status.command';

const VALID_STATUSES = new Set(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION']);

@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler implements ICommandHandler<UpdateUserStatusCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: UpdateUserStatusCommand) {
    const { userId, status, adminId } = command;

    const normalizedStatus = status.toUpperCase();
    if (!VALID_STATUSES.has(normalizedStatus)) {
      throw new BadRequestException(
        `Geçersiz durum: "${status}". İzin verilen: ACTIVE, INACTIVE, SUSPENDED, BANNED`,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: normalizedStatus as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION' },
    });

    await this.auditLog.log({
      actorId:      adminId,
      action:       'USER_STATUS_CHANGED',
      resourceType: 'User',
      resourceId:   userId,
      oldValue:     { status: user.status },
      newValue:     { status: normalizedStatus },
    });

    return { success: true };
  }
}

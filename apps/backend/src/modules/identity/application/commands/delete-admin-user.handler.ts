import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DeleteAdminUserCommand } from './delete-admin-user.command';

@CommandHandler(DeleteAdminUserCommand)
export class DeleteAdminUserHandler implements ICommandHandler<DeleteAdminUserCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: DeleteAdminUserCommand) {
    const { userId, adminId } = command;

    // Admin kendisini silemez
    if (userId === adminId) {
      throw new ForbiddenException('Kendi hesabınızı silemezsiniz');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    // Soft delete — FK referansları (orders, vendor) korunur
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });

    await this.auditLog.log({
      actorId:      adminId,
      action:       'USER_DELETED',
      resourceType: 'User',
      resourceId:   userId,
      oldValue:     { email: user.email, role: user.role },
      newValue:     { deletedAt: new Date().toISOString() },
    });

    return { success: true };
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { UpdateUserRoleCommand } from './update-user-role.command';

// İzin verilen roller ve atama hiyerarşisi
const ASSIGNABLE_ROLES = new Set(['USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN']);
const ADMIN_ASSIGNABLE_ROLES = new Set(['USER', 'VENDOR', 'ADMIN']);
// SUPER_ADMIN yalnızca başka bir SUPER_ADMIN tarafından atanabilir

@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleHandler implements ICommandHandler<UpdateUserRoleCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: UpdateUserRoleCommand) {
    const { userId, role, adminId } = command;

    const normalizedRole = role.toUpperCase();
    if (!ASSIGNABLE_ROLES.has(normalizedRole)) {
      throw new BadRequestException(`Geçersiz rol: "${role}". İzin verilen: USER, VENDOR, ADMIN, SUPER_ADMIN`);
    }

    // Atayan admin bilgisi
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, role: true },
    });
    if (!admin) throw new NotFoundException('Admin bulunamadı');

    // SUPER_ADMIN rolü sadece SUPER_ADMIN tarafından atanabilir
    if (normalizedRole === 'SUPER_ADMIN' && admin.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('SUPER_ADMIN rolü yalnızca başka bir SUPER_ADMIN tarafından atanabilir');
    }

    // Admin kendi rolünü değiştiremez (kilitlenme riski)
    if (userId === adminId) {
      throw new ForbiddenException('Kendi rolünüzü değiştiremezsiniz');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: normalizedRole as 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN' },
    });

    await this.auditLog.log({
      actorId:      adminId,
      action:       'USER_ROLE_CHANGED',
      resourceType: 'User',
      resourceId:   userId,
      oldValue:     { role: user.role },
      newValue:     { role: normalizedRole },
    });

    return { success: true };
  }
}

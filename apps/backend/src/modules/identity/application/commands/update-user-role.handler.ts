// apps/backend/src/modules/identity/application/commands/update-user-role.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { UpdateUserRoleCommand } from './update-user-role.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';

const ASSIGNABLE_ROLES = new Set(['USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN']);

@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleHandler implements ICommandHandler<UpdateUserRoleCommand> {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: UpdateUserRoleCommand) {
    const { userId, role, adminId } = command;

    const normalizedRole = role.toUpperCase();
    if (!ASSIGNABLE_ROLES.has(normalizedRole)) {
      throw new BadRequestException(`Geçersiz rol: "${role}". İzin verilen: USER, VENDOR, ADMIN, SUPER_ADMIN`);
    }

    const admin = await this.userRepo.findById(adminId);
    if (!admin) throw new NotFoundException('Admin bulunamadı');

    if (normalizedRole === 'SUPER_ADMIN' && (admin as any).role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('SUPER_ADMIN rolü yalnızca başka bir SUPER_ADMIN tarafından atanabilir');
    }

    if (userId === adminId) {
      throw new ForbiddenException('Kendi rolünüzü değiştiremezsiniz');
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    await this.userRepo.updateRole(userId, normalizedRole);

    await this.auditLog.log({
      actorId:      adminId,
      action:       'USER_ROLE_CHANGED',
      resourceType: 'User',
      resourceId:   userId,
      oldValue:     { role: (user as any).role },
      newValue:     { role: normalizedRole },
    });

    return { success: true };
  }
}
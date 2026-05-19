// apps/backend/src/modules/identity/application/commands/delete-admin-user.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DeleteAdminUserCommand } from './delete-admin-user.command';

@CommandHandler(DeleteAdminUserCommand)
export class DeleteAdminUserHandler implements ICommandHandler<DeleteAdminUserCommand> {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: DeleteAdminUserCommand) {
    const { userId, adminId } = command;

    if (userId === adminId) throw new ForbiddenException('Kendi hesabınızı silemezsiniz');

    const user = await this.userModel.findById(userId, { _id: 1, email: 1, role: 1 }).lean();
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    // Soft delete — FK referansları (orders, vendor) korunur
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { deletedAt: new Date(), status: 'INACTIVE' } },
    );

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

// apps/backend/src/modules/identity/application/commands/update-user-status.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser, UserStatusType } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { UpdateUserStatusCommand } from './update-user-status.command';

const VALID_STATUSES = new Set<string>(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION']);

@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler implements ICommandHandler<UpdateUserStatusCommand> {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: UpdateUserStatusCommand) {
    const { userId, status, adminId } = command;

    const normalized = status.toUpperCase();
    if (!VALID_STATUSES.has(normalized)) {
      throw new BadRequestException(`Geçersiz durum: "${status}". İzin verilen: ACTIVE, INACTIVE, SUSPENDED, BANNED`);
    }

    const user = await this.userModel.findById(userId, { status: 1 }).lean();
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    await this.userModel.updateOne(
      { _id: userId },
      { $set: { status: normalized as UserStatusType } },
    );

    await this.auditLog.log({
      actorId:      adminId,
      action:       'USER_STATUS_CHANGED',
      resourceType: 'User',
      resourceId:   userId,
      oldValue:     { status: user.status },
      newValue:     { status: normalized },
    });

    return { success: true };
  }
}

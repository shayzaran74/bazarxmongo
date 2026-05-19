// apps/backend/src/modules/vendor/application/commands/remove-ecosystem-member.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { RemoveEcosystemMemberCommand } from './remove-ecosystem-member.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';
import { MongoEcosystemAuditLogRepository } from '../../infrastructure/persistence/mongo-ecosystem-audit-log.repository';

@CommandHandler(RemoveEcosystemMemberCommand)
export class RemoveEcosystemMemberHandler
  implements ICommandHandler<RemoveEcosystemMemberCommand> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly auditLogRepo: MongoEcosystemAuditLogRepository,
  ) {}

  async execute(command: RemoveEcosystemMemberCommand) {
    const { userId, memberVendorId } = command;

    const callerVendor = await this.vendorRepo.findByUserId(userId);
    const memberVendor = await this.vendorRepo.findById(memberVendorId);

    if (!memberVendor) throw new NotFoundException('Üye bayi bulunamadı');
    if (!memberVendor.ecosystemId) {
      throw new BadRequestException('Bu bayi herhangi bir ekosisteme üye değil');
    }

    if (callerVendor && callerVendor.ecosystemId !== memberVendor.ecosystemId) {
      throw new ForbiddenException('Bu ekosistemden üye çıkarma yetkiniz yok');
    }

    const ecosystemId = memberVendor.ecosystemId;

    await this.vendorRepo.update(memberVendorId, { ecosystemId: undefined });

    await this.auditLogRepo.create({
      ecosystemId,
      vendorId: memberVendorId,
      action: 'MEMBER_REMOVED',
      severity: 'HIGH',
      details: { removedBy: userId },
    });

    return { success: true };
  }
}

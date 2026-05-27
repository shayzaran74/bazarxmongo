// apps/backend/src/modules/vendor/application/commands/remove-ecosystem-member.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { RemoveEcosystemMemberCommand } from './remove-ecosystem-member.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoBrandEcosystemRepository } from '../../infrastructure/persistence/mongo-brand-ecosystem.repository';
import { MongoEcosystemAuditLogRepository } from '../../infrastructure/persistence/mongo-ecosystem-audit-log.repository';

@CommandHandler(RemoveEcosystemMemberCommand)
export class RemoveEcosystemMemberHandler
  implements ICommandHandler<RemoveEcosystemMemberCommand> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly ecosystemRepo: MongoBrandEcosystemRepository,
    private readonly auditLogRepo: MongoEcosystemAuditLogRepository,
  ) {}

  async execute(command: RemoveEcosystemMemberCommand) {
    const { userId, memberVendorId } = command;

    const callerVendor = await this.vendorRepo.findByUserId(userId);
    if (!callerVendor) throw new ForbiddenException('Satıcı profiliniz bulunamadı.');

    const memberVendor = await this.vendorRepo.findById(memberVendorId);
    if (!memberVendor) throw new NotFoundException('Üye bayi bulunamadı');
    if (!memberVendor.ecosystemId) {
      throw new BadRequestException('Bu bayi herhangi bir ekosisteme üye değil');
    }

    // Yalnızca ekosistem sahibi üye çıkarabilir
    const ecosystem = await this.ecosystemRepo.findByOwnerId(callerVendor.id);
    if (!ecosystem || ecosystem.id !== memberVendor.ecosystemId) {
      throw new ForbiddenException('Bu ekosistemden üye çıkarma yetkiniz yok. Sadece ekosistem kurucusu üye çıkarabilir.');
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

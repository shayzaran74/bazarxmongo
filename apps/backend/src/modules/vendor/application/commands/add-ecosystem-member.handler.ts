import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { AddEcosystemMemberCommand } from './add-ecosystem-member.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';
import { MongoEcosystemAuditLogRepository } from '../../infrastructure/persistence/mongo-ecosystem-audit-log.repository';

@CommandHandler(AddEcosystemMemberCommand)
export class AddEcosystemMemberHandler
  implements ICommandHandler<AddEcosystemMemberCommand> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly auditLogRepo: MongoEcosystemAuditLogRepository,
  ) {}

  async execute(command: AddEcosystemMemberCommand) {
    const { userId, memberVendorId } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor?.ecosystemId) {
      throw new NotFoundException('No ecosystem owned by this vendor');
    }

    const memberVendor = await this.vendorRepo.findById(memberVendorId);
    if (!memberVendor) {
      throw new NotFoundException('Eklenmek istenen bayi bulunamadı');
    }

    if (memberVendor.status !== 'APPROVED') {
      throw new BadRequestException('Sadece onaylanmış (APPROVED) bayiler ekosisteme eklenebilir');
    }

    if (memberVendor.ecosystemId) {
      throw new BadRequestException('Bu bayi zaten bir ekosisteme üye');
    }

    await this.vendorRepo.update(memberVendorId, { ecosystemId: vendor.ecosystemId });

    await this.auditLogRepo.create({
      ecosystemId: vendor.ecosystemId,
      vendorId: memberVendorId,
      action: 'MEMBER_ADDED',
      severity: 'HIGH',
      details: { addedBy: userId },
    });

    return { success: true };
  }
}

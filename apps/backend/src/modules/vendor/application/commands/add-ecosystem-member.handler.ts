import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { AddEcosystemMemberCommand } from './add-ecosystem-member.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoBrandEcosystemRepository } from '../../infrastructure/persistence/mongo-brand-ecosystem.repository';
import { MongoEcosystemAuditLogRepository } from '../../infrastructure/persistence/mongo-ecosystem-audit-log.repository';

@CommandHandler(AddEcosystemMemberCommand)
export class AddEcosystemMemberHandler
  implements ICommandHandler<AddEcosystemMemberCommand> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly ecosystemRepo: MongoBrandEcosystemRepository,
    private readonly auditLogRepo: MongoEcosystemAuditLogRepository,
  ) {}

  async execute(command: AddEcosystemMemberCommand) {
    const { userId, memberVendorId } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Satıcı profiliniz bulunamadı.');

    // Sadece ekosistemin sahibi (ownerId) üye ekleyebilir
    const ecosystem = await this.ecosystemRepo.findByOwnerId(vendor.id);
    if (!ecosystem) {
      throw new ForbiddenException('Bu kullanıcıya ait bir ekosistem bulunamadı. Sadece ekosistem kurucusu üye ekleyebilir.');
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

    await this.vendorRepo.update(memberVendorId, { ecosystemId: ecosystem.id });

    await this.auditLogRepo.create({
      ecosystemId: ecosystem.id,
      vendorId: memberVendorId,
      action: 'MEMBER_ADDED',
      severity: 'HIGH',
      details: { addedBy: userId },
    });

    return { success: true };
  }
}

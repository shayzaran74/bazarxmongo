// apps/backend/src/modules/vendor/application/commands/update-ecosystem-settings.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { UpdateEcosystemSettingsCommand } from './update-ecosystem-settings.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoBrandEcosystemRepository } from '../../infrastructure/persistence/mongo-brand-ecosystem.repository';
import { MongoEcosystemAuditLogRepository } from '../../infrastructure/persistence/mongo-ecosystem-audit-log.repository';

@CommandHandler(UpdateEcosystemSettingsCommand)
export class UpdateEcosystemSettingsHandler
  implements ICommandHandler<UpdateEcosystemSettingsCommand> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly ecosystemRepo: MongoBrandEcosystemRepository,
    private readonly auditLogRepo: MongoEcosystemAuditLogRepository,
  ) {}

  async execute(command: UpdateEcosystemSettingsCommand) {
    const { userId, settings } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Satıcı profiliniz bulunamadı.');

    // Yalnızca ekosistemin sahibi (ownerId) ayarları güncelleyebilir
    const ecosystem = await this.ecosystemRepo.findByOwnerId(vendor.id);
    if (!ecosystem) {
      throw new ForbiddenException('Ekosistem ayarlarını yalnızca sahibi güncelleyebilir. Bu hesaba ait bir ekosistem bulunamadı.');
    }

    const updateData: Record<string, unknown> = {};
    if (settings.isBlindPool !== undefined) updateData.isBlindPool = settings.isBlindPool;
    if (settings.internalCommRate !== undefined) updateData.internalCommRate = settings.internalCommRate;

    const updated = await this.ecosystemRepo.update(ecosystem.id, updateData as { isBlindPool?: boolean; internalCommRate?: number });

    await this.auditLogRepo.create({
      ecosystemId: ecosystem.id,
      vendorId: vendor.id,
      action: 'SETTINGS_UPDATED',
      severity: 'HIGH',
      details: {
        updatedBy: userId,
        newValues: updateData,
      },
    });

    return { success: true, data: updated };
  }
}

// apps/backend/src/modules/vendor/application/commands/create-ecosystem.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException, Inject } from '@nestjs/common';
import { CreateEcosystemCommand } from './create-ecosystem.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';
import { MongoBrandEcosystemRepository } from '../../infrastructure/persistence/mongo-brand-ecosystem.repository';
import { MongoEcosystemAuditLogRepository } from '../../infrastructure/persistence/mongo-ecosystem-audit-log.repository';

@CommandHandler(CreateEcosystemCommand)
export class CreateEcosystemHandler
  implements ICommandHandler<CreateEcosystemCommand> {
  private readonly logger = new Logger(CreateEcosystemHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly ecosystemRepo: MongoBrandEcosystemRepository,
    private readonly auditLogRepo: MongoEcosystemAuditLogRepository,
  ) {}

  async execute(command: CreateEcosystemCommand) {
    const { userId, body } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor bulunamadı');

    const existing = await this.ecosystemRepo.findByOwnerId(vendor.id);
    if (existing) {
      throw new BadRequestException('Her satıcı yalnızca bir ekosistem kurabilir');
    }

    const slug =
      body.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 8);

    const ecosystem = await this.ecosystemRepo.create({
      name: body.name,
      slug,
      description: body.description,
      ownerId: vendor.id,
    });

    await this.auditLogRepo.create({
      ecosystemId: ecosystem.id,
      vendorId: vendor.id,
      action: 'ECOSYSTEM_CREATED',
      severity: 'INFO',
      details: { createdBy: userId, name: body.name, slug },
    });

    this.logger.log('Ekosistem oluşturuldu', { ecosystemId: ecosystem.id, name: ecosystem.name });

    return ecosystem;
  }
}

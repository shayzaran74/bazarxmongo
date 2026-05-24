// apps/backend/src/modules/vendor/application/commands/create-ecosystem.handler.ts

import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, Logger, NotFoundException, Inject } from '@nestjs/common';
import { CreateEcosystemCommand } from './create-ecosystem.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoBrandEcosystemRepository } from '../../infrastructure/persistence/mongo-brand-ecosystem.repository';
import { MongoEcosystemAuditLogRepository } from '../../infrastructure/persistence/mongo-ecosystem-audit-log.repository';
import { VendorTier } from '../../domain/enums/vendor-tier.enum';
import { BrandEcosystem } from '../../domain/entities/brand-ecosystem.entity';

@CommandHandler(CreateEcosystemCommand)
export class CreateEcosystemHandler
  implements ICommandHandler<CreateEcosystemCommand> {
  private readonly logger = new Logger(CreateEcosystemHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly ecosystemRepo: MongoBrandEcosystemRepository,
    private readonly auditLogRepo: MongoEcosystemAuditLogRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateEcosystemCommand) {
    const { userId, body } = command;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor bulunamadı');

    // Master Plan v4.3 §4.1 — Fabrika sisteme APEX seviyesinde girmek ZORUNDADIR.
    // APEX altında ekosistem kurulamaz.
    if (vendor.tier !== VendorTier.APEX) {
      throw new ForbiddenException({
        code: 'ECOSYSTEM_REQUIRES_APEX',
        message: 'Ekosistem kurabilmek için APEX B2B üyeliği gereklidir. Mevcut seviye: ' + vendor.tier,
      });
    }

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

    const ecosystem = BrandEcosystem.create({
      name: body.name,
      slug,
      description: body.description,
      ownerId: vendor.id,
    });

    await this.ecosystemRepo.save(ecosystem);
    await this.eventBus.publishAll(ecosystem.domainEvents);

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

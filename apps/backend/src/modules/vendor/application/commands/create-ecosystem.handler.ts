// apps/backend/src/modules/vendor/application/commands/create-ecosystem.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateEcosystemCommand } from './create-ecosystem.command';

@CommandHandler(CreateEcosystemCommand)
export class CreateEcosystemHandler
  implements ICommandHandler<CreateEcosystemCommand> {
  private readonly logger = new Logger(CreateEcosystemHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateEcosystemCommand) {
    const { userId, body } = command;

    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: { brandEcosystem: { select: { id: true } } },
    });
    if (!vendor) throw new NotFoundException('Vendor bulunamadı');

    // Vendor zaten bir ekosistemin sahibiyse engel
    if (vendor.brandEcosystem) {
      throw new BadRequestException('Her satıcı yalnızca bir ekosistem kurabilir');
    }

    const slug =
      body.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 8);

    const ecosystem = await this.prisma.$transaction(async (tx) => {
      const created = await tx.brandEcosystem.create({
        data: {
          name: body.name,
          slug,
          description: body.description,
          ownerId: vendor.id,
        },
      });

      await tx.ecosystemAuditLog.create({
        data: {
          action: 'ECOSYSTEM_CREATED',
          severity: 'INFO',
          ecosystemId: created.id,
          vendorId: vendor.id,
          details: { createdBy: userId, name: body.name, slug },
        },
      });

      return created;
    });

    this.logger.log('Ekosistem oluşturuldu', { ecosystemId: ecosystem.id, name: ecosystem.name });

    return ecosystem;
  }
}

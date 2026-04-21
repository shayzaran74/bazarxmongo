import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
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
      where: { userId }
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const slug = body.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      + '-' + Math.random().toString(36).substring(7);

    const ecosystem = await this.prisma.brandEcosystem.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        ownerId: vendor.id
      }
    });

    return ecosystem;
  }
}

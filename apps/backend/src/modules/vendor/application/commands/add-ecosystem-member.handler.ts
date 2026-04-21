import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AddEcosystemMemberCommand } from './add-ecosystem-member.command';

@CommandHandler(AddEcosystemMemberCommand)
export class AddEcosystemMemberHandler
  implements ICommandHandler<AddEcosystemMemberCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AddEcosystemMemberCommand) {
    const { userId, memberVendorId } = command;

    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: { brandEcosystem: true }
    });

    if (!vendor?.brandEcosystem) {
      throw new NotFoundException('No ecosystem owned by this vendor');
    }

    await this.prisma.vendor.update({
      where: { id: memberVendorId },
      data: { ecosystemId: vendor.brandEcosystem.id }
    });

    return { success: true };
  }
}

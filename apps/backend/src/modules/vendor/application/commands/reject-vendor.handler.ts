import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { RejectVendorCommand } from './reject-vendor.command';

@CommandHandler(RejectVendorCommand)
export class RejectVendorHandler
  implements ICommandHandler<RejectVendorCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RejectVendorCommand) {
    const { vendorId, rejectionReason } = command;

    const existing = await this.prisma.vendor.findUnique({
      where: { id: vendorId }
    });
    if (!existing) throw new NotFoundException('Vendor not found');

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: { status: 'REJECTED', rejectionReason }
    });
  }
}

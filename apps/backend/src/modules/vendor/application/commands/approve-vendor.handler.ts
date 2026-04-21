import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ApproveVendorCommand } from './approve-vendor.command';

@CommandHandler(ApproveVendorCommand)
export class ApproveVendorHandler
  implements ICommandHandler<ApproveVendorCommand> {
  private readonly logger = new Logger(ApproveVendorHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ApproveVendorCommand) {
    const { vendorId } = command;

    const existing = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { userId: true }
    });
    if (!existing) throw new NotFoundException('Vendor not found');

    const vendor = await this.prisma.vendor.update({
      where: { id: vendorId },
      data: {
        status: 'APPROVED',
        verifiedAt: new Date(),
        isVerified: true
      }
    });

    // User rolünü VENDOR yap
    if (existing.userId) {
      await this.prisma.user.update({
        where: { id: existing.userId },
        data: { role: 'VENDOR' }
      });
      this.logger.log(`User ${existing.userId} role updated to VENDOR`);
    }

    return vendor;
  }
}

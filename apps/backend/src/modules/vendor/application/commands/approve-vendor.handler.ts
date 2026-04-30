import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { ApproveVendorCommand } from './approve-vendor.command';

@CommandHandler(ApproveVendorCommand)
export class ApproveVendorHandler implements ICommandHandler<ApproveVendorCommand> {
  private readonly logger = new Logger(ApproveVendorHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: ApproveVendorCommand) {
    const { vendorId, adminId } = command;

    const existing = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, status: true, userId: true },
    });
    if (!existing) throw new NotFoundException('Satıcı bulunamadı');

    // State machine: yalnızca PENDING vendor onaylanabilir
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        `Bu satıcı zaten "${existing.status}" durumunda, onaylanamaz`,
      );
    }

    const vendor = await this.prisma.vendor.update({
      where: { id: vendorId },
      data: { status: 'APPROVED', verifiedAt: new Date(), isVerified: true },
    });

    // Kullanıcı rolünü VENDOR yap
    if (existing.userId) {
      await this.prisma.user.update({
        where: { id: existing.userId },
        data: { role: 'VENDOR' },
      });
      this.logger.log(`Kullanıcı rolü VENDOR yapıldı`, { userId: existing.userId });
    }

    await this.auditLog.log({
      actorId:      adminId,
      action:       'VENDOR_APPROVED',
      resourceType: 'Vendor',
      resourceId:   vendorId,
      oldValue:     { status: 'PENDING' },
      newValue:     { status: 'APPROVED' },
    });

    return vendor;
  }
}

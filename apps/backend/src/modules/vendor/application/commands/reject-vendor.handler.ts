import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { RejectVendorCommand } from './reject-vendor.command';

@CommandHandler(RejectVendorCommand)
export class RejectVendorHandler implements ICommandHandler<RejectVendorCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: RejectVendorCommand) {
    const { vendorId, rejectionReason, adminId } = command;

    const existing = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, status: true },
    });
    if (!existing) throw new NotFoundException('Satıcı bulunamadı');

    // State machine: yalnızca PENDING vendor reddedilebilir
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        `Bu satıcı zaten "${existing.status}" durumunda, reddedilemez`,
      );
    }

    const vendor = await this.prisma.vendor.update({
      where: { id: vendorId },
      data: { status: 'REJECTED', rejectionReason },
    });

    await this.auditLog.log({
      actorId:      adminId,
      action:       'VENDOR_REJECTED',
      resourceType: 'Vendor',
      resourceId:   vendorId,
      oldValue:     { status: 'PENDING' },
      newValue:     { status: 'REJECTED', rejectionReason },
    });

    return vendor;
  }
}

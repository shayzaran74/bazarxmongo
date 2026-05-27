import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { RejectVendorCommand } from './reject-vendor.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';

@CommandHandler(RejectVendorCommand)
export class RejectVendorHandler implements ICommandHandler<RejectVendorCommand> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: RejectVendorCommand) {
    const { vendorId, rejectionReason, adminId } = command;

    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) throw new NotFoundException('Satıcı bulunamadı');

    if (vendor.status !== 'PENDING') {
      throw new BadRequestException(
        `Bu satıcı zaten "${vendor.status}" durumunda, reddedilemez`,
      );
    }

    await this.vendorRepo.update(vendorId, { status: 'REJECTED', rejectionReason });

    await this.auditLog.log({
      actorId:      adminId,
      action:       'VENDOR_REJECTED',
      resourceType: 'Vendor',
      resourceId:   vendorId,
      oldValue:     { status: 'PENDING' },
      newValue:     { status: 'REJECTED', rejectionReason },
    });

    return { id: vendorId, status: 'REJECTED' };
  }
}

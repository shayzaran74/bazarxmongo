import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException, Inject, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { SuspendVendorCommand } from './suspend-vendor.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { VendorSuspendedEvent } from '../../domain/events/vendor-suspended.event';

@CommandHandler(SuspendVendorCommand)
export class SuspendVendorHandler implements ICommandHandler<SuspendVendorCommand> {
  private readonly logger = new Logger(SuspendVendorHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly auditLog: AuditLogService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SuspendVendorCommand) {
    const { vendorId, reason, adminId } = command;

    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) throw new NotFoundException('Satıcı bulunamadı');

    if (vendor.status !== 'APPROVED') {
      throw new BadRequestException(
        `Bu satıcı "${vendor.status}" durumunda. Sadece onaylanmış ("APPROVED") satıcılar askıya alınabilir.`,
      );
    }

    // Domain entity suspend() — domain event tetikler
    vendor.suspend(reason);
    await this.vendorRepo.save(vendor);

    // Event publish et
    this.eventBus.publish(new VendorSuspendedEvent(vendorId, reason));

    await this.auditLog.log({
      actorId:      adminId,
      action:       'VENDOR_SUSPENDED',
      resourceType: 'Vendor',
      resourceId:   vendorId,
      oldValue:     { status: 'APPROVED' },
      newValue:     { status: 'SUSPENDED', suspensionReason: reason },
    });

    return { id: vendorId, status: 'SUSPENDED' };
  }
}

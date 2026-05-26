import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException, Inject, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { ReinstateVendorCommand } from './reinstate-vendor.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { VendorReinstatedEvent } from '../../domain/events/vendor-reinstated.event';

@CommandHandler(ReinstateVendorCommand)
export class ReinstateVendorHandler implements ICommandHandler<ReinstateVendorCommand> {
  private readonly logger = new Logger(ReinstateVendorHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly auditLog: AuditLogService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReinstateVendorCommand) {
    const { vendorId, adminId } = command;

    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) throw new NotFoundException('Satıcı bulunamadı');

    if (vendor.status !== 'SUSPENDED') {
      throw new BadRequestException(
        `Bu satıcı "${vendor.status}" durumunda. Sadece askıya alınmış ("SUSPENDED") satıcılar yeniden aktif edilebilir.`,
      );
    }

    // Domain entity reinstate() — domain event tetikler
    vendor.reinstate();
    await this.vendorRepo.save(vendor);

    // Event publish et
    this.eventBus.publish(new VendorReinstatedEvent(vendorId));

    await this.auditLog.log({
      actorId:      adminId,
      action:       'VENDOR_REINSTATED',
      resourceType: 'Vendor',
      resourceId:   vendorId,
      oldValue:     { status: 'SUSPENDED' },
      newValue:     { status: 'APPROVED' },
    });

    return { id: vendorId, status: 'APPROVED' };
  }
}

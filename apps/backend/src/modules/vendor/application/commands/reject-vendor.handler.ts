// apps/backend/src/modules/vendor/application/commands/reject-vendor.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException, Inject, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { RejectVendorCommand } from './reject-vendor.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoCompanyRepository } from '../../infrastructure/persistence/mongo-company.repository';
import { VendorRejectedEvent } from '../../domain/events/vendor-rejected.event';

@CommandHandler(RejectVendorCommand)
export class RejectVendorHandler implements ICommandHandler<RejectVendorCommand> {
  private readonly logger = new Logger(RejectVendorHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly companyRepo: MongoCompanyRepository,
    private readonly auditLog: AuditLogService,
    private readonly eventBus: EventBus,
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

    // Domain entity reject() — domain event tetikler
    vendor.reject(rejectionReason);
    await this.vendorRepo.save(vendor);

    // Bağlı şirket kaydını da reddet
    if (vendor.companyId) {
      await this.companyRepo.update(vendor.companyId, { status: 'REJECTED' });
    }

    // Event publish et
    this.eventBus.publish(new VendorRejectedEvent(vendorId, rejectionReason));

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

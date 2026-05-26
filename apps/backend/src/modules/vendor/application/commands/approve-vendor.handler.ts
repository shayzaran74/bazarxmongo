import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException, Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { ApproveVendorCommand } from './approve-vendor.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';
import { MongoCompanyRepository } from '../../infrastructure/persistence/mongo-company.repository';
import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user.repository';
import { VendorApprovedEvent } from '../../domain/events/vendor-approved.event';

@CommandHandler(ApproveVendorCommand)
export class ApproveVendorHandler implements ICommandHandler<ApproveVendorCommand> {
  private readonly logger = new Logger(ApproveVendorHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly companyRepo: MongoCompanyRepository,
    private readonly userRepo: MongoUserRepository,
    private readonly auditLog: AuditLogService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ApproveVendorCommand) {
    const { vendorId, adminId } = command;

    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) throw new NotFoundException('Satıcı bulunamadı');

    if (vendor.getProps().status !== 'PENDING') {
      throw new BadRequestException(
        `Bu satıcı zaten "${vendor.getProps().status}" durumunda, onaylanamaz`,
      );
    }

    // Domain entity approve() — domain event tetikler
    vendor.approve();
    await this.vendorRepo.save(vendor);

    // Company güncelle (domain bypass — company ayrı aggregate)
    if (vendor.getProps().companyId) {
      await this.companyRepo.update(vendor.getProps().companyId, {
        status: 'VERIFIED',
        verifiedAt: new Date(),
      });
    } else {
      const newCompany = await this.companyRepo.create({
        name: vendor.getProps().slug?.value ?? 'Satıcı Şirketi',
        taxNumber: 'AUTO-' + vendorId.substring(0, 8),
        status: 'VERIFIED',
        verifiedAt: new Date(),
      });
      await this.vendorRepo.update(vendorId, { companyId: newCompany.id });
    }

    // Event publish et — User.role güncellemesi identity modülüne bırakılır
    this.eventBus.publish(new VendorApprovedEvent(vendorId, vendor.getProps().userId, vendor.getProps().companyId));

    await this.auditLog.log({
      actorId:      adminId,
      action:       'VENDOR_APPROVED',
      resourceType: 'Vendor',
      resourceId:   vendorId,
      oldValue:     { status: 'PENDING' },
      newValue:     { status: 'APPROVED' },
    });

    return { id: vendorId, status: 'APPROVED' };
  }
}

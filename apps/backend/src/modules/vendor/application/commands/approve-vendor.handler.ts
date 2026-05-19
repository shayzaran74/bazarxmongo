import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException, Inject } from '@nestjs/common';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { ApproveVendorCommand } from './approve-vendor.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';
import { MongoCompanyRepository } from '../../infrastructure/persistence/mongo-company.repository';
import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user.repository';

@CommandHandler(ApproveVendorCommand)
export class ApproveVendorHandler implements ICommandHandler<ApproveVendorCommand> {
  private readonly logger = new Logger(ApproveVendorHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly companyRepo: MongoCompanyRepository,
    private readonly userRepo: MongoUserRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: ApproveVendorCommand) {
    const { vendorId, adminId } = command;

    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) throw new NotFoundException('Satıcı bulunamadı');

    if (vendor.status !== 'PENDING') {
      throw new BadRequestException(
        `Bu satıcı zaten "${vendor.status}" durumunda, onaylanamaz`,
      );
    }

    await this.vendorRepo.update(vendorId, {
      status: 'APPROVED',
      verifiedAt: new Date(),
      isVerified: true,
      barterEnabled: true,
    });

    if (vendor.companyId) {
      await this.companyRepo.update(vendor.companyId, {
        status: 'APPROVED',
        verifiedAt: new Date(),
      });
    } else {
      const newCompany = await this.companyRepo.create({
        name: vendor.slug?.value ?? 'Satıcı Şirketi',
        taxNumber: 'AUTO-' + vendorId.substring(0, 8),
        status: 'APPROVED',
        verifiedAt: new Date(),
      });
      await this.vendorRepo.update(vendorId, { companyId: newCompany.id });
    }

    if (vendor.userId) {
      await this.userRepo.update(vendor.userId, { role: 'VENDOR' });
      this.logger.log(`Kullanıcı rolü VENDOR yapıldı`, { userId: vendor.userId });
    }

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

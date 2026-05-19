// apps/backend/src/modules/vendor/application/commands/update-company-status.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException, Inject } from '@nestjs/common';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { UpdateCompanyStatusCommand } from './update-company-status.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoCompanyRepository } from '../../infrastructure/persistence/mongo-company.repository';
import { MongoVendorRepository } from '../../infrastructure/persistence/mongo-vendor.repository';
import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user.repository';

@CommandHandler(UpdateCompanyStatusCommand)
export class UpdateCompanyStatusHandler implements ICommandHandler<UpdateCompanyStatusCommand> {
  private readonly logger = new Logger(UpdateCompanyStatusHandler.name);

  constructor(
    private readonly companyRepo: MongoCompanyRepository,
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly userRepo: MongoUserRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: UpdateCompanyStatusCommand) {
    const { companyId, status, adminId, rejectionReason } = command;

    const normalizedStatus = status === 'rejected' ? 'REJECTED' : 'APPROVED';

    const company = await this.companyRepo.findById(companyId);
    if (!company) throw new NotFoundException('Şirket bulunamadı');

    if (company.status !== 'PENDING') {
      throw new BadRequestException(
        `Bu şirket zaten "${company.status}" durumunda, işlem yapılamaz`,
      );
    }

    await this.companyRepo.update(companyId, {
      status: normalizedStatus,
      verifiedAt: normalizedStatus === 'APPROVED' ? new Date() : undefined,
    });

    if (company.vendorId) {
      const vendorData: Record<string, unknown> = { status: normalizedStatus };
      if (normalizedStatus === 'APPROVED') {
        vendorData.barterEnabled = true;
        vendorData.isVerified = true;
        vendorData.verifiedAt = new Date();
      }

      await this.vendorRepo.update(company.vendorId, vendorData as { status: string; barterEnabled?: boolean; isVerified?: boolean; verifiedAt?: Date });

      if (normalizedStatus === 'APPROVED') {
        const vendor = await this.vendorRepo.findById(company.vendorId);
        if (vendor?.userId) {
          await this.userRepo.update(vendor.userId, { role: 'VENDOR' });
          this.logger.log(`Kullanıcı rolü VENDOR yapıldı`, { userId: vendor.userId });
        }
      }
    }

    await this.auditLog.log({
      actorId: adminId,
      action: 'COMPANY_STATUS_UPDATED',
      resourceType: 'Company',
      resourceId: companyId,
      oldValue: { status: 'PENDING' },
      newValue: { status: normalizedStatus, rejectionReason },
    });

    return { id: companyId, status: normalizedStatus };
  }
}

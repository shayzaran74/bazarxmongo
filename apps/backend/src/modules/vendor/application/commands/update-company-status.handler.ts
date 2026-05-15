// apps/backend/src/modules/vendor/application/commands/update-company-status.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { UpdateCompanyStatusCommand } from './update-company-status.command';

@CommandHandler(UpdateCompanyStatusCommand)
export class UpdateCompanyStatusHandler implements ICommandHandler<UpdateCompanyStatusCommand> {
  private readonly logger = new Logger(UpdateCompanyStatusHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: UpdateCompanyStatusCommand) {
    const { companyId, status, adminId, rejectionReason } = command;

    // 'active' | 'approved' → APPROVED, 'rejected' → REJECTED
    const normalizedStatus = status === 'rejected' ? 'REJECTED' : 'APPROVED';

    const existing = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { vendor: true },
    });
    if (!existing) throw new NotFoundException('Şirket bulunamadı');

    // State machine: yalnızca PENDING company işlem görür
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        `Bu şirket zaten "${existing.status}" durumunda, işlem yapılamaz`,
      );
    }

    // Company güncelle
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        status: normalizedStatus,
        verifiedAt: normalizedStatus === 'APPROVED' ? new Date() : null,
      },
    });

    // Bağlı vendor varsa senkron güncelle
    if (existing.vendor) {
      const vendorData: Record<string, unknown> = { status: normalizedStatus };
      if (normalizedStatus === 'APPROVED') {
        vendorData.barterEnabled = true;
        vendorData.isVerified = true;
        vendorData.verifiedAt = new Date();
      }

      await this.prisma.vendor.update({
        where: { id: existing.vendor.id },
        data: vendorData,
      });

      // APPROVED ise kullanıcı rolünü VENDOR yap
      if (normalizedStatus === 'APPROVED' && existing.vendor.userId) {
        await this.prisma.user.update({
          where: { id: existing.vendor.userId },
          data: { role: 'VENDOR' },
        });
        this.logger.log(`Kullanıcı rolü VENDOR yapıldı`, { userId: existing.vendor.userId });
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

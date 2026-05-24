// apps/backend/src/modules/barter/application/commands/reactivate-surplus.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ReactivateSurplusCommand } from './reactivate-surplus.command';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';

// Platform kuralı: bir ilan en fazla bu kadar kez yeniden aktifleştirilebilir
const MAX_REACTIVATIONS = 3;

@CommandHandler(ReactivateSurplusCommand)
export class ReactivateSurplusHandler implements ICommandHandler<ReactivateSurplusCommand> {
  constructor(
    @Inject('ISurplusItemRepository') private readonly repository: ISurplusItemRepository,
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: ReactivateSurplusCommand): Promise<{ success: boolean }> {
    const surplus = await this.repository.findById(command.surplusId);
    if (!surplus) throw new NotFoundException('İlan bulunamadı');

    // Sahiplik kontrolü: ilanın şirketi kullanıcının firmasıyla eşleşmeli
    const vendor = await this.vendorRepository.findByUserId(command.userId);
    if (!vendor) throw new ForbiddenException('Satıcı bulunamadı');

    const props = surplus.getProps();
    if (!props.companyId || vendor.getProps().companyId !== props.companyId) {
      throw new ForbiddenException('Bu ilan üzerinde işlem yapma yetkiniz yok');
    }

    if (props.reactivationCount >= MAX_REACTIVATIONS) {
      throw new ForbiddenException(
        `Bu ilan maksimum reaktivasyon sınırına ulaştı (${MAX_REACTIVATIONS}). Yeni ilan oluşturunuz.`,
      );
    }

    const MIN_REACTIVATION_INTERVAL_DAYS = 7;

    if (props.lastReactivatedAt) {
      const daysSinceLast = Math.floor(
        (Date.now() - props.lastReactivatedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceLast < MIN_REACTIVATION_INTERVAL_DAYS) {
        throw new BadRequestException({
          code: 'REACTIVATION_TOO_SOON',
          message: `Reaktivasyon için ${MIN_REACTIVATION_INTERVAL_DAYS} gün beklemeniz gerekiyor.`,
          nextAllowedAt: new Date(
            props.lastReactivatedAt.getTime() +
            MIN_REACTIVATION_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
          ).toISOString(),
          daysRemaining: MIN_REACTIVATION_INTERVAL_DAYS - daysSinceLast,
        });
      }
    }

    const prevStatus = props.status;
    const prevCount  = props.reactivationCount;

    // Domain metodu: durum geçişini ve sayacı birlikte yönetir
    surplus.reactivate(command.newQuantity);
    await this.repository.save(surplus);

    // lastReactivatedAt güncelle — repository.save zaten yapar ama açıkça set edelim
    await this.repository.update(command.surplusId, {
      reactivationCount: surplus.getProps().reactivationCount,
      lastReactivatedAt: new Date(),
      status: surplus.getProps().status,
    });

    await this.auditLog.log({
      actorId:      command.userId,
      action:       'SURPLUS_REACTIVATED',
      resourceType: 'SurplusItem',
      resourceId:   command.surplusId,
      oldValue:     { status: prevStatus, reactivationCount: prevCount },
      newValue:     { status: surplus.getProps().status, reactivationCount: surplus.getProps().reactivationCount, quantity: command.newQuantity },
    });

    return { success: true };
  }
}
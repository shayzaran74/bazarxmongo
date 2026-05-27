// apps/backend/src/modules/barter/application/commands/offboard-vendor.handler.ts
// Master Plan v4.3 §3.4 — Çıkış Mekanizması
//
// Adımlar:
// 1. B2B aidat durumunu SUSPENDED → çıkış işlendi
// 2. Aktif dispute'lar varsa blokla (açık ihtilaf varken çıkış yapılamaz)
// 3. XP komisyon payı için 90 gün TTL yaz (kalan sıfırlanır, komisyon payı korunur)
// 4. VendorB2BData.subscriptionStatus = EXPIRED (havuz erişimi kapanır)
// 5. AuditLog

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { OffboardVendorCommand } from './offboard-vendor.command';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { IDisputeRepository } from '../../domain/repositories/dispute.repository.interface';
import { IXpTransactionRepository } from '../../domain/repositories/xp-transaction.repository.interface';
import { IUserLevelRepository } from '../../domain/repositories/user-level.repository.interface';
import { IBlindPoolEntryRepository } from '../../domain/repositories/blind-pool-entry.repository.interface';
import { IVendorB2BDataRepository } from '../../domain/repositories/vendor-b2b-data.repository.interface';
import { AuditLogService } from '../../../audit/application/audit-log.service';

// §3.4 — Çıkışta XP komisyon payının kullanılabileceği süre
const OFFBOARDING_XP_TTL_DAYS = 90;

@CommandHandler(OffboardVendorCommand)
export class OffboardVendorHandler implements ICommandHandler<OffboardVendorCommand> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @Inject('IDisputeRepository') private readonly disputeRepository: IDisputeRepository,
    @Inject('IXpTransactionRepository') private readonly xpRepo: IXpTransactionRepository,
    @Inject('IUserLevelRepository') private readonly userLevelRepo: IUserLevelRepository,
    @Inject('IBlindPoolEntryRepository') private readonly blindPoolEntryRepo: IBlindPoolEntryRepository,
    @Inject('IVendorB2BDataRepository') private readonly b2bDataRepo: IVendorB2BDataRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: OffboardVendorCommand): Promise<{ success: boolean; xpPreservedDays: number }> {
    const { actorUserId, vendorId, reason } = command;

    const vendor = await this.vendorRepository.findById(vendorId);
    if (!vendor) throw new NotFoundException('Vendor bulunamadı.');

    const openDispute = await this.disputeRepository.findOpenByUserId(actorUserId);
    if (openDispute) {
      throw new BadRequestException(
        'Açık uyuşmazlık bulunduğundan çıkış işlemi yapılamaz. Lütfen önce ihtilafı sonuçlandırın.',
      );
    }

    const xpExpiresAt = new Date();
    xpExpiresAt.setDate(xpExpiresAt.getDate() + OFFBOARDING_XP_TTL_DAYS);

    const vendorProps = vendor.getProps();
    const userId = vendorProps.userId;

    // 1. B2B aidat durumunu EXPIRED'a al
    await this.b2bDataRepo.updateSubscriptionStatus(vendorId, 'EXPIRED');

    // 2. COMMISSION_XP_SPEND ve COMMISSION türleri için 90 gün TTL, diğerlerini hemen sıfırla
    if (userId) {
      await this.xpRepo.updateExpiresAtByUserAndTypes(
        userId,
        ['COMMISSION_XP_SPEND', 'COMMISSION'],
        xpExpiresAt,
      );
      await this.xpRepo.updateExpiresAtByUserAndNotTypes(
        userId,
        ['COMMISSION_XP_SPEND', 'COMMISSION'],
        new Date(),
      );
      await this.userLevelRepo.resetXp(userId);
    }

    // 3. Aktif BlindPool girişlerini kapat
    await this.blindPoolEntryRepo.closeEntriesByVendor(vendorId);

    await this.auditLog.log({
      actorId:      actorUserId,
      action:       'VENDOR_OFFBOARDED',
      resourceType: 'Vendor',
      resourceId:   vendorId,
      newValue: {
        reason,
        xpCommissionPreservedUntil: xpExpiresAt.toISOString(),
        subscriptionStatus:         'EXPIRED',
        message:                    `§3.4: XP komisyon payı ${OFFBOARDING_XP_TTL_DAYS} gün korundu, aidat iadesi yapılmadı.`,
      },
    });

    return { success: true, xpPreservedDays: OFFBOARDING_XP_TTL_DAYS };
  }
}
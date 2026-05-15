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
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { OffboardVendorCommand } from './offboard-vendor.command';

// §3.4 — Çıkışta XP komisyon payının kullanılabileceği süre
const OFFBOARDING_XP_TTL_DAYS = 90;

@CommandHandler(OffboardVendorCommand)
export class OffboardVendorHandler implements ICommandHandler<OffboardVendorCommand> {
  constructor(
    private readonly prisma:   PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: OffboardVendorCommand): Promise<{ success: boolean; xpPreservedDays: number }> {
    const { actorUserId, vendorId, reason } = command;

    const vendor = await this.prisma.vendor.findUnique({
      where:  { id: vendorId },
      select: {
        id:     true,
        userId: true,
        status: true,
        b2bData: {
          select: {
            subscriptionStatus: true,
            b2bTier:            true,
          },
        },
      },
    });
    if (!vendor) throw new NotFoundException('Vendor bulunamadı.');

    // Açık uyuşmazlık varken çıkış yapılamaz
    const openDispute = await this.prisma.barterDisputeLog.findFirst({
      where: {
        OR: [{ openedById: actorUserId }, { respondentId: actorUserId }],
        status: { in: ['OPEN', 'AUTO_REVIEW', 'MANUAL_REVIEW', 'ARBITRATION'] },
      },
      select: { id: true },
    });
    if (openDispute) {
      throw new BadRequestException(
        'Açık uyuşmazlık bulunduğundan çıkış işlemi yapılamaz. Lütfen önce ihtilafı sonuçlandırın.',
      );
    }

    const xpExpiresAt = new Date();
    xpExpiresAt.setDate(xpExpiresAt.getDate() + OFFBOARDING_XP_TTL_DAYS);

    await this.prisma.$transaction(async (tx) => {
      // 1. B2B aidat durumunu EXPIRED'a al (havuz erişimi kapanır)
      await tx.vendorB2BData.updateMany({
        where: { vendorId },
        data:  { subscriptionStatus: 'EXPIRED' },
      });

      // 2. Mevcut XP komisyon bakiyesini 90 gün TTL ile koru
      //    Diğer XP türlerini (ADVERTISING vb.) hemen sıfırla
      const userId = vendor.userId;
      if (userId) {
        // COMMISSION_XP_SPEND türündeki işlemler için 90 gün TTL
        await tx.xpTransaction.updateMany({
          where: {
            userId,
            type:      { in: ['COMMISSION_XP_SPEND', 'COMMISSION'] },
            expiresAt: null,
          },
          data: { expiresAt: xpExpiresAt },
        });

        // Diğer XP bakiyelerini hemen sıfırla (expiresAt = şimdi)
        await tx.xpTransaction.updateMany({
          where: {
            userId,
            type:      { notIn: ['COMMISSION_XP_SPEND', 'COMMISSION'] },
            expiresAt: null,
          },
          data: { expiresAt: new Date() },
        });

        // UserLevel XP'yi güncelle (sadece komisyon XP korundu, toplam güncellenecek)
        await tx.userLevel.updateMany({
          where: { userId },
          data:  { currentXp: 0 },
        });
      }

      // 3. Aktif BlindPool girişlerini kapat
      await tx.blindPoolEntry.updateMany({
        where: { vendorId },
        data:  { quantity: 0 },
      });
    });

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

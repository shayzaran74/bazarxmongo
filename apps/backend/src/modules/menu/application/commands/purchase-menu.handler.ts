// apps/backend/src/modules/menu/application/commands/purchase-menu.handler.ts
// Master Plan v4.3 §2.2 — QR satın alım + hizmet bedeli + KDV

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { PurchaseMenuCommand } from './purchase-menu.command';
import { QrGeneratorService } from '../services/qr-generator.service';
import { MenuUsageTrackerService } from '../services/menu-usage-tracker.service';
import { SubscriptionPricingService } from '../../../subscription/application/services/subscription-pricing.service';

@CommandHandler(PurchaseMenuCommand)
export class PurchaseMenuHandler implements ICommandHandler<PurchaseMenuCommand> {
  private readonly logger = new Logger(PurchaseMenuHandler.name);

  constructor(
    private readonly prisma:       PrismaService,
    private readonly qr:           QrGeneratorService,
    private readonly usageTracker: MenuUsageTrackerService,
    private readonly pricing:      SubscriptionPricingService,
  ) {}

  async execute(command: PurchaseMenuCommand) {
    const { userId, menuId, useMenuCredit } = command;

    const menu = await this.prisma.bazarXMenu.findUnique({
      where:   { id: menuId },
      include: { restaurant: { select: { id: true, name: true, city: true } } },
    });
    if (!menu || !menu.isActive) throw new NotFoundException('Menü bulunamadı veya aktif değil');

    // Günlük limit kontrolü
    if (menu.dailyLimit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = await this.prisma.menuPurchase.count({
        where: { menuId, createdAt: { gte: today }, status: { not: 'CANCELLED' } },
      });
      if (todayCount >= menu.dailyLimit) {
        throw new BadRequestException('Bu menü için günlük limit doldu');
      }
    }

    // Fiyat hesabı (%8 hizmet + %20 KDV)
    const breakdown = this.pricing.calculateMenuPrice(Number(menu.originalPrice));

    // Menü kredisi kontrolü (abonelik varsa)
    let subscriptionId: string | undefined;
    if (useMenuCredit) {
      const sub = await this.prisma.userSubscription.findUnique({ where: { userId } });
      if (sub?.status === 'ACTIVE') {
        subscriptionId = sub.id;
        await this.usageTracker.assertSufficientCredit(userId, breakdown.totalPaid);
      }
    }

    // QR kodları üret
    const qrCode        = this.qr.generate();
    const oneFreeQrCode = this.qr.generateOneFree();
    const qrExpiresAt   = this.qr.expiresAt(new Date(), 30);

    const purchase = await this.prisma.$transaction(async (tx) => {
      const p = await tx.menuPurchase.create({
        data: {
          userId,
          menuId,
          subscriptionId: subscriptionId ?? null,
          paidAmount:     breakdown.totalPaid,
          serviceFee:     breakdown.serviceFee,
          vatAmount:      breakdown.vatAmount,
          qrCode,
          qrExpiresAt,
          oneFreeQrCode,
          status:         'ACTIVE',
          xpEarned:       5, // Master Plan: her QR kullanımında 5 XP
        },
      });

      // Aylık menü kredisini düş
      if (subscriptionId) {
        await this.usageTracker.deductCredit(userId, breakdown.totalPaid);
      }

      // 5 XP ver
      await tx.userLevel.upsert({
        where:  { userId },
        update: { currentXp: { increment: 5 }, lifetimeXp: { increment: 5 } },
        create: { userId, currentXp: 5, lifetimeXp: 5, level: 1, isFirstOrder: true },
      });
      await tx.xpTransaction.create({
        data: { userId, amount: 5, type: 'MENU_QR_USE', description: `Menü QR satın alımı: ${menu.title}`, referenceId: p.id, referenceType: 'MENU_PURCHASE' },
      });

      return p;
    });

    this.logger.log('Menü satın alındı', { userId, menuId, total: breakdown.totalPaid });

    return {
      success: true,
      data: {
        purchaseId:      purchase.id,
        restaurant:      menu.restaurant.name,
        menuTitle:       menu.title,
        pricing:         breakdown,
        qrCode:          purchase.qrCode,
        oneFreeQrCode:   purchase.oneFreeQrCode,
        qrExpiresAt:     purchase.qrExpiresAt,
        xpEarned:        5,
      },
    };
  }
}

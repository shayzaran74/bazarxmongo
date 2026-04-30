// apps/backend/src/modules/menu/application/commands/redeem-menu.handler.ts
// Master Plan v4.3 — QR tarama (restoran tarafı)

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { RedeemMenuCommand } from './redeem-menu.command';

@CommandHandler(RedeemMenuCommand)
export class RedeemMenuHandler implements ICommandHandler<RedeemMenuCommand> {
  private readonly logger = new Logger(RedeemMenuHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RedeemMenuCommand) {
    const { qrCode, staffUserId } = command;

    // QR kod: ana menü mü, 1+1 bedava mı?
    const purchase = await this.prisma.menuPurchase.findFirst({
      where: {
        OR: [
          { qrCode,        status: { not: 'CANCELLED' } },
          { oneFreeQrCode: qrCode, oneFreeActivatedAt: { not: null } },
        ],
      },
      include: { menu: { include: { restaurant: { select: { name: true } } } } },
    });

    if (!purchase) throw new NotFoundException('Geçersiz QR kodu');
    if (new Date() > purchase.qrExpiresAt) throw new BadRequestException('QR kodunun süresi dolmuş');

    const isOneFree = purchase.oneFreeQrCode === qrCode;

    if (!isOneFree && purchase.status === 'REDEEMED') {
      throw new BadRequestException('Bu QR zaten kullanılmış');
    }
    if (isOneFree && purchase.oneFreeUsedAt) {
      throw new BadRequestException('Bu bedava QR zaten kullanılmış');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.menuRedemption.create({
        data: {
          purchaseId:    purchase.id,
          isOneFree,
          scannedByStaff: staffUserId,
        },
      });

      if (isOneFree) {
        await tx.menuPurchase.update({
          where: { id: purchase.id },
          data:  { oneFreeUsedAt: new Date(), status: 'REDEEMED' },
        });
      } else {
        const newStatus = purchase.oneFreeActivatedAt ? 'PARTIALLY_REDEEMED' : 'REDEEMED';
        await tx.menuPurchase.update({
          where: { id: purchase.id },
          data:  { status: newStatus },
        });
      }
    });

    this.logger.log('Menü QR kullanıldı', { purchaseId: purchase.id, isOneFree });

    return {
      success: true,
      message: isOneFree ? '1+1 bedava menü onaylandı' : 'Menü QR onaylandı',
      data: {
        menuTitle:   purchase.menu.title,
        restaurant:  purchase.menu.restaurant.name,
        isOneFree,
        userId:      purchase.userId,
        redeemedAt:  new Date(),
      },
    };
  }
}

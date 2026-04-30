// apps/backend/src/modules/menu/application/commands/distribute-free-menu.handler.ts
// Master Plan v4.3 §2.8 — 60 menü taahhüdü: bedava dağıtım

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { DistributeFreeMenuCommand } from './distribute-free-menu.command';
import { QrGeneratorService } from '../services/qr-generator.service';

@CommandHandler(DistributeFreeMenuCommand)
export class DistributeFreeMenuHandler implements ICommandHandler<DistributeFreeMenuCommand> {
  private readonly logger = new Logger(DistributeFreeMenuHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly qr:     QrGeneratorService,
  ) {}

  async execute(command: DistributeFreeMenuCommand) {
    const { restaurantId, menuId, userIds, adminId } = command;

    if (!userIds.length) throw new BadRequestException('En az bir kullanıcı belirtilmeli');

    const partner = await this.prisma.launchPartner.findUnique({
      where: { restaurantId },
    });
    if (!partner) throw new NotFoundException('Lansman ortağı bulunamadı');

    const remaining = partner.pledgedMenuCount - partner.distributedCount;
    if (userIds.length > remaining) {
      throw new BadRequestException(
        `Kalan taahhüt: ${remaining} menü. ${userIds.length} talep edildi.`,
      );
    }

    const menu = await this.prisma.bazarXMenu.findUnique({
      where: { id: menuId },
      select: { id: true, title: true, originalPrice: true, discountedPrice: true },
    });
    if (!menu) throw new NotFoundException('Menü bulunamadı');

    let distributed = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const userId of userIds) {
        const qrCode      = this.qr.generate();
        const qrExpiresAt = this.qr.expiresAt(new Date(), 30);

        await tx.menuPurchase.create({
          data: {
            userId,
            menuId,
            paidAmount:  0,   // bedava
            serviceFee:  0,
            vatAmount:   0,
            qrCode,
            qrExpiresAt,
            status:      'ACTIVE',
            xpEarned:    0,   // bedava menülerde XP verilmez
          },
        });
        distributed++;
      }

      // Dağıtım sayısını güncelle
      await tx.launchPartner.update({
        where: { restaurantId },
        data:  { distributedCount: { increment: distributed } },
      });
    });

    this.logger.log('Ücretsiz menü dağıtıldı', { restaurantId, menuId, count: distributed, adminId });

    return {
      success: true,
      message: `${distributed} kullanıcıya ücretsiz menü QR dağıtıldı`,
      data: {
        distributed,
        remaining: remaining - distributed,
        menuTitle: menu.title,
      },
    };
  }
}

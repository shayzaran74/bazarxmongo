// apps/backend/src/modules/menu/application/commands/distribute-free-menu.handler.ts
// Master Plan v4.3 §2.8 — 60 menü taahhüdü: bedava dağıtım
// BazarX Go: LaunchPartner.vendorId + MenuPurchase.listingId üzerinden çalışır

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
    const { vendorId, listingId, userIds, adminId } = command;

    if (!userIds.length) throw new BadRequestException('En az bir kullanıcı belirtilmeli');

    const partner = await this.prisma.launchPartner.findUnique({
      where: { vendorId },
    });
    if (!partner) throw new NotFoundException('Lansman ortağı bulunamadı');

    const remaining = partner.pledgedMenuCount - partner.distributedCount;
    if (userIds.length > remaining) {
      throw new BadRequestException(
        `Kalan taahhüt: ${remaining} menü. ${userIds.length} talep edildi.`,
      );
    }

    const listing = await this.prisma.listing.findFirst({
      where:  { id: listingId, vendorId },
      select: { id: true, title: true, price: true },
    });
    if (!listing) throw new NotFoundException('Menü (listing) bulunamadı');

    let distributed = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const userId of userIds) {
        const qrCode      = this.qr.generate();
        const qrExpiresAt = this.qr.expiresAt(new Date(), 30);

        await tx.menuPurchase.create({
          data: {
            userId,
            listingId,
            paidAmount:  0,
            serviceFee:  0,
            vatAmount:   0,
            qrCode,
            qrExpiresAt,
            status:      'ACTIVE',
            xpEarned:    0,
          },
        });
        distributed++;
      }

      await tx.launchPartner.update({
        where: { vendorId },
        data:  { distributedCount: { increment: distributed } },
      });
    });

    this.logger.log('Ücretsiz menü dağıtıldı', { vendorId, listingId, count: distributed, adminId });

    return {
      success: true,
      message: `${distributed} kullanıcıya ücretsiz menü QR dağıtıldı`,
      data: {
        distributed,
        remaining: remaining - distributed,
        menuTitle: listing.title,
      },
    };
  }
}

// apps/backend/src/modules/menu/application/commands/redeem-menu.handler.ts
// Master Plan v4.3 — QR tarama (restoran tarafı)
// §4 — 15 günlük aktivasyon bekleme süresi: ilk 15 gün kupon kullanılamaz

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { IMenuPurchase, IMenuRedemption, IUserSubscription } from '@barterborsa/shared-persistence';
import { RedeemMenuCommand } from './redeem-menu.command';

const ACTIVATION_DAYS = 15; // §4 — 16. günde aktive olur

@CommandHandler(RedeemMenuCommand)
export class RedeemMenuHandler implements ICommandHandler<RedeemMenuCommand> {
  private readonly logger = new Logger(RedeemMenuHandler.name);

  constructor(
    @InjectModel('MenuPurchase')    private readonly purchaseModel:    Model<IMenuPurchase>,
    @InjectModel('MenuRedemption')  private readonly redemptionModel:  Model<IMenuRedemption>,
    @InjectModel('UserSubscription')private readonly subModel:         Model<IUserSubscription>,
    @InjectConnection()             private readonly connection:        Connection,
  ) {}

  async execute(command: RedeemMenuCommand) {
    const { qrCode, staffUserId } = command;

    // Atomic QR doğrulama — race condition korumalı
    const purchase = await this.purchaseModel
      .findOne({
        $or: [
          { qrCode, status: { $nin: ['CANCELLED', 'EXPIRED'] } },
          { oneFreeQrCode: qrCode, oneFreeActivatedAt: { $ne: null, $exists: true } },
        ],
      })
      .lean();

    if (!purchase) throw new NotFoundException('Geçersiz QR kodu');
    if (new Date() > purchase.qrExpiresAt) throw new BadRequestException('QR kodunun süresi dolmuş');

    const isOneFree = purchase.oneFreeQrCode === qrCode;

    if (!isOneFree && purchase.status === 'REDEEMED')
      throw new BadRequestException('Bu QR zaten kullanılmış');
    if (isOneFree && purchase.oneFreeUsedAt)
      throw new BadRequestException('Bu bedava QR zaten kullanılmış');

    // §4 — Abonelik bazlı QR ise 15 günlük aktivasyon kontrolü
    // Devir alınan (transferredFrom) ve Gel-Al (subscriptionId yok) QR'lar muaftır
    if (purchase.subscriptionId && !purchase.transferredFrom) {
      const sub = await this.subModel.findOne({ id: purchase.subscriptionId }).lean();
      if (sub?.startDate) {
        const activationDate = new Date(sub.startDate);
        activationDate.setDate(activationDate.getDate() + ACTIVATION_DAYS);

        if (new Date() < activationDate) {
          const formatted = activationDate.toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', year: 'numeric',
          });
          throw new BadRequestException(
            `Üyeliğiniz henüz aktive edilmedi. ${formatted} tarihinden itibaren QR kullanabilirsiniz. ` +
            'Bu sürede menü satın alabilir veya QR\'ı bir yakınınıza devredebilirsiniz.',
          );
        }
      }
    }

    // Atomic status geçişi — findOneAndUpdate ile race condition koruması
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        if (isOneFree) {
          const updated = await this.purchaseModel.findOneAndUpdate(
            { _id: purchase._id ?? purchase.id, oneFreeUsedAt: null },
            { $set: { oneFreeUsedAt: new Date(), status: 'REDEEMED' } },
            { new: true, session },
          ).exec();
          if (!updated) throw new BadRequestException('Bu bedava QR zaten kullanılmış (eşzamanlı tarama)');
        } else {
          const newStatus = purchase.oneFreeActivatedAt ? 'PARTIALLY_REDEEMED' : 'REDEEMED';
          const updated = await this.purchaseModel.findOneAndUpdate(
            { _id: purchase._id ?? purchase.id, status: { $in: ['ACTIVE', 'PARTIALLY_REDEEMED'] } },
            { $set: { status: newStatus, qrUsedAt: new Date() } },
            { new: true, session },
          ).exec();
          if (!updated) throw new BadRequestException('Bu QR zaten kullanılmış (eşzamanlı tarama)');
        }

        const redId = new Types.ObjectId().toString();
        await this.redemptionModel.create(
          [{ _id: redId, id: redId, purchaseId: purchase.id, isOneFree, scannedByStaff: staffUserId }],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    this.logger.log('Menü QR kullanıldı', { purchaseId: purchase.id, isOneFree });

    return {
      success: true,
      message: isOneFree ? '1+1 bedava menü onaylandı' : 'Menü QR onaylandı',
      data: {
        purchaseId: purchase.id,
        isOneFree,
        userId:     purchase.userId,
        redeemedAt: new Date(),
      },
    };
  }
}

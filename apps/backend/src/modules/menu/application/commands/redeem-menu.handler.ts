// apps/backend/src/modules/menu/application/commands/redeem-menu.handler.ts
// Master Plan v4.3 — QR tarama (restoran tarafı)

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { IMenuPurchase, IMenuRedemption } from '@barterborsa/shared-persistence';
import { RedeemMenuCommand } from './redeem-menu.command';

@CommandHandler(RedeemMenuCommand)
export class RedeemMenuHandler implements ICommandHandler<RedeemMenuCommand> {
  private readonly logger = new Logger(RedeemMenuHandler.name);

  constructor(
    @InjectModel('MenuPurchase')   private readonly purchaseModel:   Model<IMenuPurchase>,
    @InjectModel('MenuRedemption') private readonly redemptionModel: Model<IMenuRedemption>,
    @InjectConnection()            private readonly connection:       Connection,
  ) {}

  async execute(command: RedeemMenuCommand) {
    const { qrCode, staffUserId } = command;

    const purchase = await this.purchaseModel
      .findOne({
        $or: [
          { qrCode, status: { $ne: 'CANCELLED' } },
          { oneFreeQrCode: qrCode, oneFreeActivatedAt: { $ne: null, $exists: true } },
        ],
      })
      .lean();

    if (!purchase) throw new NotFoundException('Geçersiz QR kodu');
    if (new Date() > purchase.qrExpiresAt) throw new BadRequestException('QR kodunun süresi dolmuş');

    const isOneFree = purchase.oneFreeQrCode === qrCode;

    if (!isOneFree && purchase.status === 'REDEEMED') throw new BadRequestException('Bu QR zaten kullanılmış');
    if (isOneFree && purchase.oneFreeUsedAt)           throw new BadRequestException('Bu bedava QR zaten kullanılmış');

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const redId = new Types.ObjectId().toString();
        await this.redemptionModel.create(
          [{ _id: redId, id: redId, purchaseId: purchase.id, isOneFree, scannedByStaff: staffUserId }],
          { session },
        );

        if (isOneFree) {
          await this.purchaseModel.updateOne(
            { _id: purchase._id ?? purchase.id },
            { $set: { oneFreeUsedAt: new Date(), status: 'REDEEMED' } },
            { session },
          );
        } else {
          const newStatus = purchase.oneFreeActivatedAt ? 'PARTIALLY_REDEEMED' : 'REDEEMED';
          await this.purchaseModel.updateOne(
            { _id: purchase._id ?? purchase.id },
            { $set: { status: newStatus } },
            { session },
          );
        }
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

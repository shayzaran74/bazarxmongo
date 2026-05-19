// apps/backend/src/modules/menu/application/commands/distribute-free-menu.handler.ts
// Master Plan v4.3 §2.8 — 60 menü taahhüdü: bedava dağıtım

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types, ClientSession } from 'mongoose';
import { ILaunchPartner, IMenuPurchase, IListing } from '@barterborsa/shared-persistence';
import { DistributeFreeMenuCommand } from './distribute-free-menu.command';
import { QrGeneratorService } from '../services/qr-generator.service';

@CommandHandler(DistributeFreeMenuCommand)
export class DistributeFreeMenuHandler implements ICommandHandler<DistributeFreeMenuCommand> {
  private readonly logger = new Logger(DistributeFreeMenuHandler.name);

  constructor(
    @InjectModel('LaunchPartner') private readonly partnerModel:  Model<ILaunchPartner>,
    @InjectModel('MenuPurchase')  private readonly purchaseModel: Model<IMenuPurchase>,
    @InjectModel('Listing')       private readonly listingModel:  Model<IListing>,
    @InjectConnection()           private readonly connection:     Connection,
    private readonly qr: QrGeneratorService,
  ) {}

  async execute(command: DistributeFreeMenuCommand) {
    const { vendorId, listingId, userIds, adminId } = command;

    if (!userIds.length) throw new BadRequestException('En az bir kullanıcı belirtilmeli');

    const partner = await this.partnerModel.findOne({ vendorId }).lean();
    if (!partner) throw new NotFoundException('Lansman ortağı bulunamadı');

    const remaining = partner.pledgedMenuCount - partner.distributedCount;
    if (userIds.length > remaining) {
      throw new BadRequestException(`Kalan taahhüt: ${remaining} menü. ${userIds.length} talep edildi.`);
    }

    const listing = await this.listingModel.findOne({ id: listingId, vendorId }, { id: 1, title: 1, price: 1 }).lean();
    if (!listing) throw new NotFoundException('Menü (listing) bulunamadı');

    let distributed = 0;

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const docs = userIds.map(userId => {
          const newId = new Types.ObjectId().toString();
          return {
            _id: newId, id: newId, userId, listingId,
            paidAmount:  Types.Decimal128.fromString('0'),
            serviceFee:  Types.Decimal128.fromString('0'),
            vatAmount:   Types.Decimal128.fromString('0'),
            qrCode:      this.qr.generate(),
            qrExpiresAt: this.qr.expiresAt(new Date(), 30),
            status:      'ACTIVE',
            xpEarned:    0,
          };
        });
        await this.purchaseModel.insertMany(docs, { session });
        distributed = docs.length;

        await this.partnerModel.updateOne(
          { vendorId },
          { $inc: { distributedCount: distributed } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    this.logger.log('Ücretsiz menü dağıtıldı', { vendorId, listingId, count: distributed, adminId });

    return {
      success: true,
      message: `${distributed} kullanıcıya ücretsiz menü QR dağıtıldı`,
      data:    { distributed, remaining: remaining - distributed, menuTitle: listing.title },
    };
  }
}

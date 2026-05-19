// apps/backend/src/modules/menu/application/commands/purchase-menu.handler.ts
// Master Plan v4.3 §2.2 — QR satın alım + hizmet bedeli + KDV

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types, ClientSession } from 'mongoose';
import { IMenuPurchase, IListing, IUserSubscription, IUserLevel, IXpTransaction } from '@barterborsa/shared-persistence';
import { PurchaseMenuCommand } from './purchase-menu.command';
import { QrGeneratorService }  from '../services/qr-generator.service';
import { MenuUsageTrackerService } from '../services/menu-usage-tracker.service';
import { SubscriptionPricingService } from '../../../subscription/application/services/subscription-pricing.service';

interface RestaurantListingMetadata {
  dailyLimit?: number;
  prepTimeMinutes?: number;
  ingredients?: string;
  calories?: number;
}

const d128 = (v: number) => Types.Decimal128.fromString(v.toFixed(2));

@CommandHandler(PurchaseMenuCommand)
export class PurchaseMenuHandler implements ICommandHandler<PurchaseMenuCommand> {
  private readonly logger = new Logger(PurchaseMenuHandler.name);

  constructor(
    @InjectModel('MenuPurchase')     private readonly purchaseModel:  Model<IMenuPurchase>,
    @InjectModel('Listing')          private readonly listingModel:   Model<IListing>,
    @InjectModel('UserSubscription') private readonly subModel:       Model<IUserSubscription>,
    @InjectModel('UserLevel')        private readonly userLevelModel: Model<IUserLevel>,
    @InjectModel('XpTransaction')    private readonly xpTxModel:      Model<IXpTransaction>,
    @InjectConnection()              private readonly connection:      Connection,
    private readonly qr:           QrGeneratorService,
    private readonly usageTracker: MenuUsageTrackerService,
    private readonly pricing:      SubscriptionPricingService,
  ) {}

  async execute(command: PurchaseMenuCommand) {
    const { userId, listingId, useMenuCredit } = command;

    const listing = await this.listingModel.findOne({ id: listingId }).lean();
    if (!listing || !listing.isActive || listing.status !== 'ACTIVE') {
      throw new NotFoundException('Menü bulunamadı veya aktif değil');
    }
    if ((listing as Record<string, unknown>).vendorType !== 'RESTAURANT') {
      throw new BadRequestException('Bu işlem yalnızca restoran menüleri için geçerlidir.');
    }

    const metadata     = ((listing as Record<string, unknown>).metadata as RestaurantListingMetadata) ?? {};
    const dailyLimit   = metadata.dailyLimit;
    const originalPrice = parseFloat(listing.price.toString());

    if (dailyLimit && dailyLimit > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = await this.purchaseModel.countDocuments({
        listingId, createdAt: { $gte: today }, status: { $ne: 'CANCELLED' },
      });
      if (todayCount >= dailyLimit) throw new BadRequestException('Bu menü için günlük limit doldu');
    }

    const breakdown = this.pricing.calculateMenuPrice(originalPrice);

    let subscriptionId: string | undefined;
    if (useMenuCredit) {
      const sub = await this.subModel.findOne({ userId }).lean();
      if (sub?.status === 'ACTIVE') {
        subscriptionId = sub.id;
        await this.usageTracker.assertSufficientCredit(userId, breakdown.totalPaid);
      }
    }

    const qrCode        = this.qr.generate();
    const oneFreeQrCode = this.qr.generateOneFree();
    const qrExpiresAt   = this.qr.expiresAt(new Date(), 30);

    let purchaseId!: string;
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const newId = new Types.ObjectId().toString();
        purchaseId  = newId;

        await this.purchaseModel.create(
          [{
            _id: newId, id: newId, userId, listingId,
            subscriptionId: subscriptionId ?? null,
            paidAmount:  d128(breakdown.totalPaid),
            serviceFee:  d128(breakdown.serviceFee),
            vatAmount:   d128(breakdown.vatAmount),
            qrCode, qrExpiresAt, oneFreeQrCode,
            status: 'ACTIVE', xpEarned: 5,
          }],
          { session },
        );

        if (subscriptionId) {
          await this.usageTracker.deductCredit(userId, breakdown.totalPaid);
        }

        await this.userLevelModel.findOneAndUpdate(
          { userId },
          {
            $inc:         { currentXp: 5, lifetimeXp: 5 },
            $setOnInsert: { _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), userId, currentXp: 5, lifetimeXp: 5, level: 1, isFirstOrder: true },
          },
          { upsert: true, session },
        );

        const txId = new Types.ObjectId().toString();
        await this.xpTxModel.create(
          [{
            _id: txId, id: txId, userId, amount: 5, type: 'MENU_QR_USE',
            description: `Menü QR satın alımı: ${listing.title}`,
            referenceId: newId, referenceType: 'MENU_PURCHASE',
          }],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    this.logger.log('Menü satın alındı', { userId, listingId, total: breakdown.totalPaid });

    return {
      success: true,
      data: {
        purchaseId,
        restaurant:    (listing as Record<string, unknown>).storeName ?? '',
        menuTitle:     listing.title,
        pricing:       breakdown,
        qrCode,
        oneFreeQrCode,
        qrExpiresAt,
        xpEarned:      5,
      },
    };
  }
}

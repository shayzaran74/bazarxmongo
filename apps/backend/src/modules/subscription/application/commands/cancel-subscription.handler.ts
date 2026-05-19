// apps/backend/src/modules/subscription/application/commands/cancel-subscription.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserSubscription } from '@barterborsa/shared-persistence';
import { CancelSubscriptionCommand } from './cancel-subscription.command';

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler implements ICommandHandler<CancelSubscriptionCommand> {
  constructor(
    @InjectModel('UserSubscription') private readonly subModel: Model<IUserSubscription>,
  ) {}

  async execute(command: CancelSubscriptionCommand) {
    const { userId } = command;

    const subscription = await this.subModel.findOne({ userId }).lean();
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new NotFoundException('Aktif abonelik bulunamadı');
    }

    // Downgrade koruması: menü hakları 30 gün daha devam eder (Master Plan §2.7)
    const protectedUntil = new Date(subscription.endDate);
    protectedUntil.setDate(protectedUntil.getDate() + 30);

    await this.subModel.updateOne(
      { userId },
      { $set: { status: 'CANCELLED', autoRenew: false, cancelledAt: new Date(), downgradeProtectedUntil: protectedUntil } },
    );

    return {
      success: true,
      message: 'Abonelik iptal edildi. Menü haklarınız 30 gün daha geçerlidir.',
      data:    { protectedUntil },
    };
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CancelSubscriptionCommand } from './cancel-subscription.command';

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler implements ICommandHandler<CancelSubscriptionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CancelSubscriptionCommand) {
    const { userId } = command;

    const subscription = await this.prisma.userSubscription.findUnique({ where: { userId } });
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new NotFoundException('Aktif abonelik bulunamadı');
    }

    // Downgrade koruması: menü hakları 30 gün daha devam eder (Master Plan §2.7)
    const protectedUntil = new Date(subscription.endDate);
    protectedUntil.setDate(protectedUntil.getDate() + 30);

    await this.prisma.userSubscription.update({
      where: { userId },
      data: {
        status:                  'CANCELLED',
        autoRenew:               false,
        cancelledAt:             new Date(),
        downgradeProtectedUntil: protectedUntil,
      },
    });

    return {
      success: true,
      message: 'Abonelik iptal edildi. Menü haklarınız 30 gün daha geçerlidir.',
      data:    { protectedUntil },
    };
  }
}

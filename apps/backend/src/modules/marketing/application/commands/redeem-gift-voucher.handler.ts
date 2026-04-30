import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { RedeemGiftVoucherCommand } from './redeem-gift-voucher.command';

@CommandHandler(RedeemGiftVoucherCommand)
export class RedeemGiftVoucherHandler implements ICommandHandler<RedeemGiftVoucherCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RedeemGiftVoucherCommand) {
    const { userId, code, orderId } = command;

    const voucher = await this.prisma.giftVoucher.findUnique({ where: { code } });

    if (!voucher)                              throw new NotFoundException('Geçersiz çek kodu');
    if (voucher.userId !== userId)             throw new BadRequestException('Bu çek size ait değil');
    if (voucher.redeemedAt)                    throw new BadRequestException('Bu çek daha önce kullanıldı');
    if (new Date() > voucher.validUntil)       throw new BadRequestException('Çekin geçerlilik süresi dolmuş');

    await this.prisma.giftVoucher.update({
      where: { id: voucher.id },
      data:  { redeemedAt: new Date(), orderId },
    });

    return {
      success: true,
      data: { amount: Number(voucher.amount), code: voucher.code },
    };
  }
}

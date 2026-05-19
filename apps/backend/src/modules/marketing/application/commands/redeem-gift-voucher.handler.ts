import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GiftVoucher } from '@barterborsa/shared-persistence/schemas/backend/giftVoucher.schema';
import { RedeemGiftVoucherCommand } from './redeem-gift-voucher.command';

@CommandHandler(RedeemGiftVoucherCommand)
export class RedeemGiftVoucherHandler implements ICommandHandler<RedeemGiftVoucherCommand> {
  async execute(command: RedeemGiftVoucherCommand) {
    const { userId, code, orderId } = command;

    const voucher = await GiftVoucher.findOne({ code }).lean();
    if (!voucher)                              throw new NotFoundException('Geçersiz çek kodu');
    if (voucher.userId !== userId)             throw new BadRequestException('Bu çek size ait değil');
    if (voucher.redeemedAt)                    throw new BadRequestException('Bu çek daha önce kullanıldı');
    if (new Date() > voucher.validUntil)       throw new BadRequestException('Çekin geçerlilik süresi dolmuş');

    await GiftVoucher.updateOne({ id: voucher.id }, { $set: { redeemedAt: new Date(), orderId } }).exec();

    return {
      success: true,
      data: { amount: Number(voucher.amount), code: voucher.code },
    };
  }
}

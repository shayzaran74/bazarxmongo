// apps/backend/src/modules/menu/application/commands/activate-one-free.handler.ts
// Master Plan v4.3 §2.2 — 2. menü bedava aktivasyonu

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenuPurchase } from '@barterborsa/shared-persistence';
import { ActivateOneFreeCommand } from './activate-one-free.command';

@CommandHandler(ActivateOneFreeCommand)
export class ActivateOneFreeHandler implements ICommandHandler<ActivateOneFreeCommand> {
  constructor(
    @InjectModel('MenuPurchase') private readonly purchaseModel: Model<IMenuPurchase>,
  ) {}

  async execute(command: ActivateOneFreeCommand) {
    const { userId, purchaseId } = command;

    const purchase = await this.purchaseModel.findById(purchaseId).lean();
    if (!purchase)                    throw new NotFoundException('Satın alım bulunamadı');
    if (purchase.userId !== userId)   throw new ForbiddenException('Bu satın alım size ait değil');
    if (purchase.status !== 'ACTIVE') throw new BadRequestException('Bu satın alım aktif değil');
    if (purchase.oneFreeActivatedAt)  throw new BadRequestException('1+1 hak zaten aktive edildi');
    if (new Date() > purchase.qrExpiresAt) throw new BadRequestException('QR süresi dolmuş');

    await this.purchaseModel.updateOne(
      { _id: purchaseId },
      { $set: { oneFreeActivatedAt: new Date(), status: 'PARTIALLY_REDEEMED' } },
    );

    return {
      success: true,
      message: '1+1 hakkınız aktive edildi. Bedava menü QR kodunuzu restorana gösterin.',
      data: { oneFreeQrCode: purchase.oneFreeQrCode, qrExpiresAt: purchase.qrExpiresAt },
    };
  }
}

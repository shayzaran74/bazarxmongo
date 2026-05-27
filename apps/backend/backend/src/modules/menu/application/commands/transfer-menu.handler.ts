// apps/backend/src/modules/menu/application/commands/transfer-menu.handler.ts
// BazarX-GO §4 — Menü Devir Hakkı
// Kullanıcı QR'ını uygulamayı indirmiş herhangi birine devredebilir.
// Devir geri alınamaz, orijinal 45 günlük pencere korunur.

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IMenuPurchase } from '@barterborsa/shared-persistence';
import { TransferMenuCommand } from './transfer-menu.command';
import { QrGeneratorService } from '../services/qr-generator.service';

@CommandHandler(TransferMenuCommand)
export class TransferMenuHandler implements ICommandHandler<TransferMenuCommand> {
  private readonly logger = new Logger(TransferMenuHandler.name);

  constructor(
    @InjectModel('MenuPurchase') private readonly purchaseModel: Model<IMenuPurchase>,
    private readonly qr: QrGeneratorService,
  ) {}

  async execute(command: TransferMenuCommand) {
    const { fromUserId, purchaseId, toUserId } = command;

    if (fromUserId === toUserId) {
      throw new BadRequestException('Menüyü kendinize devredemezsiniz');
    }

    const purchase = await this.purchaseModel.findOne({ id: purchaseId }).lean();
    if (!purchase) throw new NotFoundException('Satın alım bulunamadı');

    // Sahiplik kontrolü
    if (purchase.userId !== fromUserId) {
      throw new ForbiddenException('Bu QR size ait değil');
    }

    // Durum kontrolü — yalnızca ACTIVE ve PARTIALLY_REDEEMED devredilebilir
    const transferableStatuses = ['ACTIVE', 'PARTIALLY_REDEEMED'];
    if (!transferableStatuses.includes(purchase.status)) {
      throw new BadRequestException(`${purchase.status} durumundaki QR devredilemez`);
    }

    // Zaten devredilmiş mi?
    if (purchase.isTransferred) {
      throw new BadRequestException('Bu menü zaten devredilmiş');
    }

    // 45 günlük pencere kontrolü
    if (purchase.qrExpiresAt && new Date() > purchase.qrExpiresAt) {
      throw new BadRequestException('QR süresi dolmuş — devir yapılamaz');
    }

    // Devir kaydı oluştur (alıcı için yeni purchase, orijinal pencere korunur)
    const newId    = new Types.ObjectId().toString();
    const newQrCode = this.qr.generate();

    await this.purchaseModel.create([{
      _id:           newId,
      id:            newId,
      userId:        toUserId,
      listingId:     purchase.listingId,
      subscriptionId:undefined,
      paidAmount:    purchase.paidAmount,
      serviceFee:    purchase.serviceFee,
      vatAmount:     purchase.vatAmount,
      qrCode:        newQrCode,
      qrExpiresAt:   purchase.qrExpiresAt,  // orijinal süre korunur
      isTransferred: false,
      transferredFrom: purchaseId,
      menuCategory:  purchase.menuCategory,
      status:        'ACTIVE',
      xpEarned:      0,
    }]);

    // Orijinal kaydı TRANSFERRED olarak işaretle
    await this.purchaseModel.updateOne(
      { id: purchaseId },
      {
        $set: {
          status:       'TRANSFERRED',
          isTransferred: true,
          transferredTo: toUserId,
          transferredAt: new Date(),
        },
      },
    );

    this.logger.log('Menü devredildi', { fromUserId, toUserId, purchaseId, newId });

    return {
      success: true,
      data: {
        newPurchaseId: newId,
        newQrCode,
        message: 'Menü başarıyla devredildi',
      },
    };
  }
}

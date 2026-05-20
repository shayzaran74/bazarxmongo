// apps/backend/src/modules/garage-sale/application/commands/purchase-from-garage-sale.handler.ts
// Master Plan v4.3 §4.3 + §4.4 — Garaj Günü siparişi.
// Atomic stok kontrolü: $inc + maxTotalQty ile race condition önlenir.
// Smart Cap (%25) + dealer başına limit ayrıca kontrol edilir.
// Tüm para hesapları Money/Decimal128 — float yasak.

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IGarageSale, IGarageSalePurchase, IVendor } from '@barterborsa/shared-persistence';
import { Money } from '@barterborsa/shared-core';
import { PurchaseFromGarageSaleCommand } from './purchase-from-garage-sale.command';
import { SmartCapService } from '../services/smart-cap.service';

@CommandHandler(PurchaseFromGarageSaleCommand)
export class PurchaseFromGarageSaleHandler implements ICommandHandler<PurchaseFromGarageSaleCommand> {
  private readonly logger = new Logger(PurchaseFromGarageSaleHandler.name);

  constructor(
    @InjectModel('GarageSale')          private readonly gsModel: Model<IGarageSale>,
    @InjectModel('GarageSalePurchase')  private readonly purchaseModel: Model<IGarageSalePurchase>,
    @InjectModel('Vendor')              private readonly vendorModel: Model<IVendor>,
    private readonly smartCap: SmartCapService,
  ) {}

  async execute(command: PurchaseFromGarageSaleCommand): Promise<{ purchaseId: string; totalPrice: string }> {
    const { userId, garageSaleId, quantity } = command;

    if (quantity <= 0) {
      throw new BadRequestException({ code: 'INVALID_QUANTITY', message: 'Adet 1 veya daha fazla olmalı.' });
    }

    const dealer = await this.vendorModel.findOne({ userId }).lean();
    if (!dealer) throw new NotFoundException('Bayi (Vendor) profili bulunamadı');

    const gs = await this.gsModel.findOne({ id: garageSaleId }).lean();
    if (!gs) throw new NotFoundException('Garaj Günü bulunamadı');

    const now = new Date();
    if (gs.status !== 'ACTIVE' || gs.startsAt > now || gs.endsAt <= now) {
      throw new BadRequestException({
        code: 'GARAGE_SALE_NOT_ACTIVE',
        message: 'Garaj Günü şu anda aktif değil.',
      });
    }

    // Master Plan §4.3 — Smart Cap (%25 havuz payı) maxTotalQty üzerinden uygulanır.
    this.smartCap.validateSmartCap(quantity, gs.maxTotalQty);

    // Bayi başına limit (Watchover'dan bağımsız) — mevcut siparişler + yeni siparişi topla.
    const dealerPriorAgg = await this.purchaseModel.aggregate<{ total: number }>([
      { $match: { garageSaleId, dealerId: dealer.id } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    const priorQty = dealerPriorAgg[0]?.total ?? 0;
    if (priorQty + quantity > gs.maxQtyPerDealer) {
      throw new BadRequestException({
        code: 'GARAGE_SALE_DEALER_LIMIT_EXCEEDED',
        message: `Bayi başına limit aşıldı (limit: ${gs.maxQtyPerDealer}, mevcut: ${priorQty}, yeni: ${quantity}).`,
      });
    }

    // Atomic stok kontrolü — $inc soldQty AND soldQty + quantity <= maxTotalQty.
    // $expr ile şart, $inc ile artırma tek bir atomic operasyonda.
    const updated = await this.gsModel.findOneAndUpdate(
      {
        id: garageSaleId,
        status: 'ACTIVE',
        $expr: { $lte: [{ $add: ['$soldQty', quantity] }, '$maxTotalQty'] },
      },
      { $inc: { soldQty: quantity } },
      { new: true },
    ).lean();

    if (!updated) {
      throw new BadRequestException({
        code: 'GARAGE_SALE_STOCK_EXHAUSTED',
        message: 'Garaj Günü stoğu yetersiz veya kampanya kapandı.',
      });
    }

    // Stok tükendiyse status'u atomic olarak EXHAUSTED'a çek
    if (updated.soldQty >= updated.maxTotalQty) {
      await this.gsModel.updateOne(
        { id: garageSaleId, status: 'ACTIVE' },
        { $set: { status: 'EXHAUSTED', closedAt: new Date(), closedReason: 'STOCK_EXHAUSTED' } },
      );
    }

    // Para hesabı — Money/Decimal128 ile, asla float ile değil.
    const unitPrice = Money.from(updated.discountedPrice);
    const totalPrice = unitPrice.multiply(quantity);

    const purchaseId = new Types.ObjectId().toString();
    await this.purchaseModel.create({
      _id: purchaseId,
      id: purchaseId,
      garageSaleId,
      dealerId: dealer.id,
      quantity,
      unitPrice: unitPrice.toDecimal128(),
      totalPrice: totalPrice.toDecimal128(),
    });

    this.logger.log('Garaj Günü siparişi tamamlandı', {
      garageSaleId, dealerId: dealer.id, quantity, total: totalPrice.toFixed(2),
    });

    return { purchaseId, totalPrice: totalPrice.toFixed(2) };
  }
}

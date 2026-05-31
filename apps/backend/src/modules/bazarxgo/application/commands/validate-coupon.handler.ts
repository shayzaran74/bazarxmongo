// apps/backend/src/modules/bazarxgo/application/commands/validate-coupon.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { ValidateGoCouponCommand } from './validate-coupon.command';
import { IGoCouponRepository } from '../../domain/repositories/go-coupon.repository.interface';
import { DomainException } from '@barterborsa/shared-core';
import { GoCouponTypeValue } from '@barterborsa/shared-persistence';

@CommandHandler(ValidateGoCouponCommand)
export class ValidateGoCouponHandler implements ICommandHandler<ValidateGoCouponCommand> {
  constructor(
    @Inject('IGoCouponRepository') private readonly couponRepo: IGoCouponRepository,
  ) {}

  async execute(command: ValidateGoCouponCommand): Promise<{ valid: boolean; discountAmount: string; message: string }> {
    const coupon = await this.couponRepo.findByCode(command.code.toUpperCase());
    if (!coupon || !coupon.isActive) {
      throw new DomainException('Geçersiz veya süresi dolmuş kupon');
    }
    if (coupon.usageLimit !== undefined && (coupon.usageCount ?? 0) >= coupon.usageLimit) {
      throw new DomainException('Bu kuponun kullanım limiti dolmuş');
    }

    const orderAmt = new Decimal(command.orderAmount);
    const minOrder = coupon.minOrderAmount
      ? new Decimal(coupon.minOrderAmount.toString())
      : new Decimal(0);

    if (orderAmt.lt(minOrder)) {
      throw new DomainException(`Bu kupon için minimum sipariş tutarı ${minOrder.toFixed(2)} ₺`);
    }

    const type = coupon.type as GoCouponTypeValue;
    const value = new Decimal(coupon.value.toString());
    const maxDiscount = new Decimal(coupon.maxDiscount.toString());

    let discountAmount = new Decimal(0);
    if (type === 'percent') {
      const raw = orderAmt.times(value).dividedBy(100);
      discountAmount = maxDiscount.gt(0) ? Decimal.min(raw, maxDiscount) : raw;
    } else if (type === 'amount') {
      discountAmount = Decimal.min(value, orderAmt);
    } else if (type === 'delivery') {
      discountAmount = new Decimal(0); // Teslimat ücretine göre hesaplanır
    }

    return {
      valid: true,
      discountAmount: discountAmount.toFixed(2),
      message: coupon.label,
    };
  }
}

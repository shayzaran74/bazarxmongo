// apps/backend/src/modules/bazarxgo/application/services/order-pricing.service.ts

import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { IGoRestaurant, IGoCoupon, GoCouponTypeValue } from '@barterborsa/shared-persistence';
import { GoOrderMode } from '../../domain/enums/go-order-mode.enum';

export interface PricingInput {
  items: Array<{ menuItemId: string; qty: number }>;
  restaurant: IGoRestaurant;
  mode: GoOrderMode;
  coupon?: IGoCoupon | null;
}

export interface PricingResult {
  subtotal: Decimal;
  deliveryFee: Decimal;
  discount: Decimal;
  total: Decimal;
  estimatedMinutes: number;
  resolvedItems: Array<{ menuItemId: string; name: string; price: Decimal; qty: number }>;
}

@Injectable()
export class OrderPricingService {
  compute(input: PricingInput): PricingResult {
    const { items, restaurant, mode, coupon } = input;

    // Menü item fiyatlarını restoran verisinden çöz
    const allItems = restaurant.sections.flatMap(s => s.items);
    const resolvedItems = items.map(i => {
      const found = allItems.find(mi => mi.itemId === i.menuItemId);
      if (!found) throw new Error(`Menü item bulunamadı: ${i.menuItemId}`);
      return {
        menuItemId: i.menuItemId,
        name: found.name,
        price: new Decimal(found.price.toString()),
        qty: i.qty,
      };
    });

    const subtotal = resolvedItems.reduce(
      (acc, it) => acc.plus(it.price.times(it.qty)),
      new Decimal(0),
    );

    // Gel-Al siparişlerde teslimat ücreti sıfır
    const rawDeliveryFee = new Decimal(restaurant.deliveryFee.toString());
    const deliveryFee = mode === GoOrderMode.GELAL ? new Decimal(0) : rawDeliveryFee;

    const discount = this.applyDiscount(subtotal, deliveryFee, coupon);
    const total = subtotal.plus(deliveryFee).minus(discount).clampedTo(new Decimal(0), new Decimal(999999));

    const estimatedMinutes = mode === GoOrderMode.GELAL
      ? restaurant.etaMin
      : restaurant.etaMax;

    return { subtotal, deliveryFee, discount, total, estimatedMinutes, resolvedItems };
  }

  private applyDiscount(
    subtotal: Decimal,
    deliveryFee: Decimal,
    coupon: IGoCoupon | null | undefined,
  ): Decimal {
    if (!coupon) return new Decimal(0);

    const type = coupon.type as GoCouponTypeValue;
    const value = new Decimal(coupon.value.toString());
    const maxDiscount = new Decimal(coupon.maxDiscount.toString());

    if (type === 'percent') {
      const raw = subtotal.times(value).dividedBy(100);
      return maxDiscount.gt(0) ? Decimal.min(raw, maxDiscount) : raw;
    }
    if (type === 'amount') {
      return Decimal.min(value, subtotal);
    }
    if (type === 'delivery') {
      // Teslimat ücretini bedava yap
      return deliveryFee;
    }
    return new Decimal(0);
  }
}

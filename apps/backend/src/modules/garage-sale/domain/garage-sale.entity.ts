// apps/backend/src/modules/garage-sale/domain/garage-sale.entity.ts
// Master Plan v4.3 §4.4 — Garaj Günü (Flash Sale) domain entity.
// Para hesapları Money API (Decimal128) ile yapılır — float YASAKTIR.

import { Money } from '@barterborsa/shared-core';
import { GarageSaleStatusType } from '@barterborsa/shared-persistence';

export interface GarageSaleProps {
  factoryId: string;
  ecosystemId: string;
  listingId: string;
  discountRate: number;        // 0 < r < 1 (örn: 0.30 = %30)
  maxTotalQty: number;
  soldQty: number;
  maxQtyPerDealer: number;
  startsAt: Date;
  endsAt: Date;
  status: GarageSaleStatusType;
  normalPrice: Money;
  discountedPrice: Money;
  closedAt?: Date;
  closedReason?: 'STOCK_EXHAUSTED' | 'TIME_EXPIRED' | 'MANUAL_CANCEL';
}

export class GarageSale {
  private constructor(public readonly id: string, public readonly props: GarageSaleProps) {}

  /**
   * Yeni Garaj Günü oluştur. Indirim fiyatı Money API ile hesaplanır:
   *   discountedPrice = normalPrice × (1 − discountRate)
   * Float yasak — financial-services-expert kuralı.
   */
  static create(params: {
    id: string;
    factoryId: string;
    ecosystemId: string;
    listingId: string;
    normalPrice: Money;
    discountRate: number;
    maxTotalQty: number;
    maxQtyPerDealer: number;
    startsAt: Date;
    endsAt: Date;
  }): GarageSale {
    if (!Number.isFinite(params.discountRate) || params.discountRate <= 0 || params.discountRate >= 1) {
      throw new Error('GARAGE_SALE_DISCOUNT_RATE_OUT_OF_RANGE');
    }
    if (params.startsAt >= params.endsAt) {
      throw new Error('GARAGE_SALE_STARTS_AT_MUST_BE_BEFORE_ENDS_AT');
    }
    if (params.maxTotalQty < 1) {
      throw new Error('GARAGE_SALE_MAX_TOTAL_QTY_INVALID');
    }
    if (params.maxQtyPerDealer < 1 || params.maxQtyPerDealer > params.maxTotalQty) {
      throw new Error('GARAGE_SALE_MAX_QTY_PER_DEALER_INVALID');
    }

    // discountedPrice = normalPrice * (1 - discountRate)
    const discountFactor = 1 - params.discountRate;
    const discountedPrice = params.normalPrice.multiply(discountFactor);

    const now = new Date();
    const isActive = params.startsAt <= now && params.endsAt > now;

    return new GarageSale(params.id, {
      factoryId: params.factoryId,
      ecosystemId: params.ecosystemId,
      listingId: params.listingId,
      discountRate: params.discountRate,
      maxTotalQty: params.maxTotalQty,
      soldQty: 0,
      maxQtyPerDealer: params.maxQtyPerDealer,
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      status: isActive ? 'ACTIVE' : 'SCHEDULED',
      normalPrice: params.normalPrice,
      discountedPrice,
    });
  }

  isPurchasable(now: Date = new Date()): boolean {
    return (
      this.props.status === 'ACTIVE' &&
      this.props.startsAt <= now &&
      this.props.endsAt > now &&
      this.props.soldQty < this.props.maxTotalQty
    );
  }

  remainingStock(): number {
    return this.props.maxTotalQty - this.props.soldQty;
  }
}

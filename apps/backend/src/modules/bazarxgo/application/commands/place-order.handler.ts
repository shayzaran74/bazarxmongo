// apps/backend/src/modules/bazarxgo/application/commands/place-order.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { Decimal } from 'decimal.js';
import { IGoCoupon } from '@barterborsa/shared-persistence';
import { PlaceGoOrderCommand } from './place-order.command';
import { IGoRestaurantRepository } from '../../domain/repositories/go-restaurant.repository.interface';
import { IGoCouponRepository } from '../../domain/repositories/go-coupon.repository.interface';
import { IGoOrderRepository } from '../../domain/repositories/go-order.repository.interface';
import { OrderPricingService } from '../services/order-pricing.service';
import { GoCommissionService } from '../services/go-commission.service';
import { GoOrder } from '../../domain/entities/go-order.entity';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(PlaceGoOrderCommand)
export class PlaceGoOrderHandler implements ICommandHandler<PlaceGoOrderCommand> {
  constructor(
    @Inject('IGoRestaurantRepository') private readonly restaurantRepo: IGoRestaurantRepository,
    @Inject('IGoCouponRepository') private readonly couponRepo: IGoCouponRepository,
    @Inject('IGoOrderRepository') private readonly orderRepo: IGoOrderRepository,
    private readonly pricing: OrderPricingService,
    private readonly goCommission: GoCommissionService,
    private readonly financial: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: PlaceGoOrderCommand): Promise<{ success: boolean; data: unknown }> {
    const restaurant = await this.restaurantRepo.findById(command.restaurantId);
    if (!restaurant || !restaurant.isActive) {
      throw new DomainException('Restoran bulunamadı veya aktif değil');
    }

    // Kupon çözümleme + doğrulama (validate-coupon ile aynı kurallar — bypass kapatıldı)
    let coupon: IGoCoupon | null = null;
    if (command.couponCode) {
      coupon = await this.couponRepo.findByCode(command.couponCode.toUpperCase());
      if (!coupon || !coupon.isActive) {
        throw new DomainException('Geçersiz veya süresi dolmuş kupon');
      }
      if (coupon.usageLimit !== undefined && (coupon.usageCount ?? 0) >= coupon.usageLimit) {
        throw new DomainException('Bu kuponun kullanım limiti dolmuş');
      }
    }

    // Fiyatlandırma
    const pricing = this.pricing.compute({
      items: command.items,
      restaurant,
      mode: command.mode,
      coupon,
    });

    // Kupona özel minimum sepet kuralı
    if (coupon?.minOrderAmount) {
      const couponMin = new Decimal(coupon.minOrderAmount.toString());
      if (pricing.subtotal.lt(couponMin)) {
        throw new DomainException(`Bu kupon için minimum sipariş tutarı ${couponMin.toFixed(2)} ₺`);
      }
    }

    // Restoran minimum sepet kontrolü
    const minOrder = Number(restaurant.minOrder.toString());
    if (pricing.subtotal.lt(minOrder)) {
      throw new DomainException(`Minimum sepet tutarı ${minOrder} ₺`);
    }

    // Ödeme: financial-gateway holdFunds — sellerId=PLATFORM ile capture edilebilir blokaj.
    // (GoRestaurant'ta payout hesabı yok; tahsilat platform hesabına yapılır, restoran ödemesi
    // platform tarafından harici yürütülür.)
    const id = randomUUID();
    const idempotencyKey = `go-order-${id}`;
    // Seçenek B: tahsilat PLATFORM hesabına yapılır; restoran hakedişi batch payout ile aktarılır.
    const platformAccountId = process.env.BAZARXGO_PLATFORM_ACCOUNT_ID ?? '';
    let holdId: string | undefined;

    try {
      const holdResult = await this.financial.holdFunds(
        command.userId,
        pricing.total.toFixed(2),
        'GO_ORDER',
        id,
        'GO_ORDER',
        idempotencyKey,
        platformAccountId,
      ) as { holdId: string };
      holdId = holdResult.holdId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ödeme alınamadı';
      throw new DomainException(msg);
    }

    // Domain entity oluştur
    const order = GoOrder.create(
      command.userId,
      command.restaurantId,
      restaurant.name,
      pricing.resolvedItems.map(i => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price.toNumber(),
        qty: i.qty,
      })),
      command.mode,
      pricing.subtotal.toNumber(),
      pricing.deliveryFee.toNumber(),
      pricing.discount.toNumber(),
      pricing.total.toNumber(),
      pricing.estimatedMinutes,
      command.addressLine,
      command.couponCode,
    );

    // Restoran hakediş ayrımı — place-order'da hesaplanır; teslimatta payoutStatus=PENDING olur
    const { restaurantPayoutAmount } = this.goCommission.compute(pricing.subtotal, restaurant);
    const platformFeeAmount = pricing.total.sub(restaurantPayoutAmount);

    // DB kaydı
    const saved = await this.orderRepo.create({
      id,
      userId: order.getProps().userId,
      restaurantId: order.getProps().restaurantId,
      restaurantName: order.getProps().restaurantName,
      items: order.getProps().items.map(i => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: Types.Decimal128.fromString(String(i.price)),
        qty: i.qty,
      })),
      mode: order.getProps().mode,
      subtotal: Types.Decimal128.fromString(pricing.subtotal.toFixed(2)),
      deliveryFee: Types.Decimal128.fromString(pricing.deliveryFee.toFixed(2)),
      discount: Types.Decimal128.fromString(pricing.discount.toFixed(2)),
      total: Types.Decimal128.fromString(pricing.total.toFixed(2)),
      couponCode: order.getProps().couponCode,
      status: order.getProps().status,
      holdId,
      settlementStatus: 'HELD',
      restaurantPayoutAmount: Types.Decimal128.fromString(restaurantPayoutAmount.toFixed(2)),
      platformFeeAmount: Types.Decimal128.fromString(platformFeeAmount.toFixed(2)),
      estimatedMinutes: order.getProps().estimatedMinutes,
      addressLine: order.getProps().addressLine,
    });

    // Kupon kullanım sayacını artır (sipariş başarıyla oluşturuldu)
    if (coupon) {
      await this.couponRepo.incrementUsage(coupon.id);
    }

    await this.auditLog.log({
      actorId: command.userId,
      action: 'GO_ORDER_PLACED',
      resourceType: 'GoOrder',
      resourceId: saved.id,
      newValue: {
        restaurantId: command.restaurantId,
        total: pricing.total.toFixed(2),
        mode: command.mode,
        holdId,
      },
    });

    return { success: true, data: this.toDto(saved) };
  }

  private toDto(order: { id: string; status: string; total: { toString(): string }; estimatedMinutes: number }): unknown {
    return {
      id: order.id,
      status: order.status,
      total: order.total.toString(),
      estimatedMinutes: order.estimatedMinutes,
    };
  }
}

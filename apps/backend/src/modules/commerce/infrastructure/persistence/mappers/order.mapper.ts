// apps/backend/src/modules/commerce/infrastructure/persistence/mappers/order.mapper.ts
// OrderMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { IOrder } from '@barterborsa/shared-persistence/schemas/backend/order.schema';
import { IOrderItem } from '@barterborsa/shared-persistence/schemas/backend/order-item.schema';
import { Order, OrderProps } from '../../../domain/entities/order.entity';
import * as mongoose from 'mongoose';
import { OrderItem } from '../../../domain/entities/order-item.entity';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { DeliveryType } from '../../../domain/enums/delivery-type.enum';
import { OrderNumber } from '../../../domain/value-objects/order-number.vo';
import { ShippingAddress, ShippingAddressProps } from '../../../domain/value-objects/shipping-address.vo';
import { OrderTotal } from '../../../domain/value-objects/order-total.vo';

// Mongoose Decimal128 veya ham number değerini güvenli şekilde number'a çevirir
function decimalToNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'object' && '$numberDecimal' in (val as Record<string, unknown>)) {
    return Number((val as { $numberDecimal: string }).$numberDecimal);
  }
  return Number(val);
}

interface OrderItemResponse {
  listingId: string;
  productImage?: string;
  productImages?: string[];
}

interface PopulatableOrder {
  items?: OrderItemResponse[];
  orderItems?: OrderItemResponse[];
}

export interface OrderDocument extends IOrder {
  _id?: string;
}

export class OrderMapper {
  public static toDomain(doc: OrderDocument): Order {
    const items: OrderItem[] = (doc.items || []).map((item: IOrderItem) => {
      const price = decimalToNumber(item.price);
      const totalAmount = decimalToNumber(item.totalAmount);

      return OrderItem.fromPersistence(
        {
          orderId: doc.id,
          listingId: item.listingId,
          quantity: item.quantity,
          price,
          totalAmount,
          productName: item.productName,
          productImages: item.productImages || [],
          variantInfo: item.variantInfo,
        },
        (item as { id?: string }).id ?? `item-${item.listingId}`,
      );
    });

    const shippingAddressResult = ShippingAddress.fromJson(doc.shippingAddress as unknown as ShippingAddressProps);
    const billingAddressResult = doc.billingAddress
      ? ShippingAddress.fromJson(doc.billingAddress as unknown as ShippingAddressProps)
      : ShippingAddress.fromJson(doc.shippingAddress as unknown as ShippingAddressProps);

    const totalAmount = decimalToNumber(doc.totalAmount);
    const shippingCost = decimalToNumber(doc.shippingCost);
    const discountAmount = decimalToNumber(doc.discountAmount);
    const paidWithXP = decimalToNumber(doc.paidWithXP);
    const paidWithCash = decimalToNumber(doc.paidWithCash);

    const props: OrderProps = {
      userId: doc.userId,
      vendorId: doc.vendorId,
      status: doc.status as OrderStatus,
      orderNumber: OrderNumber.fromValue(doc.orderNumber || ''),
      shippingAddress: shippingAddressResult,
      billingAddress: billingAddressResult,
      totalAmount,
      paymentMethod: doc.paymentMethod,
      paymentStatus: doc.paymentStatus,
      vendorStatus: 'PENDING',
      buyerStatus: 'PENDING',
      currency: doc.currency || 'TRY',
      discountAmount,
      shippingCost,
      paidWithXP,
      paidWithCash,
      paidAt: doc.paidAt || undefined,
      trackingNumber: doc.trackingNumber || undefined,
      shippingCarrier: doc.shippingCarrier || undefined,
      estimatedDelivery: doc.estimatedDelivery || undefined,
      escrowStatus: doc.escrowStatus || undefined,
      escrowReleaseAt: doc.escrowReleaseAt || undefined,
      payoutEligibleAt: doc.payoutEligibleAt || undefined,
      metadata: doc.metadata as Record<string, unknown> | undefined,
      couponCode: doc.couponCode || undefined,
      expiresAt: doc.expiresAt || undefined,
      deliveryType: doc.deliveryType as DeliveryType,
      items,
    };

    const domainOrder = Order.fromPersistence(props, doc.id);
    // persistence'dan yeniden oluşturulurken DB'deki gerçek zaman damgaları geri yüklenir
    const mutableTimestamps = domainOrder as unknown as { _createdAt: Date; _updatedAt: Date };
    if (doc.createdAt) mutableTimestamps._createdAt = new Date(doc.createdAt);
    if (doc.updatedAt) mutableTimestamps._updatedAt = new Date(doc.updatedAt);
    return domainOrder;
  }

  public static toResponse(domain: Order): Record<string, unknown> {
    const props = domain.getProps();
    const items = (props.items || []).map(item => {
      const itemProps = item.getProps();
      return {
        id: item.id,
        orderId: domain.id,
        listingId: itemProps.listingId,
        quantity: itemProps.quantity,
        price: itemProps.price,
        totalAmount: itemProps.totalAmount,
        productName: itemProps.productName,
        productImages: itemProps.productImages || [],
        productImage: itemProps.productImages?.[0] || '',
        variantInfo: itemProps.variantInfo,
      };
    });

    return {
      id: domain.id,
      orderNumber: domain.orderNumber,
      userId: props.userId,
      vendorId: props.vendorId,
      status: props.status,
      totalAmount: props.totalAmount,
      total: props.totalAmount,
      paymentMethod: props.paymentMethod,
      paymentStatus: props.paymentStatus,
      vendorStatus: props.vendorStatus,
      buyerStatus: props.buyerStatus,
      currency: props.currency,
      discountAmount: props.discountAmount,
      shippingCost: props.shippingCost,
      paidWithXP: props.paidWithXP,
      paidWithCash: props.paidWithCash,
      deliveryType: props.deliveryType,
      paidAt: props.paidAt,
      trackingNumber: props.trackingNumber,
      shippingCarrier: props.shippingCarrier,
      estimatedDelivery: props.estimatedDelivery,
      escrowStatus: props.escrowStatus,
      escrowReleaseAt: props.escrowReleaseAt,
      payoutEligibleAt: props.payoutEligibleAt,
      metadata: props.metadata,
      couponCode: props.couponCode,
      expiresAt: props.expiresAt,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      items,
      orderItems: items,
    };
  }

  public static toPersistence(domain: Order): Record<string, unknown> {
    const props = domain.getProps();
    const result: Record<string, unknown> = {
      _id: domain.id,
      id: domain.id,
      userId: props.userId,
      vendorId: props.vendorId,
      status: props.status,
      orderNumber: props.orderNumber.value,
      shippingAddress: props.shippingAddress.toJson(),
      billingAddress: props.billingAddress.toJson(),
      totalAmount: props.totalAmount,
      paymentMethod: props.paymentMethod,
      paymentStatus: props.paymentStatus,
      vendorStatus: props.vendorStatus,
      buyerStatus: props.buyerStatus,
      currency: props.currency,
      discountAmount: props.discountAmount,
      shippingCost: props.shippingCost,
      paidWithXP: props.paidWithXP,
      paidWithCash: props.paidWithCash,
      paidAt: props.paidAt,
      trackingNumber: props.trackingNumber,
      shippingCarrier: props.shippingCarrier,
      estimatedDelivery: props.estimatedDelivery,
      escrowStatus: props.escrowStatus,
      escrowReleaseAt: props.escrowReleaseAt,
      payoutEligibleAt: props.payoutEligibleAt,
      metadata: props.metadata,
      couponCode: props.couponCode,
      expiresAt: props.expiresAt,
      deliveryType: props.deliveryType,
      items: props.items?.map(item => {
        const itemProps = item.getProps();
        return {
          id: item.id,
          listingId: itemProps.listingId,
          quantity: itemProps.quantity,
          price: itemProps.price,
          totalAmount: itemProps.totalAmount,
          productName: itemProps.productName,
          productImages: itemProps.productImages,
          variantInfo: itemProps.variantInfo,
        };
      }),
    };
    // BazarX Köprüsü — Sprint 3
    if (props.isEcosystemOrder) {
      result.isEcosystemOrder = props.isEcosystemOrder;
      result.ecosystemId = props.ecosystemId;
      if (props.platformCommissionRate !== undefined) {
        result.platformCommissionRate = props.platformCommissionRate;
      }
      if (props.platformCommissionAmount !== undefined) {
        result.platformCommissionAmount = props.platformCommissionAmount;
      }
    }
    // GO Sipariş — Düzeltme 7/8
    if (props.isGoOrder) {
      result.isGoOrder = props.isGoOrder;
      if (props.goOrderMode) result.goOrderMode = props.goOrderMode;
    }
    return result;
  }

  public static async populateImages<T extends PopulatableOrder | PopulatableOrder[]>(response: T): Promise<T> {
    if (!response) return response;
    const isArray = Array.isArray(response);
    const orders: PopulatableOrder[] = isArray ? (response as PopulatableOrder[]) : [response as PopulatableOrder];

    for (const order of orders) {
      if (!order) continue;
      const items: OrderItemResponse[] = order.items || order.orderItems || [];
      for (const item of items) {
        if (!item.productImage || !item.productImages || item.productImages.length === 0) {
          try {
            let db: mongoose.mongo.Db | null = null;
            for (const conn of mongoose.connections) {
              if (conn.readyState === 1 && conn.db) {
                db = conn.db;
                break;
              }
            }
            if (db) {
              const listingDoc = await db.collection('listings').findOne({ id: item.listingId });
              if (listingDoc) {
                const mediaDoc = await db.collection('product_media').findOne({ productId: listingDoc.catalogProductId });
                if (mediaDoc && mediaDoc.url) {
                  item.productImage = mediaDoc.url;
                  item.productImages = [mediaDoc.url];
                }
              }
            }
          } catch (e: unknown) {
            // ignore
          }
        }
      }
      // Keep in sync
      if (order.items) {
        order.orderItems = order.items;
      }
    }
    return response;
  }
}
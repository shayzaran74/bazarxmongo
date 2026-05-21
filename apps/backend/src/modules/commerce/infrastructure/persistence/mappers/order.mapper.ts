// apps/backend/src/modules/commerce/infrastructure/persistence/mappers/order.mapper.ts
// OrderMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { IOrder } from '@barterborsa/shared-persistence/schemas/backend/order.schema';
import { Order, OrderProps } from '../../../domain/entities/order.entity';
import * as mongoose from 'mongoose';
import { OrderItem } from '../../../domain/entities/order-item.entity';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { DeliveryType } from '../../../domain/enums/delivery-type.enum';
import { OrderNumber } from '../../../domain/value-objects/order-number.vo';
import { ShippingAddress } from '../../../domain/value-objects/shipping-address.vo';
import { OrderTotal } from '../../../domain/value-objects/order-total.vo';

export interface OrderDocument extends IOrder {
  _id?: string;
}

export class OrderMapper {
  public static toDomain(doc: OrderDocument): Order {
    const items: OrderItem[] = (doc.items || []).map((item: any) => {
      const price = item.price
        ? typeof item.price === 'object' && '$numberDecimal' in item.price
          ? Number(item.price.$numberDecimal)
          : Number(item.price)
        : 0;

      const totalAmount = item.totalAmount
        ? typeof item.totalAmount === 'object' && '$numberDecimal' in item.totalAmount
          ? Number(item.totalAmount.$numberDecimal)
          : Number(item.totalAmount)
        : 0;

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
        item.id || `item-${item.listingId}`
      );
    });

    const shippingAddressResult = ShippingAddress.fromJson(doc.shippingAddress);
    const billingAddressResult = doc.billingAddress
      ? ShippingAddress.fromJson(doc.billingAddress)
      : ShippingAddress.fromJson(doc.shippingAddress);

    const totalAmount = doc.totalAmount
      ? typeof doc.totalAmount === 'object' && '$numberDecimal' in doc.totalAmount
        ? Number((doc.totalAmount as any).$numberDecimal)
        : Number(doc.totalAmount)
      : 0;

    const shippingCost = doc.shippingCost
      ? typeof doc.shippingCost === 'object' && '$numberDecimal' in doc.shippingCost
        ? Number((doc.shippingCost as any).$numberDecimal)
        : Number(doc.shippingCost)
      : 0;

    const discountAmount = doc.discountAmount
      ? typeof doc.discountAmount === 'object' && '$numberDecimal' in doc.discountAmount
        ? Number((doc.discountAmount as any).$numberDecimal)
        : Number(doc.discountAmount)
      : 0;

    const paidWithXP = doc.paidWithXP
      ? typeof doc.paidWithXP === 'object' && '$numberDecimal' in doc.paidWithXP
        ? Number((doc.paidWithXP as any).$numberDecimal)
        : Number(doc.paidWithXP)
      : 0;

    const paidWithCash = doc.paidWithCash
      ? typeof doc.paidWithCash === 'object' && '$numberDecimal' in doc.paidWithCash
        ? Number((doc.paidWithCash as any).$numberDecimal)
        : Number(doc.paidWithCash)
      : 0;

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
    if (doc.createdAt) {
      (domainOrder as any)._createdAt = new Date(doc.createdAt);
    }
    if (doc.updatedAt) {
      (domainOrder as any)._updatedAt = new Date(doc.updatedAt);
    }
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
    return {
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
  }

  public static async populateImages(response: any): Promise<any> {
    if (!response) return response;
    const isArray = Array.isArray(response);
    const orders = isArray ? response : [response];

    for (const order of orders) {
      if (!order) continue;
      const items = order.items || order.orderItems || [];
      for (const item of items) {
        if (!item.productImage || !item.productImages || item.productImages.length === 0) {
          try {
            let db: any = null;
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
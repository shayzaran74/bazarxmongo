import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Prisma } from '@prisma/client';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order, OrderProps } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderNumber } from '../../domain/value-objects/order-number.vo';
import { ShippingAddress } from '../../domain/value-objects/shipping-address.vo';
import { OrderStatus } from '../../domain/enums/order-status.enum';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- Mapper ---
  private toDomain(record: any): Order {
    const items = (record.orderItems || []).map((oi: any) =>
      OrderItem.fromPersistence(
        {
          orderId: record.id,
          listingId: oi.listingId,
          quantity: oi.quantity,
          price: oi.price,
          totalAmount: oi.totalAmount,
          productName: oi.productName,
          productImages: oi.productImages || [],
          variantInfo: oi.variantInfo,
        },
        oi.id
      )
    );

    const props: OrderProps = {
      userId: record.userId,
      vendorId: record.vendorId,
      status: record.status as OrderStatus,
      orderNumber: OrderNumber.fromValue(record.orderNumber || ''),
      shippingAddress: ShippingAddress.fromJson(record.shippingAddress),
      billingAddress: record.billingAddress 
        ? ShippingAddress.fromJson(record.billingAddress) 
        : ShippingAddress.fromJson(record.shippingAddress),
      totalAmount: record.totalAmount,
      paymentMethod: record.paymentMethod,
      paymentStatus: record.paymentStatus,
      // NOTE: vendorStatus/buyerStatus schema'da eksik, şimdilik statik 'PENDING'
      vendorStatus: 'PENDING', 
      buyerStatus: 'PENDING',
      currency: record.currency || 'TRY',
      discountAmount: record.discountAmount || new Prisma.Decimal(0),
      shippingCost: record.shippingCost || new Prisma.Decimal(0),
      paidWithXP: record.paidWithXP || new Prisma.Decimal(0),
      paidWithCash: record.paidWithCash || new Prisma.Decimal(0),
      paidAt: record.paidAt || undefined,
      trackingNumber: record.trackingNumber || undefined,
      shippingCarrier: record.shippingCarrier || undefined,
      estimatedDelivery: record.estimatedDelivery || undefined,
      escrowStatus: record.escrowStatus || undefined,
      escrowReleaseAt: record.escrowReleaseAt || undefined,
      payoutEligibleAt: record.payoutEligibleAt || undefined,
      metadata: record.metadata || undefined,
      couponCode: record.couponCode || undefined,
      items,
    };

    return Order.fromPersistence(props, record.id);
  }

  async findById(id: string): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true }
    });
    return record ? this.toDomain(record) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { orderItems: true }
    });
    return record ? this.toDomain(record) : null;
  }

  async findByUserId(
    userId: string,
    pagination: { page?: number; limit?: number; status?: string } = {}
  ): Promise<{ items: Order[]; total: number }> {
    const { page = 1, limit = 20, status } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { userId };
    if (status) where.status = status as any;

    const [records, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { orderItems: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.order.count({ where })
    ]);

    return { items: records.map(r => this.toDomain(r)), total };
  }

  async findByVendorId(
    vendorId: string,
    pagination: { page?: number; limit?: number; status?: string } = {}
  ): Promise<{ items: Order[]; total: number }> {
    const { page = 1, limit = 20, status } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { vendorId };
    if (status) where.status = status as any;

    const [records, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { orderItems: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.order.count({ where })
    ]);

    return { items: records.map(r => this.toDomain(r)), total };
  }

  async save(order: Order): Promise<void> {
    const props = order.getProps();
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: props.status as any,
        paymentStatus: props.paymentStatus as any,
        // vendorStatus/buyerStatus schema'da yok, update edilmeyecek
        paidAt: props.paidAt,
        trackingNumber: props.trackingNumber,
        shippingCarrier: props.shippingCarrier,
        estimatedDelivery: props.estimatedDelivery,
        escrowStatus: props.escrowStatus,
        escrowReleaseAt: props.escrowReleaseAt,
        payoutEligibleAt: props.payoutEligibleAt,
        metadata: props.metadata as any,
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
  }

  async findAll(): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      include: { orderItems: true }
    });
    return records.map(r => this.toDomain(r));
  }
}

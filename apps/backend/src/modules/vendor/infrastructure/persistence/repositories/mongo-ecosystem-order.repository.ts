// apps/backend/src/modules/vendor/infrastructure/persistence/repositories/mongo-ecosystem-order.repository.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, ClientSession, Connection } from 'mongoose';
import { IEcosystemOrderRepository, CreateEcosystemOrderDto } from '../../../domain/repositories/i-ecosystem-order.repository';
import { EcosystemOrder, IEcosystemOrder } from '../schemas/ecosystemOrder.schema';

@Injectable()
export class MongoEcosystemOrderRepository implements IEcosystemOrderRepository {
  private readonly logger = new Logger(MongoEcosystemOrderRepository.name);

  constructor(
    @InjectModel('EcosystemOrder')
    private readonly orderModel: Model<IEcosystemOrder>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(
    data: CreateEcosystemOrderDto,
    options?: { session?: ClientSession },
  ): Promise<{ id: string; dealerId: string; ecosystemId: string; orderId: string; status: string }> {
    const doc = await this.orderModel.create(
      {
        _id: new Types.ObjectId().toString(),
        dealerId: data.dealerId,
        ecosystemId: data.ecosystemId,
        productId: data.productId,
        orderId: data.orderId,
        quantity: data.quantity,
        unitPrice: Types.Decimal128.fromString(data.unitPrice),
        isGarageSale: data.isGarageSale,
        garageSaleId: data.garageSaleId,
        status: data.status,
        ...(options?.session ? { session: options.session } : {}),
      },
    );

    const result = doc as unknown as { _id?: string; id: string; dealerId: string; ecosystemId: string; orderId: string; status: string };
    return {
      id: result._id?.toString() || result.id,
      dealerId: result.dealerId,
      ecosystemId: result.ecosystemId,
      orderId: result.orderId,
      status: result.status,
    };
  }

  async sumQuantityByDealerAndProduct(
    dealerId: string,
    productId: string,
    statuses: string[],
    session: ClientSession,
  ): Promise<number> {
    const result = await this.orderModel.aggregate(
      [
        {
          $match: {
            dealerId: dealerId,
            productId: productId,
            status: { $in: statuses },
          },
        },
        { $group: { _id: null, totalQty: { $sum: '$quantity' } } },
      ],
      { session },
    );

    return result[0]?.totalQty ?? 0;
  }

  async findByEcosystemId(
    ecosystemId: string,
    limit?: number,
  ): Promise<Array<{
    id: string; dealerId: string; ecosystemId: string; productId: string;
    orderId: string; quantity: number; status: string;
    isGarageSale: boolean; garageSaleId?: string; createdAt: Date;
  }>> {
    const docs = await this.orderModel
      .find({ ecosystemId: ecosystemId })
      .sort({ createdAt: -1 })
      .limit(limit ?? 100)
      .lean()
      .exec();

    return docs.map(d => ({
      id: d._id?.toString() || '',
      dealerId: d.dealerId,
      ecosystemId: d.ecosystemId,
      productId: d.productId,
      orderId: d.orderId,
      quantity: d.quantity,
      status: d.status,
      isGarageSale: d.isGarageSale,
      garageSaleId: d.garageSaleId,
      createdAt: d.createdAt,
    }));
  }

  async findByDealerId(
    dealerId: string,
    ecosystemId?: string,
  ): Promise<Array<{
    id: string; dealerId: string; ecosystemId: string; productId: string;
    orderId: string; quantity: number; status: string;
    isGarageSale: boolean; garageSaleId?: string; createdAt: Date;
  }>> {
    const filter: Record<string, unknown> = { dealerId: dealerId };
    if (ecosystemId) filter.ecosystemId = ecosystemId;

    const docs = await this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return docs.map(d => ({
      id: d._id?.toString() || '',
      dealerId: d.dealerId,
      ecosystemId: d.ecosystemId,
      productId: d.productId,
      orderId: d.orderId,
      quantity: d.quantity,
      status: d.status,
      isGarageSale: d.isGarageSale,
      garageSaleId: d.garageSaleId,
      createdAt: d.createdAt,
    }));
  }

  async updateStatus(
    orderId: string,
    status: 'CONFIRMED' | 'CANCELLED',
    options?: { session?: ClientSession },
  ): Promise<void> {
    await this.orderModel.updateOne(
      { orderId: orderId },
      { $set: { status } },
      options,
    );
  }

  async findEcosystemById(ecosystemId: string): Promise<{ id: string; internalCommRate: number } | null> {
    // EkosistemOrder'dan ecosystemId ile BrandEcosystem'a join
    const doc = await this.orderModel
      .findOne({ ecosystemId: ecosystemId })
      .select('ecosystemId')
      .lean()
      .exec();

    if (!doc) return null;

    // BrandEcosystem'dan internalCommRate'yi al
    const { BrandEcosystem } = await import('@barterborsa/shared-persistence/schemas/backend/brandEcosystem.schema');
    const eco = await BrandEcosystem.findOne({ id: ecosystemId }).lean();
    if (!eco) return null;

    return {
      id: eco.id,
      internalCommRate: Number(eco.internalCommRate) ?? 4.0,
    };
  }
}
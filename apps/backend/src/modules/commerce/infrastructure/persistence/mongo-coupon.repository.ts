// apps/backend/src/modules/commerce/infrastructure/persistence/mongo-coupon.repository.ts
// Coupon & EscrowCoupon repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ICoupon, IEscrowCoupon } from '@barterborsa/shared-persistence';
import { Coupon as CouponModel } from '@barterborsa/shared-persistence/schemas/backend/coupon.schema';
import { EscrowCoupon as EscrowCouponModel } from '@barterborsa/shared-persistence/schemas/backend/escrowCoupon.schema';
import { ICouponRepository, IEscrowCouponRepository } from '../../domain/repositories/coupon.repository.interface';

@Injectable()
export class MongoCouponRepository implements ICouponRepository {
  private readonly model: Model<ICoupon>;

  constructor() {
    this.model = CouponModel;
  }

  async findByCode(code: string): Promise<any | null> {
    const doc = await this.model.findOne({ code }).exec();
    return doc ? doc.toObject() : null;
  }
}

@Injectable()
export class MongoEscrowCouponRepository implements IEscrowCouponRepository {
  private readonly model: Model<IEscrowCoupon>;

  constructor() {
    this.model = EscrowCouponModel;
  }

  async findByCartId(cartId: string): Promise<any[]> {
    const docs = await this.model.find({ cartId, isActive: true }).sort({ appliedAt: -1 }).exec();
    return docs.map(doc => doc.toObject());
  }

  async findByCartIdAndCode(cartId: string, code: string): Promise<any | null> {
    const doc = await this.model.findOne({ cartId, code, isActive: true }).exec();
    return doc ? doc.toObject() : null;
  }

  async create(data: {
    cartId: string;
    userId: string;
    code: string;
    discount: number;
    percentage?: number;
    minAmount?: number;
    expiresAt?: Date;
  }): Promise<any> {
    const id = 'ec-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = await this.model.create({
      id,
      ...data,
      isActive: true,
      appliedAt: new Date(),
      createdAt: new Date(),
    });
    return doc.toObject();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findById(id: string): Promise<any | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? doc.toObject() : null;
  }
}
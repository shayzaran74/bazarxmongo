// apps/backend/src/modules/vendor/infrastructure/persistence/repositories/mongo-ecosystem-membership.repository.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { IEcosystemMembershipRepository, CreateMembershipDto } from '../../../domain/repositories/i-ecosystem-membership.repository';
import { EcosystemMembership, IEcosystemMembership } from '../schemas/ecosystemMembership.schema';

@Injectable()
export class MongoEcosystemMembershipRepository implements IEcosystemMembershipRepository {
  private readonly logger = new Logger(MongoEcosystemMembershipRepository.name);

  constructor(
    @InjectModel('EcosystemMembership')
    private readonly membershipModel: Model<IEcosystemMembership>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async findActiveByDealerId(dealerId: string): Promise<Array<{ dealerId: string; ecosystemId: string; status: string; joinedAt: Date }>> {
    const docs = await this.membershipModel
      .find({ dealerId: dealerId, status: 'ACTIVE' })
      .lean()
      .exec();
    return docs.map(d => ({
      dealerId: d.dealerId,
      ecosystemId: d.ecosystemId,
      status: d.status,
      joinedAt: d.joinedAt,
    }));
  }

  async findByEcosystemId(ecosystemId: string): Promise<Array<{ dealerId: string; ecosystemId: string; status: string; joinedAt: Date }>> {
    const docs = await this.membershipModel
      .find({ ecosystemId: ecosystemId })
      .lean()
      .exec();
    return docs.map(d => ({
      dealerId: d.dealerId,
      ecosystemId: d.ecosystemId,
      status: d.status,
      joinedAt: d.joinedAt,
    }));
  }

  async findOne(dealerId: string, ecosystemId: string): Promise<{ dealerId: string; ecosystemId: string; status: string; joinedAt: Date } | null> {
    const doc = await this.membershipModel
      .findOne({
        dealerId: dealerId,
        ecosystemId: ecosystemId,
      })
      .lean()
      .exec();
    if (!doc) return null;
    return {
      dealerId: doc.dealerId,
      ecosystemId: doc.ecosystemId,
      status: doc.status,
      joinedAt: doc.joinedAt,
    };
  }

  async countActiveByDealerId(dealerId: string): Promise<number> {
    return this.membershipModel.countDocuments({
      dealerId: dealerId,
      status: 'ACTIVE',
    });
  }

  async create(data: CreateMembershipDto): Promise<{ id: string; dealerId: string; ecosystemId: string; status: string; joinedAt: Date }> {
    const doc = await this.membershipModel.create({
      _id: new Types.ObjectId().toString(),
      dealerId: data.dealerId,
      ecosystemId: data.ecosystemId,
      status: 'ACTIVE',
      joinedAt: new Date(),
      addedByUserId: data.addedByUserId,
    });
    return {
      id: doc._id?.toString() || doc.id,
      dealerId: doc.dealerId,
      ecosystemId: doc.ecosystemId,
      status: doc.status,
      joinedAt: doc.joinedAt,
    };
  }

  async updateStatus(
    dealerId: string,
    ecosystemId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED',
    updatedAt: Date,
  ): Promise<void> {
    const update: Record<string, unknown> = { status, updatedAt };
    if (status === 'SUSPENDED') update.suspendedAt = updatedAt;
    if (status === 'REMOVED') update.removedAt = updatedAt;

    await this.membershipModel.updateOne(
      {
        dealerId: dealerId,
        ecosystemId: ecosystemId,
      },
      { $set: update },
    );
  }

  async delete(dealerId: string, ecosystemId: string): Promise<void> {
    await this.membershipModel.deleteOne({
      dealerId: dealerId,
      ecosystemId: ecosystemId,
    });
  }
}
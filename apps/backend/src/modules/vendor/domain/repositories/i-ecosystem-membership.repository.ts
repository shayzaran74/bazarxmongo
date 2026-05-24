// apps/backend/src/modules/vendor/domain/repositories/i-ecosystem-membership.repository.ts

import { Types } from 'mongoose';

export interface CreateMembershipDto {
  dealerId: string;
  ecosystemId: string;
  addedByUserId: string;
}

export interface IEcosystemMembershipRepository {
  findActiveByDealerId(dealerId: string): Promise<Array<{ dealerId: string; ecosystemId: string; status: string; joinedAt: Date }>>;

  findByEcosystemId(ecosystemId: string): Promise<Array<{ dealerId: string; ecosystemId: string; status: string; joinedAt: Date }>>;

  findOne(dealerId: string, ecosystemId: string): Promise<{ dealerId: string; ecosystemId: string; status: string; joinedAt: Date } | null>;

  countActiveByDealerId(dealerId: string): Promise<number>;

  create(data: CreateMembershipDto): Promise<{ id: string; dealerId: string; ecosystemId: string; status: string; joinedAt: Date }>;

  updateStatus(
    dealerId: string,
    ecosystemId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED',
    updatedAt: Date,
  ): Promise<void>;

  delete(dealerId: string, ecosystemId: string): Promise<void>;
}
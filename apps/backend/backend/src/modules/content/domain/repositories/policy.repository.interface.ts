// apps/backend/src/modules/content/domain/repositories/policy.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Policy } from '../entities/policy.entity';

export interface IPolicyRepository extends IRepository<Policy> {
  findBySlug(slug: string): Promise<Policy | null>;
  findAllActive(): Promise<Policy[]>;
}

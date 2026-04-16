// apps/backend/src/modules/communication/domain/repositories/user-complaint.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { UserComplaint } from '../entities/user-complaint.entity';

export interface IUserComplaintRepository extends IRepository<UserComplaint> {
  findById(id: string): Promise<UserComplaint | null>;
  findAll(options?: { status?: string }): Promise<UserComplaint[]>;
  findByReporterId(userId: string): Promise<UserComplaint[]>;
  save(complaint: UserComplaint): Promise<void>;
}

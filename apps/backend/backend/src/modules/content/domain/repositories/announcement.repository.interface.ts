// apps/backend/src/modules/content/domain/repositories/announcement.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Announcement } from '../entities/announcement.entity';

export interface IAnnouncementRepository extends IRepository<Announcement> {
  findAllActive(): Promise<Announcement[]>;
}

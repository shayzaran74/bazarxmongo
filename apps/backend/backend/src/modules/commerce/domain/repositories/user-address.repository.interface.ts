// apps/backend/src/modules/commerce/domain/repositories/user-address.repository.interface.ts

import { IUserAddress } from '@barterborsa/shared-persistence';

export interface IUserAddressRepository {
  findById(id: string): Promise<IUserAddress | null>;
  findByUserId(userId: string): Promise<IUserAddress[]>;
}
// apps/backend/src/modules/commerce/domain/repositories/user-address.repository.interface.ts

export interface IUserAddressRepository {
  findById(id: string): Promise<any | null>;
  findByUserId(userId: string): Promise<any[]>;
}
import { UserAddress } from '../entities/user-address.entity';
export interface IUserAddressRepository {
    findByUserId(userId: string): Promise<UserAddress[]>;
    findById(id: string): Promise<UserAddress | null>;
    save(address: UserAddress): Promise<void>;
    update(address: UserAddress): Promise<void>;
    delete(id: string): Promise<void>;
    setDefault(id: string, userId: string): Promise<void>;
}

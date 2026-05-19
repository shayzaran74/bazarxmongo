import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { UserAddress } from '../../domain/entities/user-address.entity';
export declare class MongoUserAddressRepository implements IUserAddressRepository {
    private readonly model;
    constructor();
    findById(id: string): Promise<UserAddress | null>;
    findByUserId(userId: string): Promise<UserAddress[]>;
    save(address: UserAddress): Promise<void>;
    update(address: UserAddress): Promise<void>;
    delete(id: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
    setDefault(id: string, userId: string): Promise<void>;
}

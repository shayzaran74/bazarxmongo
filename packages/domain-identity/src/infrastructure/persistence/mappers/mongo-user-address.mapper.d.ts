import { UserAddress } from '../../../domain/entities/user-address.entity';
export declare class MongoUserAddressMapper {
    static toDomain(doc: any): UserAddress;
    static toPersistence(address: UserAddress): any;
}

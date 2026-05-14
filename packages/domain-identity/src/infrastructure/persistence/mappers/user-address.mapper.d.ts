import { UserAddress } from '../../../domain/entities/user-address.entity';
import { UserAddress as PrismaUserAddress } from '@prisma/client';
export declare class UserAddressMapper {
    static toDomain(record: PrismaUserAddress): UserAddress;
    static toPersistence(address: UserAddress): any;
}

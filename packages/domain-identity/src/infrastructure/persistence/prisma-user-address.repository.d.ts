import { PrismaService } from '@barterborsa/shared-persistence';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { UserAddress } from '../../domain/entities/user-address.entity';
export declare class PrismaUserAddressRepository implements IUserAddressRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByUserId(userId: string): Promise<UserAddress[]>;
    findById(id: string): Promise<UserAddress | null>;
    save(address: UserAddress): Promise<void>;
    update(address: UserAddress): Promise<void>;
    delete(id: string): Promise<void>;
    setDefault(id: string, userId: string): Promise<void>;
}

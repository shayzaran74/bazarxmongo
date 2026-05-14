import { PrismaService } from '@barterborsa/shared-persistence';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
export declare class PrismaUserRepository implements IUserRepository {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    exists(email: string): Promise<boolean>;
    save(user: User): Promise<void>;
    update(user: User): Promise<void>;
    delete(id: string): Promise<void>;
    findMany(pagination: any, filters?: any): Promise<User[]>;
    count(filters?: any): Promise<number>;
}

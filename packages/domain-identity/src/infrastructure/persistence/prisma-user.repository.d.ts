import { PrismaService, BasePrismaRepository } from '@barterborsa/shared-persistence';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User as PrismaUserModel } from '@prisma/client';
import { Optional } from '@barterborsa/shared-core';
export declare class PrismaUserRepository extends BasePrismaRepository<User, PrismaUserModel> implements IUserRepository {
    protected readonly prisma: PrismaService;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<Optional<User>>;
    exists(email: string): Promise<boolean>;
    save(user: User): Promise<void>;
    protected toDomain(record: PrismaUserModel): User;
    protected toPersistence(entity: User): any;
}

import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Optional } from '@barterborsa/shared-core';
import { Prisma } from '@prisma/client';
export declare class PrismaUserRepository implements IUserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Optional<User>>;
    findAll(): Promise<User[]>;
    findByEmail(email: string): Promise<Optional<User>>;
    exists(email: string): Promise<boolean>;
    save(user: User): Promise<void>;
    delete(id: string): Promise<void>;
    protected toDomain(record: unknown): User;
    protected toPersistence(user: User): Prisma.UserCreateInput & {
        firstName?: string;
        lastName?: string;
    };
}

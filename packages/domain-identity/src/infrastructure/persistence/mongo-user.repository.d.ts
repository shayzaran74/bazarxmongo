import { User as UserEntity } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
export declare class MongoUserRepository implements IUserRepository {
    private readonly logger;
    private readonly model;
    constructor();
    private toDomain;
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findByGoogleId(googleId: string): Promise<UserEntity | null>;
    findByPhoneNumber(phoneNumber: string): Promise<UserEntity | null>;
    exists(email: string): Promise<boolean>;
    save(user: UserEntity): Promise<void>;
    update(user: UserEntity): Promise<void>;
    delete(id: string): Promise<void>;
    findMany(pagination?: any, filters?: any): Promise<UserEntity[]>;
    count(filters?: any): Promise<number>;
}

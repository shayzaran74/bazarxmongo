import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { UserProfile } from '../../domain/entities/user-profile.entity';
export declare class MongoUserProfileRepository implements IUserProfileRepository {
    private readonly model;
    constructor();
    findByUserId(userId: string): Promise<UserProfile | null>;
    save(profile: UserProfile): Promise<void>;
    update(profile: UserProfile): Promise<void>;
}

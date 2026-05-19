import { UserProfile } from '../../../domain/entities/user-profile.entity';
export declare class MongoUserProfileMapper {
    static toDomain(doc: any): UserProfile;
    static toPersistence(profile: UserProfile): any;
}

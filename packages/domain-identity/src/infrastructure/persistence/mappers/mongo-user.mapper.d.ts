import { User } from '../../../domain/entities/user.entity';
export declare class MongoUserMapper {
    static toDomain(doc: any): User;
    static toPersistence(user: User): any;
}

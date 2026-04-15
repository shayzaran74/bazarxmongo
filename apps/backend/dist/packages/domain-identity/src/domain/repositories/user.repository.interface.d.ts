import { User } from '../entities/user.entity';
import { Optional } from '@barterborsa/shared-core';
export interface IUserRepository {
    findById(id: string): Promise<Optional<User>>;
    findByEmail(email: string): Promise<Optional<User>>;
    findByGoogleId(googleId: string): Promise<Optional<User>>;
    findByPhoneNumber(phoneNumber: string): Promise<Optional<User>>;
    save(user: User): Promise<void>;
    update(user: User): Promise<void>;
    delete(id: string): Promise<void>;
    exists(email: string): Promise<boolean>;
}

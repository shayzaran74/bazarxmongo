import { User } from '../entities/user.entity';
import { Optional } from '@barterborsa/shared-core';
export interface IUserRepository {
    findById(id: string): Promise<Optional<User>>;
    findByEmail(email: string): Promise<Optional<User>>;
    save(user: User): Promise<void>;
    exists(email: string): Promise<boolean>;
}

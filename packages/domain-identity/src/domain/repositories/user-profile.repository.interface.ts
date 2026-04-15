import { UserProfile } from '../entities/user-profile.entity';

export interface IUserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
  update(profile: UserProfile): Promise<void>;
}

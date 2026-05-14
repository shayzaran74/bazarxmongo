import { PrismaService } from '@barterborsa/shared-persistence';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { UserProfile } from '../../domain/entities/user-profile.entity';
export declare class PrismaUserProfileRepository implements IUserProfileRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByUserId(userId: string): Promise<UserProfile | null>;
    save(profile: UserProfile): Promise<void>;
    update(profile: UserProfile): Promise<void>;
}

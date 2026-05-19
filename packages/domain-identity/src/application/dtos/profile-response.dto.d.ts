import { UserProfile } from '../../domain/entities/user-profile.entity';
export declare class ProfileResponseDto {
    id: string;
    userId: string;
    firstName?: string;
    lastName?: string;
    fullName: string;
    avatar?: string;
    bio?: string;
    city?: string;
    district?: string;
    static fromEntity(profile: UserProfile): ProfileResponseDto;
}

import { User } from '../../domain/entities/user.entity';
export declare class UserResponseDto {
    id: string;
    email: string;
    phoneNumber?: string;
    role: string;
    status: string;
    platform: string;
    isEmailVerified: boolean;
    firstName?: string;
    lastName?: string;
    lastLoginAt?: Date;
    createdAt: Date;
    profile?: {
        phone?: string;
        city?: string;
        district?: string;
        neighborhood?: string;
        avatar?: string;
        bio?: string;
        birthday?: Date;
        gender?: string;
    };
    vendor?: {
        status: string;
        slug?: string;
        company?: {
            id: string;
            name: string;
            taxNumber?: string;
            taxOffice?: string;
        };
    };
    static fromEntity(user: User, profileData?: any): UserResponseDto;
}

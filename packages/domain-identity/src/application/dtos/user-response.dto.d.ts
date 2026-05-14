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
    vendor?: {
        status: string;
        slug?: string;
    };
    static fromEntity(user: User): UserResponseDto;
}

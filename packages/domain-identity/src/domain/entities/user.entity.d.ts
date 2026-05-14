import { AggregateRoot, Result } from '@barterborsa/shared-core';
export interface UserProps {
    email: string;
    phoneNumber?: string;
    passwordHash?: string;
    transactionPin?: string;
    role: 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION';
    platform: 'BAZARX' | 'BARTERBORSA';
    isEmailVerified: boolean;
    googleId?: string;
    firstName?: string;
    lastName?: string;
    lockoutUntil?: Date;
    lastLoginAt?: Date;
    lastSeenAt?: Date;
    referredById?: string;
    deletedAt?: Date;
    vendor?: {
        status: string;
        slug?: string;
    };
}
export declare class User extends AggregateRoot<UserProps> {
    private constructor();
    static create(props: UserProps, id?: string): Result<User>;
    updateProfile(firstName: string, lastName: string): void;
    changePassword(newHash: string): void;
    verifyEmail(): void;
    updateLastLogin(): void;
    get email(): string;
    get phoneNumber(): string | undefined;
    get firstName(): string | undefined;
    get lastName(): string | undefined;
    get role(): 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
    get status(): 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION';
    get platform(): 'BAZARX' | 'BARTERBORSA';
    get passwordHash(): string | undefined;
    get isEmailVerified(): boolean;
    get lastLoginAt(): Date | undefined;
    get googleId(): string | undefined;
    get vendor(): {
        status: string;
        slug?: string;
    } | undefined;
}

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
    deletedAt?: Date;
}
export declare class User extends AggregateRoot<UserProps> {
    private constructor();
    static create(props: UserProps, id?: string): Result<User>;
    updateProfile(firstName: string, lastName: string): void;
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
}

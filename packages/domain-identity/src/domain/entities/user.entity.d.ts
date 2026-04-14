import { AggregateRoot, Result } from '@barterborsa/shared-core';
export interface UserProps {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    role: 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    isEmailVerified: boolean;
}
export declare class User extends AggregateRoot<UserProps> {
    private constructor();
    static create(props: UserProps, id?: string): Result<User>;
    updateProfile(firstName: string, lastName: string): void;
    get email(): string;
    get role(): string;
}

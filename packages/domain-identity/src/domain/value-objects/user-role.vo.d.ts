import { ValueObject } from '@barterborsa/shared-core';
import { UserRole } from '../enums/user-role.enum';
export interface UserRoleVOProps {
    value: UserRole;
}
export declare class UserRoleVO extends ValueObject<UserRoleVOProps> {
    private constructor();
    get value(): UserRole;
    static create(role: UserRole): UserRoleVO;
    isAdmin(): boolean;
    isVendor(): boolean;
    isUser(): boolean;
}

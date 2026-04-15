import { ValueObject } from '@barterborsa/shared-core';
import { UserRole } from '../enums/user-role.enum';

export interface UserRoleVOProps {
  value: UserRole;
}

export class UserRoleVO extends ValueObject<UserRoleVOProps> {
  private constructor(props: UserRoleVOProps) {
    super(props);
  }

  get value(): UserRole {
    return this.props.value;
  }

  public static create(role: UserRole): UserRoleVO {
    return new UserRoleVO({ value: role });
  }

  public isAdmin(): boolean {
    return this.props.value === UserRole.ADMIN || this.props.value === UserRole.SUPER_ADMIN;
  }

  public isVendor(): boolean {
    return this.props.value === UserRole.VENDOR;
  }

  public isUser(): boolean {
    return this.props.value === UserRole.USER;
  }
}

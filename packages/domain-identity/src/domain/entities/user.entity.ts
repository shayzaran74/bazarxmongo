// packages/domain-identity/src/domain/entities/user.entity.ts

import { AggregateRoot, Result, Ok, Err } from '@barterborsa/shared-core';

export interface UserProps {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isEmailVerified: boolean;
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  public static create(props: UserProps, id?: string): Result<User> {
    // Invariant kontrolleri burada yapılabilir (Örn: email formatı)
    if (!props.email.includes('@')) {
      return Err(new Error('Geçersiz e-posta adresi.'));
    }

    const user = new User({
      ...props,
      status: props.status ?? 'INACTIVE',
      isEmailVerified: props.isEmailVerified ?? false,
    }, id);

    return Ok(user);
  }

  // Domain Logic: Şifre değiştirme, profil güncelleme vb.
  public updateProfile(firstName: string, lastName: string): void {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
    // this._updatedAt handle edilebilir (shared-core'da setter yoksa eklenmeli)
  }

  get email(): string { return this.props.email; }
  get firstName(): string | undefined { return this.props.firstName; }
  get lastName(): string | undefined { return this.props.lastName; }
  get role(): string { return this.props.role; }
}

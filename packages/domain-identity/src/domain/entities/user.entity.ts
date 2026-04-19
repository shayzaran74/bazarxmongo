import { AggregateRoot, Result, Ok, Err } from '@barterborsa/shared-core';
import { UserRegisteredEvent } from '../events/user-registered.event';

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
  firstName?: string; // Profil tablosundan gelecek/gidecek
  lastName?: string;  // Profil tablosundan gelecek/gidecek
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

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  public static create(props: UserProps, id?: string): Result<User> {
    // Temel validasyonlar
    if (!props.email.includes('@')) {
      return Err(new Error('Geçersiz e-posta adresi.'));
    }

    const user = new User({
      ...props,
      status: props.status || 'ACTIVE',
      platform: props.platform || 'BAZARX',
      isEmailVerified: props.isEmailVerified ?? false,
    }, id);

    // Yeni kullanıcı kaydı ise event ekle
    if (!id) {
      user.addDomainEvent(new UserRegisteredEvent(
        user.id,
        user.email,
        user.role,
        user.platform
      ));
    }

    return Ok(user);
  }

  // Domain Logic
  public updateProfile(firstName: string, lastName: string): void {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
  }

  public verifyEmail(): void {
    this.props.isEmailVerified = true;
    this.props.status = 'ACTIVE';
  }

  public updateLastLogin(): void {
    this.props.lastLoginAt = new Date();
  }

  get email(): string { return this.props.email; }
  get phoneNumber(): string | undefined { return this.props.phoneNumber; }
  get firstName(): string | undefined { return this.props.firstName; }
  get lastName(): string | undefined { return this.props.lastName; }
  get role(): 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN' { return this.props.role; }
  get status(): 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION' { return this.props.status; }
  get platform(): 'BAZARX' | 'BARTERBORSA' { return this.props.platform; }
  get passwordHash(): string | undefined { return this.props.passwordHash; }
  get isEmailVerified(): boolean { return this.props.isEmailVerified; }
  get lastLoginAt(): Date | undefined { return this.props.lastLoginAt; }
  get googleId(): string | undefined { return this.props.googleId; }
  get vendor(): { status: string; slug?: string } | undefined { return this.props.vendor; }
}

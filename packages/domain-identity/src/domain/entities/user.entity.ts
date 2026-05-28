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
  failedLoginCount?: number;
  lastLoginAt?: Date;
  lastSeenAt?: Date;
  referredById?: string;
  deletedAt?: Date;
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

  public updateProfile(firstName: string, lastName: string): void {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
  }

  public changePassword(newHash: string): void {
    this.props.passwordHash = newHash;
    this.props.lockoutUntil = undefined; // Reset lockout on successful change
    this.props.failedLoginCount = 0;
  }

  public verifyEmail(): void {
    this.props.isEmailVerified = true;
    this.props.status = 'ACTIVE';
  }

  public updateLastLogin(): void {
    this.props.lastLoginAt = new Date();
  }

  // ── Brute-force koruması ──────────────────────────────────────────────
  // 5 hatalı denemede 15 dakikalık lockout. Başarılı login'de sayaç sıfırlanır.
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000;

  public isLocked(now: Date = new Date()): boolean {
    return !!(this.props.lockoutUntil && this.props.lockoutUntil > now);
  }

  public recordFailedLogin(now: Date = new Date()): void {
    const next = (this.props.failedLoginCount ?? 0) + 1;
    this.props.failedLoginCount = next;
    if (next >= User.MAX_FAILED_ATTEMPTS) {
      this.props.lockoutUntil = new Date(now.getTime() + User.LOCKOUT_DURATION_MS);
    }
  }

  public clearFailedLogins(): void {
    this.props.failedLoginCount = 0;
    this.props.lockoutUntil = undefined;
  }

  public updateRole(role: 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN'): void {
    this.props.role = role;
  }

  public suspend(): void {
    this.props.status = 'SUSPENDED';
  }

  public activate(): void {
    this.props.status = 'ACTIVE';
  }

  get lockoutUntil(): Date | undefined { return this.props.lockoutUntil; }
  get failedLoginCount(): number { return this.props.failedLoginCount ?? 0; }

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
  get vendor(): UserProps['vendor'] { return this.props.vendor; }
}

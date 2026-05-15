import { Entity } from '@barterborsa/shared-core';

export interface UserProfileProps {
  userId: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  birthday?: Date;
  gender?: string;
  phone?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
}

export class UserProfile extends Entity<UserProfileProps> {
  private constructor(props: UserProfileProps, id?: string) {
    super(props, id);
  }

  public static create(props: UserProfileProps, id?: string): UserProfile {
    return new UserProfile(props, id);
  }

  public update(props: Partial<UserProfileProps>): void {
    Object.assign(this.props, props);
    // Note: _updatedAt is usually handled by base class or manually
    // If not in base class, we can skip it or add a getter/setter
  }

  public getFullName(): string {
    return `${this.props.firstName || ''} ${this.props.lastName || ''}`.trim();
  }

  get userId(): string { return this.props.userId; }
  get firstName(): string | undefined { return this.props.firstName; }
  get lastName(): string | undefined { return this.props.lastName; }
  get avatar(): string | undefined { return this.props.avatar; }
  get bio(): string | undefined { return this.props.bio; }
  get birthday(): Date | undefined { return this.props.birthday; }
  get gender(): string | undefined { return this.props.gender; }
  get phone(): string | undefined { return this.props.phone; }
  get city(): string | undefined { return this.props.city; }
  get district(): string | undefined { return this.props.district; }
  get neighborhood(): string | undefined { return this.props.neighborhood; }
}

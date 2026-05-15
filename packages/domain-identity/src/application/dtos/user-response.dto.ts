import { User } from '../../domain/entities/user.entity';

export class UserResponseDto {
  id!: string;
  email!: string;
  phoneNumber?: string;
  role!: string;
  status!: string;
  platform!: string;
  isEmailVerified!: boolean;
  firstName?: string;
  lastName?: string;
  lastLoginAt?: Date;
  createdAt!: Date;
  profile?: {
    phone?: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    avatar?: string;
    bio?: string;
    birthday?: Date;
    gender?: string;
  };
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

  static fromEntity(user: User, profileData?: any): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.phoneNumber = user.phoneNumber;
    dto.role = user.role;
    dto.status = user.status;
    dto.platform = user.platform;
    dto.isEmailVerified = user.isEmailVerified;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.lastLoginAt = user.lastLoginAt;
    dto.createdAt = user.createdAt;
    dto.vendor = user.vendor;

    // Profile verilerini ekle
    if (profileData) {
      dto.profile = {
        phone: profileData.phone || profileData.phoneNumber || undefined,
        city: profileData.city || undefined,
        district: profileData.district || undefined,
        neighborhood: profileData.neighborhood || undefined,
        avatar: profileData.avatar || undefined,
        bio: profileData.bio || undefined,
        birthday: profileData.birthday || undefined,
        gender: profileData.gender || undefined,
      };
    }

    return dto;
  }
}

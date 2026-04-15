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

  static fromEntity(user: User): UserResponseDto {
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
    return dto;
  }
}

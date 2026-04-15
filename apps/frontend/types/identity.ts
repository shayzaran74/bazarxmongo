import type { BaseEntity } from './common';

export interface UserProfile extends BaseEntity {
  userId: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  birthday?: string;
  gender?: string;
  city?: string;
  district?: string;
}

export interface UserAddress extends BaseEntity {
  userId: string;
  title: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  neighborhood?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  birthday?: string;
  gender?: string;
  city?: string;
  district?: string;
}

export interface CreateAddressDto {
  title: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  neighborhood?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export type UpdateAddressDto = Partial<CreateAddressDto>;

export interface ChangePasswordDto {
  currentPassword?: string; // Mevcut şifre (ESKI tip auth için)
  newPassword: string;      // Yeni şifre
}

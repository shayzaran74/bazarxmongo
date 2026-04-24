import { UserAddress } from '../../domain/entities/user-address.entity';

export class AddressResponseDto {
  id!: string;
  title!: string;
  firstName!: string;
  lastName!: string;
  fullName!: string;
  phone!: string;
  addressLine!: string;
  city!: string;
  district!: string;
  fullAddress!: string;
  isDefault!: boolean;

  static fromEntity(address: UserAddress): AddressResponseDto {
    const dto = new AddressResponseDto();
    dto.id = address.id;
    dto.title = address.title;
    dto.firstName = address.firstName;
    dto.lastName = address.lastName;
    dto.fullName = `${address.firstName} ${address.lastName}`.trim();
    dto.phone = address.phone;
    dto.addressLine = address.addressLine1;
    dto.city = address.city;
    dto.district = address.district;
    dto.fullAddress = address.getFullAddress();
    dto.isDefault = address.isDefault;
    return dto;
  }
}

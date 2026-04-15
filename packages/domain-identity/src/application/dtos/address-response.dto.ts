import { UserAddress } from '../../domain/entities/user-address.entity';

export class AddressResponseDto {
  id!: string;
  title!: string;
  firstName!: string;
  lastName!: string;
  phone!: string;
  fullAddress!: string;
  isDefault!: boolean;

  static fromEntity(address: UserAddress): AddressResponseDto {
    const dto = new AddressResponseDto();
    dto.id = address.id;
    dto.title = address.title;
    dto.firstName = address.firstName;
    dto.lastName = address.lastName;
    dto.phone = address.phone;
    dto.fullAddress = address.getFullAddress();
    dto.isDefault = address.isDefault;
    return dto;
  }
}

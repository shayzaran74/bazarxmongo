import { UserAddress } from '../../../domain/entities/user-address.entity';
import { UserAddress as PrismaUserAddress } from '@prisma/client';

export class UserAddressMapper {
  static toDomain(record: PrismaUserAddress): UserAddress {
    return UserAddress.create({
      userId: record.userId,
      title: record.title,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email || undefined,
      phone: record.phone,
      addressLine1: record.addressLine1,
      addressLine2: record.addressLine2 || undefined,
      city: record.city,
      district: record.district,
      neighborhood: record.neighborhood || undefined,
      postalCode: record.postalCode || undefined,
      isDefault: record.isDefault,
    }, record.id);
  }

  static toPersistence(address: UserAddress): any {
    return {
      id: address.id,
      userId: address.userId,
      title: address.title,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      addressLine1: (address as any).props.addressLine1,
      addressLine2: (address as any).props.addressLine2,
      city: address.city,
      district: address.district,
      neighborhood: (address as any).props.neighborhood,
      postalCode: (address as any).props.postalCode,
      isDefault: address.isDefault,
    };
  }
}

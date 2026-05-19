// packages/domain-identity/src/infrastructure/persistence/mappers/mongo-user-address.mapper.ts
// UserAddress mapper — MongoDB document to domain entity (ADR-005 Faz 2c)

import { UserAddress } from '../../../domain/entities/user-address.entity';

export class MongoUserAddressMapper {
  static toDomain(doc: any): UserAddress {
    return UserAddress.create({
      userId: doc.userId,
      title: doc.title,
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      phone: doc.phone,
      addressLine1: doc.addressLine1,
      addressLine2: doc.addressLine2,
      city: doc.city,
      district: doc.district,
      neighborhood: doc.neighborhood,
      postalCode: doc.postalCode,
      isDefault: doc.isDefault,
    }, doc.id);
  }

  static toPersistence(address: UserAddress): any {
    const props = address.getProps();
    return {
      id: address.id,
      userId: props.userId,
      title: props.title,
      firstName: props.firstName,
      lastName: props.lastName,
      email: props.email,
      phone: props.phone,
      addressLine1: props.addressLine1,
      addressLine2: props.addressLine2,
      city: props.city,
      district: props.district,
      neighborhood: props.neighborhood,
      postalCode: props.postalCode,
      isDefault: props.isDefault,
    };
  }
}
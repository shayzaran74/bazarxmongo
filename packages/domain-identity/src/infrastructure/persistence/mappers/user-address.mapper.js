"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAddressMapper = void 0;
const user_address_entity_1 = require("../../../domain/entities/user-address.entity");
class UserAddressMapper {
    static toDomain(record) {
        return user_address_entity_1.UserAddress.create({
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
    static toPersistence(address) {
        return {
            id: address.id,
            userId: address.userId,
            title: address.title,
            firstName: address.firstName,
            lastName: address.lastName,
            phone: address.phone,
            addressLine1: address.props.addressLine1,
            addressLine2: address.props.addressLine2,
            city: address.city,
            district: address.district,
            neighborhood: address.props.neighborhood,
            postalCode: address.props.postalCode,
            isDefault: address.isDefault,
        };
    }
}
exports.UserAddressMapper = UserAddressMapper;
//# sourceMappingURL=user-address.mapper.js.map
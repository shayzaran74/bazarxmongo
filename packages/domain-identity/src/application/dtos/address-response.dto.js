"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressResponseDto = void 0;
class AddressResponseDto {
    id;
    title;
    firstName;
    lastName;
    fullName;
    phone;
    addressLine;
    city;
    district;
    fullAddress;
    isDefault;
    static fromEntity(address) {
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
exports.AddressResponseDto = AddressResponseDto;
//# sourceMappingURL=address-response.dto.js.map
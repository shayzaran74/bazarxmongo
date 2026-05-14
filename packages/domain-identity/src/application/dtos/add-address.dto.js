"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAddressDto = void 0;
const class_validator_1 = require("class-validator");
class AddAddressDto {
    title;
    firstName;
    lastName;
    phone;
    addressLine1;
    addressLine2;
    city;
    district;
    neighborhood;
    postalCode;
    isDefault;
}
exports.AddAddressDto = AddAddressDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Başlık zorunludur' }),
    __metadata("design:type", String)
], AddAddressDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Ad zorunludur' }),
    __metadata("design:type", String)
], AddAddressDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Soyad zorunludur' }),
    __metadata("design:type", String)
], AddAddressDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Telefon zorunludur' }),
    __metadata("design:type", String)
], AddAddressDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Adres Satırı 1 zorunludur' }),
    __metadata("design:type", String)
], AddAddressDto.prototype, "addressLine1", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddAddressDto.prototype, "addressLine2", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'İl zorunludur' }),
    __metadata("design:type", String)
], AddAddressDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'İlçe zorunludur' }),
    __metadata("design:type", String)
], AddAddressDto.prototype, "district", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddAddressDto.prototype, "neighborhood", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddAddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AddAddressDto.prototype, "isDefault", void 0);
//# sourceMappingURL=add-address.dto.js.map
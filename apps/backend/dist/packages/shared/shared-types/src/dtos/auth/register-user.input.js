"use strict";
// packages/shared/shared-types/src/dtos/auth/register-user.input.ts
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
exports.RegisterUserInput = exports.Platform = void 0;
const class_validator_1 = require("class-validator");
var Platform;
(function (Platform) {
    Platform["BAZARX"] = "BAZARX";
    Platform["BARTERBORSA"] = "BARTERBORSA";
})(Platform || (exports.Platform = Platform = {}));
class RegisterUserInput {
    email;
    password;
    firstName;
    lastName;
    phoneNumber;
    platform;
}
exports.RegisterUserInput = RegisterUserInput;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Geçersiz e-posta adresi.' }),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Şifre en az 6 karakter olmalıdır.' }),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Platform),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "platform", void 0);
//# sourceMappingURL=register-user.input.js.map
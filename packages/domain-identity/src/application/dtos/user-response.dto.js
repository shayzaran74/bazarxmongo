"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = void 0;
class UserResponseDto {
    id;
    email;
    phoneNumber;
    role;
    status;
    platform;
    isEmailVerified;
    firstName;
    lastName;
    lastLoginAt;
    createdAt;
    vendor;
    static fromEntity(user) {
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
        dto.vendor = user.vendor;
        return dto;
    }
}
exports.UserResponseDto = UserResponseDto;
//# sourceMappingURL=user-response.dto.js.map
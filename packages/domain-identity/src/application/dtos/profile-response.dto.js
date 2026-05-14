"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileResponseDto = void 0;
class ProfileResponseDto {
    id;
    userId;
    firstName;
    lastName;
    fullName;
    avatar;
    bio;
    city;
    district;
    static fromEntity(profile) {
        const dto = new ProfileResponseDto();
        dto.id = profile.id;
        dto.userId = profile.userId;
        dto.firstName = profile.firstName;
        dto.lastName = profile.lastName;
        dto.fullName = profile.getFullName();
        dto.avatar = profile.avatar;
        dto.bio = profile.bio;
        dto.city = profile.city;
        dto.district = profile.district;
        return dto;
    }
}
exports.ProfileResponseDto = ProfileResponseDto;
//# sourceMappingURL=profile-response.dto.js.map
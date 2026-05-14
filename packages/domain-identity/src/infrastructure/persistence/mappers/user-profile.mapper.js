"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileMapper = void 0;
const user_profile_entity_1 = require("../../../domain/entities/user-profile.entity");
class UserProfileMapper {
    static toDomain(prismaProfile) {
        return user_profile_entity_1.UserProfile.create({
            userId: prismaProfile.userId,
            firstName: prismaProfile.firstName || undefined,
            lastName: prismaProfile.lastName || undefined,
            avatar: prismaProfile.avatar || undefined,
            bio: prismaProfile.bio || undefined,
            birthday: prismaProfile.birthday || undefined,
            gender: prismaProfile.gender || undefined,
            city: prismaProfile.city || undefined,
            district: prismaProfile.district || undefined,
        }, prismaProfile.id);
    }
    static toPersistence(profile) {
        const props = profile.getProps();
        return {
            id: profile.id,
            userId: profile.userId,
            firstName: props.firstName,
            lastName: props.lastName,
            avatar: props.avatar,
            bio: props.bio,
            birthday: props.birthday,
            gender: props.gender,
            city: props.city,
            district: props.district,
        };
    }
}
exports.UserProfileMapper = UserProfileMapper;
//# sourceMappingURL=user-profile.mapper.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const user_entity_1 = require("../../../domain/entities/user.entity");
class UserMapper {
    static toDomain(prismaUser) {
        // Note: ProntoPrismaUser is just a placeholder for full relations if needed
        // In many cases we just cast to PrismaUser
        const record = prismaUser;
        const userResult = user_entity_1.User.create({
            email: record.email,
            phoneNumber: record.phoneNumber || undefined,
            passwordHash: record.password || undefined,
            role: record.role,
            status: record.status,
            platform: record.platform,
            isEmailVerified: record.isEmailVerified,
            googleId: record.googleId || undefined,
            firstName: record.profile?.firstName || undefined,
            lastName: record.profile?.lastName || undefined,
            transactionPin: record.transactionPin || undefined,
            lockoutUntil: record.lockoutUntil || undefined,
            lastLoginAt: record.lastLoginAt || undefined,
            lastSeenAt: record.lastSeenAt || undefined,
            deletedAt: record.deletedAt || undefined,
            referredById: record.referredById || undefined,
            vendor: record.vendor ? {
                status: record.vendor.status,
                slug: record.vendor.slug
            } : undefined,
        }, record.id);
        if (!userResult.success) {
            throw userResult.error;
        }
        return userResult.data;
    }
    static toPersistence(user) {
        const props = user.getProps();
        return {
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            password: props.passwordHash,
            transactionPin: props.transactionPin,
            role: user.role, // Enum cast is fine
            status: user.status,
            platform: user.platform,
            isEmailVerified: props.isEmailVerified,
            googleId: props.googleId,
            lockoutUntil: props.lockoutUntil,
            lastLoginAt: props.lastLoginAt,
            lastSeenAt: props.lastSeenAt,
            deletedAt: props.deletedAt,
            referredById: props.referredById,
        };
    }
    static toProfilePersistence(user) {
        const props = user.getProps();
        return {
            userId: user.id,
            firstName: props.firstName,
            lastName: props.lastName,
        };
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map
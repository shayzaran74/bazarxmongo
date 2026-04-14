"use strict";
// packages/domain-identity/src/infrastructure/persistence/prisma-user.repository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const user_entity_1 = require("../../domain/entities/user.entity");
class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const record = await this.prisma.user.findUnique({
            where: { id },
            include: { profile: true },
        });
        return record ? this.toDomain(record) : null;
    }
    async findAll() {
        const records = await this.prisma.user.findMany({
            include: { profile: true },
        });
        return records.map((record) => this.toDomain(record));
    }
    async findByEmail(email) {
        const record = await this.prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });
        return record ? this.toDomain(record) : null;
    }
    async exists(email) {
        const count = await this.prisma.user.count({
            where: { email },
        });
        return count > 0;
    }
    async save(user) {
        const data = this.toPersistence(user);
        const { firstName, lastName, ...userData } = data;
        await this.prisma.$transaction(async (tx) => {
            // 1. Ana kullanıcı tablosunu güncelle/oluştur
            await tx.user.upsert({
                where: { id: user.id },
                update: userData,
                create: userData,
            });
            // 2. Profil tablosunu güncelle/oluştur
            if (firstName || lastName) {
                await tx.userProfile.upsert({
                    where: { userId: user.id },
                    update: { firstName, lastName },
                    create: { userId: user.id, firstName, lastName },
                });
            }
        });
    }
    async delete(id) {
        await this.prisma.user.delete({
            where: { id },
        });
    }
    toDomain(record) {
        const userResult = user_entity_1.User.create({
            email: record.email,
            phoneNumber: record.phoneNumber,
            passwordHash: record.password, // DB'deki 'password' alanı entity'de 'passwordHash'
            role: record.role,
            status: record.status,
            platform: record.platform,
            isEmailVerified: record.isEmailVerified,
            googleId: record.googleId,
            firstName: record.profile?.firstName,
            lastName: record.profile?.lastName,
            lastLoginAt: record.lastLoginAt,
            lastSeenAt: record.lastSeenAt,
        }, record.id);
        if (!userResult.success) {
            throw userResult.error;
        }
        return userResult.data;
    }
    toPersistence(user) {
        const props = user.props;
        return {
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            password: props.passwordHash, // Şemada 'password' olarak tanımlı
            role: user.role,
            status: user.status,
            platform: user.platform,
            isEmailVerified: props.isEmailVerified,
            googleId: props.googleId,
            lastLoginAt: props.lastLoginAt,
            firstName: user.firstName, // Mapper tarafından UserProfile'a ayrıştırılacak
            lastName: user.lastName, // Mapper tarafından UserProfile'a ayrıştırılacak
        };
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
//# sourceMappingURL=prisma-user.repository.js.map
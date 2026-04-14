"use strict";
// packages/domain-identity/src/infrastructure/persistence/prisma-user.repository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const shared_persistence_1 = require("@barterborsa/shared-persistence");
const user_entity_1 = require("../../domain/entities/user.entity");
class PrismaUserRepository extends shared_persistence_1.BasePrismaRepository {
    prisma;
    constructor(prisma) {
        super(prisma, 'user');
        this.prisma = prisma;
    }
    // BasePrismaRepository ile uyumlu dönüş tipi: User | null
    async findById(id) {
        const record = await this.prisma.user.findUnique({
            where: { id },
        });
        return record ? this.toDomain(record) : null;
    }
    async findByEmail(email) {
        const record = await this.prisma.user.findUnique({
            where: { email },
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
        console.log('[REPO] Saving user data:', data);
        await this.prisma.user.upsert({
            where: { id: user.id },
            update: data,
            create: data,
        });
    }
    toDomain(record) {
        const userResult = user_entity_1.User.create({
            email: record.email,
            passwordHash: record.passwordHash,
            firstName: record.firstName || undefined,
            lastName: record.lastName || undefined,
            role: record.role,
            status: record.status,
            isEmailVerified: record.isEmailVerified,
        }, record.id);
        if (!userResult.success) {
            throw userResult.error;
        }
        return userResult.data;
    }
    toPersistence(entity) {
        const props = entity.props;
        return {
            id: entity.id,
            email: props.email,
            passwordHash: props.passwordHash,
            firstName: props.firstName,
            lastName: props.lastName,
            role: props.role,
            status: props.status,
            isEmailVerified: props.isEmailVerified,
            version: entity.version,
        };
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
//# sourceMappingURL=prisma-user.repository.js.map
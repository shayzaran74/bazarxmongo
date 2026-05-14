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
var PrismaUserRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
const user_mapper_1 = require("./mappers/user.mapper");
let PrismaUserRepository = PrismaUserRepository_1 = class PrismaUserRepository {
    prisma;
    logger = new common_1.Logger(PrismaUserRepository_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const record = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: { profile: true, vendor: true }
        });
        return record ? user_mapper_1.UserMapper.toDomain(record) : null;
    }
    async findByEmail(email) {
        const record = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: { profile: true, vendor: true }
        });
        return record ? user_mapper_1.UserMapper.toDomain(record) : null;
    }
    async findByGoogleId(googleId) {
        const record = await this.prisma.user.findFirst({
            where: { googleId, deletedAt: null },
            include: { profile: true, vendor: true }
        });
        return record ? user_mapper_1.UserMapper.toDomain(record) : null;
    }
    async findByPhoneNumber(phoneNumber) {
        const record = await this.prisma.user.findFirst({
            where: { phoneNumber, deletedAt: null },
            include: { profile: true, vendor: true }
        });
        return record ? user_mapper_1.UserMapper.toDomain(record) : null;
    }
    async exists(email) {
        const count = await this.prisma.user.count({
            where: { email, deletedAt: null }
        });
        return count > 0;
    }
    async save(user) {
        const data = user_mapper_1.UserMapper.toPersistence(user);
        const profileData = user_mapper_1.UserMapper.toProfilePersistence(user);
        const { id, ...updateData } = data;
        try {
            // 1. User'ı upsert et (nested profile olmadan — güvenli yol)
            await this.prisma.user.upsert({
                where: { id },
                create: data,
                update: updateData,
            });
            // 2. Profile'ı ayrı upsert et (bağımsız kontrol)
            await this.prisma.userProfile.upsert({
                where: { userId: user.id },
                create: { ...profileData, userId: user.id },
                update: profileData,
            });
            this.logger.debug(`User saved: ${user.email}`);
        }
        catch (err) {
            this.logger.error(`Failed to save user ${user.email}: ${err.message}`, err.stack);
            throw err; // Hatayı yutma — üst katmana fırlat
        }
    }
    async update(user) {
        await this.save(user);
    }
    async delete(id) {
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
    async findMany(pagination, filters) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const records = await this.prisma.user.findMany({
            where: {
                deletedAt: null,
                ...(filters?.role && { role: filters.role }),
                ...(filters?.status && { status: filters.status }),
                ...(filters?.search && {
                    OR: [
                        { email: { contains: filters.search, mode: 'insensitive' } },
                        { phoneNumber: { contains: filters.search, mode: 'insensitive' } }
                    ]
                })
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { profile: true, vendor: true }
        });
        return records.map((r) => user_mapper_1.UserMapper.toDomain(r));
    }
    async count(filters) {
        return this.prisma.user.count({
            where: {
                deletedAt: null,
                ...(filters?.role && { role: filters.role }),
                ...(filters?.status && { status: filters.status }),
                ...(filters?.search && {
                    OR: [
                        { email: { contains: filters.search, mode: 'insensitive' } },
                        { phoneNumber: { contains: filters.search, mode: 'insensitive' } }
                    ]
                })
            }
        });
    }
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = PrismaUserRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shared_persistence_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map
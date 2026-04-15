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
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
const user_mapper_1 = require("./mappers/user.mapper");
let PrismaUserRepository = class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const record = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: { profile: true }
        });
        return record ? user_mapper_1.UserMapper.toDomain(record) : null;
    }
    async findByEmail(email) {
        const record = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: { profile: true }
        });
        return record ? user_mapper_1.UserMapper.toDomain(record) : null;
    }
    async findByGoogleId(googleId) {
        const record = await this.prisma.user.findFirst({
            where: { googleId, deletedAt: null },
            include: { profile: true }
        });
        return record ? user_mapper_1.UserMapper.toDomain(record) : null;
    }
    async findByPhoneNumber(phoneNumber) {
        const record = await this.prisma.user.findFirst({
            where: { phoneNumber, deletedAt: null },
            include: { profile: true }
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
        await this.prisma.$transaction([
            this.prisma.user.create({ data }),
            this.prisma.userProfile.create({ data: profileData })
        ]);
    }
    async update(user) {
        const data = user_mapper_1.UserMapper.toPersistence(user);
        const { id, ...updateData } = data;
        await this.prisma.user.update({
            where: { id },
            data: updateData
        });
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
            include: { profile: true }
        });
        return records.map(r => user_mapper_1.UserMapper.toDomain(r));
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
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shared_persistence_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map
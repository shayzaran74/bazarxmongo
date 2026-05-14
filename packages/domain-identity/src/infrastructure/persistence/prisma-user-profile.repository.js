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
exports.PrismaUserProfileRepository = void 0;
const common_1 = require("@nestjs/common");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
const user_profile_mapper_1 = require("./mappers/user-profile.mapper");
let PrismaUserProfileRepository = class PrismaUserProfileRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUserId(userId) {
        const record = await this.prisma.userProfile.findUnique({
            where: { userId }
        });
        return record ? user_profile_mapper_1.UserProfileMapper.toDomain(record) : null;
    }
    async save(profile) {
        const data = user_profile_mapper_1.UserProfileMapper.toPersistence(profile);
        await this.prisma.userProfile.create({ data });
    }
    async update(profile) {
        const data = user_profile_mapper_1.UserProfileMapper.toPersistence(profile);
        const { id, ...updateData } = data;
        await this.prisma.userProfile.update({
            where: { id },
            data: updateData
        });
    }
};
exports.PrismaUserProfileRepository = PrismaUserProfileRepository;
exports.PrismaUserProfileRepository = PrismaUserProfileRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shared_persistence_1.PrismaService])
], PrismaUserProfileRepository);
//# sourceMappingURL=prisma-user-profile.repository.js.map
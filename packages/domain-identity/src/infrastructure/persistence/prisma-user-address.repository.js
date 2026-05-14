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
exports.PrismaUserAddressRepository = void 0;
const common_1 = require("@nestjs/common");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
const user_address_mapper_1 = require("./mappers/user-address.mapper");
let PrismaUserAddressRepository = class PrismaUserAddressRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUserId(userId) {
        const records = await this.prisma.userAddress.findMany({
            where: { userId, deletedAt: null }
        });
        return records.map((record) => user_address_mapper_1.UserAddressMapper.toDomain(record));
    }
    async findById(id) {
        const record = await this.prisma.userAddress.findFirst({
            where: { id, deletedAt: null }
        });
        return record ? user_address_mapper_1.UserAddressMapper.toDomain(record) : null;
    }
    async save(address) {
        const data = user_address_mapper_1.UserAddressMapper.toPersistence(address);
        await this.prisma.userAddress.create({ data });
    }
    async update(address) {
        const data = user_address_mapper_1.UserAddressMapper.toPersistence(address);
        const { id, ...updateData } = data;
        await this.prisma.userAddress.update({
            where: { id },
            data: updateData
        });
    }
    async delete(id) {
        await this.prisma.userAddress.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
    async setDefault(id, userId) {
        await this.prisma.$transaction([
            this.prisma.userAddress.updateMany({
                where: { userId },
                data: { isDefault: false }
            }),
            this.prisma.userAddress.update({
                where: { id },
                data: { isDefault: true }
            })
        ]);
    }
};
exports.PrismaUserAddressRepository = PrismaUserAddressRepository;
exports.PrismaUserAddressRepository = PrismaUserAddressRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shared_persistence_1.PrismaService])
], PrismaUserAddressRepository);
//# sourceMappingURL=prisma-user-address.repository.js.map
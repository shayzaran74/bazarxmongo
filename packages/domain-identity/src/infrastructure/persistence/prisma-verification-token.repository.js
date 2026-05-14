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
exports.PrismaVerificationTokenRepository = void 0;
const common_1 = require("@nestjs/common");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
const crypto_1 = require("crypto");
let PrismaVerificationTokenRepository = class PrismaVerificationTokenRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, type, expiresAt) {
        let token;
        if (type === 'EMAIL') {
            // 6 haneli sayısal kod üret (0-999999)
            token = Math.floor(100000 + Math.random() * 900000).toString();
        }
        else {
            token = (0, crypto_1.randomBytes)(32).toString('hex');
        }
        await this.prisma.verificationToken.create({
            data: {
                userId,
                token,
                type,
                expiresAt,
            },
        });
        return token;
    }
    async findByToken(token) {
        const record = await this.prisma.verificationToken.findUnique({
            where: { token },
        });
        if (!record)
            return null;
        return {
            id: record.id,
            userId: record.userId,
            token: record.token,
            type: record.type,
            expiresAt: record.expiresAt,
            createdAt: record.createdAt,
        };
    }
    async delete(id) {
        await this.prisma.verificationToken.delete({
            where: { id },
        });
    }
    async deleteByUserIdAndType(userId, type) {
        await this.prisma.verificationToken.deleteMany({
            where: { userId, type },
        });
    }
};
exports.PrismaVerificationTokenRepository = PrismaVerificationTokenRepository;
exports.PrismaVerificationTokenRepository = PrismaVerificationTokenRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shared_persistence_1.PrismaService])
], PrismaVerificationTokenRepository);
//# sourceMappingURL=prisma-verification-token.repository.js.map
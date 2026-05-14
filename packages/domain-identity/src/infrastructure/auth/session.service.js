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
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
const shared_security_1 = require("@barterborsa/shared-security"); // or wherever it is
let SessionService = class SessionService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async createSession(userId, userAgent, ipAddress) {
        return this.prisma.session.create({
            data: {
                userId,
                userAgent,
                ipAddress,
                lastActiveAt: new Date()
            }
        });
    }
    async invalidateSession(sessionId) {
        await this.prisma.session.delete({ where: { id: sessionId } });
    }
    async invalidateAllUserSessions(userId) {
        await this.prisma.session.deleteMany({ where: { userId } });
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shared_persistence_1.PrismaService,
        shared_security_1.RedisService])
], SessionService);
//# sourceMappingURL=session.service.js.map
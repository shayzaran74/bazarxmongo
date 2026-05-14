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
exports.GetLoginHistoryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const shared_persistence_1 = require("@barterborsa/shared-persistence");
const get_login_history_query_1 = require("./get-login-history.query");
const shared_core_1 = require("@barterborsa/shared-core");
let GetLoginHistoryHandler = class GetLoginHistoryHandler {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(query) {
        const history = await this.prisma.loginHistory.findMany({
            where: { userId: query.userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return (0, shared_core_1.Ok)(history);
    }
};
exports.GetLoginHistoryHandler = GetLoginHistoryHandler;
exports.GetLoginHistoryHandler = GetLoginHistoryHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_login_history_query_1.GetLoginHistoryQuery),
    __metadata("design:paramtypes", [shared_persistence_1.PrismaService])
], GetLoginHistoryHandler);
//# sourceMappingURL=get-login-history.handler.js.map
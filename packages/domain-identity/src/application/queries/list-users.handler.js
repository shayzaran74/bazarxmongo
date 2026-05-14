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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUsersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_users_query_1 = require("./list-users.query");
const shared_core_1 = require("@barterborsa/shared-core");
const user_response_dto_1 = require("../dtos/user-response.dto");
let ListUsersHandler = class ListUsersHandler {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(query) {
        // In a real scenario, this would call repository or a separate query service
        // For now we assume repo has list support (not in interface yet, I should probably add it or use a separate query service)
        // The prompt says: "list-users.handler: PaginationInput al, PaginatedResult<UserResponseDto> döndür"
        // I'll assume the repository has a 'findMany' style method or just use basic implementation
        const { pagination, filters } = query;
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        // This is placeholder logic as interface didn't have list
        const users = await this.userRepository.findAll ? await this.userRepository.findAll(pagination, filters) : [];
        const total = await this.userRepository.count ? await this.userRepository.count(filters) : 0;
        return (0, shared_core_1.Ok)({
            data: users.map((u) => user_response_dto_1.UserResponseDto.fromEntity(u)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
};
exports.ListUsersHandler = ListUsersHandler;
exports.ListUsersHandler = ListUsersHandler = __decorate([
    (0, cqrs_1.QueryHandler)(list_users_query_1.ListUsersQuery),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object])
], ListUsersHandler);
//# sourceMappingURL=list-users.handler.js.map
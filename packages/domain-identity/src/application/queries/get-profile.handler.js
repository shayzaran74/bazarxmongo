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
exports.GetProfileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_profile_query_1 = require("./get-profile.query");
const shared_core_1 = require("@barterborsa/shared-core");
const profile_response_dto_1 = require("../dtos/profile-response.dto");
let GetProfileHandler = class GetProfileHandler {
    profileRepository;
    constructor(profileRepository) {
        this.profileRepository = profileRepository;
    }
    async execute(query) {
        const profile = await this.profileRepository.findByUserId(query.userId);
        if (!profile) {
            return (0, shared_core_1.Err)(new shared_core_1.NotFoundException('Profil bulunamadı.'));
        }
        return (0, shared_core_1.Ok)(profile_response_dto_1.ProfileResponseDto.fromEntity(profile));
    }
};
exports.GetProfileHandler = GetProfileHandler;
exports.GetProfileHandler = GetProfileHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_profile_query_1.GetProfileQuery),
    __param(0, (0, common_1.Inject)('IUserProfileRepository')),
    __metadata("design:paramtypes", [Object])
], GetProfileHandler);
//# sourceMappingURL=get-profile.handler.js.map
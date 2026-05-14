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
exports.UpdateProfileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_profile_command_1 = require("./update-profile.command");
const shared_core_1 = require("@barterborsa/shared-core");
const profile_response_dto_1 = require("../dtos/profile-response.dto");
const user_profile_entity_1 = require("../../domain/entities/user-profile.entity");
let UpdateProfileHandler = class UpdateProfileHandler {
    profileRepository;
    constructor(profileRepository) {
        this.profileRepository = profileRepository;
    }
    async execute(command) {
        const { userId, dto } = command;
        let profile = await this.profileRepository.findByUserId(userId);
        if (!profile) {
            profile = user_profile_entity_1.UserProfile.create({
                userId,
                ...dto
            });
            await this.profileRepository.save(profile);
        }
        else {
            profile.update(dto);
            await this.profileRepository.update(profile);
        }
        return (0, shared_core_1.Ok)(profile_response_dto_1.ProfileResponseDto.fromEntity(profile));
    }
};
exports.UpdateProfileHandler = UpdateProfileHandler;
exports.UpdateProfileHandler = UpdateProfileHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_profile_command_1.UpdateProfileCommand),
    __param(0, (0, common_1.Inject)('IUserProfileRepository')),
    __metadata("design:paramtypes", [Object])
], UpdateProfileHandler);
//# sourceMappingURL=update-profile.handler.js.map
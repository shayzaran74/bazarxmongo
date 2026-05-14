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
exports.AddAddressHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const add_address_command_1 = require("./add-address.command");
const shared_core_1 = require("@barterborsa/shared-core");
const address_response_dto_1 = require("../dtos/address-response.dto");
const user_address_entity_1 = require("../../domain/entities/user-address.entity");
let AddAddressHandler = class AddAddressHandler {
    addressRepository;
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async execute(command) {
        const { userId, dto } = command;
        const address = user_address_entity_1.UserAddress.create({
            userId,
            ...dto
        });
        await this.addressRepository.save(address);
        if (address.isDefault) {
            await this.addressRepository.setDefault(address.id, userId);
        }
        return (0, shared_core_1.Ok)(address_response_dto_1.AddressResponseDto.fromEntity(address));
    }
};
exports.AddAddressHandler = AddAddressHandler;
exports.AddAddressHandler = AddAddressHandler = __decorate([
    (0, cqrs_1.CommandHandler)(add_address_command_1.AddAddressCommand),
    __param(0, (0, common_1.Inject)('IUserAddressRepository')),
    __metadata("design:paramtypes", [Object])
], AddAddressHandler);
//# sourceMappingURL=add-address.handler.js.map
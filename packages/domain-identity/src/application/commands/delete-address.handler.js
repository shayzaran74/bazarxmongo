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
exports.DeleteAddressHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_address_command_1 = require("./delete-address.command");
const shared_core_1 = require("@barterborsa/shared-core");
let DeleteAddressHandler = class DeleteAddressHandler {
    addressRepository;
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async execute(command) {
        const { userId, addressId } = command;
        const address = await this.addressRepository.findById(addressId);
        if (!address || address.userId !== userId) {
            return (0, shared_core_1.Err)(new shared_core_1.NotFoundException('Adres bulunamadı.'));
        }
        await this.addressRepository.delete(addressId);
        return (0, shared_core_1.Ok)(undefined);
    }
};
exports.DeleteAddressHandler = DeleteAddressHandler;
exports.DeleteAddressHandler = DeleteAddressHandler = __decorate([
    (0, cqrs_1.CommandHandler)(delete_address_command_1.DeleteAddressCommand),
    __param(0, (0, common_1.Inject)('IUserAddressRepository')),
    __metadata("design:paramtypes", [Object])
], DeleteAddressHandler);
//# sourceMappingURL=delete-address.handler.js.map
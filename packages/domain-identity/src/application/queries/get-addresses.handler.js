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
exports.GetAddressesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_addresses_query_1 = require("./get-addresses.query");
const shared_core_1 = require("@barterborsa/shared-core");
const address_response_dto_1 = require("../dtos/address-response.dto");
let GetAddressesHandler = class GetAddressesHandler {
    addressRepository;
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async execute(query) {
        const addresses = await this.addressRepository.findByUserId(query.userId);
        return (0, shared_core_1.Ok)(addresses.map(addr => address_response_dto_1.AddressResponseDto.fromEntity(addr)));
    }
};
exports.GetAddressesHandler = GetAddressesHandler;
exports.GetAddressesHandler = GetAddressesHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_addresses_query_1.GetAddressesQuery),
    __param(0, (0, common_1.Inject)('IUserAddressRepository')),
    __metadata("design:paramtypes", [Object])
], GetAddressesHandler);
//# sourceMappingURL=get-addresses.handler.js.map
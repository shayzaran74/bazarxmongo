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
exports.SetTransactionPinHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const set_transaction_pin_command_1 = require("./set-transaction-pin.command");
const shared_security_1 = require("@barterborsa/shared-security");
const shared_core_1 = require("@barterborsa/shared-core");
let SetTransactionPinHandler = class SetTransactionPinHandler {
    userRepository;
    encryptionService;
    constructor(userRepository, encryptionService) {
        this.userRepository = userRepository;
        this.encryptionService = encryptionService;
    }
    async execute(command) {
        const { userId, pin } = command;
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return (0, shared_core_1.Err)(new shared_core_1.NotFoundException('Kullanıcı bulunamadı.'));
        }
        // Encrypt pin
        const encryptedPin = this.encryptionService.encrypt(pin);
        // User props update
        user.props.transactionPin = encryptedPin;
        await this.userRepository.update(user);
        return (0, shared_core_1.Ok)(undefined);
    }
};
exports.SetTransactionPinHandler = SetTransactionPinHandler;
exports.SetTransactionPinHandler = SetTransactionPinHandler = __decorate([
    (0, cqrs_1.CommandHandler)(set_transaction_pin_command_1.SetTransactionPinCommand),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, shared_security_1.EncryptionService])
], SetTransactionPinHandler);
//# sourceMappingURL=set-transaction-pin.handler.js.map
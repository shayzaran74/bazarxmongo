"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAddressCommand = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class UpdateAddressCommand extends shared_core_1.Command {
    userId;
    addressId;
    dto;
    constructor(userId, addressId, dto) {
        super();
        this.userId = userId;
        this.addressId = addressId;
        this.dto = dto;
    }
}
exports.UpdateAddressCommand = UpdateAddressCommand;
//# sourceMappingURL=update-address.command.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteAddressCommand = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class DeleteAddressCommand extends shared_core_1.Command {
    userId;
    addressId;
    constructor(userId, addressId) {
        super();
        this.userId = userId;
        this.addressId = addressId;
    }
}
exports.DeleteAddressCommand = DeleteAddressCommand;
//# sourceMappingURL=delete-address.command.js.map
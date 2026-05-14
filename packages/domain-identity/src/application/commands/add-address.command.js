"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAddressCommand = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class AddAddressCommand extends shared_core_1.Command {
    userId;
    dto;
    constructor(userId, dto) {
        super();
        this.userId = userId;
        this.dto = dto;
    }
}
exports.AddAddressCommand = AddAddressCommand;
//# sourceMappingURL=add-address.command.js.map
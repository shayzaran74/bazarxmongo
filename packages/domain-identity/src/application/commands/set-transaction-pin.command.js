"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetTransactionPinCommand = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class SetTransactionPinCommand extends shared_core_1.Command {
    userId;
    pin;
    constructor(userId, pin) {
        super();
        this.userId = userId;
        this.pin = pin;
    }
}
exports.SetTransactionPinCommand = SetTransactionPinCommand;
//# sourceMappingURL=set-transaction-pin.command.js.map
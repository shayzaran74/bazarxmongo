"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordCommand = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class ChangePasswordCommand extends shared_core_1.Command {
    userId;
    dto;
    constructor(userId, dto) {
        super();
        this.userId = userId;
        this.dto = dto;
    }
}
exports.ChangePasswordCommand = ChangePasswordCommand;
//# sourceMappingURL=change-password.command.js.map
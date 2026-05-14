"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserCommand = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class LoginUserCommand extends shared_core_1.Command {
    dto;
    constructor(dto) {
        super();
        this.dto = dto;
    }
}
exports.LoginUserCommand = LoginUserCommand;
//# sourceMappingURL=login-user.command.js.map
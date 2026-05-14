"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserCommand = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class RegisterUserCommand extends shared_core_1.Command {
    dto;
    constructor(dto) {
        super();
        this.dto = dto;
    }
}
exports.RegisterUserCommand = RegisterUserCommand;
//# sourceMappingURL=register-user.command.js.map
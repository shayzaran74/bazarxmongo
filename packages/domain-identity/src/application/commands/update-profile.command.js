"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileCommand = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class UpdateProfileCommand extends shared_core_1.Command {
    userId;
    dto;
    constructor(userId, dto) {
        super();
        this.userId = userId;
        this.dto = dto;
    }
}
exports.UpdateProfileCommand = UpdateProfileCommand;
//# sourceMappingURL=update-profile.command.js.map
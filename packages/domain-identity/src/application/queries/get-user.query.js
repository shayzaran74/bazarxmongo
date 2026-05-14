"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserQuery = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class GetUserQuery extends shared_core_1.Query {
    userId;
    constructor(userId) {
        super();
        this.userId = userId;
    }
}
exports.GetUserQuery = GetUserQuery;
//# sourceMappingURL=get-user.query.js.map
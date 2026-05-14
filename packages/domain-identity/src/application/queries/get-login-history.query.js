"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLoginHistoryQuery = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class GetLoginHistoryQuery extends shared_core_1.Query {
    userId;
    constructor(userId) {
        super();
        this.userId = userId;
    }
}
exports.GetLoginHistoryQuery = GetLoginHistoryQuery;
//# sourceMappingURL=get-login-history.query.js.map
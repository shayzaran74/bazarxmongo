"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfileQuery = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class GetProfileQuery extends shared_core_1.Query {
    userId;
    constructor(userId) {
        super();
        this.userId = userId;
    }
}
exports.GetProfileQuery = GetProfileQuery;
//# sourceMappingURL=get-profile.query.js.map
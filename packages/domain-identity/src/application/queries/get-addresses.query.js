"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAddressesQuery = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class GetAddressesQuery extends shared_core_1.Query {
    userId;
    constructor(userId) {
        super();
        this.userId = userId;
    }
}
exports.GetAddressesQuery = GetAddressesQuery;
//# sourceMappingURL=get-addresses.query.js.map
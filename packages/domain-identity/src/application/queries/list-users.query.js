"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUsersQuery = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class ListUsersQuery extends shared_core_1.Query {
    pagination;
    filters;
    constructor(pagination, filters) {
        super();
        this.pagination = pagination;
        this.filters = filters;
    }
}
exports.ListUsersQuery = ListUsersQuery;
//# sourceMappingURL=list-users.query.js.map
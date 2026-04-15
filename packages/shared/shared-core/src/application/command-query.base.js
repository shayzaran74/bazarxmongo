"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = exports.Command = void 0;
class Command {
    timestamp;
    constructor() {
        this.timestamp = new Date();
    }
}
exports.Command = Command;
class Query {
    timestamp;
    constructor() {
        this.timestamp = new Date();
    }
}
exports.Query = Query;
//# sourceMappingURL=command-query.base.js.map
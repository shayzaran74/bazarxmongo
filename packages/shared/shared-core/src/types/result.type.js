"use strict";
// packages/shared/shared-core/src/types/result.type.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Err = exports.Ok = void 0;
const Ok = (data) => ({
    success: true,
    data,
});
exports.Ok = Ok;
const Err = (error) => ({
    success: false,
    error,
});
exports.Err = Err;
//# sourceMappingURL=result.type.js.map
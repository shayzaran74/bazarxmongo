"use strict";
// packages/shared/shared-core/src/types/result.type.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.isErr = exports.isOk = exports.Err = exports.Ok = void 0;
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
const isOk = (result) => {
    return result.success;
};
exports.isOk = isOk;
const isErr = (result) => {
    return !result.success;
};
exports.isErr = isErr;
//# sourceMappingURL=result.type.js.map
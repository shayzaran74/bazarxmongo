"use strict";
// packages/shared/shared-core/src/domain/value-object.base.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueObject = void 0;
const lodash_1 = require("lodash");
class ValueObject {
    props;
    constructor(props) {
        this.props = Object.freeze(props);
    }
    equals(vo) {
        if (vo === null || vo === undefined) {
            return false;
        }
        if (vo.props === undefined) {
            return false;
        }
        return (0, lodash_1.isEqual)(this.props, vo.props);
    }
}
exports.ValueObject = ValueObject;
//# sourceMappingURL=value-object.base.js.map
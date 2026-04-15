"use strict";
// packages/shared/shared-core/src/domain/entity.base.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
const uuid_1 = require("uuid");
class Entity {
    _id;
    props;
    _createdAt;
    _updatedAt;
    _version;
    constructor(props, id) {
        this._id = id ?? (0, uuid_1.v4)();
        this.props = props;
        this._createdAt = new Date();
        this._updatedAt = new Date();
        this._version = 1;
    }
    get id() {
        return this._id;
    }
    getProps() {
        return this.props;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    get version() {
        return this._version;
    }
    equals(object) {
        if (object === null || object === undefined) {
            return false;
        }
        if (this === object) {
            return true;
        }
        return this._id === object._id;
    }
}
exports.Entity = Entity;
//# sourceMappingURL=entity.base.js.map
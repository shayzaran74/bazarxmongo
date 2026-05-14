"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAddress = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class UserAddress extends shared_core_1.Entity {
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        return new UserAddress({
            ...props,
            isDefault: props.isDefault ?? false,
        }, id);
    }
    update(props) {
        Object.assign(this.props, props);
        this._updatedAt = new Date();
    }
    setAsDefault() {
        this.props.isDefault = true;
        this._updatedAt = new Date();
    }
    removeDefault() {
        this.props.isDefault = false;
        this._updatedAt = new Date();
    }
    getFullAddress() {
        return `${this.props.addressLine1} ${this.props.addressLine2 || ''} ${this.props.district}/${this.props.city}`.trim();
    }
    get userId() { return this.props.userId; }
    get title() { return this.props.title; }
    get firstName() { return this.props.firstName; }
    get lastName() { return this.props.lastName; }
    get phone() { return this.props.phone; }
    get addressLine1() { return this.props.addressLine1; }
    get addressLine2() { return this.props.addressLine2; }
    get city() { return this.props.city; }
    get district() { return this.props.district; }
    get neighborhood() { return this.props.neighborhood; }
    get postalCode() { return this.props.postalCode; }
    get isDefault() { return this.props.isDefault; }
}
exports.UserAddress = UserAddress;
//# sourceMappingURL=user-address.entity.js.map
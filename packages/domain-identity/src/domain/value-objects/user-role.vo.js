"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoleVO = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
const user_role_enum_1 = require("../enums/user-role.enum");
class UserRoleVO extends shared_core_1.ValueObject {
    constructor(props) {
        super(props);
    }
    get value() {
        return this.props.value;
    }
    static create(role) {
        return new UserRoleVO({ value: role });
    }
    isAdmin() {
        return this.props.value === user_role_enum_1.UserRole.ADMIN || this.props.value === user_role_enum_1.UserRole.SUPER_ADMIN;
    }
    isVendor() {
        return this.props.value === user_role_enum_1.UserRole.VENDOR;
    }
    isUser() {
        return this.props.value === user_role_enum_1.UserRole.USER;
    }
}
exports.UserRoleVO = UserRoleVO;
//# sourceMappingURL=user-role.vo.js.map
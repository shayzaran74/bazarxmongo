"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfile = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class UserProfile extends shared_core_1.Entity {
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        return new UserProfile(props, id);
    }
    update(props) {
        Object.assign(this.props, props);
        // Note: _updatedAt is usually handled by base class or manually
        // If not in base class, we can skip it or add a getter/setter
    }
    getFullName() {
        return `${this.props.firstName || ''} ${this.props.lastName || ''}`.trim();
    }
    get userId() { return this.props.userId; }
    get firstName() { return this.props.firstName; }
    get lastName() { return this.props.lastName; }
    get avatar() { return this.props.avatar; }
    get bio() { return this.props.bio; }
    get birthday() { return this.props.birthday; }
    get gender() { return this.props.gender; }
    get city() { return this.props.city; }
    get district() { return this.props.district; }
}
exports.UserProfile = UserProfile;
//# sourceMappingURL=user-profile.entity.js.map
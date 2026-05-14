"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class Email extends shared_core_1.ValueObject {
    constructor(props) {
        super(props);
    }
    get value() {
        return this.props.value;
    }
    static create(email) {
        if (!email || !email.includes('@')) {
            return (0, shared_core_1.Err)(new shared_core_1.DomainException('Geçersiz e-posta formatı.'));
        }
        return (0, shared_core_1.Ok)(new Email({ value: email.toLowerCase() }));
    }
}
exports.Email = Email;
//# sourceMappingURL=email.vo.js.map
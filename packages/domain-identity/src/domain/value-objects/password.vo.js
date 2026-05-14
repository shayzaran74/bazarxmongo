"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class Password extends shared_core_1.ValueObject {
    constructor(props) {
        super(props);
    }
    get value() {
        return this.props.value;
    }
    get isHashed() {
        return this.props.isHashed;
    }
    static create(raw) {
        if (raw.length < 6)
            return (0, shared_core_1.Err)(new shared_core_1.DomainException('Şifre en az 6 karakter olmalıdır.'));
        return (0, shared_core_1.Ok)(new Password({ value: raw, isHashed: false }));
    }
    static createHashed(hash) {
        return new Password({ value: hash, isHashed: true });
    }
}
exports.Password = Password;
//# sourceMappingURL=password.vo.js.map
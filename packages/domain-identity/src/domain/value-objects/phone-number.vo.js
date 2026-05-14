"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneNumber = void 0;
const shared_core_1 = require("@barterborsa/shared-core");
class PhoneNumber extends shared_core_1.ValueObject {
    constructor(props) {
        super(props);
    }
    get value() {
        return this.props.value;
    }
    static create(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length < 10) {
            return (0, shared_core_1.Err)(new shared_core_1.DomainException('Geçersiz telefon numarası.'));
        }
        return (0, shared_core_1.Ok)(new PhoneNumber({ value: cleaned }));
    }
}
exports.PhoneNumber = PhoneNumber;
//# sourceMappingURL=phone-number.vo.js.map
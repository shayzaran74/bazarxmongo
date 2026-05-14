"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictException = exports.UnauthorizedException = exports.NotFoundException = exports.DomainException = void 0;
class DomainException extends Error {
    constructor(message) {
        super(message);
        this.name = 'DomainException';
    }
}
exports.DomainException = DomainException;
class NotFoundException extends DomainException {
    constructor(message) {
        super(message);
        this.name = 'NotFoundException';
    }
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends DomainException {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedException';
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ConflictException extends DomainException {
    constructor(message) {
        super(message);
        this.name = 'ConflictException';
    }
}
exports.ConflictException = ConflictException;
//# sourceMappingURL=exceptions.js.map
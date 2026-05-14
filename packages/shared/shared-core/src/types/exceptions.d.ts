export declare class DomainException extends Error {
    constructor(message: string);
}
export declare class NotFoundException extends DomainException {
    constructor(message: string);
}
export declare class UnauthorizedException extends DomainException {
    constructor(message: string);
}
export declare class ConflictException extends DomainException {
    constructor(message: string);
}

import { ValueObject, Result, DomainException } from '@barterborsa/shared-core';
export interface PasswordProps {
    value: string;
    isHashed: boolean;
}
export declare class Password extends ValueObject<PasswordProps> {
    private constructor();
    get value(): string;
    get isHashed(): boolean;
    static create(raw: string): Result<Password, DomainException>;
    static createHashed(hash: string): Password;
}

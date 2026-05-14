import { ValueObject, Result, DomainException } from '@barterborsa/shared-core';
export interface PhoneNumberProps {
    value: string;
}
export declare class PhoneNumber extends ValueObject<PhoneNumberProps> {
    private constructor();
    get value(): string;
    static create(phone: string): Result<PhoneNumber, DomainException>;
}

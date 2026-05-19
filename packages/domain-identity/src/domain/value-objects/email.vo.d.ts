import { ValueObject, Result, DomainException } from '@barterborsa/shared-core';
export interface EmailProps {
    value: string;
}
export declare class Email extends ValueObject<EmailProps> {
    private constructor();
    get value(): string;
    static create(email: string): Result<Email, DomainException>;
}

import { DomainEvent } from '@barterborsa/shared-core';
export declare class UserRegisteredEvent extends DomainEvent {
    readonly userId: string;
    readonly email: string;
    readonly role: string;
    readonly platform: string;
    constructor(userId: string, email: string, role: string, platform: string);
    get eventName(): string;
}

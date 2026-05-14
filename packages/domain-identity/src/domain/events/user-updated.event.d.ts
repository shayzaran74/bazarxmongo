import { DomainEvent } from '@barterborsa/shared-core';
export declare class UserUpdatedEvent extends DomainEvent {
    readonly userId: string;
    readonly changedFields: string[];
    constructor(userId: string, changedFields: string[]);
    get eventName(): string;
}

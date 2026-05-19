import { DomainEvent } from '@barterborsa/shared-core';
export declare class UserDeletedEvent extends DomainEvent {
    readonly userId: string;
    readonly reason?: string;
    constructor(userId: string, reason?: string);
    get eventName(): string;
}

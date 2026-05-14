import { DomainEvent } from '@barterborsa/shared-core';
export declare class UserDeletedEvent extends DomainEvent {
    readonly userId: string;
    readonly reason?: string | undefined;
    constructor(userId: string, reason?: string | undefined);
    get eventName(): string;
}

import { IEventBus } from '@barterborsa/shared-core';
export declare class IdentityEventPublisher {
    private readonly eventBus;
    constructor(eventBus: IEventBus);
    publishUserRegistered(data: any): Promise<void>;
    publishUserUpdated(data: any): Promise<void>;
    publishUserDeleted(data: any): Promise<void>;
}

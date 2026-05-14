import { IEventHandler } from '@nestjs/cqrs';
import { UserUpdatedEvent } from '../../domain/events/user-updated.event';
export declare class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent> {
    private readonly eventBus;
    private readonly logger;
    constructor(eventBus: any);
    handle(event: UserUpdatedEvent): Promise<void>;
}

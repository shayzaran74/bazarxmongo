import { IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
export declare class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
    private readonly eventBus;
    private readonly logger;
    constructor(eventBus: any);
    handle(event: UserRegisteredEvent): Promise<void>;
}

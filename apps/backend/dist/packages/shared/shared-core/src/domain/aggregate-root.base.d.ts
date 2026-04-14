import { Entity } from './entity.base';
import { DomainEvent } from './domain-event.base';
export declare abstract class AggregateRoot<T> extends Entity<T> {
    private _domainEvents;
    get domainEvents(): DomainEvent[];
    protected addDomainEvent(domainEvent: DomainEvent): void;
    clearDomainEvents(): void;
}

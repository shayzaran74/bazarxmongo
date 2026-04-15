import { AggregateRoot } from './aggregate-root.base';
export interface IReadRepository<T extends AggregateRoot<any>> {
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
}
export interface IWriteRepository<T extends AggregateRoot<any>> {
    save(entity: T): Promise<void>;
    delete(id: string): Promise<void>;
}
export interface IRepository<T extends AggregateRoot<any>> extends IReadRepository<T>, IWriteRepository<T> {
}
